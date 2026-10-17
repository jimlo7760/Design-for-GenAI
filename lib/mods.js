// The rules for the list of mods on a build, shared by the AI layer, the Server Actions that edit
// the list, the part search and the pages that show it. Plain functions only: no secrets, and no
// 'use server' (a 'use server' file may export nothing but async functions).

export const MAX_MODS = 12;
export const MAX_COST_USD = 500_000;
export const FITMENT_LEVELS = ['confirmed', 'likely', 'check'];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value) => typeof value === 'string' && UUID.test(value);

// One line of plain text: no control characters, spaces collapsed, cut to `max` characters.
export function cleanText(value, max) {
    return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

// A whole-dollar amount from 0 to MAX_COST_USD, or null when the value is not a usable number.
export function cleanCost(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.min(Math.round(number), MAX_COST_USD) : null;
}

// One mod, from the AI or from the owner: only the known fields, trimmed and cut to length.
// Returns null when there is no part name. `source: 'you'` marks a part the owner added.
export function cleanMod(raw) {
    const part = cleanText(raw?.part, 120);
    if (!part) return null;
    const mod = {
        category: cleanText(raw.category, 40) || 'Other',
        part,
        detail: cleanText(raw.detail, 300),
    };
    const cost = cleanCost(raw.cost_usd);
    if (cost !== null) mod.cost_usd = cost;
    if (raw.source === 'you') mod.source = 'you';
    return mod;
}

export function cleanMods(list, max = MAX_MODS) {
    return (Array.isArray(list) ? list : []).map(cleanMod).filter(Boolean).slice(0, max);
}

// Two part names are "the same" if they only differ in capitals, spaces or punctuation.
export function partKey(part) {
    return cleanText(part, 120).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}


// Costs -------------------------------------------------------------------------

// The sum of the parts' costs when every part has one, otherwise null.
export function totalCost(mods) {
    if (!Array.isArray(mods) || mods.length === 0) return null;
    let sum = 0;
    for (const mod of mods) {
        if (!Number.isFinite(mod?.cost_usd)) return null;
        sum += mod.cost_usd;
    }
    return sum;
}

// What one part is worth within the build's estimated total. A part the AI priced knows its own
// cost. Builds made before parts were priced one by one only have a total, so each unpriced part
// gets an even share of whatever the priced parts leave over.
export function shareOfTotal(mods, total, index) {
    const own = mods[index]?.cost_usd;
    if (Number.isFinite(own)) return own;
    if (!Number.isFinite(total)) return null;
    const unpriced = mods.filter((mod) => !Number.isFinite(mod?.cost_usd)).length;
    const priced = mods.reduce((sum, mod) => sum + (Number.isFinite(mod?.cost_usd) ? mod.cost_usd : 0), 0);
    return Math.max(0, Math.round((total - priced) / unpriced));
}

// The estimated total once the part at `index` is taken off the list. Exact when every remaining
// part has its own cost; otherwise the old total minus that part's share.
export function totalWithout(mods, total, index) {
    const exact = totalCost(mods.filter((_, i) => i !== index));
    if (exact !== null) return exact;
    if (!Number.isFinite(total)) return null;
    return Math.max(0, total - (shareOfTotal(mods, total, index) ?? 0));
}

// The estimated total once `mod` is put on the list.
export function totalWith(mods, total, mod) {
    const exact = totalCost([...mods, mod]);
    if (exact !== null) return exact;
    if (!Number.isFinite(total)) return null;
    return total + (mod.cost_usd ?? 0);
}


// Part search ----------------------------------------------------------------

// One suggestion from the part search: the fields of a mod plus a price range and how sure we
// are that it fits. Returns null when there is no part name.
export function cleanOption(raw) {
    const mod = cleanMod({ ...raw, source: undefined });
    if (!mod) return null;

    let low = cleanCost(raw.price_low);
    let high = cleanCost(raw.price_high);
    if (low !== null && high !== null && low > high) [low, high] = [high, low];

    // One typical price: the AI's own figure, else the middle of its range, kept inside the range.
    let cost = mod.cost_usd ?? (low !== null && high !== null ? Math.round((low + high) / 2) : (low ?? high));
    if (cost !== null && low !== null) cost = Math.max(cost, low);
    if (cost !== null && high !== null) cost = Math.min(cost, high);

    return {
        part: mod.part,
        category: mod.category,
        detail: mod.detail,
        cost_usd: cost,
        price_low: low ?? cost,
        price_high: high ?? cost,
        fitment: FITMENT_LEVELS.includes(raw.fitment) ? raw.fitment : 'check',
    };
}

// A web search the owner can open to check the price and fitment of a suggestion themselves.
export function partSearchUrl(part, car) {
    return `https://www.google.com/search?q=${encodeURIComponent(`${part} ${car} price fitment`)}`;
}
