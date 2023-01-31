import { Controller, Get, Req, Sse, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { interval, map, Subject } from 'rxjs';
import { AppService } from './app.service';
import { GoogleOAuthGuard } from './auth/guards/google-oauth.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ShortJwtAuthGuard } from './auth/guards/short-jwt-auth.guard';
import { EVENTS } from './common/events';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventService: EventEmitter2
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(ShortJwtAuthGuard)
  @Sse('events')
  handleUserEvents(@Req() req: Request) {
    const subject$ = new Subject();

    // TODO: Create events
    // TODO: Emit events from prisma middleware
    // TODO: Check if event is relevant for user
    this.eventService.on([EVENTS.COLLECTION_UPDATE], (data) => {
      subject$.next({ uid: req.user.id, data });
    });

    return subject$.pipe(map((data) => ({ data })));
  }
}
