(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var setSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }
    }

    var bindFilter = function () {
        var input = document.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
        var activeValue = '';
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-text]'));
        var apply = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-text') || '').toLowerCase();
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var matchedQuery = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
                var matchedButton = !activeValue || text.indexOf(activeValue.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedButton));
            });
        };
        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeValue = button.getAttribute('data-filter-value') || '';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        apply();
    };

    var bindPlayers = function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var source = player.getAttribute('data-src');
            var prepared = false;
            var prepare = function () {
                if (!video || !source || prepared) {
                    return;
                }
                prepared = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            };
            var start = function () {
                prepare();
                if (button) {
                    button.classList.add('hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove('hidden');
                        }
                    });
                }
            };
            if (button) {
                button.addEventListener('click', start);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        start();
                    }
                });
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('hidden');
                    }
                });
            }
        });
    };

    bindFilter();
    bindPlayers();
})();
