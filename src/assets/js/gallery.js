(() => {
  const tiles = Array.from(document.querySelectorAll("[data-gallery-item]"));
  if (!tiles.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  const T = window.LUMEA_T || {};

  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", T.gallery || "Galerie");
  box.innerHTML =
    `<button class="lightbox-close" aria-label="${T.close || "Fermer"}">&times;</button>` +
    `<button class="lightbox-nav lightbox-prev" aria-label="${T.prev || "Photo précédente"}">&lsaquo;</button>` +
    '<figure class="lightbox-content"></figure>' +
    `<button class="lightbox-nav lightbox-next" aria-label="${T.next || "Photo suivante"}">&rsaquo;</button>` +
    '<p class="lightbox-count"></p>';
  document.body.appendChild(box);

  const content = box.querySelector(".lightbox-content");
  const count = box.querySelector(".lightbox-count");
  const closeBtn = box.querySelector(".lightbox-close");
  if (tiles.length < 2) box.querySelectorAll(".lightbox-nav, .lightbox-count").forEach((n) => n.remove());

  let index = 0;
  let lastFocus = null;
  let busy = false;

  function fill(i) {
    const tile = tiles[i];
    const caption = tile.querySelector("figcaption");
    content.innerHTML = tile.querySelector(".gallery-media").outerHTML + (caption ? caption.outerHTML : "");
    count.textContent = `${i + 1} / ${tiles.length}`;
  }

  function open(i) {
    lastFocus = document.activeElement;
    index = i;
    fill(i);
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!box.classList.contains("is-open")) return;
    box.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  // Crossfade with a short drift in the direction of travel.
  function go(dir) {
    if (tiles.length < 2 || busy) return;
    const next = (index + dir + tiles.length) % tiles.length;
    if (reduceMotion || !content.animate) {
      index = next;
      fill(next);
      return;
    }
    busy = true;
    const out = content.animate(
      [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-dir * 28}px)` }],
      { duration: 220, easing: "ease-in", fill: "forwards" }
    );
    out.onfinish = () => {
      index = next;
      fill(next);
      out.cancel();
      content.animate(
        [{ opacity: 0, transform: `translateX(${dir * 28}px)` }, { opacity: 1, transform: "none" }],
        { duration: 500, easing: EASE }
      ).onfinish = () => (busy = false);
    };
  }

  tiles.forEach((tile, i) => {
    tile.addEventListener("click", () => open(i));
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(i);
      }
    });
  });

  box.addEventListener("click", (e) => {
    if (e.target === box || e.target === closeBtn) close();
    else if (e.target.closest(".lightbox-prev")) go(-1);
    else if (e.target.closest(".lightbox-next")) go(1);
  });

  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  });

  // Swipe between photos on touch screens.
  let touchX = null;
  box.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  box.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  });
})();
