/**
 * livescore.js — TYS 2026 Live Score Integration
 * Polls CricAPI for an active CSK match and updates the Hub display.
 * Falls back silently to the static countdown when no live match is found
 * or when no API key is configured in DATA.config.cricApiKey.
 *
 * Free API keys: https://cricapi.com/
 */

const LiveScore = (() => {

    const API_BASE      = 'https://api.cricapi.com/v1';
    const POLL_INTERVAL = 30_000;   // 30 s between polls during a live match

    let pollId        = null;
    let displayActive = false;  // true when live-score display is showing (not countdown)

    /* ------------------------------------------------------------------
       Helpers
    ------------------------------------------------------------------ */

    function apiKey() {
        return DATA.config && DATA.config.cricApiKey;
    }

    function teamName() {
        return (DATA.config && DATA.config.teamName) || 'Chennai Super Kings';
    }

    async function fetchCurrentMatches() {
        try {
            const res = await fetch(
                `${API_BASE}/currentMatches?apikey=${apiKey()}&offset=0`
            );
            if (!res.ok) return null;
            const json = await res.json();
            return json.status === 'success' ? (json.data || []) : null;
        } catch {
            return null;
        }
    }

    function findTeamMatch(matches) {
        const name = teamName();
        return matches.find(m =>
            Array.isArray(m.teams) && m.teams.some(t => t.includes(name))
        ) || null;
    }

    /* ------------------------------------------------------------------
       Rendering helpers
    ------------------------------------------------------------------ */

    function buildScoreText(match) {
        if (!Array.isArray(match.score) || !match.score.length) return '';
        return match.score.map(s => {
            const team = s.inning
                .replace(teamName(), 'CSK')
                .replace(/\s*Inning\s*\d*\s*/i, '')
                .trim();
            return `${team}: ${s.r}/${s.w} (${s.o} ov)`;
        }).join('  ·  ');
    }

    function setMatchLabel(match) {
        const labelEl = document.querySelector('.countdown-card .tag');
        if (!labelEl) return;
        if (Array.isArray(match.teams)) {
            labelEl.textContent = match.teams
                .map(t => t.replace(teamName(), 'CSK'))
                .join(' vs ');
        } else if (match.name) {
            labelEl.textContent = match.name;
        }
    }

    function renderLive(match) {
        const timerEl  = document.getElementById('timer');
        const detailEl = document.getElementById('live-detail');

        if (!timerEl) return;

        timerEl.innerHTML = '<span class="live-badge">&#9679; LIVE</span>';

        if (detailEl) {
            detailEl.textContent = buildScoreText(match) || match.status || '';
        }

        setMatchLabel(match);
    }

    function renderEnded(match) {
        const timerEl  = document.getElementById('timer');
        const detailEl = document.getElementById('live-detail');

        if (timerEl)  timerEl.textContent  = 'MATCH ENDED';
        if (detailEl) detailEl.textContent = match.status || '';

        setMatchLabel(match);
    }

    function clearLiveDisplay() {
        const detailEl = document.getElementById('live-detail');
        if (detailEl) detailEl.textContent = '';
    }

    /* ------------------------------------------------------------------
       Polling logic
    ------------------------------------------------------------------ */

    async function poll() {
        const matches = await fetchCurrentMatches();

        if (!matches) {
            // API unreachable — hand back to countdown if we were showing live data
            if (displayActive) {
                displayActive = false;
                clearLiveDisplay();
                Countdown.start();
            }
            return;
        }

        const match = findTeamMatch(matches);

        if (match && match.matchStarted && !match.matchEnded) {
            // Live match in progress
            if (!displayActive) {
                displayActive = true;
                Countdown.stop();
            }
            renderLive(match);

        } else if (match && match.matchEnded) {
            // Match just finished — show result; countdown stays off until match
            // leaves currentMatches (next poll where findTeamMatch returns null)
            if (!displayActive) {
                displayActive = true;
                Countdown.stop();
            }
            renderEnded(match);

        } else {
            // No active CSK match — ensure countdown is running
            if (displayActive) {
                displayActive = false;
                clearLiveDisplay();
                Countdown.start();
            }
        }
    }

    /* ------------------------------------------------------------------
       Public API
    ------------------------------------------------------------------ */

    function start() {
        if (!apiKey()) return;   // No key configured — countdown handles display
        poll();
        pollId = setInterval(poll, POLL_INTERVAL);
    }

    function stop() {
        if (pollId) {
            clearInterval(pollId);
            pollId = null;
        }
    }

    return { start, stop };

})();
