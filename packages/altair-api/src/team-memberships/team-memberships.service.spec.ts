import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { StripeService } from 'src/stripe/stripe.service';
import { TeamMembershipsService } from './team-memberships.service';

describe('TeamMembershipsService', () => {
  let service: TeamMembershipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamMembershipsService,
        PrismaService,
        UserService,
        StripeService,
      ],
    }).compile();

    service = module.get<TeamMembershipsService>(TeamMembershipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
