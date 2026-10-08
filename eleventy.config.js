const { DateTime } = require("./src/_utils/datetime.js");

module.exports = function (eleventyConfig) {
  // Static passthrough
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });

  // Collections: one entry per JSON file in src/data/invitations and src/data/menus
  eleventyConfig.addCollection("invitations", function (collectionApi) {
    const data = require("./src/_data/invitations.js");
    return data();
  });

  eleventyConfig.addCollection("menus", function (collectionApi) {
    const data = require("./src/_data/menus.js");
    return data();
  });

  // Filters
  eleventyConfig.addFilter("formatDateLong", (iso) => DateTime.fromISO(iso));
  eleventyConfig.addFilter("formatDateShort", (iso) => DateTime.fromISO(iso, { short: true }));
  eleventyConfig.addFilter("isoToTime", (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  });
  eleventyConfig.addFilter("slug", (str) =>
    String(str)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
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
