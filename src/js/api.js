/**
 * api.js — TYS 2026 Cricket Live Data Service
 * Wraps the cricket-live-data RapidAPI endpoints.
 *
 * Configuration:
 *   Set RAPIDAPI_KEY to your key from https://rapidapi.com/cricketapilive/api/cricket-live-data
 *   Leave it empty to use static fallback data only.
 */

const CricketAPI = (() => {

    /** Replace with your RapidAPI key */
    const RAPIDAPI_KEY = '';

    const BASE_URL = 'https://cricket-live-data.p.rapidapi.com';

    const HEADERS = {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'cricket-live-data.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
    };

    const DEFAULT_BROADCAST = 'Star Sports / JioCinema';
    const IST_OFFSET_MS = 5.5 * 3_600_000;  // UTC+5:30 in milliseconds
    const IST_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    /** Returns true when an API key has been configured */
    function isConfigured() {
        return RAPIDAPI_KEY.length > 0;
    }

    /** Generic GET helper — returns parsed JSON or throws */
    async function request(path) {
        const res = await fetch(`${BASE_URL}${path}`, { method: 'GET', headers: HEADERS });
        if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
        return res.json();
    }

    // -------------------------------------------------------------------------
    // Raw endpoint wrappers
    // -------------------------------------------------------------------------

    /** GET /series — all active series */
    function getSeries() {
        return request('/series');
    }

    /** GET /fixtures — all upcoming fixtures */
    function getFixtures() {
        return request('/fixtures');
    }

    /** GET /fixtures-by-series/{series_id} */
    function getFixturesBySeries(seriesId) {
        return request(`/fixtures-by-series/${encodeURIComponent(seriesId)}`);
    }

    /** GET /fixtures-by-date/{date} — date format: YYYY-MM-DD */
    function getFixturesByDate(date) {
        return request(`/fixtures-by-date/${encodeURIComponent(date)}`);
    }

    /** GET /results — all recent results */
    function getResults() {
        return request('/results');
    }

    /** GET /results-by-date/{date} — date format: YYYY-MM-DD */
    function getResultsByDate(date) {
        return request(`/results-by-date/${encodeURIComponent(date)}`);
    }

    /** GET /match/{match_id} — full match details */
    function getMatch(matchId) {
        return request(`/match/${encodeURIComponent(matchId)}`);
    }

    // -------------------------------------------------------------------------
    // Data normalisation
    // -------------------------------------------------------------------------

    /**
     * Normalise a raw fixture/result from the API into the TYS fixture shape:
     *   { id, d, t, o, v, b, iso }
     *
     * The cricket-live-data API typically returns objects with:
     *   id, name, competition: { name }, venue: { name },
     *   date_start, date_start_iso, …
     */
    function normaliseFixture(raw) {
        const isoStr = raw.date_start_iso || raw.date_start || '';
        const dt     = isoStr ? new Date(isoStr) : null;

        // Derive opponent — strip "Chennai Super Kings" / "CSK" from the match name
        const name     = raw.name || '';
        const opponent = name
            .replace(/Chennai Super Kings/gi, '')
            .replace(/\bCSK\b/gi, '')
            .replace(/^\s*v\.?\s*/i, '')
            .replace(/\s*v\.?\s*$/i, '')
            .trim() || name;

        // Format display date/time in IST (UTC+5:30)
        let displayDate = '';
        let displayTime = '';
        if (dt) {
            const ist    = new Date(dt.getTime() + IST_OFFSET_MS);
            displayDate  = `${ist.getUTCDate().toString().padStart(2, '0')} ${IST_MONTHS[ist.getUTCMonth()]}`;
            const h24    = ist.getUTCHours();
            const mins   = ist.getUTCMinutes().toString().padStart(2, '0');
            const h12    = h24 % 12 || 12;
            const ampm   = h24 < 12 ? 'AM' : 'PM';
            displayTime  = `${h12}:${mins} ${ampm}`;
        }

        return {
            id:  raw.id,
            d:   displayDate || raw.date_start || '—',
            t:   displayTime || '—',
            o:   opponent,
            v:   (raw.venue && raw.venue.name) ? raw.venue.name : '—',
            b:   DEFAULT_BROADCAST,
            iso: isoStr
        };
    }

    // -------------------------------------------------------------------------
    // CSK-specific helpers
    // -------------------------------------------------------------------------

    /**
     * Extract an array of matches from a raw API response.
     * The API may return a plain array or wrap it in .result / .data.
     */
    function extractList(data) {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.result)) return data.result;
        if (data && Array.isArray(data.data))   return data.data;
        return [];
    }

    /** Returns true if a match involves CSK */
    function isCSKMatch(match) {
        return /Chennai Super Kings|CSK/i.test(match.name || '');
    }

    /**
     * Fetch upcoming CSK fixtures from the API, normalised to TYS format.
     * Returns an empty array if the API key is not configured or the call fails.
     */
    async function fetchCSKFixtures() {
        if (!isConfigured()) return [];
        try {
            const data = await getFixtures();
            return extractList(data).filter(isCSKMatch).map(normaliseFixture);
        } catch (err) {
            console.warn('[CricketAPI] fetchCSKFixtures failed:', err.message);
            return [];
        }
    }

    /**
     * Fetch recent CSK results from the API, normalised to TYS format.
     * Returns an empty array if the API key is not configured or the call fails.
     */
    async function fetchCSKResults() {
        if (!isConfigured()) return [];
        try {
            const data = await getResults();
            return extractList(data).filter(isCSKMatch).map(normaliseFixture);
        } catch (err) {
            console.warn('[CricketAPI] fetchCSKResults failed:', err.message);
            return [];
        }
    }

    /**
     * Fetch CSK fixtures for a specific series ID, normalised to TYS format.
     * Returns an empty array if the API key is not configured or the call fails.
     */
    async function fetchCSKFixturesBySeries(seriesId) {
        if (!isConfigured()) return [];
        try {
            const data = await getFixturesBySeries(seriesId);
            return extractList(data).filter(isCSKMatch).map(normaliseFixture);
        } catch (err) {
            console.warn('[CricketAPI] fetchCSKFixturesBySeries failed:', err.message);
            return [];
        }
    }

    /** Public API */
    return {
        isConfigured,
        getSeries,
        getFixtures,
        getFixturesBySeries,
        getFixturesByDate,
        getResults,
        getResultsByDate,
        getMatch,
        normaliseFixture,
        fetchCSKFixtures,
        fetchCSKResults,
        fetchCSKFixturesBySeries
    };

})();
