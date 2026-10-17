import Link from 'next/link';
import Avatar from './Avatar';
import NavLinks from './NavLinks';
import WheelMark from './WheelMark';
import { fullName } from '../lib/auth';

// Logged-out visitors only see the app name; the links and account menu appear after login.
export default function Header({ user, profile }) {
    const name = fullName(profile) || user?.email;

    return (
        <header className="site-header">
            <div className="container container--wide site-header__inner">
                <Link href="/" className="brand">
                    <WheelMark className="brand__wheel" />
                    <span className="brand__word">Mod <span className="brand__accent">Squad</span></span>
                </Link>

                {user && <NavLinks />}

                {user && (
                    <div className="user-menu">
                        <Link href="/profile" className="user-menu__profile" aria-label={`Your profile (${name})`}>
                            <Avatar url={profile?.avatar_url} name={name} size={32} />
                            <span className="user-menu__name">{name}</span>
                        </Link>
                        <form action="/auth/signout" method="post">
                            <button type="submit" className="btn btn--sm btn--header">Sign out</button>
                        </form>
                    </div>
                )}
            </div>
        </header>
    );
}
