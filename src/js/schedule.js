/**
 * schedule.js — TYS 2026 Advanced Schedule Features
 *
 * Handles all interactive enhancements on the Map/Schedule page:
 *   • Venue map         — Leaflet.js markers for each CSK fixture venue
 *   • Venue sidebar     — click a map pin to see filtered fixtures + travel links
 *   • H2H tooltips      — hover over a fixture to see head-to-head history
 *   • Follow My Team    — highlight and flag matches by favourite team
 *   • Push notifications — Notification API alerts 15 min before each match
 *   • Inline countdown  — live ticking countdown on the schedule page
 *   • Probable XIs      — shows playing XIs near match day
 *   • Traveler Mode     — directions + nearby hotels via Google Maps URLs
 */

const Schedule = (() => {

    // =========================================================================
    // Constants
    // =========================================================================

    const FAV_TEAM_KEY  = 'tys_fav_team';
    const NOTIF_KEY     = 'tys_notif_enabled';
    const ALL_TEAMS     = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'RR', 'PBKS', 'SRH', 'GT', 'LSG'];
    const MIN_NOTIFICATION_LEAD_MINUTES = 10;

    // =========================================================================
    // State
    // =========================================================================

    let notifTimers         = [];     // setTimeout handles for pending notifications
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
        scheduleNotifications();
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
    // Push Notifications (Notification API)
    // =========================================================================

    function isNotifEnabled() {
        return localStorage.getItem(NOTIF_KEY) === 'yes'
            && 'Notification' in window
            && Notification.permission === 'granted';
    }

    function updateNotifBell() {
        const bell = document.getElementById('notif-bell');
        if (!bell) return;
        const enabled = isNotifEnabled();
        bell.textContent = enabled ? '🔔' : '🔕';
        bell.setAttribute('aria-label', enabled ? 'Notifications on — click to disable' : 'Enable match notifications');
        bell.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        bell.classList.toggle('notif-bell--active', enabled);
    }

    async function requestNotifPermission() {
        if (!('Notification' in window)) {
            if (typeof Toast !== 'undefined') Toast.show('Notifications are not supported on this device', 'warn');
            return;
        }
        try {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
                localStorage.setItem(NOTIF_KEY, 'yes');
                scheduleNotifications();
            } else {
                localStorage.removeItem(NOTIF_KEY);
                if (typeof Toast !== 'undefined') Toast.show('Notifications blocked — enable in browser settings', 'warn');
            }
        } catch (_) { /* Safari may not return a promise */ }
        updateNotifBell();
    }

    /**
     * Schedule browser Notification alerts 15 minutes before each upcoming
     * match that involves the user's favourite team (or all CSK matches).
     * Clears any previously scheduled timers before re-scheduling.
     */
    function scheduleNotifications() {
        notifTimers.forEach(id => clearTimeout(id));
        notifTimers = [];

        if (!isNotifEnabled()) return;

        const favTeam    = getFavTeam();
        const fixtures   = DATA.fixtures || [];
        const now        = Date.now();
        const leadMin    = (typeof FanProfile !== 'undefined' && FanProfile.getNotificationLeadMinutes)
            ? FanProfile.getNotificationLeadMinutes()
            : 15;
        const ALERT_MS   = Math.max(MIN_NOTIFICATION_LEAD_MINUTES, leadMin) * 60 * 1000; // safety floor aligned with allowed lead times

        fixtures.forEach(f => {
            if (!f.iso) return;

            // Alert for CSK matches, or if favourite team is the opponent
            const relevant = !favTeam || favTeam === 'CSK' || (favTeam && f.o === favTeam);
            if (!relevant) return;

            const alertTime = new Date(f.iso).getTime() - ALERT_MS;
            const delay     = alertTime - now;
            if (delay <= 0) return; // Already past

            const id = setTimeout(() => {
                try {
                    new Notification('The Yellow Stand 🦁', {
                        body: `CSK vs ${f.o} starts in 15 minutes!\n${f.v} · ${f.t} IST`,
                        icon: '/icons/icon-192.png',
                        tag:  `tys-match-${f.iso}`
                    });
                } catch (_) { /* Notification may be blocked */ }
            }, delay);

            notifTimers.push(id);
        });
    }

    function initNotifBell() {
        const bell = document.getElementById('notif-bell');
        if (!bell) return;
        updateNotifBell();
        bell.addEventListener('click', async () => {
            if (isNotifEnabled()) {
                localStorage.removeItem(NOTIF_KEY);
                notifTimers.forEach(id => clearTimeout(id));
                notifTimers = [];
                updateNotifBell();
            } else {
                await requestNotifPermission();
            }
        });
    }

    // =========================================================================
    // Venue Map (Leaflet.js) — replaced with offline-friendly venue grid
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
                <div class="venue-grid" aria-label="Venue information unavailable">
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
            defaultVenueKey = venueKeys[0] || null;
        }
        activeVenueKey = defaultVenueKey;

        const venueCardsHtml = Object.entries(venueGroups).map(([key, { vInfo, matches }]) => {
            const isNext    = matches.some(({ idx }) => idx === nextIdx);
            const isActive  = activeVenueKey ? activeVenueKey === key : isNext;
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
        }).join('');

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
            activeVenueKey = venueKey;
            grid.querySelectorAll('.venue-card').forEach(card => {
                const isActive = card.dataset.venueKey === venueKey;
                card.classList.toggle('venue-card--active', isActive);
                card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
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
                const code    = e.keyCode || e.which;
                const isEnter = e.key === 'Enter' || code === 13;
                const isSpace = e.key === ' ' || code === 32;
                if (!isEnter && !isSpace) return;
                if (isSpace) e.preventDefault();
                selectVenue(venueKey);
            });
        });

        if (defaultVenueKey && venueGroups[defaultVenueKey]) {
            selectVenue(defaultVenueKey);
        }
    }

    // =========================================================================
    // Head-to-Head Tooltips
    // =========================================================================

    /**
     * Binds mouseenter / mouseleave listeners to every CSK fixture row so that
     * a floating H2H tooltip appears when the user hovers over a match.
     * Safe to call multiple times — re-binds on re-render.
     */
    function initH2HTooltips() {
        const container = document.getElementById('fixture-list');
        const tooltip   = document.getElementById('h2h-tooltip');
        if (!container || !tooltip) return;

        container.querySelectorAll('.fixture-item[data-idx]').forEach(row => {
            // Remove old listeners by cloning (cheap for small lists)
            const fresh = row.cloneNode(true);
            row.parentNode && row.parentNode.replaceChild(fresh, row);

            const idx = parseInt(fresh.dataset.idx, 10);
            if (isNaN(idx)) return;
            const f   = DATA.fixtures[idx];
            if (!f) return;

            const h2h = DATA.h2h && DATA.h2h[f.o];
            if (!h2h) {
                // Re-bind result button for the cloned node
                _rebindResultBtn(fresh);
                return;
            }

            const total      = h2h.w + h2h.l;
            const last5Html  = h2h.last5.map(r =>
                `<span class="h2h-dot h2h-dot--${r.toLowerCase()}">${r}</span>`
            ).join('');

            fresh.addEventListener('mouseenter', e => {
                tooltip.innerHTML = `
                <div class="h2h-tooltip-inner">
                    <p class="h2h-title">CSK vs ${f.o}</p>
                    <p class="h2h-record">Overall: <strong>${h2h.w}W – ${h2h.l}L</strong> (${total} played)</p>
                    <p class="h2h-last5-label">Last 5 encounters:</p>
                    <div class="h2h-dots">${last5Html}</div>
                </div>`;
                tooltip.classList.add('h2h-tooltip--visible');
                _positionTooltip(tooltip, e);
            });
            fresh.addEventListener('mousemove', e => _positionTooltip(tooltip, e));
            fresh.addEventListener('mouseleave', () => tooltip.classList.remove('h2h-tooltip--visible'));

            // Re-bind result button click for the cloned node
            _rebindResultBtn(fresh);
        });
    }

    function _positionTooltip(tooltip, e) {
        const x  = e.clientX + 18;
        const y  = e.clientY - 10;
        const vw = window.innerWidth;
        const tw = tooltip.offsetWidth || 220;
        tooltip.style.left = (x + tw > vw ? Math.max(0, x - tw - 36) : x) + 'px';
        tooltip.style.top  = Math.max(0, y) + 'px';
    }

    /**
     * Re-binds the result button on a cloned fixture row so that
     * cycling results still works after H2H tooltip re-binding.
     */
    function _rebindResultBtn(row) {
        const btn = row.querySelector('.result-btn');
        if (!btn) return;
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const idx = parseInt(row.dataset.idx, 10);
            if (isNaN(idx)) return;
            const newVal = Results.cycle(idx);
            // Delegate full re-render back to Render module
            if (typeof Render !== 'undefined') {
                Render.fixtures();
                Render.updateHubRecord();
                Render.lastResult();
                Render.venueInfo();
            }
            if (typeof Countdown !== 'undefined') Countdown.updateLabel();
        });
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
    // Probable Playing XIs
    // =========================================================================

    function renderProbableXIs() {
        const container = document.getElementById('probable-xi-section');
        if (!container) return;

        const nextIdx = Results.nextFixtureIndex();
        if (nextIdx < 0) { container.innerHTML = ''; return; }

        const f = DATA.fixtures[nextIdx];
        if (!f || !f.iso) { container.innerHTML = ''; return; }

        const hoursUntil = (new Date(f.iso).getTime() - Date.now()) / 3_600_000;
        const xi         = DATA.probableXIs && DATA.probableXIs[f.iso];

        // Show section only within 24 h of the match
        if (!xi && hoursUntil > 24) { container.innerHTML = ''; return; }

        if (!xi) {
            container.innerHTML = `
            <div class="probable-xi-card">
                <span class="tag">Probable Playing XIs</span>
                <p class="probable-xi-tbd">CSK vs ${f.o} — XIs announced closer to match day</p>
            </div>`;
            return;
        }

        const xiList = players => players.map((p, i) =>
            `<li class="probable-xi-player"><span class="probable-xi-num">${i + 1}</span>${p}</li>`
        ).join('');

        container.innerHTML = `
        <div class="probable-xi-card">
            <span class="tag">Probable Playing XIs</span>
            <p class="probable-xi-match">CSK vs ${f.o} · ${f.d} · ${f.t} IST</p>
            <div class="probable-xi-teams">
                <div class="probable-xi-team">
                    <p class="probable-xi-team-name">CSK</p>
                    <ol class="probable-xi-list">${xiList(xi.csk)}</ol>
                </div>
                <div class="probable-xi-team">
                    <p class="probable-xi-team-name">${f.o}</p>
                    <ol class="probable-xi-list">${xiList(xi.opp)}</ol>
                </div>
            </div>
        </div>`;
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
    // Init
    // =========================================================================

    /** Called once on DOMContentLoaded from app.js */
    function init() {
        initNotifBell();
        renderFavTeamSelector();
        if (isNotifEnabled()) scheduleNotifications();
    }

    /**
     * Called by router.js when the schedule ('m') page is navigated to.
     * Map must be initialized here (not on DOMContentLoaded) because
     * Leaflet needs the container to be visible before setting up.
     */
    function onPageShow() {
        // Start in-page countdown
        startScheduleCountdown();

        // Render probable XIs
        renderProbableXIs();

        // Offline-friendly venue view (no external Leaflet dependency)
        renderVenueGrid();

        // Re-apply fav team highlight after IPL schedule finishes rendering
        // (schedule render is async via API calls — small delay is acceptable)
        setTimeout(() => {
            applyFavTeamHighlight();
            initH2HTooltips();
        }, 700);
    }

    /**
     * Called by render.js after the CSK fixture list is (re-)rendered.
     * Re-binds tooltips.
     */
    function onFixturesRendered() {
        initH2HTooltips();
        renderProbableXIs();
    }

    /** Public API */
    return {
        init,
        onPageShow,
        onFixturesRendered,
        applyFavTeamHighlight,
        updateLiveInSchedule,
        renderFavTeamSelector
    };

})();
