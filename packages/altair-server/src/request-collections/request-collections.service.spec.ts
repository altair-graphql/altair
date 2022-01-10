import { Test, TestingModule } from '@nestjs/testing';
import { RequestCollectionsService } from './request-collections.service';

describe('RequestCollectionsService', () => {
  let service: RequestCollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestCollectionsService],
    }).compile();

    service = module.get<RequestCollectionsService>(RequestCollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
