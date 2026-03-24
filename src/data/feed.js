/**
 * feed.js — TYS 2026 Community Feed Seed Data
 * Pre-seeded posts that populate the feed on first load.
 * Reactions on these posts are persisted separately via localStorage.
 */

const FEED_SEED = [
    {
        id: 's1',
        author: 'DhoniForever',
        text: 'Thala still has it. Nobody keeps wicket like him. 💛 Whistle Podu!',
        ts: Date.now() - 1 * 3600 * 1000,
        reactions: { '🔥': 31, '💛': 47, '👏': 14 },
        matchDay: false
    },
    {
        id: 's2',
        author: 'YellowArmy99',
        text: 'Guwahati is going to be electric on the 30th. The whole stadium will be yellow!',
        ts: Date.now() - 3 * 3600 * 1000,
        reactions: { '🔥': 18, '💛': 29, '👏': 11 },
        matchDay: false
    },
    {
        id: 's3',
        author: 'RuturajFC',
        text: 'Captain Cool 2.0. Rutu carries the batting lineup every single game. What a leader.',
        ts: Date.now() - 6 * 3600 * 1000,
        reactions: { '🔥': 52, '💛': 19, '👏': 26 },
        matchDay: false
    },
    {
        id: 's4',
        author: 'DeepeeStand',
        text: 'Nathan Ellis is going to be our secret weapon this season. Pace + yorkers = 🔥',
        ts: Date.now() - 18 * 3600 * 1000,
        reactions: { '🔥': 23, '💛': 8, '👏': 17 },
        matchDay: false
    },
    {
        id: 's5',
        author: 'Chepauk_Ultra',
        text: 'MS at 7 is a masterclass in itself. One ball can change everything when Thala walks in.',
        ts: Date.now() - 30 * 3600 * 1000,
        reactions: { '🔥': 67, '💛': 88, '👏': 41 },
        matchDay: false
    }
];
