/**
 * schedule.js — IPL schedule controls (filters, view toggle, live highlight)
 */
const Schedule = (() => {

    const FAVORITE_TEAM_DEFAULT = 'CSK';

    /** Delay (ms) before auto-scrolling to the next upcoming match.
     *  Must be long enough to run after the router's synchronous scrollTo(0,0). */
    const NEXT_MATCH_SCROLL_DELAY = 150;

    let _activeDateFilter = 'all';
    let _activeTeamFilter = 'all';
    let _activeViewMode   = 'list';
    let _showUpcomingOnly = false;
    let _scheduleControlsBound = false;
    let _fixturesLoaded = false;
    let _fixturesLoading = false;

    function init() {
        applyFavTeamHighlight();
        initScheduleControls();
        applyFilters();
    }

    function getFavoriteTeam() {
        const cfgTeam = (window.TYS_CONFIG && window.TYS_CONFIG.favoriteTeam) || '';
        const saved    = localStorage.getItem('favTeam') || '';
        return (cfgTeam || saved || FAVORITE_TEAM_DEFAULT).toUpperCase();
    }

    function applyFavTeamHighlight() {
        const favTeam = getFavoriteTeam();
        document.querySelectorAll('.ipl-match-card').forEach(card => {
            const t1 = card.dataset.team1Short;
            const t2 = card.dataset.team2Short;
            if (t1 === favTeam || t2 === favTeam) {
                card.classList.add('ipl-match--fav');
            }
        });
    }

    function setChipActive(chips, value) {
        chips.forEach(chip => {
            const isDateChip = typeof chip.dataset.date !== 'undefined';
            const isTeamChip = typeof chip.dataset.team !== 'undefined';
            const isActive   = (isDateChip && chip.dataset.date === value) ||
                               (isTeamChip && chip.dataset.team === value);
            if (isDateChip) chip.classList.toggle('date-chip--active', isActive);
            if (isTeamChip) chip.classList.toggle('team-filter-chip--active', isActive);
            chip.setAttribute('aria-pressed', String(isActive));
        });
    }

    function setViewMode(mode) {
        _activeViewMode = mode;
        const rows = document.querySelector('.ipl-schedule-rows');
        if (rows) {
            rows.classList.toggle('view--grid', mode === 'grid');
        }
        document.querySelectorAll('.view-btn').forEach(btn => {
            const isActive = btn.dataset.view === mode;
            btn.classList.toggle('view-btn--active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });
    }

    /**
     * Scrolls to the first upcoming match card.
     * Called automatically on first page load (after the router's scrollTo reset).
     */
    function scrollToNextMatch() {
        const firstUpcoming = document.querySelector('[data-upcoming="true"]');
        if (!firstUpcoming) return;
        firstUpcoming.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function initScheduleControls() {
        if (_scheduleControlsBound) return;
        const container = document.getElementById('ipl-schedule-list');
        if (!container) return;

        const dateChips = container.querySelectorAll('.date-chip');
        const teamChips = container.querySelectorAll('.team-filter-chip');
        const viewBtns  = container.querySelectorAll('.view-btn');
        const upcomingToggle = container.querySelector('#schedule-upcoming-toggle');

        dateChips.forEach(btn => {
            btn.addEventListener('click', () => {
                _activeDateFilter = btn.dataset.date || 'all';
                setChipActive(dateChips, _activeDateFilter);
                applyFilters();
            });
        });

        teamChips.forEach(btn => {
            btn.addEventListener('click', () => {
                _activeTeamFilter = btn.dataset.team || 'all';
                setChipActive(teamChips, _activeTeamFilter);
                applyFilters();
            });
        });

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setViewMode(btn.dataset.view === 'grid' ? 'grid' : 'list');
            });
        });

        if (upcomingToggle) {
            upcomingToggle.addEventListener('click', () => {
                _showUpcomingOnly = !_showUpcomingOnly;
                upcomingToggle.classList.toggle('upcoming-toggle-btn--active', _showUpcomingOnly);
                upcomingToggle.setAttribute('aria-pressed', String(_showUpcomingOnly));
                applyFilters();
            });
        }

        _scheduleControlsBound = true;

        // Auto-scroll to first upcoming match after the router's scrollTo(0,0) runs
        setTimeout(scrollToNextMatch, NEXT_MATCH_SCROLL_DELAY);
    }

    function matchPassesFilters(card) {
        const cardDate  = card.dataset.date || '';
        const t1        = card.dataset.team1Short || '';
        const t2        = card.dataset.team2Short || '';

        const dateOk     = _activeDateFilter === 'all' || _activeDateFilter === cardDate;
        const teamOk     = _activeTeamFilter === 'all' ||
            _activeTeamFilter === t1 || _activeTeamFilter === t2;
        const upcomingOk = !_showUpcomingOnly || !card.classList.contains('ipl-match--past');
        return dateOk && teamOk && upcomingOk;
    }

    function applyFilters() {
        const rows = document.querySelector('.ipl-schedule-rows');
        if (!rows) return;

        let anyVisible = false;
        rows.querySelectorAll('.ipl-match-card').forEach(card => {
            const show = matchPassesFilters(card);
            card.style.display = show ? '' : 'none';
            if (show) anyVisible = true;
        });

        const emptyState = document.getElementById('schedule-empty');
        if (emptyState) {
            emptyState.style.display = anyVisible ? 'none' : '';
        }
    }

    function updateLiveInSchedule(match) {
        const hasLive = !!match;
        const favTeam = getFavoriteTeam();
        const liveIso = match && match.iso ? new Date(match.iso).toISOString() : null;
        document.querySelectorAll('.ipl-match-card').forEach(card => {
            const t1 = card.dataset.team1Short;
            const t2 = card.dataset.team2Short;
            const cardIso = card.dataset.iso ? new Date(card.dataset.iso).toISOString() : null;
            const isFavMatch = t1 === favTeam || t2 === favTeam;
            const isSameMatch = liveIso && cardIso && liveIso === cardIso;
            const shouldBeLive = hasLive && isFavMatch && isSameMatch;
            card.classList.toggle('ipl-match--live', shouldBeLive);
        });
    }

    /**
     * Loads CSK fixtures for the Schedule page.
     * Shows a loading state, tries live data when keys are configured,
     * and falls back to static DATA.fixtures on failure.
     */
    function loadFixtures() {
        if (_fixturesLoaded || _fixturesLoading) return;
        _fixturesLoading = true;
        if (typeof Render !== 'undefined' && Render.fixturesLoading) {
            Render.fixturesLoading();
        }

        const renderFromList = (list = null) => {
            _fixturesLoading = false;
            _fixturesLoaded = true;
            const canRender = typeof Render !== 'undefined' && typeof Render.fixtures === 'function';
            if (canRender) {
                if (Array.isArray(list) && list.length > 0) {
                    Render.fixtures(list);
                } else {
                    Render.fixtures();
                }
            }
        };

        const handleFixturesError = err => {
            console.warn('[Schedule] fixtures fetch failed:', err);
            renderFromList();
        };

        if (typeof CricketAPI === 'undefined' || !CricketAPI.fetchCSKFixtures) {
            renderFromList();
            return;
        }

        try {
            Promise.resolve(CricketAPI.fetchCSKFixtures()).then(list => {
                renderFromList(list);
            }).catch(handleFixturesError);
        } catch (err) {
            console.warn('[Schedule] fixtures fetch threw synchronously:', err);
            handleFixturesError(err);
        }
    }

    return { init, initScheduleControls, applyFavTeamHighlight, updateLiveInSchedule, scrollToNextMatch };
})();

