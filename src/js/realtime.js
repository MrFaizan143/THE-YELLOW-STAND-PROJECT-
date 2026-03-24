/**
 * realtime.js — TYS 2026 Realtime Infrastructure
 *
 * Provides live match feed and fan leaderboard via Supabase Realtime.
 *
 * ── SETUP ────────────────────────────────────────────────────────────────────
 * 1. Create a free project at https://supabase.com
 * 2. Copy your Project URL and anon/public key into src/data/realtime-config.js
 *    (copy that file from realtime-config.example.js — it is git-ignored).
 * 3. Run the following SQL in the Supabase SQL editor to create the tables:
 *
 *   create table live_feed (
 *     id          bigint generated always as identity primary key,
 *     created_at  timestamptz not null default now(),
 *     message     text        not null,
 *     type        text        not null default 'update'
 *       check (type in ('update','boundary','six','wicket','info'))
 *   );
 *   -- Index for the ORDER BY created_at DESC query
 *   create index on live_feed (created_at desc);
 *
 *   create table leaderboard (
 *     id        bigint generated always as identity primary key,
 *     fan_name  text    not null,
 *     points    integer not null default 0,
 *     badge     text    not null default '🟡'
 *   );
 *   -- Index for the ORDER BY points DESC query
 *   create index on leaderboard (points desc);
 *
 *   -- Enable Row-Level Security (read-only for anon)
 *   alter table live_feed   enable row level security;
 *   alter table leaderboard enable row level security;
 *
 *   create policy "Public read" on live_feed   for select using (true);
 *   create policy "Public read" on leaderboard for select using (true);
 *
 * 4. In Supabase → Database → Replication, enable realtime for both tables.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Realtime = (() => {

    // ── Configuration ─────────────────────────────────────────────────────────
    // Credentials are read from src/data/realtime-config.js (git-ignored).
    // Copy realtime-config.example.js → realtime-config.js and fill in your values.
    const _cfg          = (typeof REALTIME_CONFIG !== 'undefined') ? REALTIME_CONFIG : {};
    const SUPABASE_URL      = _cfg.supabaseUrl      || '';
    const SUPABASE_ANON_KEY = _cfg.supabaseAnonKey  || '';

    // Maximum feed items kept in the DOM before older ones are pruned.
    const FEED_MAX_ITEMS = 30;

    // ── State ──────────────────────────────────────────────────────────────────
    let client       = null;
    let feedChannel  = null;
    let boardChannel = null;

    // ── Feed type icons ────────────────────────────────────────────────────────
    const TYPE_ICON = {
        boundary : '🔥',
        six      : '💥',
        wicket   : '🎯',
        update   : '📣',
        info     : 'ℹ️',
    };

    // ── Initialisation ─────────────────────────────────────────────────────────

    /**
     * Called by the router the first time the Live page is visited.
     * Idempotent — safe to call more than once.
     */
    function init() {
        if (client) return; // already initialised

        if (typeof window.supabase === 'undefined') {
            _setStatus('error');
            _showFeedError('Supabase SDK not loaded. Check your network connection.');
            return;
        }

        if (!SUPABASE_URL) {
            _setStatus('error');
            _showFeedError('Supabase is not configured yet. See realtime-config.example.js for setup instructions.');
            _showBoardError('Supabase is not configured yet.');
            return;
        }

        try {
            client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (err) {
            _setStatus('error');
            _showFeedError('Could not connect to Supabase.');
            return;
        }

        _setStatus('connecting');
        _loadFeed();
        _loadLeaderboard();
        _subscribeFeed();
        _subscribeLeaderboard();
    }

    /**
     * Tears down all Supabase channels.
     * Call when navigating away if you need to reclaim resources.
     */
    function destroy() {
        if (feedChannel)  { feedChannel.unsubscribe();  feedChannel  = null; }
        if (boardChannel) { boardChannel.unsubscribe(); boardChannel = null; }
        client = null;
        _setStatus('offline');
    }

    // ── Initial data loads ─────────────────────────────────────────────────────

    async function _loadFeed() {
        const { data, error } = await client
            .from('live_feed')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(FEED_MAX_ITEMS);

        if (error) {
            _showFeedError('Could not load match feed.');
            return;
        }

        const container = document.getElementById('live-feed');
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="live-empty">No match updates yet — check back soon!</p>';
            return;
        }

        container.innerHTML = data.map(_buildFeedItem).join('');
    }

    async function _loadLeaderboard() {
        const { data, error } = await client
            .from('leaderboard')
            .select('*')
            .order('points', { ascending: false })
            .limit(20);

        if (error) {
            _showBoardError('Could not load leaderboard.');
            return;
        }

        _renderLeaderboard(data || []);
    }

    // ── Realtime subscriptions ─────────────────────────────────────────────────

    function _subscribeFeed() {
        feedChannel = client
            .channel('live-feed-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'live_feed' },
                (payload) => _prependFeedItem(payload.new)
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') _setStatus('live');
                if (status === 'CLOSED' || status === 'CHANNEL_ERROR') _setStatus('offline');
            });
    }

    function _subscribeLeaderboard() {
        boardChannel = client
            .channel('leaderboard-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leaderboard' },
                () => _loadLeaderboard()   // re-fetch on any change for simplicity
            )
            .subscribe();
    }

    // ── DOM helpers ────────────────────────────────────────────────────────────

    function _buildFeedItem(row) {
        const icon  = TYPE_ICON[row.type] || TYPE_ICON.update;
        const time  = new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const typeClass = `feed-type-${row.type}`;
        return `
            <div class="feed-item ${typeClass}" role="listitem">
                <span class="feed-icon" aria-hidden="true">${icon}</span>
                <span class="feed-message">${_escapeHtml(row.message)}</span>
                <span class="feed-time">${time}</span>
            </div>`;
    }

    function _prependFeedItem(row) {
        const container = document.getElementById('live-feed');
        if (!container) return;

        // Remove "no updates" placeholder if present
        const empty = container.querySelector('.live-empty');
        if (empty) empty.remove();

        const div = document.createElement('div');
        div.innerHTML = _buildFeedItem(row);
        const item = div.firstElementChild;
        item.classList.add('feed-item--new');
        container.prepend(item);

        // Prune old items
        const items = container.querySelectorAll('.feed-item');
        if (items.length > FEED_MAX_ITEMS) {
            items[items.length - 1].remove();
        }
    }

    function _renderLeaderboard(rows) {
        const container = document.getElementById('leaderboard');
        if (!container) return;

        if (!rows.length) {
            container.innerHTML = '<p class="live-empty">No fans on the board yet — be the first!</p>';
            return;
        }

        container.innerHTML = rows.map((row, index) => `
            <div class="board-item" role="listitem">
                <span class="board-rank">${index + 1}</span>
                <span class="board-badge" aria-hidden="true">${_escapeHtml(row.badge)}</span>
                <span class="board-name">${_escapeHtml(row.fan_name)}</span>
                <span class="board-points">${row.points.toLocaleString()} pts</span>
            </div>`
        ).join('');
    }

    function _setStatus(state) {
        const el    = document.getElementById('live-status');
        const dot   = document.getElementById('live-dot');
        const label = document.getElementById('live-label');
        if (!el || !dot || !label) return;

        const labels = {
            connecting : 'Connecting…',
            live       : 'LIVE',
            offline    : 'Offline',
            error      : 'Error',
        };

        el.dataset.status = state;
        label.textContent = labels[state] || state;
    }

    function _showFeedError(msg) {
        const container = document.getElementById('live-feed');
        if (container) container.innerHTML = `<p class="live-empty live-error">${_escapeHtml(msg)}</p>`;
    }

    function _showBoardError(msg) {
        const container = document.getElementById('leaderboard');
        if (container) container.innerHTML = `<p class="live-empty live-error">${_escapeHtml(msg)}</p>`;
    }

    /** Basic HTML entity escaping to prevent XSS from database content. */
    function _escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ── Public API ─────────────────────────────────────────────────────────────
    return { init, destroy };

})();
