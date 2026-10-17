import { brandLogo } from '../lib/brandLogos';

// The value of the "Other" tile: the make isn't listed, so the person types the whole car in.
export const OTHER_BRAND = '__other__';

function CarIcon() {
    return (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M6.2 11 7.9 7.3a1.6 1.6 0 0 1 1.4-.9h5.4a1.6 1.6 0 0 1 1.4.9L17.8 11" />
            <rect x="2.8" y="11" width="18.4" height="5.6" rx="2" />
            <circle cx="7.4" cy="17" r="1.9" fill="#fff" />
            <circle cx="16.6" cy="17" r="1.9" fill="#fff" />
        </svg>
    );
}

// The brand's logo, or its first letter when we don't have one (e.g. a make someone
// added to the Car table).
export function Logo({ name }) {
    const src = brandLogo(name);
    if (!src) return <span className="brand-tile__mono" aria-hidden="true">{name.trim().charAt(0).toUpperCase() || '?'}</span>;
    // alt is empty on purpose: the brand's name is written right beneath the logo.
    return <img src={src} alt="" width={64} height={40} decoding="async" />;
}

// A grid of logo tiles that works like a radio group: arrow keys move between brands and
// the form's own validation asks for one. onChange(brand, byPointer) says whether it was
// picked with a mouse or finger (true) or the keyboard (false).
export default function BrandPicker({ brands, value, onChange, disabled = false }) {
    return (
        <fieldset className="brand-picker" disabled={disabled}>
            <legend>Brand</legend>
            <div className="brand-grid">
                {[...brands, OTHER_BRAND].map((brand) => {
                    const isOther = brand === OTHER_BRAND;
                    return (
                        <label key={brand} className="brand-tile">
                            <input
                                type="radio"
                                name="brand"
                                value={brand}
                                checked={value === brand}
                                // Keyboard-made changes arrive as clicks with detail 0.
                                onChange={(event) => onChange(brand, event.nativeEvent.detail > 0)}
                                // The value is an internal marker, so say in words what this tile does.
                                aria-label={isOther ? 'Other (type in your own car)' : undefined}
                                required
                                className="brand-tile__input"
                            />
                            <span className="brand-tile__body">
                                <span className="brand-tile__logo">{isOther ? <CarIcon /> : <Logo name={brand} />}</span>
                                <span className="brand-tile__name">{isOther ? 'Other' : brand}</span>
                            </span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
