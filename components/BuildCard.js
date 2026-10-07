import Link from 'next/link';
import Avatar from './Avatar';
import VoteButtons from './VoteButtons';
import DeleteBuildButton from './DeleteBuildButton';
import RenderButton from './RenderButton';
import { fullName } from '../lib/auth';

function timeAgo(iso) {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
}

// One AI-generated build with its vote buttons. `currentUserId` decides whether
// you see vote buttons (others' builds) or a delete button (your own).
export default function BuildCard({ build, currentUserId, detailed = false }) {
    const isOwner = build.user_id === currentUserId;
    const creator = fullName(build.profiles) || 'Someone';
    // The AI render of the build comes first, then your own upload, then the openly
    // licensed stock photo found for this car.
    const heroUrl = build.render_url || build.photo_url || build.image_url;

    return (
        <article
            style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
        >
            {heroUrl ? (
                <img
                    src={heroUrl}
                    alt={`${build.car_name}, the base for this build`}
                    loading="lazy"
                    style={{ display: 'block', width: '100%', height: detailed ? 420 : 240, objectFit: 'cover', background: '#e8eaf6' }}
                />
            ) : (
                <div
                    style={{
                        height: detailed ? 200 : 110,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#e8eaf6',
                        color: '#3f51b5',
                        fontSize: detailed ? '2rem' : '1.5rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                    }}
                >
                    {build.car_name}
                </div>
            )}
            {(build.render_url || (!build.photo_url && build.image_url)) && (
                <p style={{ margin: 0, padding: '0.35rem 1.25rem', background: '#fafafa', borderBottom: '1px solid #eee', color: '#777', fontSize: '0.75rem' }}>
                    {build.render_url ? 'AI render of this build' : 'Stock photo of the base car, not the finished build'}
                    {build.image_url && !build.photo_url && (
                        <>
                            {' '}· {build.render_url ? 'based on a photo by' : 'Photo:'} {build.image_credit} · {build.image_license} ·{' '}
                            <a href={build.image_source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#777' }}>
                                Wikimedia Commons
                            </a>
                        </>
                    )}
                </p>
            )}

            <div style={{ padding: '1.25rem' }}>
                <p style={{ margin: 0, color: '#3f51b5', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {build.car_name}
                </p>
                <h2 style={{ margin: '0.25rem 0 0.25rem 0', fontSize: '1.35rem' }}>
                    {detailed ? build.title : <Link href={`/builds/${build.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{build.title}</Link>}
                </h2>
                <p style={{ margin: 0, color: '#555' }}>{build.tagline}</p>

                <ul style={{ margin: '1rem 0 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
                    {(detailed ? build.mods : build.mods.slice(0, 3)).map((mod, index) => (
                        <li key={index}>
                            <strong>{mod.part}</strong>
                            <span style={{ color: '#777' }}> · {mod.category}</span>
                            {detailed && <div style={{ color: '#555' }}>{mod.detail}</div>}
                        </li>
                    ))}
                    {!detailed && build.mods.length > 3 && (
                        <li style={{ color: '#777' }}>
                            <Link href={`/builds/${build.id}`}>+ {build.mods.length - 3} more mods →</Link>
                        </li>
                    )}
                </ul>

                {build.est_cost_usd != null && (
                    <p style={{ margin: '1rem 0 0 0', color: '#555' }}>
                        Estimated cost: <strong>${build.est_cost_usd.toLocaleString('en-US')}</strong>
                    </p>
                )}
                {detailed && (
                    <p style={{ margin: '0.75rem 0 0 0', color: '#777', fontSize: '0.9rem' }}>
                        Vibe requested: “{build.vibe}”
                    </p>
                )}

                {isOwner && !build.render_url && <RenderButton buildId={build.id} />}

                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginTop: '1.25rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #eee',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
                        <Avatar url={build.profiles?.avatar_url} name={creator} size={28} />
                        <span>{isOwner ? 'You' : creator} · {timeAgo(build.created_at)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {isOwner && <DeleteBuildButton buildId={build.id} redirectTo={detailed ? '/' : undefined} />}
                        <VoteButtons
                            buildId={build.id}
                            upvotes={build.upvotes}
                            downvotes={build.downvotes}
                            myVote={build.myVote}
                            isOwner={isOwner}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}
