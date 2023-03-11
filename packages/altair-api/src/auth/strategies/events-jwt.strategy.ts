import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '@altairgraphql/db';
import { AuthService } from '../auth.service';
import { JwtDto } from '../models/jwt.dto';

@Injectable()
export class EventsJwtStrategy extends PassportStrategy(
  Strategy,
  'events-jwt'
) {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('slt'),
      secretOrKey: configService.get('EVENTS_JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtDto): Promise<User> {
    const user = await this.authService.validateUser(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
