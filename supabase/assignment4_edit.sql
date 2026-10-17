-- Assignment 4, part 4: owners can edit the AI's list of mods, and search for parts to add.
--
-- Run once in the Supabase SQL Editor, AFTER assignment4.sql, assignment4_photos.sql and
-- assignment4_render.sql. Safe to re-run. Run it BEFORE deploying the matching app code if you can:
-- the site still works without it, but editing and part search stay switched off until it has run.
--
--   * Clients still cannot UPDATE `mods`. The owner changes it through edit_build_mods() (and puts
--     the AI's list back with reset_build_mods()), so the render rule from assignment4_render.sql
--     ("only the owner, only once") is not loosened by a broader update policy.
--   * ai_original keeps the list and cost exactly as the AI wrote them. It is filled the first time
--     a list is edited, so "Reset to the AI's list" works even on builds made before this file.
--   * part_searches counts the owner's part searches: at most 40 per user per 24 hours (every
--     search uses AI quota).


-- 1. columns on builds ---------------------------------------------------------
alter table public.builds
    add column if not exists ai_original    jsonb,        -- { mods, est_cost_usd } as the AI wrote them
    add column if not exists mods_edited_at timestamptz;  -- last edit by the owner; null = still the AI's list


-- 2. edit the list -------------------------------------------------------------
-- The app checks every part before it calls this; here we only make sure the caller owns the
-- build and the list is a plain array of 1 to 12 parts (so nobody can store junk through the API).
create or replace function public.edit_build_mods(p_build_id uuid, p_mods jsonb, p_cost integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (select auth.uid()) is null then
        raise exception 'Sign in first.' using errcode = '42501';
    end if;

    if p_mods is null or jsonb_typeof(p_mods) <> 'array' then
        raise exception 'That list of parts is not valid.' using errcode = '22023';
    end if;
    if jsonb_array_length(p_mods) < 1 or jsonb_array_length(p_mods) > 12 or octet_length(p_mods::text) > 20000 then
        raise exception 'That list of parts is not valid.' using errcode = '22023';
    end if;
    if p_cost is not null and (p_cost < 0 or p_cost > 10000000) then
        raise exception 'That cost is not valid.' using errcode = '22023';
    end if;

    -- In an UPDATE, the right-hand side still sees the old row, so ai_original captures the list
    -- as it was before this edit (and keeps the first capture on later edits).
    update public.builds
       set ai_original    = coalesce(ai_original, jsonb_build_object('mods', mods, 'est_cost_usd', est_cost_usd)),
           mods           = p_mods,
           est_cost_usd   = p_cost,
           mods_edited_at = now()
     where id = p_build_id
       and user_id = (select auth.uid());

    if not found then
        raise exception 'You can only edit your own builds.' using errcode = '42501';
    end if;
end;
$$;

revoke all on function public.edit_build_mods(uuid, jsonb, integer) from public, anon, authenticated;
grant execute on function public.edit_build_mods(uuid, jsonb, integer) to authenticated;


-- 3. put the AI's list back ----------------------------------------------------
create or replace function public.reset_build_mods(p_build_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (select auth.uid()) is null then
        raise exception 'Sign in first.' using errcode = '42501';
    end if;

    update public.builds
       set mods           = ai_original -> 'mods',
           est_cost_usd   = (ai_original ->> 'est_cost_usd')::integer,
           ai_original    = null,
           mods_edited_at = null
     where id = p_build_id
       and user_id = (select auth.uid())
       and ai_original is not null;

    if not found then
        raise exception 'There is nothing to reset on that build.' using errcode = '22023';
    end if;
end;
$$;

revoke all on function public.reset_build_mods(uuid) from public, anon, authenticated;
grant execute on function public.reset_build_mods(uuid) to authenticated;


-- 4. part searches: a daily limit ----------------------------------------------
create table if not exists public.part_searches (
    id         bigint generated always as identity primary key,
    user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
    build_id   uuid references public.builds (id) on delete cascade,
    query      text not null check (char_length(query) between 1 and 80),
    created_at timestamptz not null default now()
);

create index if not exists part_searches_user_idx on public.part_searches (user_id, created_at desc);

alter table public.part_searches enable row level security;

-- Clients may only add a row for themselves; nobody reads the table (the trigger below counts it).
revoke all on public.part_searches from anon, authenticated;
grant insert (build_id, query) on public.part_searches to authenticated;

drop policy if exists "Users can log their own part searches" on public.part_searches;
create policy "Users can log their own part searches"
    on public.part_searches for insert to authenticated
    with check (user_id = (select auth.uid()));

create or replace function public.limit_daily_part_searches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (select count(*) from public.part_searches
         where user_id = new.user_id
           and created_at > now() - interval '24 hours') >= 40 then
        raise exception 'Daily limit reached: you can search for 40 parts per 24 hours.'
            using errcode = 'P0001';
    end if;
    return new;
end;
$$;

drop trigger if exists part_searches_daily_limit on public.part_searches;
create trigger part_searches_daily_limit
    before insert on public.part_searches
    for each row execute function public.limit_daily_part_searches();

notify pgrst, 'reload schema';
