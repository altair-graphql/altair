import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { AuthModule } from 'src/auth/auth.module';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  imports: [AuthModule],
  controllers: [CreditController],
  providers: [CreditService, StripeService],
})
export class CreditModule {}
