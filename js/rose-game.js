import { poeticProgress, starMemories } from "./content.js";

const svgNamespace = "http://www.w3.org/2000/svg";

function createSoftChime(index) {
  if (document.body.classList.contains("audio-playing")) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    const context = createSoftChime.context || new AudioContextClass();
    createSoftChime.context = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(480 + index * 24, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.014, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.45);
  } catch {
    return;
  }
}

function buildConstellation(map) {
  const circles = [];
  const lines = [];
  starMemories.forEach((memory, index) => {
    const circle = document.createElementNS(svgNamespace, "circle");
    circle.setAttribute("cx", String(memory.x));
    circle.setAttribute("cy", String(memory.y));
    circle.setAttribute("r", ".45");
    circle.dataset.point = String(index);
    map.append(circle);
    circles.push(circle);
    if (index === 0) return;
    const previous = starMemories[index - 1];
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", String(previous.x));
    line.setAttribute("y1", String(previous.y));
    line.setAttribute("x2", String(memory.x));
    line.setAttribute("y2", String(memory.y));
    line.dataset.segment = String(index - 1);
    map.prepend(line);
    lines.push(line);
  });
  return { circles, lines };
}

export function initRoseGame({ completed = false, onUnlock } = {}) {
  const stage = document.querySelector("[data-game-stage]");
  const starsContainer = document.querySelector("[data-game-stars]");
  const map = document.querySelector("[data-constellation]");
  const instruction = document.querySelector("[data-game-instruction]");
  const progress = document.querySelector("[data-game-progress]");
  const message = document.querySelector("[data-star-message]");
  const messageText = document.querySelector("[data-star-message-text]");
  const closeButton = document.querySelector("[data-star-close]");
  const finalStar = document.querySelector("[data-final-star]");
  const roseReveal = document.querySelector("#rose-reveal");
  const roseAccess = document.querySelector("[data-rose-access]");
  if (!stage || !starsContainer || !map || !message || !finalStar || !roseReveal || !roseAccess) return null;

  const visited = new Set();
  const starButtons = [];
  const { circles, lines } = buildConstellation(map);
  let lastStar = null;

  const closeMessage = ({ restoreFocus = true } = {}) => {
    message.hidden = true;
    if (restoreFocus && lastStar) lastStar.focus({ preventScroll: true });
  };

  const updateConstellation = () => {
    circles.forEach((circle, index) => circle.classList.toggle("is-lit", visited.has(index)));
    lines.forEach((line, index) => line.classList.toggle("is-lit", index < visited.size - 1));
    if (!visited.size) {
      progress.textContent = "la constelación espera su primera luz";
      return;
    }
    progress.textContent = poeticProgress[visited.size - 1];
    if (visited.size === starMemories.length) {
      instruction.textContent = "todavía falta una · no busques la más brillante · busca la que siempre consigue hacerme volver a ti";
      finalStar.hidden = false;
    }
  };

  const visitStar = (button, memory, index) => {
    if (button.dataset.moved === "true") {
      button.dataset.moved = "false";
      return;
    }
    lastStar = button;
    visited.add(index);
    button.classList.add("is-visited");
    button.setAttribute("aria-pressed", "true");
    messageText.textContent = memory.text;
    message.hidden = false;
    updateConstellation();
    createSoftChime(index);
    if (navigator.vibrate) navigator.vibrate(8);
    closeButton.focus({ preventScroll: true });
  };

  starMemories.forEach((memory, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "game-star";
    button.style.left = `${memory.x}%`;
    button.style.top = `${memory.y}%`;
    button.style.setProperty("--star-size", memory.size);
    button.setAttribute("aria-label", `Abrir la estrella de recuerdo ${index + 1}`);
    button.setAttribute("aria-pressed", "false");
    let pointerStart = null;
    button.addEventListener("pointerdown", (event) => {
      pointerStart = { x: event.clientX, y: event.clientY };
    }, { passive: true });
    button.addEventListener("pointerup", (event) => {
      if (!pointerStart) return;
      const movement = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
      button.dataset.moved = String(movement > 12);
      pointerStart = null;
    }, { passive: true });
    button.addEventListener("click", () => visitStar(button, memory, index));
    starsContainer.append(button);
    starButtons.push(button);
  });

  closeButton.addEventListener("click", () => closeMessage());

  const showRose = ({ scroll = true } = {}) => {
    roseReveal.hidden = false;
    requestAnimationFrame(() => roseReveal.classList.add("is-awake"));
    if (scroll) roseReveal.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  finalStar.addEventListener("click", () => {
    closeMessage({ restoreFocus: false });
    stage.classList.add("is-revealing");
    progress.textContent = "las luces encontraron el camino hasta ella";
    createSoftChime(starMemories.length + 2);
    if (navigator.vibrate) navigator.vibrate([12, 45, 18]);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 40 : 2650;
    window.setTimeout(() => showRose(), delay);
  });

  roseAccess.addEventListener("click", () => {
    if (navigator.vibrate) navigator.vibrate(16);
    if (onUnlock) onUnlock();
  });

  const reset = () => {
    visited.clear();
    starButtons.forEach((button) => {
      button.classList.remove("is-visited");
      button.setAttribute("aria-pressed", "false");
    });
    circles.forEach((circle) => circle.classList.remove("is-lit"));
    lines.forEach((line) => line.classList.remove("is-lit"));
    finalStar.hidden = true;
    message.hidden = true;
    stage.classList.remove("is-revealing");
    roseReveal.classList.remove("is-awake");
    roseReveal.hidden = true;
    instruction.textContent = "algunas guardan algo nuestro";
    progress.textContent = "la constelación espera su primera luz";
    document.querySelector("#rose-game")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => starButtons[0]?.focus({ preventScroll: true }), 650);
  };

  if (completed) showRose({ scroll: false });

  return { reset, closeMessage, showRose };
}
