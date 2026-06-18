(() => {
  const attachHls = (video, url) => {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }

    video.src = url;
  };

  window.initMoviePlayer = (videoId, buttonId, overlayId, url) => {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    const overlay = document.getElementById(overlayId);

    if (!video || !button || !overlay || !url) {
      return;
    }

    let attached = false;

    const hideOverlay = () => {
      button.classList.add("is-hidden");
      overlay.classList.add("is-hidden");
    };

    const showOverlay = () => {
      button.classList.remove("is-hidden");
      overlay.classList.remove("is-hidden");
    };

    const play = () => {
      if (!attached) {
        attachHls(video, url);
        attached = true;
      }

      hideOverlay();

      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          showOverlay();
        });
      }
    };

    button.addEventListener("click", play);
    video.addEventListener("play", hideOverlay);

    video.addEventListener("pause", () => {
      if (video.currentTime === 0 || video.ended) {
        showOverlay();
      }
    });
  };
})();
