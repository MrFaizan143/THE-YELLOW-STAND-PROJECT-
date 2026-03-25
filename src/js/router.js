/**
 * router.js — TYS 2026 Client-Side Router
 * Manages page visibility and active nav state.
 * Delegates rendering to Render module on first visit.
 */

const Router = (() => {

    const visited = new Set();

    /**
     * Navigates to a page by its ID.
     * @param {string} pageId - The ID of the page section to show.
     */
    function navigate(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
            page.removeAttribute('aria-current');
        });

        // Show target page
        const target = document.getElementById(pageId);
        if (target) {
            target.classList.add('active');
        }

        // Update nav button states
        document.querySelectorAll('.n-i').forEach(btn => {
            const isActive = btn.dataset.page === pageId;
            btn.classList.toggle('active', isActive);
            if (isActive) {
                btn.setAttribute('aria-current', 'page');
            } else {
                btn.removeAttribute('aria-current');
            }
        });

        // Lazy-render page content on first visit
        if (!visited.has(pageId)) {
            visited.add(pageId);
            if (pageId === 'm') {
                if (CricketAPI.isConfigured() || CricketAPI.isCricapiConfigured()) {
                    Render.fixturesLoading();
                    // Fetch CSK-only fixtures and full IPL schedule in parallel
                    Promise.all([
                        CricketAPI.fetchCSKFixtures().catch(() => []),
                        CricketAPI.fetchAllIPLFixtures().catch(() => [])
                    ]).then(([cskLive, iplLive]) => {
                        Render.fixtures(cskLive);
                        Render.iplSchedule(iplLive);
                    });
                } else {
                    Render.fixtures();
                    Render.iplSchedule();
                }
                Render.standings();
            }
            if (pageId === 'p') Render.squad();
            if (pageId === 'n') News.fetchAndRender();
            if (pageId === 'f') { FanProfile.render(); FanPoll.render(); FanPredictions.render(); }
            if (pageId === 't') Tools.render();
        }

        window.scrollTo(0, 0);
    }

    /** Binds click events to all nav buttons */
    function init() {
        document.querySelectorAll('.n-i').forEach(btn => {
            btn.addEventListener('click', () => navigate(btn.dataset.page));
        });
    }

    /** Public API */
    return { init, navigate };

})();
