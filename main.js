/* ============================================================
   CASA ANTIGA — main.js
   ============================================================ */

/* ── Nav scroll state ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Back to top ── */
(function () {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  function onScroll() {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── Mobile nav toggle ── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings in the same grid/flex container
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
      const delay = siblings.indexOf(entry.target) * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Scroll scene — frame sequence canvas ── */
(function () {
  const scene  = document.getElementById('scrollScene');
  const canvas = document.getElementById('statueCanvas');
  const cap1   = document.getElementById('scCaption1');
  const cap2   = document.getElementById('scCaption2');

  if (!scene || !canvas) return;

  const ctx         = canvas.getContext('2d');
  const FRAME_COUNT = 151;
  const FRAME_DIR   = 'frames/';
  const FRAME_EXT   = '.webp';

  // JS controls opacity — remove CSS transitions
  cap1.style.transition = 'none';
  cap2.style.transition = 'none';

  // ── Canvas sizing (hi-DPI aware) ──────────────────────────────
  let cw, ch, dpr;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for perf
    cw  = window.innerWidth;
    ch  = window.innerHeight;
    canvas.width  = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width  = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (frames[currentIndex]?.complete) renderFrame(currentIndex);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  // ── Frame pool ────────────────────────────────────────────────
  const frames  = new Array(FRAME_COUNT);
  let   loaded  = 0;
  let   currentIndex = 0;
  let   rafId   = null;

  function frameSrc(i) {
    return FRAME_DIR + 'frame_' + String(i + 1).padStart(4, '0') + FRAME_EXT;
  }

  // Cover-fit draw at 75% of viewport
  function renderFrame(i) {
    const img = frames[i];
    if (!img?.complete || !img.naturalWidth) return;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * 0.75;
    const sw = img.naturalWidth  * scale;
    const sh = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  }

  // Progressive preload — first frame immediate, rest in bursts
  function preload() {
    // Batch-load so we don't open 150 requests at once
    const BATCH = 10;
    let   next  = 0;

    function loadBatch() {
      const end = Math.min(next + BATCH, FRAME_COUNT);
      for (let i = next; i < end; i++) {
        const img = new Image();
        img.src = frameSrc(i);
        img.onload = () => {
          loaded++;
          // Draw first frame as soon as it arrives
          if (i === 0) { resizeCanvas(); renderFrame(0); }
          // Kick off next batch when this one finishes
          if (loaded === end && end < FRAME_COUNT) loadBatch();
        };
        frames[i] = img;
      }
      next = end;
    }

    loadBatch();
  }

  preload();

  // ── Scroll → frame ────────────────────────────────────────────
  function smoothstep(e0, e1, x) {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }

  function tick() {
    rafId = null;
    const rect     = scene.getBoundingClientRect();
    const scrollH  = scene.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / scrollH));

    // Map progress → frame index
    const idx = Math.min(Math.floor((1 - progress) * FRAME_COUNT), FRAME_COUNT - 1);

    if (idx !== currentIndex || !frames[idx]?.complete) {
      currentIndex = idx;
      // If target frame not loaded yet, walk back to nearest loaded frame
      let fallback = idx;
      while (fallback > 0 && !frames[fallback]?.complete) fallback--;
      renderFrame(fallback);
    }

    // ── Captions (smoothstep fade in/out) ─────────────────────
    // Caption 1: in 15%→35%, out 42%→56%
    const c1 = smoothstep(0.15, 0.35, progress) * (1 - smoothstep(0.42, 0.56, progress));
    cap1.style.opacity   = c1;
    cap1.style.transform = `translateY(${(1 - c1) * 16}px)`;

    // Caption 2: in 60%→76%, out 86%→97%
    const c2 = smoothstep(0.60, 0.76, progress) * (1 - smoothstep(0.86, 0.97, progress));
    cap2.style.opacity   = c2;
    cap2.style.transform = `translateY(${(1 - c2) * 16}px)`;
  }

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(tick);
  }

  // Only listen while section is near viewport
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    });
  }, { rootMargin: '300px 0px 300px 0px' }).observe(scene);
})();

/* ── Contact form (demo handler) ── */
const form = document.getElementById('contactoForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#c0392b';
        valid = false;
      }
    });

    if (!valid) return;

    btn.textContent = 'A enviar…';
    btn.disabled = true;

    // Simulate async send
    setTimeout(() => {
      btn.textContent = 'Mensagem enviada!';
      btn.style.background = '#2d6a4f';
      form.reset();
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 3500);
    }, 1400);
  });
}
