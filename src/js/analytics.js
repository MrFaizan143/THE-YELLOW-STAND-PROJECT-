/**
 * analytics.js — TYS 2026 Analytics & Crash Reporting
 *
 * Wraps PostHog for event tracking and captures unhandled JS errors.
 *
 * SETUP: Replace 'YOUR_POSTHOG_API_KEY' below with the Project API Key
 * found at https://us.posthog.com/project/settings
 * The api_host below points to PostHog Cloud (US region).
 * Change to 'https://eu.i.posthog.com' for the EU region or your self-hosted URL.
 */

const Analytics = (() => {

    const PAGE_NAMES = { h: 'Hub', m: 'Map', p: 'Pride' };

    /** Safely call posthog so any init failure never breaks the app */
    function ph(method, ...args) {
        try {
            if (window.posthog && typeof window.posthog[method] === 'function') {
                window.posthog[method](...args);
            }
        } catch (_) { /* swallow */ }
    }

    /**
     * Track a named event with optional properties.
     * @param {string} event
     * @param {object} [props]
     */
    function track(event, props) {
        ph('capture', event, props || {});
    }

    /**
     * Track a page-navigation event.
     * Called by Router on every navigate().
     * @param {string} pageId - one of 'h', 'm', 'p'
     */
    function page(pageId) {
        track('page_view', { page: PAGE_NAMES[pageId] || pageId });
    }

    /** Wire up global JS error → PostHog crash event */
    function _initCrashReporting() {
        window.addEventListener('error', function (e) {
            track('js_error', {
                message: e.message,
                source:  e.filename,
                line:    e.lineno,
                col:     e.colno,
                stack:   e.error ? e.error.stack : null
            });
        });

        window.addEventListener('unhandledrejection', function (e) {
            const reason = e.reason;
            track('unhandled_promise_rejection', {
                message: reason instanceof Error ? reason.message : String(reason),
                stack:   reason instanceof Error ? reason.stack   : null
            });
        });
    }

    /** Bootstrap — called once PostHog is loaded */
    function init() {
        _initCrashReporting();
        track('app_started');
        // Track the initial page load (Hub is shown by default)
        page('h');
    }

    /** Public API */
    return { init, track, page };

})();
