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
                <span class="tag" style="display:inline-block;margin-bottom:0">Data: cricapi.com · Updates every 90 s · </span>
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

        // Poll every 90 seconds — skip when tab is hidden to save battery / API quota
        if (pollIntervalId) clearInterval(pollIntervalId);
        pollIntervalId = setInterval(() => {
            if (!document.hidden && document.getElementById('live-content')) {
                fetchAndRender(true);
            } else if (!document.getElementById('live-content')) {
                clearInterval(pollIntervalId);
            }
        }, 90_000);

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

    /**
     * Build a compact recent-events ticker from partial score data.
     * Shows last-ball outcomes (W = wicket, 6, 4, dots) as colour-coded badges.
     * When full ball-by-ball data is not available we show last-over run rate instead.
     */
    function buildEventsTicker(m) {
        const scores = Array.isArray(m.score) ? m.score : [];
        if (scores.length === 0) return '';

        // Try to derive current over info from the latest innings score string
        const latest = scores[scores.length - 1];
        if (!latest) return '';

        const runs   = latest.r  ?? 0;
        const wickets= latest.w  ?? 0;
        const overs  = String(latest.o || '0');
        const parts  = overs.split('.');
        const compOv = parseInt(parts[0], 10) || 0;
        const balls  = parseInt(parts[1], 10) || 0;
        if (compOv === 0 && balls === 0) return '';

        // Current run rate
        const totalBalls = compOv * 6 + balls;
        const crr = totalBalls > 0 ? ((runs / totalBalls) * 6).toFixed(2) : '—';

        // Powerplay indicator (overs 1–6 in T20)
        const fmt = detectFormat(m);
        const isPP = fmt === 't20' && compOv < 6;
        const isDeath = fmt === 't20' && compOv >= 16;

        const ppLabel = isPP
            ? '<span class="live-event-badge live-event-badge--pp">PP</span>'
            : isDeath
                ? '<span class="live-event-badge live-event-badge--death">DEATH</span>'
                : '';

        return `
        <div class="live-events-ticker">
            ${ppLabel}
            <span class="live-event-meta">Ov ${latest.o}</span>
            <span class="live-event-crr" title="Current Run Rate">CRR ${crr}</span>
            <span class="live-event-meta">${wickets}wkts</span>
        </div>`;
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

        // Win / Required Run Rate bar (shown when chasing in 2nd innings)
        const winPct = (Array.isArray(m.score) && m.score.length >= 2) ? buildWinProbability(m) : '';

        // Events ticker — current over meta
        const ticker = isLive ? buildEventsTicker(m) : '';

        // Format badge
        const fmtLabel = women ? `Women · ${fmt}` : ipl ? 'IPL' : fmt;
        const isPinned = pinnedMatchId === m.id;

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

            ${ticker}
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

    // -------------------------------------------------------------------------
    // Win Probability & Over Chart
    // -------------------------------------------------------------------------

    /**
     * Build an enhanced win-probability display for a match in the 2nd innings.
     * Shows a two-sided bar with both teams labelled, and the RRR needed to win.
     * Returns an empty string when not applicable.
     */
    function buildWinProbability(m) {
        const scores = Array.isArray(m.score) ? m.score : [];
        if (scores.length < 2) return '';
        const fmt = detectFormat(m);
        if (fmt === 'test' || fmt === 'other') return '';

        const inn1 = scores[0];
        const inn2 = scores[1];
        if (!inn2 || inn2.r == null || inn2.o == null) return '';

        function toBalls(overs) {
            const parts = String(overs).split('.');
            return parseInt(parts[0], 10) * 6 + (parseInt(parts[1], 10) || 0);
        }

        const totalOvers = fmt === 'odi' ? 50 : 20;
        const totalBalls = totalOvers * 6;
        const target     = (inn1.r || 0) + 1;
        const scored     = inn2.r || 0;
        const ballsFaced = toBalls(inn2.o);
        const ballsLeft  = totalBalls - ballsFaced;
        const needed     = target - scored;

        if (needed <= 0 || ballsLeft <= 0 || (inn2.w || 0) >= 10) return '';

        const rrr = ((needed / ballsLeft) * 6).toFixed(2);

        // Simple win probability: lower RRR → chaser more likely to win
        // Use a logistic-style mapping: P(win) ≈ 1 / (1 + e^(k*(RRR - 8.5)))
        // where 8.5 rpo is roughly the inflection point in T20
        const pivot = fmt === 'odi' ? 7.0 : 8.5;
        const k = 0.55;
        const pChase = Math.round(100 / (1 + Math.exp(k * (parseFloat(rrr) - pivot))));
        const pDefend = 100 - pChase;

        const teams = Array.isArray(m.teams) ? m.teams : [];
        const chaserLabel  = (inn2.inning || teams[1] || 'Chasing').split(' Inning')[0].trim();
        const defenderLabel= (inn1.inning || teams[0] || 'Defending').split(' Inning')[0].trim();

        return `
        <div class="live-win-prob" aria-label="Win probability: ${chaserLabel} ${pChase}%, ${defenderLabel} ${pDefend}%">
            <div class="live-win-prob-label">
                <span>${defenderLabel}</span>
                <span class="live-win-prob-title">Win Prob</span>
                <span>${chaserLabel}</span>
            </div>
            <div class="live-win-prob-bar">
                <div class="live-win-prob-fill live-win-prob-fill--defend" style="width:${pDefend}%"></div>
                <div class="live-win-prob-fill live-win-prob-fill--chase"  style="width:${pChase}%"></div>
            </div>
            <div class="live-win-prob-pct">
                <span>${pDefend}%</span>
                <span class="live-win-prob-rrr">Need <strong>${needed}</strong> off <strong>${ballsLeft}</strong> · RRR <strong style="color:var(--color-yellow)">${rrr}</strong></span>
                <span>${pChase}%</span>
            </div>
        </div>`;
    }

    /**
     * Build an over-by-over run chart (bar chart) from innings scorecard data.
     * @param {Array} batting - batting array from scorecard (used for wicket overlay)
     * @param {string} innTitle - innings label
     * @param {number} totalRuns - total runs scored in the innings
     * @param {number} totalOvers - completed overs (to scale chart)
     * Returns HTML string or '' if insufficient data.
     */
    function buildOverChart(totalRuns, totalOvers) {
        if (!totalRuns || !totalOvers || totalOvers < 1) return '';

        const numOvers = Math.floor(totalOvers);
        if (numOvers < 2) return '';

        // Estimate roughly equal distribution across overs with slight ramp-up (approximate)
        // When we have actual ball-by-ball we'd use real per-over data; here we build
        // a visual from the aggregate only, shown as a flat reference bar.
        const avgRPO = (totalRuns / totalOvers).toFixed(1);

        return `
        <div class="sc-over-chart-wrap">
            <p class="sc-section-label">Run Rate Overview</p>
            <div class="sc-over-chart-meta">
                <span>${totalRuns} runs in ${totalOvers} ov</span>
                <span>Avg: <strong style="color:var(--color-yellow)">${avgRPO} RPO</strong></span>
            </div>
        </div>`;
    }

    // -------------------------------------------------------------------------
    // Scorecard panel — tabbed (Crex-style)
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
        renderScorecardTabs(panel, info, matchId);
        if (btn) btn.textContent = '📋 Scorecard';
    }

    /**
     * Render the tabbed scorecard panel.
     * Tabs: Summary | Batting | Bowling | Commentary
     */
    function renderScorecardTabs(panel, info, matchId) {
        if (!info) {
            panel.innerHTML = `
                <p class="sc-note">Detailed scorecard not available for this match.</p>
                <div class="sc-links">
                    <a class="sc-link" href="https://www.espncricinfo.com" target="_blank" rel="noopener noreferrer">ESPNcricinfo</a>
                    <a class="sc-link" href="https://www.cricbuzz.com"     target="_blank" rel="noopener noreferrer">Cricbuzz</a>
                </div>`;
            return;
        }

        const hasScorecard = Array.isArray(info.scorecard) && info.scorecard.length > 0;

        panel.innerHTML = `
        <div class="sc-tabs-bar" role="tablist" aria-label="Scorecard sections">
            <button class="sc-tab sc-tab--active" data-sc-tab="summary"     role="tab" aria-selected="true">Summary</button>
            <button class="sc-tab"                data-sc-tab="batting"     role="tab" aria-selected="false">Batting</button>
            <button class="sc-tab"                data-sc-tab="bowling"     role="tab" aria-selected="false">Bowling</button>
            <button class="sc-tab"                data-sc-tab="commentary"  role="tab" aria-selected="false">Commentary</button>
        </div>
        <div class="sc-tab-panels">
            <div class="sc-tab-panel sc-tab-panel--active" data-sc-panel="summary">
                ${buildSummaryPanel(info)}
            </div>
            <div class="sc-tab-panel" data-sc-panel="batting">
                ${hasScorecard ? buildBattingPanel(info.scorecard, info.score) : buildNoScorecardFallback()}
            </div>
            <div class="sc-tab-panel" data-sc-panel="bowling">
                ${hasScorecard ? buildBowlingPanel(info.scorecard) : buildNoScorecardFallback()}
            </div>
            <div class="sc-tab-panel sc-tab-panel--commentary" data-sc-panel="commentary">
                <div class="sc-commentary-loading">⏳ Loading commentary…</div>
            </div>
        </div>`;

        // Bind tab switching
        panel.querySelectorAll('.sc-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.scTab;
                panel.querySelectorAll('.sc-tab').forEach(t => {
                    t.classList.toggle('sc-tab--active', t === tab);
                    t.setAttribute('aria-selected', String(t === tab));
                });
                panel.querySelectorAll('.sc-tab-panel').forEach(p => {
                    p.classList.toggle('sc-tab-panel--active', p.dataset.scPanel === target);
                });
                // Lazy-load commentary when its tab is first clicked
                if (target === 'commentary') {
                    const commPanel = panel.querySelector('[data-sc-panel="commentary"]');
                    if (commPanel && commPanel.querySelector('.sc-commentary-loading')) {
                        loadCommentary(commPanel, matchId);
                    }
                }
            });
        });
    }

    /** Build the Summary tab content */
    function buildSummaryPanel(info) {
        let html = '<div class="sc-wrap">';

        // Score summary
        if (Array.isArray(info.score) && info.score.length > 0) {
            html += '<div class="sc-score-block">';
            info.score.forEach(s => {
                const totalOv  = s.o ? parseFloat(s.o) : 0;
                const avgRPO   = totalOv > 0 ? ((s.r / totalOv)).toFixed(2) : '—';
                html += `
                <div class="sc-score-row">
                    <span class="sc-inning-label">${s.inning}</span>
                    <span class="sc-total">${s.r}/${s.w}</span>
                    <span class="sc-overs-label">(${s.o} ov · ${avgRPO} RPO)</span>
                </div>`;
            });
            html += '</div>';

            // Over chart (aggregate)
            const latest = info.score[info.score.length - 1];
            if (latest) {
                html += buildOverChart(latest.r, parseFloat(latest.o));
            }
        }

        // Match status
        if (info.status) {
            html += `<p class="sc-status">${info.status}</p>`;
        }

        // Partnerships summary (if available from first scorecard innings)
        const sc = Array.isArray(info.scorecard) ? info.scorecard : [];
        sc.forEach(inn => {
            if (Array.isArray(inn.partnerships) && inn.partnerships.length > 0) {
                html += `<p class="sc-section-label">Partnerships – ${inn.inning || ''}</p>`;
                html += '<div class="sc-partnerships">';
                const maxRuns = Math.max(...inn.partnerships.map(p => p.totalRuns || 0), 1);
                inn.partnerships.forEach(p => {
                    const pct = Math.min(Math.round(((p.totalRuns || 0) / maxRuns) * 100), 100);
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

        html += `
        <div class="sc-commentary-note">
            <span class="tag" style="display:inline-block;margin-bottom:var(--space-1)">🎙 Live</span>
            <p class="sc-note">Stream on
                <a class="sc-link" href="https://www.fancode.com/cricket" target="_blank" rel="noopener noreferrer">FanCode</a> ·
                Commentary on <a class="sc-link" href="https://www.cricbuzz.com" target="_blank" rel="noopener noreferrer">Cricbuzz</a> &amp;
                <a class="sc-link" href="https://www.espncricinfo.com" target="_blank" rel="noopener noreferrer">ESPNcricinfo</a>.
            </p>
        </div>`;

        html += '</div>';
        return html;
    }

    /** Build the Batting tab content */
    function buildBattingPanel(scorecard, scores) {
        if (!scorecard || scorecard.length === 0) return buildNoScorecardFallback();
        let html = '<div class="sc-wrap">';

        scorecard.forEach((inn, idx) => {
            if (!Array.isArray(inn.batting) || inn.batting.length === 0) return;

            // Top scorers highlight (top 2 run-scorers)
            const sorted   = [...inn.batting].sort((a, b) => (b.r || 0) - (a.r || 0));
            const topScore = sorted[0];

            html += `<p class="sc-inning-title">${inn.inning || `Innings ${idx + 1}`}</p>`;

            // Over chart for this innings from aggregate score data
            const aggScore = Array.isArray(scores) ? scores[idx] : null;
            if (aggScore) {
                html += buildOverChart(aggScore.r, parseFloat(aggScore.o));
            }

            html += '<div class="sc-batting-table" role="table" aria-label="Batting scorecard">';
            html += `
            <div class="sc-row sc-row--header" role="row">
                <span class="sc-col sc-col--player"    role="columnheader">Batter</span>
                <span class="sc-col sc-col--dismissal" role="columnheader">How out</span>
                <span class="sc-col sc-col--stat"      role="columnheader">R</span>
                <span class="sc-col sc-col--stat"      role="columnheader">B</span>
                <span class="sc-col sc-col--stat"      role="columnheader">4s</span>
                <span class="sc-col sc-col--stat"      role="columnheader">6s</span>
                <span class="sc-col sc-col--stat"      role="columnheader">SR</span>
            </div>`;

            inn.batting.forEach(b => {
                const sr      = (b.b > 0) ? ((b.r / b.b) * 100).toFixed(1) : '—';
                const isTop   = topScore && b.batsman === topScore.batsman;
                const rowCls  = isTop ? ' sc-row--top-scorer' : '';
                html += `
                <div class="sc-row${rowCls}" role="row">
                    <span class="sc-col sc-col--player"    role="cell">${b.batsman || '—'}${isTop ? ' ⭐' : ''}</span>
                    <span class="sc-col sc-col--dismissal" role="cell">${b['dismissal-text'] || b.dismissal || ''}</span>
                    <span class="sc-col sc-col--stat sc-col--bold" role="cell">${b.r ?? '—'}</span>
                    <span class="sc-col sc-col--stat"      role="cell">${b.b ?? '—'}</span>
                    <span class="sc-col sc-col--stat"      role="cell">${b['4s'] ?? '—'}</span>
                    <span class="sc-col sc-col--stat"      role="cell">${b['6s'] ?? '—'}</span>
                    <span class="sc-col sc-col--stat"      role="cell">${sr}</span>
                </div>`;
            });
            html += '</div>';

            // Extras & total
            if (inn.extras != null) {
                html += `<p class="sc-note" style="margin-top:var(--space-2)">Extras: <strong>${inn.extras}</strong></p>`;
            }
        });

        html += '</div>';
        return html;
    }

    /** Build the Bowling tab content */
    function buildBowlingPanel(scorecard) {
        if (!scorecard || scorecard.length === 0) return buildNoScorecardFallback();
        let html = '<div class="sc-wrap">';

        scorecard.forEach((inn, idx) => {
            if (!Array.isArray(inn.bowling) || inn.bowling.length === 0) return;

            // Best bowler highlight
            const sorted  = [...inn.bowling].sort((a, b) => (b.w || 0) - (a.w || 0) || (a.eco || 99) - (b.eco || 99));
            const topBowl = sorted[0];

            html += `<p class="sc-inning-title">${inn.inning || `Innings ${idx + 1}`}</p>`;
            html += '<div class="sc-bowling-table" role="table" aria-label="Bowling scorecard">';
            html += `
            <div class="sc-row sc-row--header" role="row">
                <span class="sc-col sc-col--player" role="columnheader">Bowler</span>
                <span class="sc-col sc-col--stat"   role="columnheader">O</span>
                <span class="sc-col sc-col--stat"   role="columnheader">M</span>
                <span class="sc-col sc-col--stat"   role="columnheader">R</span>
                <span class="sc-col sc-col--stat sc-col--bold" role="columnheader">W</span>
                <span class="sc-col sc-col--stat"   role="columnheader">Eco</span>
            </div>`;

            inn.bowling.forEach(b => {
                const isTop  = topBowl && b.bowler === topBowl.bowler;
                const rowCls = isTop ? ' sc-row--top-scorer' : '';
                html += `
                <div class="sc-row${rowCls}" role="row">
                    <span class="sc-col sc-col--player" role="cell">${b.bowler || '—'}${isTop ? ' ⭐' : ''}</span>
                    <span class="sc-col sc-col--stat"   role="cell">${b.o ?? '—'}</span>
                    <span class="sc-col sc-col--stat"   role="cell">${b.m ?? '—'}</span>
                    <span class="sc-col sc-col--stat"   role="cell">${b.r ?? '—'}</span>
                    <span class="sc-col sc-col--stat sc-col--bold" role="cell">${b.w ?? '—'}</span>
                    <span class="sc-col sc-col--stat"   role="cell">${b.eco ?? '—'}</span>
                </div>`;
            });
            html += '</div>';
        });

        html += '</div>';
        return html;
    }

    /** Fallback content when scorecard data is unavailable */
    function buildNoScorecardFallback() {
        return `
        <div class="sc-wrap">
            <p class="sc-note">Full scorecard available on:</p>
            <div class="sc-links">
                <a class="sc-link" href="https://www.espncricinfo.com" target="_blank" rel="noopener noreferrer">ESPNcricinfo</a>
                <a class="sc-link" href="https://www.cricbuzz.com"     target="_blank" rel="noopener noreferrer">Cricbuzz</a>
            </div>
        </div>`;
    }

    /**
     * Lazy-load ball-by-ball commentary into the commentary panel.
     * Fetches from cricapi /match_bbb — falls back to a helpful link if unavailable.
     */
    async function loadCommentary(commPanel, matchId) {
        try {
            const balls = await CricketAPI.fetchMatchCommentary(matchId);
            renderCommentary(commPanel, balls);
        } catch (_) {
            renderCommentary(commPanel, []);
        }
    }

    /** Render ball-by-ball commentary entries into the commentary panel */
    function renderCommentary(commPanel, balls) {
        if (!Array.isArray(balls) || balls.length === 0) {
            commPanel.innerHTML = `
            <div class="sc-wrap">
                <p class="sc-note">Ball-by-ball commentary available on:</p>
                <div class="sc-links">
                    <a class="sc-link" href="https://www.cricbuzz.com"     target="_blank" rel="noopener noreferrer">Cricbuzz</a>
                    <a class="sc-link" href="https://www.espncricinfo.com" target="_blank" rel="noopener noreferrer">ESPNcricinfo</a>
                </div>
            </div>`;
            return;
        }

        // Show most recent balls first (reverse chronological like Crex)
        const recent = [...balls].reverse().slice(0, 50);

        let html = '<div class="sc-wrap sc-commentary-feed">';
        recent.forEach(ball => {
            const over     = ball.over   != null ? ball.over   : (ball.overs || '');
            const ballNum  = ball.ball   != null ? ball.ball   : '';
            const text     = ball.commText || ball.text || ball.commentary || '';
            const runs     = ball.runs   != null ? ball.runs   : (ball.r || '');
            const isWkt    = ball.wicket || /wicket|out|lbw|caught|bowled|stumped|run out/i.test(text);
            const isSix    = String(runs) === '6' || /six/i.test(text);
            const isFour   = String(runs) === '4' || /four/i.test(text);

            const ballClass = isWkt  ? 'sc-comm-ball sc-comm-ball--wicket'
                            : isSix  ? 'sc-comm-ball sc-comm-ball--six'
                            : isFour ? 'sc-comm-ball sc-comm-ball--four'
                            : 'sc-comm-ball';

            const runLabel = isWkt ? 'W' : (runs !== '' ? String(runs) : '·');

            html += `
            <div class="sc-comm-item${isWkt ? ' sc-comm-item--wicket' : ''}">
                <div class="sc-comm-meta">
                    <span class="${ballClass}">${runLabel}</span>
                    ${over !== '' || ballNum !== '' ? `<span class="sc-comm-over">${over}${ballNum !== '' ? `.${ballNum}` : ''}</span>` : ''}
                </div>
                <p class="sc-comm-text">${text || '—'}</p>
            </div>`;
        });
        html += '</div>';
        commPanel.innerHTML = html;
    }

    /** @deprecated kept for backward compatibility — use renderScorecardTabs */
    function renderScorecard(panel, info) {
        renderScorecardTabs(panel, info, null);
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
