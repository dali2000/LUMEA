// LUMÉA — animated calendar. When it comes into view (after the opening
// film, and after the date is scratched when "scratch" is on), the desk
// calendar leafs through the months up to the wedding month, then the day
// is circled by hand and a few sparkles fall. Reduced motion: the wedding
// month, already marked. Without JS the date stays as plain text.
(() => {
  const root = document.querySelector("[data-calendar]");
  if (!root) return;
  const stack = root.querySelector("[data-cal-stack]");
  const target = new Date(root.dataset.calendar);
  if (!stack || Number.isNaN(target.getTime())) return;

  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = window.LUMEA_T || {};
  const MONTH = new Intl.DateTimeFormat(root.dataset.locale || "fr-FR", { month: "long", year: "numeric" });
  const DOW = T.dow || ["L", "M", "M", "J", "V", "S", "D"];
  const MARK =
    '<svg class="cal-mark" viewBox="0 0 40 40" aria-hidden="true">' +
    '<path class="cal-circle" d="M21 4 C 32 3, 38 11, 37 20 C 36 30, 28 37, 18 36 C 8 35, 3 27, 5 17 C 7 9, 14 4, 25 6" pathLength="1" />' +
    '<path class="cal-heart" d="M34 9 C 31 7, 30 4, 32 3 C 33 2.4, 34 3, 34 4 C 34 3, 35 2.4, 36 3 C 38 4, 37 7, 34 9 Z" />' +
    "</svg>";

  const fallback = stack.textContent.trim();
  stack.setAttribute("role", "img");
  stack.setAttribute("aria-label", `${T.calendar || "Calendrier"} : ${fallback}`);

  function page(y, m) {
    const el = document.createElement("div");
    el.className = "cal-page";
    el.setAttribute("aria-hidden", "true");
    const title = document.createElement("p");
    title.className = "cal-month";
    const label = MONTH.format(new Date(y, m, 1));
    title.textContent = label.charAt(0).toUpperCase() + label.slice(1);
    el.appendChild(title);
    const grid = document.createElement("div");
    grid.className = "cal-grid";
    DOW.forEach((d) => {
      const s = document.createElement("span");
      s.className = "cal-dow";
      s.textContent = d;
      grid.appendChild(s);
    });
    const first = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
    const count = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < 42; i++) {
      const day = i - first + 1;
      const s = document.createElement("span");
      s.className = "cal-day";
      if (day >= 1 && day <= count) {
        s.textContent = day;
        if (y === target.getFullYear() && m === target.getMonth() && day === target.getDate()) {
          s.classList.add("is-day");
          s.insertAdjacentHTML("beforeend", MARK);
        }
      }
      grid.appendChild(s);
    }
    el.appendChild(grid);
    return el;
  }

  // Leaf through at most six months, starting from this month.
  const now = new Date();
  const ahead = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  const months = reduceMotion ? 0 : Math.max(0, Math.min(6, ahead));
  const start = new Date(target.getFullYear(), target.getMonth() - months, 1);
  let current = page(start.getFullYear(), start.getMonth());
  stack.replaceChildren(current);
  root.classList.add("is-ready");

  function mark() {
    root.classList.add("is-marked");
    const day = root.querySelector(".is-day");
    if (day && window.lumeaConfetti) setTimeout(() => window.lumeaConfetti({ origin: day, count: 22, small: true }), 900);
  }

  function play() {
    let i = 0;
    const step = () => {
      if (i >= months) return mark();
      i++;
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const next = page(d.getFullYear(), d.getMonth());
      stack.insertBefore(next, current); // beneath the page that leaves
      const leaving = current;
      leaving.classList.add("is-leaving");
      current = next;
      setTimeout(() => {
        leaving.remove();
        step();
      }, 430);
    };
    setTimeout(step, 350);
  }

  if (reduceMotion) {
    root.classList.add("is-marked");
    return;
  }

  const opened =
    body.classList.contains("is-opened") || !document.querySelector("[data-story]")
      ? Promise.resolve()
      : new Promise((resolve) => document.addEventListener("lumea:opened", resolve, { once: true }));
  const visible = new Promise((resolve) => {
    if (!("IntersectionObserver" in window)) return resolve();
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        resolve();
      },
      { threshold: 0.6 }
    );
    io.observe(root);
  });
  // With "scratch", the calendar waits until the guest has revealed the date.
  const unlocked = () =>
    body.classList.contains("scratch-locked")
      ? new Promise((resolve) => document.addEventListener("lumea:date-revealed", resolve, { once: true }))
      : Promise.resolve();

  Promise.all([opened, visible]).then(unlocked).then(play);
})();
