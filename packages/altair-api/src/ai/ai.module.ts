import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { CreditModule } from 'src/credit/credit.module';

@Module({
  imports: [CreditModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
