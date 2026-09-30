-- Assignment 3: profiles table, sign-up trigger, and avatar storage.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.


-- 1. profiles table ------------------------------------------------------------
-- One row per user; `id` is the same UUID as auth.users.id.
-- first_name / last_name are nullable on purpose: they stay empty until the user
-- fills them in right after their first login.
create table if not exists public.profiles (
    id          uuid primary key references auth.users (id) on delete cascade,
    first_name  text,
    last_name   text,
    avatar_url  text,  -- link to the photo in Storage; the image itself is never stored in Postgres
    created_at  timestamptz not null default now()
);

-- RLS stays off (the assignment allows it), so at least keep logged-out visitors
-- out: the anon key is public, and this table holds people's names and photos.
revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;


-- 2. trigger: create a profile row the first time a user signs in --------------
-- `security definer` runs the function with its owner's rights, so the insert
-- works no matter which role Supabase Auth is using when it creates the user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id)
    values (new.id)
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Backfill: anyone who signed in before this trigger existed gets a row too.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;


-- 3. storage bucket for profile photos ----------------------------------------
-- Public bucket, so a photo can be shown with a plain <img src="...">.
-- Size and type limits are enforced by Supabase, not just by the browser.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars', 'avatars', true,
    5242880,  -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;


-- 4. storage policies ---------------------------------------------------------
-- storage.objects always has RLS on, even though `profiles` doesn't, so uploads
-- need explicit policies. Files live at avatars/<user id>/<file>, and each user
-- may only write inside their own folder.
drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable"
    on storage.objects for select
    using (bucket_id = 'avatars');

drop policy if exists "Users can upload to their own avatar folder" on storage.objects;
create policy "Users can upload to their own avatar folder"
    on storage.objects for insert to authenticated
    with check (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

drop policy if exists "Users can delete from their own avatar folder" on storage.objects;
create policy "Users can delete from their own avatar folder"
    on storage.objects for delete to authenticated
    using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );


-- Optional checks after running:
--   select * from public.profiles;
--   select id, public, file_size_limit from storage.buckets where id = 'avatars';
--   select tgname from pg_trigger where tgname = 'on_auth_user_created';
