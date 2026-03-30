/**
 * app.js — TYS 2026 Application Entry Point
 * Bootstraps all modules once the DOM is ready.
 * This is the only file that calls init() on anything.
 */

document.addEventListener('DOMContentLoaded', () => {
    Router.init();       // Bind nav button click handlers
    Countdown.start();   // Start the Hub countdown timer (auto-detects next fixture)
    FanProfile.init();   // Pre-load saved fan profile from localStorage

    // -------------------------------------------------------------------------
    // Navbar — auto-hide on scroll-down, reveal on scroll-up
    // -------------------------------------------------------------------------
    (function initNavScrollBehaviour() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        let lastScrollY = window.scrollY;
        let ticking     = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentY = Math.max(0, window.scrollY);
                    // Hide when scrolling down more than 60px from the top
                    if (currentY > lastScrollY && currentY > 60) {
                        nav.classList.add('nav--hidden');
                    } else {
                        nav.classList.remove('nav--hidden');
                    }
                    lastScrollY = currentY;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    })();

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

        if (liveScoreEl) {
            // Adaptive polling: 90 s while a CSK match is live; backs off to 5 min after
            // 3 consecutive empty results — conserves the 100 calls/day cricapi budget.
            // The shared live-match cache in api.js ensures the Live page and Hub never
            // make duplicate /currentMatches requests within the same 60-second window.
            let hubMissCount = 0;
            let hubPollTimer = null;
            let lastUpdatedAt = null;
            const MS_PER_MINUTE = 60_000;
            const ACTIVE_POLL_MS = 90_000;
            const BACKOFF_POLL_MS = 300_000;
            const ERROR_RETRY_MS = 180_000;
            const UPDATE_REFRESH_MS = 30_000;
            const MSG_NO_LIVE_MATCH = 'No live CSK match right now.';
            let lastUpdatedTimer = null;

            function scheduleHubPoll(delayMs) {
                clearTimeout(hubPollTimer);
                hubPollTimer = setTimeout(() => {
                    if (!document.hidden) updateLiveScore();
                }, delayMs);
            }

            function setLastUpdated(ts) {
                lastUpdatedAt = ts;
                const upd = liveScoreEl.querySelector('.hub-live-updated');
                if (upd && ts) {
                    const delta = Math.max(0, Date.now() - ts);
                    const mins = Math.floor(delta / MS_PER_MINUTE);
                    upd.textContent = mins < 1 ? 'Updated just now' : `Updated ${mins}m ago`;
                }
                if (!lastUpdatedTimer) {
                    lastUpdatedTimer = setInterval(() => {
                        if (lastUpdatedAt) setLastUpdated(lastUpdatedAt);
                    }, UPDATE_REFRESH_MS);
                }
            }

            function updateLiveScore() {
                CricketAPI.fetchCSKLiveMatch().then(match => {
                    if (!liveScoreEl) return;
                    const navLiveDot = document.getElementById('nav-live-dot');
                    if (match && match.score) {
                        liveScoreEl.innerHTML = `
                            <span class="tag live-tag"><span class="live-dot" aria-hidden="true"></span>LIVE</span>
                            <p class="hub-live-score-teams">CSK vs ${match.o}</p>
                            <p class="hub-live-score-text">${match.score}</p>
                            <p class="hub-live-score-status">${match.status || ''}</p>
                            <div class="hub-live-meta">
                                <span class="hub-live-updated">Updated just now</span>
                            </div>`;
                        liveScoreEl.style.display = '';
                        if (navLiveDot) navLiveDot.classList.add('n-live-dot--active');

                        if (typeof Schedule !== 'undefined') {
                            Schedule.updateLiveInSchedule(match);
                        }

                        setLastUpdated(match.fetchedAt || Date.now());
                        hubMissCount = 0;
                        scheduleHubPoll(ACTIVE_POLL_MS);   // Active match: poll every 90 s
                    } else {
                        liveScoreEl.innerHTML = `<p class="hub-live-score-empty">${MSG_NO_LIVE_MATCH}</p>`;
                        liveScoreEl.style.display = '';
                        if (navLiveDot) navLiveDot.classList.remove('n-live-dot--active');
                        if (lastUpdatedTimer) {
                            clearInterval(lastUpdatedTimer);
                            lastUpdatedTimer = null;
                        }
                        lastUpdatedAt = null;
                        hubMissCount++;
                        // After 3 consecutive misses, back off to 5-minute checks
                        scheduleHubPoll(hubMissCount >= 3 ? BACKOFF_POLL_MS : ACTIVE_POLL_MS);
                    }
                }).catch(() => {
                    if (typeof Toast !== 'undefined') {
                        Toast.show('Live score refresh failed. Retrying…', 'warn', 3500);
                    }
                    scheduleHubPoll(ERROR_RETRY_MS);  // On error: retry in 3 min
                });
            }

            updateLiveScore();

            // Resume immediately when the tab becomes visible again
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    clearTimeout(hubPollTimer);
                    updateLiveScore();
                }
            }, { passive: true });
        }
    }

    // -------------------------------------------------------------------------
    // Highlights Carousel — populated from fixture data
    // Shows recent results + upcoming matches as 16:9 media cards.
    // -------------------------------------------------------------------------
    (function initHighlightsCarousel() {
        const carousel = document.getElementById('hub-highlights');
        const prevBtn  = document.getElementById('highlights-prev');
        const nextBtn  = document.getElementById('highlights-next');
        if (!carousel) return;

        const fixtures     = (typeof DATA !== 'undefined' && Array.isArray(DATA.fixtures))
            ? DATA.fixtures : [];
        const now          = Date.now();

        if (fixtures.length === 0) {
            carousel.innerHTML = '<span class="highlights-empty">No matches found</span>';
            return;
        }

        // Build array: last 3 played + next 5 upcoming, capped at 8 total
        const played   = [];
        const upcoming = [];
        fixtures.forEach((f, i) => {
            const matchMs = f.iso ? new Date(f.iso).getTime() : NaN;
            if (!isNaN(matchMs) && matchMs < now) {
                played.push({ f, i });
            } else {
                upcoming.push({ f, i });
            }
        });

        const cards = [
            ...played.slice(-3).reverse(),
            ...upcoming.slice(0, 5)
        ].slice(0, 8);

        if (cards.length === 0) {
            carousel.innerHTML = '<span class="highlights-empty">Season data loading…</span>';
            return;
        }

        const html = cards.map(({ f, i }) => {
            const matchMs = f.iso ? new Date(f.iso).getTime() : NaN;
            const isPast  = !isNaN(matchMs) && matchMs < now;

            const resultLabel = isPast ? 'PLAYED' : 'UPCOMING';
            const resultClass = isPast ? 'nr'      : 'upcoming';

            const dateStr   = f.d || '';
            const opponent  = (f.o || 'TBD').replace('vs ', '').trim();
            const venue     = f.v ? f.v.split(',')[0].trim() : '';

            return `
            <div class="highlight-card" role="listitem" tabindex="0"
                 aria-label="CSK vs ${opponent}, ${dateStr}">
                <div class="highlight-card__thumb">
                    <div class="highlight-card__thumb-bg">
                        <span class="highlight-card__vs">
                            <strong>CSK</strong>&nbsp;vs&nbsp;<strong>${opponent}</strong>
                        </span>
                    </div>
                    <div class="highlight-card__scrim"></div>
                    <div class="highlight-card__play" aria-hidden="true"></div>
                    <span class="highlight-card__result highlight-card__result--${resultClass}">${resultLabel}</span>
                </div>
                <div class="highlight-card__info">
                    <p class="highlight-card__match">CSK · ${opponent}</p>
                    <p class="highlight-card__meta">${dateStr}${venue ? ' · ' + venue : ''}</p>
                </div>
            </div>`;
        }).join('');

        carousel.innerHTML = html;

        // Scroll arrow controls
        const SCROLL_AMT = 290;
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: -SCROLL_AMT, behavior: 'smooth' });
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: SCROLL_AMT, behavior: 'smooth' });
            });
        }
    })();

    // -------------------------------------------------------------------------
    // Share button — Web Share API with clipboard copy fallback
    // -------------------------------------------------------------------------
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const now = Date.now();
            const nextIdx = (typeof DATA !== 'undefined' && Array.isArray(DATA.fixtures))
                ? DATA.fixtures.findIndex(f => f.iso && new Date(f.iso).getTime() > now)
                : -1;
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
                    Toast.show('Shared! Whistle Podu! 🦁', 'info', 2500);
                } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                    shareBtn.innerHTML = `${Icons.i('check', 14)} Copied!`;
                    setTimeout(() => {
                        shareBtn.innerHTML = `<span class="share-icon">${Icons.i('share-2', 14)}</span> Share`;
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
        if (toggleBtn) toggleBtn.innerHTML = theme === 'light' ? Icons.i('moon', 16) : Icons.i('sun', 16);
        Icons.init(toggleBtn);
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

    // Initialise match reminder notifications (notification bell in top-right)
    MatchNotifications.init();
});

// =============================================================================
// Global error handler — surface unhandled errors as dev-mode toasts so that
// silent failures are visible during local development.
// Gated to localhost/127.0.0.1 only — never exposes internals in production.
// =============================================================================
const IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

window.addEventListener('error', (event) => {
    if (IS_DEV && typeof Toast !== 'undefined') {
        Toast.show(`JS Error: ${event.message}`, 'error', 6000);
    }
    // Let the error propagate normally for devtools
});

window.addEventListener('unhandledrejection', (event) => {
    if (IS_DEV && typeof Toast !== 'undefined') {
        const msg = event.reason instanceof Error
            ? event.reason.message
            : String(event.reason);
        Toast.show(`Unhandled promise rejection: ${msg}`, 'error', 6000);
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

// =============================================================================
// MatchNotifications — browser push notification reminders for CSK fixtures.
//
// The notification bell button (#notif-bell) in the top-right corner allows
// users to opt in.  When enabled, the app checks every 60 seconds whether any
// upcoming CSK fixture is within the notification lead-time window (set in the
// Fan page "Match Reminder" preference), and fires a browser Notification if so.
//
// Sent notifications are tracked in sessionStorage so they are never duplicated
// within the same browser session.  The permission state is persisted across
// sessions in localStorage.
// =============================================================================
const MatchNotifications = (() => {

    /** localStorage key: '1' when user has opted in, '0' when opted out */
    const PREF_KEY = 'tys_notif_enabled';

    /** sessionStorage key: JSON array of ISO strings already notified this session */
    const SENT_KEY = 'tys_notif_sent_v1';

    /** How long after kick-off to still send a late notification (30 min in ms) */
    const POST_MATCH_WINDOW_MS = 30 * 60_000;

    /** setInterval handle for the 60-second polling loop */
    let _interval = null;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    function isSupported() {
        return ('Notification' in window);
    }

    function isGranted() {
        return isSupported() && Notification.permission === 'granted';
    }

    /** Returns true when the user has opted in AND permission is granted */
    function isActive() {
        return isGranted() && localStorage.getItem(PREF_KEY) === '1';
    }

    function getSentSet() {
        try { return new Set(JSON.parse(sessionStorage.getItem(SENT_KEY) || '[]')); }
        catch (_) { return new Set(); }
    }

    function markSent(iso) {
        const s = getSentSet();
        s.add(iso);
        sessionStorage.setItem(SENT_KEY, JSON.stringify([...s]));
    }

    // -------------------------------------------------------------------------
    // Bell button UI
    // -------------------------------------------------------------------------

    function updateBellUI() {
        const bell = document.getElementById('notif-bell');
        if (!bell) return;
        const active = isActive();
        bell.classList.toggle('notif-bell--active', active);
        bell.setAttribute('aria-label', active ? 'Match reminders on — click to disable' : 'Enable match reminders');
        bell.setAttribute('aria-pressed', String(active));
        if (typeof Icons !== 'undefined') {
            bell.innerHTML = active ? Icons.i('bell', 16) : Icons.i('bell-off', 16);
            Icons.init(bell);
        }
    }

    // -------------------------------------------------------------------------
    // Notification dispatch
    // -------------------------------------------------------------------------

    function sendNotification(f) {
        const short = (window.TEAM_SHORT && window.TEAM_SHORT[f.o]) || f.o;
        try {
            const n = new Notification('🦁 CSK Match Reminder', {
                body:  `CSK vs ${short} starts soon at ${f.t} IST — Whistle Podu! 🏏`,
                icon:  '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                tag:   `csk-${f.iso}`,
            });
            setTimeout(() => n.close(), 12000);
        } catch (_) { /* Notification blocked or private browsing — fail silently */ }
    }

    function checkAndNotify() {
        if (!isActive()) return;

        const leadMs = (typeof FanProfile !== 'undefined' && FanProfile.getNotificationLeadMinutes)
            ? FanProfile.getNotificationLeadMinutes() * 60_000
            : 15 * 60_000;

        const now    = Date.now();
        const sent   = getSentSet();
        const fixt   = (typeof DATA !== 'undefined' && Array.isArray(DATA.fixtures))
            ? DATA.fixtures : [];

        fixt.forEach(f => {
            if (!f.iso) return;
            const matchMs = new Date(f.iso).getTime();
            // Fire once when we enter the lead-time window; stop 30 min after kick-off
            if (now >= matchMs - leadMs && now <= matchMs + POST_MATCH_WINDOW_MS && !sent.has(f.iso)) {
                sendNotification(f);
                markSent(f.iso);
            }
        });
    }

    // -------------------------------------------------------------------------
    // Start / stop polling
    // -------------------------------------------------------------------------

    function startPolling() {
        checkAndNotify();
        if (_interval) clearInterval(_interval);
        _interval = setInterval(() => {
            if (!document.hidden) checkAndNotify();
        }, 60_000);

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) checkAndNotify();
        }, { passive: true });
    }

    function stopPolling() {
        if (_interval) { clearInterval(_interval); _interval = null; }
    }

    // -------------------------------------------------------------------------
    // Toggle (called when the bell button is clicked)
    // -------------------------------------------------------------------------

    async function toggle() {
        if (!isSupported()) {
            Toast.show('Notifications are not supported in this browser.', 'warn', 4000);
            return;
        }

        if (isActive()) {
            // User is turning reminders OFF
            localStorage.setItem(PREF_KEY, '0');
            stopPolling();
            updateBellUI();
            Toast.show('Match reminders disabled.', 'info', 3000);
            return;
        }

        // User wants to turn reminders ON
        if (Notification.permission === 'denied') {
            Toast.show('Notifications are blocked — please allow them in your browser settings.', 'warn', 5000);
            return;
        }

        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
            Toast.show('Notification permission not granted.', 'warn', 3000);
            return;
        }

        localStorage.setItem(PREF_KEY, '1');
        startPolling();
        updateBellUI();

        const leadMin = (typeof FanProfile !== 'undefined' && FanProfile.getNotificationLeadMinutes)
            ? FanProfile.getNotificationLeadMinutes() : 15;
        Toast.show(`Match reminders on — you'll be notified ${leadMin} min before each CSK game.`, 'info', 4000);
    }

    // -------------------------------------------------------------------------
    // Init — called once on DOMContentLoaded
    // -------------------------------------------------------------------------

    function init() {
        const bell = document.getElementById('notif-bell');
        if (bell) {
            updateBellUI();
            bell.addEventListener('click', () => toggle());
        }
        // Resume polling if permission was already granted in a previous session
        if (isActive()) startPolling();
    }

    return { init, toggle, updateBellUI, isActive };
})();
