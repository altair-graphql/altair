import { Test, TestingModule } from '@nestjs/testing';
import { testProviders } from 'test/providers';
import { UserController } from './user.controller';
import { mockRequest } from '../mocks/express.mock';
import { mockPlanConfig, mockUser } from '../mocks/prisma-service.mock';
import { UserService } from './user.service';
import { QueriesService } from '../../queries/queries.service';
import { QueryCollectionsService } from '../../query-collections/query-collections.service';
import { TeamsService } from '../../teams/teams.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let queryService: QueriesService;
  let collectionService: QueryCollectionsService;
  let teamService: TeamsService;

  const urlMock = 'https://altairgraphql.dev';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: testProviders,
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    queryService = module.get<QueriesService>(QueriesService);
    collectionService = module.get<QueryCollectionsService>(
      QueryCollectionsService
    );
    teamService = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(`getBillingUrl`, () => {
    it(`should return a billing URL`, async () => {
      // GIVEN
      const requestMock = mockRequest({
        user: mockUser(),
        headers: { referer: 'https://altairgraphql.dev/billing' },
      });
      jest.spyOn(userService, 'getBillingUrl').mockResolvedValueOnce(urlMock);

      // WHEN
      const response = await controller.getBillingUrl(requestMock);

      // THEN
      expect(response.url).toBe(urlMock);
    });
  });

  describe(`getCurrentPlan`, () => {
    it(`should return a plan`, async () => {
      // GIVEN
      const requestMock = mockRequest({ user: mockUser() });
      const planConfigMock = mockPlanConfig();
      jest
        .spyOn(userService, 'getPlanConfig')
        .mockResolvedValueOnce(planConfigMock);

      // WHEN
      const response = await controller.getCurrentPlan(requestMock);

      // THEN
      expect(response).toBePlan();
    });
  });

  describe(`getStats`, () => {
    it(`should return user stats`, async () => {
      // GIVEN
      const requestMock = mockRequest({ user: mockUser() });
      jest.spyOn(queryService, 'count').mockResolvedValue(42);
      jest.spyOn(collectionService, 'count').mockResolvedValue(43);
      jest.spyOn(teamService, 'count').mockResolvedValue(44);

      // WHEN
      const response = await controller.getStats(requestMock);

      // THEN
      expect(response).toBeUserStats();
    });
  });

  describe(`getProPlanUrl`, () => {
    it(`should return the pro URL`, async () => {
      // GIVEN
      const requestMock = mockRequest({ user: mockUser() });
      jest.spyOn(userService, 'getProPlanUrl').mockResolvedValueOnce(urlMock);

      // WHEN
      const response = await controller.getProPlanUrl(requestMock);

      // THEN
      expect(response.url).toBe(urlMock);
    });
  });
});
