alter table public.user_roles
  drop constraint user_roles_role_check,
  add constraint user_roles_role_check
    check (role in ('admin', 'teacher', 'student'));

alter table public.profiles
  add column preferred_locale text not null default 'en'
    check (preferred_locale in ('en', 'fr', 'es', 'pt', 'zh', 'ar'));
grant update (preferred_locale) on public.profiles to authenticated;

create or replace function public.is_admin()
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

create or replace function public.is_teacher()
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
      and role = 'teacher'
  );
$$;

revoke all on function public.is_teacher() from public, anon;
grant execute on function public.is_admin(), public.is_teacher() to authenticated;

create type public.teacher_student_status as enum ('active', 'ended');
create type public.lesson_publication_status as enum ('draft', 'published', 'archived');
create type public.assignment_status as enum ('assigned', 'in_progress', 'completed', 'cancelled');
create type public.invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded');
create type public.payment_method as enum ('cash', 'bank_transfer', 'other', 'online');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type public.message_channel as enum ('in_app', 'email', 'whatsapp');
create type public.delivery_status as enum ('pending', 'sent', 'delivered', 'failed');
create type public.reminder_type as enum ('due_soon', 'overdue');

create table public.teacher_students (
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status public.teacher_student_status not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  primary key (teacher_id, student_id),
  check (teacher_id <> student_id),
  check ((status = 'active' and ended_at is null) or status = 'ended')
);

create index teacher_students_student_idx
  on public.teacher_students (student_id, status);

create function public.can_teacher_access_student(_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as role_row
    join public.teacher_students as link
      on link.teacher_id = role_row.user_id
    where role_row.user_id = (select auth.uid())
      and role_row.role = 'teacher'
      and link.student_id = _student_id
      and link.status = 'active'
  );
$$;

revoke all on function public.can_teacher_access_student(uuid) from public, anon;
grant execute on function public.can_teacher_access_student(uuid) to authenticated;

create table public.student_groups (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now(),
  unique (id, teacher_id)
);

create table public.student_group_members (
  group_id uuid not null,
  teacher_id uuid not null,
  student_id uuid not null references public.profiles (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (group_id, student_id),
  foreign key (group_id, teacher_id)
    references public.student_groups (id, teacher_id) on delete cascade,
  foreign key (teacher_id, student_id)
    references public.teacher_students (teacher_id, student_id) on delete cascade
);

create index student_group_members_student_idx
  on public.student_group_members (student_id);

create sequence public.customer_number_seq start with 1;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_number text not null unique,
  user_id uuid not null unique references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 160),
  address text not null default '' check (char_length(address) <= 1000),
  phone text check (phone is null or char_length(phone) <= 32),
  email text not null check (char_length(email) <= 254),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.assign_customer_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_seq bigint;
begin
  customer_seq := nextval('public.customer_number_seq');
  new.customer_number := 'C-' || case
    when length(customer_seq::text) < 6 then lpad(customer_seq::text, 6, '0')
    else customer_seq::text
  end;
  return new;
end;
$$;

revoke all on function public.assign_customer_number() from public, anon, authenticated;

create trigger assign_customer_number_before_insert
  before insert on public.customers
  for each row execute function public.assign_customer_number();

create index customers_email_idx on public.customers (lower(email));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  channel public.message_channel not null default 'in_app',
  delivery_status public.delivery_status not null default 'pending',
  locale text not null default 'en' check (locale in ('en', 'fr', 'es', 'pt', 'zh', 'ar')),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 2000),
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);
create index notifications_pending_delivery_idx
  on public.notifications (created_at)
  where delivery_status = 'pending' and channel <> 'in_app';

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  level text not null check (char_length(level) between 1 and 64),
  program_id uuid references public.programs (id) on delete set null,
  estimated_duration_minutes integer not null check (estimated_duration_minutes between 1 and 1440),
  status public.lesson_publication_status not null default 'draft',
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lessons_status_program_idx
  on public.lessons (status, program_id, name);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  content jsonb not null default '{}'::jsonb,
  status public.lesson_publication_status not null default 'draft',
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercises_lesson_status_idx on public.exercises (lesson_id, status);

create function public.is_published_lesson(_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.lessons
    where id = _lesson_id and status = 'published'
  );
$$;

create function public.is_published_exercise(_exercise_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.exercises as exercise_row
    join public.lessons as lesson_row on lesson_row.id = exercise_row.lesson_id
    where exercise_row.id = _exercise_id
      and exercise_row.status = 'published'
      and lesson_row.status = 'published'
  );
$$;

revoke all on function public.is_published_lesson(uuid),
  public.is_published_exercise(uuid) from public, anon;
grant execute on function public.is_published_lesson(uuid),
  public.is_published_exercise(uuid) to authenticated;

create table public.assigned_lessons (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete restrict,
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_group_id uuid references public.student_groups (id) on delete set null,
  assigned_by uuid not null references public.profiles (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  due_at timestamptz,
  status public.assignment_status not null default 'assigned',
  completed_at timestamptz,
  score smallint check (score is null or score between 0 and 100),
  teacher_feedback text not null default '' check (char_length(teacher_feedback) <= 4000),
  check (completed_at is null or status = 'completed')
);

create index assigned_lessons_student_status_idx
  on public.assigned_lessons (student_id, status, due_at);
create index assigned_lessons_teacher_created_idx
  on public.assigned_lessons (teacher_id, assigned_at desc);

create table public.assigned_exercises (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  assigned_lesson_id uuid references public.assigned_lessons (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_group_id uuid references public.student_groups (id) on delete set null,
  assigned_by uuid not null references public.profiles (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  due_at timestamptz,
  status public.assignment_status not null default 'assigned',
  completed_at timestamptz,
  score smallint check (score is null or score between 0 and 100),
  teacher_feedback text not null default '' check (char_length(teacher_feedback) <= 4000),
  check (completed_at is null or status = 'completed')
);

create index assigned_exercises_student_status_idx
  on public.assigned_exercises (student_id, status, due_at);
create index assigned_exercises_teacher_created_idx
  on public.assigned_exercises (teacher_id, assigned_at desc);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  customer_id uuid not null references public.customers (id) on delete restrict,
  order_id uuid unique references public.orders (id) on delete restrict,
  membership_id uuid references public.memberships (id) on delete restrict,
  currency text not null default 'MAD' check (currency = 'MAD'),
  total_mad bigint not null check (total_mad > 0),
  issue_date date not null default (now() at time zone 'Africa/Casablanca')::date,
  due_date date,
  status public.invoice_status not null default 'draft',
  notes text not null default '' check (char_length(notes) <= 2000),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date is null or due_date >= issue_date)
);

create sequence public.invoice_number_seq start with 1;

create function public.assign_invoice_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invoice_seq bigint;
begin
  if new.invoice_number is null or new.invoice_number = '' then
    invoice_seq := nextval('public.invoice_number_seq');
    new.invoice_number := 'INV-' || case
      when length(invoice_seq::text) < 6 then lpad(invoice_seq::text, 6, '0')
      else invoice_seq::text
    end;
  end if;
  return new;
end;
$$;

revoke all on function public.assign_invoice_number() from public, anon, authenticated;

create trigger assign_invoice_number_before_insert
  before insert on public.invoices
  for each row execute function public.assign_invoice_number();

create index invoices_customer_created_idx on public.invoices (customer_id, created_at desc);
create index invoices_status_due_date_idx on public.invoices (status, due_date)
  where status in ('sent', 'overdue');

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null check (char_length(description) between 1 and 500),
  quantity integer not null default 1 check (quantity > 0),
  unit_price_mad bigint not null check (unit_price_mad >= 0),
  line_total_mad bigint generated always as (quantity::bigint * unit_price_mad) stored
);

create index invoice_items_invoice_idx on public.invoice_items (invoice_id);

create function public.create_invoice(
  _customer_id uuid,
  _due_date date,
  _items jsonb,
  _notes text default '',
  _order_id uuid default null,
  _membership_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invoice_id uuid;
  invoice_total bigint;
  issue_day date := (now() at time zone 'Africa/Casablanca')::date;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if _items is null or jsonb_typeof(_items) is distinct from 'array' then
    raise exception 'Invoice items must be a JSON array';
  end if;
  if jsonb_array_length(_items) = 0 then
    raise exception 'At least one invoice item is required';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(_items) as item(description text, quantity integer, unit_price_mad bigint)
    where item.description is null
      or char_length(item.description) not between 1 and 500
      or item.quantity is null or item.quantity <= 0
      or item.unit_price_mad is null or item.unit_price_mad < 0
  ) then
    raise exception 'Invoice items have invalid descriptions, quantities, or prices';
  end if;
  if not exists (select 1 from public.customers where id = _customer_id) then
    raise exception 'Customer does not exist';
  end if;
  if _due_date is not null and _due_date < issue_day then
    raise exception 'Due date cannot precede the issue date';
  end if;
  if _order_id is not null and not exists (
    select 1 from public.orders
    join public.customers on customers.user_id = orders.student_id
    where orders.id = _order_id and customers.id = _customer_id
  ) then
    raise exception 'Order does not belong to this customer';
  end if;
  if _membership_id is not null and not exists (
    select 1 from public.memberships
    join public.customers on customers.user_id = memberships.student_id
    where memberships.id = _membership_id and customers.id = _customer_id
  ) then
    raise exception 'Membership does not belong to this customer';
  end if;

  select sum(item.quantity::bigint * item.unit_price_mad)
  into invoice_total
  from jsonb_to_recordset(_items) as item(
    description text, quantity integer, unit_price_mad bigint
  );
  if invoice_total is null or invoice_total <= 0 then
    raise exception 'Invoice total must be greater than zero';
  end if;

  insert into public.invoices (
    invoice_number, customer_id, order_id, membership_id, total_mad,
    issue_date, due_date, status, notes, created_by
  )
  values (
    '', _customer_id, _order_id, _membership_id, invoice_total,
    issue_day, _due_date, 'draft', coalesce(_notes, ''), (select auth.uid())
  )
  returning id into invoice_id;

  insert into public.invoice_items (
    invoice_id, description, quantity, unit_price_mad
  )
  select invoice_id, item.description, item.quantity, item.unit_price_mad
  from jsonb_to_recordset(_items) as item(
    description text, quantity integer, unit_price_mad bigint
  );
  return invoice_id;
end;
$$;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  method public.payment_method not null,
  status public.payment_status not null default 'succeeded',
  amount_mad bigint not null check (amount_mad > 0),
  currency text not null default 'MAD' check (currency = 'MAD'),
  provider text,
  provider_payment_id text,
  received_at timestamptz not null default now(),
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

create index payments_invoice_created_idx on public.payments (invoice_id, created_at desc);

create function public.record_manual_payment(
  _invoice_id uuid,
  _method public.payment_method,
  _amount_mad bigint,
  _received_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invoice_total bigint;
  invoice_state public.invoice_status;
  paid_so_far bigint;
  payment_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if _method not in ('cash', 'bank_transfer', 'other') or _amount_mad <= 0 then
    raise exception 'Manual payments require a valid method and positive amount';
  end if;

  select total_mad, status
    into invoice_total, invoice_state
  from public.invoices
  where id = _invoice_id
  for update;
  if not found or invoice_state not in ('sent', 'overdue') then
    raise exception 'Invoice not found or not payable';
  end if;

  select coalesce(sum(amount_mad), 0)
    into paid_so_far
  from public.payments
  where invoice_id = _invoice_id and status = 'succeeded';
  if _amount_mad > invoice_total - paid_so_far then
    raise exception 'Payment exceeds the invoice balance';
  end if;

  insert into public.payments (
    invoice_id, method, status, amount_mad, currency, received_at, recorded_by
  )
  values (
    _invoice_id, _method, 'succeeded', _amount_mad, 'MAD',
    coalesce(_received_at, now()), (select auth.uid())
  )
  returning id into payment_id;

  if paid_so_far + _amount_mad = invoice_total then
    update public.invoices
    set status = 'paid', updated_at = now()
    where id = _invoice_id;
  end if;
  return payment_id;
end;
$$;

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  reminder_kind public.reminder_type not null,
  channel public.message_channel not null default 'email',
  delivery_status public.delivery_status not null default 'pending',
  locale text not null default 'en' check (locale in ('en', 'fr', 'es', 'pt', 'zh', 'ar')),
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text check (last_error is null or char_length(last_error) <= 2000),
  created_at timestamptz not null default now(),
  unique (invoice_id, reminder_kind)
);

create index reminders_pending_idx on public.reminders (scheduled_at)
  where delivery_status = 'pending';

create table public.teacher_availability (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  timezone text not null default 'Africa/Casablanca'
    check (char_length(timezone) between 1 and 80),
  effective_from date not null default current_date,
  effective_until date,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (effective_until is null or effective_until >= effective_from)
);

create index teacher_availability_teacher_weekday_idx
  on public.teacher_availability (teacher_id, weekday, effective_from);

alter table public.class_sessions
  add column teacher_id uuid references public.profiles (id) on delete restrict;

create index class_sessions_teacher_start_idx
  on public.class_sessions (teacher_id, starts_at)
  where teacher_id is not null;

create table public.class_session_students (
  class_session_id uuid not null references public.class_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (class_session_id, student_id)
);

create index class_session_students_student_idx
  on public.class_session_students (student_id, class_session_id);

create table public.teacher_timesheets (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references public.class_sessions (id) on delete restrict,
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  hours_worked numeric(5,2) not null check (hours_worked > 0 and hours_worked <= 24),
  notes text not null default '' check (char_length(notes) <= 2000),
  approved_by uuid references public.profiles (id) on delete restrict,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_session_id, teacher_id),
  check ((approved_by is null) = (approved_at is null))
);

create index teacher_timesheets_teacher_created_idx
  on public.teacher_timesheets (teacher_id, created_at desc);

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.touch_updated_at() from public, anon, authenticated;

create trigger customers_touch_updated_at
  before update on public.customers
  for each row execute function public.touch_updated_at();
create trigger lessons_touch_updated_at
  before update on public.lessons
  for each row execute function public.touch_updated_at();
create trigger exercises_touch_updated_at
  before update on public.exercises
  for each row execute function public.touch_updated_at();
create trigger assigned_lessons_touch_updated_at
  before update on public.assigned_lessons
  for each row execute function public.touch_updated_at();
create trigger assigned_exercises_touch_updated_at
  before update on public.assigned_exercises
  for each row execute function public.touch_updated_at();
create trigger invoices_touch_updated_at
  before update on public.invoices
  for each row execute function public.touch_updated_at();
create trigger teacher_timesheets_touch_updated_at
  before update on public.teacher_timesheets
  for each row execute function public.touch_updated_at();

create function public.can_teacher_manage_session_student(_session_id uuid, _student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.class_sessions as session_row
    join public.user_roles as teacher_role
      on teacher_role.user_id = session_row.teacher_id
      and teacher_role.role = 'teacher'
    join public.teacher_students as link
      on link.teacher_id = session_row.teacher_id
      and link.student_id = _student_id
      and link.status = 'active'
    where session_row.id = _session_id
      and session_row.teacher_id = (select auth.uid())
  );
$$;

create function public.can_teacher_manage_progress(_membership_id uuid, _session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships as membership
    where membership.id = _membership_id
      and public.can_teacher_manage_session_student(_session_id, membership.student_id)
  );
$$;

create function public.validate_class_session_teacher()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  session_student_id uuid;
begin
  if new.teacher_id is not null then
    if not exists (
      select 1 from public.user_roles
      where user_id = new.teacher_id and role = 'teacher'
    ) then
      raise exception 'A class session must be assigned to a teacher';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('teacher:' || new.teacher_id::text, 0)
    );

    for session_student_id in
      select student_id
      from public.class_session_students
      where class_session_id = new.id
      order by student_id
    loop
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended('student:' || session_student_id::text, 0)
      );
    end loop;

    if new.status = 'scheduled' and exists (
      select 1
      from public.class_sessions as other_session
      where other_session.teacher_id = new.teacher_id
        and other_session.status = 'scheduled'
        and other_session.id <> new.id
        and tstzrange(other_session.starts_at, other_session.ends_at, '[)')
            && tstzrange(new.starts_at, new.ends_at, '[)')
    ) then
      raise exception 'Teacher already has an overlapping scheduled session'
        using errcode = '23P01';
    end if;

    if new.status = 'scheduled' and exists (
      select 1
      from public.class_session_students as current_student
      join public.class_session_students as other_student
        on other_student.student_id = current_student.student_id
        and other_student.class_session_id <> new.id
      join public.class_sessions as other_session
        on other_session.id = other_student.class_session_id
      where current_student.class_session_id = new.id
        and other_session.status = 'scheduled'
        and tstzrange(other_session.starts_at, other_session.ends_at, '[)')
            && tstzrange(new.starts_at, new.ends_at, '[)')
    ) then
      raise exception 'Student already has an overlapping scheduled session'
        using errcode = '23P01';
    end if;
  end if;
  return new;
end;
$$;

create trigger validate_class_session_teacher_before_write
  before insert or update of teacher_id, starts_at, ends_at, status
  on public.class_sessions
  for each row execute function public.validate_class_session_teacher();

create function public.validate_class_session_student()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  session_teacher_id uuid;
  session_status public.class_session_status;
  session_starts_at timestamptz;
  session_ends_at timestamptz;
begin
  select teacher_id, status, starts_at, ends_at
    into session_teacher_id, session_status, session_starts_at, session_ends_at
  from public.class_sessions
  where id = new.class_session_id;

  if session_teacher_id is null or session_status is null then
    raise exception 'Class session must have an assigned teacher';
  end if;
  if not exists (
    select 1 from public.teacher_students
    where teacher_id = session_teacher_id
      and student_id = new.student_id
      and status = 'active'
  ) then
    raise exception 'Student is not assigned to this teacher';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('student:' || new.student_id::text, 0)
  );

  if session_status = 'scheduled' and exists (
    select 1
    from public.class_session_students as other_student
    join public.class_sessions as other_session
      on other_session.id = other_student.class_session_id
    where other_student.student_id = new.student_id
      and other_student.class_session_id <> new.class_session_id
      and other_session.status = 'scheduled'
      and tstzrange(other_session.starts_at, other_session.ends_at, '[)')
          && tstzrange(session_starts_at, session_ends_at, '[)')
  ) then
    raise exception 'Student already has an overlapping scheduled session'
      using errcode = '23P01';
  end if;
  return new;
end;
$$;

create trigger validate_class_session_student_before_write
  before insert or update of class_session_id, student_id
  on public.class_session_students
  for each row execute function public.validate_class_session_student();

create function public.validate_timesheet_session()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.class_sessions
    where id = new.class_session_id and teacher_id = new.teacher_id
  ) then
    raise exception 'Timesheet teacher must own the class session';
  end if;
  return new;
end;
$$;

create trigger validate_timesheet_session_before_write
  before insert or update of class_session_id, teacher_id
  on public.teacher_timesheets
  for each row execute function public.validate_timesheet_session();

create function public.notify_assigned_lesson()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lesson_name text;
  duration_minutes integer;
  student_locale text;
  notification_title text;
  notification_body text;
begin
  select lesson.name, lesson.estimated_duration_minutes, profile.preferred_locale
    into lesson_name, duration_minutes, student_locale
  from public.lessons as lesson
  join public.profiles as profile on profile.id = new.student_id
  where lesson.id = new.lesson_id;

  case student_locale
    when 'fr' then
      notification_title := 'Nouvelle leçon : ' || lesson_name;
      notification_body := 'Une leçon vous a été attribuée. Durée estimée : '
        || duration_minutes::text || ' minutes.';
    when 'es' then
      notification_title := 'Nueva lección: ' || lesson_name;
      notification_body := 'Se te ha asignado una lección. Duración estimada: '
        || duration_minutes::text || ' minutos.';
    when 'pt' then
      notification_title := 'Nova lição: ' || lesson_name;
      notification_body := 'Foi atribuída uma lição a você. Duração estimada: '
        || duration_minutes::text || ' minutos.';
    when 'zh' then
      notification_title := '新课程：' || lesson_name;
      notification_body := '你收到了一节新课程。预计时长：'
        || duration_minutes::text || ' 分钟。';
    when 'ar' then
      notification_title := 'درس جديد: ' || lesson_name;
      notification_body := 'تم تعيين درس لك. المدة المقدرة: '
        || duration_minutes::text || ' دقيقة.';
    else
      notification_title := 'New lesson: ' || lesson_name;
      notification_body := 'A lesson has been assigned to you. Estimated duration: '
        || duration_minutes::text || ' minutes.';
  end case;

  insert into public.notifications (
    recipient_id, actor_id, channel, delivery_status, locale, title, body, sent_at
  )
  values (
    new.student_id,
    new.assigned_by,
    'in_app',
    'sent',
    student_locale,
    notification_title,
    notification_body,
    now()
  );
  return new;
end;
$$;

create trigger assigned_lesson_notification_after_insert
  after insert on public.assigned_lessons
  for each row execute function public.notify_assigned_lesson();

create function public.assign_lesson_to_group(
  _lesson_id uuid,
  _group_id uuid,
  _due_at timestamptz default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  group_teacher_id uuid;
  inserted_count integer;
begin
  select teacher_id into group_teacher_id
  from public.student_groups
  where id = _group_id;

  if group_teacher_id is null
    or not exists (
      select 1 from public.user_roles
      where user_id = group_teacher_id and role = 'teacher'
    )
    or (not public.is_admin() and group_teacher_id <> (select auth.uid())) then
    raise exception 'Teacher cannot assign to this group' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.lessons
    where id = _lesson_id and status = 'published'
  ) then
    raise exception 'Lesson must be published before assignment';
  end if;
  if not exists (
    select 1 from public.student_group_members
    where group_id = _group_id
  ) or exists (
    select 1
    from public.student_group_members as member
    where member.group_id = _group_id
      and not exists (
        select 1 from public.teacher_students as link
        where link.teacher_id = group_teacher_id
          and link.student_id = member.student_id
          and link.status = 'active'
      )
  ) then
    raise exception 'Group must contain students assigned to its teacher';
  end if;

  insert into public.assigned_lessons (
    lesson_id, teacher_id, student_id, student_group_id, assigned_by, due_at
  )
  select _lesson_id, group_teacher_id, member.student_id, _group_id,
    (select auth.uid()), _due_at
  from public.student_group_members as member
  where member.group_id = _group_id;
  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

create function public.assign_exercise_to_group(
  _exercise_id uuid,
  _group_id uuid,
  _due_at timestamptz default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  group_teacher_id uuid;
  inserted_count integer;
begin
  select teacher_id into group_teacher_id
  from public.student_groups
  where id = _group_id;

  if group_teacher_id is null
    or not exists (
      select 1 from public.user_roles
      where user_id = group_teacher_id and role = 'teacher'
    )
    or (not public.is_admin() and group_teacher_id <> (select auth.uid())) then
    raise exception 'Teacher cannot assign to this group' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.exercises as exercise_row
    join public.lessons as lesson_row on lesson_row.id = exercise_row.lesson_id
    where exercise_row.id = _exercise_id
      and exercise_row.status = 'published'
      and lesson_row.status = 'published'
  ) then
    raise exception 'Exercise and its lesson must be published before assignment';
  end if;
  if not exists (
    select 1 from public.student_group_members
    where group_id = _group_id
  ) or exists (
    select 1
    from public.student_group_members as member
    where member.group_id = _group_id
      and not exists (
        select 1 from public.teacher_students as link
        where link.teacher_id = group_teacher_id
          and link.student_id = member.student_id
          and link.status = 'active'
      )
  ) then
    raise exception 'Group must contain students assigned to its teacher';
  end if;

  insert into public.assigned_exercises (
    exercise_id, teacher_id, student_id, student_group_id, assigned_by, due_at
  )
  select _exercise_id, group_teacher_id, member.student_id, _group_id,
    (select auth.uid()), _due_at
  from public.student_group_members as member
  where member.group_id = _group_id;
  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

create function public.complete_assigned_lesson(_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.assigned_lessons
  set status = 'completed', completed_at = now()
  where id = _assignment_id
    and student_id = (select auth.uid())
    and status in ('assigned', 'in_progress');
  if not found then
    raise exception 'Assignment not found or cannot be completed'
      using errcode = '42501';
  end if;
end;
$$;

create function public.complete_assigned_exercise(_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.assigned_exercises
  set status = 'completed', completed_at = now()
  where id = _assignment_id
    and student_id = (select auth.uid())
    and status in ('assigned', 'in_progress');
  if not found then
    raise exception 'Assignment not found or cannot be completed'
      using errcode = '42501';
  end if;
end;
$$;

create function public.process_invoice_due_dates()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_count integer;
  morocco_today date := (now() at time zone 'Africa/Casablanca')::date;
begin
  update public.invoices
  set status = 'overdue', updated_at = now()
  where status = 'sent' and due_date < morocco_today;
  get diagnostics changed_count = row_count;

  insert into public.reminders (
    invoice_id, customer_id, reminder_kind, channel, locale
  )
  select invoice_row.id, invoice_row.customer_id, 'due_soon', 'email',
    profile.preferred_locale
  from public.invoices as invoice_row
  join public.customers as customer on customer.id = invoice_row.customer_id
  join public.profiles as profile on profile.id = customer.user_id
  where invoice_row.status = 'sent'
    and invoice_row.due_date between morocco_today and morocco_today + 3
  on conflict (invoice_id, reminder_kind) do nothing;

  insert into public.reminders (
    invoice_id, customer_id, reminder_kind, channel, locale
  )
  select invoice_row.id, invoice_row.customer_id, 'overdue', 'email',
    profile.preferred_locale
  from public.invoices as invoice_row
  join public.customers as customer on customer.id = invoice_row.customer_id
  join public.profiles as profile on profile.id = customer.user_id
  where invoice_row.status = 'overdue'
  on conflict (invoice_id, reminder_kind) do nothing;
  return changed_count;
end;
$$;

revoke all on function public.can_teacher_manage_session_student(uuid, uuid),
  public.can_teacher_manage_progress(uuid, uuid),
  public.assign_lesson_to_group(uuid, uuid, timestamptz),
  public.assign_exercise_to_group(uuid, uuid, timestamptz),
  public.create_invoice(uuid, date, jsonb, text, uuid, uuid),
  public.record_manual_payment(uuid, public.payment_method, bigint, timestamptz),
  public.complete_assigned_lesson(uuid), public.complete_assigned_exercise(uuid),
  public.process_invoice_due_dates() from public, anon;
grant execute on function public.can_teacher_manage_session_student(uuid, uuid),
  public.can_teacher_manage_progress(uuid, uuid),
  public.assign_lesson_to_group(uuid, uuid, timestamptz),
  public.assign_exercise_to_group(uuid, uuid, timestamptz),
  public.create_invoice(uuid, date, jsonb, text, uuid, uuid),
  public.record_manual_payment(uuid, public.payment_method, bigint, timestamptz),
  public.complete_assigned_lesson(uuid), public.complete_assigned_exercise(uuid)
  to authenticated;
grant execute on function public.process_invoice_due_dates() to service_role;

revoke all on public.teacher_students, public.student_groups, public.student_group_members,
  public.customers, public.notifications, public.lessons, public.exercises,
  public.assigned_lessons, public.assigned_exercises, public.invoices, public.invoice_items,
  public.payments, public.reminders, public.teacher_availability,
  public.class_session_students, public.teacher_timesheets
  from anon, authenticated;

grant select, insert, update, delete on public.teacher_students to authenticated;
grant select on public.student_groups, public.student_group_members
  to authenticated;
grant insert, update, delete on public.student_groups, public.student_group_members
  to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant select, insert, update, delete on public.lessons, public.exercises to authenticated;
grant select, insert, update, delete on public.assigned_lessons, public.assigned_exercises
  to authenticated;
grant select, insert, update, delete on public.invoices, public.invoice_items, public.payments
  to authenticated;
grant select, insert, update, delete on public.reminders to authenticated;
grant select, insert, update, delete on public.teacher_availability to authenticated;
grant select, insert, update, delete on public.class_session_students to authenticated;
grant select, insert, update, delete on public.teacher_timesheets to authenticated;
grant select, insert, update, delete on public.class_sessions to authenticated;
grant select, insert, update, delete on public.lesson_progress to authenticated;
grant insert, delete on public.user_roles to authenticated;

alter table public.teacher_students enable row level security;
alter table public.student_groups enable row level security;
alter table public.student_group_members enable row level security;
alter table public.customers enable row level security;
alter table public.notifications enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.assigned_lessons enable row level security;
alter table public.assigned_exercises enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.reminders enable row level security;
alter table public.teacher_availability enable row level security;
alter table public.class_session_students enable row level security;
alter table public.teacher_timesheets enable row level security;

create policy "Admins and participants read teacher student links"
  on public.teacher_students for select to authenticated
  using (
    (select public.is_admin())
    or teacher_id = (select auth.uid())
    or student_id = (select auth.uid())
  );
create policy "Admins manage teacher student links"
  on public.teacher_students for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins read roles" on public.user_roles;
create policy "Admins and users read roles"
  on public.user_roles for select to authenticated
  using ((select public.is_admin()) or user_id = (select auth.uid()));
create policy "Admins manage roles"
  on public.user_roles for insert, delete to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins manage profile fields"
  on public.profiles for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins and group teachers read groups"
  on public.student_groups for select to authenticated
  using ((select public.is_admin()) or teacher_id = (select auth.uid()));
create policy "Admins and group teachers manage groups"
  on public.student_groups for all to authenticated
  using ((select public.is_admin()) or (teacher_id = (select auth.uid()) and (select public.is_teacher())))
  with check ((select public.is_admin()) or (teacher_id = (select auth.uid()) and (select public.is_teacher())));

create policy "Admins teachers and students read group members"
  on public.student_group_members for select to authenticated
  using (
    (select public.is_admin())
    or student_id = (select auth.uid())
    or teacher_id = (select auth.uid())
  );
create policy "Admins and group teachers manage members"
  on public.student_group_members for all to authenticated
  using (
    (select public.is_admin())
    or (teacher_id = (select auth.uid()) and (select public.is_teacher()))
  )
  with check (
    (select public.is_admin())
    or (
      teacher_id = (select auth.uid())
      and (select public.is_teacher())
      and (select public.can_teacher_access_student(student_id))
    )
  );

create policy "Admins manage customers"
  on public.customers for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Students read own customer record"
  on public.customers for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Recipients and admins read notifications"
  on public.notifications for select to authenticated
  using ((select public.is_admin()) or recipient_id = (select auth.uid()));
create policy "Students mark own notifications read"
  on public.notifications for update to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));
create policy "Admins and teachers create student notifications"
  on public.notifications for insert to authenticated
  with check (
    (select public.is_admin())
    or (
      actor_id = (select auth.uid())
      and channel = 'in_app'
      and (select public.can_teacher_access_student(recipient_id))
    )
  );
create policy "Admins read all notifications"
  on public.notifications for select to authenticated
  using ((select public.is_admin()));

create policy "Students read own groups"
  on public.student_groups for select to authenticated
  using (
    exists (
      select 1 from public.student_group_members
      where student_group_members.group_id = student_groups.id
        and student_group_members.student_id = (select auth.uid())
    )
  );

create policy "Admins manage lesson library"
  on public.lessons for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Teachers and assigned students read lessons"
  on public.lessons for select to authenticated
  using (
    status = 'published'
    and (
      (select public.is_teacher())
      or exists (
        select 1 from public.assigned_lessons
        where assigned_lessons.lesson_id = lessons.id
          and assigned_lessons.student_id = (select auth.uid())
          and assigned_lessons.status <> 'cancelled'
      )
    )
  );

create policy "Admins manage library exercises"
  on public.exercises for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Teachers and assigned students read exercises"
  on public.exercises for select to authenticated
  using (
    status = 'published'
    and (
      (select public.is_teacher())
      or exists (
        select 1 from public.assigned_exercises
        where assigned_exercises.exercise_id = exercises.id
          and assigned_exercises.student_id = (select auth.uid())
          and assigned_exercises.status <> 'cancelled'
      )
    )
  );

create policy "Admins manage lesson assignments"
  on public.assigned_lessons for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Teachers manage assignments for own students"
  on public.assigned_lessons for all to authenticated
  using (
    teacher_id = (select auth.uid())
    and (select public.is_teacher())
    and (select public.can_teacher_access_student(student_id))
  )
  with check (
    teacher_id = (select auth.uid())
    and assigned_by = (select auth.uid())
    and (select public.is_teacher())
    and (select public.can_teacher_access_student(student_id))
    and (select public.is_published_lesson(lesson_id))
    and (
      student_group_id is null
      or exists (
        select 1 from public.student_group_members as member
        where member.group_id = assigned_lessons.student_group_id
          and member.teacher_id = assigned_lessons.teacher_id
          and member.student_id = assigned_lessons.student_id
      )
    )
  );
create policy "Students read own lesson assignments"
  on public.assigned_lessons for select to authenticated
  using (student_id = (select auth.uid()));

create policy "Admins manage exercise assignments"
  on public.assigned_exercises for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Teachers manage exercise assignments for own students"
  on public.assigned_exercises for all to authenticated
  using (
    teacher_id = (select auth.uid())
    and (select public.is_teacher())
    and (select public.can_teacher_access_student(student_id))
  )
  with check (
    teacher_id = (select auth.uid())
    and assigned_by = (select auth.uid())
    and (select public.is_teacher())
    and (select public.can_teacher_access_student(student_id))
    and (select public.is_published_exercise(exercise_id))
    and (
      student_group_id is null
      or exists (
        select 1 from public.student_group_members as member
        where member.group_id = assigned_exercises.student_group_id
          and member.teacher_id = assigned_exercises.teacher_id
          and member.student_id = assigned_exercises.student_id
      )
    )
    and (
      assigned_lesson_id is null
      or exists (
        select 1 from public.assigned_lessons as lesson_assignment
        where lesson_assignment.id = assigned_exercises.assigned_lesson_id
          and lesson_assignment.teacher_id = assigned_exercises.teacher_id
          and lesson_assignment.student_id = assigned_exercises.student_id
      )
    )
  );
create policy "Students read own exercise assignments"
  on public.assigned_exercises for select to authenticated
  using (student_id = (select auth.uid()));

create policy "Admins manage invoices"
  on public.invoices for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Students read own invoices"
  on public.invoices for select to authenticated
  using (
    exists (
      select 1 from public.customers
      where customers.id = invoices.customer_id
        and customers.user_id = (select auth.uid())
    )
  );
create policy "Admins manage invoice items"
  on public.invoice_items for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Students read own invoice items"
  on public.invoice_items for select to authenticated
  using (
    exists (
      select 1 from public.invoices
      join public.customers on customers.id = invoices.customer_id
      where invoices.id = invoice_items.invoice_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "Admins manage payments"
  on public.payments for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Students read own payments"
  on public.payments for select to authenticated
  using (
    exists (
      select 1 from public.invoices
      join public.customers on customers.id = invoices.customer_id
      where invoices.id = payments.invoice_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "Admins manage reminders"
  on public.reminders for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Customers read own reminders"
  on public.reminders for select to authenticated
  using (
    exists (
      select 1 from public.customers
      where customers.id = reminders.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "Admins manage teacher availability"
  on public.teacher_availability for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Teachers manage own availability"
  on public.teacher_availability for all to authenticated
  using (teacher_id = (select auth.uid()) and (select public.is_teacher()))
  with check (teacher_id = (select auth.uid()) and (select public.is_teacher()));
create policy "Students view assigned teacher availability"
  on public.teacher_availability for select to authenticated
  using (
    exists (
      select 1 from public.teacher_students
      where teacher_students.teacher_id = teacher_availability.teacher_id
        and teacher_students.student_id = (select auth.uid())
        and teacher_students.status = 'active'
    )
  );

drop policy if exists "Students read sessions for their active memberships"
  on public.class_sessions;
drop policy if exists "Admins manage class sessions" on public.class_sessions;
create policy "Participants read class sessions"
  on public.class_sessions for select to authenticated
  using (
    (select public.is_admin())
    or teacher_id = (select auth.uid())
    or exists (
      select 1 from public.class_session_students
      where class_session_students.class_session_id = class_sessions.id
        and class_session_students.student_id = (select auth.uid())
    )
    or exists (
      select 1 from public.memberships
      where memberships.student_id = (select auth.uid())
        and memberships.class_slot_id = class_sessions.class_slot_id
        and memberships.status = 'active'
        and memberships.ends_at > now()
    )
  );
create policy "Admins manage class sessions"
  on public.class_sessions for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Teachers manage own class sessions"
  on public.class_sessions for all to authenticated
  using (teacher_id = (select auth.uid()) and (select public.is_teacher()))
  with check (
    teacher_id = (select auth.uid())
    and (select public.is_teacher())
    and exists (
      select 1 from public.class_slots
      where class_slots.id = class_slot_id and class_slots.active
    )
  );

create policy "Participants read session students"
  on public.class_session_students for select to authenticated
  using (
    (select public.is_admin())
    or student_id = (select auth.uid())
    or (select public.can_teacher_manage_session_student(class_session_id, student_id))
  );
create policy "Admins manage session students"
  on public.class_session_students for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Teachers manage own session students"
  on public.class_session_students for all to authenticated
  using (
    exists (
      select 1 from public.class_sessions
      where class_sessions.id = class_session_students.class_session_id
        and class_sessions.teacher_id = (select auth.uid())
    )
  )
  with check ((select public.can_teacher_manage_session_student(class_session_id, student_id)));

drop policy if exists "Admins manage lesson progress" on public.lesson_progress;
create policy "Admins manage lesson progress"
  on public.lesson_progress for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Teachers manage progress for own session students"
  on public.lesson_progress for all to authenticated
  using ((select public.can_teacher_manage_progress(membership_id, class_session_id)))
  with check ((select public.can_teacher_manage_progress(membership_id, class_session_id)));

create policy "Admins manage timesheets"
  on public.teacher_timesheets for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Teachers read own timesheets"
  on public.teacher_timesheets for select to authenticated
  using (teacher_id = (select auth.uid()) and (select public.is_teacher()));
create policy "Teachers submit unapproved own timesheets"
  on public.teacher_timesheets for insert to authenticated
  with check (
    teacher_id = (select auth.uid())
    and (select public.is_teacher())
    and approved_by is null
    and approved_at is null
    and exists (
      select 1 from public.class_sessions
      where class_sessions.id = class_session_id
        and class_sessions.teacher_id = (select auth.uid())
    )
  );
create policy "Teachers update unapproved own timesheets"
  on public.teacher_timesheets for update to authenticated
  using (
    teacher_id = (select auth.uid())
    and (select public.is_teacher())
    and approved_at is null
  )
  with check (
    teacher_id = (select auth.uid())
    and approved_at is null
    and (select public.is_teacher())
  );

create policy "Teachers read assigned student profiles"
  on public.profiles for select to authenticated
  using ((select public.can_teacher_access_student(id)));

comment on table public.teacher_students is
  'Admin-managed teacher/student authorization links; teachers see only active linked students.';
comment on table public.customers is
  'Internal billing customer records; customer numbers are generated from a sequence.';
comment on table public.invoices is
  'Internal MAD invoices. Legacy orders can be linked one-to-one; webhook event rows remain the payment callback deduplication log.';
comment on table public.payments is
  'Manual cash/bank-transfer records initially; provider fields support a later online payment adapter.';
comment on table public.class_sessions is
  'Scheduled UTC sessions; teacher_id is nullable only for legacy sessions created before Kronos.';
comment on table public.lessons is
  'Admin-managed Genius source library. Assignments are stored separately and never mutate library content.';
comment on table public.notifications is
  'Per-recipient in-app or future external notifications; unread in-app items have read_at null.';
