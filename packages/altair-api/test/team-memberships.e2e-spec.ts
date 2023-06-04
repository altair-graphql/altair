import { ICreateTeamMembershipDto } from '@altairgraphql/api-utils';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as request from 'supertest';
import {
  afterAllCleanup,
  beforeAllSetup,
  createTeam,
  createTeamMembership,
  createTestApp,
  mockUserFn,
  testUser,
  testUser2,
  testUser3,
} from './e2e-test-utils';

describe('TeamMembershipsController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let stripeService: any;

  beforeEach(async () => {
    await beforeAllSetup();
    ({ app, prismaService, stripeService } = await createTestApp());
  });

  beforeEach(async () => {
    // reset mocks
    mockUserFn.mockReturnValue(undefined);
  });
  afterAll(async () => {
    await afterAllCleanup(app, prismaService);
  });

  it('/team-memberships/team/:id (GET) should return 401 when not authenticated', () => {
    return request(app.getHttpServer())
      .get('/team-memberships/team/1')
      .expect(401);
  });

  it('/team-memberships/team/:id (GET) should return 400 when team does not exist or user is not allowed to access the team', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .get('/team-memberships/team/100')
      .expect(400);
  });

  it('/team-memberships/team/:id (GET) should return 200 with list of team memberships when authenticated and team exists', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    return request(app.getHttpServer())
      .get(`/team-memberships/team/${team.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([]);
      });
  });

  it('/team-memberships (POST) should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).post('/team-memberships').expect(401);
  });

  it('/team-memberships (POST) should return 400 when body is invalid', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .post('/team-memberships')
      .send({ teamId: 1 })
      .expect(400);
  });

  it('/team-memberships (POST) should return 201 with team membership when authenticated and body is valid', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    return createTeamMembership(app, team.id, testUser.email);
  });

  it('/team-memberships (POST) should return 400 when team membership limit is reached', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    await createTeamMembership(app, team.id, testUser.email);
    await createTeamMembership(app, team.id, testUser2.email);
    const data: ICreateTeamMembershipDto = {
      teamId: team.id,
      email: testUser3.email,
    };
    return request(app.getHttpServer())
      .post('/team-memberships')
      .send(data)
      .expect(400);
  });

  it('/team-memberships (POST) should return 200 when team membership limit is reached but with user plan that allows more team members', async () => {
    await prismaService.userPlan.create({
      data: {
        userId: testUser.id,
        planRole: 'pro',
        quantity: 0,
      },
    });
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);

    await createTeamMembership(app, team.id, testUser.email);
    await createTeamMembership(app, team.id, testUser2.email);
    await createTeamMembership(app, team.id, testUser3.email);

    expect(stripeService.updateSubscriptionQuantity).toBeCalledWith(
      'cus_test',
      3
    );
  });

  it('/team-memberships/team/:teamId/member/:memberId (DELETE) should return 401 when not authenticated', () => {
    return request(app.getHttpServer())
      .delete('/team-memberships/team/1/member/1')
      .expect(401);
  });

  it('/team-memberships/team/:teamId/member/:memberId (DELETE) should return 400 when team membership does not exist or user is not allowed to access the team', () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    return request(app.getHttpServer())
      .delete('/team-memberships/team/100/member/1')
      .expect(400);
  });

  it('/team-memberships/team/:teamId/member/:memberId (DELETE) should return 200 when authenticated and team membership exists', async () => {
    mockUserFn.mockReturnValue({ id: testUser.id });
    const team = await createTeam(app);
    const membership = await createTeamMembership(app, team.id, testUser.email);

    return request(app.getHttpServer())
      .delete(`/team-memberships/team/${team.id}/member/${membership.userId}`)
      .expect(200);
  });
});
