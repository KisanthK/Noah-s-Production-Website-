let currentPage = 'home';
const trans = document.getElementById('pageTrans');

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('vis');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('#page-home .sr').forEach(el => observer.observe(el));

// Spotlight timeline state
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

function goTo(page) {
  if (page === currentPage) return;

  document.getElementById('burger').classList.remove('open');
  document.getElementById('mobileMenu').classList.remove('open');

  trans.className = 'page-transition entering';

  setTimeout(() => {
    document.getElementById('page-' + currentPage).classList.remove('active', 'visible');
    currentPage = page;

    const el = document.getElementById('page-' + page);
    el.classList.add('active');

    window.scrollTo(0, 0);

    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === page);
    });

    setTimeout(() => {
      trans.className = 'page-transition leaving';
      el.classList.add('visible');

      el.querySelectorAll('.sr').forEach(s => observer.observe(s));

      if (page === 'experience') {
        initExperienceSpotlight();
      }
    }, 50);

    setTimeout(() => {
      trans.className = 'page-transition';
    }, 450);
  }, 350);
}

// Scroll nav
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Hamburger
const burger = document.getElementById('burger');
const mm = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mm.classList.toggle('open');
});

// Init home visible
setTimeout(() => document.getElementById('page-home').classList.add('visible'), 50);

// Blog toggle
function toggleBlog(entry) {
  const fc = entry.querySelector('.full-content');
  const btn = entry.querySelector('.blog-read-more');
  fc.classList.toggle('open');
  btn.textContent = fc.classList.contains('open') ? 'Close Article ↑' : 'Read Article →';
}

// Role pill animation
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

// Forms
function formSubmit(e) {
  e.preventDefault();
  const b = e.target.querySelector('button');
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
  const b = e.target.querySelector('button');
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