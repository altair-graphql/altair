import { Test, TestingModule } from '@nestjs/testing';
import { StripeWebhookController } from './stripe-webhook.controller';

describe('StripeWebhookController', () => {
  let controller: StripeWebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeWebhookController],
    }).compile();

    controller = module.get<StripeWebhookController>(StripeWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
