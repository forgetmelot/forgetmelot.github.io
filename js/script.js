document.addEventListener('DOMContentLoaded', function () {
  ['header.site-header', 'main'].forEach(function (selector) {
    Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (element, index) {
      if (index > 0) element.remove();
    });
  });

  var FAMILY_SUBTEXTS = {
    Anatidae: 'ducks, geese, and waterfowl',
    Podicipedidae: 'grebes',
    Columbidae: 'pigeons and doves',
    Phasianidae: 'pheasants, grouse, and friends',
    Cuculidae: 'cuckoos',
    Rallidae: 'rails, gallinules, and coots',
    Gruidae: 'cranes',
    Phalacrocoracidae: 'cormorants and shags',
    Ardeidae: 'egrets, herons, and bitterns',
    Threskiornithidae: 'ibises and spoonbills',
    Recurvirostridae: 'stilts and avocets',
    Charadriidae: 'plovers and lapwings',
    Scolopacidae: 'sandpipers and friends',
    Laridae: 'gulls, terns, and skimmers',
    Accipitridae: 'hawks, eagles, and kites',
    Tytonidae: 'barn-owls',
    Strigidae: 'owls',
    Alcedinidae: 'kingfishers',
    Apodidae: 'swifts',
    Upupidae: 'hoopoes',
    Cacatuidae: 'cockatoos',
    Psittaculidae: 'old world parrots',
    Megalaimidae: 'asian barbets',
    Laniidae: 'shrikes',
    Panuridae: 'bearded reedling',
    Leiothrichidae: 'laughingthrushes and friends',
    Muscicapidae: 'old world flycatchers',
    Zosteropidae: 'white-eyes, yuhinas and friends',
    Sylviidae: 'sylviid warblers and friends',
    Phylloscopidae: 'leaf warblers',
    Cisticolidae: 'cisticolas and friends',
    Nectariniidae: 'sunbirds and spiderhunters',
    Turdidae: 'thrushes and friends',
    Dicruridae: 'drongos',
    Pycnonotidae: 'bulbuls',
    Paridae: 'tits, chickadees, and titmice',
    Certhiidae: 'treecreepers',
    Sittidae: 'nuthatches',
    Fringillidae: 'finches, euphonias, and friends',
    Regulidae: 'kinglets',
    Troglodytidae: 'wrens',
    Acrocephalidae: 'reed warblers and friends',
    Cettiidae: 'bush warblers and friends',
    Estrildidae: 'waxbills and friends',
    Motacillidae: 'wagtails and pipits',
    Sturnidae: 'starlings',
    Passeridae: 'old world sparrows',
    Corvidae: 'crows, jays, and magpies',
    Emberizidae: 'old world buntings'
  };

  function isBirdPage() {
    return window.location.pathname.indexOf('/birds/') !== -1;
  }

  function getCsvPath() {
    return isBirdPage() ? '../birds.csv' : 'birds.csv';
  }

  function getIndexPagePath() {
    return isBirdPage() ? '../index.html' : 'index.html';
  }

  function getBirdPagePathPrefix() {
    return isBirdPage() ? '../' : '';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
      }[character];
    });
  }

  function slugifySpeciesName(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;

    for (var i = 0; i < text.length; i += 1) {
      var character = text.charAt(i);
      var nextCharacter = text.charAt(i + 1);

      if (inQuotes) {
        if (character === '"') {
          if (nextCharacter === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += character;
        }
        continue;
      }

      if (character === '"') {
        inQuotes = true;
        continue;
      }

      if (character === ',') {
        row.push(field);
        field = '';
        continue;
      }

      if (character === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        continue;
      }

      if (character !== '\r') {
        field += character;
      }
    }

    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }

    var headers = rows.shift() || [];
    return rows
      .filter(function (values) {
        return values.join('').trim().length > 0;
      })
      .map(function (values) {
        var record = {};
        headers.forEach(function (header, index) {
          record[header.trim()] = (values[index] || '').trim();
        });
        return record;
      });
  }

  function buildEntriesFromRows(rows) {
    return rows.map(function (row) {
      var speciesName = row.species || '';
      return {
        file: slugifySpeciesName(speciesName) + '.html',
        title: speciesName,
        scientific: row.scientific_name || '',
        otherNames: row.other_name || ''
      };
    });
  }

  function buildEntriesFromDocument(doc) {
    var anchors = doc.querySelectorAll('.species-list a[href^="birds/"]');
    var entries = [];

    anchors.forEach(function (anchor) {
      var href = anchor.getAttribute('href') || '';
      var file = href.split('/').pop();
      var title = (anchor.textContent || '').trim();
      if (!file || !title) return;
      entries.push({
        file: file,
        title: title,
        scientific: anchor.getAttribute('data-scientific') || '',
        otherNames: anchor.getAttribute('data-other-names') || ''
      });
    });

    return entries;
  }

  function groupRows(rows) {
    var orders = [];
    var orderIndex = {};

    rows.forEach(function (row) {
      var orderName = row.order || '';
      var familyName = row.family || '';

      if (!orderIndex[orderName]) {
        orderIndex[orderName] = { name: orderName, families: [], familyIndex: {} };
        orders.push(orderIndex[orderName]);
      }

      var orderGroup = orderIndex[orderName];
      if (!orderGroup.familyIndex[familyName]) {
        orderGroup.familyIndex[familyName] = { name: familyName, species: [] };
        orderGroup.families.push(orderGroup.familyIndex[familyName]);
      }

      orderGroup.familyIndex[familyName].species.push(row);
    });

    return orders;
  }

  function bindDisclosureBehavior(root) {
    root.querySelectorAll('.family-details').forEach(function (family) {
      family.addEventListener('toggle', function () {
        if (!family.open) return;
        var parent = family.parentElement;
        if (!parent) return;
        parent.querySelectorAll('.family-details').forEach(function (sibling) {
          if (sibling !== family && sibling.open) sibling.open = false;
        });
      });
    });

    root.querySelectorAll('.order-details').forEach(function (order) {
      order.addEventListener('toggle', function () {
        if (!order.open) return;
        document.querySelectorAll('.order-details').forEach(function (other) {
          if (other !== order && other.open) other.open = false;
        });
      });
    });

    root.querySelectorAll('summary').forEach(function (summary) {
      summary.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          var parent = summary.parentElement;
          if (parent && parent.tagName.toLowerCase() === 'details') {
            parent.open = !parent.open;
          }
        }
      });
    });
  }

  function buildCatalogHtml(rows) {
    return groupRows(rows).map(function (orderGroup) {
      return [
        '<details class="order-details">',
        '  <summary class="order-summary"><h1>' + escapeHtml(orderGroup.name) + '</h1></summary>',
        '  <div class="order-content">',
        orderGroup.families.map(function (familyGroup) {
          var familySubtext = FAMILY_SUBTEXTS[familyGroup.name] || '';
          return [
            '<details class="family-details">',
            '  <summary class="family-summary">' + escapeHtml(familyGroup.name) + (familySubtext ? ' <span class="subtext">' + escapeHtml(familySubtext) + '</span>' : '') + '</summary>',
            '  <ul class="species-list">',
            familyGroup.species.map(function (row) {
              var href = 'birds/' + slugifySpeciesName(row.species || '') + '.html';
              var otherNameAttribute = row.other_name ? ' data-other-names="' + escapeHtml(row.other_name) + '"' : '';
              var scientificLabel = row.scientific_name ? ' <span class="scientific-label">(' + escapeHtml(row.scientific_name) + ')</span>' : '';
              return '<li><a href="' + href + '" data-scientific="' + escapeHtml(row.scientific_name || '') + '"' + otherNameAttribute + '>' + escapeHtml(row.species || '') + scientificLabel + '</a></li>';
            }).join(''),
            '  </ul>',
            '</details>'
          ].join('\n');
        }).join('\n'),
        '  </div>',
        '</details>'
      ].join('\n');
    }).join('\n');
  }

  function getResultHref(file) {
    return isBirdPage() ? '../birds/' + file : 'birds/' + file;
  }

  function buildSearchMarkup() {
    return [
      '<div class="search-container search-container--ribbon">',
      '  <label for="bird-search" class="sr-only">Search bird pages</label>',
      '  <input id="bird-search" class="search-input" type="search" placeholder="search" autocomplete="off" aria-describedby="search-help">',
      '  <p id="search-help" class="search-help sr-only">Search by species name, scientific name, or other common names.</p>',
      '</div>'
    ].join('');
  }

  function buildBirdRibbonMarkup() {
    return [
      '<div class="nav-container">',
      '  <a class="brand" href="' + getBirdPagePathPrefix() + 'index.html">forget me lot birding</a>',
      buildSearchMarkup(),
      '  <nav class="site-nav" aria-label="Main navigation">',
      '    <ul class="nav-list">',
      '      <li><a href="' + getBirdPagePathPrefix() + 'me.html">about me</a></li>',
      '      <li><a href="' + getBirdPagePathPrefix() + 'index.html" class="lucky">i\'m feeling lucky</a></li>',
      '    </ul>',
      '  </nav>',
      '</div>'
    ].join('\n');
  }

  function renderBirdRibbon() {
    if (!isBirdPage()) return;

    var headerEl = document.querySelector('.site-header');
    if (!headerEl) {
      headerEl = document.createElement('header');
      headerEl.className = 'site-header site-header--bird';

      var mainEl = document.querySelector('main');
      if (mainEl && mainEl.parentNode) {
        mainEl.parentNode.insertBefore(headerEl, mainEl);
      } else {
        document.body.insertBefore(headerEl, document.body.firstChild);
      }
    } else {
      headerEl.classList.add('site-header--bird');
    }

    headerEl.innerHTML = buildBirdRibbonMarkup();

    var resultsEl = document.getElementById('search-results');
    if (!resultsEl) {
      resultsEl = document.createElement('div');
      resultsEl.id = 'search-results';
      resultsEl.className = 'search-results search-results--header';
      resultsEl.setAttribute('aria-live', 'polite');
      resultsEl.setAttribute('aria-relevant', 'additions removals');
      headerEl.insertAdjacentElement('afterend', resultsEl);
    }
  }

  function renderCatalog(rows) {
    var catalogs = Array.prototype.slice.call(document.querySelectorAll('.order-section'));
    var catalog = document.getElementById('bird-catalog') || catalogs[0];
    if (!catalog) return;

    catalogs.forEach(function (element) {
      if (element !== catalog) element.remove();
    });

    catalog.innerHTML = buildCatalogHtml(rows);
    bindDisclosureBehavior(catalog);
  }

  function normalizeSearchText(value) {
    return (value || '')
      .toLowerCase()
      .replace(/[-\s]+/g, '')
      .trim();
  }

  function renderSearchResults(resultsEl, list, query) {
    if (!query) {
      resultsEl.innerHTML = '';
      return;
    }

    if (!list.length) {
      resultsEl.innerHTML = '<div class="search-empty">No matches found.</div>';
      return;
    }

    var html = '<ul class="search-list">' + list.map(function (entry) {
      var scientificLabel = entry.scientific ? ' <span class="scientific-label">(' + escapeHtml(entry.scientific) + ')</span>' : '';
      return '<li class="search-item"><a href="' + getResultHref(entry.file) + '">' + escapeHtml(entry.title) + scientificLabel + '</a></li>';
    }).join('') + '</ul>';

    resultsEl.innerHTML = html;
  }

  function activateSearch(entries) {
    var input = document.getElementById('bird-search');
    var resultsEl = document.getElementById('search-results');
    if (!input || !resultsEl) return;

    function onSearch() {
      var query = normalizeSearchText(input.value || '');
      if (!query) {
        renderSearchResults(resultsEl, [], '');
        return;
      }

      var matches = entries.filter(function (entry) {
        var titleMatch = normalizeSearchText(entry.title).indexOf(query) !== -1;
        var fileMatch = normalizeSearchText(entry.file).indexOf(query) !== -1;
        var scientificMatch = entry.scientific && normalizeSearchText(entry.scientific).indexOf(query) !== -1;
        var otherNamesMatch = entry.otherNames && normalizeSearchText(entry.otherNames).indexOf(query) !== -1;
        return titleMatch || fileMatch || scientificMatch || otherNamesMatch;
      });

      renderSearchResults(resultsEl, matches, query);
    }

    input.addEventListener('input', onSearch);
  }

  function loadCatalogData() {
    return fetch(getCsvPath())
      .then(function (response) {
        return response.text();
      })
      .then(function (text) {
        var rows = parseCsv(text);
        return { rows: rows, entries: buildEntriesFromRows(rows) };
      })
      .catch(function () {
        if (!isBirdPage()) {
          return { rows: [], entries: buildEntriesFromDocument(document) };
        }

        return fetch(getIndexPagePath())
          .then(function (response) {
            return response.text();
          })
          .then(function (text) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(text, 'text/html');
            return { rows: [], entries: buildEntriesFromDocument(doc) };
          })
          .catch(function () {
            return { rows: [], entries: [] };
          });
      });
  }

  renderBirdRibbon();

  var dataPromise = loadCatalogData();

  dataPromise.then(function (data) {
    if (data.rows.length) {
      renderCatalog(data.rows);
    }
    activateSearch(data.entries);
  });

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

  (function () {
    var missingPagePath = isBirdPage() ? '../404.html' : '404.html';

    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (!link || link.classList.contains('lucky')) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var href = link.getAttribute('href') || '';
      if (!href || href.indexOf('.html') === -1) return;

      var resolvedUrl;
      try {
        resolvedUrl = new URL(href, window.location.href);
      } catch (_) {
        return;
      }

      if (resolvedUrl.origin !== window.location.origin) return;

      event.preventDefault();

      fetch(resolvedUrl.href, { method: 'HEAD' })
        .then(function (response) {
          window.location.href = response.ok ? resolvedUrl.href : missingPagePath;
        })
        .catch(function () {
          window.location.href = missingPagePath;
        });
    }, true);
  })();

  (function () {
    var luckyLink = document.querySelector('a.lucky');
    if (!luckyLink) return;

    function pickRandomAndGo(entries) {
      if (!entries || !entries.length) return;
      var target = entries[Math.floor(Math.random() * entries.length)];
      var prefix = isBirdPage() ? '../birds/' : 'birds/';
      window.location.href = prefix + target.file;
    }

    luckyLink.addEventListener('click', function (event) {
      event.preventDefault();
      loadCatalogData().then(function (data) {
        pickRandomAndGo(data.entries);
      });
    });
  })();

});