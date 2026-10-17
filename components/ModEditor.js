'use client';

import { useEffect, useRef, useState } from 'react';
import ModItem from './ModItem';
import { MAX_MODS, partKey, partSearchUrl } from '../lib/mods';

const IDEAS = ['Exhaust', 'Coilovers', 'Wheels', 'Brake kit', 'Intake', 'ECU tune', 'Rear wing', 'Seats'];

// How sure the AI is that a suggestion fits this exact car.
const FITMENT = {
    confirmed: { label: 'Should fit', className: 'pill pill--up' },
    likely: { label: 'Likely fits', className: 'pill pill--accent' },
    check: { label: 'Check fitment', className: 'pill pill--warn' },
};

const money = (amount) => `$${amount.toLocaleString('en-US')}`;

// Asks the server to look a part up. A route handler (not a Server Action), so a slow search never
// holds up the other buttons on this page.
async function searchParts({ buildId, query, signal }) {
    const response = await fetch('/api/part-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildId, query }),
        signal,
    });
    // Not JSON at all usually means the session ended and we were sent to the sign-in page.
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || 'Could not search for that part right now. Please try again.');
    if (!data || !Array.isArray(data.options)) throw new Error('Could not read the answer. Reload the page (you may need to sign in again) and try once more.');
    return data;
}

// The owner's view of a build's parts: take parts the AI chose off the list, look up parts you want
// and add them, or put the AI's list back. The Server Actions come in as props (onRemove, onAdd,
// onReset) and `search` can be swapped, so the editor can be tried out without a database.
export default function ModEditor({ buildId, car, mods: savedMods, edited: savedEdited = false, onRemove, onAdd, onReset, search = searchParts }) {
    const [mods, setMods] = useState(savedMods);
    const [edited, setEdited] = useState(savedEdited);
    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [undo, setUndo] = useState(null); // { mod, index } of the part just taken off
    const [focusIndex, setFocusIndex] = useState(null);

    // A fresh copy from the server (after an edit is saved) replaces what we hold.
    useEffect(() => setMods(savedMods), [savedMods]);
    useEffect(() => setEdited(savedEdited), [savedEdited]);

    // The Undo link stays for a few seconds.
    useEffect(() => {
        if (!undo) return;
        const timer = setTimeout(() => setUndo(null), 12000);
        return () => clearTimeout(timer);
    }, [undo]);

    // After a part is removed or put back, keyboard focus would be lost with the button that was
    // used: move it to the Remove button of the part now at that place.
    useEffect(() => {
        if (focusIndex === null) return;
        document.getElementById(`remove-${focusIndex}`)?.focus();
        setFocusIndex(null);
    }, [focusIndex, mods]);

    // Runs a Server Action and turns a failure, even a dropped connection, into { error }.
    async function call(action) {
        setBusy(true);
        setError('');
        try {
            return await action();
        } catch {
            return { error: 'Something went wrong. Check your connection and try again.' };
        } finally {
            setBusy(false);
        }
    }

    function apply(result) {
        setMods(result.mods);
        setEdited(true);
    }

    async function remove(index) {
        const mod = mods[index];
        setUndo(null);
        const result = await call(() => onRemove(buildId, index, mod.part));
        if (result.error) return setError(result.error);
        apply(result);
        setUndo({ mod: result.removed ?? mod, index });
        setFocusIndex(Math.min(index, result.mods.length - 1));
    }

    // Used by the part search and by Undo. Resolves to true when the part was added.
    async function addPart(mod, index) {
        const result = await call(() => onAdd(buildId, mod, index));
        if (result.error) {
            setError(result.error);
            return false;
        }
        apply(result);
        return true;
    }

    async function restore() {
        const { mod, index } = undo;
        setUndo(null);
        if (await addPart(mod, index)) setFocusIndex(index);
    }

    async function reset() {
        if (!window.confirm('Put the list back exactly as the AI wrote it? The parts you changed will be lost.')) return;
        setUndo(null);
        const result = await call(() => onReset(buildId));
        if (result.error) return setError(result.error);
        setMods(result.mods);
        setEdited(false);
    }

    const full = mods.length >= MAX_MODS;
    const onlyOne = mods.length <= 1;

    return (
        <div className="editor">
            <div className="editor__bar">
                <p className="muted small">{edited ? 'You have edited the list the AI wrote.' : 'This is the list the AI wrote. Not right? Change it.'}</p>
                <button type="button" className="btn btn--sm" onClick={() => setEditing(!editing)}>
                    {editing ? 'Done editing' : '✎ Edit parts'}
                </button>
            </div>

            <ul className="mods">
                {mods.map((mod, index) => (
                    <ModItem
                        key={`${index}-${mod.part}`}
                        mod={mod}
                        addedLabel="Added by you"
                        action={editing ? (
                            <button
                                type="button"
                                id={`remove-${index}`}
                                className="btn btn--sm btn--danger mod__remove"
                                aria-label={`Remove ${mod.part}`}
                                disabled={busy || onlyOne}
                                onClick={() => remove(index)}
                            >
                                Remove
                            </button>
                        ) : null}
                    />
                ))}
            </ul>

            {editing && onlyOne && <p className="hint editor__note">A build needs at least one part. Add another before taking this one off.</p>}
            {error && <p role="alert" className="alert editor__note">{error}</p>}
            {undo && (
                <p role="status" className="editor__undo editor__note">
                    Removed “{undo.mod.part}”.{' '}
                    <button type="button" className="link-btn" onClick={restore} disabled={busy}>Undo</button>
                </p>
            )}

            {editing && (
                <>
                    <PartSearch buildId={buildId} car={car} mods={mods} full={full} busy={busy} addPart={addPart} search={search} />
                    {edited && (
                        <p className="editor__reset">
                            <button type="button" className="link-btn small" onClick={reset} disabled={busy}>Reset to the AI’s list</button>
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

// "Look for a part": type what you want, get up to three suggestions for this car, add one.
function PartSearch({ buildId, car, mods, full, busy, addPart, search }) {
    const [query, setQuery] = useState('');
    const [asked, setAsked] = useState(''); // what the results on screen were searched for
    const [phase, setPhase] = useState('idle'); // idle | loading | done | error
    const [options, setOptions] = useState([]);
    const [note, setNote] = useState('');
    const [problem, setProblem] = useState('');
    const [notice, setNotice] = useState('');
    const request = useRef(null);

    // Stop waiting for an answer nobody will see.
    useEffect(() => () => request.current?.abort(), []);

    async function run(text) {
        text = text.trim();
        if (text.length < 2) return;

        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setQuery(text);
        setAsked(text);
        setPhase('loading');
        setOptions([]);
        setNote('');
        setProblem('');
        setNotice('');
        try {
            const data = await search({ buildId, query: text, signal: controller.signal });
            setOptions(Array.isArray(data.options) ? data.options : []);
            setNote(data.note ?? '');
            setPhase('done');
        } catch (failure) {
            if (failure.name === 'AbortError') return;
            setProblem(failure.message);
            setPhase('error');
        }
    }

    function submit(event) {
        event.preventDefault();
        run(query);
    }

    async function pick(option) {
        setNotice('');
        const added = await addPart({ category: option.category, part: option.part, detail: option.detail, cost_usd: option.cost_usd, source: 'you' });
        if (added) setNotice(`Added “${option.part}” to your list.`);
    }

    // When the search finds nothing (or fails) the owner can still put their own wording on the list.
    async function pickTyped() {
        const part = query.trim();
        setNotice('');
        if (await addPart({ category: 'Other', part, detail: '', source: 'you' })) setNotice(`Added “${part}” to your list.`);
    }

    const typed = query.trim();
    const canAddTyped = typed.length >= 2 && (phase === 'error' || (phase === 'done' && options.length === 0));
    const searching = phase === 'loading';

    return (
        <section className="research" aria-labelledby="research-title">
            <h3 id="research-title" className="research__title">Look for a part</h3>
            <p className="muted small">Say what you want on your {car}. The AI suggests options that fit, with rough prices.</p>

            <form className="research__form" onSubmit={submit}>
                <label htmlFor="part-query" className="sr-only">The part you are looking for</label>
                <input
                    id="part-query"
                    className="input"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    maxLength={80}
                    placeholder="e.g. coilovers, Brembo brake kit, carbon rear wing"
                    autoComplete="off"
                />
                <button type="submit" className="btn btn--primary" disabled={searching || typed.length < 2}>
                    {searching ? 'Searching…' : 'Search'}
                </button>
            </form>

            <div className="chips" role="group" aria-label="Part ideas: tap one to search for it">
                {IDEAS.map((idea) => (
                    <button key={idea} type="button" className="chip-btn" onClick={() => run(idea)} disabled={searching}>
                        {idea}
                    </button>
                ))}
            </div>

            {searching && (
                <div role="status">
                    <p className="muted small">Looking for “{asked}” that fits your {car}…</p>
                    <div className="skeleton research__skeleton" aria-hidden="true" />
                </div>
            )}

            {phase === 'error' && <p role="alert" className="alert">{problem}</p>}

            {phase === 'done' && options.length > 0 && (
                <>
                    <p className="muted small">Results for “{asked}”:</p>
                    <ul className="options">
                        {options.map((option) => {
                            const fit = FITMENT[option.fitment] ?? FITMENT.check;
                            const onList = mods.some((mod) => partKey(mod.part) === partKey(option.part));
                            const range = option.price_low !== option.price_high ? ` (usually ${money(option.price_low)} to ${money(option.price_high)})` : '';
                            return (
                                <li key={option.part} className="option">
                                    <div className="option__head">
                                        <strong className="option__part">{option.part}</strong>
                                        <span className="pill">{option.category}</span>
                                        <span className={fit.className}>{fit.label}</span>
                                    </div>
                                    <p className="option__detail">{option.detail}</p>
                                    <p className="option__meta">
                                        {option.cost_usd !== null && <span><strong>About {money(option.cost_usd)}</strong>{range}</span>}
                                        <a href={partSearchUrl(option.part, car)} target="_blank" rel="noopener noreferrer">Check price and fitment ↗</a>
                                    </p>
                                    <button type="button" className="btn btn--primary btn--sm" onClick={() => pick(option)} disabled={busy || onList || full}>
                                        {onList ? 'On your list ✓' : full ? 'List is full' : 'Add to my build'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {note && <p className="muted small">{note}</p>}
                    <p className="hint">These suggestions come from the AI’s general knowledge, not a live shop catalogue. Prices are rough and fitment can change by model year, so check with the seller before you buy.</p>
                </>
            )}

            {phase === 'done' && options.length === 0 && <p className="research__empty">{note}</p>}

            {canAddTyped && (
                <p className="small">
                    <button type="button" className="link-btn" onClick={pickTyped} disabled={busy || full}>Add “{typed}” to my list as I typed it</button>
                </p>
            )}

            {full && <p className="hint">The list is full (up to {MAX_MODS} parts). Remove one to add another.</p>}
            {notice && <p role="status" className="research__notice">{notice}</p>}
        </section>
    );
}
