/**
 * Pac-Man 2D Arcade - Main Entry Point
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { PacmanGame } from './game.js';
import { sounds } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  // Set crisp canvas dimensions
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const game = new PacmanGame(canvas);
  game.start();

  // Control Buttons
  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      game.start();
    });
  }

  const btnPause = document.getElementById('btn-pause');
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      game.togglePause();
    });
  }

  const btnAudio = document.getElementById('btn-audio');
  if (btnAudio) {
    const isMuted = localStorage.getItem('pacman_muted') === 'true';
    sounds.setMuted(isMuted);
    updateAudioBtnIcon(btnAudio, isMuted);

    btnAudio.addEventListener('click', () => {
      sounds.init();
      const nextMuted = !sounds.muted;
      sounds.setMuted(nextMuted);
      localStorage.setItem('pacman_muted', nextMuted.toString());
      updateAudioBtnIcon(btnAudio, nextMuted);
    });
  }

  // CRT Scanlines Toggle
  const btnCrt = document.getElementById('btn-crt');
  const cabinetEl = document.getElementById('arcade-screen');
  if (btnCrt && cabinetEl) {
    const crtEnabled = localStorage.getItem('pacman_crt') !== 'false';
    if (crtEnabled) {
      cabinetEl.classList.add('crt-active');
      btnCrt.classList.add('active');
    }

    btnCrt.addEventListener('click', () => {
      const active = cabinetEl.classList.toggle('crt-active');
      btnCrt.classList.toggle('active', active);
      localStorage.setItem('pacman_crt', active.toString());
    });
  }

  function updateAudioBtnIcon(btn, muted) {
    btn.innerHTML = muted 
      ? '<span class="icon">🔇</span><span class="btn-label">Muted</span>'
      : '<span class="icon">🔊</span><span class="btn-label">Sound</span>';
  }
});
