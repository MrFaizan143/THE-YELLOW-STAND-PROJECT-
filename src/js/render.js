/**
 * render.js — TYS 2026 Rendering Engine
 * Responsible for all DOM construction from DATA.
 * No app logic or routing here — pure view layer.
 */

const Render = (() => {

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

    /** Renders H2H cards into #h2h-content */
    function h2h() {
        const container = document.getElementById('h2h-content');
        if (!container) return;

        const active  = DATA.h2h.filter(r => !r.short.endsWith('*'));
        const defunct = DATA.h2h.filter(r =>  r.short.endsWith('*'));

        function makeCard(r) {
            const winPct = r.played > 0 ? Math.round((r.wins / r.played) * 100) : 0;
            return `
                <div class="h2h-card">
                    <div class="h2h-header">
                        <span class="h2h-team">${r.team}</span>
                        <span class="h2h-short">${r.short}</span>
                    </div>
                    <div class="h2h-stats">
                        <div class="h2h-stat">
                            <span class="h2h-stat-value">${r.played}</span>
                            <span class="h2h-stat-label">Played</span>
                        </div>
                        <div class="h2h-stat h2h-win">
                            <span class="h2h-stat-value">${r.wins}</span>
                            <span class="h2h-stat-label">Wins</span>
                        </div>
                        <div class="h2h-stat h2h-loss">
                            <span class="h2h-stat-value">${r.losses}</span>
                            <span class="h2h-stat-label">Losses</span>
                        </div>
                        <div class="h2h-stat">
                            <span class="h2h-stat-value">${winPct}%</span>
                            <span class="h2h-stat-label">Win %</span>
                        </div>
                    </div>
                    <div class="h2h-bar-track" aria-hidden="true">
                        <div class="h2h-bar-fill" style="width:${winPct}%"></div>
                    </div>
                    <p class="h2h-moment">${r.moment}</p>
                </div>
            `;
        }

        let html = active.map(makeCard).join('');
        html += `<h2 class="h2h-section-title">Historical (Defunct Teams)</h2>`;
        html += defunct.map(makeCard).join('');

        container.innerHTML = html;
    }

    /** Public API */
    return { fixtures, squad, h2h };

})();
