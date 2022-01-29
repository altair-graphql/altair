
create type product_config_identifier as enum ('noproduct')

create table product_configs (
  id product_config_identifier unique,
  request_count_limit int,
  request_collection_count_limit int,
  workspace_count_limit int,
  inserted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table product_configs enable row level security;
create trigger handle_updated_at before update on product_configs 
  for each row execute procedure moddatetime (updated_at);
