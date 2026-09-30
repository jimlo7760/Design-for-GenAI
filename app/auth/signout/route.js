import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function POST(request) {
    const supabase = await createClient();
    await supabase.auth.signOut();

    // 303 makes the browser follow the redirect with a GET.
    return NextResponse.redirect(new URL('/', request.url), 303);
}
