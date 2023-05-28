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

describe('WorkspacesController', () => {
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

  it('/workspaces (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/workspaces').expect(401);
  });

  it('/workspaces (GET) should return 200 with list of authorized workspaces when authenticated', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .get('/workspaces')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject([
          {
            name: 'Test Workspace',
          },
        ]);
      });
  });

  it('/workspaces/:id (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/workspaces/1').expect(401);
  });

  it('/workspaces/:id (GET) should return 404 when workspace does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).get('/workspaces/100').expect(404);
  });

  it('/workspaces/:id (GET) should return 200 with workspace when authenticated and workspace exists', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const { body: workspaces } = await request(app.getHttpServer())
      .get('/workspaces')
      .expect(200);

    return request(app.getHttpServer())
      .get(`/workspaces/${workspaces[0].id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          name: 'Test Workspace',
        });
      });
  });
});
