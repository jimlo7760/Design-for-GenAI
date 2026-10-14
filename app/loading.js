// Shown instantly while a page's data loads, so navigation never feels frozen.
export default function Loading() {
    return (
        <div className="page" role="status" aria-label="Loading">
            <div className="container stack">
                <div className="skeleton" style={{ height: 36, width: '55%' }} />
                <div className="skeleton" style={{ height: 64 }} />
                <div className="skeleton" style={{ height: 380 }} />
                <div className="skeleton" style={{ height: 380 }} />
            </div>
        </div>
    );
}
