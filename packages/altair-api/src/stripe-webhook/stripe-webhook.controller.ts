import { Headers, RawBodyRequest } from '@nestjs/common';
import {
  BadRequestException,
  Controller,
  Header,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/auth/user/user.service';
import { StripeService } from 'src/stripe/stripe.service';
import { Stripe } from 'stripe';

@Controller('stripe-webhook')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService
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
      req.rawBody,
      stripeSignature
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
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
        const planRole = shouldCancelPlan ? undefined : data.metadata.role;
        const quantity = data.items.data.at(0)?.quantity ?? 1;

        await this.prisma.userPlan.upsert({
          where: {
            userId: user.id,
          },
          create: {
            userId: user.id,
            planRole,
            quantity,
          },
          update: {
            planRole,
            quantity,
          },
        });
    }

    return { received: true };
  }
}
