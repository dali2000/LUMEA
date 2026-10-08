const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "data", "invitations");

module.exports = function () {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((file) => {
      const slug = file.replace(/\.json$/, "");
      const data = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
      return { slug, ...data };
    });
};
