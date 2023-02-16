import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { TeamsService } from 'src/teams/teams.service';
import { QueryCollectionsController } from './query-collections.controller';
import { QueryCollectionsService } from './query-collections.service';

describe('QueryCollectionsController', () => {
  let controller: QueryCollectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryCollectionsController],
      providers: [
        QueryCollectionsService,
        PrismaService,
        EventEmitter2,
        TeamsService,
      ],
    }).compile();

    controller = module.get<QueryCollectionsController>(
      QueryCollectionsController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
