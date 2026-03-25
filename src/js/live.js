/**
 * live.js — TYS 2026 Live Match Centre
 *
 * Provides live scores & commentary for all match types:
 *   International, League, Women, ODI, T20, Test.
 *
 * Features:
 *  • Real-time live scores fetched from cricapi.com every 30 seconds
 *  • Match-type filter tabs (All / T20 / ODI / Test / Women / International / IPL)
 *  • Expandable in-line scorecard panel per match
 *  • Win-percentage indicator (if API data contains it)
 *  • Pin Live Score — floating widget that persists while browsing other pages
 *  • FanCode streaming deep-link on each live match card
 *  • Audio commentary note with links to Cricbuzz / ESPNcricinfo
 */

const Live = (() => {

    /** Active filter: 'all' | 't20' | 'odi' | 'test' | 'women' | 'intl' | 'ipl' */
    let currentFilter = 'all';

    /** ID of the currently pinned match (null if none) */
    let pinnedMatchId = null;

    /** Cached match list used for re-filtering without a network call */
    let cachedMatches = [];

    /** setInterval handle for the 30-second polling loop */
    let pollIntervalId = null;

    /** Timestamp of the last successful data refresh */
    let lastFetchedAt = null;

    // -------------------------------------------------------------------------
    // Match-type helpers
    // -------------------------------------------------------------------------

    /**
     * Detect the format of a raw cricapi.com match object.
     * Returns: 't20' | 'odi' | 'test' | 'other'
     */
    function detectFormat(m) {
        const type = (m.matchType || '').toLowerCase();
        const name = (m.name || m.series || '').toLowerCase();
        if (type === 'test'  || name.includes('test'))                         return 'test';
        if (type === 'odi'   || name.includes(' odi ') || name.includes('one day')) return 'odi';
        if (type === 't20'   || name.includes('t20') || name.includes('twenty20') || name.includes('twenty 20')) return 't20';
        return 'other';
    }

    /** Returns true if the match involves a women's team */
    function isWomen(m) {
        return /women|women's|woman/i.test(m.name || m.series || m.seriesName || '');
    }

    /** Returns true if the match is an international fixture (not a franchise league) */
    function isInternational(m) {
        const name = (m.name || m.series || m.seriesName || '').toLowerCase();
        // Exclude common franchise leagues
        return !/\bipl\b|indian premier|big bash|bbl|cpl|psl|sa20|hundred|super smash|t20 blast/i.test(name);
    }

    /** Returns true if the match is an IPL fixture */
    function isIPL(m) {
        return /\bipl\b|indian premier/i.test(m.name || m.series || m.seriesName || '');
    }

    /** Returns true if the match involves CSK */
    function isCSKMatch(m) {
        const name = (m.name || m.series || m.seriesName || '').toLowerCase();
        const teams = Array.isArray(m.teams) ? m.teams.join(' ').toLowerCase() : '';
        return /chennai super kings|\bcsk\b/i.test(name + ' ' + teams);
    }

    // -------------------------------------------------------------------------
    // Rendering
    // -------------------------------------------------------------------------

    /** Return n skeleton placeholder cards for the loading state */
    function buildSkeletonCards(n) {
        return Array.from({ length: n }, () => `
            <div class="skeleton-card" aria-hidden="true">
                <div class="skeleton skeleton--tag"></div>
                <div class="skeleton skeleton--title"></div>
                <div class="skeleton skeleton--body"></div>
                <div class="skeleton skeleton--body skeleton--short"></div>
            </div>`).join('');
    }

    /** Render the Live page into #live-content */
    function render() {
        const container = document.getElementById('live-content');
        if (!container) return;

        container.innerHTML = `
            <div class="live-refresh-bar">
                <span class="live-last-updated" id="live-last-updated">—</span>
                <button class="live-refresh-btn" id="live-refresh-btn" aria-label="Refresh live matches">↻ Refresh</button>
            </div>

            <div class="live-filter-tabs" role="tablist" aria-label="Match type filter">
                <button class="live-tab live-tab--active" data-filter="all"   role="tab" aria-selected="true">All</button>
                <button class="live-tab"                  data-filter="ipl"   role="tab" aria-selected="false">IPL</button>
                <button class="live-tab"                  data-filter="intl"  role="tab" aria-selected="false">Intl</button>
                <button class="live-tab"                  data-filter="t20"   role="tab" aria-selected="false">T20</button>
                <button class="live-tab"                  data-filter="odi"   role="tab" aria-selected="false">ODI</button>
                <button class="live-tab"                  data-filter="test"  role="tab" aria-selected="false">Test</button>
                <button class="live-tab"                  data-filter="women" role="tab" aria-selected="false">Women</button>
            </div>

            <div id="live-matches-list" aria-live="polite" aria-label="Live matches">
                ${buildSkeletonCards(3)}
            </div>

            <div class="live-legend">
                <span class="tag" style="display:inline-block;margin-bottom:0">Data: cricapi.com · Updates every 30s · </span>
                <a class="live-legend-link" href="https://www.fancode.com/cricket" target="_blank" rel="noopener noreferrer">Watch live on FanCode ▶</a>
            </div>`;

        // Bind filter tabs
        container.querySelectorAll('.live-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                currentFilter = btn.dataset.filter;
                container.querySelectorAll('.live-tab').forEach(b => {
                    b.classList.toggle('live-tab--active', b === btn);
                    b.setAttribute('aria-selected', String(b === btn));
                });
                renderMatchList();
            });
        });

        // Bind manual refresh button
        const refreshBtn = document.getElementById('live-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                refreshBtn.disabled = true;
                fetchAndRender().finally(() => {
                    refreshBtn.disabled = false;
                });
            });
        }

        fetchAndRender();

        // Poll every 30 seconds — skip when tab is hidden to save battery / API quota
        if (pollIntervalId) clearInterval(pollIntervalId);
        pollIntervalId = setInterval(() => {
            if (!document.hidden && document.getElementById('live-content')) {
                fetchAndRender(true);
            } else if (!document.getElementById('live-content')) {
                clearInterval(pollIntervalId);
            }
        }, 30_000);

        // Resume immediately when the tab becomes visible again
        document.addEventListener('visibilitychange', _onVisibilityChange, { passive: true });
    }

    function _onVisibilityChange() {
        if (!document.hidden && document.getElementById('live-content')) {
            fetchAndRender(true);
        }
    }

    /** Fetch matches from the API and refresh the list */
    async function fetchAndRender(silent = false) {
        const listEl = document.getElementById('live-matches-list');
        if (!listEl) return;

        if (!silent) {
            listEl.innerHTML = buildSkeletonCards(3);
        }

        const matches = await CricketAPI.fetchAllCurrentMatches();
        cachedMatches = matches;
        lastFetchedAt = Date.now();
        renderMatchList();
        updateLastUpdatedLabel();

        // Also refresh the pin widget if a match is pinned
        if (pinnedMatchId) {
            const pinned = cachedMatches.find(m => m.id === pinnedMatchId);
            if (pinned) {
                updatePinWidget(pinned);
            }
        }
    }

    /** Update the "Last updated" label in the refresh bar */
    function updateLastUpdatedLabel() {
        const el = document.getElementById('live-last-updated');
        if (!el || !lastFetchedAt) return;
        const mins = Math.floor((Date.now() - lastFetchedAt) / 60_000);
        el.textContent = mins < 1 ? 'Updated just now' : `Updated ${mins}m ago`;
    }

    /** Re-render #live-matches-list from cachedMatches using currentFilter */
    function renderMatchList() {
        const listEl = document.getElementById('live-matches-list');
        if (!listEl) return;

        const filtered = cachedMatches.filter(m => {
            if (currentFilter === 'all')   return true;
            if (currentFilter === 'ipl')   return isIPL(m);
            if (currentFilter === 'intl')  return isInternational(m) && !isWomen(m);
            if (currentFilter === 'women') return isWomen(m);
            const fmt = detectFormat(m);
            return fmt === currentFilter;
        });

        if (filtered.length === 0) {
            listEl.innerHTML = `
                <div class="live-empty">
                    <p class="live-empty-icon">🏏</p>
                    <p class="live-empty-msg">No live matches right now.</p>
                    <p class="fixtures-status">Check back during match hours or try a different filter.</p>
                </div>`;
            return;
        }

        listEl.innerHTML = filtered.map(m => buildMatchCard(m)).join('');
        bindCardEvents(listEl);
    }

    /** Build HTML for a single live match card */
    function buildMatchCard(m) {
        const teams  = Array.isArray(m.teams) ? m.teams : [];
        const team1  = teams[0] || m.name || 'Team A';
        const team2  = teams[1] || 'Team B';
        const fmt    = detectFormat(m).toUpperCase();
        const women  = isWomen(m);
        const ipl    = isIPL(m);
        const csk    = isCSKMatch(m);
        const status = m.status || '';
        const isLive = !status.toLowerCase().includes('match not started') && status !== '';

        // Score lines
        const scoreLines = Array.isArray(m.score) && m.score.length > 0
            ? m.score.map(s => `
                <div class="live-score-line">
                    <span class="live-score-inning">${s.inning}</span>
                    <span class="live-score-runs">${s.r}/${s.w}</span>
                    <span class="live-score-overs">(${s.o} ov)</span>
                </div>`).join('')
            : '<p class="live-score-na">Score not yet available</p>';

        // Win percentage bar (show if available in API response)
        const winPct = m.tossChoice ? buildWinPctBar(m) : '';

        // Format badge
        const fmtLabel = women ? `Women · ${fmt}` : ipl ? 'IPL' : fmt;
        const isPinned = pinnedMatchId === m.id;

        // FanCode URL — use deep-link with team names for better matching
        const fanCodeURL = `https://www.fancode.com/cricket`;

        const cskClass = csk ? ' live-match-card--csk' : '';

        return `
        <div class="live-match-card${cskClass}" data-match-id="${m.id}" aria-label="Match: ${team1} vs ${team2}">
            <div class="live-card-top">
                ${isLive ? '<span class="tag live-tag" aria-label="Live match">🔴 LIVE</span>' : '<span class="tag live-tag-soon">🕐 UPCOMING</span>'}
                <span class="live-format-badge">${fmtLabel}</span>
                ${csk ? '<span class="tag" style="color:var(--color-yellow);margin:0">🦁 CSK</span>' : ''}
            </div>

            <div class="live-card-teams">
                <span class="live-team-name">${team1}</span>
                <span class="live-vs">vs</span>
                <span class="live-team-name">${team2}</span>
            </div>

            <div class="live-card-scores">${scoreLines}</div>

            ${winPct}

            <p class="live-card-status">${status}</p>
            ${m.venue ? `<p class="live-card-venue">📍 ${m.venue}</p>` : ''}

            <div class="live-card-actions">
                <button class="live-action-btn live-action-btn--sc" aria-label="View detailed scorecard" aria-expanded="false">
                    📋 Scorecard
                </button>
                <button class="live-action-btn ${isPinned ? 'live-action-btn--pin live-action-btn--pinned' : 'live-action-btn--pin'}"
                        aria-label="${isPinned ? 'Unpin score' : 'Pin live score to screen'}"
                        aria-pressed="${isPinned}">
                    📌 ${isPinned ? 'Pinned' : 'Pin'}
                </button>
                <a class="live-action-btn live-action-btn--fancode"
                   href="${fanCodeURL}" target="_blank" rel="noopener noreferrer"
                   aria-label="Watch on FanCode (opens in new tab)">
                    ▶ FanCode
                </a>
            </div>

            <!-- Expandable scorecard panel (lazy-loaded) -->
            <div class="live-scorecard-panel" aria-hidden="true" style="display:none"></div>
        </div>`;
    }

    /** Build a simple win-percentage bar if toss / match state info is available */
    function buildWinPctBar(m) {
        // cricapi.com free tier doesn't expose a numeric win%, but we can show
        // a generic probability bar if the API ever includes matchWinner fields.
        return '';
    }

    // -------------------------------------------------------------------------
    // Scorecard panel
    // -------------------------------------------------------------------------

    /** Toggle the inline scorecard panel for a card */
    async function toggleScorecard(card) {
        const panel  = card.querySelector('.live-scorecard-panel');
        const btn    = card.querySelector('.live-action-btn--sc');
        if (!panel) return;

        const isOpen = panel.style.display !== 'none';
        if (isOpen) {
            panel.style.display = 'none';
            panel.setAttribute('aria-hidden', 'true');
            if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.textContent = '📋 Scorecard'; }
            return;
        }

        panel.style.display = '';
        panel.setAttribute('aria-hidden', 'false');
        if (btn) { btn.setAttribute('aria-expanded', 'true'); btn.textContent = '⏳ Loading…'; }

        const matchId = card.dataset.matchId;
        const info    = await CricketAPI.fetchMatchInfo(matchId);
        renderScorecard(panel, info);
        if (btn) btn.textContent = '📋 Scorecard';
    }

    /** Inject scorecard HTML into the panel element */
    function renderScorecard(panel, info) {
        if (!info) {
            panel.innerHTML = '<p class="sc-note">Detailed scorecard not available for this match.</p>';
            return;
        }

        let html = '<div class="sc-wrap">';

        // ── Score summary ──────────────────────────────────────────────────
        if (Array.isArray(info.score) && info.score.length > 0) {
            html += '<div class="sc-score-block">';
            info.score.forEach(s => {
                html += `
                <div class="sc-score-row">
                    <span class="sc-inning-label">${s.inning}</span>
                    <span class="sc-total">${s.r}/${s.w}</span>
                    <span class="sc-overs-label">(${s.o} ov)</span>
                </div>`;
            });
            html += '</div>';
        }

        // ── Status ────────────────────────────────────────────────────────
        if (info.status) {
            html += `<p class="sc-status">${info.status}</p>`;
        }

        // ── Partnership & wicket stats (shown when available from API) ────
        if (Array.isArray(info.scorecard) && info.scorecard.length > 0) {
            info.scorecard.forEach(inn => {
                html += `<p class="sc-inning-title">${inn.inning || ''}</p>`;

                // Batting
                if (Array.isArray(inn.batting) && inn.batting.length > 0) {
                    html += '<div class="sc-batting-table" role="table" aria-label="Batting scorecard">';
                    html += `
                    <div class="sc-row sc-row--header" role="row">
                        <span class="sc-col sc-col--player" role="columnheader">Batter</span>
                        <span class="sc-col sc-col--dismissal" role="columnheader">Dismissal</span>
                        <span class="sc-col sc-col--stat" role="columnheader">R</span>
                        <span class="sc-col sc-col--stat" role="columnheader">B</span>
                        <span class="sc-col sc-col--stat" role="columnheader">4s</span>
                        <span class="sc-col sc-col--stat" role="columnheader">6s</span>
                        <span class="sc-col sc-col--stat" role="columnheader">SR</span>
                    </div>`;
                    inn.batting.forEach(b => {
                        const sr = b.b > 0 ? ((b.r / b.b) * 100).toFixed(1) : '—';
                        html += `
                        <div class="sc-row" role="row">
                            <span class="sc-col sc-col--player" role="cell">${b.batsman || '—'}</span>
                            <span class="sc-col sc-col--dismissal" role="cell">${b['dismissal-text'] || b.dismissal || ''}</span>
                            <span class="sc-col sc-col--stat sc-col--bold" role="cell">${b.r ?? '—'}</span>
                            <span class="sc-col sc-col--stat" role="cell">${b.b ?? '—'}</span>
                            <span class="sc-col sc-col--stat" role="cell">${b['4s'] ?? '—'}</span>
                            <span class="sc-col sc-col--stat" role="cell">${b['6s'] ?? '—'}</span>
                            <span class="sc-col sc-col--stat" role="cell">${sr}</span>
                        </div>`;
                    });
                    html += '</div>';
                }

                // Bowling
                if (Array.isArray(inn.bowling) && inn.bowling.length > 0) {
                    html += '<div class="sc-bowling-table" role="table" aria-label="Bowling scorecard">';
                    html += `
                    <div class="sc-row sc-row--header" role="row">
                        <span class="sc-col sc-col--player" role="columnheader">Bowler</span>
                        <span class="sc-col sc-col--stat" role="columnheader">O</span>
                        <span class="sc-col sc-col--stat" role="columnheader">M</span>
                        <span class="sc-col sc-col--stat" role="columnheader">R</span>
                        <span class="sc-col sc-col--stat sc-col--bold" role="columnheader">W</span>
                        <span class="sc-col sc-col--stat" role="columnheader">Eco</span>
                    </div>`;
                    inn.bowling.forEach(b => {
                        html += `
                        <div class="sc-row" role="row">
                            <span class="sc-col sc-col--player" role="cell">${b.bowler || '—'}</span>
                            <span class="sc-col sc-col--stat" role="cell">${b.o ?? '—'}</span>
                            <span class="sc-col sc-col--stat" role="cell">${b.m ?? '—'}</span>
                            <span class="sc-col sc-col--stat" role="cell">${b.r ?? '—'}</span>
                            <span class="sc-col sc-col--stat sc-col--bold" role="cell">${b.w ?? '—'}</span>
                            <span class="sc-col sc-col--stat" role="cell">${b.eco ?? '—'}</span>
                        </div>`;
                    });
                    html += '</div>';
                }

                // Partnerships
                if (Array.isArray(inn.partnerships) && inn.partnerships.length > 0) {
                    html += '<p class="sc-section-label">Partnerships</p>';
                    html += '<div class="sc-partnerships">';
                    inn.partnerships.forEach(p => {
                        const pct = Math.min(Math.round((p.totalRuns / Math.max(1, (info.score?.[0]?.r || 100))) * 100), 100);
                        html += `
                        <div class="sc-partnership-row">
                            <span class="sc-p-players">${p.bat1} &amp; ${p.bat2}</span>
                            <div class="sc-p-bar-track">
                                <div class="sc-p-bar-fill" style="width:${pct}%"></div>
                            </div>
                            <span class="sc-p-runs">${p.totalRuns} (${p.totalBalls} b)</span>
                        </div>`;
                    });
                    html += '</div>';
                }
            });
        } else {
            // Fallback: summary only + commentary links
            html += `
            <p class="sc-note">Full batting &amp; bowling scorecard available on:</p>
            <div class="sc-links">
                <a class="sc-link" href="https://www.espncricinfo.com" target="_blank" rel="noopener noreferrer">ESPNcricinfo</a>
                <a class="sc-link" href="https://www.cricbuzz.com"     target="_blank" rel="noopener noreferrer">Cricbuzz</a>
            </div>`;
        }

        // Commentary note
        html += `
        <div class="sc-commentary-note">
            <span class="tag" style="display:inline-block;margin-bottom:var(--space-1)">🎙 Commentary</span>
            <p class="sc-note">Ball-by-ball audio &amp; text commentary available on
                <a class="sc-link" href="https://www.cricbuzz.com" target="_blank" rel="noopener noreferrer">Cricbuzz</a> and
                <a class="sc-link" href="https://www.espncricinfo.com" target="_blank" rel="noopener noreferrer">ESPNcricinfo</a>.
                <br>Live streaming available on <a class="sc-link" href="https://www.fancode.com/cricket" target="_blank" rel="noopener noreferrer">FanCode</a> for select matches.
            </p>
        </div>`;

        html += '</div>';
        panel.innerHTML = html;
    }

    // -------------------------------------------------------------------------
    // Pin Live Score
    // -------------------------------------------------------------------------

    /**
     * Toggle pinning of a match.
     * When pinned, a floating widget is shown at the top of the viewport
     * so the user can follow the score while browsing other pages.
     */
    function togglePin(matchId) {
        const match = cachedMatches.find(m => m.id === matchId);

        if (pinnedMatchId === matchId) {
            // Unpin
            pinnedMatchId = null;
            hidePinWidget();
        } else {
            pinnedMatchId = matchId;
            if (match) updatePinWidget(match);
        }

        // Refresh button states in the live list
        document.querySelectorAll('.live-action-btn--pin').forEach(btn => {
            const card     = btn.closest('.live-match-card');
            const isPinned = card && card.dataset.matchId === pinnedMatchId;
            btn.classList.toggle('live-action-btn--pinned', isPinned);
            btn.setAttribute('aria-pressed', String(isPinned));
            btn.textContent = isPinned ? '📌 Pinned' : '📌 Pin';
        });
    }

    /** Refresh the floating pin widget with the latest data for the given match */
    function updatePinWidget(match) {
        const widget = document.getElementById('pin-score-widget');
        if (!widget) return;

        const teams  = Array.isArray(match.teams) ? match.teams : [];
        const team1  = teams[0] || match.name || '—';
        const team2  = teams[1] || '—';
        const score  = Array.isArray(match.score) && match.score.length > 0
            ? match.score.map(s => `${s.r}/${s.w}(${s.o})`).join(' | ')
            : '—';
        const status = match.status || '';

        const teamsEl  = widget.querySelector('#pin-teams');
        const scoreEl  = widget.querySelector('#pin-score');
        const statusEl = widget.querySelector('#pin-status');
        if (teamsEl)  teamsEl.textContent  = `${team1} vs ${team2}`;
        if (scoreEl)  scoreEl.textContent  = score;
        if (statusEl) statusEl.textContent = status;

        widget.removeAttribute('hidden');
        widget.style.display = 'flex';
    }

    function hidePinWidget() {
        const widget = document.getElementById('pin-score-widget');
        if (!widget) return;
        widget.style.display = 'none';
        widget.setAttribute('hidden', '');
    }

    // -------------------------------------------------------------------------
    // Event binding
    // -------------------------------------------------------------------------

    function bindCardEvents(listEl) {
        // Scorecard buttons
        listEl.querySelectorAll('.live-action-btn--sc').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                toggleScorecard(btn.closest('.live-match-card'));
            });
        });

        // Pin buttons
        listEl.querySelectorAll('.live-action-btn--pin').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const card = btn.closest('.live-match-card');
                if (card) togglePin(card.dataset.matchId);
            });
        });
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------
    return { render };

})();
