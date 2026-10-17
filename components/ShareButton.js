'use client';

import { useState } from 'react';
import Icon from './Icon';

// Copies this page's link (or opens the phone's share sheet) so people can get votes.
export default function ShareButton({ title }) {
    const [status, setStatus] = useState('');

    async function share() {
        const url = window.location.href;
        try {
            if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
                await navigator.share({ title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setStatus('Link copied!');
        } catch (error) {
            if (error?.name === 'AbortError') return; // closed the share sheet
            setStatus('Copy the link from your address bar.');
        }
        setTimeout(() => setStatus(''), 3000);
    }

    return (
        <span className="row" style={{ gap: '0.6rem' }}>
            <button type="button" className="btn btn--sm" onClick={share}><Icon name="link" size={16} /> Share this build</button>
            <span role="status" className="small muted">{status}</span>
        </span>
    );
}
