/**
 * app.js — TYS 2026 Application Entry Point
 * Bootstraps all modules once the DOM is ready.
 * This is the only file that calls init() on anything.
 */

document.addEventListener('DOMContentLoaded', () => {
    Router.init();       // Bind nav button click handlers
    Countdown.start();   // Start the Hub countdown timer (auto-detects next fixture)
    FanProfile.init();   // Pre-load saved fan profile from localStorage
    Render.updateHubRecord(); // Show season record on Hub

    // Initialize Schedule module (notification bell, follow-team selector, etc.)
    if (typeof Schedule !== 'undefined') {
        Schedule.init();
    }

    // Render Hub info cards (last result + next venue — both auto-detected)
    Render.lastResult();
    Render.venueInfo();

    // -------------------------------------------------------------------------
    // Live score polling — shown on Hub when a CSK match is in progress
    // Only active when a cricapi.com key is configured (free, 100 calls/day).
    // Polls every 60 seconds; clears automatically once the match ends.
    // -------------------------------------------------------------------------
    if (CricketAPI.isCricapiConfigured()) {
        const liveScoreEl = document.getElementById('hub-live-score');

        function updateLiveScore() {
            CricketAPI.fetchCSKLiveMatch().then(match => {
                if (!liveScoreEl) return;
                if (match && match.score) {
                    liveScoreEl.innerHTML = `
                        <span class="tag live-tag">🔴 LIVE</span>
                        <p class="hub-live-score-teams">CSK vs ${match.o}</p>
                        <p class="hub-live-score-text">${match.score}</p>
                        <p class="hub-live-score-status">${match.status || ''}</p>`;
                    liveScoreEl.style.display = '';

                    // Also update the matching fixture row in the schedule page
                    if (typeof Schedule !== 'undefined') {
                        Schedule.updateLiveInSchedule(match);
                    }
                } else {
                    liveScoreEl.style.display = 'none';
                }
            }).catch(() => {});
        }

        if (liveScoreEl) {
            updateLiveScore();
            setInterval(updateLiveScore, 60_000); // refresh every 60 s
        }
    }

    // -------------------------------------------------------------------------
    // Share button — Web Share API with clipboard copy fallback
    // -------------------------------------------------------------------------
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const nextIdx = Results.nextFixtureIndex();
            const matchText = nextIdx >= 0
                ? `Next CSK match: ${DATA.fixtures[nextIdx].d} vs ${DATA.fixtures[nextIdx].o}. Whistle Podu! 🦁`
                : 'Follow CSK this IPL 2026 season! Whistle Podu! 🦁';
            const shareData = {
                title: 'The Yellow Stand',
                text:  matchText,
                url:   window.location.href
            };
            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                    shareBtn.innerHTML = '<span class="share-icon">✓</span> Copied!';
                    setTimeout(() => {
                        shareBtn.innerHTML = '<span class="share-icon">↑</span> Share';
                    }, 2000);
                }
            } catch (_) { /* user cancelled share or browser denied */ }
        });
    }

    // -------------------------------------------------------------------------
    // Dark / Light theme toggle
    // -------------------------------------------------------------------------
    const THEME_KEY    = 'tys_theme';
    const toggleBtn    = document.getElementById('theme-toggle');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (toggleBtn) toggleBtn.textContent = theme === 'light' ? '☾' : '☀';
        if (toggleBtn) toggleBtn.setAttribute('aria-label',
            theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }

    // Restore saved preference (default: dark)
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(savedTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next    = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
            localStorage.setItem(THEME_KEY, next);
        });
    }

    // Register service worker for PWA install + offline support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.warn('Service worker registration failed:', err);
        });
    }
});

