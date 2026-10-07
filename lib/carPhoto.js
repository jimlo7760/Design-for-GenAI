// Finds a real, openly licensed photo of a car on Wikimedia Commons (free, no API
// key). The photo is hotlinked, not copied, and shown with its credit line.
// Server-only: call it from a 'use server' file (app/actions.js).

// Skip photos of parts, brochures, toys and wrecks: we want the whole car.
const NOT_A_CAR_PHOTO =
    /interior|engine|dashboard|cockpit|logo|badge|emblem|\bwheels?\b|\bseats?\b|steering|console|trunk|detail|headlight|taillight|cutaway|diagram|brochure|advert|poster|drawing|sketch|render|model car|\btoy\b|\bscale\b|museum|crash|wreck|junk|scrap/i;
const FREE_LICENSE = /^(CC[ -]|Public domain|PD|GFDL)/i;
const PICK_FROM_TOP = 6; // vary the photo between builds of the same car

function plainText(html = '') {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

async function searchCommons(query) {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    const params = {
        action: 'query',
        format: 'json',
        formatversion: 2,
        generator: 'search',
        gsrsearch: `${query} filetype:bitmap`,
        gsrnamespace: 6, // the "File:" namespace
        gsrlimit: 30,
        prop: 'imageinfo',
        iiprop: 'url|size|mime|extmetadata',
        iiurlwidth: 1000,
    };
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    let response;
    for (let attempt = 0; attempt < 2; attempt++) {
        response = await fetch(url, {
            // Wikimedia asks API users to identify themselves.
            headers: { 'User-Agent': 'ModSquad/1.0 (Columbia class project)' },
            signal: AbortSignal.timeout(8_000),
        });
        if (response.status !== 429) break;
        await new Promise((resolve) => setTimeout(resolve, 1_500)); // rate limited: wait, retry once
    }
    // Throw (rather than return []) so a rate limit isn't remembered as "no photos exist".
    if (!response.ok) throw new Error(`Commons answered ${response.status}`);
    const data = await response.json();
    return (data.query?.pages ?? []).sort((a, b) => a.index - b.index);
}

// Does the file name mention this word of the car name? "M550" matches "M550i",
// "LS500" matches "LS 500", but short words like "IS" must match a whole word.
function titleHasWord(tokens, word) {
    const matches = (token) => (word.length >= 4 ? token.startsWith(word) : token === word);
    return tokens.some((token, index) => matches(token) || matches(token + (tokens[index + 1] ?? '')));
}

// Commons search is word-based, so "M550" won't find "M550i" and "LS500" won't find
// "LS 500". Try the plain name first, then wildcard and spaced variants.
function queryVariants(car) {
    const spaced = car.replace(/([a-z])(\d)/gi, '$1 $2').replace(/(\d)([a-z])/gi, '$1 $2');
    return [...new Set([car, `${car}*`, `${spaced}*`, `${car} car`])];
}

// Good photos per car, remembered while the server stays warm. This keeps us well
// under Wikimedia's rate limits, and repeat cars (everyone builds a Supra) are instant.
const cache = new Map(); // car -> { photos, expires }
const CACHE_MS = 6 * 60 * 60 * 1000;
const MISS_CACHE_MS = 10 * 60 * 1000;

async function findPhotos(car) {
    const words = car.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

    for (const query of queryVariants(car)) {
        const pages = await searchCommons(query);
        const photos = pages
            .filter((page) => {
                const info = page.imageinfo?.[0];
                if (!info?.thumburl || info.mime !== 'image/jpeg') return false;
                const ratio = info.width / info.height;
                if (info.width < 1200 || ratio < 1.25 || ratio > 2.2) return false; // landscape, sharp
                if (NOT_A_CAR_PHOTO.test(page.title)) return false;
                if (!FREE_LICENSE.test(info.extmetadata?.LicenseShortName?.value ?? '')) return false;
                const tokens = page.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
                return words.every((word) => titleHasWord(tokens, word));
            })
            .slice(0, PICK_FROM_TOP)
            .map((page) => {
                const info = page.imageinfo[0];
                return {
                    url: info.thumburl,
                    sourceUrl: info.descriptionshorturl || info.descriptionurl,
                    credit: plainText(info.extmetadata?.Artist?.value).slice(0, 80) || 'Unknown author',
                    license: info.extmetadata.LicenseShortName.value,
                };
            });
        if (photos.length > 0) return photos; // stop at the first query that works
    }
    return [];
}

// Returns { url, sourceUrl, credit, license } or null when nothing good is found.
// Pass one name, or several to try in order (most specific first).
export async function findCarPhoto(names) {
    for (const name of [names].flat()) {
        const photo = await findPhotoFor(name);
        if (photo) return photo;
    }
    return null;
}

async function findPhotoFor(car) {
    const key = car.toLowerCase().replace(/\s+/g, ' ').trim();
    const cached = cache.get(key);
    let photos = cached && cached.expires > Date.now() ? cached.photos : null;

    if (!photos) {
        try {
            // Never let a slow lookup hold up the build: give up after 5 seconds.
            photos = await Promise.race([
                findPhotos(car),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), 5_000)),
            ]);
        } catch (error) {
            // A missing picture is fine; the build is still saved without one.
            console.error('Car photo lookup failed:', error.message);
            return null; // don't cache a failure
        }
        cache.set(key, { photos, expires: Date.now() + (photos.length ? CACHE_MS : MISS_CACHE_MS) });
    }

    return photos.length ? photos[Math.floor(Math.random() * photos.length)] : null;
}
