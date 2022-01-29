-- No policies as this is a private table that the user must not have access to.
 /**
* PRODUCTS
* Note: products are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create table stripe_products (
  -- Product ID from Stripe, e.g. prod_1234.
 id text primary key,
 -- Whether the product is currently available for purchase.
 active boolean,
 -- The product's name, meant to be displayable to the customer. Whenever this product is sold via a subscription, name will show up on associated invoice line item descriptions.
 name text,
 -- The product's description, meant to be displayable to the customer. Use this field to optionally store a long form explanation of the product being sold for your own rendering purposes.
 description text,
 -- A URL of the product image in Stripe, meant to be displayable to the customer.
 image text,
 -- Set of key-value pairs, used to store additional information about the object in a structured format.
 metadata jsonb
);
alter table stripe_products enable row level security;

create policy "Allow public read-only access." on stripe_products
for
select using (true);
