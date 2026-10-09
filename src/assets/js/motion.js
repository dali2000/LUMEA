// LUMÉA motion — scroll parallax. Feeds scroll progress into CSS custom
// properties; the movement itself is CSS (assets/css/motion.css). The
// opening film and music live in story.js.
(() => {
  window.__lumeaMotion = true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Parallax ----------
  // [data-parallax="exit"]: --p goes 0 → 1 as the element scrolls off the top.
  // [data-parallax]:        --p goes -1 → 1 as the element crosses the viewport.
  // CSS decides what --p moves (and themes scale it with --m-parallax).
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const layers = document.querySelectorAll("[data-parallax]");
  if (!layers.length) return;

  const inView = new Set();
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? inView.add(e.target) : inView.delete(e.target))),
    { rootMargin: "15% 0px" }
  );
  layers.forEach((el) => io.observe(el));

  let ticking = false;
  function update() {
    ticking = false;
    const vh = window.innerHeight;
    inView.forEach((el) => {
      const r = el.getBoundingClientRect();
      let p;
      if (el.dataset.parallax === "exit") {
        p = Math.min(1, Math.max(0, -r.top / r.height));
      } else {
        p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        p = Math.min(1, Math.max(-1, p));
      }
      el.style.setProperty("--p", p.toFixed(4));
    });
  }
  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  requestUpdate();
})();
