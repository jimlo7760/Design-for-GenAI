'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { renderBuild } from '../app/actions';

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
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f5f7ff', border: '1px solid #e0e4ff', borderRadius: '8px', fontSize: '0.9rem' }}>
            <button
                type="button"
                onClick={render}
                disabled={pending}
                style={{
                    padding: '0.45rem 1rem',
                    fontSize: '0.95rem',
                    color: '#fff',
                    background: '#3f51b5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: pending ? 'default' : 'pointer',
                }}
            >
                {pending ? 'Rendering… (about 20s)' : 'Render this build with AI'}
            </button>
            <span style={{ marginLeft: '0.75rem', color: '#555' }}>
                Shows your mods on the car. One render per build, 5 per day.
            </span>
            {error && <p role="alert" style={{ color: '#b00020', margin: '0.5rem 0 0 0' }}>{error}</p>}
        </div>
    );
}
