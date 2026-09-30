import { getProfile, isProfileComplete, requireUser } from '../../lib/auth';
import ProfileForm from './ProfileForm';

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
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '1rem' }}>Your profile</h1>

            {!isProfileComplete(profile) && (
                <p
                    style={{
                        margin: '1.5rem 0 0 0',
                        padding: '1rem',
                        background: '#fff8e1',
                        border: '1px solid #ffe082',
                        borderRadius: '8px',
                    }}
                >
                    <strong>Welcome!</strong> Please add your first and last name to finish setting up your account.
                </p>
            )}

            <ProfileForm
                userId={user.id}
                email={user.email}
                profile={profile}
                suggestedNames={suggestNames(user)}
            />
        </main>
    );
}
