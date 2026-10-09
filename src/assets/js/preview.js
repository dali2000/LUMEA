// LUMÉA — live preview (?preview), used by the catalogue. The invitation
// plays itself like a video: the envelope opens on its own, the film runs,
// then the page scrolls slowly down to the RSVP and starts over. Nothing
// is sent and no music plays (there is no tap, so the browser blocks it).
(() => {
  if (!new URLSearchParams(window.location.search).has("preview")) return;
  document.documentElement.classList.add("is-preview");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPEED = 42; // px per second

  function open() {
    const envelope = document.querySelector("[data-envelope]");
    if (!envelope) return scrollDown();
    setTimeout(() => {
      envelope.click();
      // The calm version waits on its "continue" button.
      if (reduceMotion) setTimeout(() => document.querySelector("[data-story-continue]")?.click(), 2500);
    }, 1400);
  }

  function scrollDown() {
    let y = window.scrollY;
    let last = performance.now();
    const scratch = document.querySelector("[data-scratch-reveal]");
    function step(now) {
      y += (SPEED * Math.min(0.1, (now - last) / 1000));
      last = now;
      window.scrollTo({ top: y, behavior: "instant" });
      // A scratch card reveals itself as it scrolls into view.
      if (scratch && !scratch.hidden && scratch.getBoundingClientRect().top < window.innerHeight * 0.7) scratch.click();
      if (y >= document.documentElement.scrollHeight - window.innerHeight) {
        setTimeout(() => window.location.reload(), 3000);
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.addEventListener("lumea:opened", () => setTimeout(scrollDown, 2800), { once: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", open);
  else open();
})();
