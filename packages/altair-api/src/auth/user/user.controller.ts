import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('billing')
  @UseGuards(JwtAuthGuard)
  async getBillingUrl(@Req() req: Request) {
    return {
      url: await this.userService.getBillingUrl(
        req.user.id,
        req.headers.referer
      ),
    };
  }
}
