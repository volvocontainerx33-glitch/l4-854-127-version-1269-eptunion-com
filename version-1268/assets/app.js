(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = $('[data-nav-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initSearchForms() {
    $$('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"], input[type="search"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || './search.html';
        if (query) {
          window.location.href = target + '?q=' + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function initFilters() {
    var input = $('[data-filter-input]');
    var type = $('[data-type-filter]');
    var cards = $$('[data-movie-card]');
    var empty = $('[data-empty-state]');
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
    }
    function apply() {
      var query = normalize(input.value);
      var selectedType = type ? normalize(type.value) : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardType = normalize(card.getAttribute('data-type'));
        var okText = !query || haystack.indexOf(query) !== -1;
        var okType = !selectedType || cardType === selectedType;
        var show = okText && okType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }
    input.addEventListener('input', apply);
    if (type) {
      type.addEventListener('change', apply);
    }
    apply();
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $$('[data-hero-slide]', hero);
    var dots = $$('[data-hero-dot]', hero);
    if (slides.length <= 1) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        reset();
      });
    });
    hero.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });
    hero.addEventListener('mouseleave', reset);
    start();
  }

  function bindStream(video, stream) {
    if (!video || !stream || video.getAttribute('data-bound') === '1') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.setAttribute('data-bound', '1');
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      video.setAttribute('data-bound', '1');
      return;
    }
    video.src = stream;
    video.setAttribute('data-bound', '1');
  }

  function initPlayers() {
    $$('[data-player]').forEach(function (player) {
      var video = $('video', player);
      var trigger = $('[data-player-trigger]', player);
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      function start() {
        bindStream(video, stream);
        if (trigger) {
          trigger.classList.add('hidden');
        }
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === 'function') {
          playRequest.catch(function () {
            if (trigger) {
              trigger.classList.remove('hidden');
            }
          });
        }
      }
      if (trigger) {
        trigger.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (trigger) {
          trigger.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (trigger && video.currentTime === 0) {
          trigger.classList.remove('hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initSearchForms();
    initFilters();
    initHero();
    initPlayers();
  });
})();
