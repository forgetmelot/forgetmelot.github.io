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
    Emberizidae: 'old world buntings',
    Alaudidae: 'larks'
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

  function createBirdNavLink(href, text, className) {
    var link = document.createElement('a');
    link.href = href;
    link.className = className;
    link.textContent = text;
    return link;
  }

  function createBirdNavSpacer() {
    var spacer = document.createElement('span');
    spacer.className = 'bird-nav-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    return spacer;
  }

  function addBirdPageNavigation(rows) {
    var main = document.querySelector('.species-page');
    if (!main || !rows || !rows.length) return;

    var pages = buildEntriesFromRows(rows);
    var currentFile = window.location.pathname.split('/').pop();
    var currentIndex = pages.findIndex(function (page) {
      return page.file === currentFile;
    });
    if (currentIndex === -1) return;

    var nav = document.createElement('nav');
    nav.className = 'bird-page-nav';
    nav.setAttribute('aria-label', 'Bird page navigation');

    var prevPage = pages[currentIndex - 1];
    var nextPage = pages[currentIndex + 1];

    nav.append(
      prevPage
        ? createBirdNavLink('../birds/' + prevPage.file, '← Previous', 'bird-nav-link bird-nav-link--prev')
        : createBirdNavSpacer(),
      createBirdNavLink('../index.html', 'Back to birds', 'back-link bird-nav-link bird-nav-link--center'),
      nextPage
        ? createBirdNavLink('../birds/' + nextPage.file, 'Next →', 'bird-nav-link bird-nav-link--next')
        : createBirdNavSpacer()
    );

    var existingContainer = document.querySelector('.back-link-container');
    if (existingContainer) {
      existingContainer.replaceWith(nav);
    } else {
      main.append(nav);
    }
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
      '  <a class="brand" href="' + getBirdPagePathPrefix() + 'index.html">',
      '    <span class="brand-part">forget me lot</span>',
      '    <span class="brand-part">birding</span>',
      '  </a>',
      buildSearchMarkup(),
      '  <nav class="site-nav" aria-label="Main navigation">',
      '    <ul class="nav-list">',
      '      <li><a href="' + getBirdPagePathPrefix() + 'me.html" class="nav-link"><span class="nav-part">about me</span></a></li>',
      '      <li><a href="' + getBirdPagePathPrefix() + 'index.html" class="lucky nav-link"><span class="nav-part">i\'m feeling</span><span class="nav-part">lucky</span></a></li>',
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

    var mainEl = document.querySelector('main.species-page');
    if (mainEl) {
      mainEl.classList.add('species-page--tight');
    }

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
      addBirdPageNavigation(data.rows);
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

  const BIRD_CSV_URL = "../birds.csv";

  function createColorChip(hex) {
    const chip = document.createElement("span");
    chip.className = "color-chip";

    const label = document.createElement("span");
    label.className = "color-hex";
    label.textContent = hex;

    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = hex;
    swatch.setAttribute("aria-hidden", "true");

    chip.append(label, swatch);
    return chip;
  }

  function replaceHexColorLinks() {
    document.querySelectorAll(".species-page a").forEach((anchor) => {
      const text = anchor.textContent.trim();
      const hexMatch = text.match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/);
      if (!hexMatch) return;

      anchor.replaceWith(createColorChip(hexMatch[0]));
    });
  }

  function replacePlainHexCodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.closest(".color-chip, a")) {
          return NodeFilter.FILTER_REJECT;
        }
        return /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/.test(node.nodeValue)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const text = node.nodeValue;
      const fragment = document.createDocumentFragment();
      const regex = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text))) {
        if (match.index > lastIndex) {
          fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        fragment.append(createColorChip(match[0]));
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        fragment.append(document.createTextNode(text.slice(lastIndex)));
      }

      node.parentNode.replaceChild(fragment, node);
    });
  }

  function parseCsvLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  function slugFromText(text) {
    return text
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeBirdPath(value) {
    if (!value) return "";
    const cleaned = value.replace(/^["']|["']$/g, "").trim();
    const file = cleaned.split("/").pop();
    if (file.endsWith(".html")) return file;
    if (file) return `${file}.html`;
    return "";
  }

  async function getBirdPagesFromCsv() {
    const response = await fetch(BIRD_CSV_URL, { cache: "no-store" });
    if (!response.ok) return [];

    const csv = await response.text();
    const lines = csv.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

    const hrefIndex = headers.findIndex((h) =>
      ["href", "path", "url", "file", "page"].includes(h)
    );
    const nameIndex = headers.findIndex((h) =>
      ["name", "common_name", "common", "species"].includes(h)
    );

    return lines.slice(1).map((line) => {
      const cols = parseCsvLine(line);
      const rawHref = hrefIndex >= 0 ? cols[hrefIndex] : cols[0];
      const rawName = nameIndex >= 0 ? cols[nameIndex] : cols[1] || cols[0];

      let href = normalizeBirdPath(rawHref);
      if (!href && rawName) {
        href = `${slugFromText(rawName)}.html`;
      }

      return {
        href,
        label: rawName || href.replace(/\.html$/, ""),
      };
    }).filter((item) => item.href);
  }

  function addBirdPageNavigation(rows) {
    var main = document.querySelector('.species-page');
    if (!main || !rows || !rows.length) return;

    var pages = buildEntriesFromRows(rows);
    var currentFile = window.location.pathname.split('/').pop();
    var currentIndex = pages.findIndex(function (page) {
      return page.file === currentFile;
    });
    if (currentIndex === -1) return;

    var nav = document.createElement('nav');
    nav.className = 'bird-page-nav';
    nav.setAttribute('aria-label', 'Bird page navigation');

    var prevPage = pages[currentIndex - 1];
    var nextPage = pages[currentIndex + 1];

    nav.append(
      prevPage
        ? createBirdNavLink('../birds/' + prevPage.file, '← Previous', 'bird-nav-link bird-nav-link--prev')
        : createBirdNavSpacer(),
      createBirdNavLink('../index.html', 'Back to birds', 'back-link bird-nav-link bird-nav-link--center'),
      nextPage
        ? createBirdNavLink('../birds/' + nextPage.file, 'Next →', 'bird-nav-link bird-nav-link--next')
        : createBirdNavSpacer()
    );

    var existingContainer = document.querySelector('.back-link-container');
    if (existingContainer) {
      existingContainer.replaceWith(nav);
    } else {
      main.append(nav);
    }
  }

  function applyBirdPageEnhancements() {
    replaceHexColorLinks();
    replacePlainHexCodes();
    addBirdPageNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyBirdPageEnhancements);
  } else {
    applyBirdPageEnhancements();
  }
});