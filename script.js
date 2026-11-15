/* =========================================================
   Portfolio — Mohamed Aziz Jouini
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Année du footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mode clair / sombre ---------- */
  var themeBtn = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f4f7fc' : '#060a14');
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }

  applyTheme(root.getAttribute('data-theme') || 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeMenu() {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---------- Header + progression + lien actif ---------- */
  var header = document.getElementById('header');
  var progressBar = document.querySelector('.progress span');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (progressBar) progressBar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

    var current = sections[0] ? sections[0].id : '';
    sections.forEach(function (s) {
      if (s.offsetTop - 140 <= y) current = s.id;
    });
    navLinks.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Effet machine à écrire ---------- */
  var typedEl = document.getElementById('typed');
  var roles = [
    "Étudiant en Développement des Systèmes d'Information",
    'Développeur Full-Stack',
    "Passionné d'Intelligence Artificielle",
    'Applications Web & Mobile'
  ];

  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = roles[0];
    } else {
      var ri = 0, ci = 0, deleting = false;
      (function tick() {
        var word = roles[ri];
        typedEl.textContent = word.substring(0, ci);
        var delay = deleting ? 35 : 70;

        if (!deleting && ci === word.length) { deleting = true; delay = 1600; }
        else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 350; }
        else { ci += deleting ? -1 : 1; }

        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- Apparition au scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Compteurs animés ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var duration = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Spotlight + inclinaison 3D des cartes ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');

      if (card.classList.contains('tilt') && finePointer && !reduceMotion) {
        var rx = ((y / r.height) - 0.5) * -9;
        var ry = ((x / r.width) - 0.5) * 9;
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
      }
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ---------- Curseur personnalisé ---------- */
  if (finePointer && !reduceMotion) {
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    var canvas = document.getElementById('trail');
    var ctx = canvas.getContext('2d');

    body.classList.add('has-cursor');

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var particles = [];
    var hue = 200;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      body.classList.add('cursor-on');
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';

      // traînée RGB
      hue = (hue + 4) % 360;
      particles.push({ x: mx, y: my, r: 5 + Math.random() * 4, life: 1, hue: hue });
      if (particles.length > 60) particles.shift();
    });

    document.addEventListener('mouseleave', function () { body.classList.remove('cursor-on'); });
    document.addEventListener('mouseenter', function () { body.classList.add('cursor-on'); });
    window.addEventListener('mousedown', function () { body.classList.add('cursor-down'); });
    window.addEventListener('mouseup', function () { body.classList.remove('cursor-down'); });

    var hoverSel = 'a, button, .tilt, .chips li, .tag, .stat';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) body.classList.remove('cursor-hover');
    });

    (function loop() {
      // l'anneau suit avec un léger retard (effet fluide)
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      var scale = body.classList.contains('cursor-down') ? 0.7 : (body.classList.contains('cursor-hover') ? 1.6 : 1);
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) scale(' + scale + ')';

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.life -= 0.035;
        if (p.life <= 0) { particles.splice(i, 1); i--; continue; }
        ctx.beginPath();
        ctx.fillStyle = 'hsla(' + p.hue + ',90%,60%,' + (p.life * 0.55) + ')';
        ctx.shadowColor = 'hsla(' + p.hue + ',90%,60%,0.8)';
        ctx.shadowBlur = 14;
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(loop);
    })();
  }
})();
