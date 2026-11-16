// =========================
// PAGE TITLES (kept for reference)
// =========================
const pageTitles = {
    'index.html':   'Idra Mkumbanya - Developer & Security Professional',
    'project.html': 'Projects - Idra Mkumbanya | Web Development Portfolio',
    'aboutme.html': 'About Me - Idra Mkumbanya | Developer & Security Professional',
    'contact.html': 'Contact Idra Mkumbanya - Web Developer & Security Professional',
    'survey.html':  'Survey - Share Your Feedback | Idra Mkumbanya',
    'blog.html':    'Blog & Writeups - Idra Mkumbanya | Security & Dev Notes',
};

// =========================================================
// APPEARANCE / THEME SYSTEM
// =========================================================
const APPEARANCE_STORAGE_KEY = 'portfolio_theme';
const LEGACY_STORAGE_KEY     = 'theme';

function getStoredAppearance() {
    try {
        return localStorage.getItem(APPEARANCE_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    } catch (_) {
        return null;
    }
}

function getSystemAppearance() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'dark';
}

function getActiveAppearance() {
    return getStoredAppearance() || getSystemAppearance();
}

function updateThemeMetaTag(isLight) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', isLight ? '#fafafa' : '#000000');
}

function syncAppearanceControls(theme) {
    const isLight  = theme === 'light';
    const icon     = isLight ? '☀️' : '🌙';
    const label    = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';

    // 1. Toggle root class & browser theme color
    document.documentElement.classList.toggle('light-mode', isLight);
    updateThemeMetaTag(isLight);

    // 2. Sync all appearance toggle buttons
    const toggles = document.querySelectorAll('.theme-toggle, #theme-toggle, [data-appearance-toggle]');
    toggles.forEach(btn => {
        btn.textContent = icon;
        btn.setAttribute('aria-label', label);
        btn.setAttribute('title', label);
        btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    });
}

function setAppearance(theme, persist = true) {
    if (persist) {
        try {
            localStorage.setItem(APPEARANCE_STORAGE_KEY, theme);
            localStorage.setItem(LEGACY_STORAGE_KEY, theme);
        } catch (_) {}
    }
    syncAppearanceControls(theme);
    window.dispatchEvent(new CustomEvent('appearancechange', { detail: { theme } }));
}

function toggleAppearance() {
    const current = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    setAppearance(next, true);
    return next;
}

function initAppearance() {
    // Initial sync
    const active = getActiveAppearance();
    syncAppearanceControls(active);

    // Event listener for appearance toggle buttons
    const toggles = document.querySelectorAll('.theme-toggle, #theme-toggle, [data-appearance-toggle]');
    toggles.forEach(btn => {
        if (btn.dataset.appearanceBound) return;
        btn.dataset.appearanceBound = '1';
        btn.addEventListener('click', e => {
            e.preventDefault();
            toggleAppearance();
        });
    });

    // Listen for OS scheme changes if user hasn't chosen manually
    if (window.matchMedia) {
        const media = window.matchMedia('(prefers-color-scheme: light)');
        const listener = (e) => {
            if (!getStoredAppearance()) {
                syncAppearanceControls(e.matches ? 'light' : 'dark');
            }
        };
        if (media.addEventListener) {
            media.addEventListener('change', listener);
        } else if (media.addListener) {
            media.addListener(listener);
        }
    }
}

// =========================================================
// NAVIGATION DRAWER (HAMBURGER)
// =========================================================
function initNavigationDrawer() {
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('nav-menu');
    const overlay   = document.getElementById('menu-overlay');

    if (!hamburger || !navMenu) return;

    const closeMenu = () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        if (overlay) overlay.classList.remove('show');
        document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
        navMenu.classList.add('open');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        if (overlay) overlay.classList.add('show');
        document.body.classList.add('menu-open');
    };

    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', 'nav-menu');

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Handle link clicks inside the drawer
    navMenu.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';

        // If it's an in-page anchor, close drawer smoothly
        if (href.startsWith('#')) {
            closeMenu();
            return;
        }

        // If clicking the page we are already on, close drawer
        const targetFile = href.split('/').pop().split('#')[0];
        const currentFile = location.pathname.split('/').pop() || 'index.html';
        if (targetFile === currentFile) {
            closeMenu();
        }
        // For navigating to another page, allow natural browser navigation without reflow cancellation
    });

    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    // Close on Escape key press
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 700) {
            closeMenu();
        }
    });

    window.addEventListener('pageshow', e => {
        if (e.persisted) {
            closeMenu();
        }
    });
}

// =========================
// DOM READY
// =========================
document.addEventListener('DOMContentLoaded', () => {

    // ── Appearance & Navigation System ────────────────────
    initAppearance();
    initNavigationDrawer();

    // ── CV button (desktop header) ────────────────────────
    const cvBtn = document.getElementById('download-cv');
    if (cvBtn) {
        cvBtn.addEventListener('click', e => {
            e.preventDefault();
            showNotification('CV coming soon — contact me directly for my resume.', 'info');
        });
    }

    // ── Active nav link ───────────────────────────────────
    // Works from root AND from post/ subfolder (../blog.html → blog.html)
    let currentFile = location.pathname.split('/').pop() || 'index.html';

    // If we are viewing a post page, highlight the BLOG nav item
    if (location.pathname.includes('/post/')) {
        currentFile = 'blog.html';
    }

    document.querySelectorAll('#nav-menu a').forEach(a => {
        const href = a.getAttribute('href') || '';
        const file = href.split('/').pop();
        a.classList.toggle('active', file === currentFile);
    });

    // ── Page-specific features ────────────────────────────
    runPageFeatures(currentFile);
    initScrollProgress();
    initSkillBars();
    initProjectFilters();
});

// =========================
// PAGE FEATURES
// =========================
function runPageFeatures(page) {
    if (page === 'index.html' || page === '') {
        setGreeting();
        initProfileImage();
        startTypingAnimation();
    }
    if (page === 'contact.html') initFormspree();
    if (page === 'blog.html')    { initBlogFilters(); initNotifyForm(); }
    initScrollReveal();
    initSurveyForm();
    initScrollTop();
    renderReviews();
    initSpotlightGlow();
}

// =========================
// GREETING
// =========================
function setGreeting() {
    const el = document.getElementById('greeting');
    if (!el) return;
    const h = new Date().getHours();
    el.textContent = h < 12 ? 'Good Morning! ☀️'
                   : h < 18 ? 'Good Afternoon! 👋'
                   :          'Good Evening! 🌙';
}

// =========================
// PROFILE IMAGE
// =========================
function initProfileImage() {
    const img = document.getElementById('profile-img');
    if (!img) return;
    const onLoad  = () => img.classList.add('img-loaded');
    const onError = () => img.classList.add('img-error');
    if (img.complete) {
        img.naturalWidth > 0 ? onLoad() : onError();
    } else {
        img.addEventListener('load',  onLoad,  { once: true });
        img.addEventListener('error', onError, { once: true });
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

let typingTimer  = null;
let typingActive = false;

function stopTypingAnimation() {
    typingActive = false;
    clearTimeout(typingTimer);
}

function startTypingAnimation() {
    stopTypingAnimation();
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
            el.textContent = word.slice(0, ++charIdx);
            if (charIdx === word.length) {
                erasing = true;
                typingTimer = setTimeout(tick, 1600);
            } else {
                typingTimer = setTimeout(tick, 95);
            }
        } else {
            el.textContent = word.slice(0, --charIdx);
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
let revealObserver = null;

function initScrollReveal() {
    if (revealObserver) revealObserver.disconnect();
    const els = document.querySelectorAll(
        '.project-card, .bio, .skills, .timeline-item'
    );
    if (!els.length) return;
    revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('slide-in');
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(el => revealObserver.observe(el));
}

// =========================
// SCROLL PROGRESS
// =========================
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        bar.style.width = scrolled + '%';
    });
}

// =========================
// SKILL BARS ANIMATION
// =========================
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    if (!skillBars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.getAttribute('data-width');
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.1 });

    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

// =========================
// PROJECT FILTERING
// =========================
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.project-filters .filter-btn');
    const projectCards = document.querySelectorAll('.projects-grid .project-card');
    
    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                const matches = (filterValue === 'all' || filterValue === category);
                if (matches) {
                    card.classList.remove('is-hidden');
                    card.classList.add('slide-in');
                    card.classList.remove('filter-animate');
                    void card.offsetWidth;
                    card.classList.add('filter-animate');
                    setTimeout(() => {
                        card.classList.remove('filter-animate');
                    }, 350);
                } else {
                    card.classList.add('is-hidden');
                    card.classList.remove('filter-animate');
                }
            });
        });
    });
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
// SURVEY FORM
// =========================
function initSurveyForm() {
    const form = document.getElementById('survey-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name   = document.getElementById('fullname')?.value.trim();
        const sourceEl = document.querySelector('input[name="source"]:checked');
        const ratingEl = document.querySelector('input[name="rating"]:checked');
        const likes = document.getElementById('likes')?.value.trim();
        const improvements = document.getElementById('improvements')?.value.trim();
        const comments = document.getElementById('comments')?.value.trim();

        if (!name)   { showNotification('Please enter your name.', 'error'); return; }
        if (!sourceEl) { showNotification('Please tell us how you found this portfolio.', 'error'); return; }
        if (!ratingEl) { showNotification('Please rate the portfolio.', 'error'); return; }

        const rating = parseInt(ratingEl.value, 10);
        const sourceVal = sourceEl.value;
        const sourceLabels = {
            friend: "Friend / Colleague",
            internet: "Internet Search",
            social: "Social Media",
            github: "GitHub visitor",
            other: "Visitor"
        };
        const role = sourceLabels[sourceVal] || "Visitor";
        
        let text = comments || likes || improvements || `Rated ${rating}/5 stars!`;

        const newReview = {
            name: name,
            role: role,
            rating: rating,
            text: text
        };

        const localData = localStorage.getItem('portfolio_reviews');
        const localReviews = localData ? JSON.parse(localData) : [];
        localReviews.push(newReview);
        localStorage.setItem('portfolio_reviews', JSON.stringify(localReviews));

        showNotification('Thank you for your feedback! 🙏', 'success');
        form.reset();
        
        // Re-render testimonials instantly
        renderReviews();
    });
}

// =========================
// FORMSPREE CONTACT FORM
// =========================
function initFormspree() {
    const form = document.getElementById('contact-form');
    const btn  = document.getElementById('contact-submit');
    if (!form || !btn || form.dataset.bound) return;
    if (form.action.includes('YOUR_FORMSPREE_ID')) return;
    form.dataset.bound = '1';

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const first   = document.getElementById('first-name')?.value.trim();
        const last    = document.getElementById('last-name')?.value.trim();
        const email   = document.getElementById('email')?.value.trim();
        const service = document.getElementById('service')?.value;
        const message = document.getElementById('message')?.value.trim();

        if (!first || !last || !email || !service || !message) {
            showFormStatus('Please fill in all required fields.', 'error'); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFormStatus('Please enter a valid email address.', 'error'); return;
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
                showFormStatus('🎉 Message sent! I\'ll reply within 24 hours.', 'success');
                form.reset();
            } else {
                const d = await res.json().catch(() => ({}));
                showFormStatus(d?.errors?.[0]?.message || 'Something went wrong.', 'error');
            }
        } catch (_) {
            showFormStatus('Network error. Check your connection.', 'error');
        } finally {
            btn.classList.remove('loading');
            btn.textContent = '✨ SEND MESSAGE';
        }
    });
}

function showFormStatus(msg, type) {
    const el = document.getElementById('form-status-msg');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'form-status ' + type;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (type === 'success') setTimeout(() => { el.className = 'form-status'; }, 6000);
}

// =========================
// BLOG FILTERS
// =========================
function initBlogFilters() {
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.blog-grid .blog-card');
    if (!btns.length) return;
    btns.forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const f = btn.dataset.filter;
            cards.forEach(c => {
                c.classList.toggle('hidden-card', f !== 'all' && c.dataset.category !== f);
            });
        });
    });
}

// =========================
// BLOG NOTIFY
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
        showNotification('📬 I\'ll notify you when new posts go live.', 'success');
        input.value = '';
    });
}

// =========================
// NOTIFICATION TOAST
// =========================
function showNotification(msg, type = 'success') {
    document.querySelector('.notification')?.remove();
    const n = document.createElement('div');
    n.className   = 'notification';
    n.textContent = msg;
    n.style.background = type === 'error' ? '#ef4444'
                       : type === 'info'  ? '#8b5cf6'
                       : 'var(--accent)';
    n.style.color = type === 'error' ? '#fff' : '#020617';
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3500);
}

// =========================
// BASE REVIEWS & RENDER
// =========================
const BASE_REVIEWS = [
    {
        name: "Mohamed J.",
        role: "Restaurant Owner",
        rating: 5,
        text: "Great attention to detail and really listens to client needs. Delivered exactly what I envisioned."
    },
    {
        name: "Sarah K.",
        role: "Tourism Company",
        rating: 5,
        text: "Professional, responsive, and delivers quality work on time. Would definitely work with Idra again."
    },
    {
        name: "David M.",
        role: "Collaborator",
        rating: 5,
        text: "Knowledgeable about both development and security — a rare combination that made our project much stronger."
    }
];

function renderReviews() {
    const reviewsGrid = document.getElementById('reviews-grid');
    const surveyTestimonials = document.getElementById('survey-testimonials');
    if (!reviewsGrid && !surveyTestimonials) return;

    const localData = localStorage.getItem('portfolio_reviews');
    const localReviews = localData ? JSON.parse(localData) : [];
    const allReviews = [...BASE_REVIEWS, ...localReviews];

    if (reviewsGrid) {
        reviewsGrid.innerHTML = '';
        allReviews.forEach(rev => {
            const stars = '⭐'.repeat(rev.rating);
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `
                <span class="review-stars" aria-label="${rev.rating} stars">${stars}</span>
                <p class="review-text">"${rev.text}"</p>
                <div class="review-author">${rev.name}</div>
                <div class="review-role">${rev.role}</div>
                <span class="review-quote">”</span>
            `;
            reviewsGrid.appendChild(card);
        });
    }

    if (surveyTestimonials) {
        surveyTestimonials.innerHTML = '';
        allReviews.forEach(rev => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <p>"${rev.text}"</p>
                <span class="testimonial-author">— ${rev.name}, ${rev.role}</span>
            `;
            surveyTestimonials.appendChild(card);
        });
    }
}

// =========================
// SPOTLIGHT MOUSE GLOW
// =========================
function initSpotlightGlow() {
    // Only bind if cursor hover is supported (desktops/laptops)
    if (!window.matchMedia('(hover: hover)').matches) return;

    const selectCards = () => {
        return document.querySelectorAll(
            '.service-card, .project-card, .stat-box, .cert-card, .blog-card, .review-card, .faq-card, .blog-teaser-card, .value-card, .testimonial-card'
        );
    };

    const attachSpotlight = (card) => {
        if (card.dataset.spotlightBound) return;
        card.dataset.spotlightBound = '1';
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    };

    // Initial binding
    selectCards().forEach(attachSpotlight);

    // Re-bind when reviews are rendered dynamically
    const observer = new MutationObserver(() => {
        selectCards().forEach(attachSpotlight);
    });
    
    const grids = document.querySelectorAll('#reviews-grid, #survey-testimonials');
    grids.forEach(grid => observer.observe(grid, { childList: true }));
}