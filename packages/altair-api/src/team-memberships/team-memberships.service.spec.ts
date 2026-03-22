import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { StripeService } from 'src/stripe/stripe.service';
import { TeamMembershipsService } from './team-memberships.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

describe('TeamMembershipsService', () => {
  let service: TeamMembershipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamMembershipsService,
        PrismaService,
        UserService,
        StripeService,
        EventEmitter2,
        ConfigService,
      ],
    }).compile();

    service = module.get<TeamMembershipsService>(TeamMembershipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
