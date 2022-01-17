import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { auth0Constants } from '../constants';
import { JwtPayload, RequestUser } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${auth0Constants.domain}.well-known/jwks.json`,
      }),

      audience: auth0Constants.audience,
      issuer: `${auth0Constants.domain}`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    // TODO: Extract auth0 id and create user if needed
    // TODO: Save id in auth0 if not there already, and return from auth0 for subsequent calls
    // TODO: instead of fetching the user for every request
    const reqUser: RequestUser = {
      auth0Id: payload.sub,
      email: payload['https://altairgraphql.io/email'],
      emailVerified: payload['https://altairgraphql.io/email_verified'],
      firstName: payload['https://altairgraphql.io/given_name'],
      lastName: payload['https://altairgraphql.io/family_name'],
      name: payload['https://altairgraphql.io/name'],
    };

    // const user = await this.usersService.findByEmail(reqUser.email);

    // if (user) {
    //   reqUser.id = user.id;
    // }

    return reqUser;
  }
}
