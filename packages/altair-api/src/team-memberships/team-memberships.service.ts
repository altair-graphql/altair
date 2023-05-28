import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { InvalidRequestException } from 'src/exceptions/invalid-request.exception';
import { CreateTeamMembershipDto } from './dto/create-team-membership.dto';
import { UpdateTeamMembershipDto } from './dto/update-team-membership.dto';

@Injectable()
export class TeamMembershipsService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}

  async create(
    userId: string,
    createTeamMembershipDto: CreateTeamMembershipDto
  ) {
    const userPlanConfig = await this.userService.getPlanConfig(userId);
    const userPlanMaxTeamMemberCount = userPlanConfig?.maxTeamMemberCount ?? 0;

    const teamMembershipCount = await this.prisma.teamMembership.count({
      where: {
        team: {
          id: createTeamMembershipDto.teamId,
          ownerId: userId,
        },
      },
    });

    if (
      !userPlanConfig?.allowMoreTeamMembers &&
      teamMembershipCount >= userPlanMaxTeamMemberCount
    ) {
      throw new InvalidRequestException('ERR_MAX_TEAM_MEMBER_COUNT');
    }

    // Update stripe subscription item quantity
    if (userPlanConfig?.allowMoreTeamMembers) {
      await this.userService.updateAllowedTeamMemberCount(
        userId,
        teamMembershipCount + 1 // increment team membership count
      );
    }

    // Verify team owner is adding member
    const validTeam = await this.prisma.team.findFirst({
      where: {
        id: createTeamMembershipDto.teamId,
        ownerId: userId,
      },
    });

    if (!validTeam) {
      throw new InvalidRequestException(
        'ERR_PERM_DENIED',
        'You are not permitted to add a team member to this team.'
      );
    }

    const validMember = await this.prisma.user.findFirst({
      where: {
        email: createTeamMembershipDto.email,
      },
    });

    if (!validMember) {
      console.error('The user does not exist.');
      throw new BadRequestException();
    }

    return this.prisma.teamMembership.create({
      data: {
        teamId: createTeamMembershipDto.teamId,
        userId: validMember.id,
      },
    });
  }

  async findAll(userId: string, teamId: string) {
    // Validate user can access team
    const validMember = await this.prisma.teamMembership.findFirst({
      where: {
        userId,
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

    return this.prisma.teamMembership.findMany({
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
  }

  findOne(userId: string, id: string) {
    throw new BadRequestException('not yet implemented');
  }

  update(
    userId: string,
    id: string,
    updateTeamMembershipDto: UpdateTeamMembershipDto
  ) {
    throw new BadRequestException('not yet implemented');
  }

  async remove(ownerId: string, teamId: string, memberId: string) {
    const validOwner = await this.prisma.teamMembership.findFirst({
      where: {
        team: {
          ownerId,
        },
      },
    });

    if (!validOwner) {
      throw new InvalidRequestException(
        'ERR_PERM_DENIED',
        'You are not permitted to remove this team membership.'
      );
    }

    return this.prisma.teamMembership.delete({
      where: {
        userId_teamId: {
          teamId,
          userId: memberId,
        },
      },
    });
  }
}
