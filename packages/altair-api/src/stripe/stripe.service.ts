import { Injectable, Logger } from '@nestjs/common';
import { Stripe } from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2022-11-15',
    });
  }

  async createCustomer(email: string) {
    return this.stripe.customers.create({
      email,
      description: 'Added from altair-api',
    });
  }

  async connectOrCreateCustomer(email: string) {
    const foundCustomer = await this.getCustomerByEmail(email);

    if (foundCustomer) {
      return foundCustomer;
    }

    return this.createCustomer(email);
  }

  async getCustomerByEmail(email: string) {
    const list = await this.stripe.customers.list({
      email,
    });

    return list.data.at(0);
  }

  getCustomerById(id: string) {
    return this.stripe.customers.retrieve(id);
  }

  createWebhookEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  }

  createBillingSession(stripeCustomerId: string, returnUrl?: string) {
    return this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });
  }

  async updateSubscriptionQuantity(stripeCustomerId: string, quantity: number) {
    const res = await this.stripe.subscriptions.list({
      customer: stripeCustomerId,
    });

    if (res.data.length > 1) {
      // Complain loudly!
      this.logger.error(
        `stripe customer (${stripeCustomerId}) has ${res.data.length} active subscriptions. Only 1 subscription is allowed.`
      );
    }

    // update first item only
    const itemId = res.data.at(0)?.items.data.at(0)?.id;

    if (!itemId) {
      throw new Error(
        `Cannot update subscription quantity since customer (${stripeCustomerId}) does not have a subscription item ID`
      );
    }

    return this.stripe.subscriptionItems.update(itemId, {
      quantity,
    });
  }
}
