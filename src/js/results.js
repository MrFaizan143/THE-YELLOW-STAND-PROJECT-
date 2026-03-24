/**
 * results.js — TYS 2026 Match Result Tracker
 * Persists W / L / N (no result) per fixture index in localStorage.
 * Exposes helpers used by render.js and the Hub record widget.
 */

const Results = (() => {

    const STORAGE_KEY = 'tys_results_2026'; // year suffix keeps results isolated per season

    /** Load the results array from localStorage. Returns an array the same
     *  length as DATA.fixtures, each entry being 'W', 'L', 'N', or null. */
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (_) { /* fall through */ }
        return new Array(DATA.fixtures.length).fill(null);
    }

    /** Persist the results array */
    function save(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }

    /** Cycle a fixture result: null → 'W' → 'L' → 'N' → null */
    function cycle(index) {
        const arr = load();
        const current = arr[index];
        if (current === null)  arr[index] = 'W';
        else if (current === 'W') arr[index] = 'L';
        else if (current === 'L') arr[index] = 'N';
        else                      arr[index] = null;
        save(arr);
        return arr[index];
    }

    /** Returns { W, L, N } totals across all fixtures */
    function tally() {
        const arr = load();
        return arr.reduce(
            (acc, r) => {
                if (r === 'W') acc.W++;
                else if (r === 'L') acc.L++;
                else if (r === 'N') acc.N++;
                return acc;
            },
            { W: 0, L: 0, N: 0 }
        );
    }

    /**
     * Find the index of the next upcoming fixture based on ISO dates.
     * Returns -1 if all fixtures are in the past.
     */
    function nextFixtureIndex() {
        const now = Date.now();
        for (let i = 0; i < DATA.fixtures.length; i++) {
            const f = DATA.fixtures[i];
            if (f.iso && new Date(f.iso).getTime() > now) return i;
        }
        return -1;
    }

    /** Public API */
    return { load, cycle, tally, nextFixtureIndex };

})();
