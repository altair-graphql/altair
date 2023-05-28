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

// - GET /auth/me (returns the user profile)
// - GET /auth/slt (returns the short-lived token for events)

describe('AuthController', () => {
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

  it('/auth/me (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('/auth/me (GET) should return 200 with user profile when authenticated', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: testUser.id,
        });
      });
  });

  it('/auth/slt (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/auth/slt').expect(401);
  });

  it('/auth/slt (GET) should return 200 with short-lived token when authenticated', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .get('/auth/slt')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          slt: expect.any(String),
        });
      });
  });
});
