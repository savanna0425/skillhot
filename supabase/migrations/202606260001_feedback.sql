-- Guest/user feedback. Anyone (anon or authenticated) may INSERT; nobody can read
-- back via the API. Submissions are reviewed in the Supabase dashboard / SQL editor
-- (service role bypasses RLS).
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 1 and 2000),
  contact text check (contact is null or char_length(contact) <= 200),
  user_id uuid references auth.users (id) on delete set null,
  page text check (page is null or char_length(page) <= 200),
  user_agent text check (user_agent is null or char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

revoke all on table public.feedback from anon, authenticated;
grant insert on table public.feedback to anon, authenticated;

drop policy if exists "Anyone can submit feedback" on public.feedback;
create policy "Anyone can submit feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

comment on table public.feedback is 'Guest/user feedback; insert-only via API, read in dashboard.';
