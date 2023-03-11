import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class EventsJwtAuthGuard extends AuthGuard('events-jwt') {}
