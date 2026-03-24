/**
 * mood.js — TYS 2026 Fan Mood Wall
 * Pre-match hype reaction system.
 * Votes persist in localStorage, keyed per match.
 */

const MoodWall = (() => {

    /** Available reactions */
    const REACTIONS = [
        { id: 'fire',    emoji: '🔥', label: 'Hyped'     },
        { id: 'golden',  emoji: '💛', label: 'Confident' },
        { id: 'charged', emoji: '⚡', label: 'Charged'   },
        { id: 'pumped',  emoji: '😤', label: 'Pumped'    },
        { id: 'nervous', emoji: '😬', label: 'Nervous'   },
    ];

    /** Seed counts give the wall a "community" feel from day one */
    const SEED = { fire: 312, golden: 241, charged: 178, pumped: 134, nervous: 67 };

    function storageKey() {
        const label = (DATA && DATA.nextMatch && DATA.nextMatch.label) || 'match';
        return `tys_vibe_${label.replace(/\s+/g, '_')}`;
    }

    /** Returns the user's saved reaction id, or null */
    function loadVote() {
        return localStorage.getItem(storageKey());
    }

    /** Saves the user's reaction id */
    function saveVote(id) {
        localStorage.setItem(storageKey(), id);
    }

    /** Returns total votes (seed + user's 1 vote if cast) */
    function totalVotes(vote) {
        const base = Object.values(SEED).reduce((a, b) => a + b, 0);
        return vote ? base + 1 : base;
    }

    /** Returns display count for a reaction */
    function countFor(id, vote) {
        return vote === id ? SEED[id] + 1 : SEED[id];
    }

    /** Renders / re-renders the reaction buttons */
    function render(vote) {
        const container = document.getElementById('mood-reactions');
        const totalEl   = document.getElementById('mood-total');
        if (!container || !totalEl) return;

        container.innerHTML = REACTIONS.map(r => `
            <button
                class="mood-btn${vote === r.id ? ' active' : ''}"
                data-id="${r.id}"
                aria-pressed="${vote === r.id}"
                aria-label="${r.label} — ${countFor(r.id, vote)} votes"
            >
                <span class="mood-emoji" aria-hidden="true">${r.emoji}</span>
                <span class="mood-count">${countFor(r.id, vote)}</span>
                <span class="mood-label">${r.label}</span>
            </button>
        `).join('');

        totalEl.textContent = `${totalVotes(vote).toLocaleString()} fans reacted`;

        container.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const picked = btn.dataset.id;
                saveVote(picked);
                render(picked);
            });
        });
    }

    function init() {
        render(loadVote());
    }

    /** Public API */
    return { init };

})();
