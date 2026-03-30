/**
 * profile.js — TYS 2026 Fan Profile Module
 * Handles fan profile: favourite player, squad role, win streak,
 * jersey customisation (name + number), and match predictions.
 * All preferences are persisted in localStorage.
 *
 * ── Modules in this file ────────────────────────────────────────────────────
 *  FanProfile      (line ~8)    Jersey preview, favourite player, win streak,
 *                               notification lead, timezone, favourite venue.
 *                               localStorage key: tys_fan_profile
 *
 *  FanPoll         (line ~294)  Weekly fan poll with percentage-bar results.
 *                               localStorage key: tys_poll_<poll.id>
 *
 *  FanPredictions  (line ~419)  Per-fixture W/L predictions (locked once live).
 *                               localStorage key: tys_predictions_2026
 *
 *  CricketQuiz     (line ~520)  10-question cricket trivia quiz, shuffled each
 *                               session, with instant feedback and medal screen.
 *
 *  TossTracker     (line ~684)  Per-match toss won/lost + bat/field choice.
 *                               localStorage key: tys_toss_2026
 *
 *  MatchJournal    (line ~839)  280-char notes per fixture, debounced auto-save.
 *                               localStorage key: tys_journal_2026
 *
 *  FantasyTips     (line ~938)  Per-fixture fantasy pick guide (captain, VC,
 *                               must-picks, differentials, avoid list, summary).
 *                               Data source: DATA.fantasyTips keyed by ISO date.
 * ────────────────────────────────────────────────────────────────────────────
 */

const FanProfile = (() => {

    const STORAGE_KEY = 'tys_fan_profile';
    const ALLOWED_LEADS = [10, 15, 30, 60]; // minutes before match start for reminders

    const DEFAULT_NAME_PLACEHOLDER = 'YOUR NAME';

    const defaults = {
        fanName:           '',
        jerseyNumber:      '7',   /* MS Dhoni's iconic number — a fitting default */
        favPlayer:         '',
        squadRole:         'Batters',
        winStreak:         0,
        notifLeadMinutes:  15,
        timezonePref:      'local', // 'local' | 'ist'
        favVenue:          ''
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

    /**
     * Derives the suggested win streak from DATA.lastResult.
     * Returns null when no result data is available.
     * Returns 0 when the last result was a loss.
     * Returns the current stored streak + 1 when there's a win that hasn't
     * been counted yet (detected by comparing with the ISO of the last past fixture).
     */
    function suggestedStreak(currentStreak) {
        if (!DATA.lastResult || !DATA.lastResult.result) return null;
        const result = DATA.lastResult.result; // 'W' | 'L' | 'N'
        if (result === 'L') return 0;
        if (result === 'W') {
            // Check the last-stored counted ISO to avoid double-counting
            const lastCountedISO = localStorage.getItem('tys_streak_last_iso') || '';
            const now = Date.now();
            let latestISO = null, latestMs = 0;
            (DATA.fixtures || []).forEach(f => {
                if (!f.iso) return;
                const ms = new Date(f.iso).getTime();
                if (ms < now && ms > latestMs) { latestMs = ms; latestISO = f.iso; }
            });
            if (latestISO && latestISO !== lastCountedISO) return currentStreak + 1;
        }
        return null; // No change needed
    }

    /**
     * Builds an inline hint element when the data suggests the streak
     * should be updated.  Returns an empty string when no hint is needed.
     */
    function buildStreakHint(currentStreak) {
        const suggested = suggestedStreak(currentStreak);
        if (suggested === null) return '';
        if (suggested === currentStreak) return ''; // already in sync
        const label = suggested === 0
            ? '🔴 CSK lost — reset streak to 0?'
            : `🟡 CSK won! Update streak to ${suggested}?`;
        return `<button class="streak-hint-btn" id="streak-hint" data-suggested="${suggested}"
                        aria-label="Sync win streak with last result">${label}</button>`;
    }

    /** Build and inject the Fan page HTML, then bind live events */
    function render() {
        load();

        const container = document.getElementById('fan-content');
        if (!container) return;

        const players        = getAllPlayers();
        const squadCategories = Object.keys(DATA.squad);   // Batters, Keepers, All-Rounders, Bowlers
        const venues         = Object.keys(DATA.venueInfo || {});

        const playerOptions = players.map(p =>
            `<option value="${esc(p)}" ${state.favPlayer === p ? 'selected' : ''}>${esc(p)}</option>`
        ).join('');

        const roleOptions = squadCategories.map(r =>
            `<option value="${esc(r)}" ${state.squadRole === r ? 'selected' : ''}>${esc(r)}</option>`
        ).join('');

        const venueOptions = [''].concat(venues).map(v =>
            `<option value="${esc(v)}" ${state.favVenue === v ? 'selected' : ''}>${v ? esc(v) : '— Pick a venue —'}</option>`
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
                    ${buildStreakHint(state.winStreak)}
                </div>

                <div class="profile-field">
                    <label class="tag" for="notif-lead">Match Reminder</label>
                    <select id="notif-lead" class="fan-select">
                        ${ALLOWED_LEADS.map(min =>
                            `<option value="${min}" ${state.notifLeadMinutes === min ? 'selected' : ''}>${min} minutes before</option>`
                        ).join('')}
                    </select>
                    <p class="field-hint">How far in advance the 🔔 bell reminds you before each CSK match.</p>
                </div>

                <div class="profile-field">
                    <label class="tag" for="fav-venue">Favorite Venue</label>
                    <select id="fav-venue" class="fan-select">
                        ${venueOptions}
                    </select>
                </div>

                <div class="profile-field">
                    <label class="tag" for="time-zone">Time Display</label>
                    <select id="time-zone" class="fan-select">
                        <option value="local" ${state.timezonePref === 'local' ? 'selected' : ''}>Use my timezone</option>
                        <option value="ist" ${state.timezonePref === 'ist' ? 'selected' : ''}>Always show in IST</option>
                    </select>
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
        const notifLead  = document.getElementById('notif-lead');
        const favVenue   = document.getElementById('fav-venue');
        const tzSelect   = document.getElementById('time-zone');

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
            // Remove hint if user manually synced
            const hint = document.getElementById('streak-hint');
            if (hint) hint.remove();
        });

        streakDown.addEventListener('click', () => {
            if (state.winStreak > 0) state.winStreak--;
            streakVal.textContent = state.winStreak;
            save();
            // Remove hint if user manually reached 0
            const hint = document.getElementById('streak-hint');
            if (hint) hint.remove();
        });

        // Streak sync hint button — auto-applies the suggested value from DATA.lastResult
        const streakHint = document.getElementById('streak-hint');
        if (streakHint) {
            streakHint.addEventListener('click', () => {
                const suggested = parseInt(streakHint.dataset.suggested, 10);
                if (!isNaN(suggested)) {
                    state.winStreak = suggested;
                    streakVal.textContent = suggested;
                    // Remember which fixture we just counted so we don't prompt again
                    const now = Date.now();
                    let latestISO = null, latestMs = 0;
                    (DATA.fixtures || []).forEach(f => {
                        if (!f.iso) return;
                        const ms = new Date(f.iso).getTime();
                        if (ms < now && ms > latestMs) { latestMs = ms; latestISO = f.iso; }
                    });
                    if (latestISO) localStorage.setItem('tys_streak_last_iso', latestISO);
                    save();
                    streakHint.remove();
                }
            });
        }

        notifLead.addEventListener('change', () => {
            const val = parseInt(notifLead.value, 10);
            if (!isNaN(val) && ALLOWED_LEADS.includes(val)) {
                state.notifLeadMinutes = val;
                save();
                // Update notification bell lead time if active
                if (typeof MatchNotifications !== 'undefined' && MatchNotifications.isActive) {
                    if (typeof Toast !== 'undefined') {
                        Toast.show(`Match reminders updated — ${val} min before kick-off.`, 'info', 3000);
                    }
                }
            } else {
                notifLead.value = state.notifLeadMinutes || defaults.notifLeadMinutes;
            }
        });

        favVenue.addEventListener('change', () => {
            state.favVenue = favVenue.value;
            save();
        });

        tzSelect.addEventListener('change', () => {
            state.timezonePref = tzSelect.value === 'ist' ? 'ist' : 'local';
            save();
        });
    }

    /** Called once on DOMContentLoaded to pre-load saved state */
    function init() {
        load();
    }

    function getNotificationLeadMinutes() {
        return state.notifLeadMinutes || defaults.notifLeadMinutes;
    }

    function getProfile() {
        return { ...state };
    }

    /** Public API */
    return { init, render, getNotificationLeadMinutes, getProfile };

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

    /**
     * Returns the actual match result ('W', 'L', or null) for a given ISO
     * by cross-referencing DATA.postMatchReports (keyed entries) and then
     * falling back to DATA.lastResult for the most recently-past fixture.
     */
    function getActualResult(iso) {
        // 1. Check postMatchReports array for a matching opponent+date entry
        if (Array.isArray(DATA.postMatchReports) && DATA.postMatchReports.length > 0) {
            const fixture = (DATA.fixtures || []).find(f => f.iso === iso);
            if (fixture) {
                const short = (window.TEAM_SHORT && window.TEAM_SHORT[fixture.o]) || '';
                const report = DATA.postMatchReports.find(r => {
                    const rOpp = (r.opponent || '').toUpperCase();
                    return rOpp === short || r.date === fixture.d;
                });
                if (report && report.result) return report.result; // 'W' or 'L'
            }
        }

        // 2. Fall back to DATA.lastResult for the most recently played fixture
        if (!DATA.lastResult || !DATA.lastResult.result) return null;
        const now = Date.now();
        // Find the most recently-past fixture ISO
        let latestISO = null;
        let latestMs  = 0;
        (DATA.fixtures || []).forEach(f => {
            if (!f.iso) return;
            const ms = new Date(f.iso).getTime();
            if (ms < now && ms > latestMs) { latestMs = ms; latestISO = f.iso; }
        });
        return latestISO === iso ? DATA.lastResult.result : null;
    }

    function render() {
        const container = document.getElementById('predictions-content');
        if (!container) return;

        const preds = load();
        const now   = Date.now();

        // Show all fixtures — upcoming for predicting, past for viewing prediction
        const allFixtures = DATA.fixtures.map((f, i) => ({ f, i }));

        if (allFixtures.length === 0) {
            container.innerHTML = '<p class="prediction-empty">No fixtures available.</p>';
            return;
        }

        // Tally scored predictions for the accuracy header
        let scored = 0, correct = 0;

        const rows = allFixtures.map(({ f, i }) => {
            const iso      = f.iso || '';
            const isPast   = iso && new Date(iso).getTime() <= now;
            const pred     = preds[iso] || null;
            const short    = (window.TEAM_SHORT && window.TEAM_SHORT[f.o]) || (f.o ? f.o.substring(0, 3).toUpperCase() : '???');

            const winActive  = pred === 'W' ? ' prediction-btn--win-active'  : '';
            const lossActive = pred === 'L' ? ' prediction-btn--loss-active' : '';
            const disabled   = isPast ? 'disabled' : '';

            // Result indicator for past matches
            let resultBadge = '';
            if (isPast) {
                const actual = getActualResult(iso);
                if (actual) {
                    scored++;
                    if (pred === actual) {
                        correct++;
                        resultBadge = `<span class="prediction-result prediction-result--correct" aria-label="Correct prediction">✓ Correct</span>`;
                    } else if (pred) {
                        resultBadge = `<span class="prediction-result prediction-result--wrong" aria-label="Wrong prediction">✗ Wrong</span>`;
                    } else {
                        resultBadge = `<span class="prediction-result prediction-result--missed" aria-label="No prediction made">Missed</span>`;
                    }
                } else if (pred) {
                    resultBadge = `<span class="prediction-result prediction-result--pending" aria-label="Result pending">Result TBD</span>`;
                }
            }

            return `
            <div class="prediction-item" data-iso="${iso}">
                <div class="prediction-match">
                    <p class="prediction-opponent">vs ${short}</p>
                    <p class="prediction-date">${f.d}</p>
                </div>
                <div class="prediction-controls">
                    <button class="prediction-btn prediction-btn--win${winActive}"
                            data-iso="${iso}" data-pick="W" ${disabled}
                            aria-label="Predict win vs ${short}" aria-pressed="${pred === 'W'}">WIN</button>
                    <button class="prediction-btn prediction-btn--loss${lossActive}"
                            data-iso="${iso}" data-pick="L" ${disabled}
                            aria-label="Predict loss vs ${short}" aria-pressed="${pred === 'L'}">LOSS</button>
                    ${resultBadge}
                </div>
            </div>`;
        }).join('');

        const accuracyHtml = scored > 0
            ? `<p class="prediction-accuracy" aria-label="Prediction accuracy">
                   Accuracy: <strong>${correct}/${scored}</strong>
                   (${Math.round((correct / scored) * 100)}%)
               </p>`
            : '';

        container.innerHTML = `
            <div class="prediction-card" aria-label="Match predictions">
                <p class="tag">Match Predictions</p>
                <p class="prediction-desc">Predict each match outcome before it starts. Locked once the match begins.</p>
                ${accuracyHtml}
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

/* ==========================================================================
   CricketQuiz — Cricket trivia quiz on the Fan page.
   Questions come from DATA.quiz. Shows one question at a time with 4 options,
   instant correct/wrong feedback, and a final score summary.
   ========================================================================== */

const CricketQuiz = (() => {

    const CAT_COLORS = { CSK: '#F5B800', IPL: '#a78bfa', Cricket: '#34d399' };

    let questions  = [];   // shuffled subset for this session
    let current    = 0;    // index of current question
    let score      = 0;    // correct answers so far
    let answered   = false; // has the user answered the current question?

    /** Fisher-Yates shuffle — returns a new shuffled array */
    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /** Start a fresh quiz session */
    function startSession() {
        questions = shuffle(DATA.quiz).slice(0, 10);  // 10 random questions
        current   = 0;
        score     = 0;
        answered  = false;
    }

    /** Render the full quiz widget into #quiz-content */
    function render() {
        const container = document.getElementById('quiz-content');
        if (!container) return;
        startSession();
        renderQuestion(container);
    }

    /** Render current question */
    function renderQuestion(container) {
        answered = false;
        if (current >= questions.length) {
            renderResult(container);
            return;
        }

        const q        = questions[current];
        const catColor = CAT_COLORS[q.cat] || '#F5B800';
        const progress = `${current + 1} / ${questions.length}`;

        const optButtons = q.opts.map((opt, i) => `
            <button class="quiz-option" data-idx="${i}" aria-label="${opt}">
                <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
                <span class="quiz-option-text">${opt}</span>
            </button>`).join('');

        container.innerHTML = `
            <div class="quiz-card" aria-label="Cricket trivia quiz">
                <div class="quiz-header">
                    <p class="tag" style="color:${catColor}">${q.cat}</p>
                    <p class="quiz-progress" aria-label="Question ${current + 1} of ${questions.length}">${progress}</p>
                </div>
                <div class="quiz-score-display" aria-live="polite" aria-atomic="true">
                    Score: ${score}
                </div>
                <div class="quiz-progress-bar" role="progressbar"
                     aria-valuenow="${current}" aria-valuemin="0" aria-valuemax="${questions.length}">
                    <div class="quiz-progress-fill" style="width:${(current / questions.length) * 100}%"></div>
                </div>
                <p class="quiz-question">${q.q}</p>
                <div class="quiz-options" role="group" aria-label="Answer options">
                    ${optButtons}
                </div>
                <div class="quiz-feedback" id="quiz-feedback" aria-live="assertive" aria-atomic="true"></div>
                <button class="quiz-next-btn" id="quiz-next" style="display:none" aria-label="Next question">
                    ${current + 1 < questions.length ? 'Next Question →' : 'See Results'}
                </button>
            </div>`;

        // Bind option buttons
        container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (answered) return;
                answered = true;
                const chosen  = parseInt(btn.dataset.idx, 10);
                const correct = q.ans;
                const isRight = chosen === correct;

                if (isRight) score++;

                // Style all options
                container.querySelectorAll('.quiz-option').forEach((b, i) => {
                    b.disabled = true;
                    if (i === correct) {
                        b.classList.add('quiz-option--correct');
                    } else if (i === chosen && !isRight) {
                        b.classList.add('quiz-option--wrong');
                    }
                });

                // Show feedback
                const feedbackEl = document.getElementById('quiz-feedback');
                if (feedbackEl) {
                    feedbackEl.textContent = isRight
                        ? '✓ Correct!'
                        : `✗ Wrong — the answer is "${q.opts[correct]}"`;
                    feedbackEl.className = 'quiz-feedback ' +
                        (isRight ? 'quiz-feedback--correct' : 'quiz-feedback--wrong');
                }

                // Update score display
                const scoreEl = container.querySelector('.quiz-score-display');
                if (scoreEl) scoreEl.textContent = `Score: ${score}`;

                // Show next button
                const nextBtn = document.getElementById('quiz-next');
                if (nextBtn) nextBtn.style.display = '';
            });
        });

        // Bind next button
        const nextBtn = document.getElementById('quiz-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                current++;
                renderQuestion(container);
            });
        }
    }

    /** Render end-of-quiz results */
    function renderResult(container) {
        const pct     = Math.round((score / questions.length) * 100);
        let medal = '🏅';
        let label = 'Good effort!';
        if (pct >= 90) { medal = '🏆'; label = 'Cricket genius!'; }
        else if (pct >= 70) { medal = '🥇'; label = 'Great job!'; }
        else if (pct >= 50) { medal = '🥈'; label = 'Not bad!'; }

        container.innerHTML = `
            <div class="quiz-card quiz-card--result" aria-label="Quiz results">
                <p class="tag">Quiz Complete</p>
                <div class="quiz-result-medal" aria-hidden="true">${medal}</div>
                <p class="quiz-result-label">${label}</p>
                <p class="quiz-result-score" aria-label="You scored ${score} out of ${questions.length}">
                    ${score} <span class="quiz-result-denom">/ ${questions.length}</span>
                </p>
                <p class="quiz-result-pct">${pct}% correct</p>
                <button class="quiz-play-again-btn" aria-label="Play again">Play Again 🔄</button>
            </div>`;

        container.querySelector('.quiz-play-again-btn').addEventListener('click', () => {
            startSession();
            renderQuestion(container);
        });
    }

    return { render };

})();

/* ==========================================================================
   TossTracker — Per-match toss result recorder on the Fan page.
   Users record whether CSK won the toss and what they chose (bat/field).
   All data is persisted in localStorage.
   ========================================================================== */

const TossTracker = (() => {

    const STORAGE_KEY = 'tys_toss_2026';

    /** Load toss data: { [iso]: { won: bool|null, chose: 'bat'|'field'|null } } */
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (_) {
            return {};
        }
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    /** Compute summary stats from toss data */
    function stats(data) {
        let won = 0, lost = 0, batFirst = 0, fieldFirst = 0;
        for (const entry of Object.values(data)) {
            if (entry.won === true)  won++;
            if (entry.won === false) lost++;
            if (entry.chose === 'bat')   batFirst++;
            if (entry.chose === 'field') fieldFirst++;
        }
        return { won, lost, batFirst, fieldFirst };
    }

    function render() {
        const container = document.getElementById('toss-content');
        if (!container) return;
        renderWidget(container);
    }

    function renderWidget(container) {
        const data    = load();
        const summary = stats(data);
        const now     = Date.now();

        const rows = DATA.fixtures.map(f => {
            const iso    = f.iso || '';
            const entry  = data[iso] || { won: null, chose: null };
            const isPast = iso && new Date(iso).getTime() <= now;
            const short  = (window.TEAM_SHORT && window.TEAM_SHORT[f.o]) || f.o.substring(0, 3).toUpperCase();

            const wonClass  = entry.won === true  ? ' toss-btn--active-won'  : '';
            const lostClass = entry.won === false ? ' toss-btn--active-lost' : '';
            const batClass  = entry.chose === 'bat'   ? ' toss-elect--active' : '';
            const fieldClass= entry.chose === 'field' ? ' toss-elect--active' : '';

            const dis = '';   // allow editing anytime

            return `
            <div class="toss-match-row" data-iso="${iso}" aria-label="Toss vs ${short} on ${f.d}">
                <div class="toss-match-info">
                    <p class="toss-opponent">vs ${short}</p>
                    <p class="toss-date">${f.d}</p>
                </div>
                <div class="toss-controls">
                    <div class="toss-won-group">
                        <span class="toss-group-label">Toss</span>
                        <button class="toss-btn toss-btn--won${wonClass}"
                                data-iso="${iso}" data-key="won" data-val="true" ${dis}
                                aria-pressed="${entry.won === true}" aria-label="Toss won">Won</button>
                        <button class="toss-btn toss-btn--lost${lostClass}"
                                data-iso="${iso}" data-key="won" data-val="false" ${dis}
                                aria-pressed="${entry.won === false}" aria-label="Toss lost">Lost</button>
                    </div>
                    <div class="toss-elect-group" ${entry.won !== true ? 'style="opacity:0.35;pointer-events:none"' : ''}>
                        <span class="toss-group-label">Chose</span>
                        <button class="toss-elect-btn${batClass}"
                                data-iso="${iso}" data-key="chose" data-val="bat" ${dis}
                                aria-pressed="${entry.chose === 'bat'}" aria-label="Elected to bat">Bat</button>
                        <button class="toss-elect-btn${fieldClass}"
                                data-iso="${iso}" data-key="chose" data-val="field" ${dis}
                                aria-pressed="${entry.chose === 'field'}" aria-label="Elected to field">Field</button>
                    </div>
                </div>
            </div>`;
        }).join('');

        const total      = summary.won + summary.lost;
        const winPct     = total > 0 ? Math.round((summary.won / total) * 100) : 0;
        const statsHtml  = total > 0 ? `
            <div class="toss-stats" aria-label="Toss statistics">
                <div class="toss-stat-item">
                    <p class="toss-stat-value">${summary.won}/${total}</p>
                    <p class="toss-stat-label">Toss Wins</p>
                </div>
                <div class="toss-stat-item">
                    <p class="toss-stat-value">${winPct}%</p>
                    <p class="toss-stat-label">Win Rate</p>
                </div>
                <div class="toss-stat-item">
                    <p class="toss-stat-value">${summary.batFirst}</p>
                    <p class="toss-stat-label">Chose Bat</p>
                </div>
                <div class="toss-stat-item">
                    <p class="toss-stat-value">${summary.fieldFirst}</p>
                    <p class="toss-stat-label">Chose Field</p>
                </div>
            </div>` : '';

        container.innerHTML = `
            <div class="toss-card" aria-label="Toss tracker">
                <p class="tag">Toss Tracker</p>
                <p class="toss-desc">Record CSK's toss results and field/bat decisions.</p>
                ${statsHtml}
                <div class="toss-list">${rows}</div>
            </div>`;

        // Bind buttons
        container.querySelectorAll('[data-key]').forEach(btn => {
            btn.addEventListener('click', () => {
                const iso = btn.dataset.iso;
                const key = btn.dataset.key;
                let   val = btn.dataset.val;

                // Parse boolean strings
                if (val === 'true')  val = true;
                if (val === 'false') val = false;

                const data    = load();
                const entry   = data[iso] || { won: null, chose: null };

                // Toggle off if already selected
                if (entry[key] === val) {
                    entry[key] = null;
                    // Clear chose if toss result cleared
                    if (key === 'won') entry.chose = null;
                } else {
                    entry[key] = val;
                    // Clear chose if toss was changed to lost
                    if (key === 'won' && val === false) entry.chose = null;
                }

                data[iso] = entry;
                save(data);
                renderWidget(container);
            });
        });
    }

    return { render };

})();

/* ==========================================================================
   MatchJournal — Per-match notes diary on the Fan page.
   Users can write a short note for each CSK fixture.
   All notes are persisted in localStorage.
   ========================================================================== */

const MatchJournal = (() => {

    const STORAGE_KEY = 'tys_journal_2026';
    const MAX_CHARS   = 280;

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (_) {
            return {};
        }
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function render() {
        const container = document.getElementById('journal-content');
        if (!container) return;
        renderWidget(container);
    }

    function renderWidget(container) {
        const notes = load();
        const now   = Date.now();

        const rows = DATA.fixtures.map(f => {
            const iso   = f.iso || '';
            const note  = notes[iso] || '';
            const isPast = iso && new Date(f.iso).getTime() <= now;
            const short = (window.TEAM_SHORT && window.TEAM_SHORT[f.o]) || f.o.substring(0, 3).toUpperCase();
            const chars = note.length;

            // For upcoming matches show placeholder, past matches allow a short recap
            const placeholder = isPast
                ? `How was the match vs ${short}? Add your recap…`
                : `What are you expecting vs ${short}?`;

            return `
            <div class="journal-match-row" data-iso="${iso}" aria-label="Journal entry for match vs ${short}">
                <div class="journal-match-header">
                    <span class="journal-opponent">vs ${short}</span>
                    <span class="journal-date">${f.d}</span>
                    ${isPast ? '<span class="journal-badge">Past</span>' : '<span class="journal-badge journal-badge--upcoming">Upcoming</span>'}
                </div>
                <textarea class="journal-textarea"
                          data-iso="${iso}"
                          maxlength="${MAX_CHARS}"
                          placeholder="${placeholder}"
                          aria-label="Match notes for ${f.o} on ${f.d}"
                          rows="3">${note}</textarea>
                <p class="journal-char-count" id="jcc-${iso.replace(/[^a-z0-9]/gi, '')}">${chars}/${MAX_CHARS}</p>
            </div>`;
        }).join('');

        const totalNotes = Object.values(notes).filter(n => n.trim()).length;

        container.innerHTML = `
            <div class="journal-card" aria-label="Match journal">
                <p class="tag">Match Journal</p>
                <p class="journal-desc">Your personal match diary — notes auto-save as you type.</p>
                ${totalNotes > 0 ? `<p class="journal-count">${totalNotes} entr${totalNotes !== 1 ? 'ies' : 'y'} written</p>` : ''}
                <div class="journal-list">${rows}</div>
            </div>`;

        // Bind textarea events — auto-save with a short debounce to avoid saving on every keystroke
        const _debounceTimers = {};
        container.querySelectorAll('.journal-textarea').forEach(ta => {
            ta.addEventListener('input', () => {
                const iso   = ta.dataset.iso;

                // Update char count immediately
                const ccId = 'jcc-' + iso.replace(/[^a-z0-9]/gi, '');
                const ccEl = document.getElementById(ccId);
                if (ccEl) {
                    const len = ta.value.length;
                    ccEl.textContent = `${len}/${MAX_CHARS}`;
                    ccEl.classList.toggle('journal-char-count--warn', len > MAX_CHARS * 0.85);
                    ccEl.classList.toggle('journal-char-count--limit', len >= MAX_CHARS);
                }

                // Debounce the localStorage write by 600 ms
                clearTimeout(_debounceTimers[iso]);
                _debounceTimers[iso] = setTimeout(() => {
                    const notes = load();
                    notes[iso]  = ta.value;
                    save(notes);
                }, 600);
            });
        });
    }

    return { render };

})();


// =============================================================================
//   FantasyTips — Per-fixture fantasy cricket pick guide on the Fan page.
//   Reads from DATA.fantasyTips keyed by ISO timestamp.
// =============================================================================

const FantasyTips = (() => {

    function render() {
        const container = document.getElementById('fantasy-tips-content');
        if (!container) return;

        const tips = DATA.fantasyTips || {};
        const keys = Object.keys(tips).sort();

        if (keys.length === 0) {
            container.innerHTML = `
            <div class="fantasy-card" aria-label="Fantasy Tips">
                <p class="tag">Fantasy Tips</p>
                <p class="fantasy-empty">No tips available yet. Check back closer to match day.</p>
            </div>`;
            return;
        }

        const now = Date.now();

        const cards = keys.map(iso => {
            const t   = tips[iso];
            const dt  = new Date(iso);
            const isPast = dt.getTime() < now;

            const dateStr = dt.toLocaleDateString('en-IN', {
                month: 'short', day: 'numeric', weekday: 'short',
                timeZone: 'Asia/Kolkata'
            });
            const timeStr = dt.toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit',
                timeZone: 'Asia/Kolkata', hour12: true
            });

            const mustHtml = t.mustPick && t.mustPick.length
                ? t.mustPick.map(p => `<span class="fantasy-chip fantasy-chip--must">${p}</span>`).join('')
                : '';
            const diffHtml = t.differentials && t.differentials.length
                ? t.differentials.map(p => `<span class="fantasy-chip fantasy-chip--diff">${p}</span>`).join('')
                : '';
            const avoidHtml = t.avoidList && t.avoidList.length
                ? t.avoidList.map(p => `<span class="fantasy-chip fantasy-chip--avoid">${p}</span>`).join('')
                : '';

            return `
            <div class="fantasy-tip-card${isPast ? ' fantasy-tip-card--past' : ''}"
                 aria-label="Fantasy tips for CSK vs ${t.opponent || '?'} on ${dateStr}">
                <div class="fantasy-tip-header">
                    <span class="fantasy-tip-opp">CSK vs ${t.opponent || '?'}</span>
                    <span class="fantasy-tip-date">${dateStr} · ${timeStr} IST</span>
                    ${isPast ? '<span class="fantasy-tip-badge fantasy-tip-badge--past">Past</span>' : '<span class="fantasy-tip-badge">Upcoming</span>'}
                </div>

                ${t.captainPick ? `
                <div class="fantasy-pick-row">
                    <span class="fantasy-pick-label">Captain</span>
                    <span class="fantasy-chip fantasy-chip--captain">${t.captainPick}</span>
                    ${t.vcPick ? `<span class="fantasy-pick-label">VC</span><span class="fantasy-chip fantasy-chip--vc">${t.vcPick}</span>` : ''}
                </div>` : ''}

                ${mustHtml ? `
                <p class="fantasy-section-label">Must-Pick</p>
                <div class="fantasy-chip-row">${mustHtml}</div>` : ''}

                ${diffHtml ? `
                <p class="fantasy-section-label">Differentials</p>
                <div class="fantasy-chip-row">${diffHtml}</div>` : ''}

                ${avoidHtml ? `
                <p class="fantasy-section-label">Avoid</p>
                <div class="fantasy-chip-row">${avoidHtml}</div>` : ''}

                ${t.summary ? `<p class="fantasy-summary">${t.summary}</p>` : ''}
            </div>`;
        }).join('');

        container.innerHTML = `
        <div class="fantasy-card" aria-label="Fantasy Tips">
            <p class="tag">Fantasy Tips</p>
            <p class="fantasy-desc">Match-by-match fantasy cricket pick guide for CSK fixtures.</p>
            ${cards}
        </div>`;
    }

    return { render };

})();
