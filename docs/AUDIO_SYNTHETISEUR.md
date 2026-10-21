# 🔊 Le Synthétiseur Audio Rétro (Web Audio API)

Ce document présente l'architecture et les équations acoustiques du moteur sonore synthétisé en temps réel développé dans [`js/audio.js`](file:///c:/Users/mounir/Desktop/site/projet/js/audio.js).

---

## 1. Pourquoi la Synthèse Temps Réel plutôt que des Fichiers MP3 ?

Dans les projets web traditionnels, les effets sonores reposent souvent sur des fichiers audio externes (`.mp3` ou `.wav`). Cette méthode présente plusieurs inconvénients majeurs :
1. **Latence audible** : Le décodage et la lecture d'un son peuvent accuser un retard de 50 à 200 ms, nuisible au dynamisme d'un jeu d'arcade.
2. **Dépendance réseau & Risque 404** : Si un fichier distant ou local ne charge pas, le jeu devient muet ou génère des erreurs.
3. **Limitation de polyphonie** : Rejouer le son "waka-waka" toutes les 130 ms provoque des coupures ou des saturations désagréables.

Grâce à la **Web Audio API standard**, notre classe `SoundEngine` génère le signal sonore directement à partir d'oscillateurs mathématiques intégrés au navigateur. C'est exactement le fonctionnement des puces sonores de l'époque arcade (PSG - Programmable Sound Generator).

---

## 2. Chaîne de Traitement Audio (Audio Graph Pipeline)

Chaque son traverse une chaîne standard :

$$\text{OscillatorNode} \xrightarrow{\quad\text{Signal Brut}\quad} \text{GainNode} \xrightarrow{\quad\text{Volume \& Enveloppe}\quad} \text{AudioDestinationNode (Haut-parleurs)}$$

- **`OscillatorNode`** : Générateur de fréquence fondamentale (hauteur de la note).
- **`GainNode`** : Contrôleur d'amplitude temporelle (enveloppe d'attaque et d'atténuation).
- **`AudioContext.currentTime`** : Horloge audio matérielle d'une précision de l'ordre de la microseconde.

---

## 3. Détail des Effets Sonores Implémentés

### 3.1. Le Célèbre "Waka-Waka" (`playWaka()`)
Le son de mastication alterne entre deux fréquences opposées :
- **Passe 1** : Montée linéaire de 320 Hz à 490 Hz en 80 ms.
- **Passe 2** : Descente linéaire de 490 Hz à 320 Hz en 80 ms.
- **Forme d'onde** : `'triangle'` (onde triangulaire douce et ronde).
- **Protection Anti-Saturation** : Un filtre temporel empêche le son de se déclencher plus d'une fois toutes les 130 ms.

### 3.2. La Sirène de Super Pac-Gomme (`playEnergizer()`)
- **Forme d'onde** : `'sawtooth'` (onde en dents de scie, tranchante et agressive).
- **Modulation** : Montée en fréquence de 140 Hz à 260 Hz sur 250 ms avec atténuation exponentielle.

### 3.3. Fantôme Mangé (`playGhostEat()`)
- **Effet** : Balayage ascendant ultra-rapide (*Chirp Frequency Sweep*).
- **Équation de fréquence** :
  $$f(t) = 300 \times \left(\frac{1400}{300}\right)^{t / 0.35}$$
  L'onde monte de 300 Hz à 1400 Hz en 350 ms.

### 3.4. Dégustation de Fruit Bonus (`playFruit()`)
- **Composition** : Accord arpégé rapide de 4 notes (Do5, Mi5, Sol5, Do6) :
  $$\{ 523.25\text{ Hz}, 659.25\text{ Hz}, 783.99\text{ Hz}, 1046.50\text{ Hz} \}$$
  Chaque note dure 80 ms avec un décalage de 70 ms.

### 3.5. La Mort de Pac-Man (`playDeath()`)
Le son emblématique de défaite se décompose en :
1. **13 notes chromatiques descendantes** espacées de 90 ms :
   $$\{ 493.88, 466.16, 440.0, 415.3, 392.0, 369.99, 349.23, 329.63, 311.13, 293.66, 277.18, 261.63, 220.0 \}\text{ Hz}$$
2. **Le "Pop" final** : Un coup sourd à 85 Hz en onde carrée (`'square'`) après 1.2 seconde.

### 3.6. La Fanfare d'Ouverture Arcade (`playStartJingle()`)
La mélodie originale d'introduction de 1980 est retranscrite note pour note avec 28 impulsions harmoniques en onde carrée, fidèle aux bornes Midway d'origine.

---

## 4. Gestion de la Politique Audio des Navigateurs

Les navigateurs modernes interdisent la diffusion audio automatique avant la première interaction de l'utilisateur (clic, touche, contact tactile).

Notre classe résout ce point en toute élégance :
```javascript
init() {
  if (!this.ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) this.ctx = new AudioCtx();
  }
  if (this.ctx && this.ctx.state === 'suspended') {
    this.ctx.resume(); // Débloque le contexte dès le premier appui de touche
  }
}
```
L'écouteur est branché sur `keydown`, `mousedown` et `touchstart`, garantissant un démarrage sonore parfait dès que le joueur prend en main la partie.
