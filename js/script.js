// =========================
// PAGE DEFINITIONS
// =========================
const pages = {
    'index.html':   { title: 'Idra Mkumbanya - Developer & Security Professional' },
    'project.html': { title: 'Projects - Idra Mkumbanya | Web Development Portfolio' },
    'aboutme.html': { title: 'About Me - Idra Mkumbanya | Developer & Security Professional' },
    'contact.html': { title: 'Contact Idra Mkumbanya - Web Developer & Security Professional' },
    'survey.html':  { title: 'Survey - Share Your Feedback | Idra Mkumbanya' },
    'blog.html':    { title: 'Blog & Writeups - Idra Mkumbanya | Security & Dev Notes' },
};

const pageCache = {};

// =========================
// AJAX PAGE LOADER
// =========================
async function loadPage(pageUrl, addToHistory = true) {
    const mainContent = document.getElementById('ajax-content');
    if (!mainContent) return;

    showLoadingIndicator(true);

    try {
        if (!pageCache[pageUrl]) {
            const res = await fetch(pageUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            pageCache[pageUrl] = await res.text();
        }

        const doc     = new DOMParser().parseFromString(pageCache[pageUrl], 'text/html');
        const newEl   = doc.querySelector('#ajax-content') || doc.querySelector('main');
        if (!newEl) throw new Error('No main content found');
        const newNodes = [...newEl.cloneNode(true).childNodes];

        mainContent.style.opacity   = '0';
        mainContent.style.transform = 'translateY(16px)';

        await wait(260);

        mainContent.replaceChildren(...newNodes);
        mainContent.style.opacity   = '1';
        mainContent.style.transform = 'translateY(0)';

        document.title = pages[pageUrl]?.title || 'Idra Mkumbanya';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        initPageFeatures(pageUrl);
        setActiveNavLink(pageUrl);

        if (addToHistory) {
            window.history.pushState({ page: pageUrl }, '', new URL(pageUrl, location.origin));
        }

    } catch (err) {
        console.error('AJAX load error:', err);
        showNotification('Could not load page — redirecting…', 'error');
        location.href = pageUrl;
    } finally {
        showLoadingIndicator(false);
    }
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// =========================
// PAGE-SPECIFIC FEATURES
// =========================
let typingTimer  = null;
let typingActive = false;

function initPageFeatures(pageUrl) {
    stopTypingAnimation();

    if (pageUrl === 'index.html') {
        setGreeting();
        initProfileImage();
        startTypingAnimation();
    }

    if (pageUrl === 'contact.html') {
        initFormspree();
    }

    if (pageUrl === 'blog.html') {
        initBlogFilters();
        initNotifyForm();
    }

    initScrollAnimations();
    initForms();
    initScrollTop();
}

// Time-based greeting
function setGreeting() {
    const el = document.getElementById('greeting');
    if (!el) return;
    const h = new Date().getHours();
    el.textContent = h < 12 ? 'Good Morning! ☀️' : h < 18 ? 'Good Afternoon! 👋' : 'Good Evening! 🌙';
}

// Profile image load/error detection
function initProfileImage() {
    const img = document.getElementById('profile-img');
    if (!img) return;
    const onLoad  = () => img.classList.add('img-loaded');
    const onError = () => img.classList.add('img-error');
    if (img.complete) {
        img.naturalWidth > 0 ? onLoad() : onError();
    } else {
        img.addEventListener('load',  onLoad);
        img.addEventListener('error', onError);
    }
}

// =========================
// TYPING ANIMATION
// =========================
const TYPING_WORDS = [
    'Web Developer',
    'Cybersecurity Analyst',
    'Network Security Student',
    'Full Stack Developer',
    'Linux Enthusiast',
    'Security Researcher',
];

function stopTypingAnimation() {
    typingActive = false;
    clearTimeout(typingTimer);
}

function startTypingAnimation() {
    const el = document.getElementById('changing-text');
    if (!el) return;

    typingActive = true;
    let wordIdx = 0;
    let charIdx = 0;
    let erasing = false;

    function tick() {
        if (!typingActive) return;
        const word = TYPING_WORDS[wordIdx];

        if (!erasing) {
            charIdx++;
            el.textContent = word.slice(0, charIdx);
            if (charIdx === word.length) {
                erasing = true;
                typingTimer = setTimeout(tick, 1600);
            } else {
                typingTimer = setTimeout(tick, 95);
            }
        } else {
            charIdx--;
            el.textContent = word.slice(0, charIdx);
            if (charIdx === 0) {
                erasing = false;
                wordIdx = (wordIdx + 1) % TYPING_WORDS.length;
                typingTimer = setTimeout(tick, 320);
            } else {
                typingTimer = setTimeout(tick, 48);
            }
        }
    }

    tick();
}

// =========================
// SCROLL REVEAL
// =========================
let scrollObserver = null;

function initScrollAnimations() {
    if (scrollObserver) scrollObserver.disconnect();

    const items = document.querySelectorAll(
        '.project-card, .bio, .skills, .timeline-item'
    );
    if (!items.length) return;

    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('slide-in');
                scrollObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    items.forEach(el => scrollObserver.observe(el));
}

// =========================
// SCROLL TO TOP
// =========================
function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =========================
// FORM HANDLERS
// =========================
function initForms() {
    // --- Contact form (basic validation only — Formspree handles submission) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm && !contactForm.dataset.bound) {
        contactForm.dataset.bound = '1';
        contactForm.addEventListener('submit', e => {
            const first   = document.getElementById('first-name')?.value.trim();
            const last    = document.getElementById('last-name')?.value.trim();
            const email   = document.getElementById('email')?.value.trim();
            const service = document.getElementById('service')?.value;
            const message = document.getElementById('message')?.value.trim();

            if (!first || !last || !email || !service || !message) {
                e.preventDefault();
                showFormStatus('Please fill in all required fields.', 'error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                e.preventDefault();
                showFormStatus('Please enter a valid email address.', 'error');
            }
            // If valid and Formspree ID is real, form submits normally (native POST)
            // AJAX override is handled by initFormspree()
        });
    }

    // --- Survey form ---
    const surveyForm = document.getElementById('survey-form');
    if (surveyForm && !surveyForm.dataset.bound) {
        surveyForm.dataset.bound = '1';
        surveyForm.addEventListener('submit', e => {
            e.preventDefault();
            const name   = document.getElementById('fullname')?.value.trim();
            const source = document.querySelector('input[name="source"]:checked');
            const rating = document.querySelector('input[name="rating"]:checked');

            if (!name) {
                showNotification('Please enter your name.', 'error');
                return;
            }
            if (!source) {
                showNotification('Please tell us how you found this portfolio.', 'error');
                return;
            }
            if (!rating) {
                showNotification('Please rate the portfolio.', 'error');
                return;
            }
            showNotification('Thank you for your feedback! It means a lot. 🙏', 'success');
            surveyForm.reset();
        });
    }
}

// =========================
// FORMSPREE AJAX SUBMISSION
// =========================
function initFormspree() {
    const form   = document.getElementById('contact-form');
    const btn    = document.getElementById('contact-submit');
    if (!form || !btn) return;
    // Only override if the Formspree ID has been set
    if (form.action.includes('YOUR_FORMSPREE_ID')) return;
    if (form.dataset.formspree) return;
    form.dataset.formspree = '1';

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const first   = document.getElementById('first-name')?.value.trim();
        const last    = document.getElementById('last-name')?.value.trim();
        const email   = document.getElementById('email')?.value.trim();
        const service = document.getElementById('service')?.value;
        const message = document.getElementById('message')?.value.trim();

        if (!first || !last || !email || !service || !message) {
            showFormStatus('Please fill in all required fields.', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFormStatus('Please enter a valid email address.', 'error');
            return;
        }

        btn.classList.add('loading');
        btn.textContent = 'Sending…';

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });

            if (res.ok) {
                showFormStatus('🎉 Message sent! I\'ll get back to you within 24 hours.', 'success');
                form.reset();
            } else {
                const data = await res.json().catch(() => ({}));
                showFormStatus(data?.errors?.[0]?.message || 'Something went wrong. Please try again.', 'error');
            }
        } catch (_) {
            showFormStatus('Network error. Please check your connection and try again.', 'error');
        } finally {
            btn.classList.remove('loading');
            btn.textContent = '✨ SEND MESSAGE';
        }
    });
}

function showFormStatus(msg, type) {
    const status = document.getElementById('form-status-msg');
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-status ' + type;
    status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (type === 'success') setTimeout(() => { status.className = 'form-status'; }, 6000);
}

// =========================
// BLOG FILTERS
// =========================
function initBlogFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards      = document.querySelectorAll('.blog-grid .blog-card');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('hidden-card', !match);
            });
        });
    });
}

// =========================
// BLOG NOTIFY FORM
// =========================
function initNotifyForm() {
    const btn   = document.getElementById('notify-btn');
    const input = document.getElementById('notify-email');
    if (!btn || !input || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
        const email = input.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        showNotification('📬 Got it! I\'ll notify you when new posts go live.', 'success');
        input.value = '';
    });
}

// =========================
// NAVIGATION HELPERS
// =========================
function setActiveNavLink(pageUrl) {
    document.querySelectorAll('#nav-menu a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === pageUrl);
    });
}

function bindNavLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
        if (link.dataset.bound) return;
        const href = link.getAttribute('href');
        if (!href || !pages[href] || link.target === '_blank') return;
        link.dataset.bound = '1';
        link.addEventListener('click', e => {
            e.preventDefault();
            loadPage(href);
        });
    });
}

// =========================
// LOADING INDICATOR
// =========================
function showLoadingIndicator(show) {
    let loader = document.getElementById('ajax-loader');
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'ajax-loader';
            loader.innerHTML = '<div class="loader-spinner"></div>';
            document.body.appendChild(loader);
        }
        loader.style.display = 'block';
    } else if (loader) {
        loader.style.display = 'none';
    }
}

// =========================
// NOTIFICATION TOAST
// =========================
function showNotification(message, type = 'success') {
    document.querySelector('.notification')?.remove();
    const n = document.createElement('div');
    n.className        = 'notification';
    n.textContent      = message;
    n.style.background = type === 'error' ? '#ef4444' : type === 'info' ? '#8b5cf6' : 'var(--accent)';
    n.style.color      = type === 'error' ? '#fff'    : '#020617';
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3500);
}

// =========================
// BROWSER BACK / FORWARD
// =========================
window.addEventListener('popstate', e => {
    const page = e.state?.page
        || location.pathname.split('/').pop()
        || 'index.html';
    loadPage(page, false);
});

// =========================
// DOM READY — BOOTSTRAP
// =========================
document.addEventListener('DOMContentLoaded', () => {

    // ── Theme toggle ──────────────────────────────────────
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        if (localStorage.getItem('theme') === 'light') {
            document.documentElement.classList.add('light-mode');
            themeBtn.textContent = '☀️';
        }
        themeBtn.addEventListener('click', () => {
            const isLight = document.documentElement.classList.toggle('light-mode');
            themeBtn.textContent = isLight ? '☀️' : '🌙';
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // ── CV button ─────────────────────────────────────────
    const cvBtn = document.getElementById('download-cv');
    if (cvBtn) {
        cvBtn.addEventListener('click', e => {
            e.preventDefault();
            showNotification('CV coming soon — contact me directly for my resume.', 'info');
        });
    }

    // ── Hamburger menu ────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('nav-menu');
    const overlay   = document.getElementById('menu-overlay');

    if (hamburger && navMenu) {
        const closeMenu = () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            overlay?.classList.remove('show');
            document.body.style.overflow = '';
        };
        const openMenu = () => {
            navMenu.classList.add('open');
            hamburger.classList.add('active');
            overlay?.classList.add('show');
            document.body.style.overflow = 'hidden';
        };

        hamburger.addEventListener('click', () =>
            navMenu.classList.contains('open') ? closeMenu() : openMenu()
        );
        navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        overlay?.addEventListener('click', closeMenu);
        window.addEventListener('resize', () => { if (window.innerWidth > 700) closeMenu(); });
    }

    // ── MutationObserver: re-bind links after AJAX swaps ──
    const ajaxRoot = document.getElementById('ajax-content') || document.body;
    new MutationObserver(bindNavLinks).observe(ajaxRoot, { childList: true, subtree: true });

    // ── Determine current page & initialise ───────────────
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const knownPage   = pages[currentPage] ? currentPage : 'index.html';

    setActiveNavLink(knownPage);
    initPageFeatures(knownPage);
    bindNavLinks();

    history.replaceState({ page: knownPage }, '', location.href);

    // ── Preload adjacent pages ────────────────────────────
    setTimeout(() => {
        const keys = Object.keys(pages);
        const idx  = keys.indexOf(knownPage);
        [idx - 1, idx + 1].forEach(i => {
            if (i >= 0 && i < keys.length && !pageCache[keys[i]]) {
                fetch(keys[i])
                    .then(r => r.text())
                    .then(h => { pageCache[keys[i]] = h; })
                    .catch(() => {});
            }
        });
    }, 1200);
});