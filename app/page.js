import { supabase } from '../lib/supabaseClient';

export default async function Home() {
    const { data: items, error } = await supabase
        .from('Car')
        .select('*')
        .order('ud', { ascending: true });

    if (error) {
        return (
            <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
                <h1>Error loading items</h1>
                <p>{error.message}</p>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '1rem' }}>Items List</h1>

            {(!items || items.length === 0) ? (
                <p>No items found.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                    {items.map((item) => (
                        <div
                            key={item.ud}
                            style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '1.25rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{item.Brand}</h2>
                            <p style={{ margin: 0, color: '#555' }}>{item.Model}</p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
