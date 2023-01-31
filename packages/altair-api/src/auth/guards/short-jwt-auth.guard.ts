import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ShortJwtAuthGuard extends AuthGuard('short-jwt') {}
