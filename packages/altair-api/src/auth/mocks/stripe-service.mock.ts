import { IPlanInfo } from '@altairgraphql/api-utils';
import Stripe from 'stripe';

export function mockStripeCustomer(): Stripe.Customer {
  return {
    id: 'dad57297-637d-4598-862b-9dedd84121fe',
  } as Stripe.Customer;
}

export function mockSubscriptionItem(): Stripe.Response<Stripe.SubscriptionItem> {
  return {
    id: 'f7102dc9-4c0c-42b4-9a17-e2bd4af94d5a',
    object: {} as any,
    billing_thresholds: {} as any,
    created: 1,
    metadata: {} as any,
    plan: {} as any,
    price: {} as any,
    subscription: 'my sub',
    tax_rates: [] as any,
    lastResponse: {} as any,
  } as Stripe.Response<Stripe.SubscriptionItem>;
}

export function mockPlanInfo(): IPlanInfo {
  return {
    priceId: 'c444e512-4a6d-4b68-bb80-43c32edde415',
  } as IPlanInfo;
}
