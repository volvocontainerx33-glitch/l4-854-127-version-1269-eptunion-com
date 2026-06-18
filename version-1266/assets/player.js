(function () {
  function setText(node, value) {
    if (node) {
      node.textContent = value || "";
    }
  }

  window.initializePlayer = function (sourceUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-play-overlay]");
    var message = document.querySelector("[data-player-message]");
    var hls = null;
    var prepared = false;

    if (!video || !sourceUrl) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      setText(message, "");

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setText(message, "播放暂时不可用，请稍后再试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else {
        setText(message, "播放暂时不可用，请稍后再试");
      }
    }

    function play() {
      prepare();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setText(message, "点击播放按钮开始观看");
        });
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", toggle);
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      setText(message, "");
    });
    video.addEventListener("pause", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
    video.addEventListener("error", function () {
      setText(message, "播放暂时不可用，请稍后再试");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
