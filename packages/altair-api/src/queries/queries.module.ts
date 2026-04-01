import { Module } from '@nestjs/common';
import { QueriesService } from './queries.service';
import { QueriesController } from './queries.controller';
import { SharedController } from './shared.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [QueriesController, SharedController],
  providers: [QueriesService],
})
export class QueriesModule {}
