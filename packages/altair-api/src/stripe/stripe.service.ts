import { Injectable, Logger } from '@nestjs/common';
import { Stripe } from 'stripe';
import { PLAN_IDS } from '@altairgraphql/db';
import { IPlanInfo } from '@altairgraphql/api-utils';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
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

  commonCheckoutSessionParams(
    stripeCustomerId: string,
    priceId: string,
    quantity = 1
  ): Stripe.Checkout.SessionCreateParams {
    return {
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      automatic_tax: {
        enabled: true,
      },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      tax_id_collection: {
        enabled: true,
      },
      line_items: [
        {
          price: priceId,
          quantity,
          adjustable_quantity: {
            enabled: true,
            minimum: quantity,
          },
        },
      ],
    };
  }

  createSubscriptionCheckoutSession(stripeCustomerId: string, priceId: string) {
    return this.stripe.checkout.sessions.create({
      ...this.commonCheckoutSessionParams(stripeCustomerId, priceId),
      custom_text: {
        submit: {
          message:
            'Note: The quantity determines the number of users in your team. Adding new team members will automatically increase the quantity of your subscription.',
        },
      },
      mode: 'subscription',
      success_url: `https://altairgraphql.dev/checkout_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://altairgraphql.dev/checkout_cancel?session_id={CHECKOUT_SESSION_ID}`,
    });
  }

  createCreditCheckoutSession(
    stripeCustomerId: string,
    priceId: string,
    quantity = 1
  ) {
    return this.stripe.checkout.sessions.create({
      ...this.commonCheckoutSessionParams(stripeCustomerId, priceId, quantity),
      mode: 'payment',
      success_url: `https://altairgraphql.dev/checkout_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://altairgraphql.dev/checkout_cancel?session_id={CHECKOUT_SESSION_ID}`,
    });
  }

  retrieveCheckoutSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
  }

  getProducts() {
    return this.stripe.products.list();
  }

  getPrices() {
    return this.stripe.prices.list();
  }

  async getPlanInfoByRole(role: (typeof PLAN_IDS)[keyof typeof PLAN_IDS]) {
    const plans = await this.getPlanInfos();
    return plans.find((plan) => plan?.role === role);
  }

  async getPlanInfos(): Promise<IPlanInfo[]> {
    const products = await this.getProducts();
    const prices = await this.getPrices();

    return products.data
      .map((product): IPlanInfo | undefined => {
        const price = prices.data.find((price) => price.product === product.id);
        if (!price) {
          return undefined;
        }

        // a valid (altair subscription) product must have a role
        if (!product.metadata.role || product.metadata.type !== 'plan') {
          return undefined;
        }

        return {
          /**
           * product ID
           */
          id: product.id,
          priceId: price.id,
          role: product.metadata.role,
          name: product.name,
          description: product.description ?? '',
          price: price.unit_amount ?? 0,
          currency: price.currency,
          interval: price.recurring?.interval ?? '',
        };
      })
      .filter((plan) => !!plan) as IPlanInfo[];
  }

  async getCreditInfo() {
    const products = await this.getProducts();
    const prices = await this.getPrices();

    const product = products.data.find(
      (product) => product.metadata.type === 'credit'
    );

    if (!product) {
      throw new Error('Credit product not found');
    }

    const price = prices.data.find((price) => price.product === product.id);

    if (!price) {
      throw new Error('Credit price not found');
    }

    return {
      id: product.id,
      priceId: price.id,
      price: price.unit_amount ?? 0,
      currency: price.currency,
      name: product.name,
      description: product.description ?? '',
    };
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

    if (res.data.length === 0) {
      console.error('Customer does not have an active subscription. Exiting.');
      return;
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
