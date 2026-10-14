import { redirect } from 'next/navigation';
import { getProfile, isProfileComplete, requireUser } from '../../lib/auth';
import { createClient } from '../../lib/supabase/server';
import { todaysChallenge } from '../../lib/challenges';
import { withDatabaseCars } from '../../lib/carCatalog';
import GenerateForm from './GenerateForm';

export const metadata = { title: 'New build' };

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
        <div className="page">
            <div className="container">
                <div className="page-head">
                    <div>
                        <h1>Generate a build</h1>
                        <p>
                            Pick the car and the vibe, and the AI designs a full mod list for the community to vote on.
                            Don&apos;t own the car? Dream build it.
                        </p>
                    </div>
                </div>
                <GenerateForm
                    userId={user.id}
                    catalog={catalog}
                    defaultVibe={typeof vibe === 'string' ? vibe.slice(0, 200) : todaysChallenge()}
                />
            </div>
        </div>
    );
}
