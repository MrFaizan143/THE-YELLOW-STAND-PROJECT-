/**
 * render.js — TYS 2026 Rendering Engine
 * Responsible for all DOM construction from DATA.
 * No app logic or routing here — pure view layer.
 */

const Render = (() => {

    /** Renders the fixture list into #fixture-list with result tracking */
    function fixtures() {
        const container = document.getElementById('fixture-list');
        if (!container) return;

        const savedResults = Results.load();
        const nextIdx      = Results.nextFixtureIndex();

        container.innerHTML = DATA.fixtures.map((f, i) => {
            const result  = savedResults[i];
            const isNext  = i === nextIdx;
            const classes = ['fixture-item',
                isNext         ? 'fixture-next'   : '',
                result === 'W' ? 'result-win'      : '',
                result === 'L' ? 'result-loss'     : '',
                result === 'N' ? 'result-nr'       : ''
            ].filter(Boolean).join(' ');

            const resultLabel = result === 'W' ? 'W' :
                                result === 'L' ? 'L' :
                                result === 'N' ? 'NR' : '+';

            const resultTitle = result === 'W' ? 'Win'  :
                                result === 'L' ? 'Loss' :
                                result === 'N' ? 'No Result' : 'Tap to record result';

            return `
            <div class="${classes}" role="listitem" data-idx="${i}">
                ${isNext ? '<span class="next-badge">NEXT</span>' : ''}
                <div class="fixture-info">
                    <p class="opponent">${f.o}</p>
                    <p class="venue">${f.v}</p>
                    <p class="broadcast">${f.b}</p>
                </div>
                <div class="fixture-right">
                    <div class="fixture-meta">
                        <p class="date">${f.d}</p>
                        <p class="time">${f.t} IST</p>
                    </div>
                    <button class="result-btn${result ? ' has-result' : ''}"
                            aria-label="${resultTitle}"
                            title="${resultTitle}">${resultLabel}</button>
                </div>
            </div>`;
        }).join('');

        // Bind result-button click events
        container.querySelectorAll('.result-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx    = parseInt(btn.closest('.fixture-item').dataset.idx, 10);
                const newVal = Results.cycle(idx);
                updateFixtureRow(container, idx, newVal);
                updateHubRecord();
            });
        });
    }

    /** Re-renders a single fixture row's result state without full re-render */
    function updateFixtureRow(container, idx, result) {
        const row = container.querySelector(`.fixture-item[data-idx="${idx}"]`);
        if (!row) return;

        row.classList.remove('result-win', 'result-loss', 'result-nr');
        if (result === 'W') row.classList.add('result-win');
        if (result === 'L') row.classList.add('result-loss');
        if (result === 'N') row.classList.add('result-nr');

        const btn = row.querySelector('.result-btn');
        if (btn) {
            btn.textContent = result === 'W' ? 'W' :
                              result === 'L' ? 'L' :
                              result === 'N' ? 'NR' : '+';
            btn.title      = result === 'W' ? 'Win'  :
                             result === 'L' ? 'Loss' :
                             result === 'N' ? 'No Result' : 'Tap to record result';
            btn.classList.toggle('has-result', !!result);
        }
    }

    /** Updates the W-L record chip on the Hub page */
    function updateHubRecord() {
        const el = document.getElementById('hub-record');
        if (!el) return;
        const { W, L, N } = Results.tally();
        el.textContent = N > 0 ? `${W}W · ${L}L · ${N}NR` : `${W}W · ${L}L`;
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
    return { fixtures, squad, updateHubRecord };

})();
