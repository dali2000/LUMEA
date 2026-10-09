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
   `modern-wedding`, `floral`, `celestial-night`, `henna-night`,
   `andalusian-riad`, `boho-countryside`, `birthday-party`. Chaque thème est un simple fichier CSS dans
   `src/assets/css/themes/` qui redéfinit les variables de couleur (et,
   pour Modern Wedding, quelques réglages de mise en page) — le layout
   HTML (`src/_includes/layouts/invitation.njk`) reste le même pour tous.
   Pour créer un nouveau thème : dupliquez un fichier CSS de thème, ajustez les
   variables `--bg`/`--text`/`--accent`/etc. **et ses variables de
   mouvement `--m-*`** (voir « Animation » ci-dessous), donnez-lui un nom de
   classe `.theme-<slug>`, et utilisez ce `<slug>` comme valeur de `theme`.
4. `npm run build` — aucune autre modification de code n'est nécessaire.

### Animation : une expérience, pas une page statique

L'animation est au cœur du produit : chaque invitation LUMÉA est une
expérience animée. Tout nouveau thème doit en faire partie.

- **Ouverture : un mini film interactif.** L'invité arrive sur une enveloppe
  (qui s'incline au toucher, sceau qui respire, ruban satiné). Au toucher :
  le sceau se brise, le ruban se dénoue, le rabat s'ouvre en 3D, la carte
  sort et s'écrit d'elle-même (noms, date, lieu), puis deux silhouettes
  avancent l'une vers l'autre, la scène fleurit, deux anneaux se dessinent
  et l'anneau s'ouvre comme un portail sur l'invitation. Environ 11 s,
  avec un bouton « Passer l'introduction ». Le toucher sur l'enveloppe est
  aussi le geste qui autorise la musique.
- **Signature narrative par thème** (décor, palette, particules) :
  - `floral` → **Romantic Garden** : branches fleuries, pétales, arche de fleurs, lumière ;
  - `oriental-luxury` → **Royal Wedding** : sceau de cire, ruban doré, dorures, palais, poussière d'or ;
  - `modern-wedding` → **Modern Luxury** : enveloppe noire, faisceau de lumière, deux lumières qui se rejoignent ;
  - `tunisian-heritage` → **Mediterranean** : soleil levant, mer, bougainvilliers, porte tunisienne ;
  - `minimal-wedding` → **Minimal** : enveloppe ivoire, arche fine, feuillage ;
  - `celestial-night` → **Nuit étoilée** : ciel qui scintille, lune qui se lève, deux constellations reliées par une étoile, étoile filante ;
  - `henna-night` → **Soirée du henné** : lanternes qui s'allument, motifs de henné, mandala, lanternes célestes qui s'envolent ;
  - `andalusian-riad` → **Riad andalou** : zellige posé carreau par carreau, jets d'eau, arc outrepassé, fleurs d'oranger ;
  - `boho-countryside` → **Bohème champêtre** : enveloppe kraft et ficelle, soleil de l'heure dorée, pampas qui ondulent, guirlande qui s'allume, lucioles.

  Particules disponibles (`data-particles`) : `petals`, `dust`, `stars`,
  `fireflies`, `lanterns`.

  Une invitation peut choisir une autre narration que celle de son thème et
  personnaliser les phrases du film dans son JSON :

  ```json
  "story": "royal",
  "storyLines": ["Deux âmes, une promesse…", "…scellée dans l'or.", "Pour toujours."]
  ```
- **Après l'ouverture** : entrée du hero, apparition des sections au scroll
  (avec décalage entre éléments), tracé de la ligne du programme, compte à
  rebours qui monte puis s'anime chaque seconde, citation mot par mot,
  photos révélées avec parallaxe dans leur cadre, lightbox avec navigation
  (flèches, clavier, swipe), micro-interactions des boutons.
- **Architecture** : le film d'ouverture est dans `src/assets/css/story.css`,
  `src/assets/js/story.js` (chef d'orchestre des scènes + particules) et
  `src/_includes/partials/story-scenery.njk` (décors SVG). Les variantes de
  scènes sont dans `story-openings.njk`, `story-meetings.njk` et
  `story-finales.njk` (même dossier) avec leurs styles dans
  `src/assets/css/story-variants.css` ; les animations de page
  (calendrier, agenda, itinéraire) dans `src/assets/css/features.css`. Les animations de
  la page sont dans `src/assets/css/motion.css` et `src/assets/js/motion.js`. Chaque thème lui donne sa personnalité en
  redéfinissant les variables `--m-*` dans son fichier CSS (durées,
  distance, entrée des lettres, sortie de l'écran d'ouverture, parallaxe,
  révélation des photos), plus quelques effets propres :
  - `minimal-wedding` — fondus lents, les prénoms se resserrent comme une composition typographique ;
  - `oriental-luxury` — entrée cinématique : lettres qui sortent du flou, halo doré, zoom de sortie ;
  - `tunisian-heritage` — étoile de zellige qui se dessine, motif et frise qui se déploient ;
  - `modern-wedding` — lettres masquées, rideau noir qui se lève, photos en balayage + parallaxe ;
  - `floral` — tout arrive en douceur, branches qui se dessinent puis ondulent ;
  - `celestial-night` — lettres qui apparaissent comme des étoiles, ciel qui respire, lune ;
  - `henna-night` — lettres tracées comme au pinceau de henné, mandala qui tourne lentement ;
  - `andalusian-riad` — lettres qui se posent comme des carreaux, arc et frise de zellige, photos qui s'ouvrent comme des portes ;
  - `boho-countryside` — tout est lent et chaud, pampas qui ondulent dans le hero.
- **Performance et accessibilité** : uniquement `transform`/`opacity` (et
  quelques tracés SVG), JS vanilla léger, texte découpé au build (filtres
  `splitLetters`/`splitWords`). `prefers-reduced-motion` remplace le film par une
  version calme (enveloppe → carte → bouton, sans mouvement ni particules) ;
  sans JavaScript, tout le contenu reste visible.

### Options interactives (dans le JSON de l'invitation)

| Champ | Effet |
| --- | --- |
| `"opening"` | L'objet que l'invité touche pour ouvrir : `envelope` (défaut), `ringbox` (écrin : le couvercle s'ouvre, la bague brille), `door` (porte bleue de Sidi Bou Saïd qui s'ouvre sur la lumière), `scroll` (parchemin scellé qui se déroule), `book` (livre « Notre histoire » dont les pages tournent), `gift` (boîte cadeau : le nœud se défait, le couvercle saute). |
| `"meeting"` | La scène de rencontre : `couple` (défaut, les deux silhouettes qui marchent l'une vers l'autre), `doves` (deux colombes se rejoignent, un cœur se dessine), `dance` (première danse sous un projecteur), `hands` (deux mains, l'alliance glisse au doigt), `polaroid` (une photo tombe et se développe — chemin de l'image dans `"photo"`, sinon les initiales). |
| `"finale"` | La dernière image avant l'ouverture : `rings` (défaut, deux anneaux), `monogram` (initiales écrites à la plume dans une couronne), `heart` (cœur d'un seul trait qui bat), `fireworks` (feu d'artifice doré), `date` (la date se compose chiffre par chiffre, comme un tableau d'affichage). |
| `"scratch": true` | Carte à gratter : la date est cachée sous une feuille aux couleurs du thème, à gratter du doigt. Le compte à rebours reste flou jusqu'à la révélation, puis des confettis tombent. Un lien « Révéler sans gratter » reste disponible. |
| `"eventType": "Fiançailles"` | Libellé de l'événement (hero et vitrine de la page d'accueil). Par défaut : « Mariage ». |
| `"kicker": "Ils ont dit oui"` | Petite ligne en haut de la carte du film (par défaut « Ensemble avec leurs familles »). |

**Nom de l'invité** : ajoutez `?invite=Prénom` (ou `?pour=Prénom`) au lien,
par exemple `/invitations/adam-yasmine/?invite=Ahmed`. L'enveloppe affiche
« Pour Ahmed », le hero l'accueille par son prénom et le RSVP est
pré-rempli. Il suffit de générer un lien par invité, sans autre
modification.

**Animations de la page** (actives par défaut sur toutes les invitations) :

- **Itinéraire tracé** : une petite carte où le chemin se dessine de « Vous »
  jusqu'au lieu, puis le repère tombe et pulse ; boutons Itinéraire (Google
  Maps) et Waze. Désactivable avec `"route": false`.
- **Calendrier animé** : sous le compte à rebours, le calendrier s'effeuille
  mois par mois jusqu'au jour J, entouré à la main d'un cercle avec un petit
  cœur. Désactivable avec `"calendar": false`.
- **Ajouter à mon agenda** : Google Agenda, Apple / iPhone (fichier `.ics`
  avec rappel la veille) et Outlook. Durée 5 h par défaut, ou jusqu'à
  `"endDate"` si renseignée.
- **Paillettes au toucher** : chaque toucher sur la page fait jaillir quelques
  pétales / étoiles / confettis du thème. Désactivable avec `"sparkles": false`.

Avec `"scratch": true`, le calendrier et le bouton agenda restent flous ou
masqués jusqu'à ce que la date ait été grattée.

**Confettis au RSVP** : quand un invité confirme sa présence, des confettis
tombent aux couleurs du thème. Chaque thème choisit ses couleurs et sa forme
avec `--confetti-colors` et `--confetti-shape` (`paper`, `petals` ou
`stars`), et les couleurs de la carte à gratter avec `--scratch-1`,
`--scratch-2` et `--scratch-ink`.

Exemples : `adam-yasmine` (nuit étoilée + carte à gratter), `hedi-mariem`
(soirée du henné), `omar-lina` (riad andalou), `ayoub-salma` (bohème + carte
à gratter), `youssef-ines` (fiançailles avec écrin), `nizar-farah` (porte
tunisienne + colombes + date), `mehdi-sana` (livre + Polaroid + cœur),
`rami-olfa` (cadeau + première danse + feu d'artifice), `ilyes-meriem`
(parchemin + mains et alliance + monogramme).

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

### Langues : français, anglais, arabe

Une invitation est écrite dans sa langue principale (`"lang"`, `fr` par
défaut) et peut porter des `"translations"` qui ne remplacent que ce qui
change. Chaque traduction devient sa propre page :

```json
"translations": {
  "en": { "message": "…", "program": [{ "label": "Ceremony" }, …] },
  "ar": { "couple": { "name1": "يوسف", "name2": "إيناس" }, "message": "…" }
}
```

→ `/invitations/youssef-ines/en/` et `/invitations/youssef-ines/ar/`
(l'arabe s'affiche de droite à gauche, avec les polices Amiri et Tajawal).
Dans `program` et `gallery`, il suffit de lister les libellés dans le même
ordre : les heures et les photos sont reprises de la version principale.
Tous les textes de l'interface (boutons, film d'ouverture, RSVP…) sont dans
`src/_data/i18n.js`. Un sélecteur de langue apparaît en pied d'invitation.

### Anniversaire

À la place de `couple`, une invitation d'anniversaire a un seul prénom :
`"honoree": { "name": "Lina", "age": 30 }`, avec le thème `birthday-party`.
Le film d'ouverture a sa propre histoire : les bougies du gâteau s'allument
puis sont soufflées, les confettis éclatent, les ballons montent, et l'âge
s'écrit en or (`"meeting": "cake"`, `"finale": "age"` par défaut).
Exemple : `src/data/invitations/lina-30-ans.json`.

### Version statique (offerte)

Chaque invitation a aussi une carte fixe au format 9:16 sur
`/invitations/<slug>/carte/` (et `/en/carte/`, `/ar/carte/`), avec un QR code
vers l'invitation animée : téléchargement en PDF (impression 108 × 192 mm)
et partage WhatsApp. Lien « Version imprimable » en bas de l'invitation.

## Catalogue des modèles

`/modeles/` (et `/en/templates/`, `/ar/templates/`) présente les modèles
listés dans `src/_data/templates.json` : nom dans les trois langues,
occasion (`wedding`, `engagement`, `henna`, `birthday`), prix en DT et
invitation de démonstration (`demo` = slug). Chaque téléphone joue sa démo
en direct (`?preview` : l'enveloppe s'ouvre seule, la page défile puis
recommence) uniquement lorsqu'il est à l'écran. Le bouton « Commander »
ouvre WhatsApp (`site.whatsapp`) avec un message pré-rempli. Les prix suivent
deux niveaux, en achat unique : **39,999 DT** (Essentiel) et **45,999 DT**
(Premium) — à changer dans `templates.json` (`price`, texte libre) et dans
la section Pricing de `src/index.njk`.

## Identité visuelle

Les logos officiels (monogramme, wordmark, versions horizontale/empilée,
icônes d'app, badge QR, favicon) sont dans `src/assets/brand/` et publiés
sur `/assets/brand/…`. Sur le site, le monogramme et le wordmark sont
intégrés en SVG inline via `src/_includes/partials/logo.njk` (macros
`symbol()`, `wordmark()`, `mark()`) : les lettres prennent la couleur du
texte du thème et l'accent prend `--accent`. À l'ouverture d'une
invitation, le monogramme se construit trait par trait.

## Ajouter un menu digital

Même principe dans `src/data/menus/<slug>.json` → `/menus/<slug>/`.
Exemples : `restaurant-name.json` (menu texte classique), `dar-zitouna.json`
(cuisine tunisienne), `sel-et-mer.json` (fine dining, fond noir),
`cafe-jasmin.json` (coffee shop & brunch).

Thèmes de menu (`theme`) : `digital-menu`, `menu-heritage`, `menu-noir`,
`menu-cafe`. Tous les champs photo sont optionnels — sans photos, le menu
reste un menu texte élégant :

- `restaurant.cover` : photo plein écran de couverture (zoom lent + parallaxe) ;
  `restaurant.intro` : court texte d'accueil ;
- `categories[].subtitle` : titre affiché sous le nom de la catégorie ;
- `items[].image` : vignette du plat (cliquable, s'ouvre en grand) ;
  `items[].tags` : badges, ex. `["Signature", "Végétarien"]` ;
- `specialties` : liste de noms, ou d'objets `{ name, description, price, image }`
  pour des cartes avec photo ;
- `gallery` + `galleryTitle` : section « Ambiance » (photos du lieu).

Placez les photos dans `src/assets/images/menus/<slug>/` (JPEG ~1000 px de
large, ~100 Ko). Les photos des menus de démonstration sont dans le domaine
public (voir `src/assets/images/menus/CREDITS.md`) : remplacez-les par les
vraies photos du restaurant.

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
