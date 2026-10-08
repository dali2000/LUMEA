(() => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));

  // Safety net: never let content stay invisible (slow layout, zero-height
  // container, a tool that screenshots without scrolling).
  setTimeout(() => {
    items.forEach((el) => el.classList.add("is-visible"));
    observer.disconnect();
  }, 2500);
})();
