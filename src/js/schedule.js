/**
 * schedule.js — IPL schedule controls (filters, view toggle, live highlight)
 */
const Schedule = (() => {

    const FAVORITE_TEAM_DEFAULT = 'CSK';

    let _activeDateFilter = 'all';
    let _activeTeamFilter = 'all';
    let _activeViewMode   = 'list';
    let _scheduleControlsBound = false;

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

    function initScheduleControls() {
        if (_scheduleControlsBound) return;
        const container = document.getElementById('ipl-schedule-list');
        if (!container) return;

        const dateChips = container.querySelectorAll('.date-chip');
        const teamChips = container.querySelectorAll('.team-filter-chip');
        const viewBtns  = container.querySelectorAll('.view-btn');

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

        _scheduleControlsBound = true;
    }

    function matchPassesFilters(card) {
        const cardDate  = card.dataset.date || '';
        const t1        = card.dataset.team1Short || '';
        const t2        = card.dataset.team2Short || '';

        const dateOk = _activeDateFilter === 'all' || _activeDateFilter === cardDate;
        const teamOk = _activeTeamFilter === 'all' ||
            _activeTeamFilter === t1 || _activeTeamFilter === t2;
        return dateOk && teamOk;
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
        document.querySelectorAll('.ipl-match-card').forEach(card => {
            const t1 = card.dataset.team1Short;
            const t2 = card.dataset.team2Short;
            const isFavMatch = t1 === favTeam || t2 === favTeam;
            const shouldBeLive = hasLive && isFavMatch;
            card.classList.toggle('ipl-match--live', shouldBeLive);
        });
    }

    return { init, initScheduleControls, applyFavTeamHighlight, updateLiveInSchedule };
})();
