/**
 * render.js — TYS 2026 Rendering Engine
 * Responsible for all DOM construction from DATA.
 * No app logic or routing here — pure view layer.
 */

const Render = (() => {

    /** Renders the match centre into #mc-content */
    function matchCentre() {
        const container = document.getElementById('mc-content');
        if (!container) return;
        const mc = DATA.matchCentre;

        // ── Score header ──────────────────────────────────────────────────────
        const headerHtml = `
            <div class="mc-header">
                ${mc.live ? '<span class="mc-live-badge"><span class="mc-live-dot" aria-hidden="true"></span>LIVE</span>' : ''}
                <p class="mc-match-info">${mc.match} · ${mc.venue}</p>
                <div class="mc-score-block">
                    <span class="mc-team">${mc.batting.team}</span>
                    <span class="mc-score">${mc.batting.runs}/${mc.batting.wickets}</span>
                </div>
                <p class="mc-overs">${mc.batting.overs} OV · CRR: ${mc.batting.crr}</p>
                ${mc.target ? (() => {
                    const [ov, balls] = mc.batting.overs.split('.').map(Number);
                    const remaining = (20 * 6) - (ov * 6 + (balls || 0));
                    return `<p class="mc-target">Need ${mc.target - mc.batting.runs} from ${remaining} balls</p>`;
                })() : ''}
            </div>
        `;

        // ── Current batters ───────────────────────────────────────────────────
        const battersHtml = `
            <div class="mc-batters">
                ${mc.batters.map(b => `
                    <div class="mc-batter-card">
                        <p class="mc-batter-name">${b.name}</p>
                        <p class="mc-batter-runs">${b.runs}<span class="mc-batter-balls">(${b.balls})</span></p>
                        <p class="mc-batter-detail">${b.fours}×4 · ${b.sixes}×6</p>
                    </div>
                `).join('')}
            </div>
        `;

        // ── Ball-by-ball ──────────────────────────────────────────────────────
        // Group deliveries by over; data arrives most-recent-first per over.
        const overMap = {};
        mc.ballByBall.forEach(b => {
            if (!overMap[b.over]) overMap[b.over] = [];
            overMap[b.over].push(b);
        });
        // Reverse within each over so balls render left→right (chronological).
        Object.keys(overMap).forEach(k => overMap[k].reverse());
        const overKeys = Object.keys(overMap).sort((a, b) => parseInt(b) - parseInt(a));

        const bbbHtml = `
            <h3 class="mc-section-title">Ball by Ball</h3>
            <div class="mc-bbb">
                ${overKeys.map(ov => `
                    <div class="mc-over-row">
                        <span class="mc-over-label">Ov ${ov}</span>
                        <div class="mc-balls">
                            ${overMap[ov].map(b => {
                                const cls = b.type === 'boundary' ? 'mc-ball--four'
                                          : b.type === 'six'      ? 'mc-ball--six'
                                          : b.type === 'wicket'   ? 'mc-ball--wicket'
                                          : b.runs > 0            ? 'mc-ball--run'
                                          :                         'mc-ball--dot';
                                return `<span class="mc-ball ${cls}" title="${b.desc}">${b.type === 'wicket' ? 'W' : b.runs}</span>`;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // ── Wagon wheel (SVG) ─────────────────────────────────────────────────
        const W = 260, H = 260, cx = 130, cy = 130;
        const boundaryR = 112, innerR = 67;
        const colorForRuns = r => r === 6 ? '#ff6b35'
                                : r === 4 ? '#FDB913'
                                : r >= 1  ? '#cccccc'
                                :           '#3a3a3a';

        const shots = mc.wagonWheel.map(s => {
            const rad = s.angle * Math.PI / 180;
            const x2 = (cx + Math.sin(rad) * s.dist * boundaryR).toFixed(1);
            const y2 = (cy - Math.cos(rad) * s.dist * boundaryR).toFixed(1);
            const color = colorForRuns(s.runs);
            const sw = s.runs === 6 ? 2.5 : s.runs === 4 ? 2 : 1.5;
            const dotR = s.runs >= 4 ? 3.5 : 2.5;
            return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" opacity="0.85"/>
                    <circle cx="${x2}" cy="${y2}" r="${dotR}" fill="${color}"/>`;
        }).join('');

        const wwHtml = `
            <h3 class="mc-section-title">Wagon Wheel</h3>
            <div class="mc-wagon-wrap">
                <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
                     class="mc-wagon-svg" role="img" aria-label="Wagon wheel shot chart">
                    <ellipse cx="${cx}" cy="${cy}" rx="${boundaryR}" ry="${(boundaryR * 0.78).toFixed(0)}"
                             fill="#0a0a0a" stroke="#1e1e1e" stroke-width="1.5"/>
                    <ellipse cx="${cx}" cy="${cy}" rx="${innerR}" ry="${(innerR * 0.78).toFixed(0)}"
                             fill="none" stroke="#1e1e1e" stroke-width="1" stroke-dasharray="4 3"/>
                    <rect x="${cx - 7}" y="${cy - 28}" width="14" height="56" fill="#1a130a" rx="3"/>
                    <rect x="${cx - 6}" y="${cy - 30}" width="12" height="2" fill="#555" rx="1"/>
                    <rect x="${cx - 6}" y="${cy + 28}" width="12" height="2" fill="#555" rx="1"/>
                    ${shots}
                    <circle cx="${cx}" cy="${cy}" r="5" fill="#FDB913" opacity="0.9"/>
                </svg>
                <div class="mc-wagon-legend">
                    <span class="mc-legend-item"><span class="mc-legend-dot" style="background:#3a3a3a"></span>Dot</span>
                    <span class="mc-legend-item"><span class="mc-legend-dot" style="background:#ccc"></span>1–3</span>
                    <span class="mc-legend-item"><span class="mc-legend-dot" style="background:#FDB913"></span>Four</span>
                    <span class="mc-legend-item"><span class="mc-legend-dot" style="background:#ff6b35"></span>Six</span>
                </div>
            </div>
        `;

        // ── Batting scorecard ─────────────────────────────────────────────────
        const sr = (r, b) => b > 0 ? ((r / b) * 100).toFixed(1) : '—';
        const allBatters = [
            ...mc.batters.map(b => ({ ...b, active: true })),
            ...mc.scorecard.map(b => ({ ...b, active: false }))
        ];

        const scorecardHtml = `
            <h3 class="mc-section-title">Batting</h3>
            <div class="mc-table-wrap">
                <table class="mc-table">
                    <thead>
                        <tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr>
                    </thead>
                    <tbody>
                        ${allBatters.map(b => `
                            <tr class="${b.active ? 'mc-row-active' : ''}">
                                <td>
                                    <span class="mc-batter-tname">${b.name}</span>
                                    ${b.how ? `<span class="mc-dismissal">${b.how}</span>` : ''}
                                </td>
                                <td class="mc-num">${b.runs}</td>
                                <td class="mc-num mc-muted">${b.balls}</td>
                                <td class="mc-num mc-muted">${b.fours || 0}</td>
                                <td class="mc-num mc-muted">${b.sixes || 0}</td>
                                <td class="mc-num">${sr(b.runs, b.balls)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // ── Bowling ───────────────────────────────────────────────────────────
        const bowlingHtml = `
            <h3 class="mc-section-title">Bowling</h3>
            <div class="mc-table-wrap">
                <table class="mc-table">
                    <thead>
                        <tr><th>Bowler</th><th>O</th><th>R</th><th>W</th><th>Econ</th></tr>
                    </thead>
                    <tbody>
                        ${mc.bowling.map(b => `
                            <tr>
                                <td class="mc-batter-tname">${b.name}</td>
                                <td class="mc-num mc-muted">${b.o}</td>
                                <td class="mc-num mc-muted">${b.r}</td>
                                <td class="mc-num ${b.w > 0 ? 'mc-wicket-highlight' : ''}">${b.w}</td>
                                <td class="mc-num">${b.econ}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = headerHtml + battersHtml + bbbHtml + wwHtml + scorecardHtml + bowlingHtml;
    }

    /** Renders the fixture list into #fixture-list */
    function fixtures() {
        const container = document.getElementById('fixture-list');
        if (!container) return;

        container.innerHTML = DATA.fixtures.map(f => `
            <div class="fixture-item" role="listitem">
                <div>
                    <p class="opponent">${f.o}</p>
                    <p class="venue">${f.v}</p>
                </div>
                <p class="date">${f.d}</p>
            </div>
        `).join('');
    }

    /** Renders squad grid + staff list into #squad-content */
    function squad() {
        const container = document.getElementById('squad-content');
        if (!container) return;

        let html = '';

        // Player categories
        for (const [category, players] of Object.entries(DATA.squad)) {
            html += `<h2 class="squad-category-title">${category}</h2>`;
            html += `<div class="grid">`;
            html += players.map(player => `
                <div class="card">
                    <p class="name">${player}</p>
                </div>
            `).join('');
            html += `</div>`;
        }

        // Support staff
        html += `<h2 class="squad-category-title">Support Staff</h2>`;
        html += DATA.staff.map(([role, name]) => `
            <div class="staff-item">
                <span class="staff-role">${role}</span>
                <span>${name}</span>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    /** Public API */
    return { fixtures, squad, matchCentre };

})();
