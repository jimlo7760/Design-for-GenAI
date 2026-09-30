import { updateSession } from './lib/supabase/proxy';

// Next.js 16 calls this file "proxy" (it used to be "middleware").
export async function proxy(request) {
    return updateSession(request);
}

export const config = {
    // Everything except static files and images.
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
