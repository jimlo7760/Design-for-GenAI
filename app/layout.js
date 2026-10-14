import './globals.css';
import Header from '../components/Header';
import { getCurrentUser, getProfile } from '../lib/auth';

export const metadata = {
    title: {
        default: 'Mod Squad: AI car builds, voted by you',
        template: '%s · Mod Squad',
    },
    description: 'Pick a car, describe a vibe, and AI designs the build. The community votes on which ones deserve to exist.',
};

export default async function RootLayout({ children }) {
    const user = await getCurrentUser();
    const profile = await getProfile();

    return (
        <html lang="en">
            <body>
                <a href="#main" className="skip-link">Skip to content</a>
                <Header user={user} profile={profile} />
                <main id="main" tabIndex={-1} className="main">
                    {children}
                </main>
                <footer className="site-footer">
                    <div className="container">
                        Mod Squad · Builds designed by Google Gemini · Stock photos from Wikimedia Commons
                    </div>
                </footer>
            </body>
        </html>
    );
}
