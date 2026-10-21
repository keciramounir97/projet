/**
 * Pac-Man 2D Arcade - Core Game Loop & State Machine
 */

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  DIRECTIONS,
  GAME_STATES,
  GHOST_MODES,
  SCORES,
  THEMES
} from './constants.js';
import { MazeMap } from './map.js';
import { Pacman } from './pacman.js';
import { GhostManager } from './ghosts.js';
import { sounds } from './audio.js';
import { UIEngine } from './ui.js';

export class PacmanGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.maze = new MazeMap();
    this.pacman = new Pacman(this.maze);
    this.ghostManager = new GhostManager(this.maze, this.pacman);
    this.ui = new UIEngine(this);

    this.state = GAME_STATES.READY;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('pacman_high_score') || '0', 10);
    this.level = 1;
    this.lives = 3;
    this.collectedFruits = [];
    this.bonusFruit = null; // { fruit, x, y, timer, maxTimer, image }
    this.pelletsEatenThisLevel = 0;
    this.hasAwardedBonusLife = false;

    this.stateTimer = 0;
    this.lastTime = 0;
    this.currentTheme = THEMES[localStorage.getItem('pacman_theme') || 'classic'] || THEMES.classic;

    // Fruit SVGs cache
    this.fruitImages = {};
    this.preloadFruitImages();

    this.setupEventListeners();
  }

  preloadFruitImages() {
    SCORES.FRUITS.forEach(f => {
      const img = new Image();
      img.src = `assets/svg/${f.svg}`;
      this.fruitImages[f.name] = img;
    });
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      // Audio permission unlock on first press
      sounds.init();

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.handleDirectionInput('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        this.handleDirectionInput('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        this.handleDirectionInput('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        this.handleDirectionInput('RIGHT');
      } else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this.togglePause();
      }
    });
  }

  handleDirectionInput(dirName) {
    sounds.init();
    if (this.state === GAME_STATES.READY) {
      this.startGame();
    } else if (this.state === GAME_STATES.PLAYING) {
      this.pacman.setDirection(DIRECTIONS[dirName]);
    }
  }

  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.state = GAME_STATES.PAUSED;
      this.ui.showBanner('PAUSED', 'Press P, Space, or Resume to continue', 'RESUME', () => {
        this.state = GAME_STATES.PLAYING;
      });
    } else if (this.state === GAME_STATES.PAUSED) {
      this.ui.hideBanner();
      this.state = GAME_STATES.PLAYING;
    }
  }

  start() {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.collectedFruits = [];
    this.pelletsEatenThisLevel = 0;
    this.hasAwardedBonusLife = false;
    this.maze.reset();
    this.pacman.reset();
    this.ghostManager.reset();
    this.bonusFruit = null;

    this.state = GAME_STATES.READY;
    this.ui.updateHUD(this.score, this.highScore, this.level, this.lives, this.collectedFruits);

    this.ui.showBanner('READY!', 'PRESS ANY ARROW OR START BUTTON', 'START GAME', () => {
      this.startGame();
    });

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  startGame() {
    this.ui.hideBanner();
    this.state = GAME_STATES.PLAYING;
    sounds.playStartJingle();
  }

  resetPositions() {
    this.pacman.reset();
    this.ghostManager.reset();
  }

  getCurrentFruitConfig() {
    const fruitIdx = Math.min(this.level - 1, SCORES.FRUITS.length - 1);
    return SCORES.FRUITS[fruitIdx];
  }

  spawnBonusFruit() {
    const fruitConfig = this.getCurrentFruitConfig();
    this.bonusFruit = {
      config: fruitConfig,
      x: 13.5,
      y: 17,
      timer: 10000, // available for 10 seconds
      image: this.fruitImages[fruitConfig.name]
    };
  }

  checkFruitCollision() {
    if (!this.bonusFruit) return;
    const dx = this.pacman.x - this.bonusFruit.x;
    const dy = this.pacman.y - this.bonusFruit.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < 0.64) {
      const pts = this.bonusFruit.config.points;
      this.addScore(pts);
      sounds.playFruit();

      this.ui.addFloatingText(`+${pts}`, (this.bonusFruit.x + 0.5) * TILE_SIZE, (this.bonusFruit.y + 0.5) * TILE_SIZE, '#FFD700');

      if (!this.collectedFruits.some(f => f.name === this.bonusFruit.config.name)) {
        this.collectedFruits.push(this.bonusFruit.config);
      }
      this.bonusFruit = null;
    }
  }

  checkGhostCollisions() {
    const pacPx = (this.pacman.x + 0.5) * TILE_SIZE;
    const pacPy = (this.pacman.y + 0.5) * TILE_SIZE;

    for (const ghost of this.ghostManager.ghosts) {
      if (ghost.mode === GHOST_MODES.HOUSE || ghost.mode === GHOST_MODES.EATEN) continue;

      const gPx = (ghost.x + 0.5) * TILE_SIZE;
      const gPy = (ghost.y + 0.5) * TILE_SIZE;
      const dist = Math.hypot(pacPx - gPx, pacPy - gPy);

      if (dist < TILE_SIZE * 0.8) {
        if (ghost.mode === GHOST_MODES.FRIGHTENED) {
          // Eat Ghost!
          ghost.mode = GHOST_MODES.EATEN;
          this.ghostManager.ghostsEatenInSequence++;
          const multiplier = Math.min(8, Math.pow(2, this.ghostManager.ghostsEatenInSequence - 1));
          const points = SCORES.GHOST_BASE * multiplier; // 200, 400, 800, 1600

          this.addScore(points);
          sounds.playGhostEat();

          this.ui.addFloatingText(`+${points}`, gPx, gPy, '#00ffff');

          // Pause briefly for dramatic effect
          this.state = GAME_STATES.GHOST_EATEN;
          this.stateTimer = 550; // 0.55s pause
          return;
        } else {
          // Pacman caught by ghost!
          this.handlePacmanDeath();
          return;
        }
      }
    }
  }

  handlePacmanDeath() {
    this.state = GAME_STATES.PACMAN_DYING;
    this.pacman.isDying = true;
    this.stateTimer = 1600;
    sounds.playDeath();
  }

  addScore(pts) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('pacman_high_score', this.highScore.toString());
    }

    // Award extra life at 10,000 points
    if (this.score >= 10000 && !this.hasAwardedBonusLife) {
      this.hasAwardedBonusLife = true;
      this.lives++;
      sounds.playExtraLife();
      this.ui.addFloatingText('EXTRA LIFE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#00ff88');
    }

    this.ui.updateHUD(this.score, this.highScore, this.level, this.lives, this.collectedFruits);
  }

  levelClear() {
    this.state = GAME_STATES.LEVEL_CLEAR;
    this.stateTimer = 2200;
    this.maze.levelClearFlashing = true;
    sounds.playLevelClear();
  }

  advanceToNextLevel() {
    this.level++;
    this.pelletsEatenThisLevel = 0;
    this.bonusFruit = null;
    this.maze.reset();
    this.resetPositions();

    // Scale difficulty
    this.pacman.baseSpeed = Math.min(6.2, 4.8 + this.level * 0.15);
    this.ghostManager.ghosts.forEach(g => {
      g.baseSpeed = Math.min(6.0, 4.2 + this.level * 0.15);
    });

    this.state = GAME_STATES.READY;
    this.ui.updateHUD(this.score, this.highScore, this.level, this.lives, this.collectedFruits);
    this.ui.showBanner(`LEVEL ${this.level}`, 'GET READY!', 'CONTINUE', () => {
      this.startGame();
    });
  }

  gameOver() {
    this.state = GAME_STATES.GAME_OVER;
    this.saveGameStats();

    this.ui.showBanner(
      'GAME OVER',
      `Final Score: ${this.score} pts • Level ${this.level}`,
      'PLAY AGAIN',
      () => {
        this.start();
      }
    );
  }

  saveGameStats() {
    const history = JSON.parse(localStorage.getItem('pacman_history') || '[]');
    history.unshift({
      date: new Date().toLocaleDateString(),
      score: this.score,
      level: this.level
    });
    localStorage.setItem('pacman_history', JSON.stringify(history.slice(0, 15)));

    const gamesPlayed = parseInt(localStorage.getItem('pacman_games_played') || '0', 10) + 1;
    localStorage.setItem('pacman_games_played', gamesPlayed.toString());
  }

  update(dt) {
    this.ui.update(dt);
    this.maze.update(dt);

    if (this.state === GAME_STATES.GHOST_EATEN) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = GAME_STATES.PLAYING;
      }
      return;
    }

    if (this.state === GAME_STATES.PACMAN_DYING) {
      this.pacman.update(dt);
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.lives--;
        this.ui.updateHUD(this.score, this.highScore, this.level, this.lives, this.collectedFruits);

        if (this.lives <= 0) {
          this.gameOver();
        } else {
          this.resetPositions();
          this.state = GAME_STATES.PLAYING;
        }
      }
      return;
    }

    if (this.state === GAME_STATES.LEVEL_CLEAR) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.advanceToNextLevel();
      }
      return;
    }

    if (this.state !== GAME_STATES.PLAYING) return;

    // 1. Update Pacman
    this.pacman.update(dt);

    // 2. Eat pellets
    const pacTile = this.pacman.getTile();
    const eaten = this.maze.eatTile(pacTile.x, pacTile.y);
    if (eaten === 2) {
      this.addScore(SCORES.PELLET);
      sounds.playWaka();
      this.pelletsEatenThisLevel++;

      // Fruit spawn at 70 and 170 pellets
      if (this.pelletsEatenThisLevel === 70 || this.pelletsEatenThisLevel === 170) {
        this.spawnBonusFruit();
      }
    } else if (eaten === 3) {
      this.addScore(SCORES.ENERGIZER);
      sounds.playEnergizer();
      this.pelletsEatenThisLevel++;

      // Frighten ghosts (frightened duration scales down with level)
      const duration = Math.max(3000, 7500 - this.level * 400);
      this.ghostManager.triggerEnergizer(duration);
    }

    // Check level clear
    if (this.maze.pelletsRemaining <= 0) {
      this.levelClear();
      return;
    }

    // 3. Update Fruit
    if (this.bonusFruit) {
      this.bonusFruit.timer -= dt;
      if (this.bonusFruit.timer <= 0) {
        this.bonusFruit = null;
      } else {
        this.checkFruitCollision();
      }
    }

    // 4. Update Ghosts
    this.ghostManager.update(dt);

    // 5. Ghost Collisions
    this.checkGhostCollisions();
  }

  render() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Maze background & walls
    this.maze.render(this.ctx, this.currentTheme);

    // 2. Bonus fruit if active
    if (this.bonusFruit) {
      const px = (this.bonusFruit.x + 0.5) * TILE_SIZE;
      const py = (this.bonusFruit.y + 0.5) * TILE_SIZE;
      const size = TILE_SIZE * 1.3;

      if (this.bonusFruit.image && this.bonusFruit.image.complete) {
        this.ctx.drawImage(this.bonusFruit.image, px - size / 2, py - size / 2, size, size);
      } else {
        // Fallback fruit circle
        this.ctx.fillStyle = '#ff0033';
        this.ctx.beginPath();
        this.ctx.arc(px, py, TILE_SIZE * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 3. Pac-Man
    this.pacman.render(this.ctx);

    // 4. Ghosts
    if (this.state !== GAME_STATES.PACMAN_DYING) {
      this.ghostManager.render(this.ctx);
    }

    // 5. Floating text popups
    this.ui.renderFloatingTexts(this.ctx);
  }

  gameLoop(currentTime) {
    const dt = Math.min(100, currentTime - this.lastTime);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}
