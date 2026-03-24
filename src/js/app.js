/**
 * app.js — TYS 2026 Application Entry Point
 * Bootstraps all modules once the DOM is ready.
 * This is the only file that calls init() on anything.
 */

document.addEventListener('DOMContentLoaded', () => {
    Router.init();       // Bind nav button click handlers
    Countdown.start();   // Start the Hub countdown timer
    FanProfile.init();   // Pre-load saved fan profile from localStorage
    Render.updateHubRecord(); // Show season record on Hub

    // Update the next-match label in the Hub from data
    const matchLabel = document.querySelector('.countdown-card .tag');
    if (matchLabel) matchLabel.textContent = DATA.nextMatch.label;

    // Render Hub info cards (last result + next venue)
    Render.lastResult();
    Render.venueInfo();

    // -------------------------------------------------------------------------
    // Share button — Web Share API with clipboard copy fallback
    // -------------------------------------------------------------------------
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'The Yellow Stand',
                text:  `Next CSK match: ${DATA.nextMatch.label}. Whistle Podu! 🦁`,
                url:   window.location.href
            };
            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                    shareBtn.textContent = '✓ Copied!';
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

