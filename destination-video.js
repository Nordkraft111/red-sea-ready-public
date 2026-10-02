(() => {
  "use strict";

  const frame = document.querySelector("[data-destination-video]");
  const source = frame?.dataset.videoSrc?.trim();
  // Set data-video-src when the local clip is ready. An empty source stays inert.
  if (!source) return;

  const video = frame.querySelector("video");
  const fallback = frame.querySelector(".destination-video__fallback");
  const toggle = frame.querySelector(".destination-video__toggle");
  if (!video || !fallback || !toggle) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let loaded = false;
  let ready = false;
  let failed = false;
  let userPaused = reducedMotion.matches;
  let playPending = false;
  let observer = null;

  video.muted = true;
  video.defaultMuted = true;

  const shouldPlay = () => visible && !document.hidden && !userPaused && !failed;
  const updateToggle = () => {
    toggle.textContent = video.paused ? "Afspil video" : "Pause video";
  };

  function showFallback() {
    fallback.hidden = false;
    video.hidden = true;
  }

  async function updatePlayback() {
    if (!ready || failed) return;
    if (!shouldPlay()) {
      video.pause();
      updateToggle();
      return;
    }
    if (playPending || !video.paused) return;
    playPending = true;
    // Keep the fallback above the video until its first frame is playing.
    video.hidden = false;
    try {
      await video.play();
      if (!shouldPlay()) video.pause();
    } catch (error) {
      if (error?.name === "AbortError" && !shouldPlay()) return;
      userPaused = true;
      showFallback();
    } finally {
      playPending = false;
      updateToggle();
    }
  }

  function loadClip() {
    if (loaded || failed) return;
    loaded = true;
    video.src = source;
    video.preload = "metadata";
    video.load();
  }

  video.addEventListener("loadedmetadata", () => {
    if (failed) return;
    ready = true;
    toggle.hidden = false;
    updateToggle();
    void updatePlayback();
  }, { once: true });
  video.addEventListener("playing", () => {
    if (!shouldPlay()) {
      video.pause();
      return;
    }
    video.hidden = false;
    fallback.hidden = true;
    updateToggle();
  });
  video.addEventListener("pause", updateToggle);
  video.addEventListener("error", () => {
    failed = true;
    video.pause();
    showFallback();
    toggle.hidden = true;
    observer?.disconnect();
  });

  toggle.addEventListener("click", () => {
    userPaused = !(userPaused || video.paused);
    void updatePlayback();
  });
  document.addEventListener("visibilitychange", () => void updatePlayback());
  reducedMotion.addEventListener("change", (event) => {
    userPaused = event.matches;
    if (event.matches) showFallback();
    void updatePlayback();
  });

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .15;
      if (visible) loadClip();
      void updatePlayback();
    }, { threshold: [0, .15] });
    observer.observe(frame);
  } else {
    visible = true;
    loadClip();
  }
})();
