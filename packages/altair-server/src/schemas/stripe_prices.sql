

/**
* PRICES
* Note: prices are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create type stripe_pricing_type as enum ('one_time', 'recurring');

create type stripe_pricing_plan_interval as enum ('day', 'week', 'month', 'year');

create table stripe_prices (
  -- Price ID from Stripe, e.g. price_1234.
 id text primary key,
 -- The ID of the prduct that this price belongs to.
 product_id text references stripe_products,
 -- Whether the price can be used for new purchases.
 active boolean,
 -- A brief description of the price.
 description text,
 -- The unit amount as a positive integer in the smallest currency unit (e.g., 100 cents for US$1.00 or 100 for ¥100, a zero-decimal currency).
 unit_amount bigint,
 -- Three-letter ISO currency code, in lowercase.
 currency text check (char_length(currency) = 3),
 -- One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or a recurring (subscription) purchase.
 type stripe_pricing_type,
 -- The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.
 interval stripe_pricing_plan_interval,
 -- The number of intervals (specified in the `interval` attribute) between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months.
 interval_count integer,
 -- default number of trial days when subscribing a customer to this price using [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
 trial_period_days integer,
 -- Set of key-value pairs, used to store additional information about the object in a structured format.
 metadata jsonb
);

alter table stripe_prices enable row level security;


create policy "Allow public read-only access." on stripe_prices
for
select using (true);
