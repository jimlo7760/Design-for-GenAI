// Renders a build as an image with Google's Nano Banana models, by editing the car's
// reference photo so it shows the mods. Server-only: GEMINI_API_KEY must stay on the
// server, so only import this from a 'use server' file (app/actions.js).

// Tried in order. GEMINI_IMAGE_MODEL (if set) goes first; Lite is the fallback.
// Both cost about $0.034 per 1K image and need billing enabled on the Google project.
const MODELS = [
    process.env.GEMINI_IMAGE_MODEL || 'gemini-nano-banana-2.1',
    'gemini-3.1-flash-lite-image',
].filter((model, index, all) => all.indexOf(model) === index);

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_REFERENCE_BYTES = 8 * 1024 * 1024;

export function buildRenderPrompt(build, hasReference) {
    const mods = build.mods.map((mod) => `- ${mod.part} (${mod.category}): ${mod.detail}`).join('\n');
    return [
        hasReference
            ? `Edit the attached photo of a ${build.car_name}. Keep the same car, camera angle, framing and setting, and change only what the modifications below require.`
            : `Create a photorealistic automotive photograph of a ${build.car_name}, front three-quarter view, parked in an urban setting.`,
        `It is a "${build.vibe}" build called "${build.title}".`,
        'Show these modifications wherever they would be visible from outside the car (skip anything hidden, like engine internals or audio):',
        mods,
        'Photorealistic, natural lighting. Do not add text, logos, watermarks or people.',
    ].join('\n');
}

// Loads the photo the edit starts from. The links come from the database, which
// signed-in users can write to, so only two places are ever fetched: the user's own
// folder in our car-photos bucket, and Wikimedia. Anything else is ignored.
export async function loadReferenceImage(build, user, supabase) {
    const ownPhotoPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-photos/${user.id}/`;

    if (build.photo_url?.startsWith(ownPhotoPrefix)) {
        const path = `${user.id}/${decodeURIComponent(build.photo_url.slice(ownPhotoPrefix.length))}`;
        if (path.includes('..')) return null;
        const { data } = await supabase.storage.from('car-photos').download(path);
        if (!data || !IMAGE_TYPES.includes(data.type) || data.size > MAX_REFERENCE_BYTES) return null;
        return { mimeType: data.type, base64: Buffer.from(await data.arrayBuffer()).toString('base64') };
    }

    if (build.image_url) {
        let url;
        try {
            url = new URL(build.image_url);
        } catch {
            return null;
        }
        if (url.protocol !== 'https:' || !['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(url.hostname)) return null;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'ModSquad/1.0 (Columbia class project)' },
            signal: AbortSignal.timeout(10_000),
        }).catch(() => null);
        const type = response?.headers.get('content-type')?.split(';')[0];
        if (!response?.ok || !IMAGE_TYPES.includes(type)) return null;
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length > MAX_REFERENCE_BYTES) return null;
        return { mimeType: type, base64: bytes.toString('base64') };
    }

    return null; // no photo to edit: the render is made from the text alone
}

// Returns { bytes, mimeType, model }. Throws an Error with a message fit for the user.
export async function renderImage({ prompt, reference }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('The AI is not set up yet (missing GEMINI_API_KEY).');

    const parts = [{ text: prompt }];
    if (reference) parts.push({ inline_data: { mime_type: reference.mimeType, data: reference.base64 } });
    const body = JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
    });

    let lastStatus;
    for (const model of MODELS) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                    body,
                    signal: AbortSignal.timeout(40_000),
                }
            );
            if (!response.ok) {
                lastStatus = response.status;
                console.error(`Image model ${model} error`, response.status, (await response.text()).slice(0, 600));
                // A bad request or bad key would fail on every model, so stop trying.
                if (![404, 429, 500, 502, 503, 504].includes(response.status)) break;
                continue;
            }

            const result = await response.json();
            if (result.promptFeedback?.blockReason) {
                throw new Error('The AI could not render that build. Try a different one.');
            }
            const image = result.candidates?.[0]?.content?.parts
                ?.map((part) => part.inlineData ?? part.inline_data)
                .find(Boolean);
            const mimeType = image?.mimeType ?? image?.mime_type;
            if (!image?.data || !IMAGE_TYPES.includes(mimeType)) {
                lastStatus = 'no-image';
                console.error(`Image model ${model} returned no image`, JSON.stringify(result).slice(0, 400));
                continue;
            }
            return { bytes: Buffer.from(image.data, 'base64'), mimeType, model };
        } catch (error) {
            if (error.message.startsWith('The AI could not')) throw error;
            lastStatus = 'timeout';
            console.error(`Image model ${model} request failed`, error.message);
        }
    }

    throw new Error(
        lastStatus === 429
            ? 'Image rendering is unavailable right now (quota reached, or billing is not enabled on the Google project).'
            : lastStatus === 503 || lastStatus === 'timeout'
              ? 'The image AI is busy right now. Try again in a minute.'
              : 'The AI could not render this build. Please try again.'
    );
}
