/**
 * profile.js — TYS 2026 Fan Profile Module
 * Handles fan profile: favourite player, squad role, win streak,
 * jersey customisation (name + number), and match predictions.
 * All preferences are persisted in localStorage.
 */

const FanProfile = (() => {

    const STORAGE_KEY = 'tys_fan_profile';

    const DEFAULT_NAME_PLACEHOLDER = 'YOUR NAME';

    const defaults = {
        fanName:      '',
        jerseyNumber: '7',   /* MS Dhoni's iconic number — a fitting default */
        favPlayer:    '',
        squadRole:    'Batters',
        winStreak:    0
    };

    let state = { ...defaults };

    /** Load saved profile from localStorage */
    function load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) state = { ...defaults, ...JSON.parse(saved) };
        } catch (_) {
            state = { ...defaults };
        }
    }

    /** Persist current profile to localStorage */
    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    /** Flatten squad object into a sorted array of player names */
    function getAllPlayers() {
        const players = [];
        for (const group of Object.values(DATA.squad)) {
            for (const p of group) players.push(p);
        }
        return players;
    }

    /** Escape a string for safe insertion into HTML attributes / text nodes */
    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /** Build the favourite player details block HTML (shown below the select) */
    function buildFavPlayerInfo(playerName) {
        if (!playerName) return '';
        const d = (DATA.playerDetails && DATA.playerDetails[playerName]) || {};
        if (!d.role) return '';

        const items = [
            d.flag  ? `<span>${d.flag} ${d.nat || ''}</span>`  : '',
            d.jersey != null ? `<span>#${d.jersey}</span>`       : '',
            d.role   ? `<span>${d.role}</span>`                  : '',
            d.age    ? `<span>Age ${d.age}</span>`               : '',
            d.bat    ? `<span>${d.bat}</span>`                   : '',
            d.bowl   ? `<span>${d.bowl}</span>`                  : ''
        ].filter(Boolean);

        if (items.length === 0) return '';
        return `<div class="fav-player-info">${items.join('')}</div>`;
    }

    /** Build and inject the Fan page HTML, then bind live events */
    function render() {
        load();

        const container = document.getElementById('fan-content');
        if (!container) return;

        const players        = getAllPlayers();
        const squadCategories = Object.keys(DATA.squad);   // Batters, Keepers, All-Rounders, Bowlers

        const playerOptions = players.map(p =>
            `<option value="${esc(p)}" ${state.favPlayer === p ? 'selected' : ''}>${esc(p)}</option>`
        ).join('');

        const roleOptions = squadCategories.map(r =>
            `<option value="${esc(r)}" ${state.squadRole === r ? 'selected' : ''}>${esc(r)}</option>`
        ).join('');

        const displayName   = esc((state.fanName || DEFAULT_NAME_PLACEHOLDER).toUpperCase());
        const displayNumber = esc(String(state.jerseyNumber || defaults.jerseyNumber));

        container.innerHTML = `
            <div class="jersey-wrap" aria-label="Jersey preview">
                <div class="jersey-body">
                    <p class="jersey-number">${displayNumber}</p>
                    <p class="jersey-name">${displayName}</p>
                </div>
            </div>

            <div class="profile-form">

                <div class="profile-field">
                    <label class="tag" for="fan-name">Name on Jersey</label>
                    <input id="fan-name" class="fan-input" type="text"
                           maxlength="18" placeholder="Your name"
                           value="${esc(state.fanName)}" autocomplete="off">
                </div>

                <div class="profile-field">
                    <label class="tag" for="jersey-num">Jersey Number</label>
                    <input id="jersey-num" class="fan-input" type="number"
                           min="1" max="99" placeholder="7"
                           value="${esc(String(state.jerseyNumber))}">
                </div>

                <div class="profile-field">
                    <label class="tag" for="fav-player">Favourite Player</label>
                    <select id="fav-player" class="fan-select">
                        <option value="">— Pick a player —</option>
                        ${playerOptions}
                    </select>
                    <div id="fav-player-info">${buildFavPlayerInfo(state.favPlayer)}</div>
                </div>

                <div class="profile-field">
                    <label class="tag" for="squad-role">Your Role</label>
                    <select id="squad-role" class="fan-select">
                        ${roleOptions}
                    </select>
                </div>

                <div class="profile-field">
                    <label class="tag">Win Streak</label>
                    <div class="streak-counter">
                        <button class="streak-btn" id="streak-down" aria-label="Decrease win streak">−</button>
                        <span id="streak-val" class="streak-value">${state.winStreak}</span>
                        <button class="streak-btn" id="streak-up" aria-label="Increase win streak">+</button>
                    </div>
                </div>

            </div>
        `;

        bindEvents();
    }

    /** Attach live-update event listeners after render */
    function bindEvents() {
        const nameInput  = document.getElementById('fan-name');
        const numInput   = document.getElementById('jersey-num');
        const playerSel  = document.getElementById('fav-player');
        const roleSel    = document.getElementById('squad-role');
        const streakUp   = document.getElementById('streak-up');
        const streakDown = document.getElementById('streak-down');
        const streakVal  = document.getElementById('streak-val');
        const favInfo    = document.getElementById('fav-player-info');

        /** Sync jersey number state to DOM and storage */
        function applyJerseyNumber(val) {
            state.jerseyNumber = val;
            document.querySelector('.jersey-number').textContent = val || defaults.jerseyNumber;
            save();
        }

        nameInput.addEventListener('input', () => {
            state.fanName = nameInput.value;
            document.querySelector('.jersey-name').textContent =
                (state.fanName || DEFAULT_NAME_PLACEHOLDER).toUpperCase();
            save();
        });

        numInput.addEventListener('input', () => {
            applyJerseyNumber(numInput.value);
        });

        numInput.addEventListener('blur', () => {
            let val = parseInt(numInput.value, 10);
            if (isNaN(val) || val < 1)  val = 1;
            if (val > 99)               val = 99;
            numInput.value = val;
            applyJerseyNumber(val);
        });

        playerSel.addEventListener('change', () => {
            state.favPlayer = playerSel.value;
            if (favInfo) favInfo.innerHTML = buildFavPlayerInfo(state.favPlayer);
            save();
        });

        roleSel.addEventListener('change', () => {
            state.squadRole = roleSel.value;
            save();
        });

        streakUp.addEventListener('click', () => {
            state.winStreak++;
            streakVal.textContent = state.winStreak;
            save();
        });

        streakDown.addEventListener('click', () => {
            if (state.winStreak > 0) state.winStreak--;
            streakVal.textContent = state.winStreak;
            save();
        });
    }

    /** Called once on DOMContentLoaded to pre-load saved state */
    function init() {
        load();
    }

    /** Public API */
    return { init, render };

})();

/* ==========================================================================
   FanPoll — Weekly poll widget on the Fan page.
   Votes are stored in localStorage, keyed by DATA.poll.id so that changing
   the id in team.js resets voting without touching any other data.
   ========================================================================== */

const FanPoll = (() => {

    function storageKey() {
        return `tys_poll_${DATA.poll.id}`;
    }

    /** Return the saved vote index (0-based), or null if not yet voted */
    function loadVote() {
        try {
            const v = localStorage.getItem(storageKey());
            return v !== null ? parseInt(v, 10) : null;
        } catch (_) {
            return null;
        }
    }

    /** Return saved vote counts array, same length as options */
    function loadCounts() {
        try {
            const raw = localStorage.getItem(storageKey() + '_counts');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length === DATA.poll.options.length) {
                    return parsed;
                }
            }
        } catch (_) { /* fall through */ }
        return new Array(DATA.poll.options.length).fill(0);
    }

    function saveCounts(counts) {
        localStorage.setItem(storageKey() + '_counts', JSON.stringify(counts));
    }

    function saveVote(idx) {
        localStorage.setItem(storageKey(), String(idx));
    }

    function totalVotes(counts) {
        return counts.reduce((a, b) => a + b, 0);
    }

    function render() {
        const container = document.getElementById('poll-content');
        if (!container) return;

        const voted  = loadVote();
        const counts = loadCounts();
        const total  = totalVotes(counts);

        if (voted !== null) {
            renderResults(container, counts, total, voted);
        } else {
            renderOptions(container);
        }
    }

    function renderOptions(container) {
        const btns = DATA.poll.options.map((opt, i) => `
            <button class="poll-option" data-idx="${i}" aria-label="${opt}">
                ${opt}
            </button>`).join('');

        container.innerHTML = `
            <div class="poll-card" aria-label="Fan poll">
                <p class="tag">Fan Poll</p>
                <p class="poll-question">${DATA.poll.question}</p>
                <div class="poll-options">${btns}</div>
            </div>`;

        container.querySelectorAll('.poll-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx    = parseInt(btn.dataset.idx, 10);
                const counts = loadCounts();
                counts[idx]++;
                saveCounts(counts);
                saveVote(idx);
                renderResults(container, counts, totalVotes(counts), idx);
            });
        });
    }

    function renderResults(container, counts, total, voted) {
        const bars = DATA.poll.options.map((opt, i) => {
            const pct    = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
            const isVote = i === voted;
            return `
            <div class="poll-result${isVote ? ' poll-result--voted' : ''}"
                 aria-label="${opt}: ${pct}%">
                <div class="poll-result-label">
                    <span>${opt}</span>
                    <span class="poll-pct">${pct}%</span>
                </div>
                <div class="poll-bar-track" role="progressbar" aria-valuenow="${pct}"
                     aria-valuemin="0" aria-valuemax="100">
                    <div class="poll-bar-fill" style="width:${pct}%"></div>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="poll-card" aria-label="Fan poll results">
                <p class="tag">Fan Poll</p>
                <p class="poll-question">${DATA.poll.question}</p>
                <div class="poll-results">${bars}</div>
                <p class="poll-total">${total} vote${total !== 1 ? 's' : ''}</p>
                <button class="poll-change-btn" aria-label="Change your vote">Change vote</button>
            </div>`;

        container.querySelector('.poll-change-btn').addEventListener('click', () => {
            localStorage.removeItem(storageKey());
            renderOptions(container);
        });
    }

    return { render };

})();

/* ==========================================================================
   FanPredictions — Match prediction widget on the Fan page.
   Users predict W (win) or L (loss) for upcoming CSK matches.
   Predictions are stored in localStorage and compared once results are known.
   ========================================================================== */

const FanPredictions = (() => {

    const STORAGE_KEY = 'tys_predictions_2026';

    /** Load predictions object { isoKey: 'W'|'L' } from localStorage */
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (_) {
            return {};
        }
    }

    /** Save predictions object to localStorage */
    function save(preds) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preds));
    }

    /** Toggle or set a prediction for a fixture by ISO key */
    function setPrediction(iso, pick) {
        const preds = load();
        if (preds[iso] === pick) {
            delete preds[iso]; // tap same pick to clear
        } else {
            preds[iso] = pick;
        }
        save(preds);
    }

    function render() {
        const container = document.getElementById('predictions-content');
        if (!container) return;

        const preds       = load();
        const savedResults = Results.load();
        const now          = Date.now();

        // Show all fixtures — upcoming for predicting, past for checking accuracy
        const allFixtures = DATA.fixtures.map((f, i) => ({ f, i }));

        if (allFixtures.length === 0) {
            container.innerHTML = '<p class="prediction-empty">No fixtures available.</p>';
            return;
        }

        const rows = allFixtures.map(({ f, i }) => {
            const iso       = f.iso || '';
            const isPast    = iso && new Date(iso).getTime() <= now;
            const pred      = preds[iso] || null;
            const actual    = savedResults[i] || null;
            const short     = (window.TEAM_SHORT && window.TEAM_SHORT[f.o]) || (f.o ? f.o.substring(0, 3).toUpperCase() : '???');

            // Outcome: correct / wrong / pending
            let outcomeClass = '';
            let outcomeBadge = '';
            if (isPast && actual && pred) {
                if (pred === actual) {
                    outcomeClass = 'prediction-item--correct';
                    outcomeBadge = '<span class="prediction-outcome prediction-outcome--correct">✓ Correct</span>';
                } else {
                    outcomeClass = 'prediction-item--wrong';
                    outcomeBadge = '<span class="prediction-outcome prediction-outcome--wrong">✗ Wrong</span>';
                }
            }

            const winActive  = pred === 'W' ? ' prediction-btn--win-active'  : '';
            const lossActive = pred === 'L' ? ' prediction-btn--loss-active' : '';
            const disabled   = isPast ? 'disabled' : '';

            return `
            <div class="prediction-item ${outcomeClass}" data-iso="${iso}">
                <div class="prediction-match">
                    <p class="prediction-opponent">vs ${short}</p>
                    <p class="prediction-date">${f.d}${isPast ? ' · ' + (actual ? actual : 'Result TBA') : ''}</p>
                </div>
                <div class="prediction-controls">
                    ${outcomeBadge}
                    <button class="prediction-btn prediction-btn--win${winActive}"
                            data-iso="${iso}" data-pick="W" ${disabled}
                            aria-label="Predict win vs ${short}" aria-pressed="${pred === 'W'}">WIN</button>
                    <button class="prediction-btn prediction-btn--loss${lossActive}"
                            data-iso="${iso}" data-pick="L" ${disabled}
                            aria-label="Predict loss vs ${short}" aria-pressed="${pred === 'L'}">LOSS</button>
                </div>
            </div>`;
        }).join('');

        // Score summary
        const allPreds   = Object.entries(preds);
        const scored     = allPreds.filter(([iso, pick]) => {
            const idx  = DATA.fixtures.findIndex(f => f.iso === iso);
            const actual = idx >= 0 ? savedResults[idx] : null;
            return actual && pick === actual;
        }).length;
        const attempted  = allPreds.filter(([iso]) => {
            const idx  = DATA.fixtures.findIndex(f => f.iso === iso);
            const actual = idx >= 0 ? savedResults[idx] : null;
            return !!actual;
        }).length;

        const scoreHtml = attempted > 0
            ? `<p class="prediction-score">${scored}/${attempted} correct predictions</p>`
            : '';

        container.innerHTML = `
            <div class="prediction-card" aria-label="Match predictions">
                <p class="tag">Match Predictions</p>
                <p class="prediction-desc">Predict each match outcome before it starts. Locked once the match begins.</p>
                ${scoreHtml}
                <div class="prediction-list">${rows}</div>
            </div>`;

        // Bind button events
        container.querySelectorAll('.prediction-btn[data-pick]').forEach(btn => {
            if (btn.disabled) return;
            btn.addEventListener('click', () => {
                const iso  = btn.dataset.iso;
                const pick = btn.dataset.pick;
                setPrediction(iso, pick);
                render(); // re-render to reflect new state
            });
        });
    }

    return { render };

})();

