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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
