/**
* CUSTOMERS
* Note: this is a private table that contains a mapping of user IDs to Strip customer IDs.
*/
create table stripe_customers (
  -- UUID from auth.users
 id uuid references auth.users not null primary key,
 -- The user's customer ID in Stripe. User must not be able to update this.
 stripe_customer_id text);


alter table stripe_customers enable row level security;
