/**
 * feed.js — TYS 2026 Community Feed Module
 * Handles rendering fan posts, submitting new posts, emoji reactions,
 * and client-side moderation (length, rate-limit, content filter).
 *
 * Persistence: localStorage only — no backend required.
 */

const Feed = (() => {

    /* ------------------------------------------------------------------
       Constants
    ------------------------------------------------------------------ */
    const KEY_POSTS     = 'tys_user_posts';
    const KEY_REACTIONS = 'tys_reactions';
    const KEY_LAST_POST = 'tys_last_post_ts';

    /* Stored in sessionStorage so it persists across tab refreshes but not across sessions */
    const SESSION_AUTHOR = 'tys_author_name';

    const RATE_LIMIT_MS = 30_000;   // 30 s between posts
    const MAX_POST_CHARS = 280;
    const MAX_AUTHOR_CHARS = 30;
    const MAX_STORED_POSTS = 50;

    const EMOJIS = ['🔥', '💛', '👏'];

    /* Basic content moderation — caught phrases result in a rejection */
    const BANNED = [
        'spam', 'scam', 'http://', 'https://', 'www.',
        'fuck', 'shit', 'bitch', 'bastard', 'asshole',
        'nigger', 'nigga', 'faggot', 'retard', 'cunt',
        'kill yourself', 'kys', 'go die'
    ];

    /* Author-name: only letters, digits, spaces, underscores, dots, hyphens */
    const AUTHOR_RE = /^[A-Za-z0-9 ._-]+$/;


    /* ------------------------------------------------------------------
       Storage helpers
    ------------------------------------------------------------------ */
    function loadUserPosts() {
        try {
            const raw = JSON.parse(localStorage.getItem(KEY_POSTS) || '[]');
            if (!Array.isArray(raw)) return [];
            return raw.filter(isValidPost);
        } catch {
            return [];
        }
    }

    function saveUserPosts(posts) {
        try { localStorage.setItem(KEY_POSTS, JSON.stringify(posts)); } catch { /* storage full */ }
    }

    function loadReactions() {
        try {
            const raw = JSON.parse(localStorage.getItem(KEY_REACTIONS) || '{}');
            return raw && typeof raw === 'object' ? raw : {};
        } catch {
            return {};
        }
    }

    function saveReactions(reactions) {
        try { localStorage.setItem(KEY_REACTIONS, JSON.stringify(reactions)); } catch { /* storage full */ }
    }

    function isValidPost(p) {
        return (
            p && typeof p === 'object' &&
            typeof p.id === 'string' &&
            typeof p.author === 'string' &&
            typeof p.text === 'string' &&
            typeof p.ts === 'number' &&
            p.reactions && typeof p.reactions === 'object'
        );
    }


    /* ------------------------------------------------------------------
       Moderation
    ------------------------------------------------------------------ */

    /** Returns an error string, or null if the post passes moderation. */
    function moderate(author, text) {
        const trimmedText   = text.trim();
        const trimmedAuthor = author.trim();

        if (!trimmedText) return 'Please enter a message.';
        if (trimmedText.length < 3) return 'Message is too short.';
        if (trimmedText.length > MAX_POST_CHARS) return `Max ${MAX_POST_CHARS} characters allowed.`;

        if (trimmedAuthor && trimmedAuthor.length > MAX_AUTHOR_CHARS) {
            return `Name must be ${MAX_AUTHOR_CHARS} characters or fewer.`;
        }
        if (trimmedAuthor && !AUTHOR_RE.test(trimmedAuthor)) {
            return 'Name contains invalid characters.';
        }

        const lastTs = parseInt(localStorage.getItem(KEY_LAST_POST) || '0', 10);
        if (Date.now() - lastTs < RATE_LIMIT_MS) {
            const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastTs)) / 1000);
            return `Please wait ${wait}s before posting again.`;
        }

        const lower = trimmedText.toLowerCase();
        if (BANNED.some(w => lower.includes(w))) {
            return 'Post contains prohibited content. Please keep it respectful.';
        }

        return null;
    }


    /* ------------------------------------------------------------------
       Helpers
    ------------------------------------------------------------------ */
    function isMatchDay() {
        const matchDate = new Date(DATA.nextMatch.date);
        const diff = matchDate - Date.now();
        return diff >= -3_600_000 && diff <= 86_400_000; // -1h to +24h
    }

    function formatTime(ts) {
        const diff = Date.now() - ts;
        if (diff < 60_000)        return 'just now';
        if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}m ago`;
        if (diff < 86_400_000)    return `${Math.floor(diff / 3_600_000)}h ago`;
        return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /** Merge seed posts + user posts, apply persisted reactions, sort newest-first */
    function getAllPosts() {
        const reactions = loadReactions();
        const userPosts = loadUserPosts();

        const applyReactions = post => ({
            ...post,
            reactions: reactions[post.id]
                ? { ...reactions[post.id] }
                : { ...post.reactions }
        });

        const seed = FEED_SEED.map(applyReactions);
        const user = userPosts.map(applyReactions);

        return [...user, ...seed].sort((a, b) => b.ts - a.ts);
    }


    /* ------------------------------------------------------------------
       Rendering
    ------------------------------------------------------------------ */
    function renderPost(post) {
        const matchBadge = post.matchDay
            ? '<span class="feed-match-badge">MATCH DAY</span>'
            : '';

        const reactionBtns = EMOJIS.map(emoji => {
            const count = post.reactions[emoji] ?? 0;
            return `<button class="reaction-btn" data-post="${post.id}" data-emoji="${emoji}" aria-label="React with ${emoji}">` +
                   `<span class="r-emoji" aria-hidden="true">${emoji}</span>` +
                   `<span class="r-count">${count}</span>` +
                   `</button>`;
        }).join('');

        return `<div class="post-card" data-post-id="${escapeHtml(post.id)}">` +
               `<div class="post-header">` +
               `<span class="post-author">${escapeHtml(post.author)}</span>` +
               matchBadge +
               `<span class="post-time">${formatTime(post.ts)}</span>` +
               `</div>` +
               `<p class="post-text">${escapeHtml(post.text)}</p>` +
               `<div class="post-reactions">${reactionBtns}</div>` +
               `</div>`;
    }

    /** Re-renders the full post list */
    function render() {
        const container = document.getElementById('feed-list');
        if (!container) return;

        const posts = getAllPosts();
        container.innerHTML = posts.map(renderPost).join('');

        container.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', () => react(btn.dataset.post, btn.dataset.emoji));
        });
    }


    /* ------------------------------------------------------------------
       Reactions
    ------------------------------------------------------------------ */
    function react(postId, emoji) {
        const reactions = loadReactions();

        if (!reactions[postId]) {
            const post = getAllPosts().find(p => p.id === postId);
            reactions[postId] = post
                ? { ...post.reactions }
                : Object.fromEntries(EMOJIS.map(e => [e, 0]));
        }

        reactions[postId][emoji] = (reactions[postId][emoji] || 0) + 1;
        saveReactions(reactions);

        // Update button in-place (no full re-render)
        const btn = document.querySelector(
            `.reaction-btn[data-post="${CSS.escape(postId)}"][data-emoji="${emoji}"]`
        );
        if (btn) {
            btn.querySelector('.r-count').textContent = reactions[postId][emoji];
            btn.classList.add('reacted');
        }
    }


    /* ------------------------------------------------------------------
       Post submission
    ------------------------------------------------------------------ */
    function submit(author, text) {
        const err = moderate(author, text);
        if (err) return err;

        const post = {
            id:        'u' + Date.now(),
            author:    author.trim() || 'Fan',
            text:      text.trim(),
            ts:        Date.now(),
            reactions: Object.fromEntries(EMOJIS.map(e => [e, 0])),
            matchDay:  isMatchDay()
        };

        const posts = loadUserPosts();
        posts.unshift(post);
        if (posts.length > MAX_STORED_POSTS) posts.length = MAX_STORED_POSTS;
        saveUserPosts(posts);
        localStorage.setItem(KEY_LAST_POST, Date.now().toString());

        return null; // success
    }


    /* ------------------------------------------------------------------
       Initialisation (called once from app.js)
    ------------------------------------------------------------------ */
    function init() {
        const form = document.getElementById('feed-compose');
        if (!form) return;

        // Show match-day banner when appropriate
        if (isMatchDay()) {
            const banner = document.getElementById('match-day-banner');
            if (banner) banner.removeAttribute('hidden');
        }

        const textarea = form.querySelector('.compose-textarea');
        const counter  = form.querySelector('.char-counter');
        const errEl    = form.querySelector('.compose-error');
        const authorInput = form.querySelector('.compose-author');

        // Restore saved author name
        const savedName = sessionStorage.getItem(SESSION_AUTHOR);
        if (savedName && authorInput) authorInput.value = savedName;

        // Character counter
        if (textarea && counter) {
            textarea.addEventListener('input', () => {
                const len = textarea.value.length;
                counter.textContent = `${len} / ${MAX_POST_CHARS}`;
                counter.classList.toggle('over', len > MAX_POST_CHARS);
            });
        }

        form.addEventListener('submit', e => {
            e.preventDefault();

            const author = (authorInput?.value ?? '').trim() || 'Fan';
            const text   = textarea?.value ?? '';

            // Persist author name for session
            if (authorInput?.value.trim()) {
                sessionStorage.setItem(SESSION_AUTHOR, author);
            }

            const err = submit(author, text);
            if (err) {
                if (errEl) { errEl.textContent = err; errEl.removeAttribute('hidden'); }
                return;
            }

            if (errEl) errEl.setAttribute('hidden', '');
            if (textarea) textarea.value = '';
            if (counter)  counter.textContent = `0 / ${MAX_POST_CHARS}`;
            render();
        });
    }


    /* ------------------------------------------------------------------
       Public API
    ------------------------------------------------------------------ */
    return { init, render };

})();
