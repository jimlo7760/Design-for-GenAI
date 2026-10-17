import { redirect } from 'next/navigation';
import WheelMark from '../../components/WheelMark';
import { getCurrentUser } from '../../lib/auth';
import { pinnedPhoto } from '../../lib/carPhotos';
import GoogleSignInButton from './GoogleSignInButton';

const STEPS = [
    {
        gear: '1st',
        title: 'Pick a car and a vibe',
        text: 'Choose any make and model, then say what the build is for: a daily commuter, a track toy, a sleeper.',
    },
    {
        gear: '2nd',
        title: 'AI specs the build',
        text: 'Get a named build with a parts list, a price estimate and a tagline. Add your own photo and the AI works with what it sees.',
    },
    {
        gear: '3rd',
        title: 'The squad votes',
        text: 'Everyone upvotes or downvotes. The best builds climb the daily and all-time boards.',
    },
];

const EXAMPLE_PARTS = [
    { category: 'Suspension', part: 'Koni Sport dampers with Eibach Pro-Kit springs', cost: '$1,050' },
    { category: 'Wheels', part: '15" Enkei RPF1 wheels on 205/50 tires', cost: '$1,300' },
    { category: 'Brakes', part: 'Hawk HPS pads, stainless lines and fresh fluid', cost: '$320' },
    { category: 'Exhaust', part: 'Racing Beat header and cat-back exhaust', cost: '$1,050' },
];

// An illustration of what the AI hands back, so visitors know what they're signing up for. It uses
// the same photo (and credit) that a real build of this car would get.
function ExampleBuild() {
    const photo = pinnedPhoto('Mazda', 'MX-5 Miata', 'NA', 960);

    return (
        <article className="card build hero__card" aria-label="Example build">
            <div className="build__media">
                {photo ? (
                    <img src={photo.url} alt="A red first-generation Mazda MX-5 Miata, the base for this example build" className="build__img" />
                ) : (
                    <div className="build__placeholder">Mazda MX-5 Miata (NA)</div>
                )}
                <span className="build__badge">Example build</span>
            </div>
            {photo && (
                <p className="build__credit">
                    Not the finished build · Photo: {photo.credit} · {photo.license} ·{' '}
                    <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
                </p>
            )}
            <div className="build__body">
                <div className="build__top">
                    <p className="build__car">Mazda MX-5 Miata (NA)</p>
                    <p className="build__cost">Est. cost <strong>$3,720</strong></p>
                </div>
                <h3 className="build__title">Sunday Touge Special</h3>
                <p className="build__tagline">Small car, loud opinions, an empty mountain road at 7 a.m.</p>
                <ul className="mods">
                    {EXAMPLE_PARTS.map((item) => (
                        <li key={item.category} className="mod">
                            <div className="mod__head">
                                <span className="pill mod__cat">{item.category}</span>
                                <span className="mod__part">{item.part}</span>
                                <span className="mod__cost">{item.cost}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}

export default async function LoginPage({ searchParams }) {
    if (await getCurrentUser()) redirect('/');

    const { error } = await searchParams;

    return (
        <div className="landing">
            <section className="hero" aria-labelledby="hero-title">
                <WheelMark className="hero__wheel" />
                <div className="container container--wide hero__inner">
                    <div className="hero__copy">
                        <h1 id="hero-title">
                            Spec the dream build. <span className="hero__accent">Let the squad decide.</span>
                        </h1>
                        <p className="hero__lede">
                            Pick any car and a vibe. The AI writes the whole parts list, prices included. Then the squad votes on whether it&apos;s worth building.
                        </p>
                        <div className="hero__cta">
                            {error && (
                                <p role="alert" className="alert">
                                    Sign-in didn&apos;t work. Please try again.
                                </p>
                            )}
                            <GoogleSignInButton />
                            <p className="hero__note">Takes about 10 seconds. We only use your Google name and photo.</p>
                        </div>
                    </div>
                    <ExampleBuild />
                </div>
                <div className="stripes" aria-hidden="true" />
            </section>

            <section className="landing__section" aria-labelledby="how-title">
                <div className="container container--wide">
                    <h2 id="how-title" className="section-title">How it works</h2>
                    <ol className="gears">
                        {STEPS.map((step) => (
                            <li key={step.title} className="gear">
                                <span className="gear__num" aria-hidden="true">{step.gear}</span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="cta-band" aria-labelledby="cta-title">
                <div className="container container--wide cta-band__inner">
                    <h2 id="cta-title">Your car. Your vibe. Their verdict.</h2>
                    <GoogleSignInButton />
                </div>
            </section>
        </div>
    );
}
