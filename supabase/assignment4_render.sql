-- Assignment 4, part 3: AI renders of a build (Google Nano Banana).
--
-- Run once in the Supabase SQL Editor, AFTER assignment4.sql and
-- assignment4_photos.sql. Safe to re-run.
--
-- The owner of a build can click "Render this build": the AI edits the car's
-- reference photo to show the mods, the image is saved in Storage, and its link is
-- stored on the build.
--   * only the owner can attach a render, and only once per build
--   * at most 5 renders per user per 24 hours (every render costs money)


-- 1. columns on builds ---------------------------------------------------------
alter table public.builds
    add column if not exists render_url   text,         -- the AI render (a file in Storage)
    add column if not exists render_model text,         -- which image model made it
    add column if not exists rendered_at  timestamptz;

-- The link must point into our own render bucket, nowhere else.
alter table public.builds drop constraint if exists builds_render_url_is_ours;
alter table public.builds add constraint builds_render_url_is_ours
    check (render_url is null
        or (render_url like 'https://%/storage/v1/object/public/build-renders/%'
            and char_length(render_url) <= 500));

alter table public.builds drop constraint if exists builds_render_model_length;
alter table public.builds add constraint builds_render_model_length
    check (char_length(render_model) <= 80);


-- 2. who may write them --------------------------------------------------------
-- Until now clients could not update builds at all. Now the owner may set these
-- three columns, and only while the build has no render yet.
grant update (render_url, render_model, rendered_at) on public.builds to authenticated;

drop policy if exists "Owners can attach one render to their build" on public.builds;
create policy "Owners can attach one render to their build"
    on public.builds for update to authenticated
    using (user_id = (select auth.uid()) and render_url is null)
    with check (user_id = (select auth.uid()));


-- 3. daily limit ---------------------------------------------------------------
create or replace function public.limit_daily_renders()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.render_url is not null and old.render_url is null then
        if (select count(*) from public.builds
             where user_id = new.user_id
               and rendered_at > now() - interval '24 hours') >= 5 then
            raise exception 'Daily limit reached: you can render 5 builds per 24 hours.'
                using errcode = 'P0001';
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists builds_daily_render_limit on public.builds;
create trigger builds_daily_render_limit
    before update of render_url on public.builds
    for each row execute function public.limit_daily_renders();


-- 4. storage bucket for the renders -------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'build-renders', 'build-renders', true,
    8388608,  -- 8 MB
    array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

-- Same pattern as the other buckets: files live in <user id>/ and each user may only
-- touch their own folder. Public URLs work without any select policy.
drop policy if exists "Users can read their own renders" on storage.objects;
create policy "Users can read their own renders"
    on storage.objects for select to authenticated
    using (bucket_id = 'build-renders' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can upload renders to their own folder" on storage.objects;
create policy "Users can upload renders to their own folder"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'build-renders' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can delete renders from their own folder" on storage.objects;
create policy "Users can delete renders from their own folder"
    on storage.objects for delete to authenticated
    using (bucket_id = 'build-renders' and (storage.foldername(name))[1] = (select auth.uid())::text);

notify pgrst, 'reload schema';
