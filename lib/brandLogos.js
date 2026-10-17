// Logos for the brand picker on /generate. The image files live in public/brands/.
// Source: github.com/filippofilip95/car-logos-dataset (thumb images, commit bb2d661f).
// Its code is MIT licensed, but the logos remain the property of their owners. They are
// shown only to identify each make. Brands without a logo here get a letter badge.
export const BRAND_LOGOS = {
    'Acura': '/brands/acura.png',
    'Alfa Romeo': '/brands/alfa-romeo.png',
    'Audi': '/brands/audi.png',
    'BMW': '/brands/bmw.png',
    'Chevrolet': '/brands/chevrolet.png',
    'Dodge': '/brands/dodge.png',
    'Ford': '/brands/ford.png',
    'Honda': '/brands/honda.png',
    'Hyundai': '/brands/hyundai.png',
    'Jeep': '/brands/jeep.png',
    'Kia': '/brands/kia.png',
    'Lexus': '/brands/lexus.png',
    'Mazda': '/brands/mazda.png',
    'Mercedes-Benz': '/brands/mercedes-benz.png',
    'Mitsubishi': '/brands/mitsubishi.png',
    'Nissan': '/brands/nissan.png',
    'Porsche': '/brands/porsche.png',
    'Subaru': '/brands/subaru.png',
    'Tesla': '/brands/tesla.png',
    'Toyota': '/brands/toyota.png',
    'Volkswagen': '/brands/volkswagen.png',
};

const BY_LOWERCASE = new Map(Object.entries(BRAND_LOGOS).map(([name, src]) => [name.toLowerCase(), src]));

// The logo's address for a brand (capital letters don't matter), or null if we have none.
export function brandLogo(brand) {
    return BY_LOWERCASE.get(String(brand).trim().toLowerCase()) ?? null;
}
