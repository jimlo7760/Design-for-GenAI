'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
    { href: '/', label: 'Feed' },
    { href: '/judge', label: 'Judge' },
    { href: '/dashboard', label: 'My builds' },
];

// The feed also counts as "current" while you're looking at one build from it.
function isCurrent(pathname, href) {
    if (href === '/') return pathname === '/' || pathname.startsWith('/builds/');
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLinks() {
    const pathname = usePathname();

    return (
        <nav className="nav" aria-label="Main">
            {LINKS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="nav__link"
                    aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
                >
                    {link.label}
                </Link>
            ))}
            <Link
                href="/generate"
                className="nav__cta"
                aria-current={pathname === '/generate' ? 'page' : undefined}
            >
                + New build
            </Link>
        </nav>
    );
}
