// A round profile photo, or the person's initial when they haven't uploaded one.
export default function Avatar({ url, name, size = 40 }) {
    const round = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };

    if (url) {
        return (
            <img
                src={url}
                alt={name ? `Photo of ${name}` : 'Profile photo'}
                width={size}
                height={size}
                style={{ ...round, objectFit: 'cover' }}
            />
        );
    }

    return (
        <div
            aria-hidden="true"
            style={{
                ...round,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e8eaf6',
                color: '#3f51b5',
                fontWeight: 600,
                fontSize: size * 0.42,
            }}
        >
            {(name?.trim()?.[0] ?? '?').toUpperCase()}
        </div>
    );
}
