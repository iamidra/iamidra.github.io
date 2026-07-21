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

// =========================
// DOM READY
// =========================
document.addEventListener('DOMContentLoaded', () => {

    // ── Theme ─────────────────────────────────────────────
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        if (localStorage.getItem('theme') === 'light') {
            document.documentElement.classList.add('light-mode');
            themeBtn.textContent = '☀️';
        }
        themeBtn.addEventListener('click', () => {
            const light = document.documentElement.classList.toggle('light-mode');
            themeBtn.textContent = light ? '☀️' : '🌙';
            localStorage.setItem('theme', light ? 'light' : 'dark');
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

    // ── Hamburger ─────────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('nav-menu');
    const overlay   = document.getElementById('menu-overlay');

    if (hamburger && navMenu) {

        const closeMenu = () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            if (overlay) overlay.classList.remove('show');
        };

        const openMenu = () => {
            navMenu.classList.add('open');
            hamburger.classList.add('active');
            if (overlay) overlay.classList.add('show');
        };

        hamburger.addEventListener('click', () => {
            navMenu.classList.contains('open') ? closeMenu() : openMenu();
        });

        // Close drawer on any nav link tap — browser handles navigation normally.
        // We delay the close slightly to ensure mobile browsers register the tap & navigate before the drawer moves.
        navMenu.addEventListener('click', e => {
            if (e.target.closest('a')) {
                setTimeout(closeMenu, 150);
            }
        });

        if (overlay) overlay.addEventListener('click', closeMenu);

        window.addEventListener('resize', () => {
            if (window.innerWidth > 700) closeMenu();
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