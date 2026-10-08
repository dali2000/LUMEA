(() => {
  const overlay = document.querySelector("[data-intro]");
  if (!overlay) return;

  const openBtn = overlay.querySelector("[data-open-invite]");
  const audio = document.querySelector("[data-bg-music]");
  const musicToggle = document.querySelector("[data-music-toggle]");

  document.body.style.overflow = "hidden";

  function openInvite() {
    overlay.classList.add("is-closing");
    document.body.style.overflow = "";
    if (audio) {
      audio.play().catch(() => {
        // Autoplay blocked — the floating toggle still lets the guest start it.
      });
      if (musicToggle) musicToggle.hidden = false;
    }
    window.setTimeout(() => overlay.remove(), 700);
  }

  openBtn.addEventListener("click", openInvite, { once: true });

  if (audio && musicToggle) {
    audio.addEventListener("error", () => musicToggle.remove(), { once: true });
    musicToggle.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {});
        musicToggle.classList.remove("is-muted");
      } else {
        audio.pause();
        musicToggle.classList.add("is-muted");
      }
    });
  }
})();
