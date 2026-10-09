// LUMÉA — scratch to reveal the date ("scratch": true in the JSON).
// A foil layer in the theme's colours covers the date; the guest scratches it
// away with a finger. Past 60% of the surface the foil dissolves, confetti
// falls and the countdown comes into focus. The date itself is real text
// underneath (read by screen readers), and a button reveals it without
// scratching.
(() => {
  const root = document.querySelector("[data-scratch]");
  if (!root) return;
  const canvas = root.querySelector("[data-scratch-layer]");
  const card = root.querySelector(".scratch-card");
  const skip = root.querySelector("[data-scratch-reveal]");
  const hint = root.querySelector(".scratch-hint");
  if (!canvas || !canvas.getContext) return;

  const body = document.body;
  const T = window.LUMEA_T || {};
  const TAU = Math.PI * 2;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let w = 0;
  let h = 0;
  let dpr = 1;
  let strokes = 0;
  let drawing = false;
  let lastPt = null;
  let revealed = false;

  body.classList.add("scratch-locked");
  root.classList.add("is-ready");

  function paint() {
    w = card.offsetWidth;
    h = card.offsetHeight;
    if (!w || !h) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    const s = getComputedStyle(body);
    const a = s.getPropertyValue("--scratch-1").trim() || s.getPropertyValue("--accent").trim() || "#b08d57";
    const b = s.getPropertyValue("--scratch-2").trim() || "#f3e3b5";
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, a);
    g.addColorStop(0.42, b);
    g.addColorStop(0.58, b);
    g.addColorStop(1, a);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Foil grain
    for (let i = 0, n = (w * h) / 80; i < n; i++) {
      ctx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.3).toFixed(2)})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.fillStyle = s.getPropertyValue("--scratch-ink").trim() || "rgba(0,0,0,0.5)";
    ctx.font = `600 ${Math.max(11, Math.min(14, w * 0.036))}px Inter, system-ui, sans-serif`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`✦  ${T.scratchHere || "GRATTEZ ICI"}  ✦`, w / 2, h / 2);
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
  }

  function scratchTo(p) {
    const brush = Math.max(16, w * 0.06);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brush * 2;
    ctx.beginPath();
    if (lastPt) {
      ctx.moveTo(lastPt.x, lastPt.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else {
      ctx.arc(p.x, p.y, brush, 0, TAU);
      ctx.fill();
    }
    lastPt = p;
    if (++strokes % 10 === 0) check();
  }

  // Share of the foil already scratched off, sampled on a sparse grid.
  function check() {
    if (revealed || !canvas.width) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 29) {
      total++;
      if (data[i] < 60) clear++;
    }
    if (clear / total > 0.6) reveal();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.add("is-revealed");
    body.classList.remove("scratch-locked");
    document.dispatchEvent(new CustomEvent("lumea:date-revealed")); // calendar.js
    if (skip) skip.hidden = true;
    if (hint) hint.textContent = T.scratchDone || "Nous avons hâte de vous y retrouver !";
    setTimeout(() => canvas.remove(), 900);
    if (window.lumeaConfetti) window.lumeaConfetti({ origin: card });
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (revealed) return;
    drawing = true;
    lastPt = null;
    root.classList.add("is-scratching");
    canvas.setPointerCapture(e.pointerId);
    scratchTo(pos(e));
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    (events.length ? events : [e]).forEach((ev) => scratchTo(pos(ev)));
  });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    lastPt = null;
    check();
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  if (skip) skip.addEventListener("click", reveal);

  paint();
  // Repaint once the label font is ready, and when the card changes size
  // (rotation), as long as the guest has not started scratching.
  if (document.fonts) document.fonts.ready.then(() => { if (!strokes && !revealed) paint(); });
  if ("ResizeObserver" in window) {
    let lastW = w;
    new ResizeObserver(() => {
      if (revealed || card.offsetWidth === lastW) return;
      lastW = card.offsetWidth;
      strokes = 0;
      paint();
    }).observe(card);
  }
})();
