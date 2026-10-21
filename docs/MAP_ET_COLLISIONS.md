# 🗺️ Le Labyrinthe, Collisions & Système de Tuiles

Ce document détaille la structure matricielle du labyrinthe authentique de Pac-Man, les types de tuiles, les règles strictes de collision et le rendu graphique Canvas 2D.

---

## 1. Structure de la Matrice du Labyrinthe (`ORIGINAL_MAZE`)

Le labyrinthe est modélisé par un tableau à deux dimensions de 31 lignes et 28 colonnes (`ORIGINAL_MAZE` dans `js/map.js`).

Chaque case de la grille contient un entier représentant son rôle :

| Valeur | Signification | Comportement Pac-Man | Comportement Fantôme | Rendu Visuel |
| :---: | :--- | :--- | :--- | :--- |
| **`0`** | Couloir vide | Traversable | Traversable | Fond sombre (`#06060c`) |
| **`1`** | Mur plein | **Infranchissable** | **Infranchissable** | Bordures néon lumineuses bleues/cyan |
| **`2`** | Pac-Gomme | Traversable (gagne 10 pts, son waka) | Traversable | Disque pêche phosphorescent (rayon 2.5px) |
| **`3`** | Super Pac-Gomme | Traversable (gagne 50 pts, effraie fantômes) | Traversable | Disque clignotant blanc (rayon 6.5px) |
| **`4`** | Porte de la Maison | **Infranchissable** | Franchissable uniquement pour yeux retournant ou sortie | Ligne rose horizontale lumineuse |
| **`5`** | Intérieur Maison | **Infranchissable** | Réservé aux fantômes en attente | Fond de maison protégé |
| **`6`** | Emplacement Fruit | Traversable (mange le fruit bonus) | Traversable | Emplacement en dessous de la porte (13.5, 17) |
| **`7`** | Tunnel de Téléportation | Traversable à vitesse normale | Traversable à **50% de vitesse** | Couloir latéral sans pac-gommes |

---

## 2. Le Tunnel de Téléportation Latéral (Ligne 14)

Le labyrinthe possède un couloir traversant de part en part à la ligne 14 (l'ordonnée $y = 14$).

### 2.1. Téléportation Circulaire (Wrapping)
Lorsque Pac-Man ou un fantôme se déplace latéralement :
- **Vers la gauche** : dès que $x < -0.5$, la position est immédiatement transposée à $x = 28 - 0.5 = 27.5$ (à l'extrémité droite).
- **Vers la droite** : dès que $x > 28 - 0.5$, la position est transposée à $x = -0.5$ (à l'extrémité gauche).

### 2.2. Pénalité de Vitesse des Fantômes dans le Tunnel
Dans les versions officielles d'arcade, le tunnel sert d'échappatoire stratégique au joueur :
- Pac-Man traverse le tunnel à sa vitesse nominale (100%).
- Les fantômes qui s'y engagent (entre les colonnes 0 à 5 et 22 à 27) voient leur vitesse réduite à **50%** de leur vitesse de base.

---

## 3. Algorithme de Rendu Graphique des Murs Néon

Le rendu dans la méthode `MazeMap.render(ctx, theme)` utilise une technique d'analyse des voisins (*Neighbor Tile Analysis*) pour dessiner un réseau de bordures néon continues et lisses :

```javascript
// Pour chaque tuile de mur (tile === 1) :
const top    = r > 0 && this.grid[r - 1][c] === 1;
const bottom = r < MAP_ROWS - 1 && this.grid[r + 1][c] === 1;
const left   = c > 0 && this.grid[r][c - 1] === 1;
const right  = c < MAP_COLS - 1 && this.grid[r][c + 1] === 1;

// Ne tracer un trait que sur les côtés qui sont en contact avec un couloir :
if (!top)    ctx.lineTo(px + TILE_SIZE, py + 1);
if (!bottom) ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE - 1);
if (!left)   ctx.lineTo(px + 1, py + TILE_SIZE);
if (!right)  ctx.lineTo(px + TILE_SIZE - 1, py + TILE_SIZE);
```

### Effet d'Éclairage Néon :
Le trait de contour s'accompagne d'un filtre d'ombre portée luminescente :
```javascript
ctx.strokeStyle = wallColor;
ctx.lineWidth = 2;
ctx.shadowColor = glowColor; // ex: 'rgba(0, 229, 255, 0.7)'
ctx.shadowBlur = 6;
```
Ce procédé confère au jeu son aspect borne d'arcade moderne à la frontière du rétro et du cyberpunk.

---

## 4. Animation de Fin de Niveau (Level Clear Flash)

Lorsque `pelletsRemaining` atteint `0` :
1. La variable `levelClearFlashing` devient `true`.
2. Le moteur alterne la couleur des murs entre leur couleur d'origine et un blanc éclatant (`#FFFFFF`) toutes les 150 ms :
   ```javascript
   const isWhite = this.levelClearFlashing && (Math.floor(Date.now() / 150) % 2 === 0);
   ```
3. La fanfare de victoire `sounds.playLevelClear()` est jouée.
4. Au terme des 2.2 secondes, le niveau s'incrémente, le labyrinthe est réinitialisé et les personnages sont repositionnés.
