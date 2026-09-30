import Link from 'next/link';
import Avatar from './Avatar';
import { fullName } from '../lib/auth';

const linkStyle = { color: '#333', textDecoration: 'none' };

// The gated part of the UI: what shows here depends on whether someone is logged in.
export default function Header({ user, profile }) {
    const name = fullName(profile) || user?.email;

    return (
        <header style={{ borderBottom: '1px solid #eaeaea', fontFamily: 'sans-serif' }}>
            <div
                style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '0.75rem 2rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                }}
            >
                <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <Link href="/" style={{ ...linkStyle, fontWeight: 700 }}>My App</Link>
                    {user && <Link href="/dashboard" style={linkStyle}>Dashboard</Link>}
                </nav>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Link
                            href="/profile"
                            style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Avatar url={profile?.avatar_url} name={name} size={32} />
                            <span>{name}</span>
                        </Link>
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                style={{
                                    padding: '0.35rem 0.75rem',
                                    border: '1px solid #ccc',
                                    borderRadius: '6px',
                                    background: '#fff',
                                    cursor: 'pointer',
                                }}
                            >
                                Sign out
                            </button>
                        </form>
                    </div>
                ) : (
                    <Link href="/login" style={linkStyle}>Sign in</Link>
                )}
            </div>
        </header>
    );
}
