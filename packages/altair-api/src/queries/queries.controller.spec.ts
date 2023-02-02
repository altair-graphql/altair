import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { QueriesController } from './queries.controller';
import { QueriesService } from './queries.service';

describe('QueriesController', () => {
  let controller: QueriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueriesController],
      providers: [QueriesService, PrismaService, EventEmitter2],
    }).compile();

    controller = module.get<QueriesController>(QueriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
