// LUMÉA — npm run rsvp
// Downloads every RSVP reply from the Google Sheet (tools/rsvp-google-sheet.gs)
// and writes them as JSON lists on this computer:
//   rsvp/<invitation>.json        one list per invitation
//   rsvp/toutes-les-reponses.json everything
// Settings come from rsvp.config.json (not committed: it holds the key):
//   { "url": "https://script.google.com/macros/s/…/exec", "key": "votre-cle" }
// The rsvp/ folder is ignored by git: guests' names never reach GitHub.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "rsvp.config.json");
const OUT = path.join(ROOT, "rsvp");

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

(async () => {
  if (!fs.existsSync(CONFIG)) {
    fail(
      "rsvp.config.json introuvable. Créez-le à la racine du projet :\n" +
        '  { "url": "https://script.google.com/macros/s/…/exec", "key": "votre-cle" }'
    );
  }
  const { url, key } = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
  if (!url || !key) fail('rsvp.config.json doit contenir "url" et "key".');

  let data;
  try {
    const res = await fetch(`${url}?key=${encodeURIComponent(key)}`, { redirect: "follow" });
    data = await res.json();
  } catch (e) {
    fail(`Impossible de joindre le Google Sheet (${e.message}). Vérifiez l'URL et votre connexion.`);
  }
  if (!data || !data.invitations) {
    fail("Le Google Sheet a répondu sans les réponses : la clé ne correspond pas à READ_KEY dans le script.");
  }

  fs.mkdirSync(OUT, { recursive: true });
  const all = [];
  console.log("");
  for (const [slug, replies] of Object.entries(data.invitations)) {
    fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(replies, null, 2) + "\n");
    replies.forEach((r) => all.push({ invitation: slug, ...r }));
    const yes = replies.filter((r) => r.presence);
    const people = yes.reduce((n, r) => n + r.personnes, 0);
    console.log(`  ${slug.padEnd(24)} ${String(replies.length).padStart(3)} réponses · ${yes.length} oui · ${people} personnes`);
  }
  fs.writeFileSync(path.join(OUT, "toutes-les-reponses.json"), JSON.stringify(all, null, 2) + "\n");
  console.log(`\n✓ ${all.length} réponses enregistrées dans ${path.relative(process.cwd(), OUT) || "rsvp"}/\n`);
})();
