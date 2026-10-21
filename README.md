# 🕹️ PAC-MAN 2D Arcade — Édition Web 2026

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/Vanilla_CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas 2D](https://img.shields.io/badge/Canvas_2D_API-00ffff?style=for-the-badge&logo=opengl&logoColor=black)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Synth_8--Bit-ff0077?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0_Zéro-00ff88?style=for-the-badge)
![FPS](https://img.shields.io/badge/Framerate-60_FPS_Fluide-yellow?style=for-the-badge)

> **Une réinterprétation moderne, élégante et ultra-fidèle du jeu d'arcade légendaire PAC-MAN (1980 / Édition 2026).**  
> Conçu de zéro en pur HTML5, CSS moderne, Canvas 2D haute performance, synthèse sonore Web Audio API native et 22 ressources vectorielles SVG sur mesure.

---

## 🌟 Points Forts du Projet

- 🧠 **Intelligence Artificielle Authentique des 4 Fantômes** :
  - **Blinky (Rouge)** : Poursuite directe et accélération *Cruise Elroy* quand les gommes s'épuisent.
  - **Pinky (Rose)** : Embuscade en anticipant 4 tuiles devant Pac-Man.
  - **Inky (Cyan)** : Attaque en tenaille par projection vectorielle combinée avec Blinky.
  - **Clyde (Orange)** : Comportement de chasse à longue distance et repli peureux à courte portée.
- ⚡ **Navigation en Grille Pixel-Perfect** :
  - Déplacements au pixel près sur la grille officielle $28 \times 31$.
  - Pré-virage (*Corner Buffering*) et demi-tour instantané à 180° pour un contrôle ultra-nerveux.
  - Tunnels latéraux fonctionnels (ligne 14) avec téléportation circulaire et ralentissement des fantômes.
- 📺 **Simulateur de Borne d'Arcade & Filtre CRT** :
  - Châssis de borne avec bandeau rétro, écran bombé et lueur phosphorescente néon.
  - Lignes de balayage (*scanlines*) et effet cathodique activables d'un simple clic.
- 🔊 **Synthétiseur Audio 8-Bit Intégré (Web Audio API)** :
  - Zéro fichier MP3 ou WAV externe : tous les effets sonores (Waka-waka, sirène, fantôme mangé, mort, fanfare d'ouverture) sont synthétisés mathématiquement en temps réel par des oscillateurs.
  - Zéro latence et zéro erreur de chargement réseau.
- 🎨 **Ressources 100% SVG Vectorielles** :
  - 22 graphismes SVG faits sur mesure pour Pac-Man, les fantômes sous tous leurs états (normal, apeuré, clignotant, yeux), et les 7 fruits bonus (cerise, fraise, orange, pomme, melon, cloche, clé).
- 📱 **Multiplateforme & Contrôles Tactiles** :
  - Jouable au clavier (`▲▼◀▶` ou `WASD`), à la manette ou sur mobile grâce au D-Pad virtuel et aux gestes de glissement (*swipe*).
- 🏆 **Persistance des Scores & Personnalisation** :
  - Enregistrement local automatique des meilleurs scores (*Hall of Fame*) dans le `localStorage`.
  - Personnalisation des thèmes néon du labyrinthe (Bleu classique, Cyan Cyberpunk, Ambre rétro, Vert Matrix).

---

## 📁 Structure du Projet

```
projet/
├── index.html                   # Borne d'arcade et page principale de jeu
├── README.md                    # Présentation professionnelle du projet
├── assets/
│   └── svg/                     # 22 ressources graphiques vectorielles SVG
│       ├── pacman.svg           # Pac-Man animé bouche ouverte
│       ├── ghost-blinky.svg     # Fantôme Blinky (Ombre - Rouge)
│       ├── ghost-pinky.svg      # Fantôme Pinky (Rapide - Rose)
│       ├── ghost-inky.svg       # Fantôme Inky (Timide - Cyan)
│       ├── ghost-clyde.svg      # Fantôme Clyde (Indifférent - Orange)
│       ├── ghost-scared.svg     # Fantôme apeuré bleu
│       ├── ghost-flashing.svg   # Fantôme clignotant
│       ├── ghost-eyes.svg       # Yeux seuls retournant au bercail
│       ├── cherry.svg           # Fruit bonus : Cerise (Niv. 1)
│       ├── strawberry.svg       # Fruit bonus : Fraise (Niv. 2)
│       ├── orange.svg           # Fruit bonus : Orange (Niv. 3-4)
│       ├── apple.svg            # Fruit bonus : Pomme (Niv. 5-6)
│       ├── melon.svg            # Fruit bonus : Melon (Niv. 7-8)
│       ├── bell.svg             # Fruit bonus : Cloche (Niv. 9-10)
│       ├── key.svg              # Bonus : Clé d'or (Niv. 11+)
│       ├── pellet.svg           # Pac-Gomme standard
│       ├── energizer.svg        # Super Pac-Gomme
│       ├── life.svg             # Icône de vie
│       ├── logo.svg             # Logo rétro néon Pac-Man
│       ├── trophy.svg           # Trophée des records
│       └── gamepad.svg          # Manette des contrôles
├── css/
│   ├── main.css                 # Typographies (Press Start 2P), variables et navbar
│   ├── arcade.css               # Châssis borne d'arcade, filtres CRT et HUD
│   └── game.css                 # Conteneur Canvas, overlays et D-Pad mobile
├── js/
│   ├── constants.js             # Grille, vitesses, barème des points et thèmes
│   ├── audio.js                 # Moteur synthétiseur audio Web Audio API
│   ├── map.js                   # Matrice du labyrinthe, collisions et rendu néon
│   ├── pacman.js                # Classe Pacman (déplacements, animations et virages)
│   ├── ghosts.js                # Classe Ghost & GhostManager (IA et modes)
│   ├── ui.js                    # Affichage HUD, scores flottants et contrôles
│   ├── game.js                  # Moteur central de jeu (Machine à états finis)
│   └── main.js                  # Point d'entrée de l'application
├── html/
│   ├── how-to-play.html         # Règles du jeu, contrôles et astuces de pro
│   ├── characters.html          # Présentation détaillée des fantômes et fruits
│   ├── high-scores.html         # Tableau d'honneur et succès débloquables
│   └── settings.html            # Configuration (volume, CRT, palettes de couleurs)
└── docs/                        # Documentation technique approfondie en français
    ├── ARCHITECTURE.md          # Architecture logicielle, design patterns et flux
    ├── LOGIQUE_JEU.md           # Logique détaillée (IA, collisions, cornering)
    ├── MAP_ET_COLLISIONS.md     # Grille du labyrinthe, tuiles et tunnels
    ├── AUDIO_SYNTHETISEUR.md    # Synthèse sonore 8-bit avec Web Audio API
    └── FICHIERS_ET_COMPOSANTS.md# Analyse détaillée fichier par fichier et méthode par méthode
```

---

## 🎮 Commandes du Jeu

### Sur Ordinateur (Clavier)
| Touche Clavier | Action |
| :--- | :--- |
| **`▲`** ou **`W`** | Déplacer Pac-Man vers le **Haut** |
| **`▼`** ou **`S`** | Déplacer Pac-Man vers le **Bas** |
| **`◀`** ou **`A`** | Déplacer Pac-Man vers la **Gauche** |
| **`▶`** ou **`D`** | Déplacer Pac-Man vers la **Droite** |
| **`ESPACE`** ou **`P`** | Mettre le jeu en **Pause** / Reprendre |

### Sur Mobile / Tablette (Tactile)
- **Virtual D-Pad** : Touchez les flèches directionnelles sous la borne.
- **Glissement (Swipe)** : Faites glisser votre doigt sur l'écran dans n'importe quelle direction pour orienter Pac-Man.

---

## 📊 Barème des Points

| Élément | Visuel | Points Accordés | Effet |
| :--- | :---: | :---: | :--- |
| **Pac-Gomme** | 🟡 | **10 pts** | 240 gommes à ramasser par niveau |
| **Super Pac-Gomme (Énergiseur)** | ⚪ | **50 pts** | Rend les 4 fantômes vulnérables |
| **1er Fantôme dévoré** | 👻 | **200 pts** | Les yeux retournent au bercail |
| **2e Fantôme dévoré** | 👻 | **400 pts** | Enchaînement durant le même énergiseur |
| **3e Fantôme dévoré** | 👻 | **800 pts** | Multiplicateur x4 |
| **4e Fantôme dévoré** | 👻 | **1 600 pts** | Combo maximal x8 |
| **Cerise (Niv. 1)** | 🍒 | **100 pts** | Apparaît 2 fois par niveau |
| **Fraise (Niv. 2)** | 🍓 | **300 pts** | Disponible 10 secondes |
| **Orange (Niv. 3-4)** | 🍊 | **500 pts** | Bonus de milieu de partie |
| **Pomme (Niv. 5-6)** | 🍏 | **700 pts** | Vitesse augmentée |
| **Melon (Niv. 7-8)** | 🍈 | **1 000 pts** | Gros bonus de score |
| **Cloche (Niv. 9-10)** | 🔔 | **3 000 pts** | Récompense experte |
| **Clé (Niv. 11+)** | 🗝️ | **5 000 pts** | Récompense suprême |
| **Vie Supplémentaire** | 💛 | **10 000 pts** | Une vie offerte au cap des 10 000 pts |

---

## 🚀 Installation & Lancement Rapide

Ce projet ne nécessite aucune installation de paquets `node_modules`.

### Méthode 1 : Avec Python (Recommandé)
Ouvrez un terminal dans le dossier du projet et exécutez :
```bash
python -m http.server 8080
```
Puis ouvrez votre navigateur sur [http://localhost:8080](http://localhost:8080).

### Méthode 2 : Avec Node.js (`npx serve`)
```bash
npx -y serve . -l 8080
```

### Méthode 3 : Extension Live Server (VS Code / IDE)
Faites un clic droit sur `index.html` et choisissez **"Open with Live Server"**.

---

## 📖 Documentation Technique Complète

Pour plonger dans le code source et comprendre la conception détaillée, consultez les guides du dossier [`docs/`](docs/) :
- [**Architecture Logicielle & Game Loop**](docs/ARCHITECTURE.md) : Découpage MVC, Delta Time, machine à états et rendu Canvas.
- [**Logique de Jeu & IA des Fantômes**](docs/LOGIQUE_JEU.md) : Algorithmes mathématiques de ciblage de Blinky, Pinky, Inky et Clyde, phases Scatter/Chase et virages.
- [**Labyrinthe, Collisions & Tunnels**](docs/MAP_ET_COLLISIONS.md) : Matrice 28x31, téléportation latérale, pénalités de vitesse et analyse des voisins.
- [**Synthétiseur Audio Rétro Web Audio API**](docs/AUDIO_SYNTHETISEUR.md) : Génération de fréquences en temps réel, oscillateurs, enveloppes ADSR.
- [**Dictionnaire Exhaustif des Fichiers & Méthodes**](docs/FICHIERS_ET_COMPOSANTS.md) : Explication de chaque classe, méthode et paramètre du projet.

---

## 📜 Licence & Crédits
- Développé avec passion pour célébrer l'héritage intemporel de **Toru Iwatani (Namco, 1980)**.
- Graphismes vectoriels SVG et code source réalisés à des fins pédagogiques et récréatives.
- **Édition 2026** — *Enjoy the Arcade Experience!*
