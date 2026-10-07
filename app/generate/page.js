import { redirect } from 'next/navigation';
import { getProfile, isProfileComplete, requireUser } from '../../lib/auth';
import { createClient } from '../../lib/supabase/server';
import { todaysChallenge } from '../../lib/challenges';
import { withDatabaseCars } from '../../lib/carCatalog';
import GenerateForm from './GenerateForm';

// The AI call runs inside the form's server action, which uses this page's limit.
// Up to three models are tried, 25 seconds each at most.
export const maxDuration = 90;

export default async function GeneratePage({ searchParams }) {
    const user = await requireUser();
    if (!isProfileComplete(await getProfile())) redirect('/profile');

    const { vibe } = await searchParams;

    // The built-in catalog, plus any cars added to the Car table.
    const supabase = await createClient();
    const { data: cars } = await supabase.from('Car').select('Brand, Model');
    const catalog = withDatabaseCars(cars ?? []);

    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '1rem' }}>Generate a build</h1>
            <p style={{ color: '#555' }}>
                Pick the car (chassis is optional) and the vibe. The AI designs a mod list, saves it, and everyone can vote on it.
                Don&apos;t own a car? Dream build it. Got one? Add a photo and the AI works with what it sees.
            </p>
            <GenerateForm
                userId={user.id}
                catalog={catalog}
                defaultVibe={typeof vibe === 'string' ? vibe.slice(0, 200) : todaysChallenge()}
            />
        </main>
    );
}
