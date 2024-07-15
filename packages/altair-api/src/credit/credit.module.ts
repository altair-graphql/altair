import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';

@Module({
  controllers: [CreditController],
  providers: [CreditService],
})
export class CreditModule {}
