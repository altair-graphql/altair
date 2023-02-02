import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { TeamMembershipsService } from './team-memberships.service';

describe('TeamMembershipsService', () => {
  let service: TeamMembershipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamMembershipsService, PrismaService],
    }).compile();

    service = module.get<TeamMembershipsService>(TeamMembershipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
