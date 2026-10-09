// LUMÉA — celebration bursts in the theme's colours. Each theme sets its
// palette and shape in CSS:
//   --confetti-colors: #hex, #hex, #hex;   --confetti-shape: paper | petals | stars
// Used for the RSVP, the scratched date, the circled calendar day, and the
// sparkles that follow the guest's finger on the page (opt out with
// "sparkles": false). One shared canvas, hidden whenever nothing falls.
// Nothing at all under reduced motion.
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;
  const body = document.body;
  let canvas = null;
  let ctx = null;
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  const pieces = [];

  function theme() {
    const styles = getComputedStyle(body);
    const colors = (styles.getPropertyValue("--confetti-colors") || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (!colors.length) colors.push(styles.getPropertyValue("--accent").trim() || "#b08d57");
    return { colors, shape: styles.getPropertyValue("--confetti-shape").trim() || "paper" };
  }

  function ensureCanvas() {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:300";
      body.appendChild(canvas);
      ctx = canvas.getContext("2d");
      window.addEventListener("resize", () => { if (raf) resize(); }, { passive: true });
    }
    canvas.style.display = "block";
    resize();
  }
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function add({ x, y, count, speed, spread, size, life }) {
    const { colors, shape } = theme();
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      const v = speed[0] + Math.random() * (speed[1] - speed[0]);
      pieces.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        size: (shape === "petals" ? 5 + Math.random() * 6 : 4 + Math.random() * 5) * size,
        rot: Math.random() * TAU,
        spin: (Math.random() - 0.5) * 10,
        flip: Math.random() * TAU,
        flipSpeed: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape,
        life: 0,
        maxLife: life * (0.75 + Math.random() * 0.25),
      });
    }
    if (!raf) {
      ensureCanvas();
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, 0.25 + Math.abs(Math.cos(p.flip)) * 0.75); // 3D tumble
    ctx.globalAlpha = Math.max(0, Math.min(1, (p.maxLife - p.life) / 0.5));
    ctx.fillStyle = p.color;
    const s = p.size;
    ctx.beginPath();
    if (p.shape === "petals") {
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.7, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.9, -s * 0.6, 0, -s);
    } else if (p.shape === "stars") {
      const k = s * 0.32;
      ctx.moveTo(0, -s);
      ctx.lineTo(k, -k);
      ctx.lineTo(s, 0);
      ctx.lineTo(k, k);
      ctx.lineTo(0, s);
      ctx.lineTo(-k, k);
      ctx.lineTo(-s, 0);
      ctx.lineTo(-k, -k);
      ctx.closePath();
    } else {
      ctx.rect(-s / 2, -s * 0.8, s, s * 1.6);
    }
    ctx.fill();
    ctx.restore();
  }

  function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    ctx.clearRect(0, 0, w, h);
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      p.life += dt;
      p.vx *= 1 - dt * 1.8; // air drag
      p.vy = p.vy * (1 - dt * 1.8) + 520 * dt; // gravity
      p.x += (p.vx + Math.sin(p.life * 3 + p.flip) * 30) * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      p.flip += p.flipSpeed * dt;
      if (p.y > h + 20 || p.life > p.maxLife) {
        pieces.splice(i, 1);
        continue;
      }
      draw(p);
    }
    if (pieces.length) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
      canvas.style.display = "none";
    }
  }

  // window.lumeaConfetti({ origin: element }) — a celebration from an element.
  // { small: true } gives a short, contained burst (calendar day, etc.).
  window.lumeaConfetti = function ({ origin, count, small } = {}) {
    if (reduceMotion) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (origin && origin.getBoundingClientRect) {
      const r = origin.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = Math.min(window.innerHeight * 0.8, Math.max(window.innerHeight * 0.2, r.top + r.height / 2));
    }
    add(
      small
        ? { x, y, count: count || 22, speed: [160, 340], spread: 2.6, size: 0.8, life: 1.8 }
        : { x, y, count: count || (window.innerWidth < 600 ? 70 : 110), speed: [260, 680], spread: 2.4, size: 1, life: 3.2 }
    );
  };

  // ---------- Sparkles under the guest's finger ----------
  if (reduceMotion || !body.classList.contains("page-invitation") || body.classList.contains("no-sparkles")) return;
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!body.classList.contains("is-opened")) return; // not during the opening film
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target.closest("input, textarea, select, label, [data-scratch-layer], .lightbox")) return;
      add({ x: e.clientX, y: e.clientY, count: 9, speed: [90, 230], spread: TAU, size: 0.6, life: 1.1 });
    },
    { passive: true }
  );
})();
