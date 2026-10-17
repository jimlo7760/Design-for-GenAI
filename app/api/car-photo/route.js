import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { findCarPhoto } from '../../../lib/carPhoto';

// A route handler rather than a Server Action: Server Actions run one at a time, so a slow
// photo lookup could hold up someone's "Generate build" click queued behind it.

// Keeps letters, numbers, spaces and the few symbols car names use; empty if too long.
function clean(value, maxLength) {
    const text = String(value ?? '').replace(/[^\p{L}\p{N} .+-]/gu, '').replace(/\s+/g, ' ').trim();
    return text.length <= maxLength ? text : '';
}

// GET /api/car-photo?brand=BMW&model=M3&chassis=E46
//   -> { photo: { url, sourceUrl, credit, license } | null, unavailable?: true }
// Shows people which exact car they are picking on the Generate page. With a chassis it only
// accepts photos that mention that chassis, so it never shows the wrong generation.
// `unavailable` means the lookup failed (Wikimedia busy), as opposed to there being no photo.
export async function GET(request) {
    // Only signed-in people may use this: each call makes requests to Wikimedia on our behalf.
    if (!(await getCurrentUser())) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const brand = clean(searchParams.get('brand'), 40);
    const model = clean(searchParams.get('model'), 60);
    const chassis = clean(searchParams.get('chassis'), 30);
    if (!brand || !model) return NextResponse.json({ error: 'Choose a brand and model.' }, { status: 400 });

    // The best match every time, so the same car always shows the same photo.
    const photo = await findCarPhoto([brand, model, chassis].filter(Boolean).join(' '), { random: false, width: 500 });

    // A failed lookup is never remembered, so asking again later can work.
    if (photo === undefined) return NextResponse.json({ photo: null, unavailable: true }, { headers: { 'Cache-Control': 'no-store' } });

    return NextResponse.json({ photo }, { headers: { 'Cache-Control': `private, max-age=${photo ? 86400 : 600}` } });
}
