/**
 * app.js — TYS 2026 Application Entry Point
 * Bootstraps all modules once the DOM is ready.
 * This is the only file that calls init() on anything.
 */

document.addEventListener('DOMContentLoaded', () => {
    Countdown.start();   // Start the Hub countdown timer

    // Update the next-match label in the Hub from data
    const matchLabel = document.querySelector('.countdown-card .tag');
    if (matchLabel) matchLabel.textContent = DATA.nextMatch.label;
});
