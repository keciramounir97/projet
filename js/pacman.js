/**
 * Pac-Man 2D Arcade - Pacman Entity Engine
 * Handles smooth movement, direction buffering, cornering, mouth animation, and death sequence.
 */

import { TILE_SIZE, MAP_COLS, MAP_ROWS, DIRECTIONS } from './constants.js';

export class Pacman {
  constructor(maze) {
    this.maze = maze;
    this.startX = 13.5;
    this.startY = 23;
    this.x = 13.5;
    this.y = 23;
    this.currentDirection = DIRECTIONS.NONE;
    this.nextDirection = DIRECTIONS.NONE;
    this.baseSpeed = 5.0; // tiles per second
    this.speed = this.baseSpeed;
    this.mouthAngle = 0.2;
    this.mouthDir = 1;
    this.isDying = false;
    this.deathProgress = 0;
  }

  reset() {
    this.x = 13.5;
    this.y = 23;
    this.currentDirection = DIRECTIONS.NONE;
    this.nextDirection = DIRECTIONS.NONE;
    this.speed = this.baseSpeed;
    this.mouthAngle = 0.2;
    this.mouthDir = 1;
    this.isDying = false;
    this.deathProgress = 0;
  }

  setDirection(newDir) {
    if (!newDir || newDir === DIRECTIONS.NONE) return;

    // Instant 180-degree turn
    if (
      (this.currentDirection === DIRECTIONS.LEFT && newDir === DIRECTIONS.RIGHT) ||
      (this.currentDirection === DIRECTIONS.RIGHT && newDir === DIRECTIONS.LEFT) ||
      (this.currentDirection === DIRECTIONS.UP && newDir === DIRECTIONS.DOWN) ||
      (this.currentDirection === DIRECTIONS.DOWN && newDir === DIRECTIONS.UP)
    ) {
      this.currentDirection = newDir;
      this.nextDirection = DIRECTIONS.NONE;
      return;
    }

    // If currently stopped, try to start moving in newDir immediately
    if (this.currentDirection === DIRECTIONS.NONE) {
      const curTileX = Math.round(this.x);
      const curTileY = Math.round(this.y);
      if (this.maze.isPassableForPacman(curTileX + newDir.x, curTileY + newDir.y)) {
        this.x = curTileX;
        this.y = curTileY;
        this.currentDirection = newDir;
        this.nextDirection = DIRECTIONS.NONE;
        return;
      }
    }

    this.nextDirection = newDir;
  }

  update(dt) {
    if (this.isDying) {
      this.deathProgress += dt / 1300;
      if (this.deathProgress > 1) this.deathProgress = 1;
      return;
    }

    const step = (this.speed * dt) / 1000;

    // 1. Try turning to buffered nextDirection when approaching or passing an intersection
    if (this.nextDirection !== DIRECTIONS.NONE && this.nextDirection !== this.currentDirection) {
      const targetTileX = Math.round(this.x);
      const targetTileY = Math.round(this.y);

      // Check distance to integer tile center
      const distToCenter = Math.hypot(this.x - targetTileX, this.y - targetTileY);

      if (distToCenter <= step * 1.5 + 0.12) {
        const canTurn = this.maze.isPassableForPacman(
          targetTileX + this.nextDirection.x,
          targetTileY + this.nextDirection.y
        );

        if (canTurn) {
          this.x = targetTileX;
          this.y = targetTileY;
          this.currentDirection = this.nextDirection;
          this.nextDirection = DIRECTIONS.NONE;
        }
      }
    }

    // 2. Move in currentDirection
    if (this.currentDirection !== DIRECTIONS.NONE) {
      const nextX = this.x + this.currentDirection.x * step;
      const nextY = this.y + this.currentDirection.y * step;

      // Handle horizontal movement
      if (this.currentDirection.x !== 0) {
        this.y = Math.round(this.y); // Lock to row
        const targetTileX = this.currentDirection.x > 0 ? Math.floor(nextX) + 1 : Math.ceil(nextX) - 1;

        // Check tunnel wrap at row 14
        if (this.y === 14) {
          this.x = nextX;
          if (this.x < -0.5) this.x = MAP_COLS - 0.5;
          else if (this.x > MAP_COLS - 0.5) this.x = -0.5;
        } else {
          // Check wall obstacle ahead
          if (this.maze.isPassableForPacman(targetTileX, this.y)) {
            this.x = nextX;
          } else {
            // Cannot enter target tile: stop right at current tile center
            const curCenter = Math.round(this.x);
            if ((this.currentDirection.x > 0 && nextX >= curCenter) ||
                (this.currentDirection.x < 0 && nextX <= curCenter)) {
              this.x = curCenter;
              this.currentDirection = DIRECTIONS.NONE;
            } else {
              this.x = nextX;
            }
          }
        }
      }

      // Handle vertical movement
      if (this.currentDirection.y !== 0) {
        this.x = Math.round(this.x); // Lock to column
        const targetTileY = this.currentDirection.y > 0 ? Math.floor(nextY) + 1 : Math.ceil(nextY) - 1;

        if (this.maze.isPassableForPacman(this.x, targetTileY)) {
          this.y = nextY;
        } else {
          const curCenter = Math.round(this.y);
          if ((this.currentDirection.y > 0 && nextY >= curCenter) ||
              (this.currentDirection.y < 0 && nextY <= curCenter)) {
            this.y = curCenter;
            this.currentDirection = DIRECTIONS.NONE;
          } else {
            this.y = nextY;
          }
        }
      }

      // 3. Animate mouth when moving
      this.mouthAngle += this.mouthDir * (dt / 85);
      if (this.mouthAngle > 0.32) {
        this.mouthAngle = 0.32;
        this.mouthDir = -1;
      } else if (this.mouthAngle < 0.02) {
        this.mouthAngle = 0.02;
        this.mouthDir = 1;
      }
    }
  }

  getTile() {
    return {
      x: Math.round(this.x),
      y: Math.round(this.y)
    };
  }

  render(ctx) {
    const px = (this.x + 0.5) * TILE_SIZE;
    const py = (this.y + 0.5) * TILE_SIZE;
    const radius = TILE_SIZE * 0.65;

    ctx.save();
    ctx.translate(px, py);

    if (this.isDying) {
      ctx.fillStyle = '#FFFF00';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 8;

      const deathAngle = this.deathProgress * Math.PI;
      if (this.deathProgress < 0.9) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, deathAngle - Math.PI / 2, Math.PI * 2 - deathAngle - Math.PI / 2, false);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        const popR = radius * (1 - (this.deathProgress - 0.9) * 10);
        if (popR > 0) {
          ctx.beginPath();
          ctx.arc(0, 0, popR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return;
    }

    let rotation = 0;
    if (this.currentDirection === DIRECTIONS.RIGHT) rotation = 0;
    else if (this.currentDirection === DIRECTIONS.DOWN) rotation = Math.PI / 2;
    else if (this.currentDirection === DIRECTIONS.LEFT) rotation = Math.PI;
    else if (this.currentDirection === DIRECTIONS.UP) rotation = -Math.PI / 2;

    ctx.rotate(rotation);

    // Glowing neon Pac-Man body
    ctx.fillStyle = '#FFFF00';
    ctx.shadowColor = 'rgba(255, 235, 59, 0.85)';
    ctx.shadowBlur = 10;

    const openAngle = this.mouthAngle * Math.PI;
    ctx.beginPath();
    ctx.arc(0, 0, radius, openAngle, Math.PI * 2 - openAngle, false);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Eye dot
    ctx.fillStyle = '#111122';
    ctx.beginPath();
    ctx.arc(radius * 0.15, -radius * 0.55, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
