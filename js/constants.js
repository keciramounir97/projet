/**
 * Pac-Man 2D Arcade - Game Constants
 */

export const TILE_SIZE = 20;
export const MAP_COLS = 28;
export const MAP_ROWS = 31;
export const CANVAS_WIDTH = MAP_COLS * TILE_SIZE; // 560px
export const CANVAS_HEIGHT = MAP_ROWS * TILE_SIZE; // 620px

export const DIRECTIONS = {
  NONE: { x: 0, y: 0, name: 'NONE', angle: 0 },
  UP: { x: 0, y: -1, name: 'UP', angle: 1.5 * Math.PI },
  DOWN: { x: 0, y: 1, name: 'DOWN', angle: 0.5 * Math.PI },
  LEFT: { x: -1, y: 0, name: 'LEFT', angle: Math.PI },
  RIGHT: { x: 1, y: 0, name: 'RIGHT', angle: 0 }
};

export const GHOST_MODES = {
  HOUSE: 'HOUSE',
  SCATTER: 'SCATTER',
  CHASE: 'CHASE',
  FRIGHTENED: 'FRIGHTENED',
  EATEN: 'EATEN'
};

export const GAME_STATES = {
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GHOST_EATEN: 'GHOST_EATEN',
  PACMAN_DYING: 'PACMAN_DYING',
  LEVEL_CLEAR: 'LEVEL_CLEAR',
  GAME_OVER: 'GAME_OVER'
};

export const SCORES = {
  PELLET: 10,
  ENERGIZER: 50,
  GHOST_BASE: 200, // doubles with each consecutive ghost: 200, 400, 800, 1600
  FRUITS: [
    { name: 'Cherry', points: 100, svg: 'cherry.svg', level: 1 },
    { name: 'Strawberry', points: 300, svg: 'strawberry.svg', level: 2 },
    { name: 'Orange', points: 500, svg: 'orange.svg', level: 3 },
    { name: 'Orange', points: 500, svg: 'orange.svg', level: 4 },
    { name: 'Apple', points: 700, svg: 'apple.svg', level: 5 },
    { name: 'Apple', points: 700, svg: 'apple.svg', level: 6 },
    { name: 'Melon', points: 1000, svg: 'melon.svg', level: 7 },
    { name: 'Melon', points: 1000, svg: 'melon.svg', level: 8 },
    { name: 'Bell', points: 3000, svg: 'bell.svg', level: 9 },
    { name: 'Bell', points: 3000, svg: 'bell.svg', level: 10 },
    { name: 'Key', points: 5000, svg: 'key.svg', level: 11 }
  ]
};

export const GHOST_CONFIG = {
  BLINKY: {
    name: 'Blinky',
    nickname: 'Shadow',
    color: '#FF0000',
    glowColor: 'rgba(255, 0, 0, 0.6)',
    svg: 'ghost-blinky.svg',
    scatterTarget: { x: 25, y: -2 },
    home: { x: 13.5, y: 11 }
  },
  PINKY: {
    name: 'Pinky',
    nickname: 'Speedy',
    color: '#FFB8DE',
    glowColor: 'rgba(255, 184, 222, 0.6)',
    svg: 'ghost-pinky.svg',
    scatterTarget: { x: 2, y: -2 },
    home: { x: 13.5, y: 14 }
  },
  INKY: {
    name: 'Inky',
    nickname: 'Bashful',
    color: '#00FFFF',
    glowColor: 'rgba(0, 255, 255, 0.6)',
    svg: 'ghost-inky.svg',
    scatterTarget: { x: 27, y: 32 },
    home: { x: 11.5, y: 14 }
  },
  CLYDE: {
    name: 'Clyde',
    nickname: 'Pokey',
    color: '#FFB852',
    glowColor: 'rgba(255, 184, 82, 0.6)',
    svg: 'ghost-clyde.svg',
    scatterTarget: { x: 0, y: 32 },
    home: { x: 15.5, y: 14 }
  }
};

export const THEMES = {
  classic: {
    name: 'Classic Arcade',
    wallColor: '#2121ff',
    wallGlow: 'rgba(33, 33, 255, 0.5)',
    doorColor: '#ffb8de'
  },
  neon: {
    name: 'Cyberpunk Neon',
    wallColor: '#00ffff',
    wallGlow: 'rgba(0, 255, 255, 0.8)',
    doorColor: '#ff00aa'
  },
  amber: {
    name: 'Retro Amber',
    wallColor: '#ff9900',
    wallGlow: 'rgba(255, 153, 0, 0.7)',
    doorColor: '#ffffff'
  },
  matrix: {
    name: 'Matrix Green',
    wallColor: '#00ff66',
    wallGlow: 'rgba(0, 255, 102, 0.7)',
    doorColor: '#00ffaa'
  }
};
