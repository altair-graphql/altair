import { PlanConfig, User, UserPlan } from '@altairgraphql/db';
import { Prisma } from '@prisma/client';

export function mockUser(): User {
  return {
    id: 'f7102dc9-4c0c-42b4-9a17-e2bd4af94d5a',
    stripeCustomerId: 'f7102dc9-4c0c-42b4-9a17-e2bd4af94d5a',
    resendContactId: 'f7102dc9-4c0c-42b4-9a17-e2bd4af94d5a',
    email: 'john.doe@email.com',
    firstName: 'John',
    lastName: 'Doe',
    picture: 'asdf',
    isNewUser: false,
    emailVerified: new Date(),
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;
}

export function mockUserPlan(): UserPlan & { planConfig: PlanConfig } {
  return {
    userId: 'f7102dc9-4c0c-42b4-9a17-e2bd4af94d5a',
    planRole: 'my role',
    quantity: 1,
    planConfig: mockPlanConfig(),
  } as UserPlan & { planConfig: PlanConfig };
}

export function mockPlanConfig(): PlanConfig {
  return {
    id: 'f7102dc9-4c0c-42b4-9a17-e2bd4af94d5a',
    stripeProductId: 'f7102dc9-4c0c-42b4-9a17-e2bd4af94d5a',
    maxQueryCount: 1,
    maxTeamCount: 1,
    maxTeamMemberCount: 1,
    allowMoreTeamMembers: false,
  } as PlanConfig;
}

export function mockPrismaConflictError() {
  return new Prisma.PrismaClientKnownRequestError('User already exists', {
    code: 'P2002',
    clientVersion: '1.0.0',
  });
}
