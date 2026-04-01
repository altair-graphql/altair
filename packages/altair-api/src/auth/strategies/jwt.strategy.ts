import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '@altairgraphql/db';
import { AuthService } from '../auth.service';
import { JwtDto } from '../models/jwt.dto';
import { Config } from 'src/common/config';
import { getAgent } from 'src/newrelic/newrelic';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly agent = getAgent();

  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService<Config>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  async validate(payload: JwtDto): Promise<User> {
    const user = await this.authService.validateUser(payload.userId);
    if (!user) {
      this.agent?.incrementMetric('auth.token.validation_failure');
      throw new UnauthorizedException();
    }
    return user;
  }
}
