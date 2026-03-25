/**
 * news.js — TYS 2026 News Module
 * Renders static CSK news entries from DATA.news into the News page.
 * Long articles include a read-more / collapse toggle.
 */

const News = (() => {

    /** Maximum characters to show before truncating */
    const PREVIEW_LEN = 120;

    /** Render all news entries into #news-list */
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
    return { render };

})();

