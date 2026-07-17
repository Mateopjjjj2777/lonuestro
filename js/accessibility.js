export function initAccessibility(game) {
  let keyboardMode = false;
  window.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && !keyboardMode) {
      keyboardMode = true;
      document.body.classList.add("keyboard-navigation");
    }
    if (event.key === "Escape") game?.closeMessage({ restoreFocus: true });
  });

  window.addEventListener("pointerdown", () => {
    keyboardMode = false;
    document.body.classList.remove("keyboard-navigation");
  }, { passive: true });

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      window.setTimeout(() => {
        if (!keyboardMode) return;
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, 500);
    });
  });
}
