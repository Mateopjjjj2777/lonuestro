const completionKey = "andy-found-the-rose";

function saveCompletion() {
  try {
    localStorage.setItem(completionKey, "true");
  } catch {
    return;
  }
}

export function initSecretSection() {
  const postGame = document.querySelector("[data-post-game]");
  const secret = document.querySelector("#secret");
  const finale = document.querySelector("#finale");
  const returnPortal = document.querySelector(".return-portal");
  const replayButton = document.querySelector("[data-replay-rose]");
  const secretTitle = document.querySelector("#secret-title");
  let gameReset = null;
  const completed = false;
  let unlocked = completed;

  const setPostGameAccess = (available) => {
    if (!postGame) return;
    postGame.hidden = !available;
    postGame.inert = !available;
    postGame.setAttribute("aria-hidden", String(!available));
  };

  const showUnlocked = ({ move = true } = {}) => {
    if (!postGame || !secret || !finale) return;
    setPostGameAccess(true);
    document.body.classList.add("rose-found");
    if (returnPortal) returnPortal.hidden = false;
    if (move) {
      window.setTimeout(() => {
        secret.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        secretTitle?.setAttribute("tabindex", "-1");
        secretTitle?.focus({ preventScroll: true });
      }, 220);
    }
  };

  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    saveCompletion();
    showUnlocked();
  };

  const setGameReset = (handler) => {
    gameReset = handler;
  };

  replayButton?.addEventListener("click", () => {
    if (gameReset) gameReset();
  });

  document.querySelectorAll(".secret-letters details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      document.querySelectorAll(".secret-letters details[open]").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  setPostGameAccess(false);

  return { completed, unlock, setGameReset };
}
