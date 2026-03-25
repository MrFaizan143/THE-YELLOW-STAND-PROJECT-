/**
 * api.js — TYS 2026 Cricket Live Data Service
 *
 * TWO free data sources are supported (both have free tiers):
 *
 *  1. cricapi.com  ← RECOMMENDED FREE SOURCE
 *     • 100 free API calls/day — no credit card required.
 *     • Sign up at https://cricapi.com/ and paste your key into CRICAPI_KEY below.
 *     • Used for: upcoming fixtures, live/current match scores.
 *
 *  2. RapidAPI cricket-live-data  ← ALTERNATIVE
 *     • 500 free calls/month via https://rapidapi.com/cricketapilive/api/cricket-live-data
 *     • Paste your key into RAPIDAPI_KEY below.
 *
 * When neither key is set every function returns an empty array and the app
 * silently falls back to the static DATA defined in team.js.
 */

const CricketAPI = (() => {

    // -------------------------------------------------------------------------
    // Configuration — paste your free keys here
    // -------------------------------------------------------------------------

    /**
     * cricapi.com free key.
     * Get one (free, no card) at: https://cricapi.com/
     * 100 API calls / day on the free plan.
     */
    const CRICAPI_KEY = 'bbf69190-0d70-4665-9b33-523ce96f057e';

    /** RapidAPI cricket-live-data key (optional, 500 req/month free) */
    const RAPIDAPI_KEY = '1c452f2595msh591b430a54e97c6p1d901bjsnfbb28c9ec143';

    // -------------------------------------------------------------------------
    // Constants shared by both providers
    // -------------------------------------------------------------------------

    const DEFAULT_BROADCAST = 'Star Sports / JioCinema';
    const IST_OFFSET_MS = 5.5 * 3_600_000;  // UTC+5:30 in milliseconds
    const IST_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    // -------------------------------------------------------------------------
    // RapidAPI (cricket-live-data) setup
    // -------------------------------------------------------------------------

    const BASE_URL = 'https://cricket-live-data.p.rapidapi.com';

    const HEADERS = {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'cricket-live-data.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
    };

    // -------------------------------------------------------------------------
    // cricapi.com setup
    // -------------------------------------------------------------------------

    const CRICAPI_BASE = 'https://api.cricapi.com/v1';

    /** Returns true when the RapidAPI key has been configured */
    function isConfigured() {
        return RAPIDAPI_KEY.length > 0;
    }

    /** Returns true when the cricapi.com key has been configured */
    function isCricapiConfigured() {
        return CRICAPI_KEY.length > 0;
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
    // CSK-specific helpers (shared by both providers)
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

    // -------------------------------------------------------------------------
    // cricapi.com helpers (free tier — recommended)
    // -------------------------------------------------------------------------

    /** Generic GET for cricapi.com endpoints */
    async function cricapiRequest(path) {
        const sep = path.includes('?') ? '&' : '?';
        const res = await fetch(`${CRICAPI_BASE}${path}${sep}apikey=${encodeURIComponent(CRICAPI_KEY)}`);
        if (!res.ok) throw new Error(`cricapi ${res.status}: ${path}`);
        const json = await res.json();
        if (json.status !== 'success' && json.status !== 'ok') {
            throw new Error(`cricapi error: ${json.reason || json.status}`);
        }
        return json;
    }

    /**
     * Normalise a cricapi.com match object into the TYS fixture shape:
     *   { id, d, t, o, v, b, iso }
     *
     * cricapi.com fields: id, name, teams[], venue, date, dateTimeGMT, status
     */
    function normaliseCricapiFixture(raw) {
        const isoStr = raw.dateTimeGMT || raw.date || '';
        const dt     = isoStr ? new Date(isoStr) : null;

        // Derive opponent — pick the team that is not CSK
        const teams    = Array.isArray(raw.teams) ? raw.teams : [];
        const opponent = teams.find(t => !/Chennai Super Kings|CSK/i.test(t))
                      || raw.name || '—';

        // Format display date/time in IST (UTC+5:30)
        let displayDate = '';
        let displayTime = '';
        if (dt) {
            const ist   = new Date(dt.getTime() + IST_OFFSET_MS);
            displayDate = `${ist.getUTCDate().toString().padStart(2, '0')} ${IST_MONTHS[ist.getUTCMonth()]}`;
            const h24   = ist.getUTCHours();
            const mins  = ist.getUTCMinutes().toString().padStart(2, '0');
            const h12   = h24 % 12 || 12;
            const ampm  = h24 < 12 ? 'AM' : 'PM';
            displayTime = `${h12}:${mins} ${ampm}`;
        }

        // Live score string (only present during / after a match)
        const score = Array.isArray(raw.score) && raw.score.length > 0
            ? raw.score.map(s => `${s.inning}: ${s.r}/${s.w} (${s.o} ov)`).join(' | ')
            : null;

        return {
            id:     raw.id,
            d:      displayDate || raw.date || '—',
            t:      displayTime || '—',
            o:      opponent,
            v:      raw.venue  || '—',
            b:      DEFAULT_BROADCAST,
            iso:    isoStr,
            status: raw.status || null,
            score:  score
        };
    }

    /**
     * Fetch upcoming + current CSK fixtures from cricapi.com, normalised to TYS format.
     * Fetches two pages (offset 0 and 25) to cover a full IPL season.
     * Returns an empty array if the key is not configured or any call fails.
     */
    async function fetchCSKFixturesViaCricapi() {
        if (!isCricapiConfigured()) return [];
        try {
            // Two pages of 25 to capture the full IPL season
            const [page1, page2] = await Promise.all([
                cricapiRequest('/matches?offset=0'),
                cricapiRequest('/matches?offset=25')
            ]);

            const all = [
                ...extractList(page1),
                ...extractList(page2)
            ];

            return all
                .filter(m => isCSKMatch(m) && /ipl|indian premier/i.test(
                    (m.seriesName || m.name || '')
                ))
                .map(normaliseCricapiFixture);
        } catch (err) {
            console.warn('[CricketAPI] fetchCSKFixturesViaCricapi failed:', err.message);
            return [];
        }
    }

    /**
     * Fetch the live/current CSK match from cricapi.com.
     * Returns null if no CSK match is in progress or the key is not configured.
     */
    async function fetchCSKLiveMatch() {
        if (!isCricapiConfigured()) return null;
        try {
            const data = await cricapiRequest('/currentMatches');
            const live = extractList(data).find(m =>
                isCSKMatch(m) && /ipl|indian premier/i.test(m.seriesName || m.name || '')
            );
            return live ? normaliseCricapiFixture(live) : null;
        } catch (err) {
            console.warn('[CricketAPI] fetchCSKLiveMatch failed:', err.message);
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // CSK fixture fetch — tries cricapi.com first, then RapidAPI
    // -------------------------------------------------------------------------

    /**
     * Fetch upcoming CSK fixtures from the best available source.
     * Priority: cricapi.com (free 100/day) → RapidAPI (free 500/month).
     * Returns an empty array if neither key is configured or both calls fail.
     */
    async function fetchCSKFixtures() {
        // 1. cricapi.com
        if (isCricapiConfigured()) {
            const fixtures = await fetchCSKFixturesViaCricapi();
            if (fixtures.length > 0) return fixtures;
        }

        // 2. RapidAPI cricket-live-data
        if (!isConfigured()) return [];
        try {
            const data = await getFixtures();
            return extractList(data).filter(isCSKMatch).map(normaliseFixture);
        } catch (err) {
            console.warn('[CricketAPI] fetchCSKFixtures (RapidAPI) failed:', err.message);
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
        isCricapiConfigured,
        getSeries,
        getFixtures,
        getFixturesBySeries,
        getFixturesByDate,
        getResults,
        getResultsByDate,
        getMatch,
        normaliseFixture,
        normaliseCricapiFixture,
        fetchCSKFixtures,
        fetchCSKFixturesViaCricapi,
        fetchCSKLiveMatch,
        fetchCSKResults,
        fetchCSKFixturesBySeries
    };

})();
