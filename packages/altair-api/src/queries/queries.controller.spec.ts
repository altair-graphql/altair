import { Test, TestingModule } from '@nestjs/testing';
import { QueriesController } from './queries.controller';
import { QueriesService } from './queries.service';

describe('QueriesController', () => {
  let controller: QueriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueriesController],
      providers: [QueriesService],
    }).compile();

    controller = module.get<QueriesController>(QueriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
