(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  // nav: glass on scroll, mobile menu
  var nav = $('#nav');
  function onScroll() { nav.classList.toggle('stuck', window.scrollY > 24); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  var links = $('#links');
  $('#burger').addEventListener('click', function () { links.classList.toggle('open'); });
  $$('#links a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); }); });

  // reveal on scroll
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$('.rv').forEach(function (el) { io.observe(el); });

  // hero tilt follows the mouse
  var stage = $('#stage');
  if (stage && window.matchMedia('(hover:hover)').matches) {
    var b = $('.browser', stage);
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      b.style.transform = 'rotateX(' + (3 - y * 5) + 'deg) rotateY(' + (x * 6) + 'deg)';
    });
    stage.addEventListener('mouseleave', function () { b.style.transform = ''; });
  }

  // product tour: tabs, auto-advance, light/dark for the dashboard
  var tabs = $$('.tab'), shots = $$('#shots img'), url = $('#url');
  var current = 0, timer = null, paused = false;
  // Light versions are listed in the page; each has a matching -dark.png
  var theme = 'light';
  var lightSrc = shots.map(function (s) { return s.getAttribute('src'); });
  function applyTheme(t) {
    theme = t;
    shots.forEach(function (s, k) { s.src = t === 'dark' ? lightSrc[k].replace(/(-light)?.png$/, '-dark.png') : lightSrc[k]; });
    $$('#themeSw button').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-t') === t); });
  }
  function show(i) {
    current = i;
    tabs.forEach(function (t, k) { t.classList.toggle('on', k === i); });
    shots.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    url.textContent = shots[i].getAttribute('data-url');
  }
  function auto() { clearInterval(timer); timer = setInterval(function () { if (!paused) show((current + 1) % tabs.length); }, 5200); }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); auto(); }); });
  var tour = $('.tour');
  tour.addEventListener('mouseenter', function () { paused = true; });
  tour.addEventListener('mouseleave', function () { paused = false; });
  auto();
  $$('#themeSw button').forEach(function (btn) {
    btn.addEventListener('click', function () { applyTheme(btn.getAttribute('data-t')); });
  });

  // module card spotlight
  $$('.mod').forEach(function (m) {
    m.addEventListener('mousemove', function (e) {
      var r = m.getBoundingClientRect();
      m.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      m.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // faq
  $$('.fq').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentElement, open = item.classList.contains('open');
      $$('.fi.open').forEach(function (i) { i.classList.remove('open'); });
      if (!open) item.classList.add('open');
    });
  });

  // form result (Database.php redirects back with ?success=1 or ?error=1)
  var p = new URLSearchParams(location.search);
  if (p.get('success') || p.get('error')) {
    var ok = !!p.get('success');
    var t = document.createElement('div');
    t.className = 'toast ' + (ok ? 'ok' : 'err');
    t.textContent = ok ? 'Message sent. We will be in touch soon.' : 'Something went wrong. Please try again.';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 5500);
    history.replaceState(null, '', location.pathname + '#demo');
  }
})();
