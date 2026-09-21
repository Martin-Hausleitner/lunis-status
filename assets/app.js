(function () {
  var root = document.documentElement;
  var navToggle = document.getElementById('navToggle');
  var sidebar = document.getElementById('sidebar');
  if (navToggle && sidebar) {
    var mobileQuery = window.matchMedia ? window.matchMedia('(max-width: 680px)') : null;
    var setNavState = function (open, restoreFocus) {
      sidebar.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      sidebar.setAttribute('aria-hidden', String(!open && mobileQuery && mobileQuery.matches));
      if (open) {
        var firstLink = sidebar.querySelector('a[href^="#"]');
        if (firstLink) window.requestAnimationFrame(function () { firstLink.focus(); });
      } else if (restoreFocus) {
        navToggle.focus();
      }
    };
    setNavState(false, false);
    navToggle.addEventListener('click', function () {
      setNavState(!sidebar.classList.contains('open'), false);
    });
    sidebar.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () { setNavState(false, true); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && sidebar.classList.contains('open')) {
        event.preventDefault(); setNavState(false, true);
      }
    });
    document.addEventListener('click', function (event) {
      if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && event.target !== navToggle) {
        setNavState(false, true);
      }
    });
    if (mobileQuery && mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', function (event) {
        if (!event.matches) setNavState(false, false);
        else sidebar.setAttribute('aria-hidden', String(!sidebar.classList.contains('open')));
      });
    }
  }
  var visualButtons = document.querySelectorAll('[data-visual-choice]');
  visualButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var choice = button.getAttribute('data-visual-choice');
      root.setAttribute('data-visual', choice);
      visualButtons.forEach(function (item) { item.classList.toggle('is-active', item === button); });
      try { localStorage.setItem('lunis-visual', choice); } catch (e) {}
    });
  });
  var readerText = {
    management: ['Management-Lesespur', 'Fünf Sätze, eine Entscheidung: begrenzte Erprobung nur mit Rollen, Daten und Abbruchbedingungen freigeben.', '01 → 02 → 05'],
    it: ['IT-/Betrieb-Lesespur', 'Nachweisart, Reproduktionsschritt und Grenze bleiben pro Aussage sichtbar; Browser-E2E ist offen.', '01 → 03 → 05'],
    partner: ['Markt-/Partner-Lesespur', 'Problem, belegte Szenarien und Nicht-Zusagen in Klartext — ohne Produktions- oder ROI-Versprechen.', '01 → 04 → 05']
  };
  var readerButtons = document.querySelectorAll('[data-reader-choice]');
  var copies = document.querySelectorAll('[data-copy]');
  function setReader(choice) {
    var copy = readerText[choice] || readerText.management;
    root.setAttribute('data-reader', choice);
    readerButtons.forEach(function (item) { item.classList.toggle('is-active', item.getAttribute('data-reader-choice') === choice); });
    copies.forEach(function (item) { item.hidden = item.getAttribute('data-copy') !== choice; });
    var label = document.querySelector('[data-reader-label]');
    var description = document.querySelector('[data-reader-description]');
    var trail = document.querySelector('.reader-trail');
    if (label) label.textContent = copy[0];
    if (description) description.textContent = copy[1];
    if (trail) trail.textContent = copy[2];
    try { localStorage.setItem('lunis-reader', choice); } catch (e) {}
  }
  readerButtons.forEach(function (button) { button.addEventListener('click', function () { setReader(button.getAttribute('data-reader-choice')); }); });
  try { var visual = localStorage.getItem('lunis-visual'); if (visual && ['calm','ledger','workshop'].indexOf(visual) >= 0) { root.setAttribute('data-visual', visual); visualButtons.forEach(function (item) { item.classList.toggle('is-active', item.getAttribute('data-visual-choice') === visual); }); } var reader = localStorage.getItem('lunis-reader'); if (reader && readerText[reader]) setReader(reader); } catch (e) {}
  var sections = document.querySelectorAll('.section-anchor');
  var links = document.querySelectorAll('.nav-link');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) { entries.forEach(function (entry) { if (entry.isIntersecting) links.forEach(function (link) { link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id); }); }); }, { rootMargin: '-20% 0px -65% 0px' });
    sections.forEach(function (section) { observer.observe(section); });
  }
  var search = document.getElementById('catalogSearch');
  var searchCount = document.getElementById('searchResultCount');
  var searchEmpty = document.getElementById('searchEmpty');
  var searchable = Array.prototype.slice.call(document.querySelectorAll('.evidence-card, .scenario-card, .source-card, .process-step, .download-actions a'));
  function applySearch() {
    if (!search) return;
    var needle = search.value.trim().toLocaleLowerCase();
    var matches = 0;
    searchable.forEach(function (item) {
      var hit = !needle || item.textContent.toLocaleLowerCase().indexOf(needle) >= 0;
      item.hidden = !hit;
      if (hit) matches += 1;
    });
    if (searchCount) searchCount.textContent = needle ? matches + ' Treffer' : 'Alle ' + matches + ' Einträge sichtbar';
    if (searchEmpty) searchEmpty.hidden = !needle || matches > 0;
  }
  if (search) search.addEventListener('input', applySearch);
  var motionStatus = document.getElementById('motionStatus');
  if (motionStatus && window.matchMedia) {
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var updateMotion = function () { motionStatus.textContent = motionQuery.matches ? 'Bewegung: reduziert (System)' : 'Bewegung: normal (System)'; };
    updateMotion();
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', updateMotion);
  }
  var downloadStatus = document.getElementById('downloadStatus');
  document.querySelectorAll('.download-actions a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (downloadStatus) downloadStatus.textContent = 'Download/Ansicht gestartet: ' + link.textContent.replace('↗', '').trim();
    });
  });
})();
