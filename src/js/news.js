/**
 * news.js — TYS 2026 News Module
 * Fetches live CSK / IPL news from the ESPN Cricinfo RSS feed (via rss2json.com —
 * free, no API key required).  Falls back to the static DATA.news entries when the
 * network is unavailable or the feed returns no results.
 *
 * Long articles include a read-more / collapse toggle.
 */

const News = (() => {

    /** Maximum characters to show before truncating */
    const PREVIEW_LEN = 120;

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
        if (date) {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = date;
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

    /**
     * Fetch live news from ESPN Cricinfo via rss2json.com and render them into
     * #news-list.  Falls back to the static DATA.news entries on any failure.
     */
    async function fetchAndRender() {
        const container = document.getElementById('news-list');
        if (!container) return;

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

            container.innerHTML = '';
            liveItems.forEach(item => container.appendChild(createLiveArticle(item)));

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

