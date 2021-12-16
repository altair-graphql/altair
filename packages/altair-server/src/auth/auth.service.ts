import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/types';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username);

    if (user?.password === password) {
      const { password, ...result } = user;

      return result;
    }

    return undefined;
  }

  async login(user: User) {
    const payload: JwtPayload = { username: user.username, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
