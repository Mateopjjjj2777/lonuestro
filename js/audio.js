function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—:—";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function readSessionTime() {
  try {
    const value = Number(sessionStorage.getItem("andy-voice-time"));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveSessionTime(value) {
  try {
    sessionStorage.setItem("andy-voice-time", String(value));
  } catch {
    return;
  }
}

export function initAudio() {
  const player = document.querySelector("[data-audio-player]");
  const audio = document.querySelector("#mateo-audio");
  if (!player || !audio) return null;

  const playButton = player.querySelector("[data-audio-play]");
  const pauseButton = player.querySelector("[data-audio-pause]");
  const progress = player.querySelector("[data-audio-progress]");
  const volume = player.querySelector("[data-audio-volume]");
  const mute = player.querySelector("[data-audio-mute]");
  const muteLabel = player.querySelector("[data-mute-label]");
  const current = player.querySelector("[data-audio-current]");
  const duration = player.querySelector("[data-audio-duration]");
  const status = player.querySelector("[data-audio-status]");
  const error = player.querySelector("[data-audio-error]");
  let chosenVolume = 1;
  let fadeFrame = 0;
  let lastSavedSecond = -1;

  const cancelFade = () => {
    if (fadeFrame) cancelAnimationFrame(fadeFrame);
    fadeFrame = 0;
  };

  const fadeTo = (target, milliseconds, done) => {
    cancelFade();
    const from = audio.volume;
    const started = performance.now();
    const step = (now) => {
      const ratio = Math.min(1, (now - started) / milliseconds);
      audio.volume = from + (target - from) * ratio;
      if (ratio < 1) {
        fadeFrame = requestAnimationFrame(step);
      } else {
        fadeFrame = 0;
        if (done) done();
      }
    };
    fadeFrame = requestAnimationFrame(step);
  };

  const updateButtons = () => {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle("is-playing", playing);
    document.body.classList.toggle("audio-playing", playing);
    playButton.disabled = playing;
    pauseButton.disabled = !playing;
    status.textContent = playing ? "mi voz está contigo" : audio.currentTime > 0 ? "la carta conserva este instante" : "lista para cuando quieras escucharla";
  };

  const updateTime = () => {
    current.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
    progress.value = audio.duration ? String(Math.round((audio.currentTime / audio.duration) * 1000)) : "0";
    const wholeSecond = Math.floor(audio.currentTime);
    if (wholeSecond !== lastSavedSecond && wholeSecond % 2 === 0) {
      lastSavedSecond = wholeSecond;
      saveSessionTime(audio.currentTime);
    }
  };

  const startPlayback = async () => {
    cancelFade();
    if (audio.ended) audio.currentTime = 0;
    audio.volume = 0;
    try {
      await audio.play();
      fadeTo(chosenVolume, 650);
      updateButtons();
      error.hidden = true;
    } catch {
      audio.volume = chosenVolume;
      status.textContent = "toca reproducir de nuevo cuando estés lista";
      error.hidden = false;
    }
  };

  const pausePlayback = () => {
    if (audio.paused) return;
    fadeTo(0, 360, () => {
      audio.pause();
      audio.volume = chosenVolume;
      saveSessionTime(audio.currentTime);
      updateButtons();
    });
  };

  playButton.addEventListener("click", startPlayback);
  pauseButton.addEventListener("click", pausePlayback);

  progress.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(progress.value) / 1000) * audio.duration;
    updateTime();
  });

  volume.addEventListener("input", () => {
    chosenVolume = Number(volume.value);
    audio.volume = chosenVolume;
    if (chosenVolume > 0 && audio.muted) {
      audio.muted = false;
      mute.setAttribute("aria-pressed", "false");
      muteLabel.textContent = "silenciar";
    }
  });

  mute.addEventListener("click", () => {
    audio.muted = !audio.muted;
    mute.setAttribute("aria-pressed", String(audio.muted));
    mute.setAttribute("aria-label", audio.muted ? "Activar audio" : "Silenciar audio");
    muteLabel.textContent = audio.muted ? "activar" : "silenciar";
  });

  audio.addEventListener("loadedmetadata", () => {
    const saved = readSessionTime();
    if (saved > 0 && saved < audio.duration - 1) audio.currentTime = saved;
    updateTime();
  });
  audio.addEventListener("timeupdate", updateTime);
  audio.addEventListener("play", updateButtons);
  audio.addEventListener("pause", updateButtons);
  audio.addEventListener("ended", () => {
    saveSessionTime(0);
    status.textContent = "mi voz terminó, pero este lugar sigue contigo";
    updateButtons();
  });
  audio.addEventListener("error", () => {
    error.hidden = false;
    status.hidden = true;
    playButton.disabled = true;
    pauseButton.disabled = true;
  });

  window.addEventListener("pagehide", () => saveSessionTime(audio.currentTime));

  document.querySelectorAll("[data-audio-replay]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#voice")?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(startPlayback, 650);
    });
  });

  if ("mediaSession" in navigator && "MediaMetadata" in window) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "La voz de Mateo",
        artist: "Para Andy",
        album: "Un lugar donde vive lo que siento por ti"
      });
      navigator.mediaSession.setActionHandler("play", startPlayback);
      navigator.mediaSession.setActionHandler("pause", pausePlayback);
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (typeof details.seekTime === "number") audio.currentTime = details.seekTime;
      });
    } catch {
      return { play: startPlayback, pause: pausePlayback, element: audio };
    }
  }

  updateButtons();
  return { play: startPlayback, pause: pausePlayback, element: audio };
}
