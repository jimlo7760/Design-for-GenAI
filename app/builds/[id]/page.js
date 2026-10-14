import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import BuildCard from '../../../components/BuildCard';
import ShareButton from '../../../components/ShareButton';
import { getBuilds } from '../../../lib/builds';
import { getProfile, isProfileComplete, requireUser } from '../../../lib/auth';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A single build, with a link people can share. Only signed-in users can open it.
// The "Render this build" button's server action runs under this page's time limit.
export const maxDuration = 90;

export default async function BuildPage({ params }) {
    const user = await requireUser();
    if (!isProfileComplete(await getProfile())) redirect('/profile');

    const { id } = await params;
    if (!UUID.test(id)) notFound();

    const { builds } = await getBuilds({ id });
    if (builds.length === 0) notFound();

    return (
        <div className="page">
            <div className="container stack">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                    <Link href="/" className="btn btn--sm">← All builds</Link>
                    <ShareButton title={builds[0].title} />
                </div>
                <BuildCard build={builds[0]} currentUserId={user.id} detailed />
                <p className="muted small">
                    Share this page&apos;s link to get votes. Friends need to sign in with Google to vote.
                </p>
            </div>
        </div>
    );
}
