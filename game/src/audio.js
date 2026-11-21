// audio.js — every sound the game makes, synthesized live.
// One job: tiny WebAudio bleeps. No audio files, no network, nothing to load.

let actx = null;

function ctx() {
  if (!actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    actx = new AC();
  }
  if (actx.state === 'suspended') void actx.resume();
  return actx;
}

function tone(freq, at, dur, type, vol) {
  const ac = ctx();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g);
  g.connect(ac.destination);
  o.start(at);
  o.stop(at + dur + 0.05);
}

// A satisfying little chime on each find, rising with the streak.
export function playFound(streak) {
  const ac = ctx();
  if (!ac) return;
  const base = 523.25 * Math.pow(1.059, Math.min(streak, 6));
  const t = ac.currentTime;
  tone(base, t, 0.16, 'sine', 0.22);
  tone(base * 1.5, t + 0.07, 0.2, 'sine', 0.18);
}

export function playWrong() {
  const ac = ctx();
  if (!ac) return;
  tone(160, ac.currentTime, 0.18, 'sawtooth', 0.1);
  tone(110, ac.currentTime + 0.05, 0.2, 'sawtooth', 0.08);
}

export function playHint() {
  const ac = ctx();
  if (!ac) return;
  tone(880, ac.currentTime, 0.12, 'triangle', 0.14);
}

export function playTick() {
  const ac = ctx();
  if (!ac) return;
  tone(1200, ac.currentTime, 0.05, 'square', 0.05);
}

export function playClear() {
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.09, 0.28, 'sine', 0.2));
}

export function playClick() {
  const ac = ctx();
  if (!ac) return;
  tone(700, ac.currentTime, 0.06, 'triangle', 0.1);
}
