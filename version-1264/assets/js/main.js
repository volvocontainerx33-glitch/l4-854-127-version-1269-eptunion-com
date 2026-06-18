(() => {
    const body = document.body;
    const toggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", () => {
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            mobileNav.classList.toggle("open", !expanded);
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    let activeSlide = 0;
    let slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, current) => {
            slide.classList.toggle("active", current === activeSlide);
        });
        dots.forEach((dot, current) => {
            dot.classList.toggle("active", current === activeSlide);
        });
    }

    function startSlides() {
        if (slideTimer || slides.length < 2) {
            return;
        }
        slideTimer = window.setInterval(() => showSlide(activeSlide + 1), 5000);
    }

    function restartSlides() {
        if (slideTimer) {
            window.clearInterval(slideTimer);
            slideTimer = null;
        }
        startSlides();
    }

    document.querySelector(".hero-arrow.prev")?.addEventListener("click", () => {
        showSlide(activeSlide - 1);
        restartSlides();
    });

    document.querySelector(".hero-arrow.next")?.addEventListener("click", () => {
        showSlide(activeSlide + 1);
        restartSlides();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const index = Number(dot.getAttribute("data-go-slide"));
            showSlide(index);
            restartSlides();
        });
    });

    showSlide(0);
    startSlides();

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function decadeMatch(year, decade) {
        const parsed = Number(year);
        if (!decade) {
            return true;
        }
        if (!Number.isFinite(parsed)) {
            return false;
        }
        const base = Number(decade);
        if (base === 1990) {
            return parsed <= 1999;
        }
        return parsed >= base && parsed <= base + 9;
    }

    const searchInput = document.querySelector(".site-search");
    const categoryFilter = document.querySelector(".category-filter");
    const yearFilter = document.querySelector(".year-filter");
    const resetButton = document.querySelector(".filter-reset");
    const filterCards = Array.from(document.querySelectorAll(".movie-card[data-title]"));

    function applyFilters() {
        const query = normalize(searchInput?.value);
        const category = normalize(categoryFilter?.value);
        const decade = normalize(yearFilter?.value);
        let visible = 0;

        filterCards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.category,
                card.dataset.genre
            ].join(" "));
            const okQuery = !query || haystack.includes(query);
            const okCategory = !category || normalize(card.dataset.category) === category;
            const okYear = decadeMatch(card.dataset.year, decade);
            const show = okQuery && okCategory && okYear;
            card.classList.toggle("hidden-by-filter", !show);
            if (show) {
                visible += 1;
            }
        });

        document.querySelectorAll(".no-results").forEach((node) => node.remove());
        if (filterCards.length && visible === 0) {
            const grid = document.querySelector(".catalog-grid") || document.querySelector(".movie-grid");
            if (grid) {
                const empty = document.createElement("div");
                empty.className = "no-results";
                empty.textContent = "没有匹配的影片，请调整关键词或筛选条件。";
                grid.appendChild(empty);
            }
        }
    }

    [searchInput, categoryFilter, yearFilter].forEach((control) => {
        control?.addEventListener("input", applyFilters);
        control?.addEventListener("change", applyFilters);
    });

    resetButton?.addEventListener("click", () => {
        if (searchInput) {
            searchInput.value = "";
        }
        if (categoryFilter) {
            categoryFilter.value = "";
        }
        if (yearFilter) {
            yearFilter.value = "";
        }
        applyFilters();
    });

    function setupPlayer(stage) {
        const video = stage.querySelector("video");
        const button = stage.querySelector(".player-overlay");
        const stream = stage.getAttribute("data-stream");
        let loaded = false;
        let hls = null;

        function begin() {
            if (!video || !stream) {
                return;
            }
            stage.classList.add("ready");
            if (loaded) {
                video.play().catch(() => {});
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 60,
                    backBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {});
                });
                hls.on(window.Hls.Events.ERROR, (_event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", () => video.play().catch(() => {}), { once: true });
            } else {
                video.src = stream;
                video.play().catch(() => {});
            }
        }

        button?.addEventListener("click", begin);
        stage.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                begin();
            }
        });

        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll(".player-stage").forEach(setupPlayer);

    body.classList.add("is-ready");
})();
