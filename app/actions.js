'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../lib/supabase/server';
import { getCurrentUser, getProfile, isProfileComplete } from '../lib/auth';
import { generateBuild } from '../lib/ai';
import { findCarPhoto } from '../lib/carPhoto';
import { buildRenderPrompt, loadReferenceImage, renderImage } from '../lib/render';

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

// Server Actions can be POSTed to directly, so every one re-checks who is calling.
// RLS in the database is the second lock behind this one.
async function requireMember() {
    const user = await getCurrentUser();
    if (!user) throw new Error('Please sign in first.');
    if (!isProfileComplete(await getProfile())) throw new Error('Please finish your profile first.');
    return user;
}

// Generates a build with the AI and saves it. Returns { id } or { error }.
// photoPath is optional: where the browser already uploaded the car photo.
export async function createBuild({ brand, model, chassis, vibe, photoPath }) {
    let user;
    try {
        user = await requireMember();
    } catch (error) {
        return { error: error.message };
    }

    // brand is empty when the user chose "Other" and typed the whole car into model.
    brand = String(brand ?? '').trim();
    model = String(model ?? '').trim();
    chassis = String(chassis ?? '').trim();
    vibe = String(vibe ?? '').trim();
    if (!model || brand.length > 40 || model.length > 60 || chassis.length > 30) {
        return { error: 'Choose a brand and model.' };
    }
    const baseName = [brand, model].filter(Boolean).join(' ');
    const car = chassis ? `${baseName} (${chassis})` : baseName;
    if (car.length > 80) return { error: 'That car name is too long.' };
    if (!vibe || vibe.length > 200) return { error: 'Describe the vibe (up to 200 characters).' };

    const supabase = await createClient();

    let photo = null;
    let photoUrl = null;
    if (photoPath) {
        // The photo must live in the caller's own folder; otherwise someone could
        // point us at another user's file.
        if (typeof photoPath !== 'string' || !photoPath.startsWith(`${user.id}/`) || photoPath.includes('..')) {
            return { error: 'That photo is not valid.' };
        }
        const { data, error } = await supabase.storage.from('car-photos').download(photoPath);
        if (error || !data) return { error: 'We could not read your photo. Please upload it again.' };
        if (!PHOTO_TYPES.includes(data.type) || data.size > MAX_PHOTO_BYTES) {
            return { error: 'Photos must be JPG, PNG or WebP, up to 4 MB.' };
        }
        photo = { mimeType: data.type, base64: Buffer.from(await data.arrayBuffer()).toString('base64') };
        photoUrl = supabase.storage.from('car-photos').getPublicUrl(photoPath).data.publicUrl;
    }

    // Friendly version of the daily limit (the database enforces it too).
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
        .from('builds')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', since);
    if ((count ?? 0) >= 10) return { error: 'Daily limit reached: 10 builds per 24 hours. Come back tomorrow!' };

    // If the user didn't upload a photo, look up a real one of this car while the AI
    // works. findCarPhoto never throws; no photo just means a plainer card.
    let result;
    let carPhoto = null;
    try {
        [result, carPhoto] = await Promise.all([
            generateBuild({ car, vibe, photo }),
            // Try the exact chassis first, then the model in general.
            photoPath ? null : findCarPhoto(chassis ? [`${baseName} ${chassis}`, baseName] : [baseName]),
        ]);
    } catch (error) {
        return { error: error.message };
    }

    const { data, error } = await supabase
        .from('builds')
        .insert({
            car_name: car,
            vibe,
            prompt: result.prompt,
            model: result.model,
            title: result.build.title,
            tagline: result.build.tagline,
            mods: result.build.mods,
            est_cost_usd: result.build.est_cost_usd,
            photo_url: photoUrl,
            image_url: carPhoto?.url ?? null,
            image_source_url: carPhoto?.sourceUrl ?? null,
            image_credit: carPhoto?.credit ?? null,
            image_license: carPhoto?.license ?? null,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Could not save build:', error.message);
        return { error: error.message.startsWith('Daily limit') ? error.message : 'Could not save your build. Please try again.' };
    }

    revalidatePath('/');
    revalidatePath('/dashboard');
    return { id: data.id };
}

// value: 1 (upvote), -1 (downvote) or 0 (take my vote back).
// Inserts a row into build_votes (or flips / removes the user's existing one).
export async function castVote(buildId, value) {
    let user;
    try {
        user = await requireMember();
    } catch (error) {
        return { error: error.message };
    }
    if (![1, -1, 0].includes(value) || typeof buildId !== 'string') return { error: 'Invalid vote.' };

    const supabase = await createClient();

    let error;
    if (value === 0) {
        ({ error } = await supabase.from('build_votes').delete().eq('build_id', buildId).eq('user_id', user.id));
    } else {
        // Changing a vote only updates `value` (the one column clients may update),
        // so try that first and insert a new row if there was none.
        const { data: updated, error: updateError } = await supabase
            .from('build_votes')
            .update({ value })
            .eq('build_id', buildId)
            .eq('user_id', user.id)
            .select('id');
        error = updateError;
        if (!error && updated.length === 0) {
            ({ error } = await supabase.from('build_votes').insert({ build_id: buildId, value }));
        }
    }

    if (error) {
        console.error('Could not save vote:', error.message);
        return { error: 'Could not save your vote. You cannot vote on your own build.' };
    }

    // Report the fresh totals so the buttons show real numbers.
    const { data } = await supabase.from('builds').select('upvotes, downvotes').eq('id', buildId).maybeSingle();
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/builds/${buildId}`);
    return { upvotes: data?.upvotes ?? 0, downvotes: data?.downvotes ?? 0 };
}

const RENDER_EXTENSIONS = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
const RENDER_BUCKET_PATH = '/storage/v1/object/public/build-renders/';

// Renders the owner's build as an image: the AI edits the car's photo to show the
// mods, the result is saved in Storage and linked from the build. Returns { ok } or { error }.
export async function renderBuild(buildId) {
    let user;
    try {
        user = await requireMember();
    } catch (error) {
        return { error: error.message };
    }
    if (typeof buildId !== 'string') return { error: 'Invalid build.' };

    const supabase = await createClient();
    const { data: build } = await supabase
        .from('builds')
        .select('id, user_id, car_name, vibe, title, mods, photo_url, image_url, render_url')
        .eq('id', buildId)
        .maybeSingle();

    // Every render costs money, so only the build's owner may start one, and only once.
    if (!build || build.user_id !== user.id) return { error: 'You can only render your own builds.' };
    if (build.render_url) return { error: 'This build already has a render.' };

    // Friendly version of the daily limit (the database enforces it too).
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
        .from('builds')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('rendered_at', since);
    if ((count ?? 0) >= 5) return { error: 'Daily limit reached: 5 renders per 24 hours. Come back tomorrow!' };

    let image;
    try {
        const reference = await loadReferenceImage(build, user, supabase);
        image = await renderImage({ prompt: buildRenderPrompt(build, Boolean(reference)), reference });
    } catch (error) {
        return { error: error.message };
    }

    const bucket = supabase.storage.from('build-renders');
    const path = `${user.id}/${build.id}.${RENDER_EXTENSIONS[image.mimeType]}`;
    const { error: uploadError } = await bucket.upload(path, image.bytes, { contentType: image.mimeType });
    if (uploadError) {
        console.error('Could not store render:', uploadError.message);
        return { error: 'Could not save the render. Please try again.' };
    }

    const { error: saveError } = await supabase
        .from('builds')
        .update({
            render_url: bucket.getPublicUrl(path).data.publicUrl,
            render_model: image.model,
            rendered_at: new Date().toISOString(),
        })
        .eq('id', build.id);
    if (saveError) {
        console.error('Could not save render link:', saveError.message);
        await bucket.remove([path]); // don't leave an orphan file behind
        return { error: saveError.message.startsWith('Daily limit') ? saveError.message : 'Could not save the render. Please try again.' };
    }

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/builds/${build.id}`);
    return { ok: true };
}

export async function deleteBuild(buildId) {
    let user;
    try {
        user = await requireMember();
    } catch (error) {
        return { error: error.message };
    }
    const supabase = await createClient();

    // Remember the render's file so it can be removed along with the build.
    const { data: build } = await supabase.from('builds').select('render_url').eq('id', buildId).maybeSingle();

    // RLS only lets users delete their own builds.
    const { error } = await supabase.from('builds').delete().eq('id', buildId);
    if (error) return { error: 'Could not delete that build.' };

    const renderPath = build?.render_url?.split(RENDER_BUCKET_PATH)[1];
    if (renderPath?.startsWith(`${user.id}/`)) {
        await supabase.storage.from('build-renders').remove([decodeURIComponent(renderPath)]);
    }

    revalidatePath('/');
    revalidatePath('/dashboard');
    return { ok: true };
}
