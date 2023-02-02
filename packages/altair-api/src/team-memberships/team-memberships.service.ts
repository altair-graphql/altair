import {
  CreateTeamMembershipDto,
  UpdateTeamMembershipDto,
} from '@altairgraphql/api-utils';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class TeamMembershipsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createTeamMembershipDto: CreateTeamMembershipDto
  ) {
    const basicPlan = await this.prisma.planConfig.findUnique({
      where: {
        id: 'basic',
      },
    });

    const teamMembershipCount = await this.prisma.teamMembership.count({
      where: {
        team: {
          id: createTeamMembershipDto.teamId,
          ownerId: userId,
        },
      },
    });

    if (teamMembershipCount >= basicPlan.maxTeamMemberCount) {
      throw new ForbiddenException();
    }

    // Verify team owner is adding member
    const validTeam = await this.prisma.team.findFirst({
      where: {
        id: createTeamMembershipDto.teamId,
        ownerId: userId,
      },
    });

    if (!validTeam) {
      throw new ForbiddenException();
    }

    const validMember = await this.prisma.user.findFirst({
      where: {
        email: createTeamMembershipDto.email,
      },
    });

    if (!validMember) {
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
    const validOwner = await this.prisma.teamMembership.findFirst({
      where: {
        team: {
          ownerId: userId,
        },
      },
    });

    if (!validMember && !validOwner) {
      throw new ForbiddenException();
    }

    return this.prisma.teamMembership.findMany({
      where: {
        teamId,
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
      throw new ForbiddenException();
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
