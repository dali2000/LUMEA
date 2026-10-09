// LUMÉA — "Ajouter à mon agenda". One button opens a small menu: Google
// Agenda and Outlook open their own "new event" page, Apple / iPhone gets an
// .ics file (with a reminder the day before). The calendar icon turns into
// a check once the guest has picked one.
(() => {
  const root = document.querySelector("[data-addcal]");
  if (!root) return;
  const toggle = root.querySelector("[data-addcal-toggle]");
  const menu = root.querySelector("[data-addcal-menu]");
  const start = new Date(root.dataset.start); // no offset in the ISO string: local time
  if (!toggle || !menu || Number.isNaN(start.getTime())) return;
  const endRaw = root.dataset.end ? new Date(root.dataset.end) : null;
  const end = endRaw && !Number.isNaN(endRaw.getTime()) ? endRaw : new Date(start.getTime() + 5 * 3600 * 1000);
  const title = root.dataset.title || "Invitation";
  const place = root.dataset.location || "";
  const details = [root.dataset.details, window.location.origin + window.location.pathname].filter(Boolean).join("\n\n");

  const pad = (n) => String(n).padStart(2, "0");
  const stamp = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const isoLocal = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  const enc = encodeURIComponent;

  root.querySelector("[data-addcal-google]").href =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${enc(title)}&dates=${stamp(start)}/${stamp(end)}&ctz=Africa/Tunis` +
    `&location=${enc(place)}&details=${enc(details)}`;
  root.querySelector("[data-addcal-outlook]").href =
    "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent" +
    `&subject=${enc(title)}&startdt=${isoLocal(start)}&enddt=${isoLocal(end)}` +
    `&location=${enc(place)}&body=${enc(details)}`;

  const icsText = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  root.querySelector("[data-addcal-ics]").addEventListener("click", (e) => {
    e.preventDefault();
    const now = new Date();
    const utc = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LUMEA//Invitation//FR",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${stamp(start)}-${Math.random().toString(36).slice(2)}@lumea.tn`,
      `DTSTAMP:${utc}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${icsText(title)}`,
      `LOCATION:${icsText(place)}`,
      `DESCRIPTION:${icsText(details)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsText(title)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "invitation.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    done();
  });
  root.querySelectorAll("[data-addcal-google], [data-addcal-outlook]").forEach((a) => a.addEventListener("click", done));

  function done() {
    root.classList.add("is-added");
    close();
  }
  function open() {
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => root.classList.add("is-open"));
  }
  function close() {
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  }
  toggle.addEventListener("click", () => (menu.hidden ? open() : close()));
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !root.contains(e.target)) close();
  });
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      close();
      toggle.focus();
    }
  });
})();
