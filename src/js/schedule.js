/**
 * schedule.js — TYS 2026 Schedule Features
 *
 * Handles all interactive enhancements on the Map/Schedule page:
 *   • Venue map         — venue cards for each CSK fixture venue
 *   • Venue sidebar     — click a venue card to see filtered fixtures + travel links
 *   • Follow My Team    — highlight and flag matches by favourite team
 *   • Inline countdown  — live ticking countdown on the schedule page
 *   • Traveler Mode     — directions + nearby hotels via Google Maps URLs
 */

const Schedule = (() => {

    // =========================================================================
    // Constants
    // =========================================================================

    const FAV_TEAM_KEY  = 'tys_fav_team';
    const ALL_TEAMS     = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'RR', 'PBKS', 'SRH', 'GT', 'LSG'];

    // =========================================================================
    // State
    // =========================================================================

    let scheduleCountdownId = null;   // setInterval handle for in-page countdown
    let activeVenueKey      = null;   // currently highlighted venue in the grid

    // =========================================================================
    // Follow My Team
    // =========================================================================

    function getFavTeam() {
        return localStorage.getItem(FAV_TEAM_KEY) || null;
    }

    function setFavTeam(team) {
        if (team) localStorage.setItem(FAV_TEAM_KEY, team);
        else       localStorage.removeItem(FAV_TEAM_KEY);
        applyFavTeamHighlight();
    }

    /**
     * Applies a highlight CSS class to IPL schedule cards that match the
     * stored favourite team, and moves them to the top of the list.
     */
    function applyFavTeamHighlight() {
        const favTeam  = getFavTeam();
        const container = document.getElementById('ipl-schedule-list');
        if (!container) return;

        // Remove existing highlights
        container.querySelectorAll('.ipl-match-card').forEach(card => {
            card.classList.remove('ipl-match--fav');
        });

        if (!favTeam) return;

        const rows = container.querySelector('.ipl-schedule-rows');
        if (!rows) return;

        // Highlight and bubble fav-team cards to the top
        const allCards  = [...rows.children];
        const favCards  = [];
        const otherCards = [];

        allCards.forEach(node => {
            if (node.classList && node.classList.contains('ipl-match-card')) {
                const t1 = node.dataset.team1Short || '';
                const t2 = node.dataset.team2Short || '';
                if (t1 === favTeam || t2 === favTeam) {
                    node.classList.add('ipl-match--fav');
                    favCards.push(node);
                    return;
                }
            }
            otherCards.push(node);
        });

        // Re-order: fav matches first
        if (favCards.length > 0) {
            const favHeader = document.createElement('div');
            favHeader.className = 'fixture-month-sep fav-section-sep';
            favHeader.textContent = `⭐ ${favTeam} Matches`;
            rows.innerHTML = '';
            rows.appendChild(favHeader);
            favCards.forEach(c => rows.appendChild(c));
            const divider = document.createElement('div');
            divider.className = 'fixture-month-sep';
            divider.textContent = 'All Matches';
            rows.appendChild(divider);
            otherCards.forEach(c => rows.appendChild(c));
        }
    }

    /** Renders the Follow My Team selector bar into #follow-team-bar */
    function renderFavTeamSelector() {
        const container = document.getElementById('follow-team-bar');
        if (!container) return;

        const current = getFavTeam() || '';
        container.innerHTML = `
        <div class="follow-team-wrap" role="group" aria-label="Follow your team">
            <label class="tag follow-team-label" for="follow-team-select">⭐ Follow Team</label>
            <select id="follow-team-select" class="follow-team-select"
                    aria-label="Select favourite team to highlight in the schedule">
                <option value="">— All Teams —</option>
                ${ALL_TEAMS.map(t => `<option value="${t}"${t === current ? ' selected' : ''}>${t}</option>`).join('')}
            </select>
        </div>`;

        const sel = container.querySelector('#follow-team-select');
        if (sel) {
            sel.addEventListener('change', () => setFavTeam(sel.value || null));
        }
    }

    // =========================================================================
    // Venue Grid
    // =========================================================================

    function renderVenueGrid() {
        const mapEl      = document.getElementById('venue-map');
        const sidebarEl  = document.getElementById('venue-sidebar');
        if (!mapEl || !sidebarEl) return;

        const fixtures = DATA.fixtures || [];
        const now      = Date.now();
        const nextIdx  = Results.nextFixtureIndex();
        let preferredVenueKey = null;
        if (nextIdx >= 0 && fixtures[nextIdx]) {
            preferredVenueKey = fixtures[nextIdx].v || null;
        }
        if (!activeVenueKey && preferredVenueKey) activeVenueKey = preferredVenueKey;

        // Group fixtures by venue
        const venueGroups = {};
        fixtures.forEach((f, idx) => {
            const vInfo = DATA.venueInfo && DATA.venueInfo[f.v];
            if (!vInfo) return;
            if (!venueGroups[f.v]) venueGroups[f.v] = { vInfo, matches: [] };
            venueGroups[f.v].matches.push({ f, idx });
        });

        const venueKeys = Object.keys(venueGroups);
        if (venueKeys.length === 0) {
            mapEl.innerHTML = `
                <div class="venue-grid">
                    <p class="fixtures-status">Venue map unavailable.</p>
                </div>`;
            sidebarEl.innerHTML = '';
            sidebarEl.classList.remove('venue-sidebar--open');
            return;
        }

        let defaultVenueKey = null;
        if (activeVenueKey && venueGroups[activeVenueKey]) {
            defaultVenueKey = activeVenueKey;
        } else if (preferredVenueKey && venueGroups[preferredVenueKey]) {
            defaultVenueKey = preferredVenueKey;
        } else {
            defaultVenueKey = venueKeys[0];
        }
        activeVenueKey = defaultVenueKey;

        const venueCardsHtml = Object.entries(venueGroups).reduce((html, [key, { vInfo, matches }]) => {
            const isNext    = matches.some(({ idx }) => idx === nextIdx);
            const isActive  = activeVenueKey === key;
            const matchList = matches.map(({ f }) => {
                const isPast = f.iso && new Date(f.iso).getTime() <= now;
                return `<li class="venue-match${isPast ? ' venue-match--past' : ''}">
                    <span class="venue-match-date">${f.d}</span>
                    <span class="venue-match-team">CSK vs ${f.o}</span>
                    <span class="venue-match-time">${f.t} IST</span>
                </li>`;
            }).join('');
            const dirUrl   = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(vInfo.stadium + ', ' + vInfo.city)}`;
            const hotelsUrl = `https://www.google.com/maps/search/hotels+near+${encodeURIComponent(vInfo.stadium + ', ' + vInfo.city)}`;
            return `
            <article class="venue-card${isNext ? ' venue-card--next' : ''}${isActive ? ' venue-card--active' : ''}"
                     data-venue-key="${key}" role="button" tabindex="0"
                     aria-label="Show fixtures for ${vInfo.stadium} in ${vInfo.city}"
                     aria-pressed="${isActive ? 'true' : 'false'}">
                <div class="venue-card__header">
                    <div>
                        <p class="venue-card__stadium">${vInfo.stadium}</p>
                        <p class="venue-card__city">${vInfo.city}</p>
                    </div>
                    <span class="venue-card__badge">${matches.length} match${matches.length > 1 ? 'es' : ''}</span>
                </div>
                <ul class="venue-card__matches">${matchList}</ul>
                <div class="venue-card__actions">
                    <a class="travel-btn" href="${dirUrl}" target="_blank" rel="noopener noreferrer">📍 Directions</a>
                    <a class="travel-btn" href="${hotelsUrl}" target="_blank" rel="noopener noreferrer">🏨 Nearby stays</a>
                </div>
            </article>`;
        }, '');

        mapEl.innerHTML = `
            <div class="venue-grid" aria-label="Venue list (map unavailable offline)">
                ${venueCardsHtml}
            </div>`;
        _bindVenueCardInteractions(mapEl, venueGroups, defaultVenueKey);
    }

    // =========================================================================
    // Venue Sidebar
    // =========================================================================

    function showVenueSidebar(venueKey, matches, vInfo) {
        const sidebar = document.getElementById('venue-sidebar');
        if (!sidebar) return;

        const now     = Date.now();
        const matchHtml = matches.map(({ f, idx }) => {
            const isPast = f.iso && new Date(f.iso).getTime() <= now;
            const badge  = `<span class="fixture-badge fixture-badge--${f.home ? 'home' : 'away'}">${f.home ? 'HOME' : 'AWAY'}</span>`;
            const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(vInfo.stadium + ', ' + vInfo.city)}`;
            return `
            <div class="sidebar-match${isPast ? ' sidebar-match--past' : ''}">
                <div class="sidebar-match-info">
                    <p class="sidebar-match-teams">CSK vs ${f.o}</p>
                    <p class="sidebar-match-meta">${f.d} · ${f.t} IST</p>
                    ${badge}
                </div>
                <a class="travel-btn" href="${dirUrl}" target="_blank" rel="noopener noreferrer"
                   aria-label="Get directions to ${vInfo.stadium}">🗺 Directions</a>
            </div>`;
        }).join('');

        const hotelsUrl = `https://www.google.com/maps/search/hotels+near+${encodeURIComponent(vInfo.stadium + ', ' + vInfo.city)}`;

        sidebar.innerHTML = `
        <div class="venue-sidebar-header">
            <div class="venue-sidebar-title">
                <p class="venue-sidebar-stadium">${vInfo.stadium}</p>
                <p class="venue-sidebar-city">${vInfo.city}</p>
            </div>
            <button class="venue-sidebar-close" id="sidebar-close-btn" aria-label="Close venue details">✕</button>
        </div>
        <div class="venue-sidebar-matches">${matchHtml}</div>
        <a class="travel-btn travel-btn--hotels" href="${hotelsUrl}" target="_blank"
           rel="noopener noreferrer">🏨 Nearby Hotels</a>`;

        sidebar.classList.add('venue-sidebar--open');

        const closeBtn = document.getElementById('sidebar-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => sidebar.classList.remove('venue-sidebar--open'));
        }

        // Auto-scroll to sidebar on mobile
        sidebar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function _bindVenueCardInteractions(mapEl, venueGroups, defaultVenueKey) {
        const grid = mapEl.querySelector('.venue-grid');
        if (!grid) return;

        const setActive = venueKey => {
            if (activeVenueKey === venueKey) return;
            const prevKey = activeVenueKey;
            activeVenueKey = venueKey;

            if (prevKey) {
                const prevCard = grid.querySelector(`.venue-card[data-venue-key="${prevKey}"]`);
                if (prevCard) {
                    prevCard.classList.remove('venue-card--active');
                    prevCard.setAttribute('aria-pressed', 'false');
                }
            }

            const nextCard = grid.querySelector(`.venue-card[data-venue-key="${venueKey}"]`);
            if (nextCard) {
                nextCard.classList.add('venue-card--active');
                nextCard.setAttribute('aria-pressed', 'true');
            }
        };

        const selectVenue = venueKey => {
            const group = venueGroups[venueKey];
            if (!group) return;
            setActive(venueKey);
            showVenueSidebar(venueKey, group.matches, group.vInfo);
        };

        grid.querySelectorAll('.venue-card').forEach(card => {
            const venueKey = card.dataset.venueKey;
            if (!venueKey) return;
            card.addEventListener('click', () => selectVenue(venueKey));
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    selectVenue(venueKey);
                } else if (e.key === ' ') {
                    e.preventDefault();
                    selectVenue(venueKey);
                }
            });
        });

        if (defaultVenueKey && venueGroups[defaultVenueKey]) {
            selectVenue(defaultVenueKey);
        }
    }

    // =========================================================================
    // Inline Schedule Countdown
    // =========================================================================

    function startScheduleCountdown() {
        if (scheduleCountdownId) clearInterval(scheduleCountdownId);
        scheduleCountdownId = setInterval(_tickScheduleCountdown, 1000);
        _tickScheduleCountdown();
    }

    function stopScheduleCountdown() {
        if (scheduleCountdownId) {
            clearInterval(scheduleCountdownId);
            scheduleCountdownId = null;
        }
    }

    function _tickScheduleCountdown() {
        const el = document.getElementById('schedule-countdown');
        if (!el) return;

        const nextIdx = Results.nextFixtureIndex();
        if (nextIdx < 0) {
            el.textContent = 'Season Complete';
            stopScheduleCountdown();
            return;
        }

        const f   = DATA.fixtures[nextIdx];
        const iso = f && f.iso;
        if (!iso) return;

        const gap = new Date(iso).getTime() - Date.now();
        if (gap <= 0) {
            el.textContent = '🔴 MATCH DAY';
            return;
        }

        const pad = n => String(n).padStart(2, '0');
        const d   = Math.floor(gap / 86_400_000);
        const h   = Math.floor((gap % 86_400_000) / 3_600_000);
        const m   = Math.floor((gap % 3_600_000) / 60_000);
        const s   = Math.floor((gap % 60_000) / 1_000);
        el.textContent = d > 0
            ? `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
            : `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
    }

    // =========================================================================
    // Live Score in Schedule Rows
    // =========================================================================

    /**
     * Updates the matching CSK fixture row in #fixture-list with a live
     * mini-scorecard when a match is in progress. Called by app.js's
     * live-score polling loop.
     * @param {Object|null} liveMatch — normalised fixture from fetchCSKLiveMatch()
     */
    function updateLiveInSchedule(liveMatch) {
        const container = document.getElementById('fixture-list');
        if (!container || !liveMatch) return;

        container.querySelectorAll('.fixture-item[data-idx]').forEach(row => {
            const idx = parseInt(row.dataset.idx, 10);
            if (isNaN(idx)) return;
            const f = DATA.fixtures[idx];
            if (!f) return;

            // Match by opponent (loose match — API opponent may vary in formatting)
            const oppWords  = f.o.toLowerCase().split(' ');
            const liveOpp   = (liveMatch.o || '').toLowerCase();
            const isThisMatch = oppWords.some(w => w.length > 2 && liveOpp.includes(w));
            if (!isThisMatch) return;

            let liveEl = row.querySelector('.fixture-live-score');
            if (!liveEl) {
                liveEl = document.createElement('div');
                liveEl.className = 'fixture-live-score';
                const info = row.querySelector('.fixture-info');
                if (info) info.insertBefore(liveEl, info.firstChild);
            }

            liveEl.innerHTML = `
                <span class="tag live-tag" style="display:inline-block">🔴 LIVE</span>
                ${liveMatch.score ? `<span class="live-score-text">${liveMatch.score}</span>` : ''}
                ${liveMatch.status ? `<span class="live-score-status">${liveMatch.status}</span>` : ''}`;
        });
    }

    // =========================================================================
    // Schedule Controls — Date Picker, Team Filter, View Toggle
    // =========================================================================

    /** Active filter state for the full IPL schedule list */
    let _activeDateFilter = 'all';
    let _activeTeamFilter = 'all';
    let _activeViewMode   = 'list';

    /**
     * Applies the current date / team / view filters to #ipl-schedule-list cards.
     * Cards not matching the active filters are hidden via `aria-hidden` + CSS class.
     */
    function _applyScheduleFilters() {
        const container = document.getElementById('ipl-schedule-list');
        if (!container) return;

        const rows = container.querySelector('.ipl-schedule-rows');
        if (!rows) return;

        // View mode: list vs grid
        rows.classList.toggle('view--grid', _activeViewMode === 'grid');

        // Show / hide cards based on date + team filter
        rows.querySelectorAll('.ipl-match-card').forEach(card => {
            const cardDate  = card.dataset.date  || '';
            const team1     = card.dataset.team1Short || '';
            const team2     = card.dataset.team2Short || '';

            const dateMatch = _activeDateFilter === 'all' || cardDate === _activeDateFilter;
            const teamMatch = _activeTeamFilter === 'all' || team1 === _activeTeamFilter || team2 === _activeTeamFilter;

            const visible = dateMatch && teamMatch;
            card.classList.toggle('ipl-match--hidden', !visible);
            card.setAttribute('aria-hidden', visible ? 'false' : 'true');
        });

        // Show / hide month separators: hide if all cards in that month are hidden
        let prevSep = null;
        rows.childNodes.forEach(node => {
            if (!(node instanceof Element)) return;
            if (node.classList.contains('fixture-month-sep') || node.classList.contains('fav-section-sep')) {
                prevSep = node;
                // Reset visibility first, re-evaluate below
                node.classList.remove('ipl-match--hidden');
            } else if (node.classList.contains('ipl-match-card') && prevSep) {
                if (!node.classList.contains('ipl-match--hidden')) {
                    prevSep = null; // At least one visible card — separator stays
                }
            }
        });
        // Second pass: hide separators with no visible cards after them
        let lastSepNode = null;
        const children = [...rows.childNodes].filter(n => n instanceof Element);
        children.forEach((node, idx) => {
            if (node.classList.contains('fixture-month-sep') || node.classList.contains('fav-section-sep')) {
                // Check if the previous separator had any visible cards
                if (lastSepNode) {
                    const hasVisible = children.slice(children.indexOf(lastSepNode) + 1, idx)
                        .some(c => c.classList.contains('ipl-match-card') && !c.classList.contains('ipl-match--hidden'));
                    if (!hasVisible) lastSepNode.classList.add('ipl-match--hidden');
                }
                lastSepNode = node;
            }
        });
        // Check last separator
        if (lastSepNode) {
            const lastSepIdx = children.indexOf(lastSepNode);
            const hasVisible = children.slice(lastSepIdx + 1)
                .some(c => c.classList.contains('ipl-match-card') && !c.classList.contains('ipl-match--hidden'));
            if (!hasVisible) lastSepNode.classList.add('ipl-match--hidden');
        }
    }

    /**
     * Binds click events on the date picker chips, team filter chips, and
     * view toggle buttons rendered inside #ipl-schedule-list by render.js.
     * Safe to call multiple times — re-binds after each re-render.
     */
    function initScheduleControls() {
        const container = document.getElementById('ipl-schedule-list');
        if (!container) return;

        // Use event delegation on the container to avoid re-attaching listeners
        // on every re-render. A single delegated handler covers all control clicks.
        if (!container._scheduleControlsBound) {
            container._scheduleControlsBound = true;

            container.addEventListener('click', e => {
                const btn = e.target.closest('[data-date], [data-team], [data-view]');
                if (!btn) return;

                if (btn.matches('.date-chip')) {
                    _activeDateFilter = btn.dataset.date || 'all';
                    container.querySelectorAll('.date-chip').forEach(b => {
                        b.classList.toggle('date-chip--active', b === btn);
                        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                    });
                    _applyScheduleFilters();

                } else if (btn.matches('.team-filter-chip')) {
                    _activeTeamFilter = btn.dataset.team || 'all';
                    container.querySelectorAll('.team-filter-chip').forEach(b => {
                        b.classList.toggle('team-filter-chip--active', b === btn);
                        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                    });
                    _applyScheduleFilters();

                } else if (btn.matches('.view-btn')) {
                    _activeViewMode = btn.dataset.view || 'list';
                    container.querySelectorAll('.view-btn').forEach(b => {
                        b.classList.toggle('view-btn--active', b === btn);
                        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                    });
                    _applyScheduleFilters();
                }
            });
        }

        // Apply saved state immediately (e.g. after a re-render)
        _applyScheduleFilters();
    }

    // =========================================================================
    // Init
    // =========================================================================

    /** Called once on DOMContentLoaded from app.js */
    function init() {
        renderFavTeamSelector();
    }

    /**
     * Called by router.js when the schedule ('m') page is navigated to.
     */
    function onPageShow() {
        // Start in-page countdown
        startScheduleCountdown();

        // Render venue cards grid
        renderVenueGrid();

        // Re-apply fav team highlight after IPL schedule finishes rendering
        // (schedule render is async via API calls — small delay is acceptable)
        setTimeout(() => {
            applyFavTeamHighlight();
            initScheduleControls();
        }, 700);
    }

    /**
     * Called by render.js after the CSK fixture list is (re-)rendered.
     * Kept for API compatibility with render.js.
     */
    function onFixturesRendered() {}

    /** Public API */
    return {
        init,
        onPageShow,
        onFixturesRendered,
        applyFavTeamHighlight,
        updateLiveInSchedule,
        renderFavTeamSelector,
        initScheduleControls
    };

})();
