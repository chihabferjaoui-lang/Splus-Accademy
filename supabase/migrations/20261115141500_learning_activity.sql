create type public.class_session_status as enum (
  'scheduled',
  'completed',
  'cancelled'
);

create type public.lesson_attendance as enum (
  'not_marked',
  'attended',
  'missed',
  'excused'
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_slot_id uuid not null references public.class_slots (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_url text check (
    meeting_url is null
    or (char_length(meeting_url) <= 2000 and meeting_url ~ '^https://')
  ),
  status public.class_session_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships (id) on delete cascade,
  class_session_id uuid not null references public.class_sessions (id) on delete cascade,
  attendance public.lesson_attendance not null default 'not_marked',
  score smallint check (score is null or score between 0 and 100),
  teacher_notes text not null default '' check (char_length(teacher_notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (membership_id, class_session_id)
);

create index class_sessions_slot_start_idx
  on public.class_sessions (class_slot_id, starts_at);
create index lesson_progress_membership_created_idx
  on public.lesson_progress (membership_id, created_at desc);
create index lesson_progress_session_idx
  on public.lesson_progress (class_session_id);

create function public.validate_lesson_progress_links()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  membership_slot_id uuid;
  session_slot_id uuid;
begin
  select class_slot_id
  into membership_slot_id
  from public.memberships
  where id = new.membership_id;

  select class_slot_id
  into session_slot_id
  from public.class_sessions
  where id = new.class_session_id;

  if membership_slot_id is null or session_slot_id is null then
    raise exception 'Lesson progress must reference an existing membership and class session';
  end if;

  if membership_slot_id <> session_slot_id then
    raise exception 'Lesson progress must match the student membership class slot';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_lesson_progress_links() from public, anon, authenticated;

create trigger validate_lesson_progress_links
  before insert or update of membership_id, class_session_id
  on public.lesson_progress
  for each row execute procedure public.validate_lesson_progress_links();

alter table public.class_sessions enable row level security;
alter table public.lesson_progress enable row level security;

revoke all on public.class_sessions, public.lesson_progress from anon, authenticated;
grant select on public.class_sessions, public.lesson_progress to authenticated;
grant insert, update, delete on public.class_sessions to authenticated;
grant insert, update, delete on public.lesson_progress to authenticated;

create policy "Students read sessions for their active memberships"
  on public.class_sessions for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1
      from public.memberships
      where memberships.student_id = (select auth.uid())
        and memberships.class_slot_id = class_sessions.class_slot_id
        and memberships.status = 'active'
        and memberships.ends_at > now()
    )
  );
create policy "Admins manage class sessions"
  on public.class_sessions for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Students read their own lesson progress"
  on public.lesson_progress for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1
      from public.memberships
      where memberships.id = lesson_progress.membership_id
        and memberships.student_id = (select auth.uid())
    )
  );
create policy "Admins manage lesson progress"
  on public.lesson_progress for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create function public.admin_activity_summary()
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
    (select count(*) from public.orders as order_row
      where order_row.status = 'paid'
        or (order_row.status = 'pending' and order_row.expires_at > now()))::bigint,
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

comment on table public.class_sessions is 'Admin-managed lesson schedule and private meeting links for enrolled class cohorts.';
comment on table public.lesson_progress is 'Attendance, assessment scores, and teacher feedback for a student lesson.';
