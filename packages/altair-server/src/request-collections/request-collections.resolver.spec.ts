import { Test, TestingModule } from '@nestjs/testing';
import { RequestCollectionsResolver } from './request-collections.resolver';
import { RequestCollectionsService } from './request-collections.service';

describe('RequestCollectionsResolver', () => {
  let resolver: RequestCollectionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestCollectionsResolver, RequestCollectionsService],
    }).compile();

    resolver = module.get<RequestCollectionsResolver>(
      RequestCollectionsResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
