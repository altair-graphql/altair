import { Prisma } from '@altairgraphql/db';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { InvalidRequestException } from 'src/exceptions/invalid-request.exception';
import { TeamMembershipsService } from 'src/team-memberships/team-memberships.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { getAgent } from 'src/newrelic/newrelic';

@Injectable()
export class TeamsService {
  private readonly agent = getAgent();
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly teamMembershipsService: TeamMembershipsService
  ) {}

  async create(userId: string, createTeamDto: CreateTeamDto) {
    const userPlanConfig = await this.userService.getPlanConfig(userId);
    const userPlanMaxTeamCount = userPlanConfig?.maxTeamCount ?? 0;
    const teamCount = await this.prisma.team.count({
      where: {
        ownerId: userId,
      },
    });

    if (teamCount >= userPlanMaxTeamCount) {
      throw new InvalidRequestException(
        'ERR_MAX_TEAM_COUNT',
        'You have reached the limit of the number of teams for your plan.'
      );
    }

    const res = await this.prisma.team.create({
      data: {
        ...createTeamDto,
        ownerId: userId,
        Workspace: {
          create: {
            name: `${createTeamDto.name} Workspace`,
            ownerId: userId,
          },
        },
      },
    });

    this.agent?.incrementMetric('team.created');

    return res;
  }

  async findAll(userId: string) {
    const res = await this.prisma.team.findMany({
      where: {
        ...this.ownerOrMemberWhere(userId),
      },
      include: {
        Workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.agent?.recordMetric('team.list.count', res.length);

    return res;
  }

  findOne(userId: string, id: string) {
    return this.prisma.team.findFirst({
      where: {
        id,
        ...this.ownerOrMemberWhere(userId),
      },
      include: {
        Workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(userId: string, id: string, updateTeamDto: UpdateTeamDto) {
    // OWNER or ADMIN can update team info
    await this.teamMembershipsService.assertTeamRole(
      userId,
      id,
      ['OWNER', 'ADMIN'],
      'You do not have permission to update this team.'
    );

    return this.prisma.team.updateMany({
      where: {
        id,
      },
      data: {
        ...updateTeamDto,
      },
    });
  }

  async remove(userId: string, id: string) {
    // Only OWNER can delete a team
    await this.teamMembershipsService.assertTeamRole(
      userId,
      id,
      ['OWNER'],
      'Only the team owner can delete the team.'
    );

    return this.prisma.team.deleteMany({
      where: {
        id,
      },
    });
  }

  count(userId: string, ownOnly = true) {
    return this.prisma.team.count({
      where: {
        ...(ownOnly ? this.ownerWhere(userId) : this.ownerOrMemberWhere(userId)),
      },
    });
  }

  // where user is the owner of the team
  ownerWhere(userId: string): Prisma.TeamWhereInput {
    return {
      ownerId: userId,
    };
  }

  // where user has access to the team as the owner or team member
  ownerOrMemberWhere(userId: string): Prisma.TeamWhereInput {
    return {
      OR: [
        {
          // owner
          ownerId: userId,
        },
        {
          TeamMemberships: {
            some: {
              // member
              userId,
            },
          },
        },
      ],
    };
  }
}
