/**
 * countdown.js — TYS 2026 Countdown Timer
 * Drives the live countdown display on the Hub page.
 */

const Countdown = (() => {

    let intervalId = null;

    const pad = n => String(n).padStart(2, '0');

    function tick() {
        const el = document.getElementById('timer');
        if (!el) return;

        const gap = new Date(DATA.nextMatch.date).getTime() - Date.now();

        if (gap <= 0) {
            el.textContent = 'LIVE NOW';
            stop();
            return;
        }

        const days  = Math.floor(gap / 86_400_000);
        const hours = Math.floor((gap % 86_400_000) / 3_600_000);
        const mins  = Math.floor((gap % 3_600_000) / 60_000);
        const secs  = Math.floor((gap % 60_000) / 1_000);

        el.textContent = `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
    }

    function start() {
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
    return { start, stop };

})();
