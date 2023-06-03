import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as request from 'supertest';
import {
  afterAllCleanup,
  beforeAllSetup,
  createTeam,
  createTestApp,
  mockUserFn,
  testUser,
  testUser2,
} from './e2e-test-utils';

describe('TeamsController', () => {
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

  it('/teams (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/teams').expect(401);
  });

  it('/teams (GET) should return 200 with list of authorized teams when authenticated', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .get('/teams')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([]);
      });
  });

  it('/teams/:id (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/teams/1').expect(401);
  });

  it('/teams/:id (GET) should return 404 when team does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).get('/teams/100').expect(404);
  });

  it('/teams/:id (GET) should return 200 with team when authenticated and team exists', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    return request(app.getHttpServer())
      .get(`/teams/${team.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject(team);
      });
  });

  it('/teams/:id (GET) should return 404 when attempting to access a team not owned and not a member', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    mockUserFn.mockReturnValue({ id: testUser2.id });
    return request(app.getHttpServer()).get(`/teams/${team.id}`).expect(404);
  });

  it('/teams (POST) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).post('/teams').expect(401);
  });

  it('/teams (POST) should return 400 when body is invalid', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .post('/teams')
      .send({ invalid: 'test' })
      .expect(400);
  });

  it('/teams (POST) should return 201 with team when authenticated and body is valid', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return createTeam(app);
  });

  it('/teams/:id (PATCH) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).patch('/teams/1').expect(401);
  });

  it('/teams/:id (PATCH) should return 404 when team does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).patch('/teams/100').expect(404);
  });

  it('/teams/:id (PATCH) should return 400 when body is invalid', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    return request(app.getHttpServer())
      .patch(`/teams/${team.id}`)
      .send({ name: true })
      .expect(400);
  });

  it('/teams/:id (PATCH) should return 200 with team when authenticated and body is valid', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    return request(app.getHttpServer())
      .patch(`/teams/${team.id}`)
      .send({ name: 'new name' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ count: 1 });
      });
  });

  it('/teams/:id (PATCH) should return 404 when attempting to update a team not owned', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    mockUserFn.mockReturnValue({ id: testUser2.id });
    return request(app.getHttpServer())
      .patch(`/teams/${team.id}`)
      .send({ name: 'new name' })
      .expect(404);
  });

  it('/teams/:id (DELETE) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).delete('/teams/1').expect(401);
  });

  it('/teams/:id (DELETE) should return 404 when team does not exist', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer()).delete('/teams/100').expect(404);
  });

  it('/teams/:id (DELETE) should return 200 when authenticated and team exists', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    return request(app.getHttpServer())
      .delete(`/teams/${team.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ count: 1 });
      });
  });

  it('/teams/:id (DELETE) should return 404 when attempting to delete a team not owned', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    mockUserFn.mockReturnValue({ id: testUser2.id });
    return request(app.getHttpServer()).delete(`/teams/${team.id}`).expect(404);
  });
});
