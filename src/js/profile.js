/**
 * profile.js — TYS 2026 Fan Profile Module
 * Handles fan profile: favourite player, squad role, win streak,
 * and jersey customisation (name + number).
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

        nameInput.addEventListener('input', () => {
            state.fanName = nameInput.value;
            document.querySelector('.jersey-name').textContent =
                (state.fanName || DEFAULT_NAME_PLACEHOLDER).toUpperCase();
            save();
        });

        numInput.addEventListener('input', () => {
            state.jerseyNumber = numInput.value;
            document.querySelector('.jersey-number').textContent =
                state.jerseyNumber || defaults.jerseyNumber;
            save();
        });

        playerSel.addEventListener('change', () => {
            state.favPlayer = playerSel.value;
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
