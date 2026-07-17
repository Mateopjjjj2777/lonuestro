const completionKey = "andy-found-the-rose";

function readCompletion() {
  try {
    return localStorage.getItem(completionKey) === "true";
  } catch {
    return false;
  }
}

function saveCompletion() {
  try {
    localStorage.setItem(completionKey, "true");
  } catch {
    return;
  }
}

export function initSecretSection() {
  const secret = document.querySelector("#secret");
  const finale = document.querySelector("#finale");
  const returnPortal = document.querySelector(".return-portal");
  const replayButton = document.querySelector("[data-replay-rose]");
  const secretTitle = document.querySelector("#secret-title");
  let gameReset = null;
  const completed = readCompletion();

  const showUnlocked = ({ move = true } = {}) => {
    if (!secret || !finale) return;
    secret.hidden = false;
    finale.hidden = false;
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
    saveCompletion();
    showUnlocked();
  };

  const setGameReset = (handler) => {
    gameReset = handler;
  };

  replayButton?.addEventListener("click", () => {
    secret.hidden = true;
    finale.hidden = true;
    document.body.classList.remove("rose-found");
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

  if (completed) showUnlocked({ move: false });

  return { completed, unlock, setGameReset };
}
