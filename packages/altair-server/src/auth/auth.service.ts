import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { JwtPayload, RequestUser } from './types';
import { compare, hash } from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { hashConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOne(email);

    if (!user) {
      return;
    }

    if (await compare(password, user.passwordHash)) {
      return user;
    }
  }

  async login(user: RequestUser) {
    const payload: JwtPayload = { username: user.email, sub: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async registerUser(dto: RegisterUserDto) {
    const saltRounds = hashConstants.saltRounds;
    const passwordHash = await hash(dto.password, saltRounds);
    return this.userService.create({ ...dto, passwordHash, saltRounds });
  }
}
