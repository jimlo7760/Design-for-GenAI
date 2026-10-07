'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBuild } from '../app/actions';

export default function DeleteBuildButton({ buildId, redirectTo }) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [pending, startTransition] = useTransition();

    function remove() {
        if (!window.confirm('Delete this build and its votes? This can\'t be undone.')) return;
        startTransition(async () => {
            const result = await deleteBuild(buildId);
            if (result.error) setError(result.error);
            else if (redirectTo) router.push(redirectTo);
        });
    }

    return (
        <span>
            <button
                type="button"
                onClick={remove}
                disabled={pending}
                style={{
                    padding: '0.3rem 0.7rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    background: '#fff',
                    color: '#b00020',
                    cursor: 'pointer',
                }}
            >
                {pending ? 'Deleting…' : 'Delete'}
            </button>
            {error && <span role="alert" style={{ color: '#b00020', marginLeft: '0.5rem' }}>{error}</span>}
        </span>
    );
}
