(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }

    fn();
  };

  const normal = (value) => {
    return (value || "").toString().toLowerCase().trim();
  };

  const bindMenu = () => {
    const button = document.querySelector("[data-menu-button]");
    const nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  };

  const bindHero = () => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));

    if (slides.length === 0) {
      return;
    }

    let index = 0;
    let timer = null;

    const activate = (next) => {
      index = (next + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === index);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => {
        activate(index + 1);
      }, 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        activate(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  };

  const bindFilters = () => {
    const input = document.querySelector("[data-search-input]");
    const select = document.querySelector("[data-filter-select]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const empty = document.querySelector("[data-empty-result]");

    if (cards.length === 0 || (!input && !select)) {
      return;
    }

    const apply = () => {
      const keyword = normal(input ? input.value : "");
      const category = normal(select ? select.value : "");
      let visible = 0;

      cards.forEach((card) => {
        const title = normal(card.dataset.title);
        const meta = normal(card.dataset.meta);
        const cardCategory = normal(card.dataset.category);
        const matchText = !keyword || title.includes(keyword) || meta.includes(keyword);
        const matchCategory = !category || cardCategory === category;
        const shouldShow = matchText && matchCategory;

        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    if (select) {
      select.addEventListener("change", apply);
    }

    apply();
  };

  ready(() => {
    bindMenu();
    bindHero();
    bindFilters();
  });
})();
