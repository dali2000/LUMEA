(() => {
  const el = document.querySelector("[data-countdown]");
  if (!el) return;
  const target = new Date(el.getAttribute("data-countdown")).getTime();

  const fields = {
    days: el.querySelector('[data-unit="days"]'),
    hours: el.querySelector('[data-unit="hours"]'),
    minutes: el.querySelector('[data-unit="minutes"]'),
    seconds: el.querySelector('[data-unit="seconds"]'),
  };

  function tick() {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (fields.days) fields.days.textContent = String(days).padStart(2, "0");
    if (fields.hours) fields.hours.textContent = String(hours).padStart(2, "0");
    if (fields.minutes) fields.minutes.textContent = String(minutes).padStart(2, "0");
    if (fields.seconds) fields.seconds.textContent = String(seconds).padStart(2, "0");
    if (diff <= 0) clearInterval(timer);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();
