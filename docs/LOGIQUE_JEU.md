# 🧠 Logique Détaillée du Jeu & Intelligence Artificielle

Ce document explique en profondeur l'intégralité de la logique de déplacement, de détection des intersections, ainsi que les algorithmes d'Intelligence Artificielle (IA) des quatre fantômes emblématiques de Pac-Man.

---

## 1. Logique de Déplacement de Pac-Man

### 1.1. Pré-virage et Tampon de Direction (Corner Buffering)
Dans un jeu d'arcade classique, si le joueur devait appuyer sur une flèche directionnelle précisément au pixel près au centre d'une intersection, le jeu semblerait rigide et frustrant.

Pour offrir une maniabilité ultra-réactive et satisfaisante :
1. **Inversion instantanée à 180°** : Si Pac-Man se déplace vers la droite et que le joueur presse "Gauche", la direction s'inverse immédiatement sans attendre d'atteindre le centre de la tuile.
2. **Buffer de virage perpendiculaire** : Lorsque le joueur demande un virage à $90^\circ$ (ex: Pac-Man va à droite et le joueur presse "Haut") :
   - Le système calcule la distance séparant Pac-Man du centre de la prochaine colonne ou ligne :
     $$d = \sqrt{(x - x_{\text{cible}})^2 + (y - y_{\text{cible}})^2}$$
   - Si cette distance est inférieure ou égale au seuil de tolérance ($1.5 \times \text{pas} + 0.12\text{ tuiles}$), et que la tuile visée n'est pas un mur, Pac-Man est automatiquement réaligné sur le centre du couloir et pivote sans perdre de vitesse.

### 1.2. Détection d'Obstacle et Butée sans Traversée de Mur
Lors de chaque itération temporelle $\Delta t$ :
- Pac-Man calcule sa prochaine coordonnée théorique :
  $$x_{\text{suivant}} = x + \text{direction.x} \times \frac{\text{vitesse} \times \Delta t}{1000}$$
- Si la tuile suivante est un mur, Pac-Man avance jusqu'à la butée exacte de sa tuile actuelle ($\text{Math.round}(x)$) et stoppe son mouvement ($\text{direction} = \text{NONE}$), évitant tout glissement ou chevauchement dans les murs.

---

## 2. Intelligence Artificielle des 4 Fantômes

Contrairement à une idée reçue, les fantômes ne se déplacent pas au hasard : chacun possède un comportement mathématique unique de ciblage (*Target Tile AI*).

```
┌───────────┬──────────────┬──────────────┬───────────────────────────────────────────┐
│ Fantôme   │ Nom / Teinte │ Surnom       │ Algorithme de Ciblage en Mode Poursuite   │
├───────────┼──────────────┼──────────────┼───────────────────────────────────────────┤
│ Blinky    │ Rouge        │ "Shadow"     │ Cible directement la tuile de Pac-Man     │
│ Pinky     │ Rose         │ "Speedy"     │ Cible 4 tuiles devant Pac-Man             │
│ Inky      │ Cyan         │ "Bashful"    │ Cible le vecteur symétrique Blinky-PacMan │
│ Clyde     │ Orange       │ "Pokey"      │ Chasse si loin (>8 tuiles), fuit si près  │
└───────────┴──────────────┴──────────────┴───────────────────────────────────────────┘
```

### 2.1. Blinky (Le Fantôme Rouge - "Shadow")
- **Rôle** : Chasseur acharné et direct.
- **Tuile Cible en Chase** :
  $$T_{\text{Blinky}} = (X_{\text{Pacman}}, Y_{\text{Pacman}})$$
- **Mécanique Spéciale "Cruise Elroy"** :
  Au fur et à mesure que Pac-Man mange les gommes du labyrinthe :
  - Moins de 20 gommes restantes : la vitesse de Blinky augmente de **10%**.
  - Moins de 10 gommes restantes : la vitesse de Blinky augmente de **20%**, le rendant plus rapide que Pac-Man !

### 2.2. Pinky (Le Fantôme Rose - "Speedy")
- **Rôle** : Prédateur d'embuscade. Il essaie de couper la route à Pac-Man au lieu de le suivre.
- **Tuile Cible en Chase** :
  $$T_{\text{Pinky}} = (X_{\text{Pacman}} + 4 \times D_x, Y_{\text{Pacman}} + 4 \times D_y)$$
  *(où $D_x, D_y$ représente le vecteur directionnel actuel de Pac-Man)*.

### 2.3. Inky (Le Fantôme Cyan - "Bashful")
- **Rôle** : Attaquant en tenaille. Inky coopère avec Blinky pour encercler Pac-Man.
- **Algorithme de Calcul** :
  1. Prendre le point pivot situé à 2 tuiles devant Pac-Man :
     $$P = (X_{\text{Pacman}} + 2 \times D_x, Y_{\text{Pacman}} + 2 \times D_y)$$
  2. Calculer le vecteur reliant Blinky à ce point pivot :
     $$\vec{V} = P - \text{Pos}_{\text{Blinky}}$$
  3. Projeter ce vecteur depuis le point pivot pour doubler son amplitude :
     $$T_{\text{Inky}} = P + \vec{V} = 2P - \text{Pos}_{\text{Blinky}}$$

### 2.4. Clyde (Le Fantôme Orange - "Pokey")
- **Rôle** : Le fantôme hésitant ou craintif.
- **Algorithme de Calcul** :
  Clyde calcule sa distance euclidienne par rapport à Pac-Man :
  $$d = \sqrt{(X_{\text{Clyde}} - X_{\text{Pacman}})^2 + (Y_{\text{Clyde}} - Y_{\text{Pacman}})^2}$$
  - Si $d > 8\text{ tuiles}$ : Clyde adopte la cible de Pac-Man ($T = \text{Pos}_{\text{Pacman}}$) et le pourchasse.
  - Dès qu'il s'approche à moins de 8 tuiles ($d \le 8$) : Clyde prend peur et bat en retraite vers son coin de dispersion personnel (en bas à gauche, tuile $(0, 31)$).

---

## 3. Prise de Décision aux Intersections

À chaque croisement du labyrinthe, un fantôme ne peut jamais faire demi-tour à $180^\circ$ (règle officielle Namco, sauf lors d'un changement global de mode).

Pour choisir son prochain couloir :
1. Il identifie les directions candidates dans l'ordre de priorité officiel : **HAUT, GAUCHE, BAS, DROITE**.
2. Il élimine la direction opposée à sa direction actuelle.
3. Il vérifie la praticabilité de chaque tuile avec `maze.isPassableForGhost(...)`.
4. Pour chaque candidate valide $(X_c, Y_c)$, il calcule la distance euclidienne au carré vers sa cible $(X_t, Y_t)$ :
   $$D^2 = (X_c - X_t)^2 + (Y_c - Y_t)^2$$
5. Il sélectionne la direction minimisant cette distance $D^2$.

---

## 4. Les Différents Modes de Jeu des Fantômes

Les fantômes alternent selon une horloge millimétrée entre plusieurs modes :

### 4.1. Calendrier Scatter / Chase
Au cours d'un niveau, le gestionnaire `GhostManager` applique la planification arcade officielle :
1. **Scatter 1** : 7 secondes (les 4 fantômes se retirent dans leurs 4 coins respectifs).
2. **Chase 1** : 20 secondes (chasse selon leurs IA individuelles).
3. **Scatter 2** : 7 secondes.
4. **Chase 2** : 20 secondes.
5. **Scatter 3** : 5 secondes.
6. **Chase 3** : 20 secondes.
7. **Scatter 4** : 5 secondes.
8. **Chase 4 Permanent** : Poursuite infinie jusqu'à la fin du niveau.

À chaque bascule entre Scatter et Chase, tous les fantômes inversent immédiatement leur sens de marche pour signaler le changement de phase !

### 4.2. Mode Frightened (Super Pac-Gomme / Energizer)
Quand Pac-Man mange l'un des 4 énergiseurs :
- Tous les fantômes passent en bleu sombre avec des yeux blancs et une bouche en zigzag.
- Leur vitesse est réduite à **60%** de leur vitesse de base.
- Leurs choix aux intersections deviennent semi-aléatoires.
- Durant les 2 dernières secondes, ils clignotent en blanc et rouge pour avertir le joueur.
- Pac-Man peut les dévorer en séquence :
  - 1er fantôme : **200 pts**
  - 2e fantôme : **400 pts**
  - 3e fantôme : **800 pts**
  - 4e fantôme : **1600 pts**

### 4.3. Mode Eaten (Yeux seuls de retour à la maison)
Lorsqu'un fantôme est mangé :
- Son corps disparaît, seuls subsistent les yeux flottants.
- Sa vitesse passe à **220%** de sa vitesse normale.
- Sa cible devient immédiatement l'entrée de la maison des fantômes : $(13.5, 11)$.
- Une fois arrivé au-dessus de la porte, il descend dans la maison, régénère son corps, attend un bref instant puis ressort prêt à en découdre !
