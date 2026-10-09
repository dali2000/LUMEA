// Dates are written in the invitation's language. Node ships full ICU, so
// Intl handles French, English and Tunisian Arabic (Maghreb month names,
// Latin digits) the same way the browser does.
const LOCALES = { fr: "fr-FR", en: "en-GB", ar: "ar-TN" };
const localeOf = (lang) => LOCALES[lang] || LOCALES.fr;

const DateTime = {
  fromISO(iso, opts = {}) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(localeOf(opts.lang), {
      day: "numeric",
      month: opts.short ? "short" : "long",
      year: "numeric",
    }).format(d);
  },
  time(iso, lang) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(localeOf(lang), { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  },
};

module.exports = { DateTime, localeOf };
