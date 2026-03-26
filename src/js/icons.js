/**
 * TYS Icon Utility
 * Thin wrapper around Lucide icons for use in dynamically generated HTML strings.
 *
 * Usage:
 *   Icons.i('home', 20)         → '<svg data-lucide="home" ...></svg>'
 *   Icons.init(containerEl)     → processes any pending [data-lucide] elements
 */
const Icons = (() => {

    /**
     * Return an SVG placeholder element that Lucide will replace with the real icon.
     * Always call Icons.init(container) after inserting the HTML into the DOM.
     *
     * @param {string} name  – Lucide icon name in kebab-case (e.g. 'map-pin')
     * @param {number} [size] – Width/height in px. Default 16.
     * @param {string} [cls]  – Extra CSS class string.
     * @returns {string} HTML string with a data-lucide placeholder.
     */
    function i(name, size = 16, cls = '') {
        const c = cls ? ` class="${cls}"` : '';
        return `<svg xmlns="http://www.w3.org/2000/svg"` +
               ` width="${size}" height="${size}"` +
               ` viewBox="0 0 24 24" fill="none"` +
               ` stroke="currentColor" stroke-width="2"` +
               ` stroke-linecap="round" stroke-linejoin="round"` +
               ` data-lucide="${name}" aria-hidden="true"${c}></svg>`;
    }

    /**
     * Process all un-rendered [data-lucide] elements within a container.
     * Call this after setting innerHTML on any element that contains Icons.i() output.
     *
     * @param {Element|Document} [container] – Root to search within. Defaults to document.
     */
    function init(container) {
        if (!window.lucide) return;
        const root = container || document;
        const els  = root.querySelectorAll ? Array.from(root.querySelectorAll('[data-lucide]')) : [];
        if (els.length) lucide.createIcons({ elements: els });
    }

    // Process static HTML icons on first paint
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }

    return { i, init };

})();
