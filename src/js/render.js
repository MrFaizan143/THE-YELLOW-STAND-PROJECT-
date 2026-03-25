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

    /** Active venue filter: 'all' or an exact venue string from DATA.fixtures */
    let currentVenueFilter = 'all';

    /** Active time-slot filter: 'all' | 'afternoon' | 'evening' */
    let currentTimeSlot = 'all';

    /** Last resolved fixture data (live or static) stored for re-filtering */
    let storedFixtureSource = null;

    /** Guards the one-time auto-scroll to the next fixture on initial page load */
    let autoScrollDone = false;

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

    /** Internal: re-renders the fixture list applying currentFilter, venue filter, and time-slot filter */
    function renderFixtures() {
        const container = document.getElementById('fixture-list');
        if (!container) return;

        const source       = storedFixtureSource || DATA.fixtures;
        const savedResults = Results.load();
        const nextIdx      = Results.nextFixtureIndex();
        const now          = Date.now();

        // Apply all active filters (AND logic)
        const filtered = source.map((f, i) => ({ f, i })).filter(({ f, i }) => {
            const result  = savedResults[i];
            const isPast  = f.iso && new Date(f.iso).getTime() <= now;

            // Base filter
            let pass = true;
            switch (currentFilter) {
                case 'home':     pass = f.home === true;         break;
                case 'away':     pass = f.home === false;        break;
                case 'upcoming': pass = !isPast;                 break;
                case 'done':     pass = isPast || !!result;      break;
                default:         pass = true;
            }
            if (!pass) return false;

            // Venue filter
            if (currentVenueFilter !== 'all' && f.v !== currentVenueFilter) return false;

            // Time-slot filter (Afternoon = 3:30 PM, Evening = 7:30 PM)
            if (currentTimeSlot === 'afternoon' && !(f.t && f.t.startsWith('3:'))) return false;
            if (currentTimeSlot === 'evening'   && !(f.t && f.t.startsWith('7:'))) return false;

            return true;
        });

        // Season progress (based on all source fixtures, not filtered)
        const totalMatches  = source.length;
        const playedMatches = source.filter(f => f.iso && new Date(f.iso).getTime() <= now).length;
        const progressPct   = totalMatches > 0 ? Math.round((playedMatches / totalMatches) * 100) : 0;
        const progressBar   = `
        <div class="season-progress" aria-label="Season progress: ${playedMatches} of ${totalMatches} matches played">
            <div class="season-progress-track" role="progressbar"
                 aria-valuenow="${playedMatches}" aria-valuemin="0" aria-valuemax="${totalMatches}">
                <div class="season-progress-fill" style="width:${progressPct}%"></div>
            </div>
            <p class="season-progress-label">${playedMatches} / ${totalMatches} played</p>
        </div>`;

        // Build unique venue list for the venue dropdown
        const allVenues = [...new Set(source.map(f => f.v).filter(Boolean))].sort();
        const venueOptions = allVenues.map(v =>
            `<option value="${v}"${currentVenueFilter === v ? ' selected' : ''}>${v}</option>`
        ).join('');

        // Filter bar HTML — base filters + venue dropdown + time-slot toggles
        const baseFilters   = ['all', 'home', 'away', 'upcoming', 'done'];
        const activeCount   = currentFilter !== 'all' ? ` <span class="fixture-count">${filtered.length}</span>` : '';
        const filterBar = `
        <div class="fixture-filters" role="group" aria-label="Filter fixtures">
            <div class="filter-row" role="group" aria-label="Status filter">
                ${baseFilters.map(f => `
                <button class="filter-btn${currentFilter === f ? ' filter-btn--active' : ''}"
                        data-filter="${f}" aria-pressed="${currentFilter === f}">
                    ${f.charAt(0).toUpperCase() + f.slice(1)}${currentFilter === f ? activeCount : ''}
                </button>`).join('')}
            </div>
            <div class="filter-row filter-row--secondary">
                <select class="filter-venue-select" id="venue-filter-select" aria-label="Filter by venue">
                    <option value="all"${currentVenueFilter === 'all' ? ' selected' : ''}>All Venues</option>
                    ${venueOptions}
                </select>
                <div class="filter-timeslot" role="group" aria-label="Filter by time slot">
                    <button class="filter-btn filter-btn--sm${currentTimeSlot === 'all'       ? ' filter-btn--active' : ''}"
                            data-timeslot="all"       aria-pressed="${currentTimeSlot === 'all'}">Any Time</button>
                    <button class="filter-btn filter-btn--sm${currentTimeSlot === 'afternoon' ? ' filter-btn--active' : ''}"
                            data-timeslot="afternoon" aria-pressed="${currentTimeSlot === 'afternoon'}">☀ 3:30 PM</button>
                    <button class="filter-btn filter-btn--sm${currentTimeSlot === 'evening'   ? ' filter-btn--active' : ''}"
                            data-timeslot="evening"   aria-pressed="${currentTimeSlot === 'evening'}">🌙 7:30 PM</button>
                </div>
            </div>
        </div>`;

        if (filtered.length === 0) {
            container.innerHTML = progressBar + filterBar + '<p class="fixtures-status">No fixtures match this filter.</p>';
            bindFilterButtons(container);
            return;
        }

        let lastMonth = null;
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

            // .ics download calendar button
            const icsBtn = f.iso
                ? `<a class="cal-btn" href="${buildICS(f)}" download="csk-vs-${f.o.replace(/\s+/g, '-').toLowerCase()}.ics"
                      aria-label="Add to iCal / Outlook" title="Add to iCal / Outlook">📅</a>`
                : '';

            // Google Calendar URL deep-link button
            const gCalBtn = f.iso
                ? `<a class="cal-btn cal-btn--gcal" href="${buildGoogleCalendarLink(f)}"
                      target="_blank" rel="noopener noreferrer"
                      aria-label="Add to Google Calendar" title="Add to Google Calendar">📆</a>`
                : '';

            // Directions link (Google Maps)
            const vInfo = DATA.venueInfo && DATA.venueInfo[f.v];
            const dirLink = vInfo
                ? `<a class="travel-link" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(vInfo.stadium + ', ' + vInfo.city)}"
                      target="_blank" rel="noopener noreferrer"
                      aria-label="Get directions to ${vInfo.stadium}" title="Get directions">📍 Directions</a>`
                : '';

            // Days-away label for the next upcoming fixture
            let daysLabel = '';
            if (isNext && f.iso) {
                const daysAway = Math.ceil((new Date(f.iso).getTime() - now) / MS_PER_DAY);
                if (daysAway <= 0) {
                    daysLabel = '<span class="days-away">TODAY</span>';
                } else if (daysAway === 1) {
                    daysLabel = '<span class="days-away">TOMORROW</span>';
                } else {
                    daysLabel = `<span class="days-away">in ${daysAway}d</span>`;
                }
            }

            // Month group separator — extract "MAR", "APR", "MAY" from "30 MAR" format
            const dateParts = f.d.split(' ');
            const month = dateParts.length >= 2 ? dateParts[1] : '';
            const monthSep = month !== lastMonth
                ? `<div class="fixture-month-sep" role="separator" aria-label="${month}">${month}</div>`
                : '';
            lastMonth = month;

            const rowHtml = `
            <div class="${classes}" role="listitem" data-idx="${i}">
                ${isNext ? '<span class="next-badge">NEXT</span>' : ''}
                <div class="fixture-info">
                    <div class="fixture-title-row">
                        <p class="opponent">${f.o}</p>
                        ${homeBadge}
                    </div>
                    <p class="venue">${f.v}</p>
                    ${dirLink ? `<span class="fixture-travel-row">${dirLink}</span>` : ''}
                    <p class="broadcast">${f.b}</p>
                </div>
                <div class="fixture-right">
                    <div class="fixture-meta">
                        <p class="date">${f.d}</p>
                        <p class="time">${f.t} IST</p>
                        ${daysLabel}
                        <span class="cal-btns">${icsBtn}${gCalBtn}</span>
                    </div>
                    <button class="result-btn${result ? ' has-result' : ''}"
                            aria-label="${resultTitle}"
                            title="${resultTitle}">${resultLabel}</button>
                </div>
            </div>`;
            return monthSep + rowHtml;
        }).join('');

        container.innerHTML = progressBar + filterBar + `<div class="fixture-rows" role="list">${rows}</div>`;

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

        // Auto-scroll to the next fixture only on the initial render
        if (!autoScrollDone) {
            const nextRow = container.querySelector('.fixture-next');
            if (nextRow) {
                autoScrollDone = true;
                requestAnimationFrame(() => {
                    nextRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
            }
        }

        // Notify the Schedule module so it can re-bind H2H tooltips
        if (typeof Schedule !== 'undefined' && Schedule.onFixturesRendered) {
            Schedule.onFixturesRendered();
        }
    }

    /** Binds click handlers on filter buttons (base + venue + time-slot) inside container */
    function bindFilterButtons(container) {
        // Base status filters
        container.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                currentFilter = btn.dataset.filter;
                renderFixtures();
            });
        });

        // Time-slot toggle buttons
        container.querySelectorAll('.filter-btn[data-timeslot]').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTimeSlot = btn.dataset.timeslot;
                renderFixtures();
            });
        });

        // Venue dropdown
        const venueSelect = container.querySelector('#venue-filter-select');
        if (venueSelect) {
            venueSelect.addEventListener('change', () => {
                currentVenueFilter = venueSelect.value || 'all';
                renderFixtures();
            });
        }
    }

    /** Duration to add when generating .ics DTEND (3.5 hours in ms) */
    const MATCH_DURATION_MS = 3.5 * 3_600_000;

    /** Milliseconds in one day — used for days-away calculations */
    const MS_PER_DAY = 86_400_000;

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

    /**
     * Builds a Google Calendar "add event" deep-link URL for a fixture.
     * Opens in a new tab — no API key required.
     * @param {Object} f — fixture object with iso, o, v, b fields.
     * @returns {string} Google Calendar URL.
     */
    function buildGoogleCalendarLink(f) {
        const start = new Date(f.iso);
        const end   = new Date(start.getTime() + MATCH_DURATION_MS);
        const fmt   = d => d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
        const params = new URLSearchParams({
            action:   'TEMPLATE',
            text:     `CSK vs ${f.o}`,
            dates:    `${fmt(start)}/${fmt(end)}`,
            location: f.v,
            details:  `IPL 2026 — CSK vs ${f.o} at ${f.v}. Watch on ${f.b}.`
        });
        return `https://calendar.google.com/calendar/render?${params.toString()}`;
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
        let venue, city, pitch;

        if (nextIdx >= 0) {
            const f   = DATA.fixtures[nextIdx];
            const vp  = f.v.split(',');
            venue     = vp[0].trim();
            city      = vp.length > 1 ? vp[1].trim() : vp[0].trim();
            // Use static nextMatch pitch for first match, generic otherwise
            if (nextIdx === 0) {
                pitch   = DATA.nextMatch.pitch;
            } else {
                pitch   = 'Pitch info closer to match day';
            }
        } else {
            // Season over — show last-known data
            venue   = DATA.nextMatch.venue;
            city    = DATA.nextMatch.city;
            pitch   = '—';
        }

        container.innerHTML = `
            <span class="tag">Next Venue</span>
            <p class="hub-info-label">${venue}</p>
            <p class="hub-info-meta">${city}</p>
            <p class="hub-info-score">${pitch}</p>`;
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

    /**
     * Renders all IPL 2026 fixtures into #ipl-schedule-list.
     * CSK matches are highlighted with the brand-yellow accent.
     * Matches are grouped by month. Falls back to a "no data" notice
     * when liveData is empty or not provided.
     * @param {Array} [liveData] — normalised full-match fixtures from CricketAPI.fetchAllIPLFixtures()
     */
    function iplSchedule(liveData) {
        const container = document.getElementById('ipl-schedule-list');
        if (!container) return;

        const matches = Array.isArray(liveData) && liveData.length > 0 ? liveData : null;

        if (!matches) {
            container.innerHTML = '<p class="fixtures-status">IPL schedule data unavailable. Check back once the season is live.</p>';
            return;
        }

        const now = Date.now();
        let lastMonth = null;
        let html = '';

        matches.forEach(m => {
            // Month separator
            const dateParts = m.d.split(' ');
            const month = dateParts.length >= 2 ? dateParts[1] : '';
            if (month && month !== lastMonth) {
                html += `<div class="fixture-month-sep" role="separator" aria-label="${month}">${month}</div>`;
                lastMonth = month;
            }

            const isLive    = m.status && /live|progress/i.test(m.status);
            const isPast    = m.iso && new Date(m.iso).getTime() <= now;
            const cskClass  = m.isCSK ? ' ipl-match--csk' : '';
            const liveClass = isLive  ? ' ipl-match--live' : '';
            const pastClass = isPast && !isLive ? ' ipl-match--past' : '';

            const scoreHtml = m.score
                ? `<p class="ipl-match-score">${m.score}</p>`
                : '';
            const statusHtml = m.status && !isLive
                ? `<p class="ipl-match-status">${m.status}</p>`
                : '';
            const liveTag   = isLive
                ? '<span class="tag live-tag" aria-label="Live match">🔴 LIVE</span>'
                : '';

            html += `
            <div class="ipl-match-card${cskClass}${liveClass}${pastClass}" role="listitem"
                 aria-label="${m.team1Short} vs ${m.team2Short}, ${m.d}"
                 data-team1-short="${m.team1Short}" data-team2-short="${m.team2Short}">
                ${liveTag}
                <div class="ipl-match-teams">
                    <span class="ipl-match-team${m.isCSK && /Chennai Super Kings|CSK/i.test(m.team1) ? ' ipl-match-team--csk' : ''}">${m.team1Short}</span>
                    <span class="ipl-match-vs">vs</span>
                    <span class="ipl-match-team${m.isCSK && /Chennai Super Kings|CSK/i.test(m.team2) ? ' ipl-match-team--csk' : ''}">${m.team2Short}</span>
                </div>
                <div class="ipl-match-meta">
                    <span class="ipl-match-datetime">${m.d} · ${m.t} IST</span>
                    <span class="ipl-match-venue">${m.v}</span>
                </div>
                ${scoreHtml}${statusHtml}
            </div>`;
        });

        container.innerHTML = `<div class="ipl-schedule-rows" role="list">${html}</div>`;

        // Re-apply favourite team highlighting
        if (typeof Schedule !== 'undefined' && Schedule.applyFavTeamHighlight) {
            Schedule.applyFavTeamHighlight();
        }
    }

    /**
     * Renders the CSK Legacy section (trophy gallery + records) into #legacy-content.
     * Called once when the Pride page is first visited.
     */
    function legacy() {
        const container = document.getElementById('legacy-content');
        if (!container || !DATA.legacy) return;

        const { titles, records } = DATA.legacy;

        // Trophy cards
        const trophyCards = titles.map(t => `
            <div class="legacy-trophy-card" aria-label="IPL ${t.year} title">
                <p class="legacy-trophy-year">${t.year}</p>
                <p class="legacy-trophy-trophy" aria-hidden="true">🏆</p>
                <p class="legacy-trophy-final">${t.final}</p>
                <p class="legacy-trophy-result">${t.result}</p>
                <p class="legacy-trophy-venue">${t.venue}</p>
                <p class="legacy-trophy-captain">Captain: ${t.captain}</p>
            </div>`).join('');

        // Records grid
        const recordItems = records.map(r => `
            <div class="legacy-record-item" aria-label="${r.label}: ${r.value}">
                <p class="legacy-record-value">${r.value}</p>
                <p class="legacy-record-label">${r.label}</p>
            </div>`).join('');

        container.innerHTML = `
            <h2 class="section-heading" aria-label="CSK Legacy">CSK Legacy</h2>
            <div class="legacy-banner" aria-label="5 IPL Titles">
                <span class="legacy-title-count">5×</span>
                <span class="legacy-title-label">IPL Champions</span>
                <span class="legacy-title-emoji" aria-hidden="true">🦁</span>
            </div>
            <div class="legacy-trophy-grid" role="list" aria-label="IPL title history">
                ${trophyCards}
            </div>
            <h2 class="section-heading" aria-label="CSK All-Time Records">All-Time Records</h2>
            <div class="legacy-records-grid" role="list" aria-label="CSK records">
                ${recordItems}
            </div>`;
    }

    /** Public API */
    return { fixtures, fixturesLoading, fixturesError, squad, standings, iplSchedule,
             lastResult, venueInfo, updateHubRecord, legacy };

})();


