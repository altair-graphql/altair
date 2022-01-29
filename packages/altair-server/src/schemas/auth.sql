/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  insert into public.workspaces (owner_id, workspace_name)
  values (new.id, 'My workspace');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after
insert on auth.users
for each row execute procedure public.handle_new_user();
