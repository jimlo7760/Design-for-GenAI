import { getProfile, isProfileComplete, requireUser } from '../../lib/auth';
import ProfileForm from './ProfileForm';

export const metadata = { title: 'Your profile' };

// Google shares the user's name with us; use it to pre-fill the form.
function suggestNames(user) {
    const meta = user.user_metadata ?? {};
    const [firstWord = '', ...rest] = (meta.full_name ?? meta.name ?? '').split(' ');
    return {
        firstName: meta.given_name ?? firstWord,
        lastName: meta.family_name ?? rest.join(' '),
    };
}

export default async function ProfilePage() {
    const user = await requireUser();
    const profile = await getProfile();

    return (
        <div className="page">
            <div className="container stack">
                <div className="page-head" style={{ marginBottom: 0 }}>
                    <h1>Your profile</h1>
                </div>

                {!isProfileComplete(profile) && (
                    <p className="notice">
                        <strong>Welcome to Mod Squad!</strong> Add your first and last name to finish setting up. It&apos;s shown next to the builds you make.
                    </p>
                )}

                <ProfileForm
                    userId={user.id}
                    email={user.email}
                    profile={profile}
                    suggestedNames={suggestNames(user)}
                />
            </div>
        </div>
    );
}
