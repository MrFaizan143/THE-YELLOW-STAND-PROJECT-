/**
 * app.js — TYS 2026 Application Entry Point
 * Bootstraps all modules once the DOM is ready.
 * This is the only file that calls init() on anything.
 */

document.addEventListener('DOMContentLoaded', () => {
    Router.init();       // Bind nav button click handlers
    Countdown.start();   // Start the Hub countdown timer (fallback)
    LiveScore.start();   // Override with live match data when a key is set

    // Update the next-match label in the Hub from data
    const matchLabel = document.querySelector('.countdown-card .tag');
    if (matchLabel) matchLabel.textContent = DATA.nextMatch.label;
});
