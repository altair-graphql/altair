import { CreateTeamDto, UpdateTeamDto } from '@altairgraphql/api-utils';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { InvalidRequestException } from 'src/exceptions/invalid-request.exception';

@Injectable()
export class TeamsService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}

  async create(userId: string, createTeamDto: CreateTeamDto) {
    const userPlanConfig = await this.userService.getPlanConfig(userId);
    const teamCount = await this.prisma.team.count({
      where: {
        ownerId: userId,
      },
    });

    if (teamCount >= userPlanConfig.maxTeamCount) {
      throw new InvalidRequestException(
        'ERR_MAX_TEAM_COUNT',
        'You have reached the limit of the number of teams for your plan.'
      );
    }

    return this.prisma.team.create({
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
  }

  findAll(userId: string) {
    return this.prisma.team.findMany({
      where: {
        OR: [
          {
            ownerId: userId,
          },
          {
            TeamMemberships: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.team.findFirst({
      where: {
        id,
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
      },
    });
  }

  update(userId: string, id: string, updateTeamDto: UpdateTeamDto) {
    return this.prisma.team.updateMany({
      where: {
        id,
        ownerId: userId,
      },
      data: {
        ...updateTeamDto,
      },
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.team.deleteMany({
      where: {
        id,
        ownerId: userId,
      },
    });
  }
}
