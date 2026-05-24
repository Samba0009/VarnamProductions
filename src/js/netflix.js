/* Varnam Productions – Netflix Intro + Card Hover Controller */

// ── Synthesised "Tudum" sound ───────────────────────────────
class TudumSynth {
  constructor() { this.ctx = null; }

  _init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  play() {
    this._init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const out = this.ctx.destination;

    // Master gain (slow fade-out tail)
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.001, now);
    master.gain.linearRampToValueAtTime(0.85, now + 0.05);
    master.gain.exponentialRampToValueAtTime(0.001, now + 2.6);
    master.connect(out);

    // Low-pass warmth
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(180, now);
    lp.frequency.linearRampToValueAtTime(80, now + 1.2);
    lp.connect(master);

    const play = (type, freq, start, stop, gainPeak, gainNode = lp) => {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(gainPeak, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, stop);
      osc.connect(gain);
      gain.connect(gainNode);
      osc.start(start);
      osc.stop(stop);
    };

    // "Tu" hit  (t = 0)
    play('triangle', 62,  now,        now + 0.3,  0.55);
    // "dum" hit  (t = 0.13)
    play('sawtooth', 55,  now + 0.13, now + 2.0,  0.85);
    play('triangle', 110, now + 0.13, now + 2.0,  0.45);

    // Airy harmonic tail (bypass lp → straight to master)
    play('sine', 220, now + 0.20, now + 2.5, 0.15, master);
    play('sine', 330, now + 0.22, now + 2.5, 0.10, master);
    play('sine', 440, now + 0.24, now + 2.5, 0.08, master);
  }
}

// ── Intro lifecycle ─────────────────────────────────────────
export const initNetflixExperience = () => {
  const intro  = document.getElementById('vp-intro');
  if (!intro) return;

  // Lock scroll
  document.body.classList.add('intro-active');

  const synth = new TudumSynth();

  // Play Tudum ~0.5 s after the V starts drawing
  setTimeout(() => { try { synth.play(); } catch(e) {} }, 500);

  // After full animation (draw 1.7 s + label 2.1 s + hold 0.5 s) → fade out
  setTimeout(() => {
    intro.classList.add('vp-intro-hide');
    document.body.classList.remove('intro-active');

    // Remove from DOM after fade completes
    setTimeout(() => intro.remove(), 900);
  }, 2800);
};
