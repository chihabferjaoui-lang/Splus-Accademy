# Launch checklist

Before real students sign up:

- Set up custom SMTP under **Authentication > Emails** in the Supabase dashboard.
- Run the SQL in `supabase/migrations/REMOVE_AUTO_CONFIRM_BEFORE_LAUNCH.sql.disabled` to remove the testing auto-confirm trigger and function.
- Turn email confirmation back on under **Authentication > Sign In / Providers**.
- Set the production **Site URL** and allow the deployed `student.html` and `reset-password.html` URLs (including the student/admin reset query values) under **Redirect URLs**.
- Delete test users under **Authentication > Users**.
