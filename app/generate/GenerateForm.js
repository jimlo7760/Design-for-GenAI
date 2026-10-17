'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { createBuild } from '../actions';
import BrandPicker, { OTHER_BRAND as OTHER } from '../../components/BrandPicker';
import CarPreview from '../../components/CarPreview';
import { chassisYears } from '../../lib/carYears';
import { VIBE_IDEAS } from '../../lib/challenges';

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const PHOTO_EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Shown in turn while the AI works, so the wait feels like progress.
const PROGRESS_MESSAGES = [
    'Pulling up the spec sheet…',
    'Choosing parts that fit the vibe…',
    'Keeping it road-legal…',
    'Pricing the build…',
    'Finding a photo of the car…',
    'Almost there…',
];

// catalog: { Brand: { Model: [chassis, ...] } }
export default function GenerateForm({ userId, catalog, defaultVibe }) {
    const router = useRouter();
    const photoInput = useRef(null);
    const nextStep = useRef(null); // the field that follows the brand: Model, or the typed-in car
    const scrollToNextStep = useRef(false);
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [chassis, setChassis] = useState('');
    const [otherCar, setOtherCar] = useState(''); // typed when brand is "Other"
    const [vibe, setVibe] = useState(defaultVibe);
    const [photo, setPhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | uploading | generating
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const isOther = brand === OTHER;
    const models = brand && !isOther ? Object.keys(catalog[brand] ?? {}) : [];
    const chassisOptions = model ? catalog[brand]?.[model] ?? [] : [];

    // A small thumbnail of the chosen photo.
    useEffect(() => {
        if (!photo) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(photo);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [photo]);

    useEffect(() => {
        if (status !== 'generating') return;
        setProgress(0);
        const timer = setInterval(() => setProgress((step) => Math.min(step + 1, PROGRESS_MESSAGES.length - 1)), 3500);
        return () => clearInterval(timer);
    }, [status]);

    // Changing a choice clears the ones that depend on it.
    function chooseBrand(value, byPointer = false) {
        setBrand(value);
        setModel('');
        setChassis('');
        scrollToNextStep.current = byPointer;
    }

    // After tapping a logo, the next field can sit below the fold on a phone: bring it into
    // view once it has rendered. Arrow-key changes don't scroll, so the keyboard isn't yanked away.
    useEffect(() => {
        if (!scrollToNextStep.current) return;
        scrollToNextStep.current = false;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        nextStep.current?.scrollIntoView({ block: 'nearest', behavior: motion });
    }, [brand]);
    function chooseModel(value) {
        setModel(value);
        setChassis('');
    }

    function choosePhoto(event) {
        const file = event.target.files?.[0];
        setError('');
        if (!file) return setPhoto(null);
        if (!PHOTO_EXTENSIONS[file.type]) {
            event.target.value = '';
            return setError('Please choose a JPG, PNG or WebP photo.');
        }
        if (file.size > MAX_PHOTO_BYTES) {
            event.target.value = '';
            return setError('That photo is over 4 MB. Please choose a smaller one.');
        }
        setPhoto(file);
    }

    function removePhoto() {
        if (photoInput.current) photoInput.current.value = '';
        setPhoto(null);
    }

    async function submit(event) {
        event.preventDefault();
        setError('');

        let photoPath = null;
        const supabase = createClient();
        const bucket = supabase.storage.from('car-photos');

        if (photo) {
            setStatus('uploading');
            // Each user writes only inside their own folder (see supabase/assignment4.sql).
            photoPath = `${userId}/${Date.now()}.${PHOTO_EXTENSIONS[photo.type]}`;
            const { error: uploadError } = await bucket.upload(photoPath, photo, { contentType: photo.type });
            if (uploadError) {
                setStatus('idle');
                return setError(uploadError.message);
            }
        }

        setStatus('generating');
        const result = await createBuild({
            brand: isOther ? '' : brand,
            model: isOther ? otherCar : model,
            chassis: isOther ? '' : chassis,
            vibe,
            photoPath,
        });
        if (result.error) {
            if (photoPath) await bucket.remove([photoPath]); // don't leave an orphan photo behind
            setStatus('idle');
            return setError(result.error);
        }
        router.push(`/builds/${result.id}`);
    }

    const busy = status !== 'idle';

    return (
        <form onSubmit={submit} className="card form" aria-busy={busy}>
            <section className="form__section" aria-labelledby="step-car">
                <h2 id="step-car" className="form__heading"><span className="form__num">1</span> Pick the car</h2>

                <BrandPicker brands={Object.keys(catalog)} value={brand} onChange={chooseBrand} disabled={busy} />

                {isOther ? (
                    <div ref={nextStep} className="field form__next">
                        <label htmlFor="other-car">Car (make, model and chassis if you know it)</label>
                        <input
                            id="other-car"
                            className="input"
                            value={otherCar}
                            onChange={(event) => setOtherCar(event.target.value)}
                            maxLength={60}
                            required
                            disabled={busy}
                            placeholder="e.g. Saab 9-3 Viggen"
                        />
                    </div>
                ) : (
                    <div ref={nextStep} className="grid-2 form__next">
                        <div className="field">
                            <label htmlFor="model">Model</label>
                            <select
                                id="model"
                                className="input"
                                value={model}
                                onChange={(event) => chooseModel(event.target.value)}
                                disabled={!brand || busy}
                                required
                            >
                                <option value="" disabled>{brand ? 'Select a model…' : 'Choose a brand first'}</option>
                                {models.map((name) => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="chassis">Chassis / generation <span className="muted">(optional)</span></label>
                            <select
                                id="chassis"
                                className="input"
                                value={chassis}
                                onChange={(event) => setChassis(event.target.value)}
                                disabled={chassisOptions.length === 0 || busy}
                            >
                                <option value="">
                                    {!model ? 'Choose a model first' : chassisOptions.length === 0 ? 'No chassis list for this model' : 'Not sure / any'}
                                </option>
                                {chassisOptions.map((code) => {
                                    // Most people know their car by year, not by chassis code.
                                    const years = chassisYears(brand, model, code);
                                    return <option key={code} value={code}>{years ? `${code} · ${years}` : code}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                )}

                {!isOther && model && (
                    <CarPreview
                        brand={brand}
                        model={model}
                        chassis={chassis}
                        years={chassisYears(brand, model, chassis)}
                        exact={chassis !== '' || chassisOptions.length === 0}
                        chassisCodes={chassisOptions}
                    />
                )}
            </section>

            <section className="form__section" aria-labelledby="step-vibe">
                <h2 id="step-vibe" className="form__heading"><span className="form__num">2</span> Set the vibe</h2>

                <div className="field">
                    <label htmlFor="vibe">What is this build for?</label>
                    <textarea
                        id="vibe"
                        className="input"
                        value={vibe}
                        onChange={(event) => setVibe(event.target.value)}
                        maxLength={200}
                        required
                        rows={3}
                        disabled={busy}
                        aria-describedby="vibe-count"
                    />
                    <span id="vibe-count" className="hint">{vibe.length}/200 characters</span>
                </div>

                <div className="chips" role="group" aria-label="Vibe ideas">
                    {VIBE_IDEAS.map((idea) => (
                        <button
                            key={idea}
                            type="button"
                            className="chip-btn"
                            aria-pressed={vibe === idea}
                            onClick={() => setVibe(idea)}
                            disabled={busy}
                        >
                            {idea}
                        </button>
                    ))}
                </div>
            </section>

            <section className="form__section" aria-labelledby="step-photo">
                <h2 id="step-photo" className="form__heading">
                    <span className="form__num">3</span> Add a photo <span className="muted" style={{ fontWeight: 500 }}>(optional)</span>
                </h2>

                <div className="dropzone">
                    {previewUrl && <img src={previewUrl} alt="Your chosen car photo" className="dropzone__thumb" />}
                    <div>
                        <input
                            ref={photoInput}
                            id="photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={choosePhoto}
                            disabled={busy}
                            aria-describedby="photo-hint"
                        />
                        <p id="photo-hint" className="hint" style={{ marginTop: '0.4rem' }}>
                            Got the car? The AI works with what it sees. Otherwise we show a real photo of this model from Wikimedia Commons. JPG, PNG or WebP, up to 4 MB.
                        </p>
                        {photo && !busy && (
                            <button type="button" className="link-btn small" onClick={removePhoto} style={{ marginTop: '0.4rem' }}>
                                Remove photo
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {busy ? (
                <div className="generating" role="status" aria-live="polite">
                    <div className="generating__bar" aria-hidden="true" />
                    <strong>{status === 'uploading' ? 'Uploading your photo…' : PROGRESS_MESSAGES[progress]}</strong>
                    <span className="muted small">This takes up to 20 seconds. Stay on this page.</span>
                </div>
            ) : (
                <div className="stack-sm">
                    <button type="submit" className="btn btn--primary btn--lg btn--block">Generate build</button>
                    <p className="hint" style={{ textAlign: 'center' }}>Everyone can then vote on it, and you can swap any part afterwards. You can make up to 10 builds a day.</p>
                </div>
            )}

            {error && <p role="alert" className="alert">{error}</p>}
        </form>
    );
}
