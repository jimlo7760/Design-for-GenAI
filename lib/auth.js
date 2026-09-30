import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

// cache() means the layout and the page share one lookup per request.
export const getCurrentUser = cache(async () => {
    const supabase = await createClient();
    // getUser() asks Supabase Auth to verify the session, so a deleted or
    // signed-out user is never treated as logged in.
    const { data: { user } } = await supabase.auth.getUser();
    return user;
});

export const getProfile = cache(async () => {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

    if (error) console.error('Could not load profile:', error.message);
    return data;
});

// Use at the top of a page that only logged-in users may see.
export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');
    return user;
}

export function isProfileComplete(profile) {
    return Boolean(profile?.first_name?.trim() && profile?.last_name?.trim());
}

export function fullName(profile) {
    return [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
}
