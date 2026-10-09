const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "data", "invitations");

// An invitation is written in its main language ("lang", French by
// default) and can carry "translations": { en: {...}, ar: {...} } that
// override only what changes. Each translation becomes its own page at
// /invitations/<slug>/<lang>/. Arrays of objects (programme, gallery) are
// merged item by item, so a translation only lists the labels.
function merge(base, over) {
  if (Array.isArray(base) && Array.isArray(over)) {
    return over.map((item, i) =>
      item && typeof item === "object" && base[i] && typeof base[i] === "object" ? merge(base[i], item) : item
    );
  }
  if (base && over && typeof base === "object" && typeof over === "object" && !Array.isArray(over)) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = k in base ? merge(base[k], over[k]) : over[k];
    return out;
  }
  return over === undefined ? base : over;
}

module.exports = function () {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .flatMap((file) => {
      const slug = file.replace(/\.json$/, "");
      const { translations = {}, ...data } = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
      const lang = data.lang || "fr";
      const basePath = `/invitations/${slug}/`;
      const langs = [lang, ...Object.keys(translations).filter((l) => l !== lang)];
      const pathFor = (l) => (l === lang ? basePath : `${basePath}${l}/`);
      const links = langs.map((l) => ({ lang: l, path: pathFor(l) }));
      const main = { slug, ...data, lang, langs: links, path: basePath };
      const variants = Object.entries(translations)
        .filter(([l]) => l !== lang)
        .map(([l, over]) => ({ ...merge(main, over), lang: l, path: pathFor(l), variantOf: slug }));
      return [main, ...variants];
    });
};
