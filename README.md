# Magic Learning Quest · L’Académie d’Astréa

Une PWA éducative en français pour les 8–10 ans : lire une horloge analogique et calculer de tête pour traverser un monde magique original, affronter le dragon d’ombre et délivrer la princesse Aélis. Les deux entraînements proposent **deux aventures indépendantes**, chacune avec 20 niveaux et trois étoiles, sauvegardées sur l’appareil.

Application publiée sur GitHub Pages : **https://stevencayla.github.io/magic-learning-quest/**.

## Jouer

Le fond de l’accueil suit un dégradé continu de bleu clair vers le bleu foncé, avec une apparition progressive de l’illustration sans bande sous le titre. Sur téléphone, l’accueil tient dans la hauteur disponible, sans défilement, et se consulte uniquement en portrait. En paysage, une invitation demande de tourner le téléphone à la verticale. Il ne comporte pas de navigation basse : la roue dentée en haut à droite ouvre les réglages et la personnalisation. Le grimoire reste accessible depuis l’aventure.

À la toute première ouverture, l’accueil présente uniquement **Commencer** et le numéro de version. Le joueur choisit **Garçon** ou **Fille**, indique son nom (obligatoire, 18 caractères maximum), puis personnalise son apparence, sa tenue et sa baguette. Le décor de l’école, de la lune et des nuages est commun aux deux étapes de création. Sur téléphone, ces étapes se consultent en portrait ; une rotation conserve les choix. Les marges de l’encoche et le clavier logiciel sont pris en compte. Les choix sont visibles immédiatement et le même personnage apparaît ensuite dans les combats.

Le brouillon est sauvegardé à chaque choix : fermer ou recharger reprend l’étape en cours. **Commencer mon aventure** valide le personnage puis affiche Horloge, Maths et Mes aventures. L’initialisation ne réapparaît plus. Les réglages permettent ensuite de modifier le personnage et son nom. Les anciennes sauvegardes sans champ `onboarding` sont considérées comme déjà initialisées pour conserver le personnage et la progression existants. Réinitialiser les XP ne relance pas la création.

Depuis l’accueil, choisir **Horloge magique** ou **Maths magiques**. Utiliser les grandes touches du pavé ou les chiffres du clavier, puis **Lancer mon sort**. Pour l’horloge, toucher le champ heures ou minutes pour le modifier. Le champ minutes s’active automatiquement après une heure complète ; une heure à un chiffre comme 1 peut être saisie `01` ou en touchant ensuite le champ minutes. `C` efface le champ actif, `⌫` retire son dernier chiffre. `Tab` permet de parcourir les commandes et `Entrée` active le bouton sélectionné. `Échap` revient au menu.

Sur téléphone, les deux entraînements se jouent **en paysage**. En portrait, une invitation à tourner l’appareil suspend réellement l’épreuve ; le bouton de retour reste disponible. Safari/PWA sur iPhone ne garantissant pas le verrouillage logiciel de l’orientation, le jeu attend la rotation. Vérifier le verrouillage d’orientation du téléphone si nécessaire.

Chaque entrée dans un duel et chaque nouvelle étape commencent par **5 → 4 → 3 → 2 → 1 → COMBAT !**, avec chiffres lumineux, anneaux d’énergie et sons originaux. Les questions sont masquées et le chrono pédagogique ne démarre qu’après ces cinq secondes. Il n’y a pas de nouveau décompte entre les questions du même combat ni lors d’un réessai.

Une bonne réponse affiche immédiatement Bravo, XP et points : le mage arme sa baguette, charge sa pointe et lance un projectile à traînée lumineuse vers l’adversaire. L’impact, les éclats et le son réduisent son énergie, puis l’exercice suivant arrive automatiquement après la séquence de **1,8 seconde**. Une erreur ou une expiration conserve les XP, affiche immédiatement la correction puis anime la baguette, le projectile et l’impact du **sorcier adverse vers le joueur**, avec un son distinct ; après cette riposte de 1,8 seconde, **Recommencer** réessaie la même question sans refaire l’introduction. Le mode découverte désactive le chrono pédagogique et les bonus de rapidité, tout en conservant le décompte de présentation.

Chaque aventure possède sa propre **jauge de vie de 100 PV**, visible au-dessus du joueur. Une erreur ou une expiration coûte **25 PV**, retirés visuellement à l’impact du sort adverse. La vie reste diminuée entre deux questions et est sauvegardée, y compris à zéro. Une réussite dans le même niveau ne guérit pas ; vaincre l’adversaire et passer au niveau suivant redonne 100 PV.

À **0 PV**, le duel est perdu. Après la riposte complète, **Recommencer le niveau** rétablit la vie et l’adversaire, relance le décompte de cinq secondes et efface uniquement les XP et la maîtrise gagnés dans ce niveau non terminé. Les niveaux terminés, étoiles, trésors, points, statistiques et l’autre aventure sont conservés. Quitter ou recharger ne contourne pas cette défaite.

Le décompte, le chrono et la transition sont suspendus en portrait ou en arrière-plan. Quitter l’épreuve annule les effets et transitions. Les effets et sons sont entièrement originaux : l’inspiration arcade ne reprend aucun asset ni son de Sky Force Reloaded.

Dans **Mes aventures**, choisir Horloge ou Maths : XP, score, séries, coffres et position sont propres à l’aventure choisie. Il faut terminer les **20 niveaux (2 000 XP)** pour vaincre le dragon, délivrer Aélis et gagner une étoile. L’aventure repart alors au niveau 1 avec une difficulté accrue. Les étoiles se gagnent à **2 000, 4 000 et 6 000 XP**, séparément pour chaque activité. Après trois étoiles, l’entraînement peut continuer au dernier niveau sans quatrième étoile.

**Relire la leçon** est disponible dans l’aventure Horloge et via le bouton livre pendant un duel. Ce grimoire reprend les aiguilles, les graduations, les conversions matin/après-midi, midi/minuit et le déplacement continu de la petite aiguille. Une horloge manipulable et quatre exemples permettent de revoir les notions à son rythme. Ouvrir la leçon suspend le décompte, le chrono et l’animation ; la fermer reprend la même question.

## Stack et architecture

JavaScript ES modules, HTML sémantique, CSS responsive et Vite. Aucun framework d’interface ni service distant nécessaire au jeu. Illustration d’accueil originale au style arcade, SVG de l’académie et polices système : pas de dépendance à des images, polices ou ressources externes. Les icônes et le décor sont originaux, sans éléments de la licence Harry Potter.

```text
src/
  domain/
    exercises.js    # Générateurs injectables, validation stricte, paliers, chrono
    adventures.js   # Deux parcours, cycles de 20 niveaux, étoiles et remise à zéro
    progression.js  # Score, XP, séries, étapes, récompenses et statistiques
    duel.js         # Rencontres, horloge de combat pure et personnalisation normalisée
    onboarding.js   # Création, brouillon, validation finale et compatibilité
    storage.js      # Sauvegarde versionnée, validation et restauration
  ui/battle/
    controller.js   # Phases, saisie, interruptions et déclenchement des effets
    view.js         # Composition de l’arène
    characters.js   # Mages, dragon et princesse en SVG originaux
    scenes.js       # 20 décors en lien avec les étapes
    battle.css      # Arène paysage, animation de baguette, vol et impact
  ui/clock-lesson.js # Leçon illustrée et horloge manipulable
  ui/adventure-settings.js # Confirmation de remise à zéro ciblée
  ui/zoom-guard.js  # Gestes de zoom et raccourcis
  build/version.js # Version dérivée du tag de release, testable sans GitHub
  ui/onboarding.js # Choix, personnalisation et gestion du clavier mobile
  ui/onboarding.css # Décor commun, cartes et contrôles tactiles
  ui/player-mage.js # Personnage SVG commun à la création et au combat
  ui/version.js    # Numéro de version embarqué, disponible offline
  ui/customize.js   # Choix du personnage et aperçu
  ui/sound.js       # Carillons Web Audio originaux, utilisables hors connexion
  ui/clock.js       # Rendu SVG de l’horloge (position réelle des deux aiguilles)
  main.js           # Accueil, navigation, réglages, personnalisation et installation
  style.css         # Design translucide, responsive, focus et reduced motion
public/
  arcade-heroes.webp # Illustration originale de l’accueil arcade
  creation-sky.webp # École, lune et nuages des deux écrans de création
  castle.svg        # Illustration originale de l’académie
  icon.svg
  icons/            # PNG 192/512, maskable et Apple Touch 180
  manifest.webmanifest
scripts/build-sw.js # Génère le service worker et son précache depuis le build
scripts/check-release.js # Vérifie le tag, le commit et les métadonnées avant publication
tests/
  onboarding.test.js # Brouillon, profils existants, validation et versions
  health.test.js    # Vie, défaite, reprise de niveau et compatibilité
  domain.test.js    # Tests métier Node sans DOM
  adventures.test.js # Étoiles, indépendance, progression, migrations et remise à zéro
  duel.test.js      # Temps de combat, pauses, énergie, accessoires et anciens formats
  e2e/app.spec.js   # Parcours Playwright, responsive et PWA
  e2e/onboarding.spec.js # Première utilisation, reprise, clavier et offline
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

- **Horloge, dès la première étoile** : chaque question indique **Matin** ou **Après-midi**. La réponse doit respecter le format 24 h : 3 h 15 l’après-midi → `15:15` ; minuit → `00:00`, midi → `12:00`. La petite aiguille avance avec les minutes.
- **Étoile 1, Horloge automatique** : heures pleines → demi-heures → quarts → pas de 5 minutes, avec un palier toutes les 20 réussites du cycle. **Étoile 2** : pas de 5 minutes, puis toutes les minutes après 20 réussites. **Étoile 3** : toutes les minutes avec un chrono plus court.
- **Maths étoile 1** : additions jusqu’à 20, soustractions sans négatif, tables ×2/×5/×10 ; après 40 réussites, opérations jusqu’à 100 et davantage de tables. **Étoile 2** : plafond intermédiaire 150, tables supplémentaires, puis niveau avancé jusqu’à 750. **Étoile 3** : opérations jusqu’à 1 000 et tables de 2 à 12. Le multiplicateur maximal des tables avancées est 12.
- **Réglages** : le choix manuel peut augmenter le défi, tout en conservant le minimum correspondant à l’étoile. Revenir sur Facile à la troisième étoile ne remet donc pas les exercices au niveau débutant. Le mode découverte retire le chrono, mais la complexité augmente toujours à chaque étoile.
- **Chrono** : base horloge 40/35/30/25/20 secondes ; maths 30/24/18 secondes. Facteurs par étoile : 100 %, 80 %, 65 %, puis réduction de 1 % par niveau à l’intérieur du cycle ; minimum 8 secondes. Bonne réponse = 20 XP et 100 points. Dans la première moitié du temps = +5 XP et +50 points. Les séries propres à chaque aventure ajoutent des points, plafonnés à 100. Une erreur remet la série de cette aventure à zéro et coûte 25 PV. À zéro PV, il faut recommencer le niveau non terminé ; les points et trésors restent conservés.
- **Aventure** : 100 XP par niveau, 20 niveaux par étoile, trois étoiles par activité. Les réussites infligent 20 ou 25 dégâts, égaux aux XP attribués. Les objets d’un parcours restent acquis lorsqu’il recommence à l’étoile suivante.

## Personnage et adversaires

À la création puis dans les réglages : personnage garçon/fille, nom, teint, couleur et forme des cheveux, expression/lunettes, tenue, chapeau et baguette. L’aperçu et le combattant utilisent le même SVG. Les choix sont sauvegardés dans `avatar` au format V2 ; les valeurs inconnues sont normalisées sans invalider toute la progression. Baguette Soleil : 400 XP ; tenue Aurore : 1 200 XP ; couronne : 1 900 XP.

Les 18 premières étapes ont chacune leur sorcier adverse, avec nom, silhouette/accessoire, visage, couleur et signature magique propres. La 19e est le dragon d’ombre ; la 20e est la bataille finale contre le dragon du château pour délivrer Aélis. Chacun des 20 décors possède un lieu distinct : village, forêt, pont, griffon, bibliothèque, jardin, potions, golem, lac, tour, nuages, phénix, étoiles, cristaux, crypte, trésor, vallée, remparts, antre et château. Les SVG sont intégrés au build, donc disponibles hors connexion.

L’énergie adverse est dérivée de `100 - (XP % 100)` : elle est calculée depuis les XP de l’aventure en cours. Gagner des XP en Maths ne change ni l’énergie ni la position du parcours Horloge, et inversement. Une réussite fait 20 ou 25 dégâts, égaux aux XP attribués. Les statistiques d’apprentissage et les paliers restent indépendants du décor et des adversaires. Recharger reprend la progression et le personnage, avec un nouveau décompte et une nouvelle question ; la saisie inachevée n’est pas conservée.

## Sauvegarde et statistiques

`localStorage['astrea.save']`, format **version 2**, avec deux enregistrements `adventures.clock` et `adventures.math`. Les champs de combat `health`, `defeats` et `levelStartCorrect` sont persistés par aventure. Une ancienne sauvegarde V2 sans ces champs reçoit 100 PV sans modifier sa progression. Écriture après chaque réponse, reprise de niveau et réglage. Restauration validée au démarrage, récompenses recalculées depuis les XP. Si le format est corrompu/incompatible, une alerte apparaît et une nouvelle partie en mémoire est proposée. Si le stockage est bloqué ou plein, l’application signale que la sauvegarde n’a pas réussi. Éviter de fermer dans ce cas.

Les sons magiques sont synthétisés localement via Web Audio (carillon de victoire et son doux pour réessayer), sans téléchargement. Le son est activé depuis un geste utilisateur pour respecter les contraintes iPhone ; il se coupe dans l’exercice ou les réglages. La préférence est conservée, et les anciennes sauvegardes restent compatibles. Les bips du décompte, l’annonce de départ, la montée du sort et l’impact ont des timbres et hauteurs distincts. Les particules et mouvements sont désactivés avec `prefers-reduced-motion`. Le passage automatique est annulé en quittant l’exercice et suspendu en arrière-plan. Les coffres et changements d’étape restent annoncés après le passage au sort suivant.

La fonction `restore` migre automatiquement les anciennes sauvegardes V1. Une copie originale est conservée dans `astrea.save.v1.backup` avant l’enregistrement V2. Les anciens XP et points communs sont répartis au prorata des bonnes réponses enregistrées en Horloge et Maths, sans duplication ni perte du total. Sans aucune bonne réponse enregistrée, les anciens XP sont attribués à Horloge. L’historique V1 étant limité, cette répartition est une approximation explicite. Les anciens objets débloqués et le personnage restent disponibles. Une version future inconnue n’est pas interprétée silencieusement.

Dans les réglages, **Réinitialiser Horloge** ou **Réinitialiser Maths** ouvre une confirmation avant toute modification. Les XP, niveaux, étoiles, score, séries et coffres du parcours choisi repartent à zéro. L’autre parcours, le personnage, les accessoires déjà débloqués, les préférences et les statistiques/historique d’apprentissage sont conservés. L’export JSON permet de garder une copie avant de recommencer.

Statistiques cumulées par activité et par compétence : réussites, erreurs et temps total. Pour l’horloge, clés `minute:35`, `minute:40`, etc. Pour les maths, opération et palier. Historique limité aux 500 dernières réponses avec temps, difficulté, expiration et date. Ces structures permettront une future vue parent et une adaptation plus fine. Les réglages affichent déjà les minutes les plus souvent manquées et les temps moyens.

Les statistiques conservent aussi le numéro d’étoile pour les nouvelles réponses. Les données restent exclusivement dans ce navigateur, sans compte ni télémétrie. La synchronisation entre appareils et l’import de fichier ne sont pas inclus en V1. Un bouton permet d’exporter la sauvegarde JSON. Effacer les données du navigateur supprime la progression. Le mode privé peut ne pas la conserver.

## PWA et fonctionnement hors connexion

Le manifest définit `standalone`, l’identifiant, le périmètre et l’URL de départ sous **`/magic-learning-quest/`**, avec les couleurs, icônes PNG, icône maskable et métadonnées iOS. Vite utilise le même préfixe pour tous les assets.

Le build calcule un hash du contenu et génère `dist/sw.js` : cache `astrea-<hash>` contenant tout le build et la page racine. L’installation du worker n’aboutit que si **tous** les fichiers sont précachés. Après une première ouverture en ligne et l’activation du worker, les deux activités, les images, les réglages et les sauvegardes fonctionnent sans réseau, y compris après rechargement. Aucun fetch externe n’est nécessaire au jeu.

Navigation : réseau avec repli sur la page précachée ; assets : cache puis réseau. Les fichiers statiques précachés sont servis en ignorant `Vary` pour ne pas dépendre d’en-têtes CORS différents entre précache et chargement de modules. À l’activation d’une nouvelle version, seuls les anciens caches `astrea-` sont supprimés. Une mise à jour attend la fermeture des anciens onglets pour éviter de mélanger deux versions pendant une partie. Reconnecter puis fermer/réouvrir l’application pour appliquer une version en attente. Le service worker nécessite HTTPS (ou localhost).

Les nouvelles icônes PNG (192, 512, maskable et Apple Touch 180) reprennent le mage, la chouette et le dragon de l’accueil. Leurs noms ont changé pour éviter le cache des anciennes ressources, tandis que l’identifiant de la PWA reste identique. iOS peut conserver l’icône d’un raccourci déjà installé : une mise à jour des fichiers ne garantit pas le rafraîchissement de cette icône système. Conserver une sauvegarde avant toute réinstallation ; supprimer une PWA peut supprimer ses données locales.

Installation : Android/Chrome/Edge via le bouton d’installation ou le menu du navigateur ; iOS/iPadOS via **Safari → Partager → Sur l’écran d’accueil**. L’invite native est utilisée quand disponible, sinon les instructions s’affichent. La disponibilité exacte de l’installation dépend du navigateur. L’indicateur réseau est indicatif : `navigator.onLine` ne garantit pas un accès Internet.

## Accessibilité et responsive

Accueil sans navigation basse ; après création du personnage, le bouton de réglages apparaît en haut à droite. Navigation basse sur les pages secondaires mobiles. L’arène utilise les côtés pour les personnages, avec l’horloge ou le calcul et un pavé de quatre colonnes au centre. Tests paysage 568×320, 844×390, 1024×768, 1280×800 et 1920×1080, et tests portrait 320×568 / 390×844 avec rotation pendant l’épreuve. Le viewport et les gestionnaires de gestes bloquent le zoom dans l’application (pincement, double tap et raccourcis clavier). Le zoom d’accessibilité du système reste sous le contrôle de l’utilisateur et d’iOS. Les contrôles d’exercice ont une cible d’au moins 44×44 px. HTML sémantique, labels des champs, focus visible, retour de résultat annoncé en live, raccourci de contenu et prise en charge de `prefers-reduced-motion`.

L’horloge ne révèle volontairement pas sa réponse dans son libellé accessible ; cet exercice repose sur la vision. Le calcul mental est utilisable au clavier et dispose d’un énoncé accessible. Les parcours sont exécutés sur Chromium et WebKit (moteur Safari). Les tests automatisés ne remplacent pas un essai sur un iPhone/iPad physique ni un audit d’accessibilité complet.

## CI et GitHub Pages

**Quality & Pages** exécute `npm ci` → lint → tests métier → build → Playwright sur les PR, les push `main` / `feat/**` / `fix/**`, et les exécutions manuelles. Une fusion sur `main` valide le code, sans publier une version de développement sur le site public.

La publication d’une **release GitHub stable** portant un tag `vMAJEUR.MINEUR.CORRECTIF` (par exemple `v1.1.0`) déclenche automatiquement une exécution depuis `main`. Celle-ci construit le **commit exact du tag**, vérifie que la release est publiée et que ce commit appartient à l’historique de `main`, injecte le tag dans le build, vérifie que les métadonnées produites correspondent exactement au tag et au commit, puis rejoue tous les contrôles. Le même artefact validé est envoyé à Pages. Cette orchestration respecte la protection existante de l’environnement `github-pages`, limitée à `main`.

Le numéro affiché sur l’accueil et les écrans de création vient de `RELEASE_VERSION`, jamais d’une requête GitHub à l’ouverture. `version.json` contient aussi le commit et l’URL de la release ; il est précaché. Le numéro reste donc exact hors connexion. Sans tag injecté, les builds locaux et les prévisualisations affichent `v<package.version>-dev` et ne sont pas déployés automatiquement. Une future release peut utiliser un nouveau tag sans modifier une chaîne dans l’interface.

Pour publier :

1. Fusionner les changements dans `main` et vérifier la CI.
2. Créer une release GitHub stable avec un nouveau tag `vX.Y.Z`, ciblant ce commit de `main`, puis la publier.
3. Attendre **Schedule published release from main**, puis l’exécution **workflow_dispatch** qui teste le tag et déploie Pages.
4. Vérifier le numéro sur l’accueil et dans `/magic-learning-quest/version.json`.

Pour rejouer une publication existante : lancer **Quality & Pages** sur la branche **main**, en renseignant `release_tag` avec le tag d’une release stable déjà publiée. Sans ce champ, seuls les contrôles sont exécutés. Les préreleases ne mettent pas à jour le site public. Le job de programmation dispose de `actions:write` pour déclencher le workflow ; le job de déploiement possède seulement les droits Pages/OIDC nécessaires.

Activation par le propriétaire si l’intégration n’a pas les droits Pages :

1. Dans **Settings → Pages → Build and deployment → Source**, choisir **GitHub Actions**.
2. Autoriser GitHub Actions pour le dépôt et les actions officielles utilisées, si nécessaire.
3. Publier une release stable depuis `main`, ou relancer **Quality & Pages** sur `main` avec son `release_tag` après activation.
4. Si l’environnement `github-pages` demande une validation, approuver le déploiement.
5. Ouvrir **https://stevencayla.github.io/magic-learning-quest/**, puis vérifier un rechargement en mode avion après la première ouverture.

Le dépôt est désormais public. Pour un déploiement futur dans un dépôt privé : selon le forfait GitHub du propriétaire, Pages peut nécessiter un forfait payant compatible. Si GitHub le signale, activer un forfait compatible ou décider explicitement de rendre le dépôt public. Aucun changement de visibilité n’est effectué automatiquement.

Les changements de source sont relus dans la PR ; la publication suit la release stable. Pour revenir à une version précédente, rétablir son code sur `main` puis publier une nouvelle release après validation des contrôles.
