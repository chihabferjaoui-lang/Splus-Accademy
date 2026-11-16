-- TESTING ONLY: This shortcut auto-confirms every signup and must be removed before launch.
create or replace function public.auto_confirm_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email_confirmed_at := now();
  return new;
end;
$$;

create trigger auto_confirm_before_insert
  before insert on auth.users
  for each row execute function public.auto_confirm_user();
