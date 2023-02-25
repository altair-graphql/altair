import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { StripeService } from 'src/stripe/stripe.service';
import { testProviders } from 'test/providers';
import { QueriesController } from './queries.controller';
import { QueriesService } from './queries.service';

describe('QueriesController', () => {
  let controller: QueriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueriesController],
      providers: testProviders,
    }).compile();

    controller = module.get<QueriesController>(QueriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
