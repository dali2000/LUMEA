// LUMÉA — template catalogue. Each phone loads its demo invitation in
// preview mode (it plays itself, see preview.js) only while it is on
// screen, and is emptied once it leaves, so a phone never runs more than a
// few films at once. Also: the occasion tabs and the preview language.
(() => {
  const cards = Array.from(document.querySelectorAll(".tpl"));
  if (!cards.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MAX_LIVE = window.matchMedia("(min-width: 900px)").matches ? 4 : 2;
  const PHONE_W = 390;

  // ---------- The iframe fits its phone ----------
  const fit = (screen) => {
    const phone = screen.querySelector(".tpl-phone");
    phone.style.setProperty("--k", (phone.clientWidth / PHONE_W).toFixed(4));
  };
  const screens = cards.map((c) => c.querySelector("[data-preview]"));
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver((entries) => entries.forEach((e) => fit(e.target.closest("[data-preview]"))));
    screens.forEach((s) => ro.observe(s.querySelector(".tpl-phone")));
  } else {
    screens.forEach(fit);
  }

  // ---------- Live previews ----------
  const live = []; // most recent last
  function play(screen) {
    const frame = screen.querySelector("[data-frame]");
    if (frame.dataset.current === screen.dataset.src) return;
    frame.classList.remove("is-loaded");
    frame.onload = () => {
      if (frame.src !== "about:blank") frame.classList.add("is-loaded");
    };
    frame.src = screen.dataset.src;
    frame.dataset.current = screen.dataset.src;
    screen.classList.add("is-live");
    const i = live.indexOf(screen);
    if (i >= 0) live.splice(i, 1);
    live.push(screen);
    while (live.length > MAX_LIVE) stop(live[0]);
  }
  function stop(screen) {
    const frame = screen.querySelector("[data-frame]");
    const i = live.indexOf(screen);
    if (i >= 0) live.splice(i, 1);
    screen.classList.remove("is-live");
    if (!frame.dataset.current) return;
    frame.classList.remove("is-loaded");
    frame.removeAttribute("src");
    delete frame.dataset.current;
  }

  // Reduced motion: no self-playing films; the poster and the demo link stay.
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.intersectionRatio >= 0.55) play(e.target);
          else if (!e.isIntersecting) stop(e.target);
        }),
      { threshold: [0, 0.55] }
    );
    screens.forEach((s) => io.observe(s));
  }

  // ---------- Preview language ----------
  cards.forEach((card) => {
    const screen = card.querySelector("[data-preview]");
    card.querySelectorAll("[data-preview-lang]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const path = btn.dataset.previewLang;
        card.querySelectorAll("[data-preview-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        card.querySelectorAll("[data-demo-link]").forEach((a) => (a.href = path));
        screen.dataset.src = `${path}?preview`;
        if (screen.classList.contains("is-live")) play(screen);
      })
    );
  });

  // ---------- Occasion tabs ----------
  const tabs = document.querySelector("[data-catalog-tabs]");
  if (!tabs) return;
  function select(filter) {
    tabs.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.occasion === filter;
      if (card.hidden === !show) return;
      card.hidden = !show;
      if (!show) stop(card.querySelector("[data-preview]"));
      else if (!reduceMotion) {
        card.classList.remove("is-entering");
        void card.offsetWidth; // restart the entrance
        card.classList.add("is-entering");
      }
    });
  }
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (btn) select(btn.dataset.filter);
  });
  // /modeles/#birthday opens on that occasion (links from the home page)
  const fromHash = window.location.hash.slice(1);
  if (fromHash && tabs.querySelector(`[data-filter="${CSS.escape(fromHash)}"]`)) select(fromHash);
})();
