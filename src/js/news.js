/**
 * news.js — TYS 2026 News Module
 * Renders static CSK news entries from DATA.news into the News page.
 */

const News = (() => {

    /** Render all news entries into #news-list */
    function render() {
        const container = document.getElementById('news-list');
        if (!container) return;

        if (!Array.isArray(DATA.news) || DATA.news.length === 0) {
            container.innerHTML = '<p class="news-empty">No updates yet. Check back soon.</p>';
            return;
        }

        container.innerHTML = DATA.news.map(item => `
            <article class="news-item">
                <span class="tag">${item.date}</span>
                <h3 class="news-headline">${item.headline}</h3>
                <p class="news-body">${item.body}</p>
            </article>
        `).join('');
    }

    /** Public API */
    return { render };

})();
