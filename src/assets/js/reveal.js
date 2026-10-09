(() => {
  const groups = document.querySelectorAll(".reveal");
  if (!groups.length) return;

  // Index each child so CSS can stagger them (delay = --i × --m-stagger).
  groups.forEach((group) =>
    Array.from(group.children).forEach((child, i) => child.style.setProperty("--i", i))
  );

  // On invitations, nothing below the opening film should play while the
  // guest is still watching it — wait for story.js to announce the opening.
  // If it never runs, fall back after a few seconds.
  const hasIntro = !!document.querySelector("[data-story]");
  const opened = hasIntro
    ? new Promise((resolve) => {
        document.addEventListener("lumea:opened", resolve, { once: true });
        setTimeout(() => { if (!window.__lumeaMotion) resolve(); }, 4000);
      })
    : Promise.resolve();

  function show(el) {
    if (el.classList.contains("is-visible")) return;
    el.classList.add("is-visible");
    // Once the entrance has played, drop the staggered transitions so
    // children's own hover/focus transitions respond instantly again.
    setTimeout(() => el.classList.add("is-settled"), 3200);
  }

  if (!("IntersectionObserver" in window)) {
    opened.then(() => groups.forEach(show));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        opened.then(() => show(entry.target));
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  groups.forEach((el) => observer.observe(el));

  // Safety net: anything already on screen (or scrolled past) after a short
  // while is shown even if the observer missed it — zero-height containers,
  // screenshot tools. Content further down still waits for the scroll.
  opened.then(() =>
    setTimeout(() => {
      groups.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          observer.unobserve(el);
          show(el);
        }
      });
    }, 2500)
  );
})();
