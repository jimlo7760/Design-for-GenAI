'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Shown if a page crashes, instead of a blank screen.
export default function Error({ error, retry }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="page">
            <div className="container">
                <div className="empty">
                    <h2>Something went wrong</h2>
                    <p>We couldn&apos;t load this page. It&apos;s probably temporary.</p>
                    <div className="row" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                        <button type="button" className="btn btn--primary" onClick={() => retry()}>Try again</button>
                        <Link href="/" className="btn">Back to the feed</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
