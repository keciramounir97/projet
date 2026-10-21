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
    this.baseSpeed = 4.2;
    this.speed = this.baseSpeed;

    this.houseTimer = 0;
    this.releaseDelay = 0; // Staggered release: Blinky 0, Pinky 1s, Inky 4s, Clyde 7s
    if (typeKey === 'BLINKY') this.releaseDelay = 0;
    else if (typeKey === 'PINKY') this.releaseDelay = 1000;
    else if (typeKey === 'INKY') this.releaseDelay = 3500;
    else if (typeKey === 'CLYDE') this.releaseDelay = 6500;

    this.frightenedTimer = 0;
    this.frightenedDuration = 7000;

    this.wobble = 0;
    this.wobbleDir = 1;
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
      // Blinky starts just outside the house door
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
    this.speed = this.baseSpeed * 0.6; // slower when frightened
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
    if (this.mode === GHOST_MODES.EATEN) {
      // Return to ghost house door
      return { x: 13.5, y: 11 };
    }

    if (this.mode === GHOST_MODES.SCATTER) {
      return this.config.scatterTarget;
    }

    if (this.mode === GHOST_MODES.FRIGHTENED) {
      // Pseudo-random wander or move away from pacman
      return {
        x: Math.floor(Math.random() * MAP_COLS),
        y: Math.floor(Math.random() * MAP_ROWS)
      };
    }

    // CHASE MODE AI PER GHOST:
    const pacTile = this.pacman.getTile();
    const pacDir = this.pacman.currentDirection;

    switch (this.typeKey) {
      case 'BLINKY':
        // Direct relentless chase
        return { x: pacTile.x, y: pacTile.y };

      case 'PINKY':
        // Ambush 4 tiles ahead of Pac-Man
        return {
          x: pacTile.x + pacDir.x * 4,
          y: pacTile.y + pacDir.y * 4
        };

      case 'INKY': {
        // Look 2 tiles ahead of Pacman, vector from Blinky doubled
        const pivotX = pacTile.x + pacDir.x * 2;
        const pivotY = pacTile.y + pacDir.y * 2;
        const blinkyPos = this.getBlinkyPos();
        const vecX = pivotX - blinkyPos.x;
        const vecY = pivotY - blinkyPos.y;
        return {
          x: pivotX + vecX,
          y: pivotY + vecY
        };
      }

      case 'CLYDE': {
        // Distance check: if distance > 8 tiles, chase; if <= 8 tiles, shy away to scatter corner
        const dx = this.x - pacTile.x;
        const dy = this.y - pacTile.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > 64) {
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
    // Skirt wave
    this.wobble += dt / 80;

    // House bouncing and exit
    if (this.mode === GHOST_MODES.HOUSE) {
      this.houseTimer += dt;
      // Bob up and down inside house
      this.y += Math.sin(this.houseTimer / 150) * 0.02;

      if (this.houseTimer >= this.releaseDelay) {
        // Move towards center col (13.5) then up through door (row 11)
        if (Math.abs(this.x - 13.5) > 0.1) {
          this.x += (13.5 - this.x) * (dt / 200);
        } else {
          this.x = 13.5;
          this.y -= (dt / 400);
          if (this.y <= 11) {
            this.y = 11;
            this.mode = globalMode === GHOST_MODES.FRIGHTENED ? GHOST_MODES.FRIGHTENED : globalMode;
            this.direction = DIRECTIONS.LEFT;
          }
        }
      }
      return;
    }

    // Frightened mode timer
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      this.frightenedTimer -= dt;
      if (this.frightenedTimer <= 0) {
        this.mode = globalMode;
        this.speed = this.baseSpeed;
      }
    } else if (this.mode !== GHOST_MODES.EATEN) {
      this.mode = globalMode;
      this.speed = this.baseSpeed;
    }

    // Eaten mode (eyes returning to ghost house)
    if (this.mode === GHOST_MODES.EATEN) {
      this.speed = this.baseSpeed * 2.2; // Fast eyes returning home
      if (Math.abs(this.x - 13.5) < 0.3 && Math.abs(this.y - 11) < 0.5) {
        // Entered house, respawn!
        this.x = 13.5;
        this.y = 14;
        this.mode = GHOST_MODES.HOUSE;
        this.houseTimer = this.releaseDelay - 600; // brief delay before re-exiting
        this.direction = DIRECTIONS.UP;
        this.speed = this.baseSpeed;
        return;
      }
    }

    // Move in current direction
    const step = (this.speed * dt) / 1000;
    this.x += this.direction.x * step;
    this.y += this.direction.y * step;

    // Wrap around side tunnel
    if (this.x < -0.5) {
      this.x = MAP_COLS - 0.5;
    } else if (this.x >= MAP_COLS + 0.5) {
      this.x = -0.5;
    }

    // At tile centers, choose best next direction
    const nearCenterX = Math.abs((this.x % 1) - 0.5) < step;
    const nearCenterY = Math.abs((this.y % 1) - 0.5) < step;

    if (nearCenterX && nearCenterY) {
      this.chooseNextDirection();
    }
  }

  chooseNextDirection() {
    const curTileX = Math.round(this.x);
    const curTileY = Math.round(this.y);
    const target = this.calculateTarget();
    const oppositeDir = this.getOppositeDirection(this.direction);

    // Standard arcade ghost test order: UP, LEFT, DOWN, RIGHT
    const candidateDirs = [DIRECTIONS.UP, DIRECTIONS.LEFT, DIRECTIONS.DOWN, DIRECTIONS.RIGHT];
    let bestDir = null;
    let minDistanceSq = Infinity;

    for (const dir of candidateDirs) {
      // Ghosts cannot reverse 180 degrees at intersections
      if (dir === oppositeDir && this.mode !== GHOST_MODES.EATEN) continue;

      const nextTileX = curTileX + dir.x;
      const nextTileY = curTileY + dir.y;

      if (this.maze.isPassableForGhost(nextTileX, nextTileY, this.mode === GHOST_MODES.EATEN)) {
        // Calculate squared euclidean distance to target
        const dx = nextTileX - target.x;
        const dy = nextTileY - target.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          bestDir = dir;
        }
      }
    }

    if (bestDir) {
      this.direction = bestDir;
      this.x = curTileX;
      this.y = curTileY;
    }
  }

  render(ctx) {
    const px = (this.x + 0.5) * TILE_SIZE;
    const py = (this.y + 0.5) * TILE_SIZE;
    const radius = TILE_SIZE * 0.7;

    ctx.save();
    ctx.translate(px, py);

    // 1. EATEN MODE: Only eyes
    if (this.mode === GHOST_MODES.EATEN) {
      this.renderEyes(ctx, radius);
      ctx.restore();
      return;
    }

    // 2. FRIGHTENED MODE
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
    // Rounded top head
    ctx.arc(0, -radius * 0.15, radius, Math.PI, 0, false);
    // Right side
    ctx.lineTo(radius, radius * 0.85);

    // Wavy skirt feet (3 waves wiggling with wobble)
    const waveOffset = Math.sin(this.wobble) * 2;
    ctx.lineTo(radius * 0.66, radius * 0.65 + waveOffset);
    ctx.lineTo(radius * 0.33, radius * 0.85);
    ctx.lineTo(0, radius * 0.65 - waveOffset);
    ctx.lineTo(-radius * 0.33, radius * 0.85);
    ctx.lineTo(-radius * 0.66, radius * 0.65 + waveOffset);
    ctx.lineTo(-radius, radius * 0.85);

    // Left side up
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  renderEyes(ctx, radius) {
    // Eye whites
    ctx.fillStyle = '#FFFFFF';
    const eyeOffsetX = radius * 0.35;
    const eyeOffsetY = -radius * 0.15;
    const eyeRadiusX = radius * 0.28;
    const eyeRadiusY = radius * 0.35;

    ctx.beginPath();
    ctx.ellipse(-eyeOffsetX, eyeOffsetY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeOffsetX, eyeOffsetY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil offset based on ghost's moving direction
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

    // Classic arcade Scatter/Chase schedule (times in milliseconds)
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

    // Update all ghosts
    this.ghosts.forEach(g => g.update(dt, this.globalMode));
  }

  render(ctx) {
    this.ghosts.forEach(g => g.render(ctx));
  }
}
