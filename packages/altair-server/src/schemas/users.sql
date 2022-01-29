/**
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
create table users (
  -- UUID from auth.users
 id uuid references auth.users not null primary key,
 full_name text,
 avatar_url text,
 -- The customer's billing address, stored in JSON format.
 billing_address jsonb,
 -- Stores your customer's payment instruments.
 payment_method jsonb,
 updated_at timestamp with time zone
);
alter table users enable row level security;

create policy "Can view own user data." on users
for
select using (auth.uid() = id);

create policy "Can update own user data." on users
for
update using (auth.uid() = id);

create trigger handle_updated_at before update on users 
  for each row execute procedure moddatetime (updated_at);
