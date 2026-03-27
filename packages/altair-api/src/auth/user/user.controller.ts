import { IPlan } from '@altairgraphql/api-utils';
import { BASIC_PLAN_ID } from '@altairgraphql/db';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { QueriesService } from 'src/queries/queries.service';
import { QueryCollectionsService } from 'src/query-collections/query-collections.service';
import { TeamsService } from 'src/teams/teams.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from './user.service';
import { getUserId } from 'src/common/request';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private queryService: QueriesService,
    private collectionService: QueryCollectionsService,
    private teamService: TeamsService,
    private configService: ConfigService
  ) {}

  private validateReturnUrl(url?: string): string | undefined {
    if (!url) {
      return undefined;
    }
    try {
      const parsed = new URL(url);
      const allowedOrigins =
        this.configService.get<string[]>('allowedRedirectOrigins') ?? [];
      if (
        allowedOrigins.some((allowed) => new URL(allowed).origin === parsed.origin)
      ) {
        return url;
      }
    } catch {
      // Invalid URL, ignore
    }
    return undefined;
  }

  @Get('billing')
  @UseGuards(JwtAuthGuard)
  async getBillingUrl(@Req() req: Request) {
    const userId = getUserId(req);
    // const returnUrl = this.validateReturnUrl(req.headers.referer);
    return {
      url: await this.userService.getBillingUrl(userId, req.headers.referer),
    };
  }

  @Get('plan')
  @UseGuards(JwtAuthGuard)
  async getCurrentPlan(@Req() req: Request): Promise<IPlan> {
    const userId = getUserId(req);
    const cfg = await this.userService.getPlanConfig(userId);

    return {
      id: cfg?.id ?? '',
      maxQueriesCount: cfg?.maxQueryCount ?? 0,
      maxTeamsCount: cfg?.maxTeamCount ?? 0,
      maxTeamMembersCount: cfg?.maxTeamMemberCount ?? 0,
      canUpgradePro: cfg?.id === BASIC_PLAN_ID,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Req() req: Request) {
    const userId = getUserId(req);

    return {
      queries: {
        own: await this.queryService.count(userId, true),
        access: await this.queryService.count(userId, false),
      },
      collections: {
        own: await this.collectionService.count(userId, true),
        access: await this.collectionService.count(userId, false),
      },
      teams: {
        own: await this.teamService.count(userId, true),
        access: await this.teamService.count(userId, false),
      },
    };
  }

  @Get('upgrade-pro')
  @UseGuards(JwtAuthGuard)
  async getProPlanUrl(@Req() req: Request) {
    const userId = getUserId(req);
    return {
      url: await this.userService.getProPlanUrl(userId),
    };
  }
}
