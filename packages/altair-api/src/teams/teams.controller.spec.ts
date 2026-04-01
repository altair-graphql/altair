import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { StripeService } from 'src/stripe/stripe.service';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TeamMembershipsService } from 'src/team-memberships/team-memberships.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

describe('TeamsController', () => {
  let controller: TeamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        TeamsService,
        PrismaService,
        UserService,
        StripeService,
        TeamMembershipsService,
        EventEmitter2,
        ConfigService,
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
