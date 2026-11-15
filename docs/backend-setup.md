# S+ Academy backend setup

## Architecture

The public website remains on GitHub Pages. Supabase provides PostgreSQL, email/password authentication, row-level security, and Edge Functions. The database migration creates student and teacher applications, student profiles and roles, programs, admin-managed class slots, one-month MAD orders and memberships, and newsletter opt-ins.

The Supabase Table Editor provides the initial spreadsheet-style admin workspace. Only authenticated users granted the `admin` role can access private application, subscriber, slot, and program data through the application APIs. The first admin must be granted by the project owner; public sign-up never grants admin access.

The three public submission functions require Cloudflare Turnstile verification and exact allowed-origin configuration. Their service-role database key stays in Supabase's server-side environment and must never be added to the website.

## Not live yet

The current website forms are not switched to these endpoints, and no checkout endpoint is enabled. Do not advertise backend submissions or payments as active until the Supabase project is configured, the form pages are connected, and the integration is tested.

The student login, student account, admin login, and admin workspace pages are now part of the site, but they are not active until a Supabase project is provisioned and configured. Apply both migrations in timestamp order. The admin workspace uses the Supabase database directly with row-level security; it is not a substitute for assigning the first admin role.

The academy does not yet have a Moroccan merchant-acquiring account. Contact CMI or the academy's bank to obtain its e-commerce merchant agreement and integration documentation. Confirm hosted checkout, MAD settlement to the academy's bank account, 3-D Secure, and the provider's notification/signature mechanism. The intended product is a single, non-renewing 30-day course payment; no card number or security code is stored by S+ Academy.

CMI's current e-commerce overview describes local and international card acceptance, 3-D Secure, and card storage for repeat purchases. It does not by itself establish the exact merchant API or webhook contract needed for this site:

- [CMI e-commerce overview](https://www.cmi.co.ma/fr/solutions-paiement-ecommerce)
- [Stripe supported countries](https://stripe.com/global) (Morocco is not listed in the current standard availability list)

## Provisioning

1. Create a Supabase project owned by the academy and keep its owner credentials private.
2. Install the Supabase CLI, authenticate locally, and link this repository to the new project:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. Configure a Cloudflare Turnstile site for `chihabferjaoui-lang.github.io`. Set the verification secret only in Supabase:

   ```sh
   supabase secrets set \
     ALLOWED_ORIGINS=https://chihabferjaoui-lang.github.io \
     TURNSTILE_HOSTNAME=chihabferjaoui-lang.github.io \
     TURNSTILE_SECRET_KEY=YOUR_TURNSTILE_SECRET
   ```

4. Deploy the application and newsletter functions:

   ```sh
   supabase functions deploy submit-student-application
   supabase functions deploy submit-teacher-application
   supabase functions deploy subscribe-newsletter
   ```

5. Create the first admin user using Supabase Auth. As the project owner, grant that exact account the admin role in the Supabase SQL Editor:

   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin'
   from auth.users
   where lower(email) = lower('chihabferjaoui@gmail.com')
   on conflict do nothing;
   ```

6. Configure account access:
   - In `js/supabase-config.js`, set the Supabase project URL, publishable/anon key, and Cloudflare Turnstile **site key**. These are the only backend values that belong in the static website.
   - In Supabase Auth, enable email/password accounts, keep email verification enabled, and configure CAPTCHA with the Turnstile secret. Do not restrict signup to an academy email domain: students may register with any valid email address they control. Allow redirects to the deployed `student.html` and `reset-password.html` URLs, including `reset-password.html?role=student` and `reset-password.html?role=admin` (and the GitHub Pages repository path).
   - Configure a production SMTP provider in Supabase Auth so verification emails reach students reliably.
   - In Supabase Auth → Users, create the administrator account for `chihabferjaoui@gmail.com` and choose its password privately in the dashboard. Never send or store that password in source code or chat. Verify the email, then run the role-grant SQL above. Require multi-factor authentication for administrator accounts in Supabase Auth.
   - Deploy the site. Students use `student-login.html`; the designated admin signs in at `admin-login.html`, which opens `admin.html` only after the database confirms its admin role.
   - Never add a service-role key, CAPTCHA secret, or payment-provider secret to `js/supabase-config.js`.

7. Only after the merchant account and provider contract are available should a server-side checkout and verified payment-notification handler be implemented. Never trust a browser redirect as proof of payment.

The admin workspace can review applications, view student accounts, manage class slots and lesson schedules, record attendance/scores/teacher feedback, inspect booking requests, and review newsletter and order records. Its activity metrics come from a server-side, admin-only aggregate function. Both login pages use Supabase's email password-recovery flow; Supabase sends the reset link to the submitted account email, which opens `reset-password.html`. The student area shows the next scheduled lesson, private meeting link, recorded progress, and a WhatsApp contact link to the academy to reach their teacher. Booking submissions and payments still need backend integration; the workspace does not create administrator roles or treat an order as paid without verified provider integration.

Do not commit Supabase service-role keys, Turnstile secrets, merchant passwords, or payment-provider secrets. Public website configuration may contain the Supabase project URL and publishable/anon key only after row-level security has been reviewed.
