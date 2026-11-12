# Magic Learning Quest · L’Académie d’Astréa

Une PWA éducative en français pour les 8–10 ans : lire une horloge analogique et calculer de tête pour traverser un monde magique original, affronter le dragon d’ombre et délivrer la princesse Aélis. Les deux entraînements alimentent **une seule aventure**, sauvegardée sur l’appareil.

Application publiée sur GitHub Pages : **https://stevencayla.github.io/magic-learning-quest/**.

## Jouer

L’accueil ne comporte pas de navigation basse : la roue dentée en haut à droite ouvre les réglages et la personnalisation. Le grimoire reste accessible depuis l’aventure.

Depuis l’accueil, choisir **Horloge magique** ou **Maths magiques**. Utiliser les grandes touches du pavé ou les chiffres du clavier, puis **Lancer mon sort**. Pour l’horloge, toucher le champ heures ou minutes pour le modifier. Le champ minutes s’active automatiquement après une heure complète ; une heure à un chiffre comme 1 peut être saisie `01` ou en touchant ensuite le champ minutes. `C` efface le champ actif, `⌫` retire son dernier chiffre. `Tab` permet de parcourir les commandes et `Entrée` active le bouton sélectionné. `Échap` revient au menu.

Sur téléphone, les deux entraînements se jouent **en paysage**. En portrait, une invitation à tourner l’appareil suspend réellement l’épreuve ; le bouton de retour reste disponible. Safari/PWA sur iPhone ne garantissant pas le verrouillage logiciel de l’orientation, le jeu attend la rotation. Vérifier le verrouillage d’orientation du téléphone si nécessaire.

Chaque entrée dans un duel et chaque nouvelle étape commencent par **5 → 4 → 3 → 2 → 1 → COMBAT !**, avec chiffres lumineux, anneaux d’énergie et sons originaux. Les questions sont masquées et le chrono pédagogique ne démarre qu’après ces cinq secondes. Il n’y a pas de nouveau décompte entre les questions du même combat ni lors d’un réessai.

Une bonne réponse affiche immédiatement Bravo, XP et points : le mage arme sa baguette, charge sa pointe et lance un projectile à traînée lumineuse vers l’adversaire. L’impact, les éclats et le son réduisent son énergie, puis l’exercice suivant arrive automatiquement après la séquence de **1,8 seconde**. Une erreur ou une expiration conserve les XP, affiche la correction et un contresort doux ; **Recommencer** réessaie la même question sans refaire l’introduction. Le mode découverte désactive le chrono pédagogique et les bonus de rapidité, tout en conservant le décompte de présentation.

Le décompte, le chrono et la transition sont suspendus en portrait ou en arrière-plan. Quitter l’épreuve annule les effets et transitions. Les effets et sons sont entièrement originaux : l’inspiration arcade ne reprend aucun asset ni son de Sky Force Reloaded.

Dans **Aventure**, suivre les 20 étapes. Les coffres s’ouvrent automatiquement à leur arrivée, les objets apparaissent dans le **Grimoire**. Le combat final utilise les mêmes exercices : de 1 800 à 1 900 XP, chaque réussite dissipe l’ombre du dragon ; à 1 900 XP, la princesse est délivrée. Une scène de victoire montre Aélis délivrée. L’entraînement peut continuer ensuite avec le dragon de lumière.

## Stack et architecture

JavaScript ES modules, HTML sémantique, CSS responsive et Vite. Aucun framework d’interface ni service distant nécessaire au jeu. Illustration d’accueil originale au style arcade, SVG de l’académie et polices système : pas de dépendance à des images, polices ou ressources externes. Les icônes et le décor sont originaux, sans éléments de la licence Harry Potter.

```text
src/
  domain/
    exercises.js    # Générateurs injectables, validation stricte, paliers, chrono
    progression.js  # Score, XP, séries, étapes, récompenses et statistiques
    duel.js         # Rencontres, horloge de combat pure et personnalisation normalisée
    storage.js      # Sauvegarde versionnée, validation et restauration
  ui/battle/
    controller.js   # Phases, saisie, interruptions et déclenchement des effets
    view.js         # Composition de l’arène
    characters.js   # Mages, dragon et princesse en SVG originaux
    scenes.js       # 20 décors en lien avec les étapes
    battle.css      # Arène paysage, animation de baguette, vol et impact
  ui/customize.js   # Choix du personnage et aperçu
  ui/sound.js       # Carillons Web Audio originaux, utilisables hors connexion
  ui/clock.js       # Rendu SVG de l’horloge (position réelle des deux aiguilles)
  main.js           # Accueil, navigation, réglages, personnalisation et installation
  style.css         # Design translucide, responsive, focus et reduced motion
public/
  arcade-heroes.webp # Illustration originale de l’accueil arcade
  castle.svg        # Illustration originale de l’académie
  icon.svg
  icons/            # PNG 192/512, maskable et Apple Touch 180
  manifest.webmanifest
scripts/build-sw.js # Génère le service worker et son précache depuis le build
tests/
  domain.test.js    # Tests métier Node sans DOM
  duel.test.js      # Temps de combat, pauses, énergie, accessoires et anciens formats
  e2e/app.spec.js   # Parcours Playwright, responsive et PWA
.github/workflows/ci-pages.yml
```

La logique métier est pure et indépendante du DOM. Les générateurs acceptent une fonction aléatoire injectée ; les tests utilisent un générateur pseudo-aléatoire à graine et des valeurs extrêmes. La navigation reste sur le document racine, ce qui évite les erreurs de routage GitHub Pages.

## Installation et développement

Node.js **22.12+** (ou 24 LTS) et npm.

```sh
npm ci
npm run dev
```

Ouvrir `http://localhost:5173/magic-learning-quest/`.

```sh
npm run lint
npm test
npm run build
npx playwright install --with-deps chromium webkit
npm run test:e2e
# Ou tous les contrôles (une fois Chromium installé) :
npm run check
```

Pour utiliser un Chromium système local : `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. La CI installe Chromium et WebKit correspondant à la version verrouillée de Playwright. Les rapports, traces et captures sont dans `playwright-report/` et `test-results/` ; les échecs sont conservés en artefacts CI.

```sh
npm run build
npm run preview
```

Ouvrir `http://localhost:4173/magic-learning-quest/`. Tester la PWA sur ce build de production, car le service worker est généré au build. Les tests E2E démarrent automatiquement ce serveur.

## Progression pédagogique et récompenses

- **Heure** : heures pleines → demi-heures → quarts → pas de 5 minutes → toutes les minutes. Un palier toutes les 10 bonnes réponses d’horloge. L’heure est au format 1–12, sans ambiguïté matin/soir. La petite aiguille avance avec les minutes.
- **Maths faciles** : sommes jusqu’à 20, soustractions sans négatif, tables de 2, 5 et 10, multiplicateur 1–10.
- **Intermédiaire** : sommes et soustractions jusqu’à 100, tables de 2, 3, 4, 5, 6, 8 et 10.
- **Avancé** : sommes et soustractions jusqu’à 500, tables de 2 à 12, multiplicateur 1–12. Les trois niveaux conservent des soustractions sans résultat négatif.
- **Automatique** : les maths passent au niveau suivant après 20 puis 40 réussites en maths. Chaque activité a son compteur de maîtrise, indépendant des XP communs. Les réglages manuels permettent de reprendre les bases ou d’augmenter le défi.
- **Chrono** : horloge 40/35/30/25/20 secondes ; maths 30/24/18 secondes. Bonne réponse = 20 XP et 100 points. Dans la première moitié du temps = +5 XP et +50 points. Une série ajoute des points bonus tous les 3 succès, plafonnés à 100. Erreur ou expiration = 0 XP et série réinitialisée, sans perte de score ni trésors.
- **Aventure** : 100 XP par étape, niveau de mage +1 tous les 100 XP, 20 étapes et 13 récompenses. Les gardiens intermédiaires et le dragon sont traversés grâce aux exercices communs ; pas de mini-jeu non éducatif qui bloque la progression.


## Personnage et adversaires

Dans les réglages : nom, teint, couleur et forme des cheveux, expression/lunettes, tenue, chapeau et baguette. L’aperçu et le combattant utilisent le même SVG. Les choix sont sauvegardés dans `avatar` au format V1 ; les valeurs inconnues sont normalisées sans invalider toute la progression. Baguette Soleil : 400 XP ; tenue Aurore : 1 200 XP ; couronne : 1 900 XP.

Les 18 premières étapes ont chacune leur sorcier adverse, avec nom, silhouette/accessoire, visage, couleur et signature magique propres. La 19e est le dragon d’ombre ; la 20e est le château libéré, avec entraînement libre contre un dragon de lumière. Chacun des 20 décors possède un lieu distinct : village, forêt, pont, griffon, bibliothèque, jardin, potions, golem, lac, tour, nuages, phénix, étoiles, cristaux, crypte, trésor, vallée, remparts, antre et château. Les SVG sont intégrés au build, donc disponibles hors connexion.

L’énergie adverse est dérivée de `100 - (XP % 100)` : Horloge et Maths partagent exactement le même combat et une sauvegarde ancienne le restaure sans compteur supplémentaire. Une réussite fait 20 ou 25 dégâts, égaux aux XP attribués. Les statistiques d’apprentissage et les paliers restent indépendants du décor et des adversaires. Recharger reprend la progression et le personnage, avec un nouveau décompte et une nouvelle question ; la saisie inachevée n’est pas conservée.

## Sauvegarde et statistiques

`localStorage['astrea.save']`, format **version 1**. Écriture après chaque réponse et chaque réglage. Restauration validée au démarrage, récompenses recalculées depuis les XP. Si le format est corrompu/incompatible, une alerte apparaît et une nouvelle partie en mémoire est proposée. Si le stockage est bloqué ou plein, l’application signale que la sauvegarde n’a pas réussi. Éviter de fermer dans ce cas.

Les sons magiques sont synthétisés localement via Web Audio (carillon de victoire et son doux pour réessayer), sans téléchargement. Le son est activé depuis un geste utilisateur pour respecter les contraintes iPhone ; il se coupe dans l’exercice ou les réglages. La préférence est conservée, et les anciennes sauvegardes restent compatibles. Les bips du décompte, l’annonce de départ, la montée du sort et l’impact ont des timbres et hauteurs distincts. Les particules et mouvements sont désactivés avec `prefers-reduced-motion`. Le passage automatique est annulé en quittant l’exercice et suspendu en arrière-plan. Les coffres et changements d’étape restent annoncés après le passage au sort suivant.

La fonction `restore` centralise le point d’entrée des futures migrations de version. Les sauvegardes V1 antérieures à la personnalisation reçoivent un avatar par défaut sans perte de progression ; une version future inconnue n’est pas interprétée silencieusement.

Statistiques cumulées par activité et par compétence : réussites, erreurs et temps total. Pour l’horloge, clés `minute:35`, `minute:40`, etc. Pour les maths, opération et palier. Historique limité aux 500 dernières réponses avec temps, difficulté, expiration et date. Ces structures permettront une future vue parent et une adaptation plus fine. Les réglages affichent déjà les minutes les plus souvent manquées et les temps moyens.

Les données restent exclusivement dans ce navigateur, sans compte ni télémétrie. La synchronisation entre appareils et l’import de fichier ne sont pas inclus en V1. Un bouton permet d’exporter la sauvegarde JSON. Effacer les données du navigateur supprime la progression. Le mode privé peut ne pas la conserver.

## PWA et fonctionnement hors connexion

Le manifest définit `standalone`, l’identifiant, le périmètre et l’URL de départ sous **`/magic-learning-quest/`**, avec les couleurs, icônes PNG, icône maskable et métadonnées iOS. Vite utilise le même préfixe pour tous les assets.

Le build calcule un hash du contenu et génère `dist/sw.js` : cache `astrea-<hash>` contenant tout le build et la page racine. L’installation du worker n’aboutit que si **tous** les fichiers sont précachés. Après une première ouverture en ligne et l’activation du worker, les deux activités, les images, les réglages et les sauvegardes fonctionnent sans réseau, y compris après rechargement. Aucun fetch externe n’est nécessaire au jeu.

Navigation : réseau avec repli sur la page précachée ; assets : cache puis réseau. Les fichiers statiques précachés sont servis en ignorant `Vary` pour ne pas dépendre d’en-têtes CORS différents entre précache et chargement de modules. À l’activation d’une nouvelle version, seuls les anciens caches `astrea-` sont supprimés. Une mise à jour attend la fermeture des anciens onglets pour éviter de mélanger deux versions pendant une partie. Reconnecter puis fermer/réouvrir l’application pour appliquer une version en attente. Le service worker nécessite HTTPS (ou localhost).

Installation : Android/Chrome/Edge via le bouton d’installation ou le menu du navigateur ; iOS/iPadOS via **Safari → Partager → Sur l’écran d’accueil**. L’invite native est utilisée quand disponible, sinon les instructions s’affichent. La disponibilité exacte de l’installation dépend du navigateur. L’indicateur réseau est indicatif : `navigator.onLine` ne garantit pas un accès Internet.

## Accessibilité et responsive

Accueil sans footer avec bouton de réglages en haut à droite ; navigation basse sur les pages secondaires mobiles. L’arène utilise les côtés pour les personnages, avec l’horloge ou le calcul et un pavé de quatre colonnes au centre. Tests paysage 568×320, 844×390, 1024×768, 1280×800 et 1920×1080, et tests portrait 320×568 / 390×844 avec rotation pendant l’épreuve. Les contrôles d’exercice ont une cible d’au moins 44×44 px. HTML sémantique, labels des champs, focus visible, retour de résultat annoncé en live, raccourci de contenu et prise en charge de `prefers-reduced-motion`.

L’horloge ne révèle volontairement pas sa réponse dans son libellé accessible ; cet exercice repose sur la vision. Le calcul mental est utilisable au clavier et dispose d’un énoncé accessible. Les parcours sont exécutés sur Chromium et WebKit (moteur Safari). Les tests automatisés ne remplacent pas un essai sur un iPhone/iPad physique ni un audit d’accessibilité complet.

## CI et GitHub Pages

**Quality & Pages** s’exécute sur les PR vers `main`, les push `main`/`feat/**`/`fix/**` et manuellement : `npm ci` → lint → tests métier → build → Playwright (parcours, tailles et offline). Aucun déploiement si un contrôle requis échoue. Sur `main` seulement, le même build validé est envoyé à Pages puis déployé avec OIDC, permissions `pages:write` et `id-token:write` limitées au job de déploiement.

Activation par le propriétaire si l’intégration n’a pas les droits Pages :

1. Dans **Settings → Pages → Build and deployment → Source**, choisir **GitHub Actions**.
2. Autoriser GitHub Actions pour le dépôt et les actions officielles utilisées, si nécessaire.
3. Fusionner la PR dans `main`, ou relancer **Quality & Pages** sur `main` après activation.
4. Si l’environnement `github-pages` demande une validation, approuver le déploiement.
5. Ouvrir **https://stevencayla.github.io/magic-learning-quest/**, puis vérifier un rechargement en mode avion après la première ouverture.

Le dépôt est désormais public. Pour un déploiement futur dans un dépôt privé : selon le forfait GitHub du propriétaire, Pages peut nécessiter un forfait payant compatible. Si GitHub le signale, activer un forfait compatible ou décider explicitement de rendre le dépôt public. Aucun changement de visibilité n’est effectué automatiquement.

Les changements de source doivent être relus dans la PR ; le workflow déploie après fusion sur `main`. Pour revenir à une version précédente, rétablir son code par commit sur `main` et laisser tous les contrôles s’exécuter.
