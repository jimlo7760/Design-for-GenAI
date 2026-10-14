import { createClient } from './supabase/server';

const BUILD_FIELDS =
    'id, user_id, car_name, vibe, title, tagline, mods, est_cost_usd, photo_url, image_url, image_source_url, image_credit, image_license, render_url, render_model, upvotes, downvotes, score, created_at, ' +
    'profiles ( first_name, last_name, avatar_url )';

// sort: 'new' | 'today' (best of the last 24 hours) | 'top' (all time).
// Pass userId to list one person's builds, or id to fetch a single build.
// Each result also gets `myVote` (1, -1 or 0) for the signed-in user.
export async function getBuilds({ sort = 'new', userId, id, limit = 30 } = {}) {
    const supabase = await createClient();

    let query = supabase.from('builds').select(BUILD_FIELDS);
    if (id) query = query.eq('id', id);
    if (userId) query = query.eq('user_id', userId);

    if (sort === 'today') {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', since).order('score', { ascending: false });
    } else if (sort === 'top') {
        query = query.order('score', { ascending: false });
    }
    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data: builds, error } = await query;
    if (error) return { builds: [], error: error.message };
    if (builds.length === 0) return { builds: [] };

    // RLS only returns the current user's own votes, so no user filter is needed.
    const { data: votes } = await supabase
        .from('build_votes')
        .select('build_id, value')
        .in('build_id', builds.map((build) => build.id));
    const myVotes = new Map((votes ?? []).map((vote) => [vote.build_id, vote.value]));

    return { builds: builds.map((build) => ({ ...build, myVote: myVotes.get(build.id) ?? 0 })) };
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
