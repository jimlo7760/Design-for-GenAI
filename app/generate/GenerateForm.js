'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { createBuild } from '../actions';
import { VIBE_IDEAS } from '../../lib/challenges';

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const PHOTO_EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const OTHER = '__other__';

const cardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '1.25rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};
const inputStyle = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '0.25rem',
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontFamily: 'inherit',
    background: '#fff',
};

// catalog: { Brand: { Model: [chassis, ...] } }
export default function GenerateForm({ userId, catalog, defaultVibe }) {
    const router = useRouter();
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [chassis, setChassis] = useState('');
    const [otherCar, setOtherCar] = useState(''); // typed when brand is "Other"
    const [vibe, setVibe] = useState(defaultVibe);
    const [photo, setPhoto] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | uploading | generating
    const [error, setError] = useState('');

    const isOther = brand === OTHER;
    const models = brand && !isOther ? Object.keys(catalog[brand] ?? {}) : [];
    const chassisOptions = model ? catalog[brand]?.[model] ?? [] : [];

    // Changing a choice clears the ones that depend on it.
    function chooseBrand(value) {
        setBrand(value);
        setModel('');
        setChassis('');
    }
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
        <form onSubmit={submit} style={{ ...cardStyle, marginTop: '1.5rem' }}>
            <label htmlFor="brand">Brand</label>
            <select id="brand" value={brand} onChange={(event) => chooseBrand(event.target.value)} required style={inputStyle}>
                <option value="" disabled>Select a brand…</option>
                {Object.keys(catalog).map((name) => <option key={name} value={name}>{name}</option>)}
                <option value={OTHER}>Other (type it in)…</option>
            </select>

            {isOther ? (
                <>
                    <div style={{ height: '1rem' }} />
                    <label htmlFor="other-car">Car (make, model and chassis if you know it)</label>
                    <input
                        id="other-car"
                        value={otherCar}
                        onChange={(event) => setOtherCar(event.target.value)}
                        maxLength={60}
                        required
                        placeholder="e.g. Saab 9-3 Viggen"
                        style={inputStyle}
                    />
                </>
            ) : (
                <>
                    <div style={{ height: '1rem' }} />
                    <label htmlFor="model">Model</label>
                    <select
                        id="model"
                        value={model}
                        onChange={(event) => chooseModel(event.target.value)}
                        disabled={!brand}
                        required
                        style={inputStyle}
                    >
                        <option value="" disabled>{brand ? 'Select a model…' : 'Choose a brand first'}</option>
                        {models.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>

                    <div style={{ height: '1rem' }} />
                    <label htmlFor="chassis">Chassis / generation (optional)</label>
                    <select
                        id="chassis"
                        value={chassis}
                        onChange={(event) => setChassis(event.target.value)}
                        disabled={chassisOptions.length === 0}
                        style={inputStyle}
                    >
                        <option value="">
                            {!model ? 'Choose a model first' : chassisOptions.length === 0 ? 'No chassis list for this model' : 'Not sure / any'}
                        </option>
                        {chassisOptions.map((code) => <option key={code} value={code}>{code}</option>)}
                    </select>
                </>
            )}

            <div style={{ height: '1rem' }} />

            <label htmlFor="vibe">Vibe: what is this build for?</label>
            <textarea
                id="vibe"
                value={vibe}
                onChange={(event) => setVibe(event.target.value)}
                maxLength={200}
                required
                rows={3}
                style={inputStyle}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {VIBE_IDEAS.map((idea) => (
                    <button
                        key={idea}
                        type="button"
                        onClick={() => setVibe(idea)}
                        style={{ padding: '0.25rem 0.7rem', border: '1px solid #ccc', borderRadius: '999px', background: '#fff', cursor: 'pointer' }}
                    >
                        {idea}
                    </button>
                ))}
            </div>

            <div style={{ height: '1rem' }} />

            <label htmlFor="photo">Photo of the car (optional)</label>
            <input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={choosePhoto}
                disabled={busy}
                style={{ display: 'block', marginTop: '0.25rem' }}
            />
            <p style={{ margin: '0.5rem 0 0 0', color: '#555', fontSize: '0.9rem' }}>
                JPG, PNG or WebP, up to 4 MB. Without one, we show a real photo of this car from Wikimedia Commons.
            </p>

            <button
                type="submit"
                disabled={busy}
                style={{
                    marginTop: '1.25rem',
                    padding: '0.6rem 1.25rem',
                    fontSize: '1rem',
                    color: '#fff',
                    background: '#3f51b5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: busy ? 'default' : 'pointer',
                }}
            >
                {status === 'uploading' ? 'Uploading photo…' : status === 'generating' ? 'Designing your build… (up to 20s)' : 'Generate build'}
            </button>

            {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}
        </form>
    );
}
