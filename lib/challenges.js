// A new theme every day gives people a reason to come back: today's challenge is
// shown on the home page and pre-fills the generator. Same theme for everyone on a
// given (UTC) day, with no database needed.
const CHALLENGES = [
    'Subway-proof daily driver for NYC potholes',
    'Weekend escape to the Catskills',
    'Sleeper: looks stock, isn\'t',
    'Slammed and clean, show-car stance',
    'Track day on a student budget',
    'Late-night Manhattan cruiser',
    'Retro-futuristic Japanese street machine',
    'Rally-inspired winter warrior',
    'Quiet luxury grand tourer',
    'Under $2,000 total, big personality',
    'Fast food run hero: loud on the outside, practical inside',
    'Movie-car tribute, no spoilers',
];

export function todaysChallenge(now = new Date()) {
    const dayNumber = Math.floor(now.getTime() / 86_400_000);
    return CHALLENGES[dayNumber % CHALLENGES.length];
}

// Quick-start ideas shown as chips under the vibe box.
export const VIBE_IDEAS = [
    'NYC street-smart commuter',
    'Weekend track day',
    'JDM drift build',
    'Clean sleeper',
    'Offroad-ready Catskills explorer',
];
