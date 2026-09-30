'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from '../../components/Avatar';
import { createClient } from '../../lib/supabase/client';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const AVATAR_EXTENSIONS = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

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
};

function Message({ message }) {
    if (!message) return null;
    return (
        <p role={message.type === 'error' ? 'alert' : 'status'} style={{ color: message.type === 'error' ? '#b00020' : '#1b5e20' }}>
            {message.text}
        </p>
    );
}

export default function ProfileForm({ userId, email, profile, suggestedNames }) {
    const router = useRouter();

    // If the name isn't saved yet, start from what Google told us. Nothing is
    // saved until the user presses Save.
    const [firstName, setFirstName] = useState(profile?.first_name ?? suggestedNames.firstName);
    const [lastName, setLastName] = useState(profile?.last_name ?? suggestedNames.lastName);
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [nameMessage, setNameMessage] = useState(null);
    const [photoMessage, setPhotoMessage] = useState(null);

    async function saveNames(event) {
        event.preventDefault();
        setNameMessage(null);

        if (!firstName.trim() || !lastName.trim()) {
            setNameMessage({ type: 'error', text: 'Please enter both your first and last name.' });
            return;
        }

        setSaving(true);
        const supabase = createClient();
        // upsert: still works if this user's row doesn't exist yet.
        const { error } = await supabase.from('profiles').upsert({
            id: userId,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
        });
        setSaving(false);

        if (error) {
            setNameMessage({ type: 'error', text: error.message });
            return;
        }
        setNameMessage({ type: 'success', text: 'Saved!' });
        router.refresh(); // update the name in the header
    }

    async function uploadPhoto(event) {
        const input = event.target;
        const file = input.files?.[0];
        input.value = ''; // lets the user pick the same file again later
        if (!file) return;

        setPhotoMessage(null);
        const extension = AVATAR_EXTENSIONS[file.type];
        if (!extension) {
            setPhotoMessage({ type: 'error', text: 'Please choose a JPG, PNG, WebP or GIF image.' });
            return;
        }
        if (file.size > MAX_AVATAR_BYTES) {
            setPhotoMessage({ type: 'error', text: 'That image is over 5 MB. Please choose a smaller one.' });
            return;
        }

        setUploading(true);
        const supabase = createClient();
        const bucket = supabase.storage.from('avatars');

        // Each user writes only inside their own folder (see supabase/profiles.sql).
        const path = `${userId}/${Date.now()}.${extension}`;
        const { error: uploadError } = await bucket.upload(path, file, { contentType: file.type });
        if (uploadError) {
            setUploading(false);
            setPhotoMessage({ type: 'error', text: uploadError.message });
            return;
        }

        // The database only stores the photo's link, never the image itself.
        const { data: { publicUrl } } = bucket.getPublicUrl(path);
        const { error: saveError } = await supabase
            .from('profiles')
            .upsert({ id: userId, avatar_url: publicUrl });
        if (saveError) {
            await bucket.remove([path]);
            setUploading(false);
            setPhotoMessage({ type: 'error', text: saveError.message });
            return;
        }

        // Tidy up the photo this one replaces.
        const previousPath = avatarUrl?.split('/avatars/')[1];
        if (previousPath) await bucket.remove([previousPath]);

        setAvatarUrl(publicUrl);
        setUploading(false);
        setPhotoMessage({ type: 'success', text: 'Photo updated!' });
        router.refresh(); // update the photo in the header
    }

    return (
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
            <section style={cardStyle}>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Photo</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <Avatar url={avatarUrl} name={`${firstName} ${lastName}`} size={96} />
                    <div>
                        <label htmlFor="photo">Upload a photo</label>
                        <input
                            id="photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={uploadPhoto}
                            disabled={uploading}
                            style={{ display: 'block', marginTop: '0.25rem' }}
                        />
                        <p style={{ margin: '0.5rem 0 0 0', color: '#555', fontSize: '0.9rem' }}>
                            {uploading ? 'Uploading…' : 'JPG, PNG, WebP or GIF, up to 5 MB.'}
                        </p>
                    </div>
                </div>
                <Message message={photoMessage} />
            </section>

            <form onSubmit={saveNames} style={cardStyle}>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Name</h2>
                <p style={{ margin: '0 0 1rem 0', color: '#555' }}>Signed in as {email}</p>

                <label htmlFor="first-name">First name</label>
                <input
                    id="first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    autoComplete="given-name"
                    required
                    style={inputStyle}
                />

                <div style={{ height: '1rem' }} />

                <label htmlFor="last-name">Last name</label>
                <input
                    id="last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    autoComplete="family-name"
                    required
                    style={inputStyle}
                />

                <button
                    type="submit"
                    disabled={saving}
                    style={{
                        marginTop: '1.25rem',
                        padding: '0.6rem 1.25rem',
                        fontSize: '1rem',
                        color: '#fff',
                        background: '#3f51b5',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: saving ? 'default' : 'pointer',
                    }}
                >
                    {saving ? 'Saving…' : 'Save'}
                </button>

                <Message message={nameMessage} />
                {nameMessage?.type === 'success' && (
                    <p><Link href="/dashboard">Go to your dashboard →</Link></p>
                )}
            </form>
        </div>
    );
}
