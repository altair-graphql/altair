import { CreateTeamDto, UpdateTeamDto } from '@altairgraphql/firebase-utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, createTeamDto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        ...createTeamDto,
        ownerId: userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.team.findMany({
      where: {
        OR: {
          ownerId: userId,
          TeamMemberships: {
            some: {
              userId,
            },
          },
        },
      },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.team.findFirst({
      where: {
        id,
        OR: {
          // owner
          ownerId: userId,
          // member
          TeamMemberships: {
            some: {
              userId,
            },
          },
        },
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
