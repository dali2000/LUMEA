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

    const status = attending && attending.value === "yes" ? "sera présent(e)" : "ne pourra pas venir";
    const text = [
      `RSVP — ${name}`,
      `${name} ${status}${attending && attending.value === "yes" ? ` (${guests} personne(s))` : ""}.`,
      message ? `Message : ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (whatsapp) {
      window.open(`${whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    } else if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent("RSVP — " + name)}&body=${encodeURIComponent(text)}`;
    }

    form.hidden = true;
    if (confirmation) confirmation.hidden = false;
  });
})();
