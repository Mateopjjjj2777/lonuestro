import { initAccessibility } from "./accessibility.js";
import { initAudio } from "./audio.js";
import { initMotion } from "./motion.js";
import { initRoseGame } from "./rose-game.js";
import { initSecretSection } from "./secret-section.js";

document.documentElement.classList.add("js");
document.body.classList.add("is-loading");

const secret = initSecretSection();
const audio = initAudio();
const game = initRoseGame({ completed: secret.completed, onUnlock: secret.unlock });
secret.setGameReset(game?.reset);
initMotion();
initAccessibility(game);

const dismissLoader = () => {
  const loader = document.querySelector(".prelude-loader");
  loader?.classList.add("is-gone");
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");
};

if (document.readyState === "complete") {
  window.setTimeout(dismissLoader, 400);
} else {
  window.addEventListener("load", () => window.setTimeout(dismissLoader, 400), { once: true });
  window.setTimeout(dismissLoader, 2400);
}

void audio;
