
/**
* SUBSCRIPTIONS
* Note: subscriptions are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create type stripe_subscription_status as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');


create table stripe_subscriptions (
  -- Subscription ID from Stripe, e.g. sub_1234.
 id text primary key, user_id uuid references auth.users not null,
 -- The status of the subscription object, one of stripe_subscription_status type above.
 status stripe_subscription_status,
 -- Set of key-value pairs, used to store additional information about the object in a structured format.
 metadata jsonb,
 -- ID of the price that created this subscription.
 price_id text references prices,
 -- Quantity multiplied by the unit amount of the price creates the amount of the subscription. Can be used to charge multiple seats.
 quantity integer,
 -- If true the subscription has been canceled by the user and will be deleted at the end of the billing period.
 cancel_at_period_end boolean,
 -- Time at which the subscription was created.
 created timestamp with time zone default timezone('utc'::text, now()) not null,
 -- Start of the current period that the subscription has been invoiced for.
 current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
 -- End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
 current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
 -- If the subscription has ended, the timestamp of the date the subscription ended.
 ended_at timestamp with time zone default timezone('utc'::text, now()),
 -- A date in the future at which the subscription will automatically get canceled.
 cancel_at timestamp with time zone default timezone('utc'::text, now()),
 -- If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.
 canceled_at timestamp with time zone default timezone('utc'::text, now()),
 -- If the subscription has a trial, the beginning of that trial.
 trial_start timestamp with time zone default timezone('utc'::text, now()),
 -- If the subscription has a trial, the end of that trial.
 trial_end timestamp with time zone default timezone('utc'::text, now())
);

alter table stripe_subscriptions enable row level security;

create policy "Can only view own subs data." on stripe_subscriptions
for
select using (auth.uid() = user_id);
