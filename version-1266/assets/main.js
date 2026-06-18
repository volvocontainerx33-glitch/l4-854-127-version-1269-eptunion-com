(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
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
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length) {
      return;
    }
    var activeFilter = "all";

    function getQuery() {
      var value = "";
      inputs.forEach(function (input) {
        if (input.value.trim()) {
          value = input.value.trim().toLowerCase();
        }
      });
      return value;
    }

    function apply() {
      var query = getQuery();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilter === "all" || tags.indexOf(activeFilter) !== -1;
        card.classList.toggle("hide-card", !(matchesText && matchesFilter));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", apply);
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = (button.getAttribute("data-filter-button") || "all").toLowerCase();
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
  }

  function setupHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-header-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "search.html";
        }
      });
    });
  }

  function setupSearchPage() {
    var pageInput = document.querySelector("[data-page-search]");
    if (!pageInput) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      pageInput.value = query;
      pageInput.dispatchEvent(new Event("input"));
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupHeaderSearch();
    setupSearchPage();
  });
})();
