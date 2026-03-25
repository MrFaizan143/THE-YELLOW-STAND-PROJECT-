/**
 * tools.js — TYS 2026 Cricket Toolkit
 * Renders the Tools page: Run Rate Calculator, NRR Calculator, and Free Cricket Resources.
 */

const Tools = (() => {

    /** Format a decimal overs value (e.g. 14.3 → 14 overs 3 balls) */
    function oversToDecimal(overs, balls) {
        const o = parseInt(overs, 10)  || 0;
        const b = parseInt(balls, 10)  || 0;
        const safeBalls = Math.min(b, 5);   // 6 balls per over max 0-5
        return o + safeBalls / 6;
    }

    /** Round to 2 decimal places, return string */
    function fmt(n) {
        return isFinite(n) ? n.toFixed(2) : '—';
    }

    /** Reset all inputs inside a tool card and clear its result display(s) */
    function resetCard(cardEl) {
        cardEl.querySelectorAll('.tool-input').forEach(inp => { inp.value = ''; });
        cardEl.querySelectorAll('.tool-result').forEach(el => { el.textContent = '—'; });
    }

    /** Build and inject the full Tools page HTML */
    function render() {
        const container = document.getElementById('tools-content');
        if (!container) return;

        // Build player options for comparison tool
        const playerNames = DATA.playerDetails ? Object.keys(DATA.playerDetails) : [];
        const playerOpts  = playerNames.map(n =>
            `<option value="${n}">${n}</option>`
        ).join('');

        container.innerHTML = `

            <!-- ── Run Rate Calculator ──────────────────────────────── -->
            <h2 class="section-heading" aria-label="Run Rate Calculator">Run Rate Calculator</h2>

            <!-- CRR -->
            <div class="tool-card" aria-label="Current Run Rate calculator">
                <p class="tag">Current Run Rate</p>
                <p class="tool-desc">How fast is the batting side scoring?</p>
                <div class="tool-fields">
                    <div class="tool-field">
                        <label class="tool-label" for="crr-runs">Runs Scored</label>
                        <input id="crr-runs" class="tool-input" type="number" min="0" placeholder="e.g. 120" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="crr-overs">Overs</label>
                        <input id="crr-overs" class="tool-input" type="number" min="0" placeholder="14" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="crr-balls">Balls</label>
                        <input id="crr-balls" class="tool-input" type="number" min="0" max="5" placeholder="3" inputmode="numeric">
                    </div>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">CRR</span>
                    <span class="tool-result" id="crr-result">—</span>
                </div>
                <button class="tool-reset-btn" data-card="crr" aria-label="Reset CRR calculator">Reset</button>
            </div>

            <!-- RRR -->
            <div class="tool-card" aria-label="Required Run Rate calculator">
                <p class="tag">Required Run Rate</p>
                <p class="tool-desc">How many runs per over does the chasing side need?</p>
                <div class="tool-fields">
                    <div class="tool-field">
                        <label class="tool-label" for="rrr-target">Target</label>
                        <input id="rrr-target" class="tool-input" type="number" min="1" placeholder="e.g. 185" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="rrr-scored">Scored</label>
                        <input id="rrr-scored" class="tool-input" type="number" min="0" placeholder="e.g. 60" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="rrr-rem-overs">Overs Left</label>
                        <input id="rrr-rem-overs" class="tool-input" type="number" min="0" placeholder="12" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="rrr-rem-balls">Balls Left</label>
                        <input id="rrr-rem-balls" class="tool-input" type="number" min="0" max="5" placeholder="0" inputmode="numeric">
                    </div>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">Runs Needed</span>
                    <span class="tool-result" id="rrr-runs-needed">—</span>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">RRR</span>
                    <span class="tool-result" id="rrr-result">—</span>
                </div>
                <button class="tool-reset-btn" data-card="rrr" aria-label="Reset RRR calculator">Reset</button>
            </div>

            <!-- ── NRR Calculator ────────────────────────────────────── -->
            <h2 class="section-heading" aria-label="Net Run Rate Calculator">Net Run Rate</h2>

            <div class="tool-card" aria-label="Net Run Rate calculator">
                <p class="tag">Net Run Rate</p>
                <p class="tool-desc">NRR = (Runs scored ÷ Overs faced) − (Runs conceded ÷ Overs bowled)</p>
                <div class="tool-nrr-group">
                    <p class="tool-nrr-label">Batting innings</p>
                    <div class="tool-fields">
                        <div class="tool-field">
                            <label class="tool-label" for="nrr-scored">Runs Scored</label>
                            <input id="nrr-scored" class="tool-input" type="number" min="0" placeholder="e.g. 165" inputmode="numeric">
                        </div>
                        <div class="tool-field">
                            <label class="tool-label" for="nrr-overs">Overs Faced</label>
                            <input id="nrr-overs" class="tool-input" type="number" min="0" placeholder="20" inputmode="numeric">
                        </div>
                        <div class="tool-field">
                            <label class="tool-label" for="nrr-balls">Balls</label>
                            <input id="nrr-balls" class="tool-input" type="number" min="0" max="5" placeholder="0" inputmode="numeric">
                        </div>
                    </div>
                </div>
                <div class="tool-nrr-group">
                    <p class="tool-nrr-label">Bowling innings</p>
                    <div class="tool-fields">
                        <div class="tool-field">
                            <label class="tool-label" for="nrr-conceded">Runs Conceded</label>
                            <input id="nrr-conceded" class="tool-input" type="number" min="0" placeholder="e.g. 145" inputmode="numeric">
                        </div>
                        <div class="tool-field">
                            <label class="tool-label" for="nrr-bowled">Overs Bowled</label>
                            <input id="nrr-bowled" class="tool-input" type="number" min="0" placeholder="20" inputmode="numeric">
                        </div>
                        <div class="tool-field">
                            <label class="tool-label" for="nrr-bowled-balls">Balls</label>
                            <input id="nrr-bowled-balls" class="tool-input" type="number" min="0" max="5" placeholder="0" inputmode="numeric">
                        </div>
                    </div>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">NRR</span>
                    <span class="tool-result" id="nrr-result">—</span>
                </div>
                <button class="tool-reset-btn" data-card="nrr" aria-label="Reset NRR calculator">Reset</button>
            </div>

            <!-- ── Batting Stats Calculator ─────────────────────────── -->
            <h2 class="section-heading" aria-label="Batting Statistics">Batting Stats</h2>

            <div class="tool-card" aria-label="Batting statistics calculator">
                <p class="tag">Batting Stats</p>
                <p class="tool-desc">Calculate batting average and strike rate.</p>
                <div class="tool-fields">
                    <div class="tool-field">
                        <label class="tool-label" for="bat-runs">Total Runs</label>
                        <input id="bat-runs" class="tool-input" type="number" min="0" placeholder="e.g. 450" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="bat-dismissals">Dismissals</label>
                        <input id="bat-dismissals" class="tool-input" type="number" min="0" placeholder="e.g. 10" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="bat-balls">Balls Faced</label>
                        <input id="bat-balls" class="tool-input" type="number" min="0" placeholder="e.g. 350" inputmode="numeric">
                    </div>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">Batting Average</span>
                    <span class="tool-result" id="bat-avg-result">—</span>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">Strike Rate</span>
                    <span class="tool-result" id="bat-sr-result">—</span>
                </div>
                <button class="tool-reset-btn" data-card="bat" aria-label="Reset batting stats calculator">Reset</button>
            </div>

            <!-- ── Bowling Stats Calculator ──────────────────────────── -->
            <h2 class="section-heading" aria-label="Bowling Statistics">Bowling Stats</h2>

            <div class="tool-card" aria-label="Bowling statistics calculator">
                <p class="tag">Bowling Stats</p>
                <p class="tool-desc">Calculate bowling average, economy rate, and strike rate.</p>
                <div class="tool-fields">
                    <div class="tool-field">
                        <label class="tool-label" for="bowl-runs">Runs Conceded</label>
                        <input id="bowl-runs" class="tool-input" type="number" min="0" placeholder="e.g. 320" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="bowl-wickets">Wickets</label>
                        <input id="bowl-wickets" class="tool-input" type="number" min="0" placeholder="e.g. 12" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="bowl-overs">Overs Bowled</label>
                        <input id="bowl-overs" class="tool-input" type="number" min="0" placeholder="e.g. 40" inputmode="numeric">
                    </div>
                    <div class="tool-field">
                        <label class="tool-label" for="bowl-balls">Balls</label>
                        <input id="bowl-balls" class="tool-input" type="number" min="0" max="5" placeholder="0" inputmode="numeric">
                    </div>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">Bowling Average</span>
                    <span class="tool-result" id="bowl-avg-result">—</span>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">Economy Rate</span>
                    <span class="tool-result" id="bowl-eco-result">—</span>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">Bowling Strike Rate</span>
                    <span class="tool-result" id="bowl-sr-result">—</span>
                </div>
                <button class="tool-reset-btn" data-card="bowl" aria-label="Reset bowling stats calculator">Reset</button>
            </div>

            <!-- ── Par Score (Simplified D/L) Calculator ─────────────── -->
            <h2 class="section-heading" aria-label="Par Score Calculator">Par Score</h2>

            <div class="tool-card" aria-label="Par score calculator">
                <p class="tag">Par Score Estimator</p>
                <p class="tool-desc">Estimate the revised D/L par score after a rain interruption (simplified linear model).</p>
                <div class="tool-nrr-group">
                    <p class="tool-nrr-label">Team 1 innings</p>
                    <div class="tool-fields">
                        <div class="tool-field">
                            <label class="tool-label" for="par-t1-score">Team 1 Score</label>
                            <input id="par-t1-score" class="tool-input" type="number" min="0" placeholder="e.g. 180" inputmode="numeric">
                        </div>
                        <div class="tool-field">
                            <label class="tool-label" for="par-t1-overs">Overs Batted</label>
                            <input id="par-t1-overs" class="tool-input" type="number" min="1" max="50" placeholder="20" inputmode="numeric">
                        </div>
                    </div>
                </div>
                <div class="tool-nrr-group">
                    <p class="tool-nrr-label">Team 2 revised innings</p>
                    <div class="tool-fields">
                        <div class="tool-field">
                            <label class="tool-label" for="par-t2-overs">Overs Available</label>
                            <input id="par-t2-overs" class="tool-input" type="number" min="1" max="50" placeholder="15" inputmode="numeric">
                        </div>
                    </div>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">Par Score</span>
                    <span class="tool-result" id="par-result">—</span>
                </div>
                <div class="tool-result-row">
                    <span class="tool-result-label">Revised Target</span>
                    <span class="tool-result" id="par-target">—</span>
                </div>
                <p class="tool-disclaimer">⚠ Simplified linear estimate. Official results use the full DLS resource tables.</p>
                <button class="tool-reset-btn" data-card="par" aria-label="Reset par score calculator">Reset</button>
            </div>

            <!-- ── Player Comparison ─────────────────────────────────── -->
            <h2 class="section-heading" aria-label="Player Comparison">Player Comparison</h2>

            <div class="tool-card compare-card" aria-label="CSK player comparison tool">
                <p class="tag">Compare Players</p>
                <p class="tool-desc">Select two CSK squad members to compare their profile side by side.</p>
                <div class="compare-selects">
                    <select id="compare-p1" class="fan-select compare-select" aria-label="Player 1">
                        <option value="">— Player 1 —</option>
                        ${playerOpts}
                    </select>
                    <span class="compare-vs" aria-hidden="true">VS</span>
                    <select id="compare-p2" class="fan-select compare-select" aria-label="Player 2">
                        <option value="">— Player 2 —</option>
                        ${playerOpts}
                    </select>
                </div>
                <div id="compare-result" class="compare-result" aria-live="polite" aria-label="Comparison result"></div>
            </div>

            <!-- ── Free Cricket Resources ───────────────────────────── -->
            <h2 class="section-heading" aria-label="Free Cricket Resources">Free Cricket Resources</h2>

            <div class="resource-grid">

                <a class="resource-card" href="https://www.espncricinfo.com" target="_blank" rel="noopener noreferrer"
                   aria-label="ESPNcricinfo — stats and analysis">
                    <span class="resource-icon">📊</span>
                    <p class="resource-name">ESPNcricinfo</p>
                    <p class="resource-desc">Live scores, stats, player profiles &amp; in-depth analysis</p>
                </a>

                <a class="resource-card" href="https://www.cricbuzz.com" target="_blank" rel="noopener noreferrer"
                   aria-label="Cricbuzz — live scores and news">
                    <span class="resource-icon">📡</span>
                    <p class="resource-name">Cricbuzz</p>
                    <p class="resource-desc">Real-time ball-by-ball commentary, news &amp; rankings</p>
                </a>

                <a class="resource-card" href="https://www.icc-cricket.com/rankings/mens/player-rankings/odi" target="_blank" rel="noopener noreferrer"
                   aria-label="ICC Rankings — official world cricket rankings">
                    <span class="resource-icon">🏆</span>
                    <p class="resource-name">ICC Rankings</p>
                    <p class="resource-desc">Official men's &amp; women's player and team rankings</p>
                </a>

                <a class="resource-card" href="https://www.iplt20.com" target="_blank" rel="noopener noreferrer"
                   aria-label="IPL Official — Indian Premier League">
                    <span class="resource-icon">🦁</span>
                    <p class="resource-name">IPL Official</p>
                    <p class="resource-desc">Official IPL website — fixtures, points table &amp; team news</p>
                </a>

                <a class="resource-card" href="https://cricsheet.org" target="_blank" rel="noopener noreferrer"
                   aria-label="CricSheet — free ball-by-ball data">
                    <span class="resource-icon">📂</span>
                    <p class="resource-name">CricSheet</p>
                    <p class="resource-desc">Free ball-by-ball match data in YAML &amp; JSON formats</p>
                </a>

                <a class="resource-card" href="https://www.howzat.com" target="_blank" rel="noopener noreferrer"
                   aria-label="Howzat — free fantasy cricket">
                    <span class="resource-icon">🎮</span>
                    <p class="resource-name">Howzat Fantasy</p>
                    <p class="resource-desc">Free fantasy cricket contests — build your dream XI</p>
                </a>

                <a class="resource-card" href="https://www.cricketarchive.com" target="_blank" rel="noopener noreferrer"
                   aria-label="Cricket Archive — historical records">
                    <span class="resource-icon">📜</span>
                    <p class="resource-name">Cricket Archive</p>
                    <p class="resource-desc">Comprehensive historical scorecard &amp; records database</p>
                </a>

                <a class="resource-card" href="https://www.youtube.com/@StarSportsIndia" target="_blank" rel="noopener noreferrer"
                   aria-label="Star Sports YouTube — free highlights">
                    <span class="resource-icon">▶️</span>
                    <p class="resource-name">Star Sports YT</p>
                    <p class="resource-desc">Free match highlights, press conferences &amp; interviews</p>
                </a>

            </div>
        `;

        bindEvents();
    }

    /** Attach live-calculation listeners to all calculator inputs */
    function bindEvents() {

        // ── CRR ─────────────────────────────────────────────────────
        const [runsInput, crrOversInput, crrBallsInput] =
            ['crr-runs', 'crr-overs', 'crr-balls'].map(id => document.getElementById(id));
        const crrResult = document.getElementById('crr-result');

        function calcCRR() {
            const runs  = parseInt(runsInput.value, 10);
            const decOv = oversToDecimal(crrOversInput.value, crrBallsInput.value);
            if (isNaN(runs) || decOv <= 0) { crrResult.textContent = '—'; return; }
            crrResult.textContent = fmt(runs / decOv);
        }

        [runsInput, crrOversInput, crrBallsInput].forEach(inp => inp.addEventListener('input', calcCRR));

        // ── RRR ─────────────────────────────────────────────────────
        const [targetInput, scoredInput, rrrOversInput, rrrBallsInput] =
            ['rrr-target', 'rrr-scored', 'rrr-rem-overs', 'rrr-rem-balls']
                .map(id => document.getElementById(id));
        const rrrRunsEl = document.getElementById('rrr-runs-needed');
        const rrrResult = document.getElementById('rrr-result');

        function calcRRR() {
            const target  = parseInt(targetInput.value, 10);
            const scored  = parseInt(scoredInput.value, 10) || 0;
            const decLeft = oversToDecimal(rrrOversInput.value, rrrBallsInput.value);

            if (isNaN(target) || target <= 0) {
                rrrRunsEl.textContent = '—';
                rrrResult.textContent = '—';
                return;
            }

            const needed = target - scored;
            rrrRunsEl.textContent = needed > 0 ? needed : '0';

            if (needed <= 0) {
                rrrResult.textContent = '0.00';
            } else if (decLeft <= 0) {
                rrrResult.textContent = '—';
            } else {
                rrrResult.textContent = fmt(needed / decLeft);
            }
        }

        [targetInput, scoredInput, rrrOversInput, rrrBallsInput]
            .forEach(inp => inp.addEventListener('input', calcRRR));

        // ── NRR ─────────────────────────────────────────────────────
        const nrrInputIds = ['nrr-scored', 'nrr-overs', 'nrr-balls',
                             'nrr-conceded', 'nrr-bowled', 'nrr-bowled-balls'];
        const [nrrScored, nrrOvers, nrrBalls, nrrConceded, nrrBowled, nrrBowledBalls] =
            nrrInputIds.map(id => document.getElementById(id));
        const nrrResult = document.getElementById('nrr-result');

        function calcNRR() {
            const scored    = parseInt(nrrScored.value, 10);
            const decFaced  = oversToDecimal(nrrOvers.value, nrrBalls.value);
            const conceded  = parseInt(nrrConceded.value, 10);
            const decBowled = oversToDecimal(nrrBowled.value, nrrBowledBalls.value);

            if (isNaN(scored) || isNaN(conceded) || decFaced <= 0 || decBowled <= 0) {
                nrrResult.textContent = '—';
                return;
            }

            const nrr = (scored / decFaced) - (conceded / decBowled);
            nrrResult.textContent = (nrr >= 0 ? '+' : '') + fmt(nrr);
            nrrResult.style.color = nrr >= 0
                ? '#4ade80'
                : '#f87171';
        }

        [nrrScored, nrrOvers, nrrBalls, nrrConceded, nrrBowled, nrrBowledBalls]
            .forEach(inp => inp.addEventListener('input', calcNRR));

        // ── Batting Stats ────────────────────────────────────────────
        const batRuns       = document.getElementById('bat-runs');
        const batDismissals = document.getElementById('bat-dismissals');
        const batBalls      = document.getElementById('bat-balls');
        const batAvgResult  = document.getElementById('bat-avg-result');
        const batSrResult   = document.getElementById('bat-sr-result');

        function calcBatStats() {
            const runs  = parseInt(batRuns.value, 10);
            const dism  = parseInt(batDismissals.value, 10);
            const balls = parseInt(batBalls.value, 10);

            batAvgResult.textContent = (!isNaN(runs) && !isNaN(dism) && dism > 0)
                ? fmt(runs / dism)
                : '—';

            batSrResult.textContent = (!isNaN(runs) && !isNaN(balls) && balls > 0)
                ? fmt((runs / balls) * 100)
                : '—';
        }

        [batRuns, batDismissals, batBalls].forEach(inp => inp.addEventListener('input', calcBatStats));

        // ── Bowling Stats ────────────────────────────────────────────
        const bowlRuns     = document.getElementById('bowl-runs');
        const bowlWickets  = document.getElementById('bowl-wickets');
        const bowlOvers    = document.getElementById('bowl-overs');
        const bowlBalls    = document.getElementById('bowl-balls');
        const bowlAvgRes   = document.getElementById('bowl-avg-result');
        const bowlEcoRes   = document.getElementById('bowl-eco-result');
        const bowlSrRes    = document.getElementById('bowl-sr-result');

        function calcBowlStats() {
            const runs     = parseInt(bowlRuns.value, 10);
            const wickets  = parseInt(bowlWickets.value, 10);
            const decOvers = oversToDecimal(bowlOvers.value, bowlBalls.value);
            const totalBalls = decOvers > 0 ? Math.round(decOvers * 6) : 0;

            bowlAvgRes.textContent = (!isNaN(runs) && !isNaN(wickets) && wickets > 0)
                ? fmt(runs / wickets)
                : '—';

            bowlEcoRes.textContent = (!isNaN(runs) && decOvers > 0)
                ? fmt(runs / decOvers)
                : '—';

            bowlSrRes.textContent  = (!isNaN(wickets) && wickets > 0 && totalBalls > 0)
                ? fmt(totalBalls / wickets)
                : '—';
        }

        [bowlRuns, bowlWickets, bowlOvers, bowlBalls]
            .forEach(inp => inp.addEventListener('input', calcBowlStats));

        // ── Par Score ────────────────────────────────────────────────
        const parT1Score  = document.getElementById('par-t1-score');
        const parT1Overs  = document.getElementById('par-t1-overs');
        const parT2Overs  = document.getElementById('par-t2-overs');
        const parResult   = document.getElementById('par-result');
        const parTarget   = document.getElementById('par-target');

        function calcPar() {
            const t1Score = parseInt(parT1Score.value, 10);
            const t1Overs = parseFloat(parT1Overs.value);
            const t2Overs = parseFloat(parT2Overs.value);

            if (isNaN(t1Score) || isNaN(t1Overs) || isNaN(t2Overs)
                    || t1Overs <= 0 || t2Overs <= 0) {
                parResult.textContent = '—';
                parTarget.textContent = '—';
                return;
            }

            // Simplified linear resource model: par proportional to overs ratio
            const par    = Math.round(t1Score * (t2Overs / t1Overs));
            const target = par + 1;

            parResult.textContent = par.toString();
            parTarget.textContent = target.toString();
        }

        [parT1Score, parT1Overs, parT2Overs].forEach(inp => inp.addEventListener('input', calcPar));

        // ── Player Comparison ────────────────────────────────────────
        const sel1       = document.getElementById('compare-p1');
        const sel2       = document.getElementById('compare-p2');
        const compareRes = document.getElementById('compare-result');

        function renderComparison() {
            const p1Name = sel1 ? sel1.value : '';
            const p2Name = sel2 ? sel2.value : '';

            if (!compareRes) return;

            if (!p1Name || !p2Name) {
                compareRes.innerHTML = '';
                return;
            }

            if (p1Name === p2Name) {
                compareRes.innerHTML = '<p class="compare-same-warning">Select two different players to compare.</p>';
                return;
            }

            const d1 = (DATA.playerDetails && DATA.playerDetails[p1Name]) || {};
            const d2 = (DATA.playerDetails && DATA.playerDetails[p2Name]) || {};

            function statRow(label, v1, v2) {
                return `
                <div class="compare-stat-row">
                    <span class="compare-stat-val">${v1 || '—'}</span>
                    <span class="compare-stat-label">${label}</span>
                    <span class="compare-stat-val">${v2 || '—'}</span>
                </div>`;
            }

            compareRes.innerHTML = `
                <div class="compare-grid" aria-label="Player comparison">
                    <div class="compare-player-col compare-player-col--left">
                        <p class="compare-player-flag" aria-hidden="true">${d1.flag || '🏏'}</p>
                        <p class="compare-player-name">${p1Name}</p>
                    </div>
                    <div class="compare-player-col compare-player-col--right">
                        <p class="compare-player-flag" aria-hidden="true">${d2.flag || '🏏'}</p>
                        <p class="compare-player-name">${p2Name}</p>
                    </div>
                </div>
                <div class="compare-stats">
                    ${statRow('Nationality',      d1.nat,              d2.nat)}
                    ${statRow('Role',              d1.role,             d2.role)}
                    ${statRow('Jersey No.',        d1.jersey != null ? '#' + d1.jersey : null, d2.jersey != null ? '#' + d2.jersey : null)}
                    ${statRow('Age',               d1.age   != null ? d1.age + ' yrs'  : null, d2.age   != null ? d2.age + ' yrs'  : null)}
                    ${statRow('Batting',           d1.bat,              d2.bat)}
                    ${statRow('Bowling',           d1.bowl,             d2.bowl)}
                    ${statRow('Captain/VC',
                        /\(C\)/.test(p1Name) ? 'Captain' : (d1.vc ? 'Vice-captain' : '—'),
                        /\(C\)/.test(p2Name) ? 'Captain' : (d2.vc ? 'Vice-captain' : '—'))}
                </div>`;
        }

        if (sel1) sel1.addEventListener('change', renderComparison);
        if (sel2) sel2.addEventListener('change', renderComparison);

        // ── Reset buttons ────────────────────────────────────────────
        document.querySelectorAll('.tool-reset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                resetCard(btn.closest('.tool-card'));
                // Reset NRR result colour
                const res = btn.closest('.tool-card').querySelector('.tool-result');
                if (res) res.style.color = '';
            });
        });
    }

    /** Public API */
    return { render };

})();

