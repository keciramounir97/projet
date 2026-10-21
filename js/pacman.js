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
    this.x = this.startX; // in tile units
    this.y = this.startY;
    this.currentDirection = DIRECTIONS.NONE;
    this.nextDirection = DIRECTIONS.NONE;
    this.baseSpeed = 4.8; // tiles per second
    this.speed = this.baseSpeed;
    this.mouthAngle = 0.2;
    this.mouthDir = 1;
    this.isDying = false;
    this.deathProgress = 0; // 0 to 1
    this.radius = TILE_SIZE * 0.75;
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.currentDirection = DIRECTIONS.NONE;
    this.nextDirection = DIRECTIONS.NONE;
    this.speed = this.baseSpeed;
    this.mouthAngle = 0.2;
    this.mouthDir = 1;
    this.isDying = false;
    this.deathProgress = 0;
  }

  setDirection(newDir) {
    // If reversing current direction, allow immediately
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
    this.nextDirection = newDir;
  }

  canMove(direction) {
    if (direction === DIRECTIONS.NONE) return false;
    const nextTileX = Math.floor(this.x + direction.x * 0.55);
    const nextTileY = Math.floor(this.y + direction.y * 0.55);
    return this.maze.isPassableForPacman(nextTileX, nextTileY);
  }

  update(dt) {
    if (this.isDying) {
      this.deathProgress += dt / 1200; // ~1.2s death animation
      if (this.deathProgress > 1) this.deathProgress = 1;
      return;
    }

    // Try buffered direction if aligned to tile center
    if (this.nextDirection !== DIRECTIONS.NONE && this.nextDirection !== this.currentDirection) {
      const isAlignedX = Math.abs((this.x % 1) - 0.5) < 0.2 || (this.nextDirection.x !== 0);
      const isAlignedY = Math.abs((this.y % 1) - 0.5) < 0.2 || (this.nextDirection.y !== 0);

      // Check if target tile in nextDirection is passable
      const checkX = Math.round(this.x) + this.nextDirection.x;
      const checkY = Math.round(this.y) + this.nextDirection.y;

      if (this.maze.isPassableForPacman(checkX, checkY)) {
        // Snap to center when turning corner
        if (this.nextDirection.y !== 0 && this.currentDirection.x !== 0) {
          this.x = Math.round(this.x);
        } else if (this.nextDirection.x !== 0 && this.currentDirection.y !== 0) {
          this.y = Math.round(this.y);
        }
        this.currentDirection = this.nextDirection;
        this.nextDirection = DIRECTIONS.NONE;
      }
    }

    // Move in current direction
    if (this.currentDirection !== DIRECTIONS.NONE) {
      const step = (this.speed * dt) / 1000;
      const targetTileX = Math.floor(this.x + this.currentDirection.x * 0.52);
      const targetTileY = Math.floor(this.y + this.currentDirection.y * 0.52);

      if (this.maze.isPassableForPacman(targetTileX, targetTileY)) {
        this.x += this.currentDirection.x * step;
        this.y += this.currentDirection.y * step;

        // Tunnel wrapping
        if (this.x < -0.5) {
          this.x = MAP_COLS - 0.5;
        } else if (this.x >= MAP_COLS + 0.5) {
          this.x = -0.5;
        }

        // Animate mouth when moving
        this.mouthAngle += this.mouthDir * (dt / 100);
        if (this.mouthAngle > 0.32) {
          this.mouthAngle = 0.32;
          this.mouthDir = -1;
        } else if (this.mouthAngle < 0.02) {
          this.mouthAngle = 0.02;
          this.mouthDir = 1;
        }
      } else {
        // Hit wall: snap to grid center
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.currentDirection = DIRECTIONS.NONE;
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
      // Pacman death animation: mouth opens all the way
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
        // Disappearing pop sparkle
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

    // Normal Pac-Man drawing
    let rotation = 0;
    if (this.currentDirection === DIRECTIONS.RIGHT) rotation = 0;
    else if (this.currentDirection === DIRECTIONS.DOWN) rotation = Math.PI / 2;
    else if (this.currentDirection === DIRECTIONS.LEFT) rotation = Math.PI;
    else if (this.currentDirection === DIRECTIONS.UP) rotation = -Math.PI / 2;

    ctx.rotate(rotation);

    // Glowing arcade Pac-Man body
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
