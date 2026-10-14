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

    // Builds on this page that the user could still vote on.
    const waiting = builds.filter((build) => build.user_id !== user.id && build.myVote === 0).length;

    return (
        <div className="page">
            <div className="container stack">
                <div className="page-head" style={{ marginBottom: 0 }}>
                    <div>
                        <h1>Vote on AI-designed car builds</h1>
                        <p>
                            Pick a car, describe a vibe, and the AI designs the build. Then the community votes on which ones deserve to exist.
                        </p>
                    </div>
                </div>

                <div className="banner">
                    <div>
                        <p className="banner__label">Today&apos;s challenge</p>
                        <p className="banner__text">{challenge}</p>
                    </div>
                    <Link href={`/generate?vibe=${encodeURIComponent(challenge)}`} className="btn btn--primary btn--sm">
                        Take the challenge →
                    </Link>
                </div>

                <div className="row" style={{ justifyContent: 'space-between' }}>
                    <nav aria-label="Sort builds" className="tabs">
                        {SORTS.map((option) => (
                            <Link
                                key={option.key}
                                href={option.key === 'new' ? '/' : `/?sort=${option.key}`}
                                aria-current={sort === option.key ? 'page' : undefined}
                                className="tab"
                            >
                                {option.label}
                            </Link>
                        ))}
                    </nav>
                    <Link href="/judge" className="btn btn--sm">
                        Judge mode{waiting > 0 && <span className="pill pill--accent">{waiting} to rate</span>}
                    </Link>
                </div>

                {error ? (
                    <p role="alert" className="alert">Could not load builds: {error}</p>
                ) : builds.length === 0 ? (
                    <div className="empty">
                        <h2>{sort === 'today' ? 'Nothing in the last 24 hours' : 'No builds yet'}</h2>
                        <p>{sort === 'today' ? 'Be the first to put a build on today\'s board.' : 'Be the first to design one.'}</p>
                        <Link href="/generate" className="btn btn--primary">Generate a build →</Link>
                    </div>
                ) : (
                    <div className="stack">
                        {builds.map((build) => (
                            <BuildCard key={build.id} build={build} currentUserId={user.id} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
