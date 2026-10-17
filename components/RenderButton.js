'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { renderBuild } from '../app/actions';
import Icon from './Icon';

// Shown to the owner of a build that has no AI render yet.
export default function RenderButton({ buildId }) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [pending, startTransition] = useTransition();

    function render() {
        setError('');
        startTransition(async () => {
            const result = await renderBuild(buildId);
            if (result.error) setError(result.error);
            else router.refresh(); // shows the new image
        });
    }

    return (
        <div className="render-box">
            <div className="row">
                <button type="button" className="btn btn--primary btn--sm" onClick={render} disabled={pending}>
                    <Icon name="camera" size={16} />
                    {pending ? 'Rendering… (about 20s)' : 'Render this build with AI'}
                </button>
                <span className="muted small">
                    Shows your parts on the car, so finish editing the list first. One render per build, 5 per day.
                </span>
            </div>
            {pending && <p className="muted small" role="status" style={{ marginTop: '0.5rem' }}>Hang tight: the AI is editing your car&apos;s photo.</p>}
            {error && <p role="alert" className="alert" style={{ marginTop: '0.5rem' }}>{error}</p>}
        </div>
    );
}
