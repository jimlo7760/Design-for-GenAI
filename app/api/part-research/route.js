import { NextResponse } from 'next/server';
import { getCurrentUser, getProfile, isProfileComplete } from '../../../lib/auth';
import { researchParts } from '../../../lib/ai';
import { isUuid } from '../../../lib/mods';
import { createClient } from '../../../lib/supabase/server';

// A route handler rather than a Server Action: Server Actions run one at a time, so a slow search
// would hold up the owner's other clicks (taking a part off the list) queued behind it.
export const maxDuration = 60;

// Letters, numbers, spaces and the few symbols part names use (Brembo GT-R, H&R, 3" exhaust).
function clean(value) {
    return String(value ?? '').replace(/[^\p{L}\p{N} .,+&'"/()#%-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function reply(data, status = 200) {
    return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

// POST /api/part-research  { buildId, query }
//   -> { options: [{ part, category, detail, cost_usd, price_low, price_high, fitment }], note }
// Looks up the part the owner of a build asks for, for that build's car. Only the owner can search,
// and every search counts toward a daily limit (supabase/assignment4_edit.sql) because it uses AI quota.
export async function POST(request) {
    const user = await getCurrentUser();
    if (!user) return reply({ error: 'Please sign in first.' }, 401);
    if (!isProfileComplete(await getProfile())) return reply({ error: 'Please finish your profile first.' }, 403);

    // A plain form post from another site can't send this content type without our say-so.
    if (!request.headers.get('content-type')?.includes('application/json')) return reply({ error: 'Invalid request.' }, 415);
    let body;
    try {
        body = await request.json();
    } catch {
        return reply({ error: 'Invalid request.' }, 400);
    }

    const query = clean(body?.query);
    if (query.length < 2) return reply({ error: 'Say what part you are looking for (at least 2 characters).' }, 400);
    if (!isUuid(body?.buildId)) return reply({ error: 'That build does not exist.' }, 400);

    const supabase = await createClient();
    const { data: build } = await supabase.from('builds').select('id, user_id, car_name, mods').eq('id', body.buildId).maybeSingle();
    if (!build || build.user_id !== user.id) return reply({ error: 'You can only search for parts on your own builds.' }, 403);

    // Count the search before spending AI quota on it. If the table is missing (the SQL file has not
    // been run yet) the search still works, just without the daily limit.
    const { error: limitError } = await supabase.from('part_searches').insert({ build_id: build.id, query });
    if (limitError?.message?.startsWith('Daily limit')) return reply({ error: limitError.message }, 429);
    if (limitError) console.error('Could not log the part search (has supabase/assignment4_edit.sql been run?):', limitError.message);

    try {
        const { options, note } = await researchParts({
            car: build.car_name,
            query,
            mods: Array.isArray(build.mods) ? build.mods : [],
        });
        return reply({ options, note });
    } catch (error) {
        return reply({ error: error.message }, 502);
    }
}
