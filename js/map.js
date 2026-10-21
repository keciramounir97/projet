/**
 * Pac-Man 2D Arcade - Maze Map & Pellet Engine
 * Standard 28 cols x 31 rows classic arcade maze
 */

import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants.js';

// Tile definitions:
// 1 = Wall
// 2 = Pellet (small dot, 10 pts)
// 3 = Energizer (power pellet, 50 pts)
// 4 = Ghost House Door (passable only for eyes returning or ghosts exiting)
// 5 = Ghost House Interior (passable only when inside house or returning eyes)
// 6 = Fruit Spawn Location
// 7 = Tunnel Wrap Path
// 0 = Empty walkable space

export const ORIGINAL_MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,5,5,5,5,5,5,1,0,1,1,2,1,1,1,1,1,1],
  [7,7,7,7,7,7,2,0,0,0,1,5,5,5,5,5,5,1,0,0,0,2,7,7,7,7,7,7],
  [1,1,1,1,1,1,2,1,1,0,1,5,5,5,5,5,5,1,0,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,6,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

export class MazeMap {
  constructor() {
    this.grid = [];
    this.totalPellets = 0;
    this.pelletsRemaining = 0;
    this.energizerFlash = true;
    this.flashTimer = 0;
    this.levelClearFlashing = false;
    this.reset();
  }

  reset() {
    this.grid = ORIGINAL_MAZE.map(row => [...row]);
    this.totalPellets = 0;
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (this.grid[r][c] === 2 || this.grid[r][c] === 3) {
          this.totalPellets++;
        }
      }
    }
    this.pelletsRemaining = this.totalPellets;
    this.levelClearFlashing = false;
  }

  isWall(x, y) {
    if (x < 0 || x >= MAP_COLS || y < 0 || y >= MAP_ROWS) return false;
    return this.grid[y][x] === 1;
  }

  isPassableForPacman(x, y) {
    // Tunnel side wrap
    if (y === 14 && (x < 0 || x >= MAP_COLS)) return true;
    if (x < 0 || x >= MAP_COLS || y < 0 || y >= MAP_ROWS) return false;
    const tile = this.grid[y][x];
    // Pacman cannot enter walls (1), ghost door (4), or ghost house interior (5)
    return tile !== 1 && tile !== 4 && tile !== 5;
  }

  isPassableForGhost(x, y, isEaten = false) {
    // Tunnel side wrap
    if (y === 14 && (x < 0 || x >= MAP_COLS)) return true;
    if (x < 0 || x >= MAP_COLS || y < 0 || y >= MAP_ROWS) return false;
    const tile = this.grid[y][x];
    if (tile === 1) return false; // Walls never passable
    if (tile === 4) return isEaten; // Ghost door ONLY passable when eyes returning home
    if (tile === 5) return isEaten; // House interior ONLY passable when returning home
    return true;
  }

  eatTile(tileX, tileY) {
    if (tileX < 0 || tileX >= MAP_COLS || tileY < 0 || tileY >= MAP_ROWS) return 0;
    const tile = this.grid[tileY][tileX];
    if (tile === 2) {
      this.grid[tileY][tileX] = 0;
      this.pelletsRemaining--;
      return 2; // Pellet eaten
    } else if (tile === 3) {
      this.grid[tileY][tileX] = 0;
      this.pelletsRemaining--;
      return 3; // Energizer eaten
    }
    return 0;
  }

  update(dt) {
    this.flashTimer += dt;
    if (this.flashTimer > 200) {
      this.energizerFlash = !this.energizerFlash;
      this.flashTimer = 0;
    }
  }

  render(ctx, theme = { wallColor: '#2121ff', wallGlow: 'rgba(33, 33, 255, 0.6)', doorColor: '#ffb8de' }) {
    ctx.save();

    const isWhite = this.levelClearFlashing && (Math.floor(Date.now() / 150) % 2 === 0);
    const wallColor = isWhite ? '#FFFFFF' : theme.wallColor;
    const glowColor = isWhite ? '#FFFFFF' : theme.wallGlow;

    // Dark canvas background
    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);

    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const tile = this.grid[r][c];
        const px = c * TILE_SIZE;
        const py = r * TILE_SIZE;

        if (tile === 1) {
          ctx.fillStyle = '#0c0e1e';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Neon wall outline
          ctx.strokeStyle = wallColor;
          ctx.lineWidth = 2;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 6;

          const top = r > 0 && this.grid[r - 1][c] === 1;
          const bottom = r < MAP_ROWS - 1 && this.grid[r + 1][c] === 1;
          const left = c > 0 && this.grid[r][c - 1] === 1;
          const right = c < MAP_COLS - 1 && this.grid[r][c + 1] === 1;

          ctx.beginPath();
          if (!top) {
            ctx.moveTo(px, py + 1);
            ctx.lineTo(px + TILE_SIZE, py + 1);
          }
          if (!bottom) {
            ctx.moveTo(px, py + TILE_SIZE - 1);
            ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE - 1);
          }
          if (!left) {
            ctx.moveTo(px + 1, py);
            ctx.lineTo(px + 1, py + TILE_SIZE);
          }
          if (!right) {
            ctx.moveTo(px + TILE_SIZE - 1, py);
            ctx.lineTo(px + TILE_SIZE - 1, py + TILE_SIZE);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (tile === 4) {
          // Ghost house door
          ctx.strokeStyle = theme.doorColor;
          ctx.lineWidth = 3;
          ctx.shadowColor = theme.doorColor;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(px, py + TILE_SIZE / 2);
          ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE / 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (tile === 2) {
          // Normal Pellet
          ctx.fillStyle = '#ffb897';
          ctx.shadowColor = 'rgba(255, 184, 151, 0.7)';
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (tile === 3) {
          // Energizer (Power Pellet)
          if (this.energizerFlash) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffb897';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
    }

    ctx.restore();
  }
}
