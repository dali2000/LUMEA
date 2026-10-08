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

1. Dupliquez `src/data/invitations/amine-latifa.json`.
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
