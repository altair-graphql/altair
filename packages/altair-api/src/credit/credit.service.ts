import {
  CreditTransactionType,
  MINIMUM_CREDIT_PURCHASE,
  MONTHLY_CREDIT_REFILL,
  PRO_PLAN_ID,
} from '@altairgraphql/db';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { EVENTS } from 'src/common/events';
import { getTelemetry } from 'src/telemetry/telemetry';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);
  private readonly telemetry = getTelemetry();

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2
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
      Math.max(amount, MINIMUM_CREDIT_PURCHASE)
    );
    return { url: ses.url };
  }

  async getAvailableCredits(userId: string) {
    const creditBalance = await this.prisma.creditBalance.findUnique({
      where: { userId },
    });
    if (!creditBalance) {
      this.telemetry.incrementMetric('credit.balance.not_found');
      throw new BadRequestException('User has no credits');
    }
    this.telemetry.setGauge(
      'credit.balance.total',
      creditBalance.fixedCredits + creditBalance.monthlyCredits
    );
    return {
      fixed: creditBalance.fixedCredits,
      monthly: creditBalance.monthlyCredits,
      total: creditBalance.fixedCredits + creditBalance.monthlyCredits,
    };
  }

  /**
   * List credit transactions for a user with cursor-based pagination.
   */
  async getTransactions(
    userId: string,
    options: { limit?: number; cursor?: string; type?: CreditTransactionType } = {}
  ) {
    const { limit = 20, cursor, type } = options;
    const take = Math.min(limit, 100); // cap at 100

    const transactions = await this.prisma.creditTransaction.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      take: take + 1, // fetch one extra to detect hasMore
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1, // skip the cursor itself
          }
        : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = transactions.length > take;
    const items = hasMore ? transactions.slice(0, take) : transactions;
    const nextCursor = hasMore ? items[items.length - 1]!.id : undefined;

    return { items, hasMore, nextCursor };
  }

  async useCredits(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const creditBalance = await tx.creditBalance.findUnique({
        where: { userId },
      });
      if (!creditBalance) {
        this.telemetry.incrementMetric('credit.balance.not_found');
        throw new BadRequestException('User has no credits');
      }

      const total = creditBalance.fixedCredits + creditBalance.monthlyCredits;
      if (total < amount) {
        throw new BadRequestException('Insufficient credits');
      }

      let usedMonthlyCredits = 0;
      let usedFixedCredits = 0;

      // Deduct amount from user's MonthlyCredits if available
      usedMonthlyCredits = Math.min(creditBalance.monthlyCredits, amount);
      // Deduct amount from user's FixedCredits if available
      usedFixedCredits = Math.min(
        creditBalance.fixedCredits,
        amount - usedMonthlyCredits
      );
      // Create CreditTransaction record (type: used)
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          fixedAmount: -usedFixedCredits,
          monthlyAmount: -usedMonthlyCredits,
          type: CreditTransactionType.USED,
          description: 'Used credits',
        },
      });
      // Update user's CreditBalance
      const balance = await tx.creditBalance.update({
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
    });

    this.eventEmitter.emit(EVENTS.CREDIT_UPDATE, {
      userId,
      fixedCredits: result.fixedCredits,
      monthlyCredits: result.monthlyCredits,
    });

    return result;
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyRefill() {
    // Reset monthly credits to all pro users
    // Create CreditTransaction record (type: monthly_refill) with top up amount

    const proUsers = await this.userService.getProUsers();

    const creditBalanceRecords = proUsers.map(async (user) => {
      try {
        await this.prisma.$transaction(async (tx) => {
          const currentUserBalance = await tx.creditBalance.findUnique({
            where: { userId: user.id },
          });
          await tx.creditBalance.update({
            where: { userId: user.id },
            data: {
              monthlyCredits: MONTHLY_CREDIT_REFILL,
            },
          });
          await tx.creditTransaction.create({
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

        this.eventEmitter.emit(EVENTS.CREDIT_UPDATE, {
          userId: user.id,
          monthlyCredits: MONTHLY_CREDIT_REFILL,
        });
      } catch (err) {
        this.logger.error(
          `Failed to refill credits for user ${user.id}`,
          err instanceof Error ? err.stack : err
        );
      }
    });

    this.telemetry.setGauge('credit.monthly.refill_count', proUsers.length);

    await Promise.allSettled(creditBalanceRecords);
  }
}
