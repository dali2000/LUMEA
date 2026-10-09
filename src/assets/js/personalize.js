// LUMÉA — personal invitations. A link such as /invitations/x/?invite=Ahmed
// (or ?pour=Ahmed) writes the guest's name on the envelope ("Pour Ahmed"),
// greets them in the hero and pre-fills the RSVP. The name is only ever set
// with textContent and is reduced to letters, spaces and a little
// punctuation, so a crafted link cannot inject markup.
(() => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("invite") || params.get("pour") || "";
  const name = raw
    .replace(/[^\p{L}\p{M}\s'’.&-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  if (!name) return;

  const pretty = name.charAt(0).toLocaleUpperCase(document.documentElement.lang || "fr") + name.slice(1);
  document.querySelectorAll("[data-guest-name]").forEach((el) => {
    el.textContent = pretty;
  });
  document.querySelectorAll("[data-guest]").forEach((el) => {
    el.hidden = false;
  });

  const field = document.querySelector("[data-rsvp-form] [name=name]");
  if (field && !field.value) field.value = pretty;
})();
