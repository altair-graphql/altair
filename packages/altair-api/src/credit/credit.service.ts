import {
  CreditTransactionType,
  MINIMUM_CREDIT_PURCHASE,
  MONTHLY_CREDIT_REFILL,
  PRO_PLAN_ID,
} from '@altairgraphql/db';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly stripeService: StripeService
  ) {}

  async buyCredits(userId: string, amount = MINIMUM_CREDIT_PURCHASE) {
    // Only pro users can buy credits
    const planConfig = await this.userService.getPlanConfig(userId);
    if (planConfig?.id !== PRO_PLAN_ID) {
      throw new BadRequestException('Only pro users can buy credits');
    }

    // Trigger a Stripe session
    const customerId = await this.userService.getStripeCustomerId(userId);
    const creditInfo = await this.stripeService.getCreditInfo();
    const ses = await this.stripeService.createCreditCheckoutSession(
      customerId,
      creditInfo.priceId,
      Math.min(amount, MINIMUM_CREDIT_PURCHASE)
    );
    return { url: ses.url };
  }

  async getAvailableCredits(userId: string) {
    const creditBalance = await this.prisma.creditBalance.findUnique({
      where: { userId },
    });
    if (!creditBalance) {
      throw new BadRequestException('User has no credits');
    }
    return {
      fixed: creditBalance.fixedCredits,
      monthly: creditBalance.monthlyCredits,
      total: creditBalance.fixedCredits + creditBalance.monthlyCredits,
    };
  }

  async useCredits(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }
    const credits = await this.getAvailableCredits(userId);
    // If user has no credits, return an error
    if (credits.total < amount) {
      throw new BadRequestException('Insufficient credits');
    }

    let usedMonthlyCredits = 0;
    let usedFixedCredits = 0;

    // Deduct amount from user's MonthlyCredits if available
    usedMonthlyCredits = Math.min(credits.monthly, amount);
    // Deduct amount from user's FixedCredits if available
    usedFixedCredits = Math.min(credits.fixed, amount - usedMonthlyCredits);
    // Create CreditTransaction record (type: used)
    const transaction = await this.prisma.creditTransaction.create({
      data: {
        userId,
        fixedAmount: -usedFixedCredits,
        monthlyAmount: -usedMonthlyCredits,
        type: CreditTransactionType.USED,
        description: 'Used credits',
      },
    });
    // Update user's CreditBalance
    const balance = await this.prisma.creditBalance.update({
      where: { userId },
      data: {
        monthlyCredits: { decrement: usedMonthlyCredits },
        fixedCredits: { decrement: usedFixedCredits },
      },
    });

    return {
      transactionId: transaction.id,
      fixedCredits: balance.fixedCredits,
      monthlyCredits: balance.monthlyCredits,
    };
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyRefill() {
    // Reset monthly credits to all pro users
    // Create CreditTransaction record (type: monthly_refill) with top up amount

    const proUsers = await this.userService.getProUsers();

    const creditBalanceRecords = proUsers.map(async (user) => {
      const currentUserBalance = await this.prisma.creditBalance.findUnique({
        where: { userId: user.id },
      });
      await this.prisma.creditBalance.update({
        where: { userId: user.id },
        data: {
          monthlyCredits: MONTHLY_CREDIT_REFILL,
        },
      });
      await this.prisma.creditTransaction.create({
        data: {
          userId: user.id,
          monthlyAmount:
            MONTHLY_CREDIT_REFILL - (currentUserBalance?.monthlyCredits ?? 0),
          fixedAmount: 0,
          type: CreditTransactionType.MONTHLY_REFILL,
          description: 'Monthly refill',
        },
      });
    });

    await Promise.all(creditBalanceRecords);
  }
}
