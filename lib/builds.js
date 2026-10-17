import { createClient } from './supabase/server';

const COLUMNS =
    'id, user_id, car_name, vibe, title, tagline, mods, est_cost_usd, photo_url, image_url, image_source_url, image_credit, image_license, render_url, render_model, rendered_at, upvotes, downvotes, score, created_at';
const PROFILE = 'profiles ( first_name, last_name, avatar_url )';

// mods_edited_at comes from supabase/assignment4_edit.sql. Until that has been run the query leaves
// it out, so the rest of the site keeps working.
const BUILD_FIELDS = `${COLUMNS}, mods_edited_at, ${PROFILE}`;
const BUILD_FIELDS_BEFORE_EDITS = `${COLUMNS}, ${PROFILE}`;

// sort: 'new' | 'today' (best of the last 24 hours) | 'top' (all time).
// Pass userId to list one person's builds, or id to fetch a single build.
// Each result also gets `myVote` (1, -1 or 0) for the signed-in user.
export async function getBuilds({ sort = 'new', userId, id, limit = 30 } = {}) {
    const supabase = await createClient();

    function select(fields) {
        let query = supabase.from('builds').select(fields);
        if (id) query = query.eq('id', id);
        if (userId) query = query.eq('user_id', userId);

        if (sort === 'today') {
            const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            query = query.gte('created_at', since).order('score', { ascending: false });
        } else if (sort === 'top') {
            query = query.order('score', { ascending: false });
        }
        return query.order('created_at', { ascending: false }).limit(limit);
    }

    let { data: builds, error } = await select(BUILD_FIELDS);
    // 42703 = undefined column: the edit columns do not exist yet, so ask again without them.
    // Builds then say `mods_editable: false` and the page does not offer to edit the parts.
    let editable = true;
    if (error?.code === '42703' || error?.message?.includes('mods_edited_at')) {
        editable = false;
        ({ data: builds, error } = await select(BUILD_FIELDS_BEFORE_EDITS));
    }
    if (error) return { builds: [], error: error.message };
    if (builds.length === 0) return { builds: [] };

    // RLS only returns the current user's own votes, so no user filter is needed.
    const { data: votes } = await supabase
        .from('build_votes')
        .select('build_id, value')
        .in('build_id', builds.map((build) => build.id));
    const myVotes = new Map((votes ?? []).map((vote) => [vote.build_id, vote.value]));

    return { builds: builds.map((build) => ({ ...build, myVote: myVotes.get(build.id) ?? 0, mods_editable: editable })) };
}

// The builds this user still has to judge: other people's, not yet voted on. Builds
// with the fewest votes come first so newcomers get seen (ties stay newest first).
export async function getJudgeQueue(userId, { limit = 20 } = {}) {
    const { builds, error } = await getBuilds({ sort: 'new', limit: 100 });
    if (error) return { builds: [], error };

    const queue = builds
        .filter((build) => build.user_id !== userId && build.myVote === 0)
        .sort((a, b) => a.upvotes + a.downvotes - (b.upvotes + b.downvotes))
        .slice(0, limit);
    return { builds: queue };
}
