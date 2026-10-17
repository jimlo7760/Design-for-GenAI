'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../lib/supabase/server';
import { getCurrentUser, getProfile, isProfileComplete } from '../lib/auth';
import { generateBuild } from '../lib/ai';
import { withDatabaseCars } from '../lib/carCatalog';
import { findCarPhoto } from '../lib/carPhoto';
import { examplePhoto, pinnedPhoto } from '../lib/carPhotos';
import { MAX_MODS, cleanMod, isUuid, partKey, shareOfTotal, totalWith, totalWithout } from '../lib/mods';
import { buildRenderPrompt, loadReferenceImage, renderImage } from '../lib/render';

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const BUILD_PHOTO_WIDTH = 960; // the build page shows the car photo large; the Generate preview uses 500

// Server Actions can be POSTed to directly, so every one re-checks who is calling.
// RLS in the database is the second lock behind this one.
async function requireMember() {
    const user = await getCurrentUser();
    if (!user) throw new Error('Please sign in first.');
    if (!isProfileComplete(await getProfile())) throw new Error('Please finish your profile first.');
    return user;
}

// The photo the Generate page's preview card showed for this car (lib/carPhotos.js), at the size a
// build shows: a photo, null when we checked and have none, or undefined when the car was never
// checked (for example one added to the Car table). Same rule as CarPreview: a model with
// generations and no chassis chosen is shown by its newest generation.
function vettedPhoto(brand, model, chassis) {
    const codes = withDatabaseCars()[brand]?.[model];
    const chassisCodes = Array.isArray(codes) ? codes : [];
    if (chassis || chassisCodes.length === 0) return pinnedPhoto(brand, model, chassis, BUILD_PHOTO_WIDTH);
    return examplePhoto(brand, model, chassisCodes, BUILD_PHOTO_WIDTH)?.photo;
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

    // If the user didn't upload a photo, store the one the Generate page previewed for this car.
    // Only a car nobody vetted gets a live search, run while the AI works. findCarPhoto never
    // throws; no photo just means a plainer card.
    const vetted = photoPath ? null : vettedPhoto(brand, model, chassis);
    let result;
    let carPhoto = null;
    try {
        [result, carPhoto] = await Promise.all([
            generateBuild({ car, vibe, photo }),
            // Try the exact chassis first, then the model in general.
            vetted === undefined ? findCarPhoto(chassis ? [`${baseName} ${chassis}`, baseName] : [baseName]) : vetted,
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


// Editing the list of parts ------------------------------------------------------
// The owner can take parts off the AI's list and put their own on (see components/ModEditor.js).
// Clients have no UPDATE privilege on `mods`: the change goes through the edit_build_mods()
// function from supabase/assignment4_edit.sql, which re-checks that the caller owns the build.

// The caller's own build, with what an edit needs: { build } or { error }.
async function loadOwnBuild(supabase, user, buildId) {
    if (!isUuid(buildId)) return { error: 'That build does not exist.' };
    const { data: build, error } = await supabase
        .from('builds')
        .select('id, user_id, mods, est_cost_usd')
        .eq('id', buildId)
        .maybeSingle();
    if (error) {
        console.error('Could not load the build for editing:', error.message);
        return { error: 'Could not load that build. Please try again.' };
    }
    if (!build || build.user_id !== user.id) return { error: 'You can only edit your own builds.' };
    return { build: { ...build, mods: Array.isArray(build.mods) ? build.mods : [] } };
}

function editError(error) {
    console.error('Could not save the parts list:', error.message);
    // PGRST202: Supabase does not know the function, so supabase/assignment4_edit.sql has not been run.
    if (error.code === 'PGRST202') return 'Editing parts is not switched on for this site yet.';
    return 'Could not save your change. Please try again.';
}

function refreshBuild(buildId) {
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/builds/${buildId}`);
}

async function saveMods(supabase, buildId, mods, total, extra = {}) {
    const { error } = await supabase.rpc('edit_build_mods', { p_build_id: buildId, p_mods: mods, p_cost: total });
    if (error) return { error: editError(error) };
    refreshBuild(buildId);
    return { mods, est_cost_usd: total, ...extra };
}

// Takes one part off the list. `part` must be the name at `index`, so a page that has gone out of
// date can never remove a different part. Returns { mods, est_cost_usd, removed } or { error }.
// `removed` is the part that was taken off, with its cost filled in, so Undo can put it back with
// the total it had (a build made before parts were priced one by one only has a total, and the
// part gets an even share of it).
export async function removeMod(buildId, index, part) {
    let user;
    try {
        user = await requireMember();
    } catch (error) {
        return { error: error.message };
    }
    if (!Number.isInteger(index) || typeof part !== 'string') return { error: 'Invalid request.' };

    const supabase = await createClient();
    const loaded = await loadOwnBuild(supabase, user, buildId);
    if (loaded.error) return loaded;
    const { build } = loaded;

    if (build.mods[index]?.part !== part) return { error: 'The list has changed. Refresh the page and try again.' };
    if (build.mods.length <= 1) return { error: 'A build needs at least one part. Add another before taking this one off.' };

    const mods = build.mods.filter((_, i) => i !== index);
    const removed = { ...build.mods[index] };
    const share = shareOfTotal(build.mods, build.est_cost_usd, index);
    if (!Number.isFinite(removed.cost_usd) && share !== null) removed.cost_usd = share;
    return saveMods(supabase, build.id, mods, totalWithout(build.mods, build.est_cost_usd, index), { removed });
}

// Puts a part on the list (at `index`, or at the end). Used for parts found with the part search,
// and to bring back a part that was just taken off. Returns { mods, est_cost_usd } or { error }.
export async function addMod(buildId, mod, index) {
    let user;
    try {
        user = await requireMember();
    } catch (error) {
        return { error: error.message };
    }

    const clean = cleanMod(mod);
    if (!clean) return { error: 'Give the part a name.' };

    const supabase = await createClient();
    const loaded = await loadOwnBuild(supabase, user, buildId);
    if (loaded.error) return loaded;
    const { build } = loaded;

    if (build.mods.length >= MAX_MODS) return { error: `A build can have up to ${MAX_MODS} parts. Take one off to add another.` };
    if (build.mods.some((existing) => partKey(existing.part) === partKey(clean.part))) {
        return { error: 'That part is already on your list.' };
    }

    const at = Number.isInteger(index) && index >= 0 && index <= build.mods.length ? index : build.mods.length;
    const mods = [...build.mods.slice(0, at), clean, ...build.mods.slice(at)];
    return saveMods(supabase, build.id, mods, totalWith(build.mods, build.est_cost_usd, clean));
}

// Puts the list back exactly as the AI wrote it (the database keeps that copy from the first edit).
export async function resetMods(buildId) {
    let user;
    try {
        user = await requireMember();
    } catch (error) {
        return { error: error.message };
    }

    const supabase = await createClient();
    const loaded = await loadOwnBuild(supabase, user, buildId);
    if (loaded.error) return loaded;

    const { error } = await supabase.rpc('reset_build_mods', { p_build_id: loaded.build.id });
    if (error) return { error: error.message.includes('nothing to reset') ? 'This list is still the one the AI wrote.' : editError(error) };

    const { data } = await supabase.from('builds').select('mods, est_cost_usd').eq('id', loaded.build.id).maybeSingle();
    refreshBuild(loaded.build.id);
    return { mods: data?.mods ?? [], est_cost_usd: data?.est_cost_usd ?? null };
}
