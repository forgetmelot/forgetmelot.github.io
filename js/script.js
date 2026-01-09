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

  // Lucky link: redirect to a random species page
  (function () {
    var speciesPages = [
      'birds/asian-koel.html',
      'birds/black-collared-starling.html',
      'birds/black-crowned-night-heron.html',
      'birds/black-drongo.html',
      'birds/black-winged-stilt.html',
      'birds/blue-whistling-thrush.html',
      'birds/blue-winged-minla.html',
      'birds/chinese-blackbird.html',
      'birds/common-greenshank.html',
      'birds/common-myna.html',
      'birds/common-sandpiper.html',
      'birds/common-tern.html',
      'birds/crested-myna.html',
      'birds/greater-white-fronted-goose.html',
      'birds/large-billed-crow.html',
      'birds/long-tailed-shrike.html',
      'birds/masked-laughingthrush.html',
      'birds/pacific-reef-heron.html',
      'birds/plain-prinia.html',
      'birds/red-whiskered-bulbul.html',
      'birds/redpoll.html',
      'birds/ruddy-shelduck.html',
      'birds/sooty-headed-bulbul.html',
      'birds/spotted-dove.html',
      'birds/white-breasted-waterhen.html',
      'birds/white-shouldered-starling.html',
      'birds/wood-sandpiper.html',
      'birds/yellow-bellied-prinia.html'
    ];
    var luckyLink = document.querySelector('a.lucky');
    if (!luckyLink) return;
    luckyLink.addEventListener('click', function (e) {
      e.preventDefault();
      var target = speciesPages[Math.floor(Math.random() * speciesPages.length)];
      window.location.href = target;
    });
  })();

});