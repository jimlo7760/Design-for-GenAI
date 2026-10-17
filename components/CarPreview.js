'use client';

import { useEffect, useState } from 'react';
import { Logo } from './BrandPicker';
import { examplePhoto, pinnedPhoto } from '../lib/carPhotos';
import { chassisYears } from '../lib/carYears';

// Photos found by live search on this page, so flipping back to a car doesn't ask again.
const found = new Map(); // "brand|model|chassis" -> photo

// A "your car" card under the pickers: a real photo of the exact car chosen, so it is clear
// which one it is. Every car in our catalog has a photo that was checked by hand
// (lib/carPhotos.js), shown instantly. A car we have never checked (one added to the Car table)
// gets a live search instead. `exact` is false when only the model is chosen but it has several
// generations (`chassisCodes`): then the newest generation we have a photo of is shown as an example.
export default function CarPreview({ brand, model, chassis, years, exact, chassisCodes }) {
    const key = [brand, model, chassis].join('|');
    const checked = exact ? pinnedPhoto(brand, model, chassis) : undefined; // photo, null (none exists) or undefined (never checked)
    const example = exact ? null : examplePhoto(brand, model, chassisCodes); // { photo, chassis } or null
    const liveLookup = exact && checked === undefined;

    const [result, setResult] = useState({ key: '', photo: null, unavailable: false }); // what the live search said for `key`
    const [brokenUrl, setBrokenUrl] = useState(''); // a photo that could not be displayed
    const [attempt, setAttempt] = useState(0); // bumped by "Try again" to search once more

    useEffect(() => {
        if (!liveLookup || found.has(key)) return;
        const controller = new AbortController();
        // Wait a moment so quickly flicking through the options doesn't ask for every one.
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/car-photo?${new URLSearchParams({ brand, model, chassis })}`, { signal: controller.signal });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const { photo, unavailable } = await response.json();
                if (photo) found.set(key, photo);
                setResult({ key, photo: photo ?? null, unavailable: Boolean(unavailable) });
            } catch (error) {
                if (error.name !== 'AbortError') setResult({ key, photo: null, unavailable: true });
            }
        }, 300);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [liveLookup, key, brand, model, chassis, attempt]);

    function tryAgain() {
        setResult({ key: '', photo: null, unavailable: false }); // back to "looking…"
        setAttempt((count) => count + 1);
    }

    // undefined = still looking, null = nothing to show.
    let photo;
    if (!liveLookup) photo = exact ? checked : example?.photo ?? null;
    else photo = found.get(key) ?? (result.key === key ? result.photo : undefined);
    if (photo && photo.url === brokenUrl) photo = null;

    // Wikimedia can be busy; say so rather than claiming that no photo exists.
    const couldNotCheck = liveLookup && !photo && result.key === key && result.unavailable;
    const exampleYears = example && chassisYears(brand, model, example.chassis);

    const name = `${brand} ${model}${chassis ? ` (${chassis})` : ''}`;
    const note =
        photo === undefined ? 'Looking for a photo…'
        : photo && exact ? `Not the car you meant? Change the model${chassisCodes.length > 0 ? ' or chassis' : ''} above.`
        : photo ? `An example: the ${example.chassis}${exampleYears ? ` (${exampleYears})` : ''}. Choose a chassis above to see that generation.`
        : couldNotCheck ? "Couldn't check for a photo just now, but you can still generate a build."
        : "We don't have a photo of this one yet, but the AI can still design a build for it.";

    return (
        <div className="car-preview" aria-live="polite">
            <div className="car-preview__media" style={photo ? { '--photo': `url("${photo.url}")` } : undefined}>
                {photo ? (
                    <img src={photo.url} alt={`Photo of a ${name}`} className="car-preview__img" onError={() => setBrokenUrl(photo.url)} />
                ) : photo === undefined ? (
                    <div className="skeleton" aria-hidden="true" />
                ) : (
                    <span className="brand-tile__logo car-preview__logo"><Logo name={brand} /></span>
                )}
            </div>
            <div className="car-preview__body">
                <p className="car-preview__label">Your car</p>
                <h3 className="car-preview__name">{name}</h3>
                {years && <p className="car-preview__years">Built {years}</p>}
                <p className="car-preview__note">
                    {note}
                    {couldNotCheck && (
                        <>
                            {' '}
                            <button type="button" className="link-btn" onClick={tryAgain}>Try again</button>
                        </>
                    )}
                </p>
                {photo && (
                    <p className="car-preview__credit">
                        Photo: {photo.credit} · {photo.license} ·{' '}
                        <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
                    </p>
                )}
            </div>
        </div>
    );
}
