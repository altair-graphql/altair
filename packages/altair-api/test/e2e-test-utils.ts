import * as request from 'supertest';
import { PrismaClient } from '@altairgraphql/db';
import { ConsoleLogger, INestApplication, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { bootstrapApp } from 'src/app-bootstrap';
import { CreateQuerySansCollectionIdDto } from 'src/queries/dto/create-query.dto';
import { PrismaService } from 'nestjs-prisma';
import {
  ICreateQueryDto,
  ICreateTeamDto,
  ICreateTeamMembershipDto,
} from '@altairgraphql/api-utils';
import { JwtService } from '@nestjs/jwt';
import { StripeService } from 'src/stripe/stripe.service';

const prisma = new PrismaClient();
(prisma as any).enableShutdownHooks = () => {
  // do nothing
};

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
export const testUser = {
  id: 'test-user',
  stripeCustomerId: 'cus_test',
  email: 'user@test.com',
  picture: 'https://example.com/picture.png',
  firstName: 'Test',
  lastName: 'User',
  Workspace: {
    create: {
      name: 'Test Workspace',
    },
  },
};
export const testUser2 = {
  id: 'test-user-2',
  stripeCustomerId: 'cus_test2',
  email: 'user2@test.com',
  picture: 'https://example.com/picture2.png',
  firstName: 'Test2',
  lastName: 'User2',
  Workspace: {
    create: {
      name: 'Test 2 Workspace',
    },
  },
};
export const testUser3 = {
  id: 'test-user-3',
  stripeCustomerId: 'cus_test3',
  email: 'user3@test.com',
  picture: 'https://example.com/picture3.png',
  firstName: 'Test3',
  lastName: 'User3',
  Workspace: {
    create: {
      name: 'Test 3 Workspace',
    },
  },
};
export const testUser4 = {
  id: 'test-user-4',
  stripeCustomerId: 'cus_test4',
  email: 'user4@test.com',
  picture: 'https://example.com/picture4.png',
  firstName: 'Test4',
  lastName: 'User4',
  Workspace: {
    create: {
      name: 'Test 4 Workspace',
    },
  },
};
export const testUsers = [testUser, testUser2, testUser3, testUser4];
const defaultMockUser: any = undefined;
export const mockUserFn = jest.fn(() => defaultMockUser);

export const cleanupDatabase = async (prisma: PrismaClient) => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }

  await wait(100);
};

export const createTeam = async (app: INestApplication, name = 'test team') => {
  const data: ICreateTeamDto = {
    name,
    description: 'test team description',
  };

  const res = await request(app.getHttpServer())
    .post('/teams')
    .send(data)
    .expect(201)
    .expect((res) => {
      expect(res.body).toMatchObject(data);
    });

  return res.body;
};

export const createTeamMembership = async (
  app: INestApplication,
  teamId: string,
  email: string
) => {
  const data: ICreateTeamMembershipDto = {
    teamId,
    email,
  };
  const res = await request(app.getHttpServer())
    .post('/team-memberships')
    .send(data)
    .expect(201)
    .expect((res) => {
      expect(res.body).toMatchObject({
        teamId,
        userId: testUsers.find((u) => u.email === email)?.id,
        role: 'MEMBER',
      });
    });

  return res.body;
};

export const createQueryCollection = async (
  app: INestApplication,
  collectionName = 'test collection',
  queries: CreateQuerySansCollectionIdDto[] | undefined = undefined
) => {
  const res = await request(app.getHttpServer())
    .post('/query-collections')
    .send({ name: collectionName, queries })
    .expect(201)
    .expect((res) => {
      expect(res.body).toMatchObject({ name: collectionName });
    });

  return res.body;
};

export const createQuery = async (app: INestApplication, collectionId: string) => {
  const data: ICreateQueryDto = {
    name: 'test query',
    collectionId,
    content: {
      query: '{ hello }',
      variables: '{}',
      apiUrl: 'http://localhost:3000/graphql',
      headers: [],
      subscriptionUrl: 'http://localhost:3000/graphql',
      type: 'window',
      version: 1,
      windowName: 'Test window',
    },
  };
  const res = await request(app.getHttpServer())
    .post('/queries')
    .send(data)
    .expect(201)
    .expect((res) => {
      expect(res.body).toMatchObject({
        name: 'test query',
        queryVersion: 1,
      });
    });

  return res.body;
};

export const beforeAllSetup = async () => {
  await cleanupDatabase(prisma);

  // seed e2e test database
  const basicPlan = {
    id: 'basic',
    maxQueryCount: 5,
    maxTeamCount: 2,
    maxTeamMemberCount: 2,
    allowMoreTeamMembers: false,
  };
  const proPlan = {
    ...basicPlan,
    id: 'pro',
    maxQueryCount: 50,
    maxTeamCount: 20,
    allowMoreTeamMembers: true,
  };
  await prisma.planConfig.upsert({
    create: basicPlan,
    update: {},
    where: {
      id: 'basic',
    },
  });
  await prisma.planConfig.upsert({
    create: proPlan,
    update: {},
    where: {
      id: 'pro',
    },
  });

  for (const user of testUsers) {
    await prisma.user.upsert({
      create: user,
      update: {},
      where: {
        id: user.id,
      },
    });
  }
};

export const createTestApp = async () => {
  const logger = new ConsoleLogger('test', {
    logLevels: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const stripeService = {
    createCustomer: jest.fn().mockResolvedValue({
      id: 'cus_test',
      email: '',
      name: '',
    }),
    updateSubscriptionQuantity: jest.fn().mockResolvedValue({}),
  };
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    // TODO: Test with real JWT strategy
    .overrideProvider(JwtStrategy)
    .useClass(
      class MockJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
        constructor() {
          super((req: any, done: any) => {
            done(null, mockUserFn());
          });
        }
      }
    )
    .overrideProvider(StripeService)
    .useValue(stripeService)
    .overrideProvider(Logger)
    .useValue(logger)
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .compile();

  expect(process.env.NODE_ENV).toBe('test');
  const app = moduleFixture.createNestApplication();
  await bootstrapApp(app);
  await app.init();

  // wait for app to be ready
  // await wait(100);

  return {
    app,
    prismaService: moduleFixture.get(PrismaService),
    stripeService,
  };
};

export const afterAllCleanup = async (
  app: INestApplication,
  prismaService: PrismaService
) => {
  // await prismaService?.$disconnect();
  // await prisma.$disconnect();
  await app.close();
};

export const authedRequest = (
  app: INestApplication,
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  userId?: string
) => {
  const token = app.get(JwtService).sign({ userId });

  const req = request(app.getHttpServer())
    [method](url)
    .set('Authorization', 'bearer ' + token);

  return req;
};
