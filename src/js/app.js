/**
 * app.js — TYS 2026 Application Entry Point
 * Bootstraps all modules once the DOM is ready.
 * This is the only file that calls init() on anything.
 */

document.addEventListener('DOMContentLoaded', () => {
    Router.init();       // Bind nav button click handlers
    Countdown.start();   // Start the Hub countdown timer

    // Update the next-match label in the Hub from data
    const matchLabel = document.querySelector('.countdown-card .tag');
    if (matchLabel) matchLabel.textContent = DATA.nextMatch.label;

    // Register service worker for PWA install + offline support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.warn('Service worker registration failed:', err);
        });
    }
});
