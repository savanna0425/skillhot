create table if not exists public.user_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  repository text not null check (
    char_length(repository) between 3 and 200
    and repository ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'
  ),
  created_at timestamptz not null default now(),
  primary key (user_id, repository)
);

alter table public.user_favorites enable row level security;

revoke all on table public.user_favorites from anon;
grant select, insert, delete on table public.user_favorites to authenticated;

drop policy if exists "Users can read their own favorites" on public.user_favorites;
create policy "Users can read their own favorites"
  on public.user_favorites
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own favorites" on public.user_favorites;
create policy "Users can add their own favorites"
  on public.user_favorites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their own favorites" on public.user_favorites;
create policy "Users can remove their own favorites"
  on public.user_favorites
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.user_favorites is 'Private SkillHot bookmarks, isolated per authenticated user by RLS.';
