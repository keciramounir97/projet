# 📚 Guide Exhaustif des Fichiers, Classes & Méthodes

Ce document recense l'intégralité des fichiers du projet, détaillant chaque fonction, classe, méthode, paramètre et logique sous-jacente.

---

## 1. Fichiers HTML

### `index.html`
- **Rôle** : Page principale de l'application et conteneur de la borne d'arcade.
- **Sections Clés** :
  - `<header class="arcade-header">` : Barre de navigation supérieure avec logo SVG Pac-Man, liens vers les pages secondaires, et badge de version.
  - `<div class="arcade-cabinet">` : Châssis physique émulant une borne d'arcade vintage.
  - `<div class="arcade-marquee">` : Bandeau supérieur rétro avec boutons de contrôle rapide (Son, Filtre CRT, Pause, Redémarrage).
  - `<div id="arcade-screen" class="arcade-screen crt-active">` : Écran cathodique CRT avec calques de balayage scanlines.
  - `<div class="arcade-hud">` : Affichage en direct du score (1UP), du meilleur score (HIGH SCORE) et du niveau actuel (LEVEL).
  - `<canvas id="game-canvas">` : Surface graphique haute fidélité (résolution interne $560 \times 620$).
  - `<div id="game-banner">` : Superposition modale pour les états "READY!", "PAUSED", et "GAME OVER".
  - `<div class="arcade-status-bar">` : Zone inférieure affichant les icônes de vies restantes et la collection des fruits du niveau.
  - `<div class="mobile-controls">` : Croix directionnelle virtuelle (*Virtual D-Pad*) tactile pour téléphones et tablettes.

### `html/how-to-play.html`
- **Rôle** : Guide complet du joueur expliquant l'objectif (244 gommes), les contrôles (clavier et tactile), le tableau complet des points et des stratégies avancées.

### `html/characters.html`
- **Rôle** : Fiche d'identité interactive des 4 fantômes (Blinky, Pinky, Inky, Clyde) et de Pac-Man. Détaille pour chacun son rôle, sa couleur, son ciblage IA, et présente le tableau officiel des 7 fruits bonus.

### `html/high-scores.html`
- **Rôle** : Tableau d'honneur (*Hall of Fame*) stockant l'historique des parties dans le `localStorage` du navigateur. Affiche le rang, la date, le niveau atteint, le score final, les statistiques de carrière et les médailles de succès.

### `html/settings.html`
- **Rôle** : Panneau de réglages permettant de modifier le filtre CRT, d'activer/désactiver le son, et de choisir entre 4 palettes néon de labyrinthe (Bleu classique, Cyan Cyberpunk, Ambre rétro, Vert Matrix).

---

## 2. Fichiers CSS (`css/`)

### `css/main.css`
- **Rôle** : Feuille de style principale, système de design et variables CSS.
- **Éléments Définis** :
  - Variables de couleurs néon : `--pac-yellow`, `--neon-blue`, `--neon-pink`, `--neon-green`, `--neon-orange`.
  - Importation des polices Google Fonts : `'Press Start 2P'` (arcade 8-bit), `'Outfit'` (titres modernes), `'Inter'` (texte fluide).
  - Barre de navigation responsive avec effet de flou d'arrière-plan (*glassmorphism*).
  - Boutons de style arcade avec animations de pulsation luminescente (`@keyframes arcadePulse`).

### `css/arcade.css`
- **Rôle** : Modélisation visuelle de la borne d'arcade et effets d'écran cathodique.
- **Effets CRT Techniques** :
  - `.arcade-screen.crt-active::before` : Génération de lignes de balayage horizontales via un dégradé linéaire répété tous les 4px.
  - `.arcade-screen.crt-active::after` : Vignettage radial sombre accentuant la courbure physique des coins d'un tube cathodique.
  - Typographie fluorescente avec ombres portées douces simulant le phosphore.

### `css/game.css`
- **Rôle** : Mise en page du canvas, overlays et commandes mobiles.
- **Éléments Définis** :
  - Propriétés `#game-canvas` avec `aspect-ratio: 28 / 31` et rendu `image-rendering: pixelated`.
  - Panneau d'instructions clavier stylisé avec touches `<span class="kbd">`.
  - Grille CSS en 3x3 pour le D-Pad virtuel avec boutons réactifs aux événements tactiles (`touch-action: manipulation`).

---

## 3. Fichiers JavaScript (`js/`)

### `js/constants.js`
Définit toutes les valeurs constantes immuables du moteur :
- `TILE_SIZE = 20` : Taille d'une case en pixels.
- `MAP_COLS = 28`, `MAP_ROWS = 31` : Dimensions de la grille.
- `CANVAS_WIDTH = 560`, `CANVAS_HEIGHT = 620` : Résolution interne du canvas.
- `DIRECTIONS` : Objets contenant `{ x, y, name, angle }` pour `NONE`, `UP`, `DOWN`, `LEFT`, `RIGHT`.
- `GHOST_MODES` : Énumération `{ HOUSE, SCATTER, CHASE, FRIGHTENED, EATEN }`.
- `GAME_STATES` : Énumération `{ READY, PLAYING, PAUSED, GHOST_EATEN, PACMAN_DYING, LEVEL_CLEAR, GAME_OVER }`.
- `SCORES` : Barème des points (gommes, énergiseurs, fantômes et fruits).
- `GHOST_CONFIG` : Couleurs, cibles de dispersion et positions de départ des 4 fantômes.
- `THEMES` : Palettes de couleurs de murs néon.

---

### `js/map.js`
Gestion du labyrinthe et de la grille.
- **`ORIGINAL_MAZE`** : Tableau 2D de 31 lignes par 28 colonnes contenant la disposition officielle.
- **Classe `MazeMap`** :
  - `constructor()` : Initialise la grille et compte les pac-gommes.
  - `reset()` : Recharge une copie fraîche du labyrinthe originel.
  - `isWall(x, y)` : Retourne `true` si la tuile $(x, y)$ est un mur (valeur 1).
  - `isPassableForPacman(x, y)` : Vérifie si Pac-Man peut pénétrer sur la tuile (exclut les murs, la porte des fantômes et la maison).
  - `isPassableForGhost(x, y, isEaten)` : Vérifie si un fantôme peut passer. Si `isEaten === false`, la porte et l'intérieur de la maison sont infranchissables pour forcer les fantômes à emprunter les mêmes couloirs que Pac-Man.
  - `eatTile(tileX, tileY)` : Consomme la pac-gomme ou l'énergiseur présent sur la tuile, décrémente `pelletsRemaining` et renvoie le type de gomme.
  - `update(dt)` : Gère le clignotement des 4 super pac-gommes.
  - `render(ctx, theme)` : Dessine le fond, les bordures néon des murs par analyse des voisins, la porte rose et les gommes luminescentes.

---

### `js/pacman.js`
Entité joueur Pac-Man.
- **Classe `Pacman`** :
  - `constructor(maze)` : Initialise les coordonnées ($x=13.5, y=23$), vitesses et animations.
  - `reset()` : Repositionne Pac-Man à son emplacement de départ.
  - `setDirection(newDir)` : Reçoit une instruction directionnelle. Si c'est un demi-tour à $180^\circ$, applique immédiatement ; sinon, stocke dans `nextDirection` pour le prochain virage.
  - `update(dt)` :
    1. Si `isDying` : avance l'animation de disparition de 0 à 1.
    2. Tente d'exécuter la direction en tampon `nextDirection` si Pac-Man est proche d'un croisement.
    3. Déplace Pac-Man selon `currentDirection` avec détection de collision anticipée.
    4. Gère le passage dans le tunnel latéral à la ligne 14.
    5. Fait osciller l'angle de la bouche (`mouthAngle`) pour animer la mastication.
  - `getTile()` : Renvoie `{ x: Math.round(this.x), y: Math.round(this.y) }`.
  - `render(ctx)` : Dessine Pac-Man en jaune néon via `ctx.arc()` avec la bouche orientée dans la direction de déplacement, ou l'animation de disparition en cas de mort.

---

### `js/ghosts.js`
Gestion des 4 fantômes et de leur IA.
- **Classe `Ghost`** :
  - `constructor(typeKey, maze, pacman, getBlinkyPos)` : Initialise la configuration propre à Blinky, Pinky, Inky ou Clyde.
  - `reset()` : Repositionne le fantôme (Blinky à l'extérieur au-dessus de la porte, les autres à l'intérieur).
  - `setFrightened(duration)` : Enclenche le mode bleu apeuré et inverse la direction du fantôme.
  - `reverseDirection()` : Fait pivoter le fantôme à $180^\circ$.
  - `calculateTarget()` : Cœur de l'IA calculant les coordonnées $(x, y)$ de la tuile cible selon le fantôme et son mode actif.
  - `update(dt, globalMode)` :
    - Fait flotter et sortir les fantômes de la maison selon leur délai respectif (`releaseDelay`).
    - Réduit la vitesse dans le tunnel à 50% ou en mode apeuré à 60%.
    - Avance pas à pas vers le centre de la prochaine case et invoque `chooseNextDirection()`.
  - `chooseNextDirection()` : Analyse les virages possibles (excluant le demi-tour) et choisit la direction minimisant la distance euclidienne vers la cible.
  - `render(ctx)` : Dessine le corps coloré avec le bas ondulé, les yeux expressifs orientés dans le sens de la marche, ou l'apparence bleue apeurée / clignotante.
- **Classe `GhostManager`** :
  - `constructor(maze, pacman)` : Instancie les 4 fantômes et configure le calendrier Scatter/Chase.
  - `reset()` : Réinitialise tous les fantômes et remet le chronomètre de phase à zéro.
  - `triggerEnergizer(duration)` : Passe tous les fantômes en mode apeuré.
  - `update(dt)` : Fait progresser les 8 étapes du calendrier de dispersion/poursuite, active le bonus de vitesse "Cruise Elroy" pour Blinky quand les gommes diminuent, et met à jour chaque fantôme.
  - `render(ctx)` : Dessine les 4 fantômes.

---

### `js/audio.js`
Synthétiseur sonore basé sur la Web Audio API.
- **Classe `SoundEngine`** :
  - `init()` : Débloque le `AudioContext` dès le premier événement utilisateur.
  - `setMuted(muted)` / `setVolume(vol)` : Contrôle du volume et du mode muet.
  - `playTone(freq, type, duration, delay, startGain, endGain)` : Génère une note pure personnalisée avec rampe de gain.
  - `playWaka()` : Son de mastication bicolore oscillant entre 320 Hz et 490 Hz.
  - `playEnergizer()` : Sirène basse modulée en fréquence de 140 Hz à 260 Hz.
  - `playGhostEat()` : Balayage ascendant rapide de 300 Hz à 1400 Hz.
  - `playFruit()` : Arpège aigu à 4 notes (Do5, Mi5, Sol5, Do6).
  - `playDeath()` : 13 notes chromatiques descendantes conclues par un pop à 85 Hz.
  - `playStartJingle()` : Mélodie originale d'ouverture de 1980 en 28 notes.
  - `playLevelClear()` : Fanfare de victoire de passage de niveau.
  - `playExtraLife()` : Carillon harmonique récompensant le cap des 10 000 points.

---

### `js/ui.js`
Gestion de l'interface utilisateur, des textes flottants et des contrôles.
- **Classe `UIEngine`** :
  - `constructor(game)` : Récupère les références DOM des scores, vies, fruits et D-Pad.
  - `updateHUD(score, highScore, level, lives, fruits)` : Met à jour les libellés texte, les icônes SVG de vies restantes et les fruits ramassés.
  - `showBanner(title, subtitle, actionText, onAction)` : Affiche un panneau modal centré sur le canvas avec bouton d'action.
  - `hideBanner()` : Masque le panneau modal.
  - `addFloatingText(text, x, y, color)` : Crée un texte de score temporaire (+200, +400, etc.) montant vers le haut pendant 1 seconde.
  - `update(dt)` : Anime et estompe l'opacité des textes flottants.
  - `renderFloatingTexts(ctx)` : Dessine les textes flottants directement sur le canvas en typographie `'Press Start 2P'`.
  - `initControls()` : Attache les écouteurs tactiles sur le D-Pad virtuel et détecte les glissements de doigts (*swipe gestures*) sur l'écran.

---

### `js/game.js`
Moteur central et chef d'orchestre de la partie.
- **Classe `PacmanGame`** :
  - `constructor(canvas)` : Instancie le labyrinthe, Pac-Man, les fantômes, le moteur UI et précharge les SVG de fruits.
  - `start()` : Lance une nouvelle partie à zéro (score 0, niveau 1, 3 vies).
  - `startGame()` : Quitte l'état d'attente `READY`, lance la musique et passe en `PLAYING`.
  - `togglePause()` : Bascule l'état de pause.
  - `spawnBonusFruit()` : Fait apparaître un fruit bonus sous la maison des fantômes après 70 et 170 gommes consommées.
  - `checkFruitCollision()` : Détecte si Pac-Man entre en contact avec le fruit et accorde les points.
  - `checkGhostCollisions()` : Calcule la distance séparant Pac-Man de chaque fantôme :
    - Si le fantôme est bleu apeuré : dévore le fantôme, accorde 200/400/800/1600 pts et fige le jeu 550 ms.
    - Si le fantôme est normal : déclenche la mort de Pac-Man.
  - `handlePacmanDeath()` : Enclenche l'animation de mort, joue le son et retire une vie.
  - `addScore(pts)` : Incrémente le score, met à jour le record dans `localStorage`, et accorde une vie supplémentaire à 10 000 points.
  - `levelClear()` : Déclenche le clignotement blanc du labyrinthe.
  - `advanceToNextLevel()` : Augmente le niveau, accélère légèrement Pac-Man et les fantômes, et réinitialise les gommes.
  - `gameOver()` : Enregistre les scores dans l'historique et affiche l'écran de fin.
  - `gameLoop(time)` : Boucle principale appelée par `requestAnimationFrame` calculant le $\Delta t$, orchestrant `update(dt)` puis `render()`.

---

### `js/main.js`
Point d'entrée de l'application web.
- Initialise les dimensions natives du canvas ($560 \times 620$).
- Instancie et lance `PacmanGame`.
- Raccorde les boutons de la barre supérieure (Audio on/off, Filtre CRT on/off, Pause, Restart).
- Applique les préférences sauvegardées de l'utilisateur.
