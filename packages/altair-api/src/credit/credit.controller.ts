import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreditService } from './credit.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { BuyDto } from './dto/buy.dto';
import { getUserId } from 'src/common/request';

@Controller('credits')
@ApiTags('Credits')
@UseGuards(JwtAuthGuard)
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get()
  async getAvailableCredits(@Req() req: Request) {
    const userId = getUserId(req);
    return this.creditService.getAvailableCredits(userId);
  }

  @Post('buy')
  async buyCredits(@Req() req: Request, @Body() buyDto: BuyDto) {
    const userId = getUserId(req);
    return this.creditService.buyCredits(userId, buyDto.quantity);
  }
}
