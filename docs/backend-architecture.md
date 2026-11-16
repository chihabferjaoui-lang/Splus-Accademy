# S+ Academy Backend Architecture

## 1. Recommended stack

The website is currently static and uses Supabase for authentication and PostgreSQL-backed features. This design builds on that foundation:

- **API:** TypeScript with NestJS, split into identity, lessons, assignments, billing, scheduling, and integration modules.
- **Database:** PostgreSQL, hosted on Supabase or another managed PostgreSQL provider.
- **Authentication:** Retain Supabase Auth; the API validates its JWTs. Browser clients do not perform privileged mutations directly against the database.
- **Background jobs:** Redis with BullMQ workers for integrations, notifications, and retryable jobs.
- **API contract:** REST under `/v1`, documented with OpenAPI.
- **File storage:** Managed object storage for lesson media and attachments; store metadata and object keys, not file contents, in PostgreSQL.

NestJS and BullMQ add services to operate. If minimizing infrastructure is the priority, Supabase Edge Functions can implement the API and background work initially, using the same database and event patterns.

## 2. Database design

Use `auth.users` as the authentication identity source. The tables below live in the application schema. Use UUID primary keys, `timestamptz` timestamps, foreign keys, and indexes for ownership, status, and time-based queries.

### Users, roles, and teacher-student ownership

```text
profiles
  user_id       PK, FK -> auth.users.id
  full_name
  status        active | suspended
  created_at
  updated_at

user_roles
  user_id       FK -> profiles.user_id
  role          admin | teacher | student
  granted_by    FK -> profiles.user_id, nullable
  granted_at
  PK (user_id, role)

teacher_students
  teacher_id    FK -> profiles.user_id
  student_id    FK -> profiles.user_id
  status        active | ended
  started_at
  ended_at
  PK (teacher_id, student_id)

student_groups
  id            PK
  teacher_id    FK -> profiles.user_id
  name
  created_at

student_group_members
  group_id      FK -> student_groups.id
  student_id    FK -> profiles.user_id
  added_at
  PK (group_id, student_id)
```

Never grant `admin` through public signup. Role assignment must use a trusted administrative process. Every teacher-facing query must verify the teacher-student relationship, not merely that the requester has the `teacher` role. Enforce that a group’s teacher is authorized to manage each member.

### Central lesson library

Keep admin-authored source content separate from teacher-created student assignments. Published versions should be immutable so existing assignments continue to refer to the content the teacher selected.

```text
lessons
  id            PK
  title
  description
  status        draft | published | archived
  created_by    FK -> profiles.user_id
  created_at
  updated_at

lesson_versions
  id            PK
  lesson_id     FK -> lessons.id
  version_no
  content       JSONB
  published_at
  created_by    FK -> profiles.user_id
  UNIQUE (lesson_id, version_no)

exercises
  id            PK
  title
  status        draft | published | archived
  created_by    FK -> profiles.user_id

exercise_versions
  id            PK
  exercise_id   FK -> exercises.id
  version_no
  exercise_type
  content       JSONB
  answer_key    JSONB, restricted to grading services/authorized roles
  published_at
  UNIQUE (exercise_id, version_no)

lesson_version_exercises
  lesson_version_id   FK -> lesson_versions.id
  exercise_version_id FK -> exercise_versions.id
  position
  PK (lesson_version_id, exercise_version_id)
  UNIQUE (lesson_version_id, position)
```

Use `JSONB` for versioned, type-specific exercise payloads; keep searchable and relational fields in normal columns. Do not return answer keys in student content responses.

### Teacher assignments and student progress

A group assignment expands into per-student assignment rows in one database transaction. This freezes the recipient list and gives each student independent progress, even if group membership changes later.

```text
assignment_batches
  id              PK
  teacher_id      FK -> profiles.user_id
  source_group_id FK -> student_groups.id, nullable
  created_at

assigned_lessons
  id                  PK
  batch_id            FK -> assignment_batches.id, nullable
  teacher_id          FK -> profiles.user_id
  student_id          FK -> profiles.user_id
  lesson_version_id   FK -> lesson_versions.id
  assigned_at
  due_at              nullable
  status              assigned | in_progress | completed | cancelled
  UNIQUE (batch_id, student_id, lesson_version_id)

assigned_exercises
  id                    PK
  assigned_lesson_id    FK -> assigned_lessons.id, nullable
  teacher_id            FK -> profiles.user_id
  student_id             FK -> profiles.user_id
  exercise_version_id    FK -> exercise_versions.id
  assigned_at
  due_at                 nullable
  status                 assigned | in_progress | completed | cancelled

exercise_attempts
  id                    PK
  assigned_exercise_id  FK -> assigned_exercises.id
  student_id             FK -> profiles.user_id
  attempt_no
  response               JSONB
  score                  nullable
  feedback               nullable
  started_at
  submitted_at           nullable
  graded_at              nullable
  UNIQUE (assigned_exercise_id, attempt_no)

progress_events
  id                    PK
  student_id             FK -> profiles.user_id
  assigned_lesson_id    FK -> assigned_lessons.id, nullable
  assigned_exercise_id  FK -> assigned_exercises.id, nullable
  event_type             -- opened, submitted, completed, etc.
  payload                JSONB
  occurred_at
```

`assigned_exercises` supports standalone exercise assignments as well as exercises under an assigned lesson. Validate that the selected library version is published and that the teacher owns the student relationship before creating assignments. Store progress as attempts and events; derive dashboard summaries from those records or maintain a rebuildable aggregate if query volume warrants it.

### Enrollments, packages, invoices, and payment status

```text
packages
  id              PK
  name
  price_minor     -- integer in currency minor units
  currency        -- ISO currency code
  duration_days
  status          active | inactive

enrollments
  id              PK
  student_id      FK -> profiles.user_id
  package_id      FK -> packages.id, nullable
  status          pending_payment | active | expired | cancelled
  starts_at       nullable
  ends_at         nullable
  created_at

invoices
  id                PK
  student_id        FK -> profiles.user_id
  enrollment_id     FK -> enrollments.id, nullable
  package_id        FK -> packages.id, nullable
  provider          -- era
  provider_invoice_id nullable
  idempotency_key   UNIQUE
  amount_minor
  currency
  status            pending | issued | paid | failed | void | refunded
  due_at            nullable
  issued_at         nullable
  paid_at           nullable
  created_at

payments
  id                   PK
  invoice_id           FK -> invoices.id
  provider_payment_id  nullable
  amount_minor
  currency
  status               pending | succeeded | failed | refunded
  occurred_at          nullable
```

Use a unique invoice idempotency key based on the source event, such as `enrollment:<id>` or `package_purchase:<id>`. A confirmed enrollment or package purchase creates the local invoice/payment intent and an outbox event in the same transaction. The Era worker issues the invoice and records its external ID. A verified Era webhook updates payment status; only the backend’s payment state transition should activate an enrollment.

### Scheduling

```text
availability_rules
  id              PK
  user_id         FK -> profiles.user_id
  weekday
  start_time
  end_time
  timezone
  effective_from
  effective_until nullable

availability_exceptions
  id              PK
  user_id         FK -> profiles.user_id
  starts_at
  ends_at
  available       boolean

live_sessions
  id                  PK
  teacher_id          FK -> profiles.user_id
  student_id          FK -> profiles.user_id
  starts_at
  ends_at
  timezone
  status              proposed | confirmed | cancelled | completed
  meeting_url         nullable
  kronos_event_id     nullable
  created_by          FK -> profiles.user_id
  created_at
  updated_at
```

Store instants as `timestamptz`, retain the user’s timezone for availability interpretation and display, and enforce no-overlap rules for confirmed sessions (for example, PostgreSQL exclusion constraints over time ranges for each teacher and student). Finalized schedules are persisted locally; dashboards should read local `live_sessions`, not make a synchronous Kronos request.

### Integration and delivery tables

```text
integration_connections
  id               PK
  provider         era | kronos | twilio | sendgrid | mixpanel | hubspot
  status           active | disabled | error
  credentials_ref  -- secret-manager reference; never the secret itself
  settings         JSONB
  created_at
  updated_at
  UNIQUE (provider)

integration_mappings
  id                PK
  provider          FK/logical reference to integration_connections
  local_type        -- invoice, live_session, contact, etc.
  local_id
  external_id
  UNIQUE (provider, local_type, local_id)
  UNIQUE (provider, local_type, external_id)

outbox_events
  id              PK
  event_type
  aggregate_type
  aggregate_id
  payload         JSONB
  created_at
  published_at    nullable

webhook_inbox
  id               PK
  provider
  provider_event_id
  received_at
  processed_at     nullable
  status           received | processed | failed
  payload          JSONB
  UNIQUE (provider, provider_event_id)

integration_deliveries
  id              PK
  provider
  event_type
  aggregate_id
  status          pending | succeeded | retrying | failed
  attempts
  next_attempt_at nullable
  last_error      nullable
  created_at
  updated_at
```

Restrict access to webhook payloads and integration credentials. Encrypt provider secrets in a secret manager and store only a reference in the database.

## 3. REST API structure

All application routes are under `/v1`. Require bearer authentication except for intentionally public registration or provider webhooks. Perform server-side authorization on every resource; UUIDs are identifiers, not authorization.

### Auth and users

Authentication and password recovery remain with Supabase Auth.

- `GET /me` — current profile and roles
- `PATCH /me` — update permitted profile fields
- `GET /users?role=student&query=...` — admin-only user search
- `GET /teachers/me/students` — teacher’s authorized students
- `POST /teachers/me/students` — link an existing student, subject to the product’s approval workflow
- `GET /teachers/me/groups`
- `POST /teachers/me/groups`
- `POST /teachers/me/groups/{groupId}/members`
- `DELETE /teachers/me/groups/{groupId}/members/{studentId}`

### Lesson library (admin)

- `GET /admin/lessons`
- `POST /admin/lessons`
- `GET /admin/lessons/{lessonId}`
- `PATCH /admin/lessons/{lessonId}`
- `POST /admin/lessons/{lessonId}/versions` — create a draft version
- `POST /admin/lessons/{lessonId}/publish` — publish a version
- `POST /admin/lessons/{lessonId}/archive`
- `POST /admin/exercises`
- `PATCH /admin/exercises/{exerciseId}`
- `POST /admin/exercises/{exerciseId}/versions`
- `POST /admin/exercises/{exerciseId}/publish`
- `GET /library/lessons` — published content visible for assignment
- `GET /library/exercises`

Prefer archive over hard deletion once content is referenced by assignments.

### Assignments (teacher)

- `POST /teachers/me/assignments/lessons` — assign a published lesson version to students
- `POST /teachers/me/assignments/exercises` — assign published exercises
- `GET /teachers/me/assignments?studentId=...`
- `PATCH /teachers/me/assignments/{assignmentId}` — update permitted due-date/status fields
- `POST /teachers/me/assignments/{assignmentId}/cancel`
- `GET /teachers/me/students/{studentId}/progress`

The API validates every recipient against the teacher’s student/group membership and creates group members’ assignment rows transactionally.

### Student dashboard

- `GET /students/me/dashboard` — next session, active enrollment, assignment summaries
- `GET /students/me/assignments`
- `GET /students/me/assignments/{assignmentId}`
- `POST /students/me/exercises/{assignedExerciseId}/attempts`
- `POST /students/me/attempts/{attemptId}/submit`
- `GET /students/me/schedule`
- `GET /students/me/progress`

Students may access only their own assignments, attempts, invoices, and schedule.

### Era integration (billing)

- `POST /billing/package-purchases` — create a purchase/enrollment request; the server determines price and currency
- `GET /billing/invoices`
- `GET /billing/invoices/{invoiceId}`
- `POST /webhooks/era` — verify signature, persist inbox event, enqueue processing, return promptly

Do not expose an endpoint that allows a browser to mark an invoice paid. Never trust a browser redirect as proof of payment.

### Kronos integration (scheduling)

- `GET /teachers/me/availability`
- `PUT /teachers/me/availability`
- `GET /students/me/availability`
- `PUT /students/me/availability`
- `POST /scheduling/sessions` — request/book a session after authorization and conflict checks
- `GET /scheduling/sessions/{sessionId}`
- `PATCH /scheduling/sessions/{sessionId}` — permitted reschedule/cancel operations
- `GET /students/me/schedule`
- `GET /teachers/me/schedule`
- `POST /webhooks/kronos` — verify and enqueue provider event processing

Do not assume Era or Kronos API shapes, signature schemes, or capabilities before obtaining their vendor documentation. Implement those details inside provider adapters.

## 4. Async integration architecture

### Request and event flow

1. The API authenticates and authorizes the caller.
2. It commits the local business change and an `outbox_events` row in one database transaction.
3. An outbox publisher enqueues the event in BullMQ.
4. A provider-specific worker loads the event, calls the Era/Kronos adapter, and records the external ID and delivery status.
5. Retries use exponential backoff with jitter. Permanent failures go to a dead-letter queue and raise an operational alert.
6. Webhook handlers verify provider authenticity, store a deduplicated `webhook_inbox` row, enqueue processing, and return without waiting for downstream work.
7. Workers process webhooks idempotently and apply valid state transitions.

BullMQ alone does not make database writes and queue publication atomic. The transactional outbox closes this gap: if the process fails after database commit but before publishing, an outbox poller can still enqueue the event.

### Era workflow

- On enrollment or package purchase, create the local invoice record and outbox event with a stable idempotency key.
- The Era adapter creates the external invoice; store the returned provider ID in `integration_mappings`.
- On webhook receipt, validate the signature and provider event ID, then process idempotently.
- Reconcile amount, currency, invoice reference, and allowed status transitions before updating payment and enrollment state.
- Run a scheduled reconciliation job for invoices whose state has not received a timely webhook.

### Kronos workflow

- Store availability locally and sync changes asynchronously if Kronos requires an external availability mirror.
- Check teacher/student conflicts locally before booking, then send a booking request through the Kronos worker.
- Persist the finalized local session and provider mapping. If external booking fails, keep an explicit failed/pending state and surface it to the caller; do not show it as confirmed.
- Process reschedules and cancellations as state transitions with idempotent provider requests.
- Update the dashboard from the local schedule after successful confirmation, with webhooks and periodic reconciliation correcting drift.

### Future integrations

Use the same connection, outbox, inbox, mapping, and delivery patterns rather than embedding provider-specific calls in domain services.

- **Twilio/SendGrid:** Notification workers subscribe to events such as `assignment.created`, `session.confirmed`, and `invoice.paid`. Track delivery attempts and provider message IDs; keep templates and user notification preferences separate from provider credentials.
- **Mixpanel:** Emit selected product events asynchronously from the outbox. Exclude credentials, exercise answers, and unnecessary personal data; apply consent and retention policies.
- **HubSpot:** Sync opted-in leads and lifecycle changes using `integration_mappings`. Keep CRM contact IDs and sync status separate from core student identity, and make inbound updates pass through explicit reconciliation rules.

## 5. Production safeguards

- Enforce RBAC and ownership checks in the API; use PostgreSQL row-level security as defense in depth where applicable.
- Validate request bodies and paginate list endpoints. Add indexes for ownership, status, and time filters.
- Rate-limit authentication-adjacent and webhook endpoints; verify webhook signatures before enqueueing.
- Use audit logs for role changes, content publication, assignment changes, payments, and schedule changes.
- Monitor queue age, retry counts, webhook failures, and provider reconciliation drift.
- Store secrets outside the frontend and database plaintext. Keep payment card data out of the platform unless a compliant provider-hosted flow specifically requires otherwise.
