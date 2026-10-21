/**
 * Pac-Man 2D Arcade - Ghost AI Engine
 * Blinky, Pinky, Inky, Clyde with authentic targeting logic, modes, and animations.
 */

import { TILE_SIZE, MAP_COLS, MAP_ROWS, DIRECTIONS, GHOST_MODES, GHOST_CONFIG } from './constants.js';

export class Ghost {
  constructor(typeKey, maze, pacman, getBlinkyPos) {
    this.typeKey = typeKey;
    this.config = GHOST_CONFIG[typeKey];
    this.maze = maze;
    this.pacman = pacman;
    this.getBlinkyPos = getBlinkyPos;

    this.startX = this.config.home.x;
    this.startY = this.config.home.y;
    this.x = this.startX;
    this.y = this.startY;

    this.direction = DIRECTIONS.UP;
    this.mode = GHOST_MODES.HOUSE;
    this.baseSpeed = 4.4;
    this.speed = this.baseSpeed;

    this.houseTimer = 0;
    // Staggered release: Blinky 0, Pinky 1.2s, Inky 3.5s, Clyde 6s
    if (typeKey === 'BLINKY') this.releaseDelay = 0;
    else if (typeKey === 'PINKY') this.releaseDelay = 1200;
    else if (typeKey === 'INKY') this.releaseDelay = 3500;
    else if (typeKey === 'CLYDE') this.releaseDelay = 6000;

    this.frightenedTimer = 0;
    this.frightenedDuration = 7000;
    this.wobble = 0;
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.direction = DIRECTIONS.UP;
    this.mode = GHOST_MODES.HOUSE;
    this.speed = this.baseSpeed;
    this.houseTimer = 0;
    this.frightenedTimer = 0;

    if (this.typeKey === 'BLINKY') {
      // Blinky starts outside the house above the door
      this.x = 13.5;
      this.y = 11;
      this.direction = DIRECTIONS.LEFT;
      this.mode = GHOST_MODES.SCATTER;
    }
  }

  setFrightened(duration = 7000) {
    if (this.mode === GHOST_MODES.EATEN || this.mode === GHOST_MODES.HOUSE) return;
    this.mode = GHOST_MODES.FRIGHTENED;
    this.frightenedTimer = duration;
    this.frightenedDuration = duration;
    this.reverseDirection();
  }

  reverseDirection() {
    if (this.direction === DIRECTIONS.UP) this.direction = DIRECTIONS.DOWN;
    else if (this.direction === DIRECTIONS.DOWN) this.direction = DIRECTIONS.UP;
    else if (this.direction === DIRECTIONS.LEFT) this.direction = DIRECTIONS.RIGHT;
    else if (this.direction === DIRECTIONS.RIGHT) this.direction = DIRECTIONS.LEFT;
  }

  getOppositeDirection(dir) {
    if (dir === DIRECTIONS.UP) return DIRECTIONS.DOWN;
    if (dir === DIRECTIONS.DOWN) return DIRECTIONS.UP;
    if (dir === DIRECTIONS.LEFT) return DIRECTIONS.RIGHT;
    if (dir === DIRECTIONS.RIGHT) return DIRECTIONS.LEFT;
    return DIRECTIONS.NONE;
  }

  calculateTarget() {
    // 1. EATEN MODE: Target house entrance door
    if (this.mode === GHOST_MODES.EATEN) {
      return { x: 13.5, y: 11 };
    }

    // 2. SCATTER MODE: Target designated home corners
    if (this.mode === GHOST_MODES.SCATTER) {
      return this.config.scatterTarget;
    }

    // 3. FRIGHTENED MODE: Target random or wander
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      return {
        x: Math.floor(Math.random() * MAP_COLS),
        y: Math.floor(Math.random() * MAP_ROWS)
      };
    }

    // 4. CHASE MODE: Unique AI per Ghost
    const pacTile = this.pacman.getTile();
    const pacDir = this.pacman.currentDirection;

    switch (this.typeKey) {
      case 'BLINKY':
        // Direct relentless chase to Pac-Man's exact tile
        return { x: pacTile.x, y: pacTile.y };

      case 'PINKY':
        // Ambush: targets 4 tiles ahead of Pac-Man's direction
        return {
          x: pacTile.x + pacDir.x * 4,
          y: pacTile.y + pacDir.y * 4
        };

      case 'INKY': {
        // Flank: 2 tiles ahead of Pac-Man, vector doubled from Blinky
        const pivotX = pacTile.x + pacDir.x * 2;
        const pivotY = pacTile.y + pacDir.y * 2;
        const bPos = this.getBlinkyPos();
        const vecX = pivotX - bPos.x;
        const vecY = pivotY - bPos.y;
        return {
          x: pivotX + vecX,
          y: pivotY + vecY
        };
      }

      case 'CLYDE': {
        // Distance check: if distance > 8 tiles, chase; if <= 8 tiles, shy away to scatter corner
        const dist = Math.hypot(this.x - pacTile.x, this.y - pacTile.y);
        if (dist > 8) {
          return { x: pacTile.x, y: pacTile.y };
        } else {
          return this.config.scatterTarget;
        }
      }

      default:
        return { x: pacTile.x, y: pacTile.y };
    }
  }

  update(dt, globalMode) {
    this.wobble += dt / 80;

    // A. Handle Ghost Inside the House
    if (this.mode === GHOST_MODES.HOUSE) {
      this.houseTimer += dt;
      // Bob up and down inside
      this.y += Math.sin(this.houseTimer / 160) * 0.015;

      if (this.houseTimer >= this.releaseDelay) {
        // Step 1: Center horizontally to 13.5
        if (Math.abs(this.x - 13.5) > 0.08) {
          this.x += (13.5 - this.x > 0 ? 1 : -1) * (dt / 300);
        } else {
          this.x = 13.5;
          // Step 2: Move up through door to row 11
          this.y -= (dt / 350);
          if (this.y <= 11) {
            this.y = 11;
            this.mode = globalMode;
            this.direction = DIRECTIONS.LEFT;
          }
        }
      }
      return;
    }

    // B. Handle Frightened Timer
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      this.frightenedTimer -= dt;
      if (this.frightenedTimer <= 0) {
        this.mode = globalMode;
      }
    } else if (this.mode !== GHOST_MODES.EATEN) {
      this.mode = globalMode;
    }

    // C. Adjust Ghost Speed based on state and location
    let currentSpeed = this.baseSpeed;
    if (this.mode === GHOST_MODES.EATEN) {
      currentSpeed = this.baseSpeed * 2.2; // Fast floating eyes
    } else if (this.mode === GHOST_MODES.FRIGHTENED) {
      currentSpeed = this.baseSpeed * 0.6; // Slow frightened ghost
    } else if (Math.round(this.y) === 14 && (this.x <= 5 || this.x >= 22)) {
      currentSpeed = this.baseSpeed * 0.5; // Tunnel slowdown
    }

    // D. Check if Eaten Eyes have returned to the house
    if (this.mode === GHOST_MODES.EATEN) {
      if (Math.abs(this.x - 13.5) < 0.4 && Math.abs(this.y - 11) < 0.4) {
        this.x = 13.5;
        this.y = 14;
        this.mode = GHOST_MODES.HOUSE;
        this.houseTimer = this.releaseDelay - 500;
        this.direction = DIRECTIONS.UP;
        return;
      }
    }

    // E. Tile-Based Intersection Movement
    let remainingStep = (currentSpeed * dt) / 1000;

    while (remainingStep > 0) {
      const dir = this.direction;
      let distToNextTile = 0;

      if (dir.x > 0) {
        const nextCenter = Math.floor(this.x) + 1;
        distToNextTile = nextCenter - this.x;
      } else if (dir.x < 0) {
        const nextCenter = Math.ceil(this.x) - 1;
        distToNextTile = this.x - nextCenter;
      } else if (dir.y > 0) {
        const nextCenter = Math.floor(this.y) + 1;
        distToNextTile = nextCenter - this.y;
      } else if (dir.y < 0) {
        const nextCenter = Math.ceil(this.y) - 1;
        distToNextTile = this.y - nextCenter;
      }

      if (distToNextTile <= 0) {
        distToNextTile = 1;
      }

      if (remainingStep >= distToNextTile) {
        // Move to the exact center of next tile
        this.x += dir.x * distToNextTile;
        this.y += dir.y * distToNextTile;
        remainingStep -= distToNextTile;

        // Snap coordinates
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        // Handle tunnel wrap
        if (this.y === 14) {
          if (this.x < -0.5) this.x = MAP_COLS - 0.5;
          else if (this.x > MAP_COLS - 0.5) this.x = -0.5;
        }

        // At this tile center, choose the next direction
        this.chooseNextDirection();
      } else {
        // Move remaining step
        this.x += dir.x * remainingStep;
        this.y += dir.y * remainingStep;
        remainingStep = 0;
      }
    }
  }

  chooseNextDirection() {
    const curX = Math.round(this.x);
    const curY = Math.round(this.y);
    const oppositeDir = this.getOppositeDirection(this.direction);
    const isEaten = (this.mode === GHOST_MODES.EATEN);

    // Standard arcade ghost decision order: UP, LEFT, DOWN, RIGHT
    const allDirs = [DIRECTIONS.UP, DIRECTIONS.LEFT, DIRECTIONS.DOWN, DIRECTIONS.RIGHT];
    const validDirs = [];

    for (const d of allDirs) {
      // Rule: Ghost cannot immediately reverse 180 degrees at intersections
      if (!isEaten && d === oppositeDir) continue;

      const nextTileX = curX + d.x;
      const nextTileY = curY + d.y;

      if (this.maze.isPassableForGhost(nextTileX, nextTileY, isEaten)) {
        validDirs.push(d);
      }
    }

    // Fallback if trapped in dead-end
    if (validDirs.length === 0) {
      if (this.maze.isPassableForGhost(curX + oppositeDir.x, curY + oppositeDir.y, isEaten)) {
        this.direction = oppositeDir;
      }
      return;
    }

    // If Frightened: choose pseudo-random direction among valid turns
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      const randIdx = Math.floor(Math.random() * validDirs.length);
      this.direction = validDirs[randIdx];
      return;
    }

    // If Chase / Scatter / Eaten: choose direction with minimal euclidean distance to target
    const target = this.calculateTarget();
    let bestDir = validDirs[0];
    let minDistanceSq = Infinity;

    for (const d of validDirs) {
      const testX = curX + d.x;
      const testY = curY + d.y;
      const dx = testX - target.x;
      const dy = testY - target.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        bestDir = d;
      }
    }

    this.direction = bestDir;
  }

  render(ctx) {
    const px = (this.x + 0.5) * TILE_SIZE;
    const py = (this.y + 0.5) * TILE_SIZE;
    const radius = TILE_SIZE * 0.7;

    ctx.save();
    ctx.translate(px, py);

    // 1. EATEN MODE: Render only eyes
    if (this.mode === GHOST_MODES.EATEN) {
      this.renderEyes(ctx, radius);
      ctx.restore();
      return;
    }

    // 2. FRIGHTENED MODE: Render blue/white ghost
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      const isFlashing = this.frightenedTimer < 2000 && Math.floor(this.frightenedTimer / 200) % 2 === 0;
      const ghostColor = isFlashing ? '#FFFFFF' : '#2121DE';
      const eyeColor = isFlashing ? '#FF2222' : '#FFAAAA';

      this.renderGhostBody(ctx, radius, ghostColor, isFlashing ? 'rgba(255,255,255,0.7)' : 'rgba(33,33,222,0.7)');

      // Scared eyes
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(-radius * 0.35, -radius * 0.1, radius * 0.15, 0, Math.PI * 2);
      ctx.arc(radius * 0.35, -radius * 0.1, radius * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Scared squiggly mouth
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const mouthY = radius * 0.38;
      ctx.moveTo(-radius * 0.5, mouthY);
      ctx.lineTo(-radius * 0.25, mouthY - 3);
      ctx.lineTo(0, mouthY);
      ctx.lineTo(radius * 0.25, mouthY - 3);
      ctx.lineTo(radius * 0.5, mouthY);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 3. NORMAL CHASE / SCATTER / HOUSE
    this.renderGhostBody(ctx, radius, this.config.color, this.config.glowColor);
    this.renderEyes(ctx, radius);

    ctx.restore();
  }

  renderGhostBody(ctx, radius, color, glow) {
    ctx.fillStyle = color;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.arc(0, -radius * 0.15, radius, Math.PI, 0, false);
    ctx.lineTo(radius, radius * 0.85);

    const waveOffset = Math.sin(this.wobble) * 2;
    ctx.lineTo(radius * 0.66, radius * 0.65 + waveOffset);
    ctx.lineTo(radius * 0.33, radius * 0.85);
    ctx.lineTo(0, radius * 0.65 - waveOffset);
    ctx.lineTo(-radius * 0.33, radius * 0.85);
    ctx.lineTo(-radius * 0.66, radius * 0.65 + waveOffset);
    ctx.lineTo(-radius, radius * 0.85);

    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  renderEyes(ctx, radius) {
    ctx.fillStyle = '#FFFFFF';
    const eyeOffsetX = radius * 0.35;
    const eyeOffsetY = -radius * 0.15;
    const eyeRadiusX = radius * 0.28;
    const eyeRadiusY = radius * 0.35;

    ctx.beginPath();
    ctx.ellipse(-eyeOffsetX, eyeOffsetY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeOffsetX, eyeOffsetY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    let pupX = 0;
    let pupY = 0;
    if (this.direction === DIRECTIONS.LEFT) pupX = -radius * 0.12;
    else if (this.direction === DIRECTIONS.RIGHT) pupX = radius * 0.12;
    else if (this.direction === DIRECTIONS.UP) pupY = -radius * 0.14;
    else if (this.direction === DIRECTIONS.DOWN) pupY = radius * 0.14;

    ctx.fillStyle = '#0000EE';
    ctx.beginPath();
    ctx.arc(-eyeOffsetX + pupX, eyeOffsetY + pupY, radius * 0.15, 0, Math.PI * 2);
    ctx.arc(eyeOffsetX + pupX, eyeOffsetY + pupY, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class GhostManager {
  constructor(maze, pacman) {
    this.maze = maze;
    this.pacman = pacman;
    this.ghosts = [];
    this.modeTimer = 0;
    this.globalMode = GHOST_MODES.SCATTER;
    this.modeCycleIndex = 0;
    this.ghostsEatenInSequence = 0;

    // Authentic arcade Scatter & Chase timetable (milliseconds)
    this.schedule = [
      { mode: GHOST_MODES.SCATTER, duration: 7000 },
      { mode: GHOST_MODES.CHASE, duration: 20000 },
      { mode: GHOST_MODES.SCATTER, duration: 7000 },
      { mode: GHOST_MODES.CHASE, duration: 20000 },
      { mode: GHOST_MODES.SCATTER, duration: 5000 },
      { mode: GHOST_MODES.CHASE, duration: 20000 },
      { mode: GHOST_MODES.SCATTER, duration: 5000 },
      { mode: GHOST_MODES.CHASE, duration: Infinity }
    ];

    this.init();
  }

  init() {
    const getBlinkyPos = () => {
      const b = this.ghosts.find(g => g.typeKey === 'BLINKY');
      return b ? { x: b.x, y: b.y } : { x: 13.5, y: 11 };
    };

    this.ghosts = [
      new Ghost('BLINKY', this.maze, this.pacman, getBlinkyPos),
      new Ghost('PINKY', this.maze, this.pacman, getBlinkyPos),
      new Ghost('INKY', this.maze, this.pacman, getBlinkyPos),
      new Ghost('CLYDE', this.maze, this.pacman, getBlinkyPos)
    ];
  }

  reset() {
    this.modeTimer = 0;
    this.modeCycleIndex = 0;
    this.globalMode = GHOST_MODES.SCATTER;
    this.ghostsEatenInSequence = 0;
    this.ghosts.forEach(g => g.reset());
  }

  triggerEnergizer(duration = 7000) {
    this.ghostsEatenInSequence = 0;
    this.ghosts.forEach(g => g.setFrightened(duration));
  }

  update(dt) {
    // Mode schedule progression
    if (this.modeCycleIndex < this.schedule.length) {
      const currentPhase = this.schedule[this.modeCycleIndex];
      this.modeTimer += dt;
      if (this.modeTimer >= currentPhase.duration) {
        this.modeTimer = 0;
        this.modeCycleIndex++;
        if (this.modeCycleIndex < this.schedule.length) {
          this.globalMode = this.schedule[this.modeCycleIndex].mode;
          // Reverse ghosts on mode change
          this.ghosts.forEach(g => {
            if (g.mode !== GHOST_MODES.FRIGHTENED && g.mode !== GHOST_MODES.EATEN && g.mode !== GHOST_MODES.HOUSE) {
              g.reverseDirection();
            }
          });
        }
      }
    }

    // Cruise Elroy speed boost for Blinky when pellets are low
    const blinky = this.ghosts.find(g => g.typeKey === 'BLINKY');
    if (blinky && blinky.mode !== GHOST_MODES.FRIGHTENED && blinky.mode !== GHOST_MODES.EATEN) {
      if (this.maze.pelletsRemaining < 10) {
        blinky.speed = blinky.baseSpeed * 1.2;
      } else if (this.maze.pelletsRemaining < 20) {
        blinky.speed = blinky.baseSpeed * 1.1;
      } else {
        blinky.speed = blinky.baseSpeed;
      }
    }

    // Update all ghosts
    this.ghosts.forEach(g => g.update(dt, this.globalMode));
  }

  render(ctx) {
    this.ghosts.forEach(g => g.render(ctx));
  }
}
