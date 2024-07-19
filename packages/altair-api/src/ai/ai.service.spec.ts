import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { testProviders } from 'test/providers';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: testProviders,
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
