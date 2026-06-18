(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = Math.max(0, slides.findIndex(function(slide) {
      return slide.classList.contains('is-active');
    }));

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(active - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(active + 1);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function() {
      show(active + 1);
    }, 5200);
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const yearSelect = document.querySelector('[data-year-select]');

  function applyLocalFilter() {
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value : '';
    document.querySelectorAll('.movie-card[data-title]').forEach(function(card) {
      const text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre')
      ].join(' ').toLowerCase();
      const cardYear = card.getAttribute('data-year') || '';
      const matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year);
      card.hidden = !matched;
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyLocalFilter);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyLocalFilter);
  }

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.MovieSearchData) {
    const form = searchPage.querySelector('[data-search-form]');
    const input = searchPage.querySelector('[data-search-input]');
    const resultBox = searchPage.querySelector('[data-search-results]');
    const title = searchPage.querySelector('[data-search-title]');
    const desc = searchPage.querySelector('[data-search-desc]');
    const params = new URLSearchParams(window.location.search);

    function escapeText(value) {
      return String(value || '').replace(/[&<>"]/g, function(char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function card(movie) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="./' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeText(movie.title) + '" loading="lazy">' +
        '<span class="poster-badge">' + escapeText(movie.category) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<a class="card-title" href="./' + movie.url + '">' + escapeText(movie.title) + '</a>' +
        '<p class="card-desc">' + escapeText(movie.line) + '</p>' +
        '<div class="card-meta"><span>' + movie.year + '</span><span>' + escapeText(movie.region) + '</span><span>' + escapeText(movie.type) + '</span></div>' +
        '<div class="card-tags"><span>' + escapeText(movie.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }

    function render(query) {
      const q = (query || '').trim().toLowerCase();
      const data = window.MovieSearchData;
      let matched = data;

      if (q) {
        matched = data.filter(function(movie) {
          return [movie.title, movie.region, movie.type, movie.genre, movie.line, movie.category, movie.year].join(' ').toLowerCase().indexOf(q) !== -1;
        });
      } else {
        matched = data.slice().sort(function(a, b) {
          return b.views - a.views;
        }).slice(0, 60);
      }

      if (title) {
        title.textContent = q ? '搜索结果' : '热门片库';
      }

      if (desc) {
        desc.textContent = q ? '已根据关键词筛选匹配内容。' : '展示当前片库中热度较高的内容。';
      }

      if (resultBox) {
        resultBox.innerHTML = matched.slice(0, 160).map(card).join('');
      }
    }

    if (input) {
      input.value = params.get('q') || '';
    }

    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        const query = input ? input.value : '';
        const nextUrl = new URL(window.location.href);
        if (query.trim()) {
          nextUrl.searchParams.set('q', query.trim());
        } else {
          nextUrl.searchParams.delete('q');
        }
        window.history.replaceState(null, '', nextUrl.toString());
        render(query);
      });
    }

    render(input ? input.value : '');
  }
}());
