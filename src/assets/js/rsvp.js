// LUMÉA — RSVP. With "rsvpEndpoint" set in site.json, every reply is sent
// to a Google Sheet (tools/rsvp-google-sheet.gs: one tab per invitation,
// downloadable as Excel). Without it, or if sending fails, the reply opens
// WhatsApp / an email to the hosts as before.
(() => {
  const form = document.querySelector("[data-rsvp-form]");
  if (!form) return;
  const confirmation = document.querySelector("[data-rsvp-confirmation]");
  const whatsapp = form.getAttribute("data-whatsapp");
  const email = form.getAttribute("data-email");
  const endpoint = form.getAttribute("data-endpoint");
  const submit = form.querySelector("[type=submit]");
  const error = form.querySelector("[data-rsvp-error]");
  let sending = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;
    const name = form.querySelector("[name=name]").value.trim();
    const attending = form.querySelector("input[name=attending]:checked");
    const guests = form.querySelector("[name=guests]").value;
    const message = form.querySelector("[name=message]")?.value.trim() || "";
    const yes = attending && attending.value === "yes";

    if (endpoint) {
      sending = true;
      submit.disabled = true;
      if (error) error.hidden = true;
      const body = new URLSearchParams({
        invitation: form.dataset.invitation || "",
        lang: document.documentElement.lang,
        page: window.location.origin + window.location.pathname,
        name,
        attending: yes ? "yes" : "no",
        guests,
        message,
        website: form.querySelector("[name=website]")?.value || "",
      });
      try {
        // Apps Script answers through a redirect without CORS headers: the
        // request goes through, the response just can't be read (no-cors).
        await fetch(endpoint, { method: "POST", mode: "no-cors", body });
        return celebrate(yes);
      } catch {
        sending = false;
        submit.disabled = false;
        if (error) error.hidden = false;
        if (!whatsapp && !email) return;
      }
    }

    const T = window.LUMEA_T || {};
    const line = (yes ? T.rsvpYes || "{name} sera présent(e) ({n} personne(s))." : T.rsvpNo || "{name} ne pourra pas venir.")
      .replace("{name}", name)
      .replace("{n}", guests);
    const text = [`RSVP — ${name}`, line, message ? `${T.message || "Message"} : ${message}` : ""]
      .filter(Boolean)
      .join("\n");

    if (whatsapp) {
      window.open(`${whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    } else if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent("RSVP — " + name)}&body=${encodeURIComponent(text)}`;
    }
    celebrate(yes);
  });

  function celebrate(yes) {
    const swap = () => {
      form.hidden = true;
      if (confirmation) confirmation.hidden = false;
      // A yes deserves a celebration, in the theme's colours (confetti.js).
      if (yes && window.lumeaConfetti) {
        window.lumeaConfetti({ origin: confirmation || form });
      }
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !form.animate) return swap();
    // The form folds away, then the confirmation draws its check mark in (motion.css).
    form.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-10px)" }], {
      duration: 350,
      easing: "ease-in",
      fill: "forwards",
    }).onfinish = swap;
  }
})();
