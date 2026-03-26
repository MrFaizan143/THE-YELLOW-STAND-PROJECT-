/**
 * TYS Icon Utility (offline-friendly)
 * Modern inline SVG icons with no external requests; replaces the legacy emoji set.
 */
const Icons = (() => {

    const ICONS = {
        home: {
            body: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10.75V19a1.75 1.75 0 0 0 1.75 1.75h8.5A1.75 1.75 0 0 0 18 19v-8.25"/><path d="M10 20.5v-5.5h4v5.5"/>'
        },
        map: {
            body: '<path d="M9 5 15 3v16l-6 2-6-2V3z"/><path d="m9 5 6 2"/><path d="M3 3l6 2v16"/><path d="m9 13 6 2"/>'
        },
        shield: {
            body: '<path d="M12 3 5 6v6c0 4.4 3.1 6.8 7 8 3.9-1.2 7-3.6 7-8V6z"/><path d="M12 12v7"/>'
        },
        newspaper: {
            body: '<path d="M5 6h14a1 1 0 0 1 1 1v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a2 2 0 0 1 2-2z"/><path d="M16 4v4"/><path d="M8 11h8"/><path d="M8 15h5"/><path d="M8 7h4"/>'
        },
        target: {
            body: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5"/><path d="M21.5 12H19"/><path d="M12 21.5V19"/><path d="M2.5 12H5"/>'
        },
        wrench: {
            body: '<path d="M14.5 5.5a4.5 4.5 0 0 0-6.3 5.8l-4.2 4.2a2.1 2.1 0 1 0 3 3l4.2-4.2a4.5 4.5 0 0 0 5.8-6.3l-3 3-2.5-2.5z"/>'
        },
        activity: {
            body: '<path d="M4 12h3l2.4-6 3.2 12 2.5-7H20"/>'
        },
        'share-2': {
            body: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.3 10.9 15.7 7"/><path d="m8.3 13.1 7.4 3.9"/>'
        },
        sun: {
            body: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9 6.4 6.4"/><path d="M17.6 17.6 19.1 19.1"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 19.1 6.4 17.6"/><path d="M17.6 6.4 19.1 4.9"/>'
        },
        moon: {
            body: '<path d="M21 12.5A9.5 9.5 0 0 1 11.5 3a7.5 7.5 0 1 0 9.5 9.5z"/>'
        },
        bell: {
            body: '<path d="M18 8a6 6 0 1 0-12 0c0 7-2 9-2 9h16s-2-2-2-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>'
        },
        'bell-off': {
            body: '<path d="M6.1 6.1A5.9 5.9 0 0 0 6 8c0 7-2 9-2 9h12"/><path d="M18.4 14.4c.35-.75.6-1.67.6-2.9a6 6 0 0 0-7-5.9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/><path d="m3 3 18 18"/>'
        },
        sparkles: {
            body: '<path d="M12 4.5 13.6 8.7 18 10l-4.4 1.3L12 15.5l-1.6-4.2L6 10l4.4-1.3Z"/><path d="M6 4l.6 1.6L8 6l-1.4.4L6 8l-.6-1.6L4 6l1.4-.4Z"/><path d="M18 14l.5 1.2 1.2.4-1.2.4-.5 1.2-.4-1.2-1.2-.4 1.2-.4Z"/>',
            animated: true
        },
        x: {
            body: '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>'
        },
        pin: {
            body: '<path d="M12 17v5"/><path d="M8 5h8l-1 6H9z"/><path d="m9 11-4 4"/><path d="m15 11 4 4"/>'
        },
        'map-pin': {
            body: '<path d="M12 21s7-6.1 7-11.5S16.4 3 12 3 5 5.6 5 9.5 12 21 12 21z"/><circle cx="12" cy="10" r="3"/>'
        },
        calendar: {
            body: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 9h16"/>'
        },
        'calendar-check': {
            body: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 9h16"/><path d="m9 14 2 2 4-4"/>'
        },
        list: {
            body: '<path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'
        },
        grid: {
            body: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
        },
        ticket: {
            body: '<path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 0 0 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a1 1 0 0 0 0-2z"/><path d="M9 3v3"/><path d="M9 15v3"/><path d="M9 11v2"/>'
        },
        default: {
            body: '<circle cx="12" cy="12" r="5"/>'
        }
    };

    function iconDef(name) {
        return ICONS[name] || ICONS.default;
    }

    function renderIcon(name, size = 16, cls = '') {
        const def = iconDef(name);
        const extra = cls ? ` ${cls}` : '';
        const animated = def.animated ? ' icon--sparkle' : '';
        return `<svg class="icon-glyph${extra}${animated}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${def.body}</svg>`;
    }

    /**
     * Return an inline SVG string.
     */
    function i(name, size = 16, cls = '') {
        return renderIcon(name, size, cls);
    }

    /**
     * Replace any [data-lucide] placeholders with inline SVG icons.
     */
    function init(container) {
        const root = container || document;
        const els  = root.querySelectorAll ? Array.from(root.querySelectorAll('[data-lucide]')) : [];
        els.forEach(el => {
            const name = el.getAttribute('data-lucide');
            const size = parseInt(el.getAttribute('data-size') || '16', 10);
            el.replaceWith(createIconElement(name, size, el.className));
        });
    }

    function createIconElement(name, size, cls) {
        const def = iconDef(name);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const classes = ['icon-glyph'];
        if (cls) classes.push(cls);
        if (def.animated) classes.push('icon--sparkle');
        svg.setAttribute('class', classes.join(' '));
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size || 16);
        svg.setAttribute('height', size || 16);
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.8');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.innerHTML = def.body;
        return svg;
    }

    // Process static HTML icons on first paint
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }

    return { i, init };

})();
