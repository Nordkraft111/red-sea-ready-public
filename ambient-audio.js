(() => {
  "use strict";

  // Magnus' chosen underwater recording, prepared as a local MP3 asset.
  // An empty source creates no media element and makes no media request.
  const AUDIO_SOURCE = "assets/audio/red-sea-ambience.mp3";
  const source = AUDIO_SOURCE.trim();
  if (!source) return;

  const POSITION_KEY = `red-sea-ready:ambient-position:${source}`;
  const audio = document.createElement("audio");
  audio.hidden = true;
  audio.controls = false;
  audio.loop = true;
  audio.volume = 0.5;
  audio.preload = "auto";
  audio.setAttribute("aria-hidden", "true");
  audio.setAttribute("playsinline", "");
  audio.dataset.ambientAudio = "";
  audio.dataset.state = "starting";

  let stopped = false;
  let interactionAttempted = false;
  let resumePosition = null;

  try {
    const stored = sessionStorage.getItem(POSITION_KEY);
    const position = stored === null ? NaN : Number(stored);
    if (Number.isFinite(position) && position >= 0) resumePosition = position;
  } catch {
    // Playback also works when the browser disallows session storage.
  }

  const removeInteractionListeners = () => {
    document.removeEventListener("click", onInteraction, true);
    document.removeEventListener("keydown", onInteraction, true);
  };

  const stopAttempts = (state) => {
    stopped = true;
    removeInteractionListeners();
    audio.dataset.state = state;
    audio.pause();
  };

  async function attemptPlayback() {
    if (stopped) return;
    audio.dataset.state = "starting";
    try {
      await audio.play();
      if (!stopped) {
        removeInteractionListeners();
        audio.dataset.state = "playing";
      }
    } catch (error) {
      if (stopped) return;
      if (error?.name === "NotAllowedError" && !interactionAttempted) {
        audio.dataset.state = "waiting-for-interaction";
        document.addEventListener("click", onInteraction, true);
        document.addEventListener("keydown", onInteraction, true);
      } else {
        stopAttempts(error?.name === "NotAllowedError" ? "blocked" : "error");
      }
    }
  }

  function onInteraction(event) {
    if (!event.isTrusted || stopped || interactionAttempted) return;
    if (event.type === "keydown" && (
      event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.isComposing ||
      ["Escape", "Shift", "Control", "Alt", "AltGraph", "Meta", "CapsLock", "NumLock", "ScrollLock", "Fn", "FnLock"].includes(event.key) ||
      /^F\d{1,2}$/.test(event.key)
    )) return;
    interactionAttempted = true;
    removeInteractionListeners();
    // Use the browser's normal user activation without changing the event.
    void attemptPlayback();
  }

  audio.addEventListener("loadedmetadata", () => {
    if (resumePosition === null || stopped) return;
    const duration = audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    try {
      audio.currentTime = resumePosition % duration;
    } catch {
      // Seeking is optional; a browser that cannot seek starts at the beginning.
    }
    resumePosition = null;
  }, { once: true });

  audio.addEventListener("error", () => stopAttempts("error"));
  audio.addEventListener("playing", () => {
    if (!stopped) audio.dataset.state = "playing";
  });
  audio.addEventListener("pause", () => {
    if (!stopped && audio.dataset.state === "playing") audio.dataset.state = "paused";
  });

  window.addEventListener("pagehide", () => {
    if (stopped || !Number.isFinite(audio.currentTime)) return;
    try {
      sessionStorage.setItem(POSITION_KEY, String(audio.currentTime));
    } catch {
      // Navigation never depends on storage being available.
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && !stopped && audio.paused && audio.dataset.state === "paused") {
      void attemptPlayback();
    }
  });

  document.body.append(audio);
  audio.src = source;
  void attemptPlayback();
})();
