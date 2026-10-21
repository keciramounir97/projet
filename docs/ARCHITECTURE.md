# 🏛️ Architecture Logicielle & Conception du Projet PAC-MAN 2D

Ce document présente en détail l'architecture technique, les principes de conception et les choix d'ingénierie logicielle mis en œuvre pour concevoir et développer cette réplique authentique et moderne du jeu d'arcade légendaire **PAC-MAN (1980 / Édition 2026)**.

---

## 1. Philosophie & Objectifs de Conception

L'objectif de ce projet est de réaliser un jeu d'arcade 2D complet, fluide à 60 images par seconde, sans framework lourd externe (Zéro dépendance npm au runtime), reposant exclusivement sur les standards modernes du Web :
- **HTML5 Sémantique** pour la structure et l'accessibilité.
- **Vanilla CSS (Modern CSS)** pour une immersion arcade néon avec effets CRT physiques (lignes de balayage scanlines, lueur phosphorescente, courbure d'écran).
- **JavaScript ES6+ modulaire** (`type="module"`) garantissant un découplage strict entre les responsabilités (modèle, vue, contrôleur, boucle de jeu).
- **Canvas 2D API** pour un rendu pixel-perfect vectoriel et matriciel haute performance.
- **Web Audio API** pour la synthèse sonore temps réel 8-bit native (aucun fichier audio MP3 ou WAV externe requis).
- **Ressources 100% SVG vectorielles** créées sur mesure pour les personnages, fantômes, fruits bonus et éléments d'interface.

---

## 2. Diagramme de la Structure des Dossiers

```
projet/
├── index.html                   # Page d'accueil et borne d'arcade principale
├── README.md                    # Documentation générale du projet
├── assets/
│   └── svg/                     # 22 ressources graphiques vectorielles SVG
│       ├── pacman.svg           # Pac-Man bouche ouverte
│       ├── pacman-closed.svg    # Pac-Man bouche fermée
│       ├── ghost-blinky.svg     # Fantôme Blinky (Rouge)
│       ├── ghost-pinky.svg      # Fantôme Pinky (Rose)
│       ├── ghost-inky.svg       # Fantôme Inky (Cyan)
│       ├── ghost-clyde.svg      # Fantôme Clyde (Orange)
│       ├── ghost-scared.svg     # Fantôme Apeuré (Bleu)
│       ├── ghost-flashing.svg   # Fantôme Clignotant (Blanc/Rouge)
│       ├── ghost-eyes.svg       # Yeux seuls (Fantôme mangé)
│       ├── cherry.svg           # Fruit bonus : Cerise (Niv. 1)
│       ├── strawberry.svg       # Fruit bonus : Fraise (Niv. 2)
│       ├── orange.svg           # Fruit bonus : Orange (Niv. 3-4)
│       ├── apple.svg            # Fruit bonus : Pomme (Niv. 5-6)
│       ├── melon.svg            # Fruit bonus : Melon (Niv. 7-8)
│       ├── bell.svg             # Bonus : Cloche (Niv. 9-10)
│       ├── key.svg              # Bonus : Clé (Niv. 11+)
│       ├── pellet.svg           # Pac-Gomme standard
│       ├── energizer.svg        # Super Pac-Gomme
│       ├── life.svg             # Icône de vie
│       ├── logo.svg             # Logo rétro néon Pac-Man
│       ├── trophy.svg           # Icône Trophée (Classement)
│       └── gamepad.svg          # Icône Manette (Contrôles)
├── css/
│   ├── main.css                 # Reset, typographies (Press Start 2P, Outfit), navbar, footer
│   ├── arcade.css               # Châssis de borne d'arcade, filtres CRT, HUD rétro
│   └── game.css                 # Conteneur canvas, bandeau Ready/Game Over, D-Pad virtuel tactile
├── js/
│   ├── constants.js             # Constantes, grille 28x31, coordonnées, vitesses, scores
│   ├── audio.js                 # Moteur synthétiseur audio Web Audio API temps réel
│   ├── map.js                   # Matrice du labyrinthe, collisions, gestion des gommes
│   ├── pacman.js                # Classe Pacman (déplacements, buffer de virage, animations)
│   ├── ghosts.js                # Classe Ghost & GhostManager (IA des 4 fantômes, modes)
│   ├── ui.js                    # Gestionnaire HUD, textes flottants de points, D-Pad
│   ├── game.js                  # Moteur central de jeu (Machine à états, règles, scoring)
│   └── main.js                  # Point d'entrée de l'application, initialisation Canvas
├── html/
│   ├── how-to-play.html         # Règles du jeu, guide des contrôles et stratégies
│   ├── characters.html          # Présentation détaillée des fantômes, IA et fruits
│   ├── high-scores.html         # Tableau des records locaux et succès débloquables
│   └── settings.html            # Configuration (volume, filtre CRT, thèmes du labyrinthe)
└── docs/                        # Documentation technique approfondie en français
    ├── ARCHITECTURE.md          # Architecture globale, boucle de jeu et flux de données
    ├── LOGIQUE_JEU.md           # Logique détaillée (IA, collisions, interpolation)
    ├── MAP_ET_COLLISIONS.md     # Grille du labyrinthe, tuiles et tunnels
    ├── AUDIO_SYNTHETISEUR.md    # Synthèse sonore 8-bit avec Web Audio API
    └── FICHIERS_ET_COMPOSANTS.md# Analyse détaillée fichier par fichier et méthode par méthode
```

---

## 3. Architecture Modulaire & Design Patterns

Le code JavaScript adopte une approche orientée objet claire inspirée du pattern **MVC (Modèle-Vue-Contrôleur)** couplé à une **Boucle de Jeu (Game Loop Pattern)** :

```
                        ┌───────────────────────────────┐
                        │      Boucle de Jeu (Game)     │
                        │    requestAnimationFrame()    │
                        └──────────────┬────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│     Modèle (État)     │  │       Contrôleur      │  │        Vue (HUD)      │
│  - Pacman             │  │  - Clavier (WASD/▲▼◀▶) │  │  - Canvas 2D (Jeu)    │
│  - GhostManager       │  │  - Virtual D-Pad      │  │  - DOM HUD (Scores)   │
│  - MazeMap            │  │  - Gestes Tactiles    │  │  - Popups Flottantes  │
│  - Scores & Vies      │  │  - Menus / Boutons    │  │  - Synthesizer Audio  │
└───────────────────────┘  └───────────────────────┘  └───────────────────────┘
```

### 3.1. Le Pattern Game Loop (Boucle de jeu à pas de temps delta)
Pour assurer une vitesse de jeu absolument identique quel que soit le taux de rafraîchissement de l'écran (60Hz, 120Hz, 144Hz ou 240Hz), la boucle de mise à jour s'appuie sur le calcul d'un **Delta Time (`dt`)** exprimé en millisecondes :

$$\Delta t = \min(100, t_{\text{actuel}} - t_{\text{précédent}})$$

Toutes les équations de déplacement sont calculées en fonction de ce $\Delta t$ :
$$\text{distance} = \frac{\text{vitesse} \times \Delta t}{1000}$$

### 3.2. La Machine à États Finis (Finite State Machine)
Le jeu est orchestré par un automate à états finis dans `PacmanGame` (`js/game.js`) :
1. **`READY`** : La partie démarre, le message "READY!" est affiché, la mélodie d'introduction retentit.
2. **`PLAYING`** : Le jeu tourne normalement, Pac-Man et les fantômes explorent le labyrinthe.
3. **`PAUSED`** : Le jeu est mis en pause à la demande du joueur, l'horloge interne est figée.
4. **`GHOST_EATEN`** : Un fantôme bleu apeuré a été croqué par Pac-Man. Une pause dramatique de 550 ms immobilise la scène pour afficher les points bonus (+200, +400, etc.).
5. **`PACMAN_DYING`** : Pac-Man est touché par un fantôme. L'animation de disparition à 360° se déroule avec le son de chute rétro.
6. **`LEVEL_CLEAR`** : Toutes les pac-gommes sont dévorées. Les murs du labyrinthe clignotent en blanc, une fanfare retentit, puis le niveau supérieur commence avec une difficulté rehaussée.
7. **`GAME_OVER`** : Pac-Man n'a plus de vies. Enregistrement des statistiques dans `localStorage` et affichage du panneau de fin.

---

## 4. Système de Coordonnées & Grille

Le labyrinthe repose sur la grille authentique de l'arcade originale :
- **Nombre de colonnes** : 28 tuiles
- **Nombre de lignes** : 31 tuiles
- **Taille de tuile (`TILE_SIZE`)** : 20 pixels
- **Résolution native du Canvas** : $28 \times 20 = 560\text{ px}$ de largeur sur $31 \times 20 = 620\text{ px}$ de hauteur.

### Conversion Coordonnées Grille $\leftrightarrow$ Pixels :
Pour une tuile située à la colonne $c \in [0, 27]$ et à la ligne $r \in [0, 30]$ :
- **Coin supérieur gauche** : $x_{\text{pixel}} = c \times 20$, $y_{\text{pixel}} = r \times 20$
- **Centre de la tuile** : $x_{\text{centre}} = (c + 0.5) \times 20$, $y_{\text{centre}} = (r + 0.5) \times 20$

Cette convention mathématique unifiée garantit que Pac-Man, les 4 fantômes et les éléments bonus partagent exactement le même repère spatial sans décalage.
