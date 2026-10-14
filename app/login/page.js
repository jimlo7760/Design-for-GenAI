import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../lib/auth';
import GoogleSignInButton from './GoogleSignInButton';

const STEPS = [
    {
        title: 'Pick a car and a vibe',
        text: 'Choose any make and model, then say what the build is for: a daily commuter, a track toy, a sleeper.',
    },
    {
        title: 'AI designs the build',
        text: 'Get a named build with a parts list, a price estimate and a tagline. Add your own photo and the AI works with what it sees.',
    },
    {
        title: 'The squad votes',
        text: 'Everyone upvotes or downvotes. The best builds climb the daily and all-time boards.',
    },
];

// An illustration of what the AI hands back, so visitors know what they're signing up for.
function ExampleBuild() {
    return (
        <article className="card build" aria-label="Example build">
            <div className="build__media">
                <div className="build__placeholder">Honda Civic Si (FG2)</div>
                <span className="build__badge">Example build</span>
            </div>
            <div className="build__body">
                <div className="build__top">
                    <p className="build__car">Honda Civic Si (FG2)</p>
                    <p className="build__cost">Est. cost <strong>$3,850</strong></p>
                </div>
                <h3 className="build__title" style={{ fontSize: '1.4rem' }}>Pothole-Proof Commuter</h3>
                <p className="build__tagline">Looks stock, rides like it has never met a Manhattan pothole.</p>
                <ul className="mods">
                    <li className="mod">
                        <div className="mod__head">
                            <span className="mod__part">Bilstein B6 dampers with stock springs</span>
                            <span className="pill">Suspension</span>
                        </div>
                    </li>
                    <li className="mod">
                        <div className="mod__head">
                            <span className="mod__part">17&quot; flow-formed wheels, taller sidewall tires</span>
                            <span className="pill">Wheels</span>
                        </div>
                    </li>
                    <li className="mod">
                        <div className="mod__head">
                            <span className="mod__part">Sound-deadening kit and wireless CarPlay</span>
                            <span className="pill">Interior</span>
                        </div>
                    </li>
                </ul>
            </div>
        </article>
    );
}

export default async function LoginPage({ searchParams }) {
    if (await getCurrentUser()) redirect('/');

    const { error } = await searchParams;

    return (
        <div className="page">
            <div className="container stack" style={{ gap: '2.5rem' }}>
                <section className="hero" aria-labelledby="hero-title">
                    <h1 id="hero-title">AI designs the build. You decide what deserves to exist.</h1>
                    <p className="hero__lede">
                        Mod Squad turns any car and any vibe into a full modification plan, then lets the community vote on the best ones.
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
                </section>

                <section aria-labelledby="how-title">
                    <h2 id="how-title" className="section-title">How it works</h2>
                    <ol className="steps">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="card step">
                                <span className="step__num">Step {index + 1}</span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section aria-labelledby="example-title">
                    <h2 id="example-title" className="section-title">What a build looks like</h2>
                    <ExampleBuild />
                </section>
            </div>
        </div>
    );
}
