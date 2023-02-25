import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { testProviders } from 'test/providers';
import { QueriesService } from './queries.service';

describe('QueriesService', () => {
  let service: QueriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueriesService, ...testProviders],
    }).compile();

    service = module.get<QueriesService>(QueriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
