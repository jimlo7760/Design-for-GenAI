import './globals.css';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import Header from '../components/Header';
import { getCurrentUser, getProfile } from '../lib/auth';

// Barlow was drawn from California highway signs and license plates, so it reads like the
// lettering on a car. The condensed cut is for headings, plates and numbers; the italic cut is
// only the wordmark and the landing headline.
const text = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-barlow' });
const heading = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-barlow-condensed' });
const headingItalic = Barlow_Condensed({
    subsets: ['latin'],
    weight: '800',
    style: 'italic',
    variable: '--font-barlow-condensed-italic',
});

export const metadata = {
    title: {
        default: 'Mod Squad: AI car builds, voted by you',
        template: '%s · Mod Squad',
    },
    description: 'Pick a car, describe a vibe, and AI designs the build. The community votes on which ones deserve to exist.',
};

// Tints the phone's browser bar to match the header.
export const viewport = { themeColor: '#0c0c0a' };

export default async function RootLayout({ children }) {
    const user = await getCurrentUser();
    const profile = await getProfile();

    return (
        <html lang="en" className={`${text.variable} ${heading.variable} ${headingItalic.variable}`}>
            <body>
                <a href="#main" className="skip-link">Skip to content</a>
                <Header user={user} profile={profile} />
                <main id="main" tabIndex={-1} className="main">
                    {children}
                </main>
                <footer className="site-footer">
                    <div className="container container--wide site-footer__inner">
                        <span className="site-footer__name">Mod Squad</span>
                        <span>Builds designed by Google Gemini · Stock photos from Wikimedia Commons · Car logos belong to their owners</span>
                    </div>
                </footer>
            </body>
        </html>
    );
}
