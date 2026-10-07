-- Assignment 4, part 2: a real photo of the car on every build.
--
-- Run once in the Supabase SQL Editor, AFTER supabase/assignment4.sql.
-- Safe to re-run.
--
-- The photo is found on Wikimedia Commons and hotlinked (not copied). We store its
-- link plus who took it and under which license, so the card can credit them.

alter table public.builds
    add column if not exists image_url        text,  -- the photo itself
    add column if not exists image_source_url text,  -- its Commons page (for the credit link)
    add column if not exists image_credit     text,  -- photographer
    add column if not exists image_license    text;  -- e.g. "CC BY-SA 4.0"

-- Clients write these columns directly, so don't let anyone point a build at an
-- arbitrary image or link: only Wikimedia addresses are accepted.
alter table public.builds drop constraint if exists builds_image_url_is_wikimedia;
alter table public.builds add constraint builds_image_url_is_wikimedia
    check (image_url is null
        or image_url like 'https://upload.wikimedia.org/%'
        or image_url like 'https://thumb.wikimedia.org/%');

alter table public.builds drop constraint if exists builds_image_source_is_wikimedia;
alter table public.builds add constraint builds_image_source_is_wikimedia
    check (image_source_url is null
        or image_source_url like 'https://commons.wikimedia.org/%'
        or image_source_url like 'https://w.wiki/%');

alter table public.builds drop constraint if exists builds_image_text_lengths;
alter table public.builds add constraint builds_image_text_lengths
    check (char_length(image_credit) <= 120 and char_length(image_license) <= 60);

-- Same column-level insert rule as the other columns (clients still can't set counters).
grant insert (image_url, image_source_url, image_credit, image_license)
    on public.builds to authenticated;

notify pgrst, 'reload schema';
