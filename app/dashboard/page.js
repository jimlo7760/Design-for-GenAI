import Link from 'next/link';
import { redirect } from 'next/navigation';
import Avatar from '../../components/Avatar';
import { fullName, getProfile, isProfileComplete, requireUser } from '../../lib/auth';

// Only logged-in users can see this page: requireUser() sends everyone else to /login.
export default async function DashboardPage() {
    const user = await requireUser();
    const profile = await getProfile();
    if (!isProfileComplete(profile)) redirect('/profile');

    const name = fullName(profile);
    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
        dateStyle: 'long',
        timeZone: 'UTC',
    });

    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '1rem' }}>Dashboard</h1>
            <p>Welcome back, {profile.first_name}! Only signed-in users can see this page.</p>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '1.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
            >
                <Avatar url={profile.avatar_url} name={name} size={64} />
                <div>
                    <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{name}</h2>
                    <p style={{ margin: 0, color: '#555' }}>{user.email}</p>
                    <p style={{ margin: 0, color: '#555' }}>Member since {memberSince}</p>
                </div>
            </div>

            <p><Link href="/profile">Edit your profile</Link></p>
        </main>
    );
}
