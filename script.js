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
  /* ---------- Robot qui attrape le curseur pendant le scroll ---------- */
  (function () {
    var svg = document.getElementById('robot');
    if (!svg) return;
    var $ = function (id) { return document.getElementById(id); };
    var bot = $('bot'), head = $('head'), mouth = $('mouth'), led = $('led');
    var pupilL = $('pupilL'), pupilR = $('pupilR');

    var W = window.innerWidth, H = window.innerHeight;
    window.addEventListener('resize', function () { W = window.innerWidth; H = window.innerHeight; });

    var cx = W / 2, cy = H / 2;
    window.addEventListener('mousemove', function (e) { cx = e.clientX; cy = e.clientY; }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      var t = e.touches && e.touches[0];
      if (t) { cx = t.clientX; cy = t.clientY; }
    }, { passive: true });

    var hands = [
      { side: -1, arm: $('armL'), el: $('handL'), x: 0, y: 0 },
      { side: 1, arm: $('armR'), el: $('handR'), x: 0, y: 0 }
    ];
    hands.forEach(function (h) { h.fingers = h.el.querySelectorAll('.finger'); });

    var shown = false, grabbing = false, pressed = false;
    var grabTimer = null, lastY = window.scrollY || 0;
    var kick = 0, ap = 0, g = 0;

    function setShown() {
      shown = (window.scrollY || 0) > 120;
      svg.classList.toggle('show', shown);
    }
    window.addEventListener('scroll', function () {
      var y = window.scrollY || 0;
      kick = Math.min(14, kick + Math.abs(y - lastY) * 0.15);
      lastY = y;
      grabbing = true;
      clearTimeout(grabTimer);
      grabTimer = setTimeout(function () { grabbing = false; }, 650);
      setShown();
    }, { passive: true });
    window.addEventListener('mousedown', function () { pressed = true; });
    window.addEventListener('mouseup', function () { pressed = false; });
    setShown();

    function frame(t) {
      var scale = W < 680 ? 0.8 : 1;
      ap += ((shown ? 1 : 0) - ap) * 0.08;
      kick *= 0.9;

      var bx = W - 62 * scale - 10;
      var by = H - 14 + (1 - ap) * 170 - (Math.sin(t / 450) * 2 + kick);
      bot.setAttribute('transform', 'translate(' + bx + ' ' + by + ') scale(' + scale + ')');

      // tête + regard
      var ang = Math.max(-18, Math.min(18, ((cx - bx) / W) * 40));
      head.setAttribute('transform', 'rotate(' + ang + ' 0 -38)');
      var ex = bx, ey = by - 53 * scale;
      var ddx = cx - ex, ddy = cy - ey, dd = Math.hypot(ddx, ddy) || 1;
      var k = Math.min(3.4, dd / 40);
      var tr = 'translate(' + (ddx / dd * k) + ' ' + (ddy / dd * k) + ')';
      pupilL.setAttribute('transform', tr);
      pupilR.setAttribute('transform', tr);

      // état "j'attrape"
      var wantGrab = grabbing || pressed;
      g += ((wantGrab ? 1 : 0) - g) * 0.15;
      mouth.setAttribute('d', g > 0.5 ? 'M-8 -45 Q0 -36 8 -45' : 'M-7 -44 Q0 -40 7 -44');
      led.classList.toggle('on', g > 0.5);

      hands.forEach(function (h) {
        var sx = bx + h.side * 30 * scale, sy = by - 20 * scale;
        var dx = cx - sx, dy = cy - sy, dist = Math.hypot(dx, dy) || 1;
        var idle = 150 * scale, tx, ty;

        if (wantGrab) {                       // les mains vont chercher le curseur
          tx = cx + h.side * 16; ty = cy + 6;
        } else if (dist < idle * 1.7) {       // curseur proche : la main pointe vers lui
          var r = Math.min(dist, idle);
          tx = sx + dx / dist * r; ty = sy + dy / dist * r;
        } else {                              // repos : bras le long du corps
          tx = sx + h.side * 18 * scale + Math.sin(t / 600 + h.side) * 3;
          ty = sy + 44 * scale + Math.cos(t / 500) * 2;
        }
        h.x += (tx - h.x) * 0.14;
        h.y += (ty - h.y) * 0.14;

        var len = Math.hypot(h.x - sx, h.y - sy);
        var qx = (sx + h.x) / 2, qy = (sy + h.y) / 2 + Math.min(70, len * 0.22);
        h.arm.setAttribute('d', 'M' + sx + ' ' + sy + ' Q' + qx + ' ' + qy + ' ' + h.x + ' ' + h.y);

        var a = Math.atan2(h.y - sy, h.x - sx);
        h.el.setAttribute('transform', 'translate(' + h.x + ' ' + h.y + ') rotate(' + (a * 180 / Math.PI) + ')');

        var spread = [-0.6, 0, 0.6], fl = 13 - 8 * g;
        for (var i = 0; i < 3; i++) {
          var fa = spread[i] * (1 - 0.6 * g), c = Math.cos(fa), s = Math.sin(fa);
          h.fingers[i].setAttribute('x1', c * 9); h.fingers[i].setAttribute('y1', s * 9);
          h.fingers[i].setAttribute('x2', c * (9 + fl)); h.fingers[i].setAttribute('y2', s * (9 + fl));
        }
      });
    }

    // position de départ des mains (au repos)
    var sc0 = W < 680 ? 0.8 : 1, bx0 = W - 62 * sc0 - 10, by0 = H - 14;
    hands.forEach(function (h) { h.x = bx0 + h.side * 48 * sc0; h.y = by0 + 24 * sc0; });

    if (reduceMotion) {                      // pas d'animation : robot fixe
      shown = true; ap = 1; svg.classList.add('show');
      frame(0);
      return;
    }
    (function loop(t) { frame(t); requestAnimationFrame(loop); })(0);
  })();
})();
