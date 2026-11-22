-- Allow admins to manage newsletter subscribers from the workspace.
-- RLS policy "Admins manage newsletter subscribers" already permits all verbs;
-- the original grant only allowed select/update.

grant insert, delete on public.newsletter_subscribers to authenticated;
