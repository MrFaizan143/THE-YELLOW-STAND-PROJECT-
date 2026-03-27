/**
 * countdown.js — TYS 2026 Countdown Timer
 * Drives the live countdown display on the Hub page.
 * Automatically targets the next upcoming fixture from DATA.fixtures.
 */

const Countdown = (() => {

    let intervalId = null;

    /** Previous digit values — used to detect changes and trigger pop animation */
    let prevVals = {};

    const pad = n => String(n).padStart(2, '0');

    /**
     * Returns the ISO timestamp of the next upcoming fixture.
     * Falls back to DATA.nextMatch.date when no future fixtures remain.
     * @returns {string|null} ISO date string or null when season is complete.
     */
    function getNextISO() {
        const now = Date.now();
        const idx = (typeof DATA !== 'undefined' && Array.isArray(DATA.fixtures))
            ? DATA.fixtures.findIndex(f => f.iso && new Date(f.iso).getTime() > now)
            : -1;
        if (idx >= 0) {
            return DATA.fixtures[idx].iso;
        }
        return null; // All fixtures in the past — season complete
    }

    /**
     * Updates the countdown label on the Hub card to reflect the next fixture.
     */
    function updateLabel() {
        const label = document.querySelector('.countdown-card .tag');
        if (!label) return;
        const now = Date.now();
        const idx = (typeof DATA !== 'undefined' && Array.isArray(DATA.fixtures))
            ? DATA.fixtures.findIndex(f => f.iso && new Date(f.iso).getTime() > now)
            : -1;
        if (idx >= 0) {
            const f = DATA.fixtures[idx];
            const short = (window.TEAM_SHORT && window.TEAM_SHORT[f.o]) || f.o;
            label.textContent = `${f.d} vs ${short}`;
        } else {
            label.textContent = 'IPL 2026 Season';
        }
    }

    /** Build inner HTML for a single digit block; adds pop class when value changed */
    function block(value, unit, pop) {
        return `<div class="cd-block"><span class="cd-digit${pop ? ' cd-digit--pop' : ''}">${value}</span><span class="cd-unit">${unit}</span></div>`;
    }

    function tick() {
        const el = document.getElementById('timer');
        if (!el) return;

        const iso = getNextISO();
        if (!iso) {
            el.innerHTML = '<span class="cd-message">Season Complete</span>';
            el.setAttribute('aria-label', 'IPL 2026 season complete');
            stop();
            return;
        }

        const gap = new Date(iso).getTime() - Date.now();

        if (gap <= 0) {
            el.innerHTML = '<span class="cd-message cd-message--live">🔴 MATCH DAY</span>';
            el.setAttribute('aria-label', 'Match is live now');
            return;
        }

        const days  = Math.floor(gap / 86_400_000);
        const hours = Math.floor((gap % 86_400_000) / 3_600_000);
        const mins  = Math.floor((gap % 3_600_000) / 60_000);
        const secs  = Math.floor((gap % 60_000) / 1_000);

        const popD = prevVals.days  !== days;
        const popH = prevVals.hours !== hours;
        const popM = prevVals.mins  !== mins;
        const popS = prevVals.secs  !== secs;
        prevVals = { days, hours, mins, secs };

        // Urgency modifiers: <1h = urgent (red pulse), <24h = soon (yellow)
        const urgencyClass = gap < 3_600_000   ? 'cd-blocks--urgent'
                           : gap < 86_400_000  ? 'cd-blocks--soon'
                           : '';

        const label = `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
        el.innerHTML = `
            <div class="cd-blocks${urgencyClass ? ' ' + urgencyClass : ''}">
                ${block(String(days), 'D', popD)}
                <span class="cd-sep">:</span>
                ${block(pad(hours), 'H', popH)}
                <span class="cd-sep">:</span>
                ${block(pad(mins), 'M', popM)}
                <span class="cd-sep">:</span>
                ${block(pad(secs), 'S', popS)}
            </div>`;
        el.setAttribute('aria-label', `Time until next match: ${label}`);
    }

    function start() {
        updateLabel();
        tick();
        intervalId = setInterval(tick, 1000);
    }

    function stop() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    /** Public API */
    return { start, stop, updateLabel };

})();
