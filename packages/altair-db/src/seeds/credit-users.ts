import { CreditTransactionType, PrismaClient } from '@prisma/client';
import { INITIAL_CREDIT_BALANCE } from '../constants';

export const creditInitialBalance = async (prisma: PrismaClient) => {
  // for all users without a credit balance, create a credit balance record with INITIAL_CREDIT_BALANCE credits each,
  // and create a credit transaction record for the initial credits
  const users = await prisma.user.findMany({
    where: {
      CreditBalance: {
        is: null,
      },
    },
  });

  const creditBalanceRecords = users.map(async (user) => {
    await prisma.creditBalance.create({
      data: {
        fixedCredits: INITIAL_CREDIT_BALANCE,
        monthlyCredits: 0,
        userId: user.id,
      },
    });
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        fixedAmount: INITIAL_CREDIT_BALANCE,
        monthlyAmount: 0,
        type: CreditTransactionType.INITIAL,
        description: 'Initial credits',
      },
    });
  });

  await Promise.all(creditBalanceRecords);

  console.log('Credit initial balance seed completed');
};
