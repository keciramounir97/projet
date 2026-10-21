/**
 * Pac-Man 2D Arcade - UI, HUD, Floating Text, and Controls Engine
 */

export class UIEngine {
  constructor(game) {
    this.game = game;
    this.scoreEl = document.getElementById('current-score');
    this.highScoreEl = document.getElementById('high-score');
    this.levelEl = document.getElementById('current-level');
    this.livesContainer = document.getElementById('lives-display');
    this.fruitsContainer = document.getElementById('fruits-display');
    this.bannerEl = document.getElementById('game-banner');
    this.crtOverlay = document.getElementById('crt-overlay');
    this.floatingTexts = [];

    this.initControls();
  }

  updateHUD(score, highScore, level, lives, fruits) {
    if (this.scoreEl) this.scoreEl.textContent = score.toString().padStart(2, '0');
    if (this.highScoreEl) this.highScoreEl.textContent = highScore.toString().padStart(2, '0');
    if (this.levelEl) this.levelEl.textContent = `L${level}`;

    // Update life icons (SVG life icon)
    if (this.livesContainer) {
      this.livesContainer.innerHTML = '';
      for (let i = 0; i < Math.max(0, lives); i++) {
        const img = document.createElement('img');
        img.src = 'assets/svg/life.svg';
        img.alt = 'Life';
        img.className = 'life-icon';
        this.livesContainer.appendChild(img);
      }
    }

    // Update fruit icons
    if (this.fruitsContainer && fruits) {
      this.fruitsContainer.innerHTML = '';
      fruits.forEach(fruit => {
        const img = document.createElement('img');
        img.src = `assets/svg/${fruit.svg}`;
        img.alt = fruit.name;
        img.title = `${fruit.name} (+${fruit.points} pts)`;
        img.className = 'fruit-icon';
        this.fruitsContainer.appendChild(img);
      });
    }
  }

  showBanner(title, subtitle = '', actionText = '', onAction = null) {
    if (!this.bannerEl) return;
    this.bannerEl.innerHTML = `
      <div class="banner-box">
        <h2 class="banner-title">${title}</h2>
        ${subtitle ? `<p class="banner-sub">${subtitle}</p>` : ''}
        ${actionText ? `<button id="banner-action-btn" class="arcade-btn pulse">${actionText}</button>` : ''}
      </div>
    `;
    this.bannerEl.style.display = 'flex';

    if (actionText && onAction) {
      const btn = document.getElementById('banner-action-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          this.hideBanner();
          onAction();
        }, { once: true });
      }
    }
  }

  hideBanner() {
    if (this.bannerEl) {
      this.bannerEl.style.display = 'none';
      this.bannerEl.innerHTML = '';
    }
  }

  addFloatingText(text, x, y, color = '#00ffff') {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -0.8,
      life: 1000 // 1 second
    });
  }

  update(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * (dt / 16);
      ft.alpha = Math.max(0, ft.life / 1000);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  renderFloatingTexts(ctx) {
    if (this.floatingTexts.length === 0) return;
    ctx.save();
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.textAlign = 'center';

    for (const ft of this.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  initControls() {
    // Virtual D-pad for mobile
    const bindBtn = (id, directionName) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const handler = (e) => {
        e.preventDefault();
        this.game.handleDirectionInput(directionName);
      };
      btn.addEventListener('touchstart', handler, { passive: false });
      btn.addEventListener('mousedown', handler);
    };

    bindBtn('dpad-up', 'UP');
    bindBtn('dpad-down', 'DOWN');
    bindBtn('dpad-left', 'LEFT');
    bindBtn('dpad-right', 'RIGHT');

    // Touch swipe gestures on game board
    const board = document.getElementById('game-container');
    if (board) {
      let touchStartX = 0;
      let touchStartY = 0;

      board.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      board.addEventListener('touchend', (e) => {
        if (e.changedTouches.length > 0) {
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (Math.max(absDx, absDy) > 25) {
            if (absDx > absDy) {
              this.game.handleDirectionInput(dx > 0 ? 'RIGHT' : 'LEFT');
            } else {
              this.game.handleDirectionInput(dy > 0 ? 'DOWN' : 'UP');
            }
          }
        }
      }, { passive: true });
    }
  }
}
