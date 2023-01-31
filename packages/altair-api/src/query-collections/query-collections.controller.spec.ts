import { Test, TestingModule } from '@nestjs/testing';
import { QueryCollectionsController } from './query-collections.controller';
import { QueryCollectionsService } from './query-collections.service';

describe('QueryCollectionsController', () => {
  let controller: QueryCollectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryCollectionsController],
      providers: [QueryCollectionsService],
    }).compile();

    controller = module.get<QueryCollectionsController>(QueryCollectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
