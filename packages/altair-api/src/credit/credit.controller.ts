import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreditService } from './credit.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { BuyDto } from './dto/buy.dto';
import { getUserId } from 'src/common/request';
import { CreditTransactionType } from '@altairgraphql/db';

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

  @Get('transactions')
  async getTransactions(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('type') type?: string
  ) {
    const userId = getUserId(req);
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const validType =
      type && Object.values(CreditTransactionType).includes(type as CreditTransactionType)
        ? (type as CreditTransactionType)
        : undefined;

    return this.creditService.getTransactions(userId, {
      limit: parsedLimit && !isNaN(parsedLimit) ? parsedLimit : undefined,
      cursor: cursor || undefined,
      type: validType,
    });
  }

  @Post('buy')
  async buyCredits(@Req() req: Request, @Body() buyDto: BuyDto) {
    const userId = getUserId(req);
    return this.creditService.buyCredits(userId, buyDto.quantity);
  }
}
