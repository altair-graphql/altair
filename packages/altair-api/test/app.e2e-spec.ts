import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  afterAllCleanup,
  beforeAllSetup,
  createTestApp,
  mockUserFn,
} from './e2e-test-utils';
import { PrismaService } from 'nestjs-prisma';

describe('AppController (e2e)', () => {
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

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(302)
      .expect('Location', 'https://altairgraphql.dev');
  });

  // TODO: add tests that check that users can only access their own data
  // TODO: add tests for the authentication flows (use jwtService to generate tokens)
  // TODO: add test for the addition of new team members when the plan allows it
});
