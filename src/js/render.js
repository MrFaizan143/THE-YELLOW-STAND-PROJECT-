/**
 * render.js — TYS 2026 Rendering Engine
 * Responsible for all DOM construction from DATA.
 * No app logic or routing here — pure view layer.
 */

const Render = (() => {

    /** Short-name lookup for IPL teams */
    const TEAM_SHORT = {
        'Rajasthan Royals':           'RR',
        'Punjab Kings':               'PBKS',
        'Royal Challengers Bengaluru':'RCB',
        'Delhi Capitals':             'DC',
        'Gujarat Titans':             'GT',
        'Sunrisers Hyderabad':        'SRH',
        'Mumbai Indians':             'MI',
        'Kolkata Knight Riders':      'KKR',
        'Lucknow Super Giants':       'LSG'
    };

    /* Expose for other modules (countdown, etc.) */
    window.TEAM_SHORT = TEAM_SHORT;

    /** Currently active fixture filter: 'all' | 'home' | 'away' | 'upcoming' | 'done' */
    let currentFilter = 'all';

    /** Last resolved fixture data (live or static) stored for re-filtering */
    let storedFixtureSource = null;

    /** Show a loading placeholder in #fixture-list */
    function fixturesLoading() {
        const container = document.getElementById('fixture-list');
        if (!container) return;
        container.innerHTML = '<p class="fixtures-status">Loading live fixtures…</p>';
    }

    /** Show an error notice in #fixture-list */
    function fixturesError(message) {
        const container = document.getElementById('fixture-list');
        if (!container) return;
        container.innerHTML = `<p class="fixtures-status fixtures-status--error">${message}</p>`;
    }

    /**
     * Renders the fixture list into #fixture-list with filter bar and result tracking.
     * @param {Array} [liveData] — normalised fixtures from CricketAPI; falls back
     *                             to the static DATA.fixtures when omitted or empty.
     */
    function fixtures(liveData) {
        if (Array.isArray(liveData) && liveData.length > 0) {
            storedFixtureSource = liveData;
        } else if (!storedFixtureSource) {
            storedFixtureSource = DATA.fixtures;
        }
        renderFixtures();
    }

    /** Internal: re-renders the fixture list applying currentFilter */
    function renderFixtures() {
        const container = document.getElementById('fixture-list');
        if (!container) return;

        const source       = storedFixtureSource || DATA.fixtures;
        const savedResults = Results.load();
        const nextIdx      = Results.nextFixtureIndex();
        const now          = Date.now();

        // Apply filter
        const filtered = source.map((f, i) => ({ f, i })).filter(({ f, i }) => {
            const result  = savedResults[i];
            const isPast  = f.iso && new Date(f.iso).getTime() <= now;
            switch (currentFilter) {
                case 'home':     return f.home === true;
                case 'away':     return f.home === false;
                case 'upcoming': return !isPast;
                case 'done':     return isPast || result;
                default:         return true;
            }
        });

        // Filter bar HTML
        const filters = ['all', 'home', 'away', 'upcoming', 'done'];
        const filterBar = `
        <div class="fixture-filters" role="group" aria-label="Filter fixtures">
            ${filters.map(f => `
            <button class="filter-btn${currentFilter === f ? ' filter-btn--active' : ''}"
                    data-filter="${f}" aria-pressed="${currentFilter === f}">${f.charAt(0).toUpperCase() + f.slice(1)}</button>
            `).join('')}
        </div>`;

        if (filtered.length === 0) {
            container.innerHTML = filterBar + '<p class="fixtures-status">No fixtures match this filter.</p>';
            bindFilterButtons(container);
            return;
        }

        const rows = filtered.map(({ f, i }) => {
            const result  = savedResults[i];
            const isNext  = i === nextIdx;
            const isHome  = f.home === true;
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

            const homeBadge = `<span class="fixture-badge fixture-badge--${isHome ? 'home' : 'away'}"
                                     aria-label="${isHome ? 'Home' : 'Away'}">${isHome ? 'HOME' : 'AWAY'}</span>`;

            const calBtn = f.iso
                ? `<a class="cal-btn" href="${buildICS(f)}" download="csk-vs-${f.o.replace(/\s+/g, '-').toLowerCase()}.ics"
                      aria-label="Add to calendar" title="Add to calendar">📅</a>`
                : '';

            return `
            <div class="${classes}" role="listitem" data-idx="${i}">
                ${isNext ? '<span class="next-badge">NEXT</span>' : ''}
                <div class="fixture-info">
                    <div class="fixture-title-row">
                        <p class="opponent">${f.o}</p>
                        ${homeBadge}
                    </div>
                    <p class="venue">${f.v}</p>
                    <p class="broadcast">${f.b}</p>
                </div>
                <div class="fixture-right">
                    <div class="fixture-meta">
                        <p class="date">${f.d}</p>
                        <p class="time">${f.t} IST</p>
                        ${calBtn}
                    </div>
                    <button class="result-btn${result ? ' has-result' : ''}"
                            aria-label="${resultTitle}"
                            title="${resultTitle}">${resultLabel}</button>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = filterBar + `<div class="fixture-rows" role="list">${rows}</div>`;

        bindFilterButtons(container);

        // Bind result-button click events
        container.querySelectorAll('.result-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx    = parseInt(btn.closest('.fixture-item').dataset.idx, 10);
                const newVal = Results.cycle(idx);
                // Refresh the full list (filter may affect visibility)
                renderFixtures();
                updateHubRecord();
                // Refresh Hub last result card live
                lastResult();
                // Refresh Hub venue card in case next fixture changed
                venueInfo();
                // Refresh countdown label
                if (typeof Countdown !== 'undefined') Countdown.updateLabel();
            });
        });

        // Auto-scroll to the next fixture on first render
        const nextRow = container.querySelector('.fixture-next');
        if (nextRow) {
            requestAnimationFrame(() => {
                nextRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }
    }

    /** Binds click handlers on filter buttons inside container */
    function bindFilterButtons(container) {
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentFilter = btn.dataset.filter;
                renderFixtures();
            });
        });
    }

    /** Duration to add when generating .ics DTEND (3.5 hours in ms) */
    const MATCH_DURATION_MS = 3.5 * 3_600_000;

    /**
     * Builds an .ics calendar file content as a data: URI for a fixture.
     * @param {Object} f — fixture object with iso, o, v, b fields.
     * @returns {string} data: URI string.
     */
    function buildICS(f) {
        const start = new Date(f.iso);
        const end   = new Date(start.getTime() + MATCH_DURATION_MS);

        const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//The Yellow Stand//TYS 2026//EN',
            'BEGIN:VEVENT',
            `DTSTART:${fmt(start)}`,
            `DTEND:${fmt(end)}`,
            `SUMMARY:CSK vs ${f.o}`,
            `LOCATION:${f.v}`,
            `DESCRIPTION:IPL 2026 — CSK vs ${f.o} at ${f.v}. Watch on ${f.b}.`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
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

    /**
     * Renders the last result card into #hub-last-result.
     * Auto-derives the most recent result from user-recorded results,
     * falling back to DATA.lastResult when none are recorded yet.
     */
    function lastResult() {
        const container = document.getElementById('hub-last-result');
        if (!container) return;

        const savedResults = Results.load();
        let lr = DATA.lastResult;

        // Find the most recently played fixture with a recorded result
        for (let i = DATA.fixtures.length - 1; i >= 0; i--) {
            const r = savedResults[i];
            if (r) {
                const f = DATA.fixtures[i];
                lr = {
                    opponent: f.o,
                    result: r,
                    score: `${f.d} · ${f.v.split(',')[0].trim()}`
                };
                break;
            }
        }

        const resultClass = lr.result === 'W' ? 'hub-info-result--w'  :
                            lr.result === 'L' ? 'hub-info-result--l' :
                            lr.result === 'N' ? 'hub-info-result--n'   : '';
        const resultLabel = lr.result === 'W' ? 'WIN'         :
                            lr.result === 'L' ? 'LOSS'        :
                            lr.result === 'N' ? 'NO RESULT'   : '—';

        container.innerHTML = `
            <span class="tag">Last Result</span>
            <p class="hub-info-label${resultClass ? ' ' + resultClass : ''}">${resultLabel}</p>
            <p class="hub-info-meta">${lr.opponent !== '—' ? 'vs ' + lr.opponent : '—'}</p>
            <p class="hub-info-score">${lr.score || ''}</p>`;
    }

    /**
     * Renders the next-match venue info card into #hub-venue.
     * Auto-detects the next upcoming fixture from DATA.fixtures.
     */
    function venueInfo() {
        const container = document.getElementById('hub-venue');
        if (!container) return;

        const nextIdx = Results.nextFixtureIndex();
        let venue, city, pitch, weather;

        if (nextIdx >= 0) {
            const f   = DATA.fixtures[nextIdx];
            const vp  = f.v.split(',');
            venue     = vp[0].trim();
            city      = vp.length > 1 ? vp[1].trim() : vp[0].trim();
            // Use static nextMatch pitch/weather for first match, generic otherwise
            if (nextIdx === 0) {
                pitch   = DATA.nextMatch.pitch;
                weather = DATA.nextMatch.weather;
            } else {
                pitch   = 'Pitch info closer to match day';
                weather = 'Weather info closer to match day';
            }
        } else {
            // Season over — show last-known data
            venue   = DATA.nextMatch.venue;
            city    = DATA.nextMatch.city;
            pitch   = '—';
            weather = '—';
        }

        container.innerHTML = `
            <span class="tag">Next Venue</span>
            <p class="hub-info-label">${venue}</p>
            <p class="hub-info-meta">${city}</p>
            <p class="hub-info-score">${pitch}</p>
            <p class="hub-info-score">${weather}</p>`;
    }

    /** Renders squad grid + staff list into #squad-content */
    function squad() {
        const container = document.getElementById('squad-content');
        if (!container) return;

        // Search bar
        let html = `
        <div class="squad-search-wrap">
            <input id="squad-search" class="squad-search-input" type="search"
                   placeholder="Search players…" autocomplete="off"
                   aria-label="Search players by name">
        </div>`;

        // Player categories
        for (const [category, players] of Object.entries(DATA.squad)) {
            html += `<h2 class="squad-category-title">${category}</h2>`;
            html += `<div class="grid squad-group" data-category="${category}">`;
            html += players.map(player => {
                const details   = (DATA.playerDetails && DATA.playerDetails[player]) || {};
                const isCaptain = /\(C\)/.test(player);
                const isVC      = details.vc === true;

                const cardClasses = ['card',
                    isCaptain ? 'card--captain' : '',
                    isVC      ? 'card--vc'      : ''
                ].filter(Boolean).join(' ');

                const flagBadge = details.flag
                    ? `<span class="player-flag" aria-label="${details.nat || ''}">${details.flag}</span>`
                    : '';
                const natBadge  = details.nat && !details.flag
                    ? `<span class="player-nat" aria-label="${details.nat}">${details.nat}</span>`
                    : '';
                const roleBadge = details.role
                    ? `<span class="player-role">${details.role}</span>`
                    : '';
                const captainBadge = isCaptain
                    ? '<span class="player-captain-badge" aria-label="Captain">C</span>'
                    : isVC
                    ? '<span class="player-vc-badge" aria-label="Vice-captain">VC</span>'
                    : '';

                // Expanded profile section (hidden by default)
                const expandLines = [];
                if (details.jersey != null) expandLines.push(`<span>#${details.jersey}</span>`);
                if (details.age    != null) expandLines.push(`<span>Age ${details.age}</span>`);
                if (details.bat)            expandLines.push(`<span>${details.bat}</span>`);
                if (details.bowl)           expandLines.push(`<span>${details.bowl}</span>`);

                const expandSection = expandLines.length > 0
                    ? `<div class="player-expand">${expandLines.join('')}</div>`
                    : '';

                return `
                <div class="${cardClasses}" role="button" tabindex="0"
                     aria-expanded="false" aria-label="View profile of ${player}"
                     data-player-name="${player.toLowerCase()}">
                    <div class="card-header">
                        <p class="name">${player}</p>
                        ${captainBadge}
                    </div>
                    <div class="card-badges">
                        ${flagBadge}${natBadge}${roleBadge}
                    </div>
                    ${expandSection}
                </div>`;
            }).join('');
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

        // Bind search
        const searchInput = container.querySelector('#squad-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const q = searchInput.value.trim().toLowerCase();
                container.querySelectorAll('.card[data-player-name]').forEach(card => {
                    const name = card.dataset.playerName || '';
                    card.style.display = (!q || name.includes(q)) ? '' : 'none';
                });
                // Show/hide category titles when all cards in a group are hidden
                container.querySelectorAll('.squad-group').forEach(group => {
                    const anyVisible = [...group.querySelectorAll('.card')].some(
                        c => c.style.display !== 'none'
                    );
                    const title = group.previousElementSibling;
                    if (title && title.classList.contains('squad-category-title')) {
                        title.style.display = anyVisible ? '' : 'none';
                    }
                    group.style.display = anyVisible ? '' : 'none';
                });
            });
        }

        // Bind tap-to-expand on player cards
        container.querySelectorAll('.card[aria-expanded]').forEach(card => {
            const toggle = () => {
                const expanded = card.getAttribute('aria-expanded') === 'true';
                card.setAttribute('aria-expanded', String(!expanded));
                card.classList.toggle('card--expanded', !expanded);
            };
            card.addEventListener('click', toggle);
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
            });
        });
    }

    /** Renders the IPL 2026 points table into #standings-list */
    function standings() {
        const container = document.getElementById('standings-list');
        if (!container) return;

        const header = `
        <div class="standing-row standing-header" role="row">
            <span class="standing-pos">#</span>
            <span class="standing-team">Team</span>
            <span class="standing-num">P</span>
            <span class="standing-num">W</span>
            <span class="standing-num">L</span>
            <span class="standing-num">Pts</span>
            <span class="standing-nrr">NRR</span>
        </div>`;

        const rows = DATA.standings.map((s, i) => {
            const isCsk = s.team === 'CSK';
            // Top 4 teams qualify for playoffs
            const isPlayoff = i < 4;
            return `
            <div class="standing-row${isCsk ? ' standing-row--csk' : ''}${isPlayoff ? ' standing-row--playoff' : ''}" role="row"
                 aria-label="${s.team}: ${s.pts} points${isPlayoff ? ', playoff position' : ''}">
                <span class="standing-pos">${i + 1}</span>
                <span class="standing-team">${s.team}</span>
                <span class="standing-num">${s.played}</span>
                <span class="standing-num">${s.won}</span>
                <span class="standing-num">${s.lost}</span>
                <span class="standing-num standing-pts">${s.pts}</span>
                <span class="standing-nrr">${s.nrr}</span>
            </div>`;
        }).join('');

        // Playoff qualification note
        const note = `<p class="standings-note">Top 4 qualify for playoffs</p>`;

        container.innerHTML = header + rows + note;
    }

    /** Public API */
    return { fixtures, fixturesLoading, fixturesError, squad, standings,
             lastResult, venueInfo, updateHubRecord };

})();


