create extension if not exists pgcrypto with schema extensions;

create type public.application_status as enum (
  'new',
  'reviewing',
  'accepted',
  'declined'
);

create type public.order_status as enum (
  'pending',
  'paid',
  'failed',
  'expired',
  'refunded'
);

create type public.membership_status as enum (
  'active',
  'expired',
  'cancelled',
  'refunded'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null check (char_length(email) <= 254),
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (phone is null or char_length(phone) <= 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  monthly_price_mad integer not null check (monthly_price_mad > 0),
  access_days integer not null default 30 check (access_days = 30),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.programs (slug, name, monthly_price_mad) values
  ('business-english', 'Business English', 800),
  ('exam-preparation', 'Exam Preparation', 500),
  ('day-to-day-english', 'Day-to-Day English', 600),
  ('private-tutoring', 'Private Tutoring', 350);

create table public.student_applications (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 5 and 32),
  preferred_schedule text not null check (char_length(preferred_schedule) between 2 and 2000),
  current_level text not null default '' check (char_length(current_level) <= 16),
  learning_goals text not null default '' check (char_length(learning_goals) <= 3000),
  status public.application_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teacher_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 5 and 32),
  country text not null check (char_length(country) between 2 and 100),
  experience text not null check (char_length(experience) between 2 and 3000),
  certification text not null check (char_length(certification) between 2 and 2000),
  specialization text not null check (char_length(specialization) between 2 and 1000),
  availability text not null check (char_length(availability) between 2 and 2000),
  why_join text not null check (char_length(why_join) between 2 and 3000),
  status public.application_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.class_slots (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null check (capacity between 1 and 200),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete restrict,
  program_id uuid not null references public.programs (id),
  class_slot_id uuid not null references public.class_slots (id),
  amount_mad integer not null check (amount_mad > 0),
  currency text not null default 'MAD' check (currency = 'MAD'),
  status public.order_status not null default 'pending',
  provider text,
  provider_checkout_id text unique,
  provider_payment_id text unique,
  expires_at timestamptz not null default (now() + interval '20 minutes'),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete restrict,
  program_id uuid not null references public.programs (id),
  class_slot_id uuid not null references public.class_slots (id),
  order_id uuid not null unique references public.orders (id) on delete restrict,
  status public.membership_status not null default 'active',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  consented_at timestamptz not null,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email),
  check (char_length(email) <= 254)
);

create table public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);

create index student_applications_created_at_idx on public.student_applications (created_at desc);
create index teacher_applications_created_at_idx on public.teacher_applications (created_at desc);
create index class_slots_program_start_idx on public.class_slots (program_id, starts_at) where active;
create index orders_student_created_at_idx on public.orders (student_id, created_at desc);
create index memberships_student_ends_at_idx on public.memberships (student_id, ends_at desc);

create view public.available_class_slots
with (security_barrier = true)
as
select
  slot.id,
  slot.program_id,
  program.slug as program_slug,
  program.name as program_name,
  slot.starts_at,
  slot.ends_at,
  (slot.capacity - coalesce(reservations.seat_count, 0))::integer as available_seats
from public.class_slots as slot
join public.programs as program on program.id = slot.program_id
left join lateral (
  select count(*) as seat_count
  from public.orders as order_row
  where order_row.class_slot_id = slot.id
    and (
      order_row.status = 'paid'
      or (order_row.status = 'pending' and order_row.expires_at > now())
    )
) as reservations on true
where slot.active
  and program.active
  and slot.starts_at > now()
  and slot.capacity > coalesce(reservations.seat_count, 0);

grant select on public.available_class_slots to anon, authenticated;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    left(lower(coalesce(new.email, '')), 254),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120)
  );
  return new;
end;
$$;

create function public.handle_auth_email_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = left(lower(coalesce(new.email, '')), 254),
      updated_at = now()
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute procedure public.handle_auth_email_update();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.programs enable row level security;
alter table public.student_applications enable row level security;
alter table public.teacher_applications enable row level security;
alter table public.class_slots enable row level security;
alter table public.orders enable row level security;
alter table public.memberships enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.payment_webhook_events enable row level security;

revoke all on public.profiles, public.user_roles, public.programs,
  public.student_applications, public.teacher_applications, public.class_slots,
  public.orders, public.memberships, public.newsletter_subscribers,
  public.payment_webhook_events from anon, authenticated;

grant select on public.programs to anon, authenticated;
grant select, insert, update, delete on public.programs to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, updated_at) on public.profiles to authenticated;
grant select, update on public.user_roles to authenticated;
grant select, insert, update, delete on public.class_slots to authenticated;
grant select, update on public.student_applications, public.teacher_applications to authenticated;
grant select on public.orders, public.memberships to authenticated;
grant select, update on public.newsletter_subscribers to authenticated;

create policy "Active programs are public"
  on public.programs for select
  to anon, authenticated
  using (active);
create policy "Admins manage programs"
  on public.programs for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Users read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Admins read roles"
  on public.user_roles for select
  to authenticated
  using ((select public.is_admin()));
create policy "Admins manage roles"
  on public.user_roles for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins manage student applications"
  on public.student_applications for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Admins manage teacher applications"
  on public.teacher_applications for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Visitors see upcoming active class slots"
  on public.class_slots for select
  to anon, authenticated
  using (active and starts_at > now());
create policy "Admins manage class slots"
  on public.class_slots for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Students read their own orders"
  on public.orders for select
  to authenticated
  using (student_id = (select auth.uid()) or (select public.is_admin()));
create policy "Students read their own memberships"
  on public.memberships for select
  to authenticated
  using (student_id = (select auth.uid()) or (select public.is_admin()));

create policy "Admins manage newsletter subscribers"
  on public.newsletter_subscribers for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

comment on table public.orders is 'Stores payment state and provider references only; never card numbers or security codes.';
comment on table public.payment_webhook_events is 'Provider event IDs make payment callbacks idempotent.';
comment on table public.class_slots is 'Admin-managed course cohort slots; timestamps are stored in UTC.';
