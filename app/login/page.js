import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../lib/auth';
import GoogleSignInButton from './GoogleSignInButton';

export default async function LoginPage({ searchParams }) {
    if (await getCurrentUser()) redirect('/');

    const { error } = await searchParams;

    return (
        <main style={{ maxWidth: '420px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '1rem' }}>Sign in</h1>
            <p>Sign in with Google to see your dashboard and manage your profile.</p>

            {error && (
                <p role="alert" style={{ color: '#b00020' }}>
                    Sign-in didn&apos;t work. Please try again.
                </p>
            )}

            <GoogleSignInButton />
        </main>
    );
}
