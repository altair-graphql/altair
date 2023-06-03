import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as request from 'supertest';
import {
  afterAllCleanup,
  beforeAllSetup,
  createTestApp,
  mockUserFn,
  testUser,
} from './e2e-test-utils';

describe('UsersController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    await beforeAllSetup();
    ({ app, prismaService } = await createTestApp());
  });

  beforeEach(async () => {
    // reset mocks
    mockUserFn.mockReturnValue(undefined);
  });
  afterAll(async () => {
    await afterAllCleanup(app, prismaService);
  });

  it('/user/plan (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/user/plan').expect(401);
  });

  it('/user/plan (GET) should return 200 with plan when authenticated', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .get('/user/plan')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          max_query_count: 5,
          max_team_count: 2,
          max_team_member_count: 2,
        });
      });
  });

  it('/user/stats (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/user/stats').expect(401);
  });

  it('/user/stats (GET) should return 200 with stats when authenticated', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .get('/user/stats')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          collections: {
            access: 0,
            own: 0,
          },
          queries: {
            access: 0,
            own: 0,
          },
          teams: {
            access: 0,
            own: 0,
          },
        });
      });
  });
});
