/**
 * LUMÉA — enregistrement des réponses RSVP dans un Google Sheet.
 *
 * Chaque invitation a son propre onglet (nommé d'après son slug, ex.
 * "lina-30-ans"), créé automatiquement à la première réponse. Le fichier se
 * télécharge en Excel : Fichier → Télécharger → Microsoft Excel (.xlsx).
 *
 * Installation (une seule fois) : voir README, section « RSVP → Excel ».
 *   1. Créez un Google Sheet vide, puis Extensions → Apps Script.
 *   2. Collez ce fichier, enregistrez.
 *   3. Déployer → Nouveau déploiement → Application Web
 *      (Exécuter en tant que : Moi · Accès : Tout le monde).
 *   4. Copiez l'URL /exec dans src/_data/site.json → "rsvpEndpoint".
 */

var HEADERS = ["Date de réponse", "Nom", "Présence", "Personnes", "Message", "Langue", "Lien de l'invitation"];

// Clé secrète pour récupérer les réponses en JSON (npm run rsvp). Remplacez-la
// par un mot de passe à vous, et mettez le même dans rsvp.config.json.
var READ_KEY = "CHANGEZ-MOI";

function doPost(e) {
  var p = (e && e.parameter) || {};
  // Champ piège invisible : rempli uniquement par les robots.
  if (p.website) return json({ ok: true });

  var slug = clean(p.invitation, 60).replace(/[^a-z0-9-]/gi, "") || "sans-nom";
  var name = clean(p.name, 80);
  if (!name) return json({ ok: false, error: "name" });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = book.getSheetByName(slug);
    if (!sheet) {
      sheet = book.insertSheet(slug);
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#efe7db");
      sheet.setFrozenRows(1);
    }
    var yes = p.attending === "yes";
    sheet.appendRow([
      new Date(),
      name,
      yes ? "Oui" : "Non",
      yes ? Math.max(1, Math.min(50, parseInt(p.guests, 10) || 1)) : 0,
      clean(p.message, 1000),
      clean(p.lang, 5),
      clean(p.page, 300),
    ]);
  } finally {
    lock.releaseLock();
  }
  return json({ ok: true });
}

// Sans clé : simple vérification du déploiement (ouvrir l'URL /exec).
// Avec ?key=READ_KEY : toutes les réponses en JSON, une liste par invitation
// (c'est ce que lit tools/rsvp-download.js).
function doGet(e) {
  var key = e && e.parameter && e.parameter.key;
  if (!key || READ_KEY === "CHANGEZ-MOI" || key !== READ_KEY) {
    return json({ ok: true, service: "LUMÉA RSVP" });
  }
  var out = {};
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(function (sheet) {
    var rows = sheet.getDataRange().getValues();
    if (rows.length < 1 || rows[0][0] !== HEADERS[0]) return; // not an RSVP tab
    out[sheet.getName()] = rows.slice(1).map(function (r) {
      return {
        date: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
        nom: String(r[1]).replace(/^'/, ""),
        presence: r[2] === "Oui",
        personnes: Number(r[3]) || 0,
        message: String(r[4]).replace(/^'/, ""),
        langue: String(r[5]),
        lien: String(r[6]),
      };
    });
  });
  return json({ ok: true, invitations: out });
}

function clean(value, max) {
  // Un texte qui commence par = + - @ serait interprété comme une formule.
  var s = String(value || "").trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
