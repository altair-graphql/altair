import { Test, TestingModule } from '@nestjs/testing';
import { QueryCollectionsService } from './query-collections.service';

describe('QueryCollectionsService', () => {
  let service: QueryCollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryCollectionsService],
    }).compile();

    service = module.get<QueryCollectionsService>(QueryCollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
