(function () {
  var heroTimer = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupImages() {
    document.querySelectorAll('img.cover-img, img.hero-image, img.detail-cover-img').forEach(function (img) {
      img.addEventListener('error', function () {
        var holder = img.closest('.poster, .hero-image-wrap, .detail-cover');
        if (holder) {
          holder.classList.add('poster-empty');
        }
        img.remove();
      }, { once: true });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      window.clearInterval(heroTimer);
      heroTimer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var scope = document.querySelector('[data-filter-scope]');
      if (!scope) {
        return;
      }
      var input = panel.querySelector('[data-search-input]');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
      var reset = panel.querySelector('[data-reset-filter]');
      var status = panel.querySelector('[data-filter-status]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));
      var empty = document.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && input) {
        input.value = query;
      }

      function filter() {
        var q = normalize(input ? input.value : '');
        var values = {};
        selects.forEach(function (select) {
          values[select.getAttribute('data-filter')] = normalize(select.value);
        });
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matched = !q || haystack.indexOf(q) !== -1;
          Object.keys(values).forEach(function (key) {
            if (values[key]) {
              var field = normalize(card.getAttribute('data-' + key));
              if (field.indexOf(values[key]) === -1) {
                matched = false;
              }
            }
          });
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', shown === 0);
        }
        if (status) {
          status.textContent = shown === 0 ? '没有找到匹配内容，可以换一个关键词。' : '匹配内容已更新，可直接点击卡片播放。';
        }
      }

      if (input) {
        input.addEventListener('input', filter);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', filter);
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          selects.forEach(function (select) {
            select.value = '';
          });
          filter();
        });
      }
      filter();
    });
  }

  function setupPlayer() {
    var video = document.querySelector('video[data-source]');
    if (!video) {
      return;
    }
    var button = document.querySelector('[data-play-button]');
    var message = document.querySelector('[data-player-message]');
    var initialized = false;
    var hls = null;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.hidden = false;
    }

    function hideMessage() {
      if (message) {
        message.hidden = true;
      }
    }

    function requestPlay() {
      hideMessage();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showMessage('点击视频控件即可继续播放。');
        });
      }
    }

    function initPlayer(autoplay) {
      if (initialized) {
        if (autoplay) {
          requestPlay();
        }
        return;
      }
      initialized = true;
      var source = video.getAttribute('data-source');
      if (!source) {
        showMessage('视频源暂不可用。');
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (autoplay) {
            requestPlay();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage('网络加载遇到问题，正在尝试恢复。');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage('媒体加载遇到问题，正在尝试恢复。');
            hls.recoverMediaError();
          } else {
            showMessage('播放器暂时无法载入该视频。');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          if (autoplay) {
            requestPlay();
          }
        }, { once: true });
      } else {
        video.src = source;
        if (autoplay) {
          requestPlay();
        }
      }
    }

    if (button) {
      button.addEventListener('click', function () {
        button.classList.add('is-hidden');
        initPlayer(true);
      });
    }

    video.addEventListener('click', function () {
      if (!initialized) {
        if (button) {
          button.classList.add('is-hidden');
        }
        initPlayer(true);
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupImages();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
