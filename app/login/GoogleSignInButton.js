'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function GoogleSignInButton() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function signIn() {
        setLoading(true);
        setError('');

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            // Must be exactly /auth/callback: no extra path or query parameters.
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });

        // On success the browser is already on its way to Google.
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={signIn}
                disabled={loading}
                style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    background: '#fff',
                    cursor: loading ? 'default' : 'pointer',
                }}
            >
                {loading ? 'Redirecting to Google…' : 'Continue with Google'}
            </button>
            {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}
        </div>
    );
}
