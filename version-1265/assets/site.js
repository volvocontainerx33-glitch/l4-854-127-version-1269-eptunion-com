(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function openMobileMenu() {
    var menu = qs('[data-mobile-menu]');
    if (menu) {
      menu.classList.toggle('is-open');
    }
  }

  function initHeader() {
    qsa('[data-menu-toggle]').forEach(function (button) {
      button.addEventListener('click', openMobileMenu);
    });

    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        var url = './search.html';
        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove('is-active');
      if (dots[index]) {
        dots[index].classList.remove('is-active');
      }
      index = next;
      slides[index].classList.add('is-active');
      if (dots[index]) {
        dots[index].classList.add('is-active');
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function initSearchPage() {
    var panel = qs('[data-search-panel]');
    if (!panel) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var input = qs('[data-filter-query]', panel);
    var region = qs('[data-filter-region]', panel);
    var year = qs('[data-filter-year]', panel);
    var collection = qs('[data-filter-collection]', panel);
    var empty = qs('[data-filter-empty]');
    var cards = qsa('[data-movie-card]');
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    function normalize(value) {
      return (value || '').toString().toLowerCase();
    }
    function apply() {
      var keyword = normalize(input && input.value);
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var collectionValue = collection ? collection.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          ok = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          ok = false;
        }
        if (collectionValue && card.getAttribute('data-collection') !== collectionValue) {
          ok = false;
        }
        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('hidden', visible !== 0);
      }
    }
    [input, region, year, collection].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupHls(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return hls;
    }
    video.src = source;
    return null;
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('[data-play-overlay]', player);
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-hls');
      var loaded = false;
      var hlsInstance = null;
      function start() {
        if (!source) {
          return;
        }
        if (!loaded) {
          hlsInstance = setupHls(video, source);
          loaded = true;
        }
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
      if (overlay) {
        overlay.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initSearchPage();
    initPlayers();
  });
})();
