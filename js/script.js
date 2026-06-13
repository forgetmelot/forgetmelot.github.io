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

  // Internal links to missing pages should land on the site 404 page.
  (function () {
    var isBirdPage = window.location.pathname.indexOf('/birds/') !== -1;
    var missingPagePath = isBirdPage ? '../404.html' : '404.html';

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link || link.classList.contains('lucky')) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var href = link.getAttribute('href') || '';
      if (!href || href.indexOf('.html') === -1) return;

      var resolvedUrl;
      try {
        resolvedUrl = new URL(href, window.location.href);
      } catch (_) {
        return;
      }

      if (resolvedUrl.origin !== window.location.origin) return;

      e.preventDefault();

      fetch(resolvedUrl.href, { method: 'HEAD' })
        .then(function (res) {
          window.location.href = res.ok ? resolvedUrl.href : missingPagePath;
        })
        .catch(function () {
          window.location.href = missingPagePath;
        });
    }, true);
  })();

  // (removed) previously added code to tag "Sounds" sections is no longer needed

  // Lucky link: parse index.html to auto-discover bird pages, no manifest needed
  (function () {
    var luckyLink = document.querySelector('a.lucky');
    if (!luckyLink) return;

    var indexPagePath = window.location.pathname.indexOf('/birds/') !== -1 ? '../index.html' : 'index.html';

    function pickRandomAndGo(pages) {
      if (!pages || !pages.length) return;
      var target = pages[Math.floor(Math.random() * pages.length)];
      var prefix = window.location.pathname.indexOf('/birds/') !== -1 ? '../' : '';
      window.location.href = prefix + target;
    }

    function extractPagesFromHTML(htmlText) {
      try {
        var parser = new DOMParser();
        var doc = parser.parseFromString(htmlText, 'text/html');
        var anchors = doc.querySelectorAll('.species-list a[href^="birds/"]');
        var pages = [];
        anchors.forEach(function (a) {
          var href = a.getAttribute('href');
          if (href) pages.push(href);
        });
        return pages;
      } catch (_) {
        return [];
      }
    }

    luckyLink.addEventListener('click', function (e) {
      e.preventDefault();
      // Fetch index.html and parse species links
      fetch(indexPagePath)
        .then(function (res) { return res.text(); })
        .then(function (text) {
          var pages = extractPagesFromHTML(text);
          if (pages.length) {
            pickRandomAndGo(pages);
            return;
          }
          // Fallback: minimal static list to avoid complete failure
          var fallback = [
            'birds/asian-koel.html','birds/asian-tit.html','birds/black-collared-starling.html','birds/black-crowned-night-heron.html','birds/black-drongo.html','birds/black-winged-stilt.html','birds/blue-whistling-thrush.html','birds/blue-winged-minla.html','birds/chinese-blackbird.html','birds/cinnamon-bittern.html','birds/collared-crow.html','birds/common-greenshank.html','birds/common-myna.html','birds/common-sandpiper.html','birds/common-tern.html','birds/crested-myna.html','birds/greater-coucal.html','birds/greater-white-fronted-goose.html','birds/hair-crested-drongo.html','birds/house-swift.html','birds/large-billed-crow.html','birds/light-vented-bulbul.html','birds/little-egret.html','birds/little-heron.html','birds/long-tailed-shrike.html','birds/masked-laughingthrush.html','birds/oriental-magpie-robin.html','birds/ornate-sunbird.html','birds/pacific-reef-heron.html','birds/plain-prinia.html','birds/red-billed-blue-magpie.html','birds/red-whiskered-bulbul.html','birds/redpoll.html','birds/ruddy-shelduck.html','birds/scaly-breasted-munia.html','birds/sooty-headed-bulbul.html','birds/spotted-dove.html','birds/swinhoes-white-eye.html','birds/velvet-fronted-nuthatch.html','birds/white-breasted-waterhen.html','birds/white-rumped-munia.html','birds/white-shouldered-starling.html','birds/wood-sandpiper.html','birds/yellow-bellied-prinia.html','birds/yellow-crested-cockatoo.html'
          ];
          pickRandomAndGo(fallback);
        })
        .catch(function () {
          var fallback = [
            'birds/asian-koel.html','birds/asian-tit.html','birds/black-collared-starling.html','birds/black-crowned-night-heron.html','birds/black-drongo.html','birds/black-winged-stilt.html','birds/blue-whistling-thrush.html','birds/blue-winged-minla.html','birds/chinese-blackbird.html','birds/cinnamon-bittern.html','birds/collared-crow.html','birds/common-greenshank.html','birds/common-myna.html','birds/common-sandpiper.html','birds/common-tern.html','birds/crested-myna.html','birds/greater-coucal.html','birds/greater-white-fronted-goose.html','birds/hair-crested-drongo.html','birds/house-swift.html','birds/large-billed-crow.html','birds/light-vented-bulbul.html','birds/little-egret.html','birds/little-heron.html','birds/long-tailed-shrike.html','birds/masked-laughingthrush.html','birds/oriental-magpie-robin.html','birds/ornate-sunbird.html','birds/pacific-reef-heron.html','birds/plain-prinia.html','birds/red-billed-blue-magpie.html','birds/red-whiskered-bulbul.html','birds/redpoll.html','birds/ruddy-shelduck.html','birds/scaly-breasted-munia.html','birds/sooty-headed-bulbul.html','birds/spotted-dove.html','birds/swinhoes-white-eye.html','birds/velvet-fronted-nuthatch.html','birds/white-breasted-waterhen.html','birds/white-rumped-munia.html','birds/white-shouldered-starling.html','birds/wood-sandpiper.html','birds/yellow-bellied-prinia.html','birds/yellow-crested-cockatoo.html'
          ];
          pickRandomAndGo(fallback);
        });
    });
  })();

  // Search by species name and scientific name
  (function () {
    var input = document.getElementById('bird-search');
    var resultsEl = document.getElementById('search-results');
    if (!input || !resultsEl) return;

    // entries: { file: 'asian-koel.html', title: 'Asian Koel', scientific: 'Eudynamys scolopaceus', otherNames: '...' }
    var entries = [];

    function toTitleFromFilename(file) {
      var name = (file || '').replace(/\.html$/i, '');
      return name.split('-').map(function (part) {
        return part ? part.charAt(0).toUpperCase() + part.slice(1) : part;
      }).join(' ');
    }

    function normalizeSearchText(value) {
      return (value || '')
        .toLowerCase()
        .replace(/[-\s]+/g, '')
        .trim();
    }

    function buildEntriesFromIndex() {
      var anchors = document.querySelectorAll('.species-list a[href^="birds/"]');
      var list = [];
      anchors.forEach(function (a) {
        var href = a.getAttribute('href') || '';
        var file = href.split('/').pop();
        var title = (a.textContent || '').trim();
        var scientific = a.getAttribute('data-scientific') || '';
        var otherNames = a.getAttribute('data-other-names') || '';
        if (file && title) list.push({ file: file, title: title, scientific: scientific, otherNames: otherNames });
      });
      return list;
    }

    function renderResults(list, query) {
      if (!query) { resultsEl.innerHTML = ''; return; }
      if (!list.length) { resultsEl.innerHTML = '<div class="search-empty">No matches found.</div>'; return; }
      var html = '<ul class="search-list">' + list.map(function (e) {
        var path = 'birds/' + e.file;
        var scientificLabel = e.scientific ? ' <span class="scientific-label">(' + e.scientific + ')</span>' : '';
        return '<li class="search-item"><a href="' + path + '">' + e.title + scientificLabel + '</a></li>';
      }).join('') + '</ul>';
      resultsEl.innerHTML = html;
    }

    function onSearch() {
      var q = normalizeSearchText(input.value || '');
      if (!q) { renderResults([], ''); return; }
      var matches = entries.filter(function (e) {
        var titleMatch = normalizeSearchText(e.title).indexOf(q) !== -1;
        var fileMatch = normalizeSearchText(e.file).indexOf(q) !== -1;
        var scientificMatch = e.scientific && normalizeSearchText(e.scientific).indexOf(q) !== -1;
        var otherNamesMatch = e.otherNames && normalizeSearchText(e.otherNames).indexOf(q) !== -1;
        return titleMatch || fileMatch || scientificMatch || otherNamesMatch;
      });
      renderResults(matches, q);
    }

    // Prefer extracting titles from the index page’s species lists
    entries = buildEntriesFromIndex();

    if (entries.length) {
      input.addEventListener('input', onSearch);
    } else {
      // Fallback: derive titles from a static list (no manifest dependency)
      var files = [
        'asian-koel.html','asian-tit.html','black-collared-starling.html','black-crowned-night-heron.html','black-drongo.html','black-winged-stilt.html','blue-whistling-thrush.html','blue-winged-minla.html','chinese-blackbird.html','cinnamon-bittern.html','collared-crow.html','common-greenshank.html','common-myna.html','common-sandpiper.html','common-tailorbird.html','common-tern.html','crested-myna.html','eurasian-tree-sparrow.html','great-barbet.html','great-egret.html','greater-coucal.html','greater-white-fronted-goose.html','hair-crested-drongo.html','house-swift.html','large-billed-crow.html','light-vented-bulbul.html','little-egret.html','little-heron.html','long-tailed-shrike.html','masked-laughingthrush.html','oriental-magpie-robin.html','ornate-sunbird.html','pacific-reef-heron.html','plain-prinia.html','red-billed-blue-magpie.html','red-whiskered-bulbul.html','redpoll.html','ruddy-shelduck.html','scaly-breasted-munia.html','sooty-headed-bulbul.html','spotted-dove.html','swinhoes-white-eye.html','velvet-fronted-nuthatch.html','white-breasted-waterhen.html','white-rumped-munia.html','white-shouldered-starling.html','wood-sandpiper.html','yellow-bellied-prinia.html','yellow-crested-cockatoo.html'
      ];
      entries = files.map(function (f) { return { file: f, title: toTitleFromFilename(f), scientific: '' }; });
      input.addEventListener('input', onSearch);
    }
  })();

});