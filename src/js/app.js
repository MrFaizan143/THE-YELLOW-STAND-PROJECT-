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
            const hubPollId = setInterval(() => {
                // Skip polling when the tab is hidden to save battery and API quota
                if (!document.hidden) updateLiveScore();
            }, 60_000);

            // Clean up the interval if the page is ever fully hidden for a long time
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) updateLiveScore();
            }, { passive: true });
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

    // Restore saved preference; fall back to OS preference, then dark
    const savedTheme = localStorage.getItem(THEME_KEY)
        || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
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
        navigator.serviceWorker.register('/sw.js').then(reg => {
            // Listen for a new SW waiting to activate
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateBanner();
                    }
                });
            });
        }).catch(err => {
            console.warn('Service worker registration failed:', err);
        });
    }

    // -------------------------------------------------------------------------
    // SW update banner
    // -------------------------------------------------------------------------
    function showUpdateBanner() {
        const banner   = document.getElementById('sw-update-banner');
        const reloadBtn  = document.getElementById('sw-update-reload');
        const dismissBtn = document.getElementById('sw-update-dismiss');
        if (!banner) return;
        banner.hidden = false;
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                navigator.serviceWorker.getRegistration().then(reg => {
                    if (reg && reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                });
                window.location.reload();
            }, { once: true });
        }
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => { banner.hidden = true; }, { once: true });
        }
    }
});

// =============================================================================
// Toast notification helper — callable from any module
// =============================================================================
const Toast = (() => {
    /**
     * Show a brief toast notification.
     * @param {string} message  - Text to display.
     * @param {'info'|'warn'|'error'} [type='info']
     * @param {number} [duration=4000]  - Auto-dismiss delay in ms.
     */
    function show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'status');

        container.appendChild(toast);
        // Trigger enter animation
        requestAnimationFrame(() => { toast.classList.add('toast--visible'); });

        setTimeout(() => {
            toast.classList.remove('toast--visible');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, duration);
    }

    return { show };
})();

