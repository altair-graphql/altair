import {
  BASIC_PLAN_ID,
  CreditTransactionType,
  PRO_PLAN_ID,
} from '@altairgraphql/db';
import { Headers, RawBodyRequest } from '@nestjs/common';
import { BadRequestException, Controller, Header, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { EmailService } from 'src/email/email.service';
import { StripeService } from 'src/stripe/stripe.service';
import { Stripe } from 'stripe';

@Controller('stripe-webhook')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {
    // TODO: Synchronise with Stripe on startup
  }

  @Post()
  async incomingEvents(
    @Headers('stripe-signature') stripeSignature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    if (!stripeSignature) {
      throw new BadRequestException('Missing stripe signature');
    }

    const event = this.stripeService.createWebhookEvent(
      req.rawBody!,
      stripeSignature
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const data = event.data.object as Stripe.Subscription;

        const user = await this.userService.getUserByStripeCustomerId(
          data.customer.toString()
        );

        if (!user) {
          throw new BadRequestException('User not found!');
        }
        // Sync user subscription status
        const status = data.status;
        const shouldCancelPlan = status === 'canceled' || status === 'unpaid';
        const item = data.items.data.at(0);
        if (!item) {
          throw new BadRequestException('No item found!');
        }

        const quantity = item.quantity ?? 1;
        const planInfos = await this.stripeService.getPlanInfos();
        const planInfo = planInfos.find((p) => p.id === item.plan.product);

        if (!planInfo) {
          throw new BadRequestException('Plan info not found!');
        }

        const planRole = shouldCancelPlan ? BASIC_PLAN_ID : planInfo.role;

        if (planRole === BASIC_PLAN_ID) {
          await this.userService.toBasicPlan(user.id);
        } else if (planRole === PRO_PLAN_ID) {
          await this.userService.toProPlan(user.id, quantity);
          // Send welcome email
          console.log('Sending welcome email');
          await this.emailService.sendWelcomeEmail(user.id);
          // Subscribe user
          console.log('Subscribing user');
          await this.emailService.subscribeUser(user.id);
        }
        break;
      }
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        // Handle credit purchase
        const data: Stripe.Checkout.Session = event.data.object;
        const checkoutSession = await this.stripeService.retrieveCheckoutSession(
          data.id
        );
        if (!checkoutSession.customer) {
          throw new BadRequestException('No customer found!');
        }

        // Verify no credit transaction with the same session ID exists
        if (
          await this.prisma.creditPurchase.findFirst({
            where: {
              stripeSessionId: checkoutSession.id,
            },
          })
        ) {
          throw new BadRequestException('Credit purchase already exists!');
        }

        if (checkoutSession.payment_status !== 'unpaid') {
          const creditInfo = await this.stripeService.getCreditInfo();
          const purchasedCreditsItem = checkoutSession.line_items?.data.find(
            (item) => {
              return item.price?.product === creditInfo.id;
            }
          );
          if (purchasedCreditsItem) {
            const user = await this.userService.getUserByStripeCustomerId(
              checkoutSession.customer.toString()
            );
            if (!user) {
              throw new BadRequestException('User not found!');
            }
            const quantity = purchasedCreditsItem.quantity ?? 0;

            // Update user credit balance
            await this.prisma.creditBalance.update({
              where: {
                userId: user.id,
              },
              data: {
                fixedCredits: {
                  increment: quantity,
                },
              },
            });

            // Create credit transaction
            const transaction = await this.prisma.creditTransaction.create({
              data: {
                userId: user.id,
                fixedAmount: quantity,
                monthlyAmount: 0,
                description: 'Purchased credits',
                type: CreditTransactionType.PURCHASED,
              },
            });

            // Create purchase record
            await this.prisma.creditPurchase.create({
              data: {
                userId: user.id,
                transactionId: transaction.id,
                stripeSessionId: checkoutSession.id,
                amount: quantity,
                cost: creditInfo.price,
                currency: creditInfo.currency,
              },
            });
          } else {
            throw new BadRequestException('Unknown checkout session');
          }
        }

        break;
      }
    }

    return { received: true };
  }
}
