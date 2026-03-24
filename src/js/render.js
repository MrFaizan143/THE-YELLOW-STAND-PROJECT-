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

    /** Public API */
    return { fixtures, squad };

})();
