import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as request from 'supertest';
import {
  afterAllCleanup,
  beforeAllSetup,
  createQueryCollection,
  createTestApp,
  mockUserFn,
  testUser,
  testUser2,
} from './e2e-test-utils';

describe('QueryCollectionsController', () => {
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

  it('/query-collections (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/query-collections').expect(401);
  });

  it('/query-collections (GET) should return 200 with empty list first time when authenticated', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .get('/query-collections')
      .expect(200)
      .expect([]);
  });

  it('/query-collections (GET) should return 200 with list of authorized query collections when authenticated', async () => {
    mockUserFn.mockReturnValue({ id: testUser2.id });
    await createQueryCollection(app);

    // should not return another user's query collection
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);
    return request(app.getHttpServer())
      .get('/query-collections')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject([testQueryCollection]);
      });
  });

  it('/query-collections (POST) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).post('/query-collections').expect(401);
  });

  it('/query-collections (POST) should return 400 when body is invalid', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .post('/query-collections')
      .send({ invalidName: 'test' })
      .expect(400);
  });

  it('/query-collections (POST) should return 201 with query collection when authenticated and body is valid without query', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return createQueryCollection(app);
  });

  it('/query-collections (POST) should return 201 with query collection when authenticated and body is valid', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return createQueryCollection(app, 'test collection', [
      {
        name: 'test query',
        content: {
          version: 1,
          apiUrl: 'https://api.spacex.land/graphql/',
          subscriptionUrl: 'wss://api.spacex.land/graphql/',
          type: 'window',
          windowName: 'test window',
          query: 'query { test }',
          variables: '{}',
          headers: [],
          authorizationType: 'none',
          authorizationData: {},
          preRequestScript: undefined,
          preRequestScriptEnabled: false,
          postRequestScript: undefined,
          postRequestScriptEnabled: false,
          requestHandlerId: undefined,
          requestHandlerAdditionalParams: undefined,
          subscriptionRequestHandlerId: undefined,
          subscriptionConnectionParams: undefined,
          subscriptionUseDefaultRequestHandler: true,
        },
      },
    ]);
  });

  it('/query-collections/:id (GET) should return 401 when not authenticated', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);
    mockUserFn.mockReturnValue(undefined);
    return request(app.getHttpServer())
      .get(`/query-collections/${testQueryCollection.id}`)
      .expect(401);
  });

  it('/query-collections/:id (GET) should return 404 when query collection does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).get('/query-collections/1').expect(404);
  });

  it('/query-collections/:id (GET) should return 200 with query collection when authenticated and query collection exists', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);
    return request(app.getHttpServer())
      .get(`/query-collections/${testQueryCollection.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject(testQueryCollection);
      });
  });

  it('/query-collections/:id (GET) should return 404 when attempting to access another users query collection', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);

    mockUserFn.mockReturnValue({ id: testUser2.id });
    return request(app.getHttpServer())
      .get(`/query-collections/${testQueryCollection.id}`)
      .expect(404);
  });

  it('/query-collections/:id (PATCH) should return 401 when not authenticated', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);
    mockUserFn.mockReturnValue(undefined);
    return request(app.getHttpServer())
      .patch(`/query-collections/${testQueryCollection.id}`)
      .expect(401);
  });

  it('/query-collections/:id (PATCH) should return 404 when query collection does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).patch('/query-collections/1').expect(404);
  });

  it('/query-collections/:id (PATCH) should return 400 when body is invalid', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);
    return request(app.getHttpServer())
      .patch(`/query-collections/${testQueryCollection.id}`)
      .send({ name: true })
      .expect(400);
  });

  it('/query-collections/:id (PATCH) should return 200 with query collection when authenticated and body is valid', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);
    return request(app.getHttpServer())
      .patch(`/query-collections/${testQueryCollection.id}`)
      .send({ name: 'updated name' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          count: 1,
        });
      });
  });

  it('/query-collections/:id (PATCH) should return 404 when attempting to update another users query collection', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);

    mockUserFn.mockReturnValue({ id: testUser2.id });
    return request(app.getHttpServer())
      .patch(`/query-collections/${testQueryCollection.id}`)
      .send({ name: 'updated name' })
      .expect(404);
  });

  it('/query-collections/:id (DELETE) should return 401 when not authenticated', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);
    mockUserFn.mockReturnValue(undefined);
    return request(app.getHttpServer())
      .delete(`/query-collections/${testQueryCollection.id}`)
      .expect(401);
  });

  it('/query-collections/:id (DELETE) should return 404 when query collection does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).delete('/query-collections/1').expect(404);
  });

  it('/query-collections/:id (DELETE) should return 200 with query collection when authenticated and query collection exists', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);
    return request(app.getHttpServer())
      .delete(`/query-collections/${testQueryCollection.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ count: 1 });
      });
  });

  it('/query-collections/:id (DELETE) should return 404 when attempting to delete another users query collection', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testQueryCollection = await createQueryCollection(app);
    mockUserFn.mockReturnValue({ id: testUser2.id });
    return request(app.getHttpServer())
      .delete(`/query-collections/${testQueryCollection.id}`)
      .expect(404);
  });
});
