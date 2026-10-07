'use client';

import { useState, useTransition } from 'react';
import { castVote } from '../app/actions';

const buttonStyle = (active, color) => ({
    padding: '0.4rem 0.8rem',
    fontSize: '1rem',
    border: `1px solid ${active ? color : '#ccc'}`,
    borderRadius: '6px',
    background: active ? color : '#fff',
    color: active ? '#fff' : '#333',
    cursor: 'pointer',
});

// Clicking your current vote again takes it back. The numbers update instantly and
// are replaced by the server's real totals as soon as they arrive.
export default function VoteButtons({ buildId, upvotes, downvotes, myVote, isOwner }) {
    const [state, setState] = useState({ upvotes, downvotes, myVote });
    const [error, setError] = useState('');
    const [pending, startTransition] = useTransition();

    function vote(clicked) {
        const next = state.myVote === clicked ? 0 : clicked;
        const previous = state;
        setError('');

        setState({
            myVote: next,
            upvotes: state.upvotes - (previous.myVote === 1 ? 1 : 0) + (next === 1 ? 1 : 0),
            downvotes: state.downvotes - (previous.myVote === -1 ? 1 : 0) + (next === -1 ? 1 : 0),
        });

        startTransition(async () => {
            const result = await castVote(buildId, next);
            if (result.error) {
                setState(previous);
                setError(result.error);
            } else {
                setState({ myVote: next, upvotes: result.upvotes, downvotes: result.downvotes });
            }
        });
    }

    const score = state.upvotes - state.downvotes;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                    type="button"
                    onClick={() => vote(1)}
                    disabled={isOwner || pending}
                    aria-pressed={state.myVote === 1}
                    aria-label="Upvote"
                    title={isOwner ? "You can't vote on your own build" : 'Upvote'}
                    style={{ ...buttonStyle(state.myVote === 1, '#2e7d32'), opacity: isOwner ? 0.4 : 1 }}
                >
                    ▲ {state.upvotes}
                </button>
                <button
                    type="button"
                    onClick={() => vote(-1)}
                    disabled={isOwner || pending}
                    aria-pressed={state.myVote === -1}
                    aria-label="Downvote"
                    title={isOwner ? "You can't vote on your own build" : 'Downvote'}
                    style={{ ...buttonStyle(state.myVote === -1, '#c62828'), opacity: isOwner ? 0.4 : 1 }}
                >
                    ▼ {state.downvotes}
                </button>
                <span style={{ color: '#555', marginLeft: '0.25rem' }}>Score {score}</span>
            </div>
            {error && <p role="alert" style={{ color: '#b00020', margin: '0.5rem 0 0 0' }}>{error}</p>}
        </div>
    );
}
