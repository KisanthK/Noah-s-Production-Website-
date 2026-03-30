/* ═══════════════════════════════════════════════════
   Neon Sunset Productions — script.js (fixed)
   ═══════════════════════════════════════════════════ */

let currentPage = 'home';
const trans = document.getElementById('pageTrans');

/* ─── Scroll Reveal ─── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('vis');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('#page-home .sr').forEach(el => observer.observe(el));

/* ─── Experience Spotlight Timeline ─── */
let expItems = [];
let expTimeline = null;
let expActiveIndex = 0;
let expTicking = false;
let expHandlersBound = false;

function setActiveExperience(index) {
  if (!expItems.length || !expTimeline) return;

  expActiveIndex = Math.max(0, Math.min(index, expItems.length - 1));

  expItems.forEach((item, i) => {
    item.classList.toggle('active', i === expActiveIndex);
  });

  const activeItem = expItems[expActiveIndex];
  const itemCenter = activeItem.offsetTop + activeItem.offsetHeight * 0.5;
  const progress = (itemCenter / expTimeline.scrollHeight) * 100;

  expTimeline.style.setProperty('--timeline-progress', `${progress}%`);
}

function updateExperienceOnScroll() {
  if (currentPage !== 'experience' || !expItems.length) return;

  const triggerY = window.innerHeight * 0.42;
  let closestIndex = 0;
  let closestDistance = Infinity;

  expItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const distance = Math.abs(itemCenter - triggerY);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  setActiveExperience(closestIndex);
}

function handleExperienceScroll() {
  if (expTicking) return;
  expTicking = true;
  window.requestAnimationFrame(() => {
    updateExperienceOnScroll();
    expTicking = false;
  });
}

function initExperienceSpotlight() {
  expTimeline = document.querySelector('#page-experience .exp-timeline');
  if (!expTimeline) return;

  expItems = Array.from(expTimeline.querySelectorAll('.exp-item'));
  if (!expItems.length) return;

  expItems.forEach(item => item.classList.remove('active'));
  setActiveExperience(0);

  if (!expHandlersBound) {
    window.addEventListener('scroll', handleExperienceScroll, { passive: true });
    window.addEventListener('resize', updateExperienceOnScroll);
    expHandlersBound = true;
  }

  setTimeout(updateExperienceOnScroll, 80);
}

/* ─── SPA Navigation ─── */
function goTo(page) {
  // FIX: Normalize empty string to 'portfolio' (legacy links) or 'home'
  if (!page || page === '') page = 'home';

  if (page === currentPage) return;

  // Close mobile menu
  const burger = document.getElementById('burger');
  const mm = document.getElementById('mobileMenu');
  burger.classList.remove('open');
  mm.classList.remove('open');
  document.body.style.overflow = '';

  trans.className = 'page-transition entering';

  setTimeout(() => {
    // Hide current page
    const curEl = document.getElementById('page-' + currentPage);
    if (curEl) curEl.classList.remove('active', 'visible');

    currentPage = page;

    const el = document.getElementById('page-' + page);
    if (!el) {
      // Fallback: if page doesn't exist, go home
      currentPage = 'home';
      const homeEl = document.getElementById('page-home');
      homeEl.classList.add('active');
      window.scrollTo(0, 0);
      setTimeout(() => {
        trans.className = 'page-transition leaving';
        homeEl.classList.add('visible');
        homeEl.querySelectorAll('.sr').forEach(s => observer.observe(s));
      }, 50);
      setTimeout(() => { trans.className = 'page-transition'; }, 450);
      return;
    }

    el.classList.add('active');
    window.scrollTo(0, 0);

    // Update nav active states
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === page);
    });

    setTimeout(() => {
      trans.className = 'page-transition leaving';
      el.classList.add('visible');

      // Observe scroll reveals for new page
      el.querySelectorAll('.sr').forEach(s => {
        s.classList.remove('vis');
        observer.observe(s);
      });

      // Init experience spotlight when navigating to experience page
      if (page === 'experience') {
        initExperienceSpotlight();
      }
    }, 50);

    setTimeout(() => {
      trans.className = 'page-transition';
    }, 450);
  }, 350);
}

/* ─── Scroll Nav ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── Hamburger / Mobile Menu ─── */
(function () {
  const burger = document.getElementById('burger');
  const mm = document.getElementById('mobileMenu');

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('open');
    mm.classList.toggle('open');
    // Lock body scroll when mobile menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu when any link inside is tapped
  mm.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      mm.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ─── Init Home Page ─── */
setTimeout(() => {
  const home = document.getElementById('page-home');
  if (home) home.classList.add('visible');
}, 50);

/* ─── Blog Toggle ─── */
function toggleBlog(entry, event) {
  // Prevent toggling when clicking inside an already-open full-content area links etc.
  if (event && event.target.closest('.full-content') && entry.querySelector('.full-content').classList.contains('open')) {
    return;
  }

  const fc = entry.querySelector('.full-content');
  const btn = entry.querySelector('.blog-read-more');
  if (!fc || !btn) return;

  fc.classList.toggle('open');
  btn.textContent = fc.classList.contains('open') ? 'Close Article \u2191' : 'Read Article \u2192';
}

/* ─── Role Pill Animation ─── */
(function () {
  const pills = document.querySelectorAll('.role-pill');
  if (!pills.length) return;

  const STAGGER = 180;
  let timers = [];

  function lightSequence() {
    timers.forEach(t => clearTimeout(t));
    timers = [];
    pills.forEach((p, i) => {
      const t = setTimeout(() => p.classList.add('lit'), (i + 1) * STAGGER);
      timers.push(t);
    });
  }

  function dimSequence() {
    timers.forEach(t => clearTimeout(t));
    timers = [];
    [...pills].reverse().forEach((p, i) => {
      const t = setTimeout(() => p.classList.remove('lit'), (i + 1) * 100);
      timers.push(t);
    });
  }

  // Wrap goTo to add pill animations
  const originalGoTo = goTo;
  goTo = function (page) {
    const leaving = currentPage;
    originalGoTo(page);

    if (page === 'about') {
      pills.forEach(p => p.classList.remove('lit'));
      setTimeout(lightSequence, 500);
    }

    if (leaving === 'about' && page !== 'about') {
      dimSequence();
    }
  };

  // Also trigger when scrolling into view on the about page
  const container = document.querySelector('.about-roles');
  if (container) {
    const scrollObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          lightSequence();
        } else {
          const rect = entry.boundingClientRect;
          if (rect.bottom >= 0) {
            dimSequence();
          }
        }
      });
    }, { threshold: 0.3 });

    scrollObs.observe(container);
  }
})();

/* ─── Form Submissions ─── */
function formSubmit(e) {
  e.preventDefault();
  const b = e.target.querySelector('button[type="submit"]');
  if (!b) return;

  b.textContent = 'Message Sent';
  b.style.background = '#2a8a4a';
  b.style.color = '#fff';

  setTimeout(() => {
    b.textContent = 'Send Message';
    b.style.background = '';
    b.style.color = '';
    e.target.reset();
  }, 3000);
}

function nlSubmit(e) {
  e.preventDefault();
  const b = e.target.querySelector('button[type="submit"]');
  if (!b) return;

  b.textContent = 'Subscribed!';
  b.style.background = '#2a8a4a';
  b.style.color = '#fff';

  setTimeout(() => {
    b.textContent = 'Subscribe';
    b.style.background = '';
    b.style.color = '';
    e.target.reset();
  }, 3000);
}
