(() => {
  const el = document.querySelector("[data-countdown]");
  if (!el) return;
  const target = new Date(el.getAttribute("data-countdown")).getTime();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const UNITS = ["days", "hours", "minutes", "seconds"];

  const fields = {};
  const shown = {};
  UNITS.forEach((u) => (fields[u] = el.querySelector(`[data-unit="${u}"]`)));

  function remaining() {
    const diff = Math.max(0, target - Date.now());
    return {
      diff,
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }

  // Only touches units whose text changed; `tick` drops the new digits in softly.
  function render(values, tick) {
    UNITS.forEach((u) => {
      const field = fields[u];
      if (!field) return;
      const text = String(values[u]).padStart(2, "0");
      if (shown[u] === text) return;
      shown[u] = text;
      field.textContent = text;
      if (tick && !reduceMotion && field.animate) {
        field.animate(
          [{ opacity: 0, transform: "translateY(-0.35em)" }, { opacity: 1, transform: "none" }],
          { duration: 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );
      }
    });
  }

  let timer;
  function startTicking() {
    render(remaining(), true);
    timer = setInterval(() => {
      const values = remaining();
      render(values, true);
      if (values.diff <= 0) clearInterval(timer);
    }, 1000);
  }

  // First appearance: the numbers count up from zero to the real values.
  function countUp() {
    const final = remaining();
    const start = performance.now();
    const duration = 1600;
    function frame(now) {
      const k = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 4);
      const values = {};
      UNITS.forEach((u) => (values[u] = Math.round(final[u] * eased)));
      render(values, false);
      if (k < 1) requestAnimationFrame(frame);
      else startTicking();
    }
    requestAnimationFrame(frame);
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    startTicking();
    return;
  }

  const begin = () => setTimeout(countUp, 250);
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      if (document.body.classList.contains("is-opened") || !document.querySelector("[data-story]")) begin();
      else document.addEventListener("lumea:opened", begin, { once: true });
    },
    { threshold: 0.4 }
  );
  observer.observe(el);
})();
