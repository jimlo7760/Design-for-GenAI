import Link from 'next/link';
import Avatar from './Avatar';
import VoteButtons from './VoteButtons';
import DeleteBuildButton from './DeleteBuildButton';
import ModEditor from './ModEditor';
import ModItem from './ModItem';
import RenderButton from './RenderButton';
import { addMod, removeMod, resetMods } from '../app/actions';
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
// detailed: the full page for one build. deck: the Judge page, which shows the whole
// build but no scores or controls, so votes are not swayed by the crowd.
export default function BuildCard({ build, currentUserId, detailed = false, deck = false }) {
    const isOwner = build.user_id === currentUserId;
    const creator = fullName(build.profiles) || 'Someone';
    const full = detailed || deck;
    // The AI render of the build comes first, then your own upload, then the openly
    // licensed stock photo found for this car.
    const heroUrl = build.render_url || build.photo_url || build.image_url;
    const badge = build.render_url ? 'AI render of this build' : build.photo_url ? 'Photo of the base car' : 'Stock photo of the base car';
    const showCredit = build.render_url || (!build.photo_url && build.image_url);
    const mods = full ? build.mods : build.mods.slice(0, 3);
    // Only the owner, on the build's own page, can change the parts (the Judge deck stays read-only).
    // mods_editable is false until supabase/assignment4_edit.sql has been run.
    const editable = isOwner && detailed && !deck && build.mods_editable !== false;
    // The picture was made from the list as it was then; later edits are not in it.
    const renderOutdated = Boolean(
        build.render_url && build.mods_edited_at && build.rendered_at && new Date(build.mods_edited_at) > new Date(build.rendered_at)
    );

    return (
        <article className={full ? 'card build build--full' : 'card build'}>
            <div className="build__media">
                {heroUrl ? (
                    <>
                        <img
                            src={heroUrl}
                            alt={build.render_url ? `AI render of the ${build.car_name} build “${build.title}”` : `The ${build.car_name}, the base for this build`}
                            loading={deck ? 'eager' : 'lazy'}
                            className="build__img"
                        />
                        <span className="build__badge">{badge}</span>
                    </>
                ) : (
                    <div className="build__placeholder">{build.car_name}</div>
                )}
            </div>
            {showCredit && (
                <p className="build__credit">
                    {build.render_url ? 'AI render of this build' : 'Not the finished build'}
                    {renderOutdated && ' (made before the parts list was edited)'}
                    {build.image_url && !build.photo_url && (
                        <>
                            {' '}· {build.render_url ? 'based on a photo by' : 'Photo:'} {build.image_credit} · {build.image_license} ·{' '}
                            <a href={build.image_source_url} target="_blank" rel="noopener noreferrer">
                                Wikimedia Commons
                            </a>
                        </>
                    )}
                </p>
            )}

            <div className="build__body">
                <div className="build__top">
                    <p className="build__car">{build.car_name}</p>
                    {build.est_cost_usd != null && (
                        <p className="build__cost">
                            Est. cost <strong>${build.est_cost_usd.toLocaleString('en-US')}</strong>
                        </p>
                    )}
                </div>
                <h2 className="build__title">
                    {full ? build.title : <Link href={`/builds/${build.id}`}>{build.title}</Link>}
                </h2>
                <p className="build__tagline">{build.tagline}</p>

                {editable ? (
                    <ModEditor
                        buildId={build.id}
                        car={build.car_name}
                        mods={build.mods}
                        edited={Boolean(build.mods_edited_at)}
                        onRemove={removeMod}
                        onAdd={addMod}
                        onReset={resetMods}
                    />
                ) : (
                    <>
                        <ul className="mods">
                            {mods.map((mod, index) => (
                                <ModItem key={index} mod={mod} full={full} />
                            ))}
                            {!full && build.mods.length > 3 && (
                                <li className="mods__more">
                                    <Link href={`/builds/${build.id}`}>+ {build.mods.length - 3} more mods →</Link>
                                </li>
                            )}
                        </ul>
                        {full && build.mods_edited_at && (
                            <p className="mods__note">The owner has edited this parts list since the AI wrote it.</p>
                        )}
                    </>
                )}

                {full && (
                    <p className="build__vibe">Vibe requested: “{build.vibe}”</p>
                )}

                {isOwner && !deck && !build.render_url && <RenderButton buildId={build.id} />}

                <div className="build__footer">
                    <div className="byline">
                        <Avatar url={build.profiles?.avatar_url} name={creator} size={28} />
                        <span>
                            <strong>{isOwner ? 'You' : creator}</strong> · {timeAgo(build.created_at)}
                        </span>
                    </div>

                    {!deck && (
                        <div className="row">
                            {isOwner && <DeleteBuildButton buildId={build.id} redirectTo={detailed ? '/' : undefined} />}
                            <VoteButtons
                                buildId={build.id}
                                upvotes={build.upvotes}
                                downvotes={build.downvotes}
                                myVote={build.myVote}
                                isOwner={isOwner}
                            />
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
