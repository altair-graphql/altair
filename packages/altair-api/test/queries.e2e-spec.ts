import { IUpdateQueryDto } from '@altairgraphql/api-utils';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as request from 'supertest';
import {
  afterAllCleanup,
  beforeAllSetup,
  createQuery,
  createQueryCollection,
  createTestApp,
  mockUserFn,
  testUser,
  testUser2,
} from './e2e-test-utils';

describe('QueriesController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
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

  it('/queries (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/queries').expect(401);
  });

  it('/queries (GET) should return 200 with empty list first time when authenticated', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).get('/queries').expect(200).expect([]);
  });

  it('/queries (GET) should return 200 with queries when authenticated', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testCollection = await createQueryCollection(app);
    const testQuery = await createQuery(app, testCollection.id);

    // should not return another user's query
    mockUserFn.mockReturnValue({ id: testUser2.id });
    const testCollection2 = await createQueryCollection(app);
    await createQuery(app, testCollection2.id);

    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .get('/queries')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject([testQuery]);
      });
  });

  it('/queries (POST) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).post('/queries').expect(401);
  });

  it('/queries (POST) should return 400 when body is invalid', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .post('/queries')
      .send({ name: 'test' })
      .expect(400);
  });

  it('/queries (POST) should return 201 with query when authenticated and body is valid', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testCollection = await createQueryCollection(app);
    return createQuery(app, testCollection.id);
  });

  it('/queries/:id (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/queries/1').expect(401);
  });

  it('/queries/:id (GET) should return 404 when query does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).get('/queries/1').expect(404);
  });

  it('/queries/:id (GET) should return 200 with query when authenticated and query exists', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testCollection = await createQueryCollection(app);

    const testQuery = await createQuery(app, testCollection.id);
    return request(app.getHttpServer())
      .get(`/queries/${testQuery.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject(testQuery);
      });
  });

  it('/queries/:id (GET) should return 404 when attempting to access another users query', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testCollection = await createQueryCollection(app);

    const testQuery = await createQuery(app, testCollection.id);

    mockUserFn.mockReturnValue({ id: testUser2.id });
    return request(app.getHttpServer()).get(`/queries/${testQuery.id}`).expect(404);
  });

  it('/queries/:id (PATCH) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).patch('/queries/1').expect(401);
  });

  it('/queries/:id (PATCH) should return 404 when query does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).patch('/queries/1').expect(404);
  });

  it('/queries/:id (PATCH) should return 400 when body is invalid', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testCollection = await createQueryCollection(app);
    const testQuery = await createQuery(app, testCollection.id);
    return request(app.getHttpServer())
      .patch(`/queries/${testQuery.id}`)
      .send({ name: true })
      .expect(400);
  });

  it('/queries/:id (PATCH) should return 200 with query when authenticated and body is valid', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testCollection = await createQueryCollection(app);
    const testQuery = await createQuery(app, testCollection.id);
    const updateQueryDto: IUpdateQueryDto = {
      name: 'test',
      content: {
        version: 1,
        query: 'query { test }',
        variables: '{}',
        apiUrl: 'http://localhost:3000/graphql',
        headers: [],
        subscriptionUrl: 'ws://localhost:3000/graphql',
        type: 'window',
        windowName: 'test',
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
      collectionId: testCollection.id,
    };
    return request(app.getHttpServer())
      .patch(`/queries/${testQuery.id}`)
      .send(updateQueryDto)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ count: 1 });
      });
  });

  it('/queries/:id (PATCH) should return 404 when attempting to update another users query', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testCollection = await createQueryCollection(app);
    const testQuery = await createQuery(app, testCollection.id);
    const updateQueryDto: IUpdateQueryDto = {
      name: 'test',
      content: {
        version: 1,
        query: 'query { test }',
        variables: '{}',
        apiUrl: 'http://localhost:3000/graphql',
        headers: [],
        subscriptionUrl: 'ws://localhost:3000/graphql',
        type: 'window',
        windowName: 'test',
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
      collectionId: testCollection.id,
    };
    mockUserFn.mockReturnValue({ id: testUser2.id });
    return request(app.getHttpServer())
      .patch(`/queries/${testQuery.id}`)
      .send(updateQueryDto)
      .expect(404);
  });

  it('/queries/:id (DELETE) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).delete('/queries/1').expect(401);
  });

  it('/queries/:id (DELETE) should return 404 when query does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).delete('/queries/1').expect(404);
  });

  it('/queries/:id (DELETE) should return 204 when authenticated and query exists', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testCollection = await createQueryCollection(app);
    const testQuery = await createQuery(app, testCollection.id);
    return request(app.getHttpServer())
      .delete(`/queries/${testQuery.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ count: 1 });
      });
  });

  it('/queries/:id (DELETE) should return 404 when attempting to delete another users query', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const testCollection = await createQueryCollection(app);
    const testQuery = await createQuery(app, testCollection.id);
    mockUserFn.mockReturnValue({ id: testUser2.id });
    return request(app.getHttpServer())
      .delete(`/queries/${testQuery.id}`)
      .expect(404);
  });
});
