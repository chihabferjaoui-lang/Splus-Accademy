# S+ Academy backend architecture

## 1. Stack and operating model

Keep the GitHub Pages frontend and use **Supabase only** for application backend services:

- **Postgres** stores platform data and enforces row-level security (RLS).
- **Supabase Auth** owns identities and sessions. `profiles` remains the app-facing profile table.
- **The browser** uses the Supabase URL and publishable/anon key only. It never contains a service-role key, provider credentials, or other secrets. Use RLS for direct client access.
- **Supabase Edge Functions** handle trusted operations that need a server boundary: account administration, verified payment webhooks, outbound messages, and provider callbacks. Store secrets in Supabase Function secrets, not tables or frontend files.
- **`pg_cron`** can schedule database-only work, such as marking invoices overdue and queuing reminders. An Edge Function processes queued deliveries. The migration defines the database work function but does not enable an extension or schedule a job; confirm the current Supabase project supports the required features before enabling them.
- **`pgmq` is optional**, not a requirement. The reminder table is a small durable work queue initially; consider `pgmq` only if volume, retry, or visibility requirements justify it and it is available on the existing project. No Redis, separate API server, paid provider, or new paid service is part of this design.

The migration does not provision infrastructure, enable paid features, configure SMTP, or activate external integrations. Do not upgrade a project or enable a billed service to follow this design without separate approval.

## 2. Schema and relationships

Apply `supabase/migrations/20261116100000_supabase_academy_modules.sql` after the existing migrations. It extends the existing schema; it does not edit the initial migration or replace existing application, program, order, membership, slot, and webhook tables.

### Identity and access

- `profiles` remains one row per `auth.users` account.
- `profiles.preferred_locale` is constrained to the site languages (`en`, `fr`, `es`, `pt`, `zh`, `ar`) and can be changed by the account owner. Assignment notices and queued invoice reminders snapshot that locale for correct later delivery.
- `user_roles` supports multiple `admin`, `teacher`, and `student` rows per account. Only admins can grant/revoke roles through RLS; each user can read their own roles. Never assign roles from public signup metadata.
- `teacher_students` is the admin-controlled active/ended teacher-to-student authorization link. Teachers see only profiles and records for their active links.
- `student_groups` and `student_group_members` are teacher-owned sets. A member must have an active teacher/student link.
- Account creation, deletion, and Auth email changes belong in a trusted Auth Admin Edge Function; ordinary clients can edit only the profile fields already granted by the existing schema.

### Customers and Era (internal invoicing)

- `customers` has one record per linked profile and a trigger-generated sequential human number (`C-000001` …). Admins can read/write all; the linked student can read their own record.
- `invoices` stores a unique `INV-000001`-style invoice number (generated when omitted), customer, optional existing `order_id` and `membership_id`, MAD total, issue/due dates, status, and notes.
- `invoice_items` snapshots each description, quantity, unit price, and generated line total. The invoice total is the authoritative total; invoice creation should calculate it from item rows in one transaction/RPC.
- `payments` records admin-entered cash/bank transfers now. Provider and provider-payment identifiers allow a later online adapter without changing the domain model. Do not store card data.
- `reminders` records due-soon/overdue customer messages, channel, schedule, attempts, and delivery result.
- Existing `orders` and `payment_webhook_events` remain authoritative for legacy checkout and webhook deduplication. Link each applicable order to at most one invoice using `invoices.order_id`. Historical paid orders need an admin-reviewed backfill into invoices/payments; do not treat webhook event rows as payment records. New payment processing must verify a provider webhook in an Edge Function before changing local payment/invoice state.

Statuses are `draft`, `sent`, `paid`, `overdue`, `cancelled`, and `refunded`. `process_invoice_due_dates()` changes sent invoices past their due date to overdue and inserts unique reminder work items for near-due/overdue invoices. Invoice/payment state changes remain admin-only in phase one.

### Kronos (internal schedule and hours)

- Existing `class_sessions` is extended with nullable `teacher_id` so earlier admin-created sessions remain valid. New sessions use the existing `class_slot_id` (therefore its program), UTC start/end, existing status and optional HTTPS meeting URL.
- `class_session_students` explicitly records session participants. A teacher can only add their own linked students.
- `teacher_availability` stores recurring weekly windows and timezone; instants in sessions remain UTC.
- `teacher_timesheets` records hours per session. A teacher submits/edits their own unapproved entries; an admin approves them. This is not payroll.
- Database triggers serialize and reject overlapping scheduled sessions for the same teacher or student, including when a session is rescheduled. Existing session progress remains in `lesson_progress` and is visible to a teacher only for their own linked student/session.

### Genius and progress

- `lessons` and `exercises` are the source library. Admins create and edit them; teachers can read published content, never write library rows. Exercise content must not include answer keys that should be hidden from students.
- `assigned_lessons` and `assigned_exercises` are separate per-student assignment records with teacher, assigning user, optional source group, assigned/due dates, status, score, and feedback. Group RPCs expand a group into individual assignments, so later group changes do not change existing recipients.
- Assignment inserts create an in-app notification containing the lesson name and estimated duration. Students use the completion RPCs to mark their own work complete; teachers/admins record scores and feedback.
- Existing `lesson_progress` continues to provide attendance and class-session scoring. Assignment completion and teacher feedback live with the corresponding assignment.

### Notifications

`notifications` supports `in_app`, `email`, and `whatsapp`, plus a language locale, delivery status, and `read_at`. Phase one uses in-app records (unread when `read_at` is null); assignment notices are rendered in the student's selected site language. Email/WhatsApp dispatch is future Edge Function work; never imply an external message was sent just because a client inserted a row.

## 3. RLS scope

All new business tables have RLS enabled. The migration grants authenticated access only where a policy narrows it; anonymous access to these tables is not granted. The service role bypasses RLS and must remain server-side.

| Tables | Admin | Teacher | Student |
|---|---|---|---|
| `profiles`, `user_roles` | Manage roles; read/update permitted profile fields | Read own profile/roles and linked student profiles | Read/update own profile as already allowed; read own roles |
| `teacher_students` | Read/manage links | Read own links | Read own link |
| `student_groups`, `student_group_members` | Read/manage all | Read/manage own groups and their linked students | Read groups/memberships that include them |
| `customers` | Read/write all | None | Read own linked customer only |
| `lessons`, `exercises` | Read/write library | Read published library only | Read only published content attached to own assignment |
| `assigned_lessons`, `assigned_exercises` | Read/write all | Read/write assignments for own active linked students | Read own assignments only; completion through owner-checking RPC |
| `notifications` | Read all and create notices; delivery workers update results | Create in-app notices for own linked students; read own | Read own and update only `read_at` |
| `class_sessions`, `class_session_students` | Read/write all | Read/write own sessions and linked participants | Read own sessions/participant rows; no schedule writes |
| `teacher_availability` | Read/write all | Read/write own availability | Read availability of an active assigned teacher |
| `teacher_timesheets` | Read, approve, and manage all | Read own; create/update own unapproved timesheets | None |
| `invoices`, `invoice_items`, `payments` | Read/write all | None | Read only rows belonging to own customer |
| `reminders` | Read/manage all | None | Read own customer reminders |
| `lesson_progress` | Read/write all | Read/write own linked student’s matching session progress | Read own progress |

Existing policies remain in force for the original tables: active programs and upcoming class slots are publicly readable; program/slot management, applications, booking requests, and newsletter administration are admin-controlled; orders/memberships are readable by their student and admins; webhook event rows remain ungranted to browser roles. Public application/newsletter/booking submission continues through the existing Edge Functions. `class_sessions` and `lesson_progress` policies are extended to add teacher scope while preserving student access.

For clarity, the existing-table scope is:

| Existing table/view | Read scope | Write scope |
|---|---|---|
| `profiles` | Own, admin, or active teacher-linked student | Own permitted name/phone fields; admins can update permitted profile fields; Auth-only fields go through Auth Admin |
| `user_roles` | Own roles or all for admins | Admin only |
| `programs` | Active rows are public; admins can read all | Admin only |
| `student_applications`, `teacher_applications`, `booking_requests` | Admin only | Admin only in table; existing public submission Edge Functions remain the intake boundary |
| `class_slots` | Anonymous/authenticated users may read active upcoming slots | Admin only |
| `orders`, `memberships` | Owner student or admin | Browser clients read only; trusted checkout/admin flow writes |
| `payment_webhook_events` | No browser-role access | Trusted webhook function only |
| `newsletter_subscribers` | Admin only | Admin only in table; existing newsletter Edge Function handles public signup/unsubscribe |
| `available_class_slots` | Anonymous/authenticated read | Read-only view |
| `class_sessions`, `lesson_progress` | Admin, owning student, and authorized teacher as described above | Admin/authorized teacher only |

Use the RLS-backed browser client for safe CRUD, not a custom REST server. A privileged Edge Function must independently validate caller identity and authorization; a service key bypasses RLS.

## 4. API structure

These are Supabase calls/RPCs/Edge Functions, not a separate REST service. In browser code use the existing Supabase client and `auth.getUser()`/session. Always select only needed columns and paginate lists.

| Area | Client/API contract |
|---|---|
| Auth / users | Supabase Auth signup/sign-in/reset; `profiles` and own `user_roles` for `/me`; admin user creation, suspension, or Auth email changes through an authenticated `admin-users` Edge Function. |
| Customers | Admin `customers` CRUD; a student selects the row where `user_id = auth.uid()` (also enforced by RLS). |
| Era | Admin creates invoices with `create_invoice(uuid, date, jsonb, text, uuid, uuid)` and records manual payments with `record_manual_payment(uuid, payment_method, bigint, timestamptz)`; students read their own invoice/payment views. Both RPCs validate and write transactionally. `process_invoice_due_dates()` is service-role-only. No browser operation can mark an invoice paid. |
| Kronos | RLS-backed reads/writes for availability, sessions, participants, timesheets, and existing progress. Booking/rescheduling should use one RPC or Edge Function transaction that checks availability and participant/teacher conflicts; database triggers enforce overlap protection as a second line. |
| Genius | Admin CRUD for `lessons`/`exercises`; teachers query published lessons and insert individual assignments or call `assign_lesson_to_group(uuid, uuid, timestamptz)` / `assign_exercise_to_group(...)`. Students read their assigned rows and call `complete_assigned_lesson(uuid)` / `complete_assigned_exercise(uuid)`. |
| Notifications | Select own notifications ordered by `created_at`; update only `read_at`. Edge Function delivery workers claim pending email/WhatsApp rows and persist delivery results. |
| Student dashboard | Compose own memberships, schedule, assignments, progress, invoices, and notifications using RLS-protected queries. Realtime on `notifications` is optional; polling is sufficient for phase one. |

Future Edge Functions: `admin-users`, `payment-webhook`, and `notification-dispatch`. Existing form Edge Functions remain unchanged. Validate webhook signatures, deduplicate using `payment_webhook_events` or a provider/event unique key, and make processing idempotent.

## 5. Async work

1. A domain write creates local rows and pending work in the same database transaction.
2. The daily `pg_cron` task calls `public.process_invoice_due_dates()`; the function only changes invoice status and queues reminders. It performs no network calls.
3. A scheduled `notification-dispatch` Edge Function claims pending reminder/notification records, rechecks that the invoice is still payable, sends through a configured adapter, then records sent/failed status and retry information. Keep credentials in Function secrets. Do not mark messages sent before provider confirmation.
4. For retries, use bounded attempts/backoff and retain failures for admin review. If the existing Supabase project supports `pgmq` and queue volume warrants it, it can replace table polling; otherwise the reminder table is adequate.

Deployment operator steps, after confirming the current project plan includes these features, are to enable `pg_cron` in Supabase and schedule (once) a daily call such as:

```sql
select cron.schedule(
  'splus-invoice-due-dates',
  '15 6 * * *',
  $$select public.process_invoice_due_dates();$$
);
```

Schedule the dispatch Edge Function separately in Supabase. Configure SMTP/provider secrets and any required sender verification before enabling email/WhatsApp delivery. These are deployment steps, not included/enabled by the migration.

## 6. Future integrations

No integrations are active or required for launch.

- **Email / WhatsApp:** dispatch from `notifications` and `reminders`; store provider message IDs/status on delivery records. Add the provider secret only as an Edge Function secret.
- **Online payments:** add a provider adapter behind `payment-webhook`; reuse invoice/payment provider fields, existing `orders`, and `payment_webhook_events` for legacy checkout/deduplication. Verify amount, currency, invoice reference, signature, and legal status transitions before updating the database.
- **Analytics:** emit minimized, consent-aware events from Edge Functions; never export exercise answers, credentials, or unnecessary personal data.
- **CRM:** synchronize opted-in customer/contact changes from `customers` using a future integration mapping/outbox table. Do not make CRM the source of truth for users, invoices, or lessons.

## 7. Build order

1. **Roles and customers:** deploy the migration; assign roles through a trusted admin process; establish teacher/student links; create customer records and verify RLS with admin, teacher, and student test accounts.
2. **Genius and notifications:** publish the admin library, push individual/group assignments, verify generated notices and student completion/progress.
3. **Kronos:** migrate/create teacher-owned sessions, participants, availability, and timesheets; test concurrent and reschedule overlap rejection.
4. **Era:** admin invoice/item/payment workflows, reviewed legacy order reconciliation, then daily overdue/reminder scheduling. Keep manual payments only until a separate provider integration is approved.
5. **Integrations:** only when requested and approved, configure email/WhatsApp, analytics, CRM, or online payments and test idempotency, retries, and secret handling.

## 8. Assumptions and rollout notes

- MAD is the only invoice/payment currency. Invoice due-date comparison uses the `Africa/Casablanca` business date; session instants are UTC and availability stores an IANA timezone.
- Customer records link one-to-one to student profiles. The admin creates/updates a customer from the profile; historical orders are not auto-converted because the migration cannot infer invoicing/customer details safely.
- Existing `class_sessions` can lack `teacher_id` for legacy rows; newly scheduled teacher sessions require a teacher role and explicit student links.
- The repository includes a testing-only migration that auto-confirms Auth signups. This architecture does not depend on it. Before production, remove/disable that testing trigger as part of the SMTP/signup launch checklist; no email setup or trigger deployment is performed here.
- This migration and documentation do not change frontend behavior. Validate RLS and migration application against a disposable/local Supabase database before production rollout; apply the migration and configure cron/Edge Function schedules only after reviewing the target project and its plan.
