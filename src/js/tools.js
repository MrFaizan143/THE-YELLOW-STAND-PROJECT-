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

