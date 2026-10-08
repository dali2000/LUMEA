(() => {
  const tiles = document.querySelectorAll("[data-gallery-item]");
  if (!tiles.length) return;

  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.innerHTML = '<button class="lightbox-close" aria-label="Fermer">&times;</button><div class="lightbox-content"></div>';
  document.body.appendChild(overlay);
  const content = overlay.querySelector(".lightbox-content");

  function open(tile) {
    content.innerHTML = tile.innerHTML;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  tiles.forEach((tile) => tile.addEventListener("click", () => open(tile)));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.classList.contains("lightbox-close")) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
