grant delete on public.notifications to authenticated;

create policy "Students delete own in-app notifications"
  on public.notifications for delete to authenticated
  using (
    recipient_id = (select auth.uid())
    and channel = 'in_app'
  );
