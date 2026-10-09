(() => {
  const form = document.querySelector("[data-rsvp-form]");
  if (!form) return;
  const confirmation = document.querySelector("[data-rsvp-confirmation]");
  const whatsapp = form.getAttribute("data-whatsapp");
  const email = form.getAttribute("data-email");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("[name=name]").value.trim();
    const attending = form.querySelector("input[name=attending]:checked");
    const guests = form.querySelector("[name=guests]").value;
    const message = form.querySelector("[name=message]")?.value.trim() || "";

    const T = window.LUMEA_T || {};
    const yes = attending && attending.value === "yes";
    const line = (yes ? T.rsvpYes || "{name} sera présent(e) ({n} personne(s))." : T.rsvpNo || "{name} ne pourra pas venir.")
      .replace("{name}", name)
      .replace("{n}", guests);
    const text = [
      `RSVP — ${name}`,
      line,
      message ? `${T.message || "Message"} : ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (whatsapp) {
      window.open(`${whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    } else if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent("RSVP — " + name)}&body=${encodeURIComponent(text)}`;
    }

    const swap = () => {
      form.hidden = true;
      if (confirmation) confirmation.hidden = false;
      // A yes deserves a celebration, in the theme's colours (confetti.js).
      if (attending && attending.value === "yes" && window.lumeaConfetti) {
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
  });
})();
