/**
 * config.example.js — API key template for The Yellow Stand
 *
 * SETUP INSTRUCTIONS
 * ------------------
 * 1. Copy this file to src/js/config.js  (config.js is gitignored and will not be committed)
 * 2. Replace the placeholder strings with your real keys:
 *
 *    • CRICAPI_KEY   — free key from https://cricapi.com/ (100 calls/day, no card)
 *    • RAPIDAPI_KEY  — free key from https://rapidapi.com/cricketapilive/api/cricket-live-data
 *                      (500 calls/month on the free plan)
 *
 * 3. Leave either key as an empty string ('') to disable that provider.
 *    The app falls back to static data when both keys are absent.
 */

window.TYS_CONFIG = {
    CRICAPI_KEY:  '',   // e.g. 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    RAPIDAPI_KEY: ''    // e.g. 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
};
