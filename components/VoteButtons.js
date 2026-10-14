'use client';

import { useState, useTransition } from 'react';
import { castVote } from '../app/actions';

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

    // Your own build: you can see how it is doing, but not vote on it.
    if (isOwner) {
        return (
            <div className="votes__own" title="You can't vote on your own build">
                <span className="pill pill--accent">Your build</span>
                <span aria-label={`${state.upvotes} upvotes and ${state.downvotes} downvotes`}>
                    ▲ {state.upvotes} · ▼ {state.downvotes}
                </span>
            </div>
        );
    }

    return (
        <div>
            <div className="votes">
                <div className="votes__group" role="group" aria-label="Vote on this build">
                    <button
                        type="button"
                        className="vote vote--up"
                        onClick={() => vote(1)}
                        disabled={pending}
                        aria-pressed={state.myVote === 1}
                        aria-label={`Upvote (${state.upvotes})`}
                        title={state.myVote === 1 ? 'Take back your upvote' : 'Upvote'}
                    >
                        ▲ {state.upvotes}
                    </button>
                    <button
                        type="button"
                        className="vote vote--down"
                        onClick={() => vote(-1)}
                        disabled={pending}
                        aria-pressed={state.myVote === -1}
                        aria-label={`Downvote (${state.downvotes})`}
                        title={state.myVote === -1 ? 'Take back your downvote' : 'Downvote'}
                    >
                        ▼ {state.downvotes}
                    </button>
                </div>
                <span className="score">Score <strong>{score}</strong></span>
            </div>
            {error && <p role="alert" className="alert" style={{ marginTop: '0.5rem' }}>{error}</p>}
        </div>
    );
}
