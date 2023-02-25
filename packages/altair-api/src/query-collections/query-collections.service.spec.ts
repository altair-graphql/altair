import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { TeamsService } from 'src/teams/teams.service';
import { testProviders } from 'test/providers';
import { QueryCollectionsService } from './query-collections.service';

describe('QueryCollectionsService', () => {
  let service: QueryCollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryCollectionsService, ...testProviders],
    }).compile();

    service = module.get<QueryCollectionsService>(QueryCollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
