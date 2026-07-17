const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const saveData = Boolean(navigator.connection?.saveData);

function revealContent() {
  const elements = [...document.querySelectorAll(".reveal")];
  if (motionPreference.matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return () => {};
  }

  const reveal = (element) => {
    element.classList.add("is-visible");
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
    });
  }, {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.08
  });

  elements.forEach((element) => observer.observe(element));
  let index = 0;
  return () => {
    const line = window.innerHeight * 0.88;
    while (index < elements.length) {
      const element = elements[index];
      if (element.classList.contains("is-visible")) {
        index += 1;
        continue;
      }
      if (!element.getClientRects().length || element.getBoundingClientRect().top > line) return;
      reveal(element);
      index += 1;
    }
  };
}

function seedStars(container, count) {
  if (!container || container.childElementCount) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index += 1) {
    const star = document.createElement("span");
    const random = Math.abs(Math.sin((index + 1) * 91.771));
    const second = Math.abs(Math.sin((index + 1) * 47.239));
    star.style.left = `${4 + random * 92}%`;
    star.style.top = `${2 + second * 94}%`;
    star.style.setProperty("--size", `${1 + (index % 3) * 0.55}px`);
    star.style.setProperty("--alpha", `${0.2 + random * 0.45}`);
    star.style.setProperty("--drift", `${7 + (index % 6)}s`);
    star.style.setProperty("--delay", `${-(index % 7)}s`);
    star.style.setProperty("--x-drift", `${(second - 0.5) * 0.7}rem`);
    fragment.append(star);
  }
  container.append(fragment);
}

function createNightLayers() {
  const compact = window.innerWidth < 600;
  const density = saveData ? 12 : compact ? 24 : 44;
  document.querySelectorAll(".starfield, .deep-sky").forEach((field, index) => {
    seedStars(field, Math.max(8, density - index * 4));
  });
}

function trackJourney(revealPassed) {
  let frame = 0;
  const update = () => {
    revealPassed();
    const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    document.documentElement.style.setProperty("--journey", String(Math.min(1, Math.max(0, window.scrollY / limit))));
    frame = 0;
  };
  const requestUpdate = () => {
    if (frame) return;
    frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
}

function stabilizeUserScroll() {
  document.documentElement.style.scrollBehavior = "auto";
  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      window.history.pushState(null, "", hash);
      target.scrollIntoView({ behavior: motionPreference.matches ? "auto" : "smooth" });
    });
  });
}

function addTouchLight() {
  const star = document.querySelector(".first-star");
  if (!star) return;
  star.addEventListener("click", () => {
    star.classList.remove("is-touched");
    requestAnimationFrame(() => star.classList.add("is-touched"));
    if (navigator.vibrate) navigator.vibrate(12);
  });
}

function addGameParallax() {
  const stage = document.querySelector("[data-game-stage]");
  if (!stage || motionPreference.matches || saveData) return;
  let frame = 0;
  let x = 50;
  let y = 50;
  const paint = () => {
    stage.style.setProperty("--game-x", `${x}%`);
    stage.style.setProperty("--game-y", `${y}%`);
    frame = 0;
  };
  stage.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    if (!frame) frame = requestAnimationFrame(paint);
  }, { passive: true });
}

function pauseWhenHidden() {
  document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("is-paused", document.hidden);
  });
}

export function initMotion() {
  const revealPassed = revealContent();
  createNightLayers();
  trackJourney(revealPassed);
  stabilizeUserScroll();
  addTouchLight();
  addGameParallax();
  pauseWhenHidden();
}
