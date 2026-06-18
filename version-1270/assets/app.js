(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (value) {
          window.location.href = './search.html?q=' + encodeURIComponent(value);
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        stop();
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var select = scope.querySelector('[data-filter-select]');
      var cards = selectAll('[data-card]', scope);
      var empty = scope.querySelector('[data-empty]');

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var type = select ? select.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-text') || '').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var matchedText = !keyword || text.indexOf(keyword) !== -1;
          var matchedType = !type || cardType === type;
          var ok = matchedText && matchedType;
          card.classList.toggle('hidden-card', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
      apply();
    });
  }

  function createSearchCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span class="pill">' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<a class="card movie-card" href="' + escapeHtml(item.url) + '">',
      '<div class="poster tall">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="corner left">' + escapeHtml(item.year) + '</span>',
      '<span class="corner right">' + escapeHtml(item.type) + '</span>',
      '<span class="play-badge">▶</span>',
      '</div>',
      '<div class="card-body">',
      '<div class="card-meta">' + tags + '</div>',
      '<h2 class="card-title">' + escapeHtml(item.title) + '</h2>',
      '<p class="card-desc">' + escapeHtml(item.desc) + '</p>',
      '</div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root || !window.SearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = root.querySelector('[data-search-input]');
    var results = root.querySelector('[data-search-results]');
    var empty = root.querySelector('[data-search-empty]');
    var title = root.querySelector('[data-search-title]');

    if (input) {
      input.value = query;
    }

    function render(value) {
      var q = value.trim().toLowerCase();
      var matched = window.SearchIndex.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(' '), item.desc].join(' ').toLowerCase();
        return q ? text.indexOf(q) !== -1 : true;
      }).slice(0, 96);

      if (title) {
        title.textContent = q ? '搜索：' + value.trim() : '影片搜索';
      }
      if (results) {
        results.innerHTML = matched.map(createSearchCard).join('');
      }
      if (empty) {
        empty.style.display = matched.length ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(query);
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var source = video ? video.querySelector('source') : null;
      var overlay = box.querySelector('[data-player-start]');
      var hls = null;
      if (!video || !source) {
        return;
      }

      function loadAndPlay() {
        var url = source.getAttribute('src');
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', url);
          }
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hls) {
            hls = new window.Hls({
              maxBufferLength: 60,
              enableWorker: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          }
          video.play().catch(function () {});
          return;
        }
        if (!video.getAttribute('src')) {
          video.setAttribute('src', url);
        }
        video.play().catch(function () {});
      }

      if (overlay) {
        overlay.addEventListener('click', loadAndPlay);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
