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
    // Configuration — keys are loaded from src/js/config.js (gitignored).
    // Copy src/js/config.example.js → src/js/config.js and fill in your keys.
    // -------------------------------------------------------------------------

    /**
     * cricapi.com free key (100 calls/day).
     * Set via window.TYS_CONFIG.CRICAPI_KEY in src/js/config.js.
     */
    const CRICAPI_KEY = (window.TYS_CONFIG && window.TYS_CONFIG.CRICAPI_KEY) || '';

    /**
     * RapidAPI cricket-live-data key (500 req/month free).
     * Set via window.TYS_CONFIG.RAPIDAPI_KEY in src/js/config.js.
     */
    const RAPIDAPI_KEY = (window.TYS_CONFIG && window.TYS_CONFIG.RAPIDAPI_KEY) || '';

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

    // -------------------------------------------------------------------------
    // Fetch utilities & API budget trackers
    // -------------------------------------------------------------------------

    /** Wraps fetch() with a 10-second AbortController timeout */
    async function fetchWithTimeout(url, options = {}, ms = 10_000) {
        const ctrl  = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), ms);
        try {
            const res = await fetch(url, { ...options, signal: ctrl.signal });
            clearTimeout(timer);
            return res;
        } catch (err) {
            clearTimeout(timer);
            throw err;
        }
    }

    /**
     * Tracks cricapi.com daily call count in localStorage.
     * Warns at 80 % (80/100) and 95 % (95/100) of the free-tier daily limit.
     */
    const _budgetCricapi = (() => {
        const KEY_N = 'tys_ca_n', KEY_D = 'tys_ca_d';
        const today = new Date().toISOString().slice(0, 10);
        let n = 0;
        if (localStorage.getItem(KEY_D) === today) {
            n = parseInt(localStorage.getItem(KEY_N) || '0', 10);
        } else {
            try { localStorage.setItem(KEY_D, today); localStorage.setItem(KEY_N, '0'); } catch (_) {}
        }
        function track() {
            n++;
            try { localStorage.setItem(KEY_N, String(n)); } catch (_) {}
            if (n === 80) console.warn('[TYS] cricapi budget: 80 / 100 calls used today.');
            if (n >= 95)  console.warn(`[TYS] cricapi budget: ${n} / 100 — approaching daily limit!`);
        }
        return { track, count: () => n };
    })();

    /**
     * Tracks RapidAPI monthly call count in localStorage.
     * Warns at 80 % (400/500) and 95 % (475/500) of the free-tier monthly limit.
     */
    const _budgetRapid = (() => {
        const KEY_N = 'tys_ra_n', KEY_M = 'tys_ra_m';
        const thisMonth = new Date().toISOString().slice(0, 7);
        let n = 0;
        if (localStorage.getItem(KEY_M) === thisMonth) {
            n = parseInt(localStorage.getItem(KEY_N) || '0', 10);
        } else {
            try { localStorage.setItem(KEY_M, thisMonth); localStorage.setItem(KEY_N, '0'); } catch (_) {}
        }
        function track() {
            n++;
            try { localStorage.setItem(KEY_N, String(n)); } catch (_) {}
            if (n === 400) console.warn('[TYS] RapidAPI budget: 400 / 500 calls used this month.');
            if (n >= 475)  console.warn(`[TYS] RapidAPI budget: ${n} / 500 — approaching monthly limit!`);
        }
        return { track, count: () => n };
    })();

    // -------------------------------------------------------------------------
    // In-memory live match cache — shared by Hub polling and Live page (60-second TTL)
    // In-flight deduplication ensures concurrent callers share a single request.
    //
    // Cross-tab sharing: a BroadcastChannel notifies sibling tabs whenever this
    // tab fetches fresh data, and a localStorage entry (tys_live_xt_v1) lets
    // newly-opened tabs immediately reuse data fetched by another tab.  This
    // prevents every open tab from independently hitting CricAPI and burning
    // through the 100 free calls/day budget.
    // -------------------------------------------------------------------------

    const LIVE_CACHE_TTL    = 60_000;
    const LIVE_XT_CACHE_KEY = 'tys_live_xt_v1';   // cross-tab localStorage key
    const LIVE_XT_TTL       = 80_000;              // 80 s — slightly less than poll interval

    const _liveCache = { data: null, fetchedAt: 0, pending: null };

    // BroadcastChannel — allows a tab that just fetched data to push it to all
    // other open tabs so they don't need to make their own API call.
    const _liveBC = (() => {
        try {
            return typeof BroadcastChannel !== 'undefined'
                ? new BroadcastChannel('tys-live-matches')
                : null;
        } catch (_) { return null; }
    })();

    if (_liveBC) {
        _liveBC.onmessage = evt => {
            try {
                const { data, ts } = evt.data || {};
                if (Array.isArray(data) && typeof ts === 'number') {
                    // Another tab just fetched — update our in-memory cache so we
                    // skip the next network request.
                    _liveCache.data      = data;
                    _liveCache.fetchedAt = ts;
                }
            } catch (_) {}
        };
    }

    /** Persist live-match data to localStorage so newly-opened tabs can read it. */
    function _saveLiveCrossTab(list) {
        const ts = Date.now();
        try {
            localStorage.setItem(LIVE_XT_CACHE_KEY, JSON.stringify({ data: list, ts }));
        } catch (_) {}
        if (_liveBC) {
            try { _liveBC.postMessage({ data: list, ts }); } catch (_) {}
        }
    }

    /** Read cross-tab localStorage cache; returns data array or null if stale/absent. */
    function _readLiveCrossTab() {
        try {
            const raw = localStorage.getItem(LIVE_XT_CACHE_KEY);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            if (Array.isArray(data) && typeof ts === 'number' && (Date.now() - ts) < LIVE_XT_TTL) {
                return { data, ts };
            }
        } catch (_) {}
        return null;
    }

    // -------------------------------------------------------------------------
    // localStorage fixtures cache — avoids repeat 3-page IPL schedule fetches (6-hour TTL)
    // -------------------------------------------------------------------------

    const FIXTURES_CACHE_KEY = 'tys_ipl_fixtures_v2';
    const FIXTURES_CACHE_TTL = 6 * 3_600_000;   // 6 hours

    function getFixturesFromCache() {
        try {
            const raw = localStorage.getItem(FIXTURES_CACHE_KEY);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            if (Date.now() - ts < FIXTURES_CACHE_TTL) return data;
        } catch (_) {}
        return null;
    }

    function saveFixturesToCache(data) {
        try {
            localStorage.setItem(FIXTURES_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
        } catch (_) {}
    }

    /** In-flight deduplication handle for IPL fixture fetches */
    let _fixturesInFlight = null;

    /** Generic GET helper — returns parsed JSON or throws */
    async function request(path) {
        _budgetRapid.track();
        const res = await fetchWithTimeout(`${BASE_URL}${path}`, { method: 'GET', headers: HEADERS });
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
    // Full team name → short code map (shared by normalisation helpers)
    // -------------------------------------------------------------------------

    const FULL_TEAM_SHORT = {
        'Chennai Super Kings':           'CSK',
        'Mumbai Indians':                'MI',
        'Royal Challengers Bengaluru':   'RCB',
        'Royal Challengers Bangalore':   'RCB',
        'Kolkata Knight Riders':         'KKR',
        'Delhi Capitals':                'DC',
        'Rajasthan Royals':              'RR',
        'Punjab Kings':                  'PBKS',
        'Sunrisers Hyderabad':           'SRH',
        'Gujarat Titans':                'GT',
        'Lucknow Super Giants':          'LSG'
    };

    /** Convert a full team name to its IPL short code, or derive initials */
    function toShortName(fullName) {
        if (!fullName) return '—';
        if (FULL_TEAM_SHORT[fullName]) return FULL_TEAM_SHORT[fullName];
        // Fallback: first letter of each capitalised word
        return fullName.split(' ').filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').toUpperCase() || fullName;
    }

    // -------------------------------------------------------------------------
    // cricapi.com helpers (free tier — recommended)
    // -------------------------------------------------------------------------

    /** Generic GET for cricapi.com endpoints — with 10-second timeout and daily budget tracking */
    async function cricapiRequest(path) {
        _budgetCricapi.track();
        const sep = path.includes('?') ? '&' : '?';
        const url = `${CRICAPI_BASE}${path}${sep}apikey=${encodeURIComponent(CRICAPI_KEY)}`;
        const res = await fetchWithTimeout(url);
        if (!res.ok) throw new Error(`cricapi ${res.status}: ${path}`);
        const json = await res.json();
        if (json.status !== 'success' && json.status !== 'ok') {
            throw new Error(`cricapi error: ${json.reason || json.status}`);
        }
        return json;
    }

    /**
     * Shared live-match fetch with 60-second in-memory cache and in-flight deduplication.
     * Both Hub polling (app.js) and the Live page (live.js) call through here so they
     * never make more than one cricapi /currentMatches request per 60-second window.
     *
     * Cross-tab deduplication: before hitting the network, this function checks a
     * shared localStorage entry (written by whichever tab last fetched) so that
     * multiple open tabs from the same user converge to one upstream API call
     * per ~80-second window regardless of how many tabs are open.
     */
    async function _fetchCurrentMatchesCached() {
        const now = Date.now();

        // 1. In-memory cache (fastest — same tab, same JS context)
        if (_liveCache.data !== null && (now - _liveCache.fetchedAt) < LIVE_CACHE_TTL) {
            return _liveCache.data;
        }

        // 2. Cross-tab localStorage cache (another tab may have fetched recently)
        const xt = _readLiveCrossTab();
        if (xt) {
            _liveCache.data      = xt.data;
            _liveCache.fetchedAt = xt.ts;
            return xt.data;
        }

        // 3. In-flight deduplication (prevents parallel calls within this tab)
        if (_liveCache.pending) return _liveCache.pending;

        _liveCache.pending = cricapiRequest('/currentMatches').then(data => {
            const list = extractList(data);
            _liveCache.data      = list;
            _liveCache.fetchedAt = Date.now();
            _liveCache.pending   = null;
            // Share with other tabs so they don't need their own API call
            _saveLiveCrossTab(list);
            return list;
        }).catch(err => {
            _liveCache.pending = null;
            throw err;
        });
        return _liveCache.pending;
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
     * Normalise a cricapi.com match object into the full IPL fixture shape:
     *   { id, d, t, team1, team2, team1Short, team2Short, v, b, iso, status, score, isCSK }
     *
     * cricapi.com fields: id, name, teams[], venue, date, dateTimeGMT, status, score
     */
    function normaliseCricapiMatchFull(raw) {
        const isoStr = raw.dateTimeGMT || raw.date || '';
        const dt     = isoStr ? new Date(isoStr) : null;

        const teams      = Array.isArray(raw.teams) ? raw.teams : [];
        const team1      = teams[0] || raw.name || '—';
        const team2      = teams[1] || '—';
        const team1Short = toShortName(team1);
        const team2Short = toShortName(team2);
        const isCSK      = /Chennai Super Kings|CSK/i.test(team1) || /Chennai Super Kings|CSK/i.test(team2);

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
            id:         raw.id,
            d:          displayDate || raw.date || '—',
            t:          displayTime || '—',
            team1,      team2,
            team1Short, team2Short,
            v:          raw.venue  || '—',
            b:          DEFAULT_BROADCAST,
            iso:        isoStr,
            status:     raw.status || null,
            score,
            isCSK
        };
    }

    /** Returns true if a match is an IPL match */
    function isIPLMatch(match) {
        return /ipl|indian premier/i.test(match.seriesName || match.name || '');
    }

    /**
     * Fetch all IPL 2026 fixtures from cricapi.com, normalised to full match format.
     * Results are cached in localStorage for 6 hours — avoids spending 3 cricapi calls
     * on every schedule page visit. In-flight de-duplication prevents parallel fetches
     * (e.g. router lazy-render + live page) from each issuing their own 3-request burst.
     */
    async function fetchAllIPLFixtures() {
        if (!isCricapiConfigured()) return [];

        // Return cached result if still fresh (saves 3 cricapi calls)
        const cached = getFixturesFromCache();
        if (cached) return cached;

        // Return the existing in-flight promise so concurrent callers share one fetch
        if (_fixturesInFlight) return _fixturesInFlight;

        _fixturesInFlight = (async () => {
            try {
                const [page1, page2, page3] = await Promise.all([
                    cricapiRequest('/matches?offset=0'),
                    cricapiRequest('/matches?offset=25'),
                    cricapiRequest('/matches?offset=50')
                ]);

                const all = [
                    ...extractList(page1),
                    ...extractList(page2),
                    ...extractList(page3)
                ];

                // De-duplicate by match id
                const seen = new Set();
                const unique = all.filter(m => {
                    if (!m.id || seen.has(m.id)) return false;
                    seen.add(m.id);
                    return true;
                });

                const result = unique
                    .filter(isIPLMatch)
                    .map(normaliseCricapiMatchFull)
                    .sort((a, b) => {
                        if (!a.iso) return 1;
                        if (!b.iso) return -1;
                        return new Date(a.iso) - new Date(b.iso);
                    });

                saveFixturesToCache(result);
                return result;
            } catch (err) {
                console.warn('[CricketAPI] fetchAllIPLFixtures failed:', err.message);
                return [];
            } finally {
                _fixturesInFlight = null;
            }
        })();

        return _fixturesInFlight;
    }

    /**
     * Fetch upcoming + current CSK fixtures, normalised to TYS format.
     * Leverages the IPL fixtures cache from fetchAllIPLFixtures so that navigating to
     * the schedule page does not spend additional cricapi calls for CSK-only data.
     * Falls back to an empty array (and lets fetchCSKFixtures try RapidAPI) if the
     * IPL fixture fetch fails or returns no results.
     */
    async function fetchCSKFixturesViaCricapi() {
        if (!isCricapiConfigured()) return [];
        try {
            // Reuse the full IPL fixtures — cache hit costs 0 extra API calls
            const iplFixtures = await fetchAllIPLFixtures();
            if (iplFixtures.length > 0) {
                return iplFixtures
                    .filter(m => m.isCSK)
                    .map(m => ({
                        id:     m.id,
                        d:      m.d,
                        t:      m.t,
                        o:      m.team1Short === 'CSK' ? m.team2 : m.team1,
                        v:      m.v,
                        b:      m.b,
                        iso:    m.iso,
                        status: m.status,
                        score:  m.score
                    }));
            }
        } catch (err) {
            console.warn('[CricketAPI] fetchCSKFixturesViaCricapi failed:', err.message);
        }
        return [];
    }

    /**
     * Fetch the live/current CSK match from cricapi.com.
     * Uses the shared 60-second live cache (_fetchCurrentMatchesCached) so the Hub
     * polling loop and the Live page never make duplicate /currentMatches requests
     * within the same 60-second window — critical for the 100 calls/day free tier.
     * Returns null if no CSK match is in progress or the key is not configured.
     */
    async function fetchCSKLiveMatch() {
        if (!isCricapiConfigured()) return null;
        try {
            const list = await _fetchCurrentMatchesCached();
            const live = list.find(m =>
                isCSKMatch(m) && /ipl|indian premier/i.test(m.seriesName || m.name || '')
            );
            if (!live) return null;
            const fetchedAt = Date.now();
            return { ...normaliseCricapiFixture(live), fetchedAt };
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
     * Fetch recent CSK results.
     * Uses RapidAPI /results as primary source (saves cricapi calls).
     * Falls back to completed CSK matches derived from the IPL fixtures cache if
     * RapidAPI is not configured or the request fails.
     */
    async function fetchCSKResults() {
        // Primary: RapidAPI /results (conserves cricapi daily quota)
        if (isConfigured()) {
            try {
                const data = await getResults();
                const results = extractList(data).filter(isCSKMatch).map(normaliseFixture);
                if (results.length > 0) return results;
            } catch (err) {
                console.warn('[CricketAPI] fetchCSKResults (RapidAPI) failed:', err.message);
            }
        }

        // Fallback: derive from IPL fixtures cache (no extra API calls)
        const cached = getFixturesFromCache();
        if (cached) {
            const now = new Date();
            return cached
                .filter(m => m.isCSK && m.iso && new Date(m.iso) < now && m.status)
                .map(m => ({
                    id:     m.id,
                    d:      m.d,
                    t:      m.t,
                    o:      m.team1Short === 'CSK' ? m.team2 : m.team1,
                    v:      m.v,
                    b:      m.b,
                    iso:    m.iso,
                    status: m.status,
                    score:  m.score
                }));
        }

        return [];
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

    /**
     * Fetch all currently active / live matches from cricapi.com.
     * Shares the 60-second live cache with fetchCSKLiveMatch so the Hub and Live
     * page never make more than one /currentMatches request per minute between them.
     * Returns a raw array of match objects (not normalised) for the Live module.
     */
    async function fetchAllCurrentMatches() {
        if (!isCricapiConfigured()) return [];
        try {
            return await _fetchCurrentMatchesCached();
        } catch (err) {
            console.warn('[CricketAPI] fetchAllCurrentMatches failed:', err.message);
            return [];
        }
    }

    /**
     * Fetch detailed match info / scorecard for a specific match ID from cricapi.com.
     * Returns the raw match data object, or null on failure.
     */
    async function fetchMatchInfo(matchId) {
        if (!isCricapiConfigured() || !matchId) return null;
        try {
            const data = await cricapiRequest(`/match_info?id=${encodeURIComponent(matchId)}`);
            return (data && (data.data || data.result)) || null;
        } catch (err) {
            console.warn('[CricketAPI] fetchMatchInfo failed:', err.message);
            return null;
        }
    }

    /**
     * Fetch ball-by-ball commentary for a specific match from cricapi.com.
     * Uses the /match_bbb endpoint (ball-by-ball).
     * Returns an array of commentary objects, or [] on failure / missing key.
     * Each item has: over, ball, batsman, bowler, text, runs, wicket, etc.
     */
    async function fetchMatchCommentary(matchId) {
        if (!isCricapiConfigured() || !matchId) return [];
        try {
            const data = await cricapiRequest(`/match_bbb?id=${encodeURIComponent(matchId)}`);
            const raw = (data && (data.data || data.result)) || null;
            if (!raw) return [];
            // cricapi returns commentary inside raw.commentary[] or raw itself is an array
            if (Array.isArray(raw)) return raw;
            if (Array.isArray(raw.commentary)) return raw.commentary;
            if (Array.isArray(raw.bbb)) return raw.bbb;
            return [];
        } catch (err) {
            console.warn('[CricketAPI] fetchMatchCommentary failed:', err.message);
            return [];
        }
    }

    /**
     * Returns current API call counts for debugging quota usage.
     * Call CricketAPI.getAPIBudget() in the browser console to inspect.
     */
    function getAPIBudget() {
        return {
            cricapi:  { used: _budgetCricapi.count(), limit: 100,  period: 'day'   },
            rapidapi: { used: _budgetRapid.count(),   limit: 500,  period: 'month' }
        };
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
        normaliseCricapiMatchFull,
        fetchCSKFixtures,
        fetchCSKFixturesViaCricapi,
        fetchCSKLiveMatch,
        fetchCSKResults,
        fetchCSKFixturesBySeries,
        fetchAllIPLFixtures,
        fetchAllCurrentMatches,
        fetchMatchInfo,
        fetchMatchCommentary,
        getAPIBudget
    };

})();
