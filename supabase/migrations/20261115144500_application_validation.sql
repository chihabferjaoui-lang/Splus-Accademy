alter table public.student_applications
  drop constraint student_applications_current_level_check,
  add constraint student_applications_current_level_check
    check (char_length(current_level) <= 64);
