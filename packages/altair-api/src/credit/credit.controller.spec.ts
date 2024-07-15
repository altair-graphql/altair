import { Test, TestingModule } from '@nestjs/testing';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';

describe('CreditController', () => {
  let controller: CreditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditController],
      providers: [CreditService],
    }).compile();

    controller = module.get<CreditController>(CreditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
