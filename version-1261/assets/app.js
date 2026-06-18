(function () {
    const mobileButton = document.querySelector(".nav-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const previous = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        const activate = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        };

        if (previous) {
            previous.addEventListener("click", function () {
                activate(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                activate(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activate(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        activate(0);
        start();
    }

    const grids = Array.from(document.querySelectorAll(".searchable-grid"));

    if (grids.length) {
        const searchInput = document.querySelector(".movie-search");
        const yearFilter = document.querySelector(".movie-year-filter");
        const regionFilter = document.querySelector(".movie-region-filter");
        const emptyState = document.querySelector(".empty-state");
        const cards = grids.flatMap(function (grid) {
            return Array.from(grid.querySelectorAll(".movie-card"));
        });

        const filterCards = function () {
            const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            const year = yearFilter ? yearFilter.value : "";
            const region = regionFilter ? regionFilter.value : "";
            let shown = 0;

            cards.forEach(function (card) {
                const text = card.getAttribute("data-search") || "";
                const cardYear = card.getAttribute("data-year") || "";
                const cardRegion = card.getAttribute("data-region") || "";
                const matched = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year) && (!region || cardRegion === region);
                card.hidden = !matched;
                if (matched) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = shown !== 0;
            }
        };

        [searchInput, yearFilter, regionFilter].forEach(function (item) {
            if (item) {
                item.addEventListener("input", filterCards);
                item.addEventListener("change", filterCards);
            }
        });
    }

    const video = document.querySelector(".movie-video");
    const cover = document.querySelector(".player-cover");

    if (video) {
        const stream = video.querySelector("source") ? video.querySelector("source").src : video.currentSrc;
        let ready = false;

        const prepare = function () {
            if (ready || !stream) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                video.src = stream;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                ready = true;
                return;
            }

            video.src = stream;
            ready = true;
        };

        const play = function () {
            prepare();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        };

        if (cover) {
            cover.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
    }
})();
