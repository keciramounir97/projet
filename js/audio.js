/**
 * Pac-Man 2D Arcade - Web Audio Synthesizer Engine
 * Generates 100% authentic retro sound effects directly via Web Audio API.
 * No external sound files needed!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.5;
    this.wakaAlternator = 0;
    this.lastWakaTime = 0;
    this.sirenOsc = null;
    this.sirenGain = null;
    this.sirenInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.muted && this.sirenGain) {
      this.sirenGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  playTone(freq, type = 'square', duration = 0.1, delay = 0, startGain = 0.3, endGain = 0.01) {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(startGain * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endGain * this.volume), t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {
      // Audio context may not be allowed before user interaction
    }
  }

  playWaka() {
    const now = Date.now();
    if (now - this.lastWakaTime < 130) return;
    this.lastWakaTime = now;

    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const f1 = this.wakaAlternator % 2 === 0 ? 320 : 490;
      const f2 = this.wakaAlternator % 2 === 0 ? 490 : 320;
      this.wakaAlternator++;

      osc.frequency.setValueAtTime(f1, t);
      osc.frequency.linearRampToValueAtTime(f2, t + 0.08);

      gain.gain.setValueAtTime(0.25 * this.volume, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }

  playEnergizer() {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(260, t + 0.25);

      gain.gain.setValueAtTime(0.3 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.28);
    } catch (e) {}
  }

  playGhostEat() {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.35);

      gain.gain.setValueAtTime(0.4 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {}
  }

  playFruit() {
    if (this.muted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((f, i) => {
      this.playTone(f, 'square', 0.08, i * 0.07, 0.25, 0.02);
    });
  }

  playDeath() {
    if (this.muted || !this.ctx) return;
    try {
      const notes = [
        493.88, 466.16, 440.0, 415.3, 392.0, 369.99,
        349.23, 329.63, 311.13, 293.66, 277.18, 261.63, 220
      ];
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', 0.12, idx * 0.09, 0.35, 0.01);
      });
      // Final "pop" sound
      setTimeout(() => {
        this.playTone(85, 'square', 0.2, 0, 0.4, 0.001);
      }, notes.length * 90);
    } catch (e) {}
  }

  playStartJingle() {
    if (this.muted || !this.ctx) return;
    // Classic Pac-Man start fanfare melody notes and timings
    const melody = [
      { f: 493.88, d: 0.15 }, // B4
      { f: 987.77, d: 0.15 }, // B5
      { f: 739.99, d: 0.15 }, // F#5
      { f: 622.25, d: 0.15 }, // D#5
      { f: 987.77, d: 0.12 }, // B5
      { f: 739.99, d: 0.18 }, // F#5
      { f: 622.25, d: 0.28 }, // D#5
      { f: 523.25, d: 0.15 }, // C5
      { f: 1046.5, d: 0.15 }, // C6
      { f: 783.99, d: 0.15 }, // G5
      { f: 659.25, d: 0.15 }, // E5
      { f: 1046.5, d: 0.12 }, // C6
      { f: 783.99, d: 0.18 }, // G5
      { f: 659.25, d: 0.28 }, // E5
      { f: 493.88, d: 0.15 }, // B4
      { f: 987.77, d: 0.15 }, // B5
      { f: 739.99, d: 0.15 }, // F#5
      { f: 622.25, d: 0.15 }, // D#5
      { f: 987.77, d: 0.12 }, // B5
      { f: 739.99, d: 0.25 }, // F#5
      { f: 622.25, d: 0.12 }, // D#5
      { f: 659.25, d: 0.12 }, // E5
      { f: 698.46, d: 0.12 }, // F5
      { f: 739.99, d: 0.14 }, // F#5
      { f: 783.99, d: 0.14 }, // G5
      { f: 830.61, d: 0.14 }, // G#5
      { f: 880.0, d: 0.14 },  // A5
      { f: 987.77, d: 0.35 }  // B5
    ];

    let currentOffset = 0;
    melody.forEach(n => {
      this.playTone(n.f, 'square', n.d * 0.9, currentOffset, 0.22, 0.02);
      currentOffset += n.d;
    });
  }

  playLevelClear() {
    if (this.muted || !this.ctx) return;
    const fanfare = [
      { f: 587.33, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 880.00, d: 0.2 },
      { f: 1046.5, d: 0.35 }
    ];
    let offset = 0;
    fanfare.forEach(note => {
      this.playTone(note.f, 'triangle', note.d, offset, 0.3, 0.01);
      offset += note.d * 1.1;
    });
  }

  playExtraLife() {
    if (this.muted || !this.ctx) return;
    [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => {
      this.playTone(f, 'sine', 0.12, i * 0.08, 0.3, 0.01);
    });
  }
}

export const sounds = new SoundEngine();
