alter table public.programs
  alter column monthly_price_mad drop not null,
  drop constraint programs_monthly_price_mad_check,
  add constraint programs_monthly_price_mad_check
    check (monthly_price_mad is null or monthly_price_mad > 0);

insert into public.programs (slug, name, monthly_price_mad)
values ('speaking-classes', 'Speaking Classes', null)
on conflict (slug) do nothing;

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default (
    'BR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
  ),
  program_id uuid not null references public.programs (id),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 5 and 32),
  requested_date date not null,
  requested_time time not null,
  requested_timezone text not null check (char_length(requested_timezone) between 1 and 80),
  status public.application_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index booking_requests_created_at_idx
  on public.booking_requests (created_at desc);

alter table public.booking_requests enable row level security;
revoke all on public.booking_requests from anon, authenticated;
grant select, update on public.booking_requests to authenticated;

create policy "Admins manage booking requests"
  on public.booking_requests for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create or replace function public.admin_activity_summary()
returns table (
  student_accounts bigint,
  booking_requests bigint,
  active_enrollments bigint,
  upcoming_lessons bigint,
  student_applications bigint,
  teacher_applications bigint,
  paid_revenue_mad bigint,
  active_newsletter_subscribers bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from public.profiles as profile
      where not exists (
        select 1 from public.user_roles as user_role
        where user_role.user_id = profile.id and user_role.role = 'admin'
      ))::bigint,
    (select count(*) from public.booking_requests as booking
      where booking.status in ('new', 'reviewing'))::bigint,
    (select count(*) from public.memberships as membership
      where membership.status = 'active' and membership.ends_at > now())::bigint,
    (select count(*) from public.class_sessions as session
      where session.status = 'scheduled' and session.starts_at > now())::bigint,
    (select count(*) from public.student_applications)::bigint,
    (select count(*) from public.teacher_applications)::bigint,
    coalesce((select sum(order_row.amount_mad) from public.orders as order_row
      where order_row.status = 'paid'), 0)::bigint,
    (select count(*) from public.newsletter_subscribers as subscriber
      where subscriber.unsubscribed_at is null)::bigint;
end;
$$;

revoke all on function public.admin_activity_summary() from public, anon;
grant execute on function public.admin_activity_summary() to authenticated;

comment on table public.booking_requests is
  'Public, unconfirmed booking inquiries; a request is not a paid order or enrollment.';
