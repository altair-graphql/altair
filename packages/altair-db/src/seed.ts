import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create the basic plan config
  const basicPlan = await prisma.planConfig.create({
    data: {
      id: 'basic',
      maxQueryCount: 20,
      maxTeamCount: 1,
      maxTeamMemberCount: 2,
    },
  });

  console.log({ basicPlan });
}

// execute the main function
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });

async function createTeamWorkspaces() {
  const teamsWithoutWorkspace = await prisma.team.findMany({
    where: {
      Workspace: {
        none: {},
      },
    },
  });

  console.log('teams without workspaces', teamsWithoutWorkspace);

  if (teamsWithoutWorkspace.length) {
    const proms = teamsWithoutWorkspace.map(({ id, name, ownerId }) => {
      return prisma.workspace.create({
        data: {
          name: `${name} Workspace`,
          ownerId,
          teamId: id,
        },
      });
    });
    const res = await Promise.all(proms);
    console.log('result', res);
  }
}
