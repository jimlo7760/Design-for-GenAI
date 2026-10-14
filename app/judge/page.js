import Link from 'next/link';
import { redirect } from 'next/navigation';
import BuildCard from '../../components/BuildCard';
import { getJudgeQueue } from '../../lib/builds';
import { getProfile, isProfileComplete, requireUser } from '../../lib/auth';
import JudgeDeck from './JudgeDeck';

export const metadata = { title: 'Judge builds' };

// Judge mode: one build at a time, big vote buttons, straight on to the next.
// Only signed-in users can open it: requireUser() sends everyone else to /login.
export default async function JudgePage() {
    const user = await requireUser();
    if (!isProfileComplete(await getProfile())) redirect('/profile');

    const { builds, error } = await getJudgeQueue(user.id);

    return (
        <div className="page">
            <div className="container">
                <div className="page-head">
                    <div>
                        <h1>Judge builds</h1>
                        <p>
                            One build at a time. Scores are hidden until you vote, so you rate what you see, not what the crowd thinks.
                        </p>
                    </div>
                </div>

                {error ? (
                    <p role="alert" className="alert">Could not load builds: {error}</p>
                ) : builds.length === 0 ? (
                    <div className="empty">
                        <h2>You&apos;re all caught up</h2>
                        <p>There&apos;s nothing left for you to vote on right now. New builds show up here as soon as people make them.</p>
                        <Link href="/generate" className="btn btn--primary">Make a build of your own</Link>
                    </div>
                ) : (
                    <JudgeDeck
                        items={builds.map((build) => ({
                            id: build.id,
                            title: build.title,
                            card: <BuildCard build={build} currentUserId={user.id} deck />,
                        }))}
                    />
                )}
            </div>
        </div>
    );
}
