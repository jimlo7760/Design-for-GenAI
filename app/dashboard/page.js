import Link from 'next/link';
import { redirect } from 'next/navigation';
import Avatar from '../../components/Avatar';
import BuildCard from '../../components/BuildCard';
import { getBuilds } from '../../lib/builds';
import { fullName, getProfile, isProfileComplete, requireUser } from '../../lib/auth';

export const metadata = { title: 'My builds' };

// Only logged-in users can see this page: requireUser() sends everyone else to /login.
// The "Render this build" button's server action runs under this page's time limit.
export const maxDuration = 90;

export default async function DashboardPage() {
    const user = await requireUser();
    const profile = await getProfile();
    if (!isProfileComplete(profile)) redirect('/profile');

    const { builds } = await getBuilds({ userId: user.id, limit: 50 });
    const totalScore = builds.reduce((sum, build) => sum + build.score, 0);
    const totalUpvotes = builds.reduce((sum, build) => sum + build.upvotes, 0);

    const name = fullName(profile);
    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
        dateStyle: 'long',
        timeZone: 'UTC',
    });

    return (
        <div className="page">
            <div className="container container--wide stack">
                <div className="card profile-card">
                    <Avatar url={profile.avatar_url} name={name} size={64} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1>Welcome back, {profile.first_name}!</h1>
                        <p className="muted small">{user.email} · Member since {memberSince}</p>
                    </div>
                    <Link href="/profile" className="btn btn--sm">Edit profile</Link>
                </div>

                <div className="stats" aria-label="Your stats">
                    <div className="stat">
                        <div className="stat__value">{builds.length}</div>
                        <div className="stat__label">{builds.length === 1 ? 'Build' : 'Builds'}</div>
                    </div>
                    <div className="stat">
                        <div className="stat__value">{totalUpvotes}</div>
                        <div className="stat__label">Upvotes</div>
                    </div>
                    <div className="stat">
                        <div className="stat__value">{totalScore}</div>
                        <div className="stat__label">Total score</div>
                    </div>
                </div>

                <div className="row" style={{ justifyContent: 'space-between' }}>
                    <h2>Your builds</h2>
                    {builds.length > 0 && <Link href="/generate" className="btn btn--primary btn--sm">+ New build</Link>}
                </div>

                {builds.length === 0 ? (
                    <div className="empty">
                        <h2>No builds yet</h2>
                        <p>Your builds, and how the community votes on them, will show up here.</p>
                        <Link href="/generate" className="btn btn--primary">Generate your first build →</Link>
                    </div>
                ) : (
                    <div className="feed">
                        {builds.map((build) => (
                            <BuildCard key={build.id} build={build} currentUserId={user.id} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
