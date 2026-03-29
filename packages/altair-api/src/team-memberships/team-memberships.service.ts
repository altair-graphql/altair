import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { InvalidRequestException } from 'src/exceptions/invalid-request.exception';
import { EVENTS } from 'src/common/events';
import { CreateTeamMembershipDto } from './dto/create-team-membership.dto';
import { UpdateTeamMembershipDto } from './dto/update-team-membership.dto';
import { TeamInvitationStatus, TeamMemberRole } from '@altairgraphql/db';
import { getAgent } from 'src/newrelic/newrelic';

const INVITATION_EXPIRY_DAYS = 7;

/**
 * Effective team role. OWNER is not stored in TeamMembership but is derived
 * from `team.ownerId`. Hierarchy: OWNER > ADMIN > MEMBER.
 */
export type EffectiveTeamRole = 'OWNER' | TeamMemberRole;

@Injectable()
export class TeamMembershipsService {
  private readonly agent = getAgent();
  private readonly logger = new Logger(TeamMembershipsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // ── Role helpers ────────────────────────────────────────────────────

  /**
   * Returns the effective role a user has on a team:
   * - `'OWNER'` if the user is `team.ownerId`
   * - `TeamMemberRole.ADMIN` or `TeamMemberRole.MEMBER` from `TeamMembership`
   * - `null` if the user has no relation to the team
   */
  async getMemberRole(
    userId: string,
    teamId: string
  ): Promise<EffectiveTeamRole | null> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerId: true },
    });

    if (!team) return null;
    if (team.ownerId === userId) return 'OWNER';

    const membership = await this.prisma.teamMembership.findUnique({
      where: { userId_teamId: { userId, teamId } },
      select: { role: true },
    });

    return membership?.role ?? null;
  }

  /**
   * Assert the user holds one of the required roles on the team.
   * Throws `ForbiddenException` if not.
   */
  async assertTeamRole(
    userId: string,
    teamId: string,
    requiredRoles: EffectiveTeamRole[],
    message = 'You do not have permission to perform this action on this team.'
  ): Promise<EffectiveTeamRole> {
    const role = await this.getMemberRole(userId, teamId);
    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException(message);
    }
    return role;
  }

  async create(userId: string, createTeamMembershipDto: CreateTeamMembershipDto) {
    const teamId = createTeamMembershipDto.teamId;

    // Verify user is OWNER or ADMIN of the team
    await this.assertTeamRole(
      userId,
      teamId,
      ['OWNER', 'ADMIN'],
      'You are not permitted to add a team member to this team.'
    );

    // Plan limits are checked against the team owner
    const team = await this.prisma.team.findUniqueOrThrow({
      where: { id: teamId },
      select: { ownerId: true },
    });
    const userPlanConfig = await this.userService.getPlanConfig(team.ownerId);
    const userPlanMaxTeamMemberCount = userPlanConfig?.maxTeamMemberCount ?? 0;

    const teamMembershipCount = await this.prisma.teamMembership.count({
      where: { teamId },
    });

    if (teamMembershipCount >= userPlanMaxTeamMemberCount) {
      throw new InvalidRequestException('ERR_MAX_TEAM_MEMBER_COUNT');
    }

    const validMember = await this.prisma.user.findFirst({
      where: {
        email: createTeamMembershipDto.email,
      },
    });

    if (!validMember) {
      this.logger.error('The user does not exist.');
      throw new BadRequestException();
    }

    const res = await this.prisma.teamMembership.create({
      data: {
        teamId,
        userId: validMember.id,
      },
    });

    await this.updateSubscriptionQuantity(team.ownerId);

    this.agent?.incrementMetric('team.membership.added');
    this.eventEmitter.emit(EVENTS.TEAM_MEMBERSHIP_UPDATE, {
      teamId,
      userId: validMember.id,
      action: 'added',
    });

    return res;
  }

  async findAllByTeamOwner(userId: string) {
    const res = await this.prisma.teamMembership.findMany({
      where: {
        team: {
          ownerId: userId,
        },
      },
    });

    this.agent?.recordMetric('team.membership.count_by_owner', res.length);

    return res;
  }

  async findAll(userId: string, teamId: string) {
    // Validate user can access team
    const validMember = await this.prisma.teamMembership.findFirst({
      where: {
        userId,
        teamId,
      },
    });
    const validOwner = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        ownerId: userId,
      },
    });

    if (!validMember && !validOwner) {
      throw new InvalidRequestException(
        'ERR_PERM_DENIED',
        'You do not have permission to access the team members.'
      );
    }

    const res = await this.prisma.teamMembership.findMany({
      where: {
        teamId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    this.agent?.recordMetric('team.membership.count', res.length);

    return res;
  }

  /**
   * Get a single team membership. The caller must be OWNER, ADMIN, or MEMBER of the team.
   */
  async findOne(userId: string, teamId: string, memberId: string) {
    // Find the membership to get teamId
    const membership = await this.prisma.teamMembership.findFirst({
      where: { userId: memberId, teamId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Team membership not found');
    }

    // Validate caller has access to this team
    const role = await this.getMemberRole(userId, membership.teamId);
    if (!role) {
      throw new ForbiddenException('You do not have access to this team.');
    }

    return membership;
  }

  /**
   * Update a team membership (e.g. change role). OWNER or ADMIN can update
   * members. Only OWNER can promote a member to ADMIN.
   */
  async update(
    userId: string,
    teamId: string,
    memberId: string,
    updateTeamMembershipDto: UpdateTeamMembershipDto
  ) {
    // find their membership to get teamId
    const targetMembership = await this.prisma.teamMembership.findFirst({
      where: { userId: memberId, teamId },
    });

    if (!targetMembership) {
      throw new NotFoundException('Team membership not found');
    }

    const callerRole = await this.assertTeamRole(
      userId,
      targetMembership.teamId,
      ['OWNER', 'ADMIN'],
      'You do not have permission to update team memberships.'
    );

    // Only OWNER can promote to ADMIN
    if (updateTeamMembershipDto.role === 'ADMIN' && callerRole !== 'OWNER') {
      throw new ForbiddenException(
        'Only the team owner can promote members to ADMIN.'
      );
    }

    // Prevent ADMIN from changing another ADMIN's role
    if (callerRole === 'ADMIN' && targetMembership.role === 'ADMIN') {
      throw new ForbiddenException('Admins cannot modify other admins.');
    }

    const data: Record<string, unknown> = {};
    if (updateTeamMembershipDto.role) {
      data.role = updateTeamMembershipDto.role;
    }

    return this.prisma.teamMembership.update({
      where: {
        userId_teamId: {
          userId: memberId,
          teamId: targetMembership.teamId,
        },
      },
      data,
    });
  }

  async remove(userId: string, teamId: string, memberId: string) {
    // OWNER or ADMIN can remove members; additionally a MEMBER can remove themselves
    const role = await this.getMemberRole(userId, teamId);
    const isSelfRemoval = userId === memberId;

    if (!role) {
      throw new ForbiddenException(
        'You are not permitted to remove this team membership.'
      );
    }

    // Only OWNER and ADMIN can remove other members
    if (!isSelfRemoval && role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not permitted to remove this team membership.'
      );
    }

    // Prevent removing the owner from the team (they aren't a member, but guard anyway)
    const team = await this.prisma.team.findUniqueOrThrow({
      where: { id: teamId },
      select: { ownerId: true },
    });

    const res = await this.prisma.teamMembership.delete({
      where: {
        userId_teamId: {
          teamId,
          userId: memberId,
        },
      },
    });

    await this.updateSubscriptionQuantity(team.ownerId);

    this.eventEmitter.emit(EVENTS.TEAM_MEMBERSHIP_UPDATE, {
      teamId,
      userId: memberId,
      action: 'removed',
    });

    this.agent?.incrementMetric('team.member.removed');

    return res;
  }

  // Update stripe subscription item quantity
  async updateSubscriptionQuantity(userId: string) {
    const userPlanConfig = await this.userService.getPlanConfig(userId);

    // Update stripe subscription item quantity
    if (userPlanConfig?.allowMoreTeamMembers) {
      // update stripe subscription item quantity. Consider all team memberships from all user's teams.
      const memberships = await this.findAllByTeamOwner(userId);
      // only consider unique members
      const uniqueMembers = new Set(memberships.map((m) => m.userId));
      await this.userService.updateSubscriptionQuantity(userId, uniqueMembers.size);
    }
  }

  // ── Team Invitations ──────────────────────────────────────────────────

  // TODO: Invitation flow is not currently in use in the app.
  /**
   * Create a team invitation and return it. The caller (controller) is
   * responsible for sending the invitation email.
   */
  async createInvitation(
    inviterId: string,
    teamId: string,
    email: string,
    role?: TeamMemberRole
  ) {
    // Verify inviter is OWNER or ADMIN of the team
    await this.assertTeamRole(
      inviterId,
      teamId,
      ['OWNER', 'ADMIN'],
      'You are not permitted to invite members to this team.'
    );

    // Plan limits are checked against the team owner
    const team = await this.prisma.team.findUniqueOrThrow({
      where: { id: teamId },
      select: { ownerId: true },
    });
    const userPlanConfig = await this.userService.getPlanConfig(team.ownerId);
    const maxMembers = userPlanConfig?.maxTeamMemberCount ?? 0;
    const currentCount = await this.prisma.teamMembership.count({
      where: { teamId },
    });
    if (currentCount >= maxMembers) {
      throw new InvalidRequestException('ERR_MAX_TEAM_MEMBER_COUNT');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingMember) {
      const alreadyMember = await this.prisma.teamMembership.findFirst({
        where: { teamId, userId: existingMember.id },
      });
      if (alreadyMember) {
        throw new BadRequestException('User is already a team member');
      }
    }

    // Upsert invitation (replace expired/pending if exists)
    const expiresAt = new Date(
      Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    const invitation = await this.prisma.teamInvitation.upsert({
      where: { teamId_email: { teamId, email } },
      update: {
        status: TeamInvitationStatus.PENDING,
        expiresAt,
        invitedBy: inviterId,
        ...(role ? { role: role as any } : {}),
      },
      create: {
        teamId,
        email,
        invitedBy: inviterId,
        expiresAt,
        ...(role ? { role: role as any } : {}),
      },
    });

    this.agent?.incrementMetric('team.invitation.create');
    return invitation;
  }

  /**
   * List pending invitations for a team. Only owner or team members can view.
   */
  async listInvitations(userId: string, teamId: string) {
    // Validate user can access team
    const validMember = await this.prisma.teamMembership.findFirst({
      where: { userId, teamId },
    });
    const validOwner = await this.prisma.team.findFirst({
      where: { id: teamId, ownerId: userId },
    });
    if (!validMember && !validOwner) {
      throw new InvalidRequestException(
        'ERR_PERM_DENIED',
        'You do not have permission to view team invitations.'
      );
    }

    return this.prisma.teamInvitation.findMany({
      where: {
        teamId,
        status: TeamInvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Accept a team invitation using the token. The accepting user must be
   * authenticated. If the invitation was sent to a different email, the
   * invitation is still accepted (email is used for routing, not enforcement).
   */
  async acceptInvitation(userId: string, token: string) {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { token },
      include: { team: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== TeamInvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is no longer valid');
    }
    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      await this.prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: TeamInvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Invitation has expired');
    }

    // Check if already a member
    const existingMembership = await this.prisma.teamMembership.findFirst({
      where: { teamId: invitation.teamId, userId },
    });
    if (existingMembership) {
      throw new BadRequestException('You are already a member of this team');
    }

    // Create membership and mark invitation as accepted atomically
    const result = await this.prisma.$transaction(async (tx) => {
      const membership = await tx.teamMembership.create({
        data: {
          teamId: invitation.teamId,
          userId,
          role: invitation.role,
        },
      });

      await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: TeamInvitationStatus.ACCEPTED },
      });

      return membership;
    });

    // Update subscription quantity for team owner
    await this.updateSubscriptionQuantity(invitation.team.ownerId);

    this.agent?.incrementMetric('team.invitation.accept');
    this.eventEmitter.emit(EVENTS.TEAM_MEMBERSHIP_UPDATE, {
      teamId: invitation.teamId,
      userId,
      action: 'added',
    });

    return result;
  }

  /**
   * Revoke/cancel a pending invitation. OWNER or ADMIN can do this.
   */
  async revokeInvitation(userId: string, invitationId: string) {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.assertTeamRole(
      userId,
      invitation.teamId,
      ['OWNER', 'ADMIN'],
      'Only team owners and admins can revoke invitations.'
    );

    const result = await this.prisma.teamInvitation.delete({
      where: { id: invitationId },
    });

    this.agent?.incrementMetric('team.invitation.revoke');
    return result;
  }
}
