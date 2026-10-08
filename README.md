# LUMÉA — Digital Invitations & Menus

Site statique (Eleventy) pour LUMÉA : landing page, invitations digitales et
menus digitaux, générés à partir de simples fichiers JSON.

## Stack

- [Eleventy (11ty)](https://www.11ty.dev/) — générateur de site statique
- HTML/CSS/JS vanilla, sans framework ni dépendance de build superflue
- Déploiement gratuit sur GitHub Pages via GitHub Actions

## Démarrer en local

```bash
npm install
npm start        # http://localhost:8080, rebuild automatique
npm run build    # build de production dans ./_site
```

## Ajouter une invitation

1. Dupliquez `src/data/invitations/dali-latifa.json`.
2. Renommez le fichier avec le slug souhaité, ex. `mohamed-sarah.json`
   → la page sera générée sur `/invitations/mohamed-sarah/`.
3. Remplissez les champs (`couple`, `date`, `location`, `program`, `gallery`,
   `quote`, `rsvp`). Le champ `theme` choisit le thème visuel parmi :
   `minimal-wedding`, `oriental-luxury`, `tunisian-heritage`,
   `modern-wedding`, `floral`. Chaque thème est un simple fichier CSS dans
   `src/assets/css/themes/` qui redéfinit les variables de couleur (et,
   pour Modern Wedding, quelques réglages de mise en page) — le layout
   HTML (`src/_includes/layouts/invitation.njk`) reste le même pour tous.
   Pour créer un 7e thème : dupliquez un fichier CSS de thème, ajustez les
   variables `--bg`/`--text`/`--accent`/etc., donnez-lui un nom de classe
   `.theme-<slug>`, et utilisez ce `<slug>` comme valeur de `theme`.
4. `npm run build` — aucune autre modification de code n'est nécessaire.

### Animation d'ouverture et musique

Chaque invitation s'ouvre sur un écran "Ouvrir l'invitation" (logo + prénoms
du couple) avant de révéler le contenu — c'est ce même geste qui autorise le
navigateur à démarrer l'audio avec le son (les navigateurs bloquent la
lecture automatique sans interaction de l'utilisateur). Une fois ouvertes,
les sections apparaissent progressivement au scroll, avec un léger
décalage entre les éléments d'une même section.

Pour ajouter une musique de fond à une invitation, ajoutez dans son JSON :

```json
"music": { "src": "/assets/audio/votre-morceau.mp3" }
```

Placez le fichier dans `src/assets/audio/`. Un bouton rond flottant
(en bas à droite) permet ensuite à l'invité de couper/remettre le son à
tout moment. Sans ce champ `music`, l'invitation s'ouvre normalement, sans
audio ni bouton.

Un fichier `src/assets/audio/placeholder-ambiance.wav` est inclus à titre de
démonstration (un son d'ambiance généré, pas un morceau sous licence) —
**remplacez-le par un morceau que vous avez le droit d'utiliser** avant de
mettre en ligne, et préférez un `.mp3` ou `.ogg` compressé (beaucoup plus
léger qu'un `.wav`) pour le chargement mobile.

## Ajouter un menu digital

Même principe dans `src/data/menus/<slug>.json` → `/menus/<slug>/`.

## Déploiement sur GitHub Pages

1. Poussez ce repo sur GitHub (branche `main`).
2. Dans **Settings → Pages**, réglez *Source* sur **GitHub Actions**.
3. Le workflow `.github/workflows/deploy.yml` build et déploie automatiquement
   à chaque push sur `main` (ou déclenchement manuel).
4. Domaine personnalisé plus tard : ajoutez un fichier `src/CNAME` contenant
   le domaine, puis ajoutez `eleventyConfig.addPassthroughCopy({"src/CNAME": "CNAME"})`
   dans `eleventy.config.js`.

## Structure

Voir `eleventy.config.js` et `src/` — détail complet de l'architecture dans
le document de stratégie de marque LUMÉA (section Architecture technique /
Structure des fichiers).

## Prochaines étapes (hors MVP)

Dashboard client, création automatique d'invitations, comptes utilisateurs,
backend + base de données, upload photos, RSVP en base, paiement — voir la
feuille de route produit. Le MVP reste volontairement statique et sans
backend.
