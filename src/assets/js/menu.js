// Digital menu — the category bar follows the reader: the section in view is
// highlighted and its tab is kept visible in the horizontally scrolling bar.
(() => {
  const nav = document.querySelector("[data-category-nav]");
  if (!nav || !("IntersectionObserver" in window)) return;
  const links = new Map(
    Array.from(nav.querySelectorAll("a")).map((a) => [a.getAttribute("href").slice(1), a])
  );
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = null;

  function activate(id) {
    const link = links.get(id);
    if (!link || link === current) return;
    if (current) current.classList.remove("is-active");
    link.classList.add("is-active");
    current = link;
    const left = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? "auto" : "smooth" });
  }

  // A section counts as "current" once it crosses a line just under the bar.
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && activate(e.target.id)),
    { rootMargin: "-20% 0px -70% 0px" }
  );
  document.querySelectorAll("[data-menu-section]").forEach((s) => observer.observe(s));

  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) activate(a.getAttribute("href").slice(1));
  });
})();
