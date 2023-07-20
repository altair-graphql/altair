import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { StripeService } from 'src/stripe/stripe.service';
import { UserService } from './user.service';
import { SignupInput } from '../models/signup.input';
import {
  mockPlanConfig,
  mockPrismaConflictError,
  mockUser,
  mockUserPlan,
} from '../mocks/prisma-service.mock';
import {
  mockPlanInfo,
  mockStripeCustomer,
  mockSubscriptionItem,
} from '../mocks/stripe-service.mock';
import Stripe from 'stripe';
import { PRO_PLAN_ID } from '@altairgraphql/db';

describe('UserService', () => {
  let service: UserService;
  let stripeService: StripeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService, StripeService],
    }).compile();

    service = module.get<UserService>(UserService);
    stripeService = module.get<StripeService>(StripeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    let payloadMock: SignupInput;

    beforeAll(() => {
      payloadMock = { email: 'john.doe@email.com' };
    });

    beforeEach(() => {
      jest
        .spyOn(stripeService, 'connectOrCreateCustomer')
        .mockResolvedValueOnce(mockStripeCustomer());
    });

    it('should return the created user object', async () => {
      // GIVEN
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValueOnce(mockUser());

      // WHEN
      const user = await service.createUser(payloadMock);

      // THEN
      expect(user).toBeUser();
    });

    it('should throw and exception if the email is already taken', () => {
      // GIVEN
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValueOnce(mockPrismaConflictError());

      // THEN
      expect(service.createUser(payloadMock)).rejects.toThrow(
        'Email john.doe@email.com already used.'
      );
    });

    it('should rethrow an unknown error', () => {
      // GIVEN
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValueOnce(Error('Unexpected error'));

      // THEN
      expect(service.createUser(payloadMock)).rejects.toThrow(
        'Unexpected error'
      );
    });
  });

  describe('mustGetUser', () => {
    it('should return a user object', async () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);

      // WHEN
      const user = await service.mustGetUser(userMock.id);

      // THEN
      expect(user).toBeUser();
    });

    it("should throw an error if the user can't be found", () => {
      // GIVEN
      const user = mockUser();
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      // THEN
      expect(service.mustGetUser(user.id)).rejects.toThrow(
        'User not found for id: f7102dc9-4c0c-42b4-9a17-e2bd4af94d5a'
      );
    });
  });

  describe('getPlanConfig', () => {
    it('should return the plan config for the user', async () => {
      // GIVEN
      const user = mockUser();
      jest
        .spyOn(prismaService.userPlan, 'findUnique')
        .mockResolvedValueOnce(mockUserPlan());

      // WHEN
      const planConfig = await service.getPlanConfig(user.id);

      // THEN
      expect(planConfig).toBePlanConfig();
    });

    it('should return the the basic plan if no plan was found for the user', async () => {
      // GIVEN
      const user = mockUser();
      jest
        .spyOn(prismaService.userPlan, 'findUnique')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(prismaService.planConfig, 'findUnique')
        .mockResolvedValueOnce(mockPlanConfig());

      // WHEN
      const planConfig = await service.getPlanConfig(user.id);

      // THEN
      expect(planConfig).toBePlanConfig();
    });
  });

  describe('updateSubscriptionQuantity', () => {
    it("should throw an error if the user doesn't have a customer ID associated on Stripe", () => {
      // GIVEN
      const userMock = mockUser();
      userMock.stripeCustomerId = undefined;
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);

      // THEN
      expect(
        service.updateSubscriptionQuantity(userMock.id, 1)
      ).rejects.toThrow(
        'Cannot update subscription quantity since user (f7102dc9-4c0c-42b4-9a17-e2bd4af94d5a) does not have a stripe customer ID'
      );
    });

    it('should return the updated subscription item', async () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);
      jest
        .spyOn(stripeService, 'updateSubscriptionQuantity')
        .mockResolvedValueOnce(mockSubscriptionItem());

      // WHEN
      const subscriptionItem = await service.updateSubscriptionQuantity(
        userMock.id,
        1
      );

      // THEN
      expect(subscriptionItem).toBeSubscriptionItem();
    });
  });

  describe('getStripeCustomerId', () => {
    it('should return the stripe customer ID', () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);

      // THEN
      expect(service.getStripeCustomerId(userMock.id)).resolves.toEqual(
        userMock.stripeCustomerId
      );
    });

    it("should create a new customer entry on Stripe if the customer doesn't exist on Stripe yet", async () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce({ ...userMock, stripeCustomerId: undefined });
      jest
        .spyOn(stripeService, 'connectOrCreateCustomer')
        .mockResolvedValueOnce(mockStripeCustomer());
      jest.spyOn(prismaService.user, 'update').mockImplementation(() => {
        return null;
      });

      // THEN
      expect(service.getStripeCustomerId(userMock.id)).resolves.toBe(
        'dad57297-637d-4598-862b-9dedd84121fe'
      );
    });
  });

  describe('getBillingUrl', () => {
    it('should return the persisted session URL', async () => {
      // GIVEN
      const userMock = mockUser();
      const mockUrl = 'https://myurl.com/123';
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);
      jest.spyOn(stripeService, 'createBillingSession').mockResolvedValueOnce({
        url: mockUrl,
      } as Stripe.Response<Stripe.BillingPortal.Session>);

      // WHEN
      const url = await service.getBillingUrl(userMock.id, mockUrl);

      // THEN
      expect(url).toBe(mockUrl);
    });
  });

  describe(`getUserByStripeCustomerId`, () => {
    it(`should return a user object`, () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(userMock);

      // WHEN
      const user = service.getUserByStripeCustomerId(userMock.stripeCustomerId);

      // THEN
      expect(user).resolves.toBeUser();
    });
  });

  describe(`getProPlanUrl`, () => {
    const urlMock = 'https://altairgraphql.dev';

    it(`should should return a pro plan URL`, async () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(prismaService.userPlan, 'findUnique')
        .mockResolvedValueOnce(mockUserPlan());
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);
      jest
        .spyOn(stripeService, 'getPlanInfoByRole')
        .mockResolvedValueOnce(mockPlanInfo());
      jest.spyOn(stripeService, 'createCheckoutSession').mockResolvedValueOnce({
        url: urlMock,
      } as Stripe.Response<Stripe.Checkout.Session>);

      // WHEN
      const url = await service.getProPlanUrl(userMock.id);

      // THEN
      expect(url).toBe(urlMock);
    });

    it(`should return the billing URL if the user is already on pro plan`, async () => {
      // GIVEN
      const userMock = mockUser();
      const userPlanMock = mockUserPlan();
      const proUrlMock = `${urlMock}/pro`;
      userPlanMock.planConfig.id = PRO_PLAN_ID;

      jest
        .spyOn(prismaService.userPlan, 'findUnique')
        .mockResolvedValueOnce(userPlanMock);
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);
      jest.spyOn(stripeService, 'createBillingSession').mockResolvedValueOnce({
        url: proUrlMock,
      } as Stripe.Response<Stripe.BillingPortal.Session>);

      // WHEN
      const url = await service.getProPlanUrl(userMock.id);

      // THEN
      expect(url).toBe(proUrlMock);
    });

    it(`should throw an error if the pro plan info was not found on Stripe`, () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(prismaService.userPlan, 'findUnique')
        .mockResolvedValueOnce(mockUserPlan());
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);
      jest
        .spyOn(stripeService, 'getPlanInfoByRole')
        .mockResolvedValueOnce(null);

      // THEN
      expect(service.getProPlanUrl(userMock.id)).rejects.toThrow(
        `No plan info found for id: ${PRO_PLAN_ID}`
      );
    });
  });
});
