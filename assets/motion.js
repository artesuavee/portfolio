/* motion.js — анимационный движок портфолио.
   Принципы Remotion (frame-based interpolate/spring), правила UI/UX Pro Max:
   только transform/opacity, 150–300ms микро, stagger 40ms, reduced-motion. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- interpolate (как в Remotion) ---------- */
  function interpolate(v, inRange, outRange, clamp) {
    var t = (v - inRange[0]) / (inRange[1] - inRange[0]);
    if (clamp !== false) t = Math.max(0, Math.min(1, t));
    return outRange[0] + t * (outRange[1] - outRange[0]);
  }

  /* ---------- spring-физика (damped harmonic oscillator) ---------- */
  function Spring(opts) {
    opts = opts || {};
    this.stiffness = opts.stiffness || 170;
    this.damping = opts.damping || 18;
    this.mass = opts.mass || 1;
    this.value = opts.from || 0;
    this.target = opts.to || 0;
    this.velocity = 0;
  }
  Spring.prototype.step = function (dt) {
    var f = -this.stiffness * (this.value - this.target);
    var d = -this.damping * this.velocity;
    var a = (f + d) / this.mass;
    this.velocity += a * dt;
    this.value += this.velocity * dt;
    return Math.abs(this.velocity) > 0.001 || Math.abs(this.value - this.target) > 0.001;
  };

  /* ---------- scroll reveal со stagger ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var siblings = el.parentElement ? el.parentElement.querySelectorAll('[data-reveal]') : [el];
        var idx = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = Math.min(idx * 45, 360) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- счётчики цифр ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        cio.unobserve(el);
        if (reduced) { el.textContent = target + suffix; return; }
        var t0 = null;
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1200, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = interpolate(eased, [0, 1], [0, target]);
          el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- spring-наклон карточек к курсору ---------- */
  if (!reduced && matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var sx = new Spring({ stiffness: 120, damping: 14 });
      var sy = new Spring({ stiffness: 120, damping: 14 });
      var raf = null, last = null;
      function loop(ts) {
        var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016;
        last = ts;
        var ax = sx.step(dt), ay = sy.step(dt);
        card.style.transform = 'perspective(700px) rotateY(' + sx.value + 'deg) rotateX(' + (-sy.value) + 'deg) translateZ(0)';
        if (ax || ay) raf = requestAnimationFrame(loop); else { raf = null; last = null; }
      }
      function kick() { if (!raf) raf = requestAnimationFrame(loop); }
      card.addEventListener('mousemove', function (ev) {
        var r = card.getBoundingClientRect();
        sx.target = interpolate(ev.clientX, [r.left, r.right], [-5, 5]);
        sy.target = interpolate(ev.clientY, [r.top, r.bottom], [-5, 5]);
        kick();
      });
      card.addEventListener('mouseleave', function () { sx.target = 0; sy.target = 0; kick(); });
    });
  }

  /* ---------- параллакс декоративных блобов ---------- */
  var blobs = document.querySelectorAll('[data-parallax]');
  if (!reduced && blobs.length) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        blobs.forEach(function (b) {
          var k = parseFloat(b.getAttribute('data-parallax')) || 0.15;
          b.style.transform = 'translate3d(0,' + (y * k) + 'px,0)';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- аккордеон FAQ ---------- */
  document.querySelectorAll('[data-acc] > button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement, body = item.querySelector('.acc-body');
      var open = item.classList.contains('open');
      item.parentElement.querySelectorAll('[data-acc].open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.acc-body').style.maxHeight = null;
        o.querySelector('button').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- шапка: тень при скролле ---------- */
  var header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  /* ---------- мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', document.body.classList.contains('menu-open'));
    });
    document.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
    });
  }

  /* ---------- форма записи → WhatsApp ---------- */
  document.querySelectorAll('form[data-wa]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('[type=submit]');
      var invalid = false;
      form.querySelectorAll('[required]').forEach(function (inp) {
        var bad = !inp.value.trim();
        inp.classList.toggle('invalid', bad);
        if (bad && !invalid) { inp.focus(); invalid = true; }
      });
      if (invalid) return;
      var phone = form.getAttribute('data-wa');
      var lines = [form.getAttribute('data-wa-title') || 'Заявка с сайта', ''];
      form.querySelectorAll('input, select, textarea').forEach(function (inp) {
        if (inp.type === 'submit' || !inp.value.trim()) return;
        var label = inp.getAttribute('data-label') || inp.name || '';
        lines.push(label + ': ' + inp.value.trim());
      });
      btn.disabled = true;
      var old = btn.textContent;
      btn.textContent = 'Открываю WhatsApp…';
      window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(lines.join('\n')), '_blank');
      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = old;
        var ok = form.querySelector('.form-ok');
        if (ok) { ok.classList.add('show'); setTimeout(function () { ok.classList.remove('show'); }, 5000); }
        form.reset();
      }, 900);
    });
  });
})();
