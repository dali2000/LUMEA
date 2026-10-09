// LUMÉA opening film — conducts the scenes of the envelope story.
// The choreography itself is CSS (assets/css/story.css): this script adds the
// scene classes on a timeline, starts the music on the guest's tap, drives
// the particle canvas and the touch micro-interactions.
(() => {
  window.__lumeaMotion = true;

  const body = document.body;
  const root = document.querySelector("[data-story]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const audio = document.querySelector("[data-bg-music]");
  const musicToggle = document.querySelector("[data-music-toggle]");

  function markOpened() {
    body.classList.add("is-opened");
    document.dispatchEvent(new CustomEvent("lumea:opened"));
  }

  // ---------- Music ----------
  let musicStarted = false;
  function startMusic() {
    if (!audio || musicStarted) return;
    musicStarted = true;
    // Must run inside the tap handler: browsers only allow audio after a gesture.
    audio.play().catch(() => {});
  }
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

  if (!root) {
    markOpened();
    return;
  }

  // ---------- Timeline (ms after the tap) ----------
  // The ring box opening needs a longer first beat (lid, then the ring
  // shines): data-open-offset shifts every following scene.
  const offset = Number(root.dataset.openOffset) || 0;
  const SCENES = [
    [1950, "is-card"],
    [4600, "is-couple"],
    [7000, "is-bloom"],
    [9000, "is-ring"],
  ].map(([ms, cls]) => [ms + offset, cls]);
  const REVEAL_AT = 10800 + offset;

  const envelope = root.querySelector("[data-envelope]");
  const wrap = root.querySelector("[data-tilt]");
  const timers = [];
  const portalSupported = !!(window.CSS && CSS.registerProperty);
  const particles = createParticles(root.querySelector("[data-story-particles]"), root.dataset.particles);

  root.classList.add("is-ready"); // cancels the CSS failsafe
  if (!portalSupported) root.classList.add("no-portal");
  body.style.overflow = "hidden";

  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, wait(1000)]) : Promise.resolve();
  fontsReady.then(() =>
    requestAnimationFrame(() => {
      root.classList.add("is-playing");
      particles.level(0.25);
    })
  );

  function open() {
    if (root.classList.contains("is-open")) return;
    startMusic();
    root.classList.add("is-open");
    resetTilt();
    if (reduceMotion) return; // static version: the card + a continue button
    particles.level(0.55);
    SCENES.forEach(([ms, cls]) =>
      timers.push(
        setTimeout(() => {
          root.classList.add(cls);
          if (cls === "is-bloom") {
            particles.burst();
            particles.level(1);
          }
          if (cls === "is-ring") {
            particles.level(0.6);
            if (root.dataset.finale === "fireworks" || root.dataset.finale === "age") particles.burst();
          }
        }, ms)
      )
    );
    timers.push(setTimeout(reveal, REVEAL_AT));
  }

  function reveal() {
    if (root.classList.contains("is-reveal")) return;
    timers.forEach(clearTimeout);
    root.classList.add("is-reveal");
    body.style.overflow = "";
    markOpened();
    if (audio && musicToggle) musicToggle.hidden = false;
    const ms = reduceMotion ? 350 : portalSupported ? 1350 : 750;
    setTimeout(() => {
      particles.stop();
      root.remove();
    }, ms);
  }

  envelope.addEventListener("click", open);
  root.querySelector("[data-story-skip]").addEventListener("click", () => {
    startMusic();
    reveal();
  });
  root.querySelector("[data-story-continue]").addEventListener("click", reveal);
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") reveal();
  });

  if (reduceMotion) return;

  // ---------- Micro-interactions ----------
  // The envelope tilts gently towards the pointer / finger before it opens.
  root.addEventListener("pointermove", (e) => {
    if (!wrap || root.classList.contains("is-open")) return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    wrap.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
    wrap.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
  });
  root.addEventListener("pointerleave", resetTilt);
  // A soft glow ripples out from where the finger lands.
  envelope.addEventListener("pointerdown", (e) => {
    if (root.classList.contains("is-open")) return;
    const r = envelope.getBoundingClientRect();
    const dot = document.createElement("span");
    dot.className = "env-ripple";
    dot.style.left = `${e.clientX - r.left}px`;
    dot.style.top = `${e.clientY - r.top}px`;
    envelope.appendChild(dot);
    setTimeout(() => dot.remove(), 950);
  });

  function resetTilt() {
    if (!wrap) return;
    wrap.style.removeProperty("--rx");
    wrap.style.removeProperty("--ry");
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ---------- Particles ----------
  // petals: fall and flutter · dust: gold motes drift up · stars: twinkle in
  // place · fireflies: wander and pulse · lanterns: sky lanterns float up ·
  // confetti: paper squares in three colours tumble down (birthday).
  function createParticles(canvas, mode) {
    const noop = { level() {}, burst() {}, stop() {} };
    if (!canvas || reduceMotion || !canvas.getContext) return noop;
    const ctx = canvas.getContext("2d");
    const styles = getComputedStyle(root);
    const colors = ["--st-p1", "--st-p2", "--st-p3"].map((v) => styles.getPropertyValue(v).trim()).filter(Boolean);
    const CONFIG = {
      petals: { mobile: 18, desktop: 28, rate: 0.25, burst: 14 },
      dust: { mobile: 34, desktop: 56, rate: 0.5, burst: 30 },
      stars: { mobile: 40, desktop: 70, rate: 0.5, burst: 34 },
      fireflies: { mobile: 14, desktop: 22, rate: 0.12, burst: 12 },
      lanterns: { mobile: 8, desktop: 13, rate: 0.03, burst: 7 },
      confetti: { mobile: 22, desktop: 38, rate: 0.3, burst: 70 },
    };
    if (!CONFIG[mode]) mode = "dust";
    const cfg = CONFIG[mode];
    const petals = mode === "petals";
    const confetti = mode === "confetti";
    const falling = petals || confetti;
    const TAU = Math.PI * 2;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let target = 0;
    let raf = 0;
    let last = performance.now();
    const items = [];

    // Glows are pre-rendered once per colour: drawImage is far cheaper than
    // shadowBlur or a gradient per particle on phones.
    const sprites = mode === "fireflies" || mode === "lanterns" ? colors.slice(0, 2).map(glowSprite) : null;
    function glowSprite(color) {
      const s = document.createElement("canvas");
      s.width = s.height = 64;
      const g = s.getContext("2d");
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      const clear = /^#[0-9a-f]{6}$/i.test(color) ? color + "00" : "rgba(255,255,255,0)";
      grad.addColorStop(0, color);
      grad.addColorStop(0.22, color);
      grad.addColorStop(1, clear);
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return s;
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const max = () => (w < 600 ? cfg.mobile : cfg.desktop);

    function spawn(x, y, vx, vy) {
      const r = Math.random;
      const ci = confetti ? Math.floor(r() * colors.length) : r() < 0.65 ? 0 : 1;
      const p = {
        x: x ?? r() * w,
        y: 0,
        vx: 0,
        vy: 0,
        size: 1,
        span: 7.2, // seconds before a drifting particle fades out
        rot: r() * TAU,
        spin: (r() - 0.5) * 1.6,
        flip: r() * TAU,
        sway: r() * TAU,
        ci,
        color: colors[ci],
        life: 0,
      };
      if (falling) {
        p.y = y ?? -20;
        p.vx = vx ?? 6 + r() * 14;
        p.vy = vy ?? 18 + r() * 22;
        p.size = confetti ? 3.5 + r() * 3.5 : 6 + r() * 7;
        if (confetti) p.spin *= 3;
      } else if (mode === "lanterns") {
        p.y = y ?? h + 30;
        p.vx = vx ?? (r() - 0.5) * 6;
        p.vy = vy ?? -(14 + r() * 14);
        p.size = 6 + r() * 5;
      } else if (mode === "fireflies") {
        p.y = y ?? h * (0.3 + r() * 0.7);
        p.vx = vx ?? (r() - 0.5) * 16;
        p.vy = vy ?? (r() - 0.5) * 12;
        p.size = 2 + r() * 2;
        p.span = 6 + r() * 5;
      } else if (mode === "stars") {
        p.y = y ?? r() * h;
        p.vx = vx ?? (r() - 0.5) * 2;
        p.vy = vy ?? -1 - r() * 2;
        p.size = 0.5 + r() * 1.7;
        p.span = 7 + r() * 4;
      } else {
        p.y = y ?? r() * h;
        p.vx = vx ?? (r() - 0.5) * 6;
        p.vy = vy ?? -4 - r() * 8;
        p.size = 0.6 + r() * 1.6;
      }
      items.push(p);
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.35 + Math.abs(Math.cos(p.flip)) * 0.65); // 3D flutter
      ctx.globalAlpha = 0.85 * Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.7, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.9, -s * 0.6, 0, -s);
      ctx.fill();
      ctx.restore();
    }

    // A paper square: its height follows the flip, so it seems to tumble.
    function drawConfetti(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.flip * 1.6));
      ctx.globalAlpha = 0.95 * Math.min(1, p.life * 3);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2);
      ctx.restore();
    }

    function drawDust(p, t) {
      const twinkle = 0.45 + 0.55 * Math.sin(t / 600 + p.sway);
      ctx.globalAlpha = twinkle * Math.min(1, p.life) * p.fadeOut;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
    }

    // A star twinkles faster; the brightest ones get a four-point sparkle.
    function drawStar(p, t) {
      const twinkle = 0.25 + 0.75 * Math.abs(Math.sin(t / 420 + p.sway));
      ctx.globalAlpha = twinkle * Math.min(1, p.life) * p.fadeOut;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.size > 1.5) {
        const s = p.size * 2.6;
        const k = p.size * 0.45;
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x + k, p.y - k);
        ctx.lineTo(p.x + s, p.y);
        ctx.lineTo(p.x + k, p.y + k);
        ctx.lineTo(p.x, p.y + s);
        ctx.lineTo(p.x - k, p.y + k);
        ctx.lineTo(p.x - s, p.y);
        ctx.lineTo(p.x - k, p.y - k);
        ctx.closePath();
      } else {
        ctx.arc(p.x, p.y, p.size, 0, TAU);
      }
      ctx.fill();
    }

    function drawFirefly(p, t) {
      const pulse = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t / 520 + p.sway * 2));
      const a = pulse * Math.min(1, p.life) * p.fadeOut;
      const R = p.size * 6;
      ctx.globalAlpha = a * 0.8;
      ctx.drawImage(sprites[p.ci], p.x - R, p.y - R, R * 2, R * 2);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#fffbe8";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.45, 0, TAU);
      ctx.fill();
    }

    // A small paper lantern with a flickering flame inside.
    function drawLantern(p, t) {
      const flicker = 0.85 + 0.15 * Math.sin(t / 110 + p.sway * 5);
      const a = Math.min(1, p.life * 0.8);
      const s = p.size;
      const R = s * 4.2;
      ctx.globalAlpha = a * 0.55 * flicker;
      ctx.drawImage(sprites[p.ci], p.x - R, p.y - R, R * 2, R * 2);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.sin(p.sway * 0.8) * 0.08);
      ctx.globalAlpha = a * 0.95;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(-s * 0.55, -s * 0.9);
      ctx.lineTo(s * 0.55, -s * 0.9);
      ctx.quadraticCurveTo(s * 0.85, 0, s * 0.5, s * 0.9);
      ctx.lineTo(-s * 0.5, s * 0.9);
      ctx.quadraticCurveTo(-s * 0.85, 0, -s * 0.55, -s * 0.9);
      ctx.fill();
      ctx.globalAlpha = a * flicker;
      ctx.fillStyle = "#fff4d6";
      ctx.beginPath();
      ctx.ellipse(0, s * 0.35, s * 0.22, s * 0.36, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    function frame(t) {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.clearRect(0, 0, w, h);
      if (items.length < Math.round(max() * target) && Math.random() < cfg.rate) spawn();
      for (let i = items.length - 1; i >= 0; i--) {
        const p = items[i];
        p.life += dt;
        p.sway += dt * 1.4;
        p.flip += dt * 2.2;
        p.rot += p.spin * dt;
        if (falling) {
          p.x += (p.vx + Math.sin(p.sway) * 14) * dt;
          p.y += p.vy * dt;
          if (confetti) p.vx -= p.vx * dt * 1.2; // air brakes the burst
          if (p.vy < 22) p.vy += (confetti ? 120 : 30) * dt; // burst pieces settle into a fall
          if (p.y > h + 30 || p.x > w + 40 || p.x < -40) { items.splice(i, 1); continue; }
          if (confetti) drawConfetti(p);
          else drawPetal(p);
          continue;
        }
        if (mode === "lanterns") {
          // Released lanterns ease into a slow, steady climb.
          p.vx += -p.vx * dt * 0.6;
          p.vy += (-18 - p.vy) * dt * 0.5;
          p.x += (p.vx + Math.sin(p.sway * 0.6) * 5) * dt;
          p.y += p.vy * dt;
          if (p.y < -60) { items.splice(i, 1); continue; }
          drawLantern(p, t);
          continue;
        }
        if (mode === "fireflies") {
          p.vx += Math.cos(p.sway * 1.3 + p.flip) * 16 * dt - p.vx * dt * 0.5;
          p.vy += Math.sin(p.sway) * 12 * dt - p.vy * dt * 0.5;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        } else {
          p.x += (p.vx + Math.sin(p.sway) * 4) * dt;
          p.y += p.vy * dt;
        }
        p.fadeOut = Math.max(0, Math.min(1, (p.span - p.life) / 1.2));
        if (p.fadeOut <= 0) { items.splice(i, 1); continue; }
        if (mode === "fireflies") drawFirefly(p, t);
        else if (mode === "stars") drawStar(p, t);
        else drawDust(p, t);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      if (document.hidden) cancelAnimationFrame(raf);
      else { last = performance.now(); raf = requestAnimationFrame(frame); }
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return {
      level(v) { target = v; },
      // A gentle shower from the centre of the stage when the couple meet
      // (for lanterns: a handful released together from behind them).
      burst() {
        const lanterns = mode === "lanterns";
        for (let i = 0; i < cfg.burst; i++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * (lanterns ? 1.2 : 2.2);
          const speed = confetti ? 140 + Math.random() * 220
            : petals ? 60 + Math.random() * 70
            : lanterns ? 25 + Math.random() * 25
            : mode === "fireflies" ? 30 + Math.random() * 40
            : 20 + Math.random() * 40;
          const spread = lanterns ? 160 : 60;
          spawn(w / 2 + (Math.random() - 0.5) * spread, h * (lanterns ? 0.62 : 0.45), Math.cos(a) * speed, Math.sin(a) * speed);
        }
      },
      stop() {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVisibility);
      },
    };
  }
})();
