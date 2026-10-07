import Link from 'next/link';
import { redirect } from 'next/navigation';
import BuildCard from '../components/BuildCard';
import { getBuilds } from '../lib/builds';
import { todaysChallenge } from '../lib/challenges';
import { getProfile, isProfileComplete, requireUser } from '../lib/auth';

const SORTS = [
    { key: 'new', label: 'Newest' },
    { key: 'today', label: 'Top today' },
    { key: 'top', label: 'All-time' },
];

// The "Render this build" button's server action runs under this page's time limit.
export const maxDuration = 90;

export default async function Home({ searchParams }) {
    const user = await requireUser();
    const profile = await getProfile();

    // No name saved yet: ask for it first.
    if (!isProfileComplete(profile)) redirect('/profile');

    const { sort: requestedSort } = await searchParams;
    const sort = SORTS.some((option) => option.key === requestedSort) ? requestedSort : 'new';
    const { builds, error } = await getBuilds({ sort });
    const challenge = todaysChallenge();

    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '1rem' }}>Mod Squad</h1>
            <p style={{ color: '#555' }}>
                Pick a car, describe a vibe, and the AI designs the build. Then the community votes on which ones deserve to exist.
            </p>

            <div style={{ margin: '1.5rem 0 0 0', padding: '1rem', background: '#f5f7ff', border: '1px solid #e0e4ff', borderRadius: '8px' }}>
                <strong>Today&apos;s challenge:</strong> {challenge}
                <div style={{ marginTop: '0.5rem' }}>
                    <Link href={`/generate?vibe=${encodeURIComponent(challenge)}`}>Take the challenge →</Link>
                </div>
            </div>

            <nav aria-label="Sort builds" style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0 0 0' }}>
                {SORTS.map((option) => (
                    <Link
                        key={option.key}
                        href={option.key === 'new' ? '/' : `/?sort=${option.key}`}
                        aria-current={sort === option.key ? 'page' : undefined}
                        style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '999px',
                            textDecoration: 'none',
                            border: '1px solid #3f51b5',
                            background: sort === option.key ? '#3f51b5' : '#fff',
                            color: sort === option.key ? '#fff' : '#3f51b5',
                        }}
                    >
                        {option.label}
                    </Link>
                ))}
            </nav>

            {error ? (
                <p role="alert" style={{ color: '#b00020' }}>Could not load builds: {error}</p>
            ) : builds.length === 0 ? (
                <p style={{ marginTop: '1.5rem' }}>
                    {sort === 'today' ? 'No builds in the last 24 hours. ' : 'No builds yet. '}
                    <Link href="/generate">Be the first to generate one →</Link>
                </p>
            ) : (
                <div style={{ display: 'grid', gap: '1.25rem', marginTop: '1.5rem' }}>
                    {builds.map((build) => (
                        <BuildCard key={build.id} build={build} currentUserId={user.id} />
                    ))}
                </div>
            )}
        </main>
    );
}
