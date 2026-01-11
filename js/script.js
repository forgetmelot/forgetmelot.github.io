document.addEventListener('DOMContentLoaded', function () {
  // When a family detail opens, close sibling families within same order
  document.querySelectorAll('.family-details').forEach(function (family) {
    family.addEventListener('toggle', function () {
      if (!family.open) return;
      const parent = family.parentElement;
      if (!parent) return;
      parent.querySelectorAll('.family-details').forEach(function (sib) {
        if (sib !== family && sib.open) sib.open = false;
      });
    });
  });

  // Optionally ensure only one order is open at a time
  document.querySelectorAll('.order-details').forEach(function (order) {
    order.addEventListener('toggle', function () {
      if (!order.open) return;
      document.querySelectorAll('.order-details').forEach(function (other) {
        if (other !== order && other.open) other.open = false;
      });
    });
  });

  // Enhance keyboard behavior for summary elements: toggle on Enter/Space when focused
  document.querySelectorAll('summary').forEach(function (summary) {
    summary.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const parent = summary.parentElement;
        if (parent && parent.tagName.toLowerCase() === 'details') {
          parent.open = !parent.open;
        }
      }
    });
  });

  // Ratings are static in the markup (non-interactive star display).

  // Header background toggle on scroll: hide header background when user scrolls down
  (function () {
    var headerEl = document.querySelector('.site-header');
    if (!headerEl) return;
    function onScroll() {
      if (window.scrollY > 10) headerEl.classList.add('hide-header-bg');
      else headerEl.classList.remove('hide-header-bg');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // Lucky link: auto-discover pages (from index anchors or manifest) and navigate randomly
  (function () {
    var luckyLink = document.querySelector('a.lucky');
    if (!luckyLink) return;

    function getPagesFromIndex() {
      var anchors = document.querySelectorAll('.species-list a[href^="birds/"]');
      var pages = [];
      anchors.forEach(function (a) {
        var href = a.getAttribute('href');
        if (href) pages.push(href);
      });
      return pages;
    }

    function pickRandomAndGo(pages) {
      if (!pages || !pages.length) return;
      var target = pages[Math.floor(Math.random() * pages.length)];
      window.location.href = target;
    }

    luckyLink.addEventListener('click', function (e) {
      e.preventDefault();
      var pages = getPagesFromIndex();
      if (pages.length) {
        pickRandomAndGo(pages);
        return;
      }
      // Fallback to manifest
      fetch('birds/manifest.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var files = Array.isArray(data) ? data.filter(function (f) { return /\.html$/i.test(f); }) : [];
          var paths = files.map(function (f) { return 'birds/' + f; });
          pickRandomAndGo(paths);
        })
        .catch(function () {
          // Last resort: minimal static list to avoid complete failure
          var fallback = [
            'birds/asian-koel.html','birds/asian-tit.html','birds/black-collared-starling.html','birds/black-crowned-night-heron.html','birds/black-drongo.html','birds/black-winged-stilt.html','birds/blue-whistling-thrush.html','birds/blue-winged-minla.html','birds/chinese-blackbird.html','birds/cinnamon-bittern.html','birds/collared-crow.html','birds/common-greenshank.html','birds/common-myna.html','birds/common-sandpiper.html','birds/common-tern.html','birds/crested-myna.html','birds/greater-coucal.html','birds/greater-white-fronted-goose.html','birds/hair-crested-drongo.html','birds/house-swift.html','birds/large-billed-crow.html','birds/light-vented-bulbul.html','birds/little-egret.html','birds/little-heron.html','birds/long-tailed-shrike.html','birds/masked-laughingthrush.html','birds/oriental-magpie-robin.html','birds/ornate-sunbird.html','birds/pacific-reef-heron.html','birds/plain-prinia.html','birds/red-billed-blue-magpie.html','birds/red-whiskered-bulbul.html','birds/redpoll.html','birds/ruddy-shelduck.html','birds/scaly-breasted-munia.html','birds/sooty-headed-bulbul.html','birds/spotted-dove.html','birds/swinhoes-white-eye.html','birds/velvet-fronted-nuthatch.html','birds/white-breasted-waterhen.html','birds/white-rumped-munia.html','birds/white-shouldered-starling.html','birds/wood-sandpiper.html','birds/yellow-bellied-prinia.html','birds/yellow-crested-cockatoo.html'
          ];
          pickRandomAndGo(fallback);
        });
    });
  })();

  // Search by document (file) name, but display species title from index
  (function () {
    var input = document.getElementById('bird-search');
    var resultsEl = document.getElementById('search-results');
    if (!input || !resultsEl) return;

    // entries: { file: 'asian-koel.html', title: 'Asian Koel' }
    var entries = [];

    function toTitleFromFilename(file) {
      var name = (file || '').replace(/\.html$/i, '');
      return name.split('-').map(function (part) {
        return part ? part.charAt(0).toUpperCase() + part.slice(1) : part;
      }).join(' ');
    }

    function buildEntriesFromIndex() {
      var anchors = document.querySelectorAll('.species-list a[href^="birds/"]');
      var list = [];
      anchors.forEach(function (a) {
        var href = a.getAttribute('href') || '';
        var file = href.split('/').pop();
        var title = (a.textContent || '').trim();
        if (file && title) list.push({ file: file, title: title });
      });
      return list;
    }

    function renderResults(list, query) {
      if (!query) { resultsEl.innerHTML = ''; return; }
      if (!list.length) { resultsEl.innerHTML = '<div class="search-empty">No matches found.</div>'; return; }
      var html = '<ul class="search-list">' + list.map(function (e) {
        var path = 'birds/' + e.file;
        return '<li class="search-item"><a href="' + path + '">' + e.title + '</a></li>';
      }).join('') + '</ul>';
      resultsEl.innerHTML = html;
    }

    function onSearch() {
      var q = (input.value || '').toLowerCase().trim();
      if (!q) { renderResults([], ''); return; }
      var matches = entries.filter(function (e) { return e.file.toLowerCase().indexOf(q) !== -1; });
      renderResults(matches, q);
    }

    // Prefer extracting titles from the index page’s species lists
    entries = buildEntriesFromIndex();

    if (entries.length) {
      input.addEventListener('input', onSearch);
    } else {
      // Fallback: use manifest filename list and derive display titles from filenames
      fetch('birds/manifest.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (Array.isArray(data)) {
            entries = data.filter(function (f) { return /\.html$/i.test(f); })
                          .map(function (f) { return { file: f, title: toTitleFromFilename(f) }; });
          }
          input.addEventListener('input', onSearch);
        })
        .catch(function () {
          var files = [
            'asian-koel.html','asian-tit.html','black-collared-starling.html','black-crowned-night-heron.html','black-drongo.html','black-winged-stilt.html','blue-whistling-thrush.html','blue-winged-minla.html','chinese-blackbird.html','cinnamon-bittern.html','collared-crow.html','common-greenshank.html','common-myna.html','common-sandpiper.html','common-tailorbird.html','common-tern.html','crested-myna.html','eurasian-tree-sparrow.html','great-barbet.html','great-egret.html','greater-coucal.html','greater-white-fronted-goose.html','hair-crested-drongo.html','house-swift.html','large-billed-crow.html','light-vented-bulbul.html','little-egret.html','little-heron.html','long-tailed-shrike.html','masked-laughingthrush.html','oriental-magpie-robin.html','ornate-sunbird.html','pacific-reef-heron.html','plain-prinia.html','red-billed-blue-magpie.html','red-whiskered-bulbul.html','redpoll.html','ruddy-shelduck.html','scaly-breasted-munia.html','sooty-headed-bulbul.html','spotted-dove.html','swinhoes-white-eye.html','velvet-fronted-nuthatch.html','white-breasted-waterhen.html','white-rumped-munia.html','white-shouldered-starling.html','wood-sandpiper.html','yellow-bellied-prinia.html','yellow-crested-cockatoo.html'
          ];
          entries = files.map(function (f) { return { file: f, title: toTitleFromFilename(f) }; });
          input.addEventListener('input', onSearch);
        });
    }
  })();

});