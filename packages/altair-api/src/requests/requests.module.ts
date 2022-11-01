import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { PrismaModule } from 'nestjs-prisma';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService],
  imports: [PrismaModule],
})
export class RequestsModule {}
