'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { castVote } from '../actions';

// items: [{ id, title, card }] where `card` is a server-rendered BuildCard.
// Keyboard: → upvote, ← downvote, S skip, Z undo.
export default function JudgeDeck({ items }) {
    // Our own copy, so the deck never shifts underneath you if the page re-renders.
    const [queue] = useState(items);
    const [index, setIndex] = useState(0);
    const [history, setHistory] = useState([]); // [{ id, title, value }] value 0 = skipped
    const [error, setError] = useState('');
    const [pending, startTransition] = useTransition();

    const current = queue[index];
    const last = history[history.length - 1];

    function rate(value) {
        if (!current || pending) return;
        const item = current;
        setError('');
        startTransition(async () => {
            const result = await castVote(item.id, value);
            if (result.error) {
                setError(result.error);
                return;
            }
            setHistory((entries) => [...entries, { id: item.id, title: item.title, value }]);
            setIndex((position) => position + 1);
        });
    }

    function skip() {
        if (!current || pending) return;
        setError('');
        setHistory((entries) => [...entries, { id: current.id, title: current.title, value: 0 }]);
        setIndex((position) => position + 1);
    }

    function undo() {
        if (!last || pending) return;
        setError('');
        startTransition(async () => {
            if (last.value !== 0) {
                const result = await castVote(last.id, 0); // 0 takes the vote back
                if (result.error) {
                    setError(result.error);
                    return;
                }
            }
            setHistory((entries) => entries.slice(0, -1));
            setIndex((position) => position - 1);
        });
    }

    // Each new build starts at the top of the page.
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [index]);

    useEffect(() => {
        function onKeyDown(event) {
            if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
            if (event.key === 'ArrowRight') rate(1);
            else if (event.key === 'ArrowLeft') rate(-1);
            else if (event.key === 's' || event.key === 'S') skip();
            else if (event.key === 'z' || event.key === 'Z') undo();
            else return;
            event.preventDefault();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    });

    const undoToast = last && (
        <div className="toast" role="status">
            <span>
                {last.value === 1 ? 'Upvoted' : last.value === -1 ? 'Downvoted' : 'Skipped'} “{last.title}”
            </span>
            <button type="button" className="link-btn" onClick={undo} disabled={pending}>
                Undo <span className="kbd">Z</span>
            </button>
        </div>
    );

    if (!current) {
        const up = history.filter((entry) => entry.value === 1).length;
        const down = history.filter((entry) => entry.value === -1).length;
        const skipped = history.filter((entry) => entry.value === 0).length;
        return (
            <div className="stack">
                <div className="empty">
                    <h2>That&apos;s the lot!</h2>
                    <p>
                        You rated {up + down} {up + down === 1 ? 'build' : 'builds'} ({up} up, {down} down)
                        {skipped > 0 && ` and skipped ${skipped}`}.
                    </p>
                    <div className="row" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                        <Link href="/?sort=today" className="btn btn--primary">See today&apos;s top builds</Link>
                        <Link href="/generate" className="btn">Make your own</Link>
                        {/* A real link (not <Link>) so the queue is fetched afresh. */}
                        <a href="/judge" className="btn">Check for new builds</a>
                    </div>
                </div>
                {undoToast}
                {error && <p role="alert" className="alert">{error}</p>}
            </div>
        );
    }

    return (
        <div className="deck">
            <p className="sr-only" role="status">
                Build {index + 1} of {queue.length}: {current.title}
            </p>
            <div className="deck__bar" aria-hidden="true">
                <span className="nowrap">{index + 1} of {queue.length}</span>
                <div className="deck__track">
                    <div className="deck__fill" style={{ width: `${(index / queue.length) * 100}%` }} />
                </div>
            </div>

            <div key={current.id}>{current.card}</div>

            <div className="deck__dock">
                {error && <p role="alert" className="alert" style={{ marginBottom: '0.6rem' }}>{error}</p>}
                {undoToast && <div style={{ marginBottom: '0.6rem' }}>{undoToast}</div>}
                <div className="deck__actions">
                    <button type="button" className="btn btn--lg btn--vote-down" onClick={() => rate(-1)} disabled={pending}>
                        <span aria-hidden="true">▼</span> Downvote <span className="kbd" aria-hidden="true">←</span>
                    </button>
                    <button type="button" className="btn btn--lg btn--vote-up" onClick={() => rate(1)} disabled={pending}>
                        <span aria-hidden="true">▲</span> Upvote <span className="kbd" aria-hidden="true">→</span>
                    </button>
                    <button type="button" className="btn btn--skip" onClick={skip} disabled={pending}>
                        Skip for now <span className="kbd" aria-hidden="true">S</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
