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
            <button type="button" className="btn btn--sm btn--danger" onClick={remove} disabled={pending}>
                {pending ? 'Deleting…' : 'Delete'}
            </button>
            {error && <span role="alert" className="small" style={{ color: 'var(--down)', marginLeft: '0.5rem' }}>{error}</span>}
        </span>
    );
}
