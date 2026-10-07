import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import BuildCard from '../../../components/BuildCard';
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
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
            <p style={{ margin: '0 0 1rem 0' }}><Link href="/">← All builds</Link></p>
            <BuildCard build={builds[0]} currentUserId={user.id} detailed />
            <p style={{ color: '#777', fontSize: '0.9rem' }}>
                Share this page&apos;s link to get votes. Friends need to sign in with Google to vote.
            </p>
        </main>
    );
}
