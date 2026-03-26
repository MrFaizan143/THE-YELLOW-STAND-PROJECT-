/**
 * TYS Icon Utility (offline-friendly)
 * Replaces external Lucide dependency with lightweight inline glyphs so the
 * site renders without third-party requests being blocked.
 */
const Icons = (() => {

    const GLYPHS = {
        home: '🏠',
        map: '🗺️',
        shield: '🛡️',
        newspaper: '📰',
        target: '🎯',
        wrench: '🔧',
        activity: '📈',
        'share-2': '📤',
        sun: '☀️',
        moon: '🌙',
        bell: '🔔',
        'bell-off': '🔕',
        sparkles: '✨',
        x: '✕',
        pin: '📌',
        'map-pin': '📍',
        calendar: '📅',
        'calendar-check': '✅'
    };

    function renderGlyph(name, size = 16, cls = '') {
        const glyph = GLYPHS[name] || '•';
        const extra = cls ? ` ${cls}` : '';
        return `<span class="icon-glyph${extra}" style="font-size:${size}px;line-height:1" aria-hidden="true">${glyph}</span>`;
    }

    /**
     * Return an inline glyph string.
     */
    function i(name, size = 16, cls = '') {
        return renderGlyph(name, size, cls);
    }

    /**
     * Replace any [data-lucide] placeholders with inline glyphs.
     */
    function init(container) {
        const root = container || document;
        const els  = root.querySelectorAll ? Array.from(root.querySelectorAll('[data-lucide]')) : [];
        els.forEach(el => {
            const name = el.getAttribute('data-lucide');
            const size = parseInt(el.getAttribute('data-size') || '16', 10);
            el.replaceWith(createGlyphElement(name, size, el.className));
        });
    }

    function createGlyphElement(name, size, cls) {
        const span = document.createElement('span');
        span.className = `icon-glyph${cls ? ' ' + cls : ''}`;
        span.setAttribute('aria-hidden', 'true');
        span.textContent = GLYPHS[name] || '•';
        span.style.fontSize = `${size || 16}px`;
        span.style.lineHeight = '1';
        return span;
    }

    // Process static HTML icons on first paint
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }

    return { i, init };

})();
