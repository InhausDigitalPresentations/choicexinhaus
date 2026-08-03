/* Choice Consultancy × Inhaus — presentation behaviour */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    /(^|[?&])static=1/.test(window.location.search);

  if (/(^|[?&])static=1/.test(window.location.search)) {
    document.documentElement.classList.add('no-motion');
  }

  /* Optional deep-link without a URL fragment (?go=<section-id>) */
  var go = /[?&]go=([\w-]+)/.exec(window.location.search);
  if (go) {
    var goTarget = document.getElementById(go[1]);
    if (goTarget) {
      var jump = function () {
        var top = goTarget.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top, behavior: 'instant' });
      };
      jump();
      window.addEventListener('load', jump);
    }
  }





  /* QA hook: ?only=<section-id> renders one section in isolation */
  var only = /[?&]only=([\w-]+)/.exec(window.location.search);
  if (only) {
    var keep = document.getElementById(only[1]);
    if (keep) {
      document.querySelectorAll('main > section').forEach(function (s) {
        if (s !== keep) s.style.display = 'none';
      });
    }
  }
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[data-phase]'));

  /* ── Progress bar + top bar state ── */
  var bar = document.getElementById('progressBar');
  var topbar = document.getElementById('topbar');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      topbar.classList.toggle('scrolled', window.scrollY > 60);
      updateHero();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Hero: champagne line draws in, subtle settle on scroll ── */
  var heroLine = document.getElementById('heroLine');
  var heroVideo = document.getElementById('heroVideo');
  var hero = document.getElementById('opening');
  function updateHero() {
    if (!hero || reduced) return;
    var rect = hero.getBoundingClientRect();
    var travel = Math.min(1, Math.max(0, -rect.top / (rect.height - window.innerHeight || 1)));
    if (heroVideo) heroVideo.style.transform = 'scale(' + (1.04 - travel * 0.04) + ')';
  }
  window.addEventListener('load', function () {
    if (heroLine) heroLine.style.width = '100%';
  });
  setTimeout(function () { if (heroLine) heroLine.style.width = '100%'; }, 900);

  /* ── Reveal on scroll ── */
  var revealEls = document.querySelectorAll('.reveal, .reveal-img');
  if (!reduced && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Counters (count once when visible) ── */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduced) { el.textContent = target.toLocaleString('en-US'); return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ── Dot rail ── */
  var rail = document.getElementById('rail');
  if (rail) {
    sections.forEach(function (s) {
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.setAttribute('aria-label', s.getAttribute('data-phase'));
      rail.appendChild(a);
    });
    var dots = rail.querySelectorAll('a');
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var idx = sections.indexOf(e.target);
          dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
          var label = document.getElementById('phaseLabel');
          if (label) label.textContent = e.target.getAttribute('data-phase');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ── Index overlay ── */
  var overlay = document.getElementById('indexOverlay');
  var indexBtn = document.getElementById('indexBtn');
  var indexClose = document.getElementById('indexClose');
  function setIndex(open) {
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.toggle('open', open); });
    indexBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) setTimeout(function () { overlay.hidden = true; }, 500);
    if (open) indexClose.focus();
  }
  indexBtn.addEventListener('click', function () { setIndex(true); });
  indexClose.addEventListener('click', function () { setIndex(false); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) setIndex(false); });
  overlay.querySelectorAll('[data-close]').forEach(function (a) {
    a.addEventListener('click', function () { setIndex(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) setIndex(false);
  });

  /* ── Back to top ── */
  var backTop = document.getElementById('backTop');
  if (backTop) backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ── Lazy videos: load sources when near viewport, pause off-screen ── */
  var lazyVideos = document.querySelectorAll('video.lazy-video');
  function loadVideo(v) {
    if (v.dataset.loaded) return;
    v.querySelectorAll('source[data-src]').forEach(function (s) { s.src = s.dataset.src; });
    v.load();
    v.dataset.loaded = '1';
  }
  if ('IntersectionObserver' in window) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          loadVideo(v);
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (v.dataset.loaded) {
          v.pause();
        }
      });
    }, { rootMargin: '200px 0px' });
    lazyVideos.forEach(function (v) { vo.observe(v); });
    if (heroVideo) {
      var ho = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); }
          else heroVideo.pause();
        });
      }, { threshold: 0 });
      ho.observe(heroVideo);
    }
  } else {
    lazyVideos.forEach(loadVideo);
  }
})();
