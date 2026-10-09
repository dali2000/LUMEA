const { DateTime } = require("./src/_utils/datetime.js");

module.exports = function (eleventyConfig) {
  // Static passthrough
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  // Notes kept next to assets (e.g. photo credits) are not pages.
  eleventyConfig.ignores.add("src/assets/**/*.md");

  // Collections: one entry per JSON file in src/data/invitations and src/data/menus.
  // "invitations" holds one entry per invitation (its main language);
  // "invitationPages" adds one page per translation (/invitations/x/en/).
  eleventyConfig.addCollection("invitations", function (collectionApi) {
    const data = require("./src/_data/invitations.js");
    return data().filter((inv) => !inv.variantOf);
  });

  eleventyConfig.addCollection("invitationPages", function (collectionApi) {
    const data = require("./src/_data/invitations.js");
    return data();
  });

  eleventyConfig.addCollection("menus", function (collectionApi) {
    const data = require("./src/_data/menus.js");
    return data();
  });

  // Filters
  // Dates take the page's language as an optional argument (fr by default).
  eleventyConfig.addFilter("formatDateLong", (iso, lang) => DateTime.fromISO(iso, { lang }));
  eleventyConfig.addFilter("formatDateShort", (iso, lang) => DateTime.fromISO(iso, { short: true, lang }));
  eleventyConfig.addFilter("isoToTime", (iso, lang) => DateTime.time(iso, lang));
  // "Bonjour {name}" + { name: "Lina" } → "Bonjour Lina"
  eleventyConfig.addFilter("fill", (str, values = {}) =>
    String(str).replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] : m))
  );
  // {% set inv = collections.invitations | findBy("slug", "omar-lina") %}
  eleventyConfig.addFilter("findBy", (list, key, value) => (list || []).find((item) => item[key] === value));
  eleventyConfig.addFilter("where", (list, key, value) => (list || []).filter((item) => item[key] === value));
  eleventyConfig.addFilter("slug", (str) =>
    String(str)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );

  // Motion helpers: pre-split text at build time so animations never wait on
  // JS or cause a reflow. Each piece carries its index as --i / --w for CSS
  // staggering. Letters are aria-hidden — the parent element carries the
  // readable aria-label.
  const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // Letters are grouped per word (.ltr-word, no wrap inside) so multi-word
  // names still break between words; the index keeps counting across words.
  // Arabic letters join to their neighbours, so an Arabic word stays whole
  // (one .ltr for the word) instead of being cut into isolated letters.
  eleventyConfig.addFilter("splitLetters", (str, offset = 0) => {
    let i = offset;
    return String(str)
      .split(" ")
      .filter(Boolean)
      .map((word) => {
        if (/[؀-ۿ]/.test(word)) {
          const whole = `<span class="ltr-word"><span class="ltr" style="--i:${i++}" aria-hidden="true">${escapeHtml(word)}</span></span>`;
          i++;
          return whole;
        }
        const letters = Array.from(word)
          .map((ch) => `<span class="ltr" style="--i:${i++}" aria-hidden="true">${escapeHtml(ch)}</span>`)
          .join("");
        i++; // a beat between words
        return `<span class="ltr-word">${letters}</span>`;
      })
      .join(" ");
  });
  eleventyConfig.addFilter("splitWords", (str) =>
    String(str)
      .split(/\s+/)
      .filter(Boolean)
      .map((w, i) => `<span class="word" style="--w:${i}">${escapeHtml(w)}</span>`)
      .join(" ")
  );

  eleventyConfig.addGlobalData("year", () => new Date().getFullYear());

  eleventyConfig.setServerOptions({ port: 8080 });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    pathPrefix: "/",
  };
};
