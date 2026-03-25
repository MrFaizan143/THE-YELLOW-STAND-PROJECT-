/**
 * news.js — TYS 2026 News Module
 * Fetches live CSK / IPL news from the ESPN Cricinfo RSS feed (via rss2json.com —
 * free, no API key required).  Falls back to the static DATA.news entries when the
 * network is unavailable or the feed returns no results.
 *
 * Live feed results are cached in sessionStorage for 1 hour to reduce unnecessary
 * network requests.  A "Refresh" button lets users bypass the cache at any time.
 *
 * Long articles include a read-more / collapse toggle.
 */

const News = (() => {

    /** Maximum characters to show before truncating */
    const PREVIEW_LEN = 120;

    /** sessionStorage key for cached articles */
    const CACHE_KEY      = 'tys_news_cache';
    /** Cache lifetime: 1 hour in ms */
    const CACHE_TTL_MS   = 3_600_000;

    /**
     * rss2json.com — free CORS-friendly RSS-to-JSON proxy.
     * No registration or API key required (≈ 10 000 free req/day).
     */
    const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';

    /**
     * ESPN Cricinfo general cricket news feed.
     * Filtered client-side for CSK / IPL articles.
     */
    const ESPN_FEED_URL = 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml';

    /** Returns true if an RSS item is relevant to CSK / IPL */
    function isCSKRelevant(item) {
        const text = (item.title || '') + ' ' + (item.description || '');
        return /csk|chennai|ipl|indian premier/i.test(text);
    }

    /**
     * Format an RSS pubDate string as "MMM YYYY" (e.g. "APR 2026").
     * Falls back to an empty string if the date cannot be parsed.
     */
    function formatPubDate(pubDate) {
        if (!pubDate) return '';
        try {
            return new Date(pubDate)
                .toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                .toUpperCase();
        } catch (_) {
            return '';
        }
    }

    /**
     * Returns a human-readable "time ago" string for an RSS pubDate,
     * e.g. "2 hours ago", "yesterday", "3 days ago".
     */
    function timeAgo(pubDate) {
        if (!pubDate) return '';
        try {
            const diff = Date.now() - new Date(pubDate).getTime();
            const mins  = Math.floor(diff / 60_000);
            const hours = Math.floor(diff / 3_600_000);
            const days  = Math.floor(diff / 86_400_000);
            if (mins < 2)   return 'just now';
            if (mins < 60)  return `${mins}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days === 1) return 'yesterday';
            return `${days}d ago`;
        } catch (_) {
            return '';
        }
    }

    /** Escape a string so it is safe to embed in an HTML attribute or text node */
    function escapeHtml(str) {
        return (str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Build a live news article element using DOM APIs (never innerHTML) for
     * user-supplied text, so that content from the RSS feed cannot inject HTML.
     */
    function createLiveArticle(item) {
        const article = document.createElement('article');
        article.className = 'news-item';
        article.setAttribute('aria-expanded', 'true');

        const date = formatPubDate(item.pubDate);
        const ago  = timeAgo(item.pubDate);
        if (date || ago) {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = ago || date;
            article.appendChild(tag);
        }

        const h3 = document.createElement('h3');
        h3.className = 'news-headline';

        // Only allow http/https links to prevent javascript: injection
        const safeLink = /^https?:\/\//i.test(item.link || '') ? item.link : '#';
        const a = document.createElement('a');
        a.href = safeLink;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'news-link';
        a.setAttribute('aria-label', `Read full article: ${escapeHtml(item.title)}`);
        a.textContent = item.title || '';
        h3.appendChild(a);
        article.appendChild(h3);

        // Extract plain-text snippet from the description (no regex tag stripping needed
        // because we set textContent, not innerHTML — the browser handles the decoding)
        const tmp = document.createElement('div');
        tmp.innerHTML = item.description || '';
        const snippet = (tmp.textContent || tmp.innerText || '').slice(0, 300).trimEnd();
        if (snippet) {
            const p = document.createElement('p');
            p.className = 'news-body';
            p.textContent = snippet;
            article.appendChild(p);
        }

        return article;
    }

    // -------------------------------------------------------------------------
    // Cache helpers
    // -------------------------------------------------------------------------

    /** Save live articles to sessionStorage with a timestamp */
    function saveCache(items) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                ts: Date.now(),
                items
            }));
        } catch (_) { /* storage quota exceeded — skip caching */ }
    }

    /**
     * Load articles from sessionStorage if they are fresher than CACHE_TTL_MS.
     * Returns null when no valid cache exists.
     */
    function loadCache() {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const { ts, items } = JSON.parse(raw);
            if (Date.now() - ts < CACHE_TTL_MS && Array.isArray(items)) return { ts, items };
        } catch (_) { /* corrupt cache */ }
        return null;
    }

    /** Format a cached timestamp as "Last updated X min ago" */
    function cacheAgeLabel(ts) {
        const mins = Math.floor((Date.now() - ts) / 60_000);
        return mins < 1 ? 'Updated just now' : `Updated ${mins}m ago`;
    }

    // -------------------------------------------------------------------------
    // Rendering
    // -------------------------------------------------------------------------

    /**
     * Inject the refresh bar (showing last-updated time + Refresh button)
     * into the #news-list container above the article list.
     */
    function injectRefreshBar(container, ts, onRefresh) {
        const bar = document.createElement('div');
        bar.className = 'news-refresh-bar';
        bar.id = 'news-refresh-bar';

        const label = document.createElement('span');
        label.className = 'news-last-updated';
        label.id = 'news-last-updated-label';
        label.textContent = ts ? cacheAgeLabel(ts) : '';

        const btn = document.createElement('button');
        btn.className = 'news-refresh-btn';
        btn.textContent = '↻ Refresh';
        btn.setAttribute('aria-label', 'Refresh news');

        btn.addEventListener('click', () => {
            btn.disabled = true;
            btn.textContent = '⏳ Loading…';
            onRefresh().finally(() => {
                btn.disabled = false;
                btn.textContent = '↻ Refresh';
            });
        });

        bar.appendChild(label);
        bar.appendChild(btn);
        container.insertBefore(bar, container.firstChild);
    }

    /**
     * Fetch live news from ESPN Cricinfo via rss2json.com and render them into
     * #news-list.  Falls back to the static DATA.news entries on any failure.
     * @param {boolean} [force=false]  Skip cache and always fetch from network.
     */
    async function fetchAndRender(force = false) {
        const container = document.getElementById('news-list');
        if (!container) return;

        // Check cache first (unless force refresh)
        if (!force) {
            const cached = loadCache();
            if (cached) {
                container.innerHTML = '';
                cached.items.forEach(item => container.appendChild(createLiveArticle(item)));
                injectRefreshBar(container, cached.ts, () => fetchAndRender(true));
                return;
            }
        }

        // Show skeleton loader while fetching
        container.innerHTML = Array.from({ length: 4 }, () => `
            <div class="skeleton-card" aria-hidden="true">
                <div class="skeleton skeleton--tag"></div>
                <div class="skeleton skeleton--title"></div>
                <div class="skeleton skeleton--body"></div>
                <div class="skeleton skeleton--body skeleton--short"></div>
            </div>`).join('');

        try {
            const url = RSS2JSON_BASE + encodeURIComponent(ESPN_FEED_URL);
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json = await res.json();
            if (json.status !== 'ok' || !Array.isArray(json.items) || json.items.length === 0) {
                throw new Error('Feed returned no items');
            }

            // Prefer CSK / IPL items; if none match, show all items (still cricket news)
            const cskItems  = json.items.filter(isCSKRelevant);
            const liveItems = (cskItems.length > 0 ? cskItems : json.items).slice(0, 12);

            saveCache(liveItems);

            container.innerHTML = '';
            liveItems.forEach(item => container.appendChild(createLiveArticle(item)));
            injectRefreshBar(container, Date.now(), () => fetchAndRender(true));

        } catch (err) {
            console.warn('[News] Live fetch failed, using static data:', err.message);
            if (typeof Toast !== 'undefined') {
                Toast.show('Live news unavailable — showing cached updates.', 'warn');
            }
            render();
        }
    }

    /** Render all static news entries from DATA.news into #news-list */
    function render() {
        const container = document.getElementById('news-list');
        if (!container) return;

        if (!Array.isArray(DATA.news) || DATA.news.length === 0) {
            container.innerHTML = '<p class="news-empty">No updates yet. Check back soon.</p>';
            return;
        }

        container.innerHTML = DATA.news.map((item, i) => {
            const body    = item.body || '';
            const isLong  = body.length > PREVIEW_LEN;
            const preview = isLong ? body.slice(0, PREVIEW_LEN).trimEnd() + '…' : body;

            return `
            <article class="news-item" aria-expanded="${!isLong}">
                <span class="tag">${item.date}</span>
                <h3 class="news-headline">${item.headline}</h3>
                <p class="news-body">${isLong ? preview : body}</p>
                ${isLong ? `
                <button class="news-toggle-btn" data-idx="${i}" aria-expanded="false"
                        aria-label="Read more about: ${item.headline}">
                    Read more
                </button>` : ''}
            </article>`;
        }).join('');

        // Bind toggle buttons
        container.querySelectorAll('.news-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx     = parseInt(btn.dataset.idx, 10);
                const article = btn.closest('.news-item');
                const isOpen  = btn.getAttribute('aria-expanded') === 'true';
                const body    = DATA.news[idx].body;

                const bodyEl  = article.querySelector('.news-body');
                if (isOpen) {
                    const preview = body.slice(0, PREVIEW_LEN).trimEnd() + '…';
                    bodyEl.textContent = preview;
                    btn.textContent = 'Read more';
                    btn.setAttribute('aria-expanded', 'false');
                    article.setAttribute('aria-expanded', 'false');
                } else {
                    bodyEl.textContent = body;
                    btn.textContent = 'Show less';
                    btn.setAttribute('aria-expanded', 'true');
                    article.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    /** Public API */
    return { render, fetchAndRender };

})();

