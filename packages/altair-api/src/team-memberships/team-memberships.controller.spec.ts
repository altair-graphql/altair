import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { TeamMembershipsController } from './team-memberships.controller';
import { TeamMembershipsService } from './team-memberships.service';

describe('TeamMembershipsController', () => {
  let controller: TeamMembershipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamMembershipsController],
      providers: [TeamMembershipsService, PrismaService],
    }).compile();

    controller = module.get<TeamMembershipsController>(
      TeamMembershipsController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
