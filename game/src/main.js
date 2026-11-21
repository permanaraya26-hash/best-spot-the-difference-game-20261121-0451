// main.js — the game itself: state, loop, scoring, and the screenshot hooks.
// One job: own the state machine and tie render + input + audio together.
// The scenes live in scenes.js, the painting in render.js, the sounds in
// audio.js; this file only decides what happens next.

import { VIEW, RULES, SCORE } from './config.js';
import { SCENES as SCENE_LIST } from './scenes.js';
import { drawFrame } from './render.js';
import { installInput, nearestDiff } from './input.js';
import * as sfx from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW.w * dpr;
  canvas.height = VIEW.h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

// --- persistence (best scores only; the game itself needs nothing stored)
function loadBest() {
  try {
    return {
      best: Number(localStorage.getItem('clockwork-best') || 0),
      sceneBest: JSON.parse(localStorage.getItem('clockwork-scene-best') || '[0,0,0,0]'),
      cleared: new Set(JSON.parse(localStorage.getItem('clockwork-cleared') || '[]')),
    };
  } catch {
    return { best: 0, sceneBest: [0, 0, 0, 0], cleared: new Set() };
  }
}
function saveBest() {
  try {
    localStorage.setItem('clockwork-best', String(state.best));
    localStorage.setItem('clockwork-scene-best', JSON.stringify(state.sceneBest));
    localStorage.setItem('clockwork-cleared', JSON.stringify([...state.cleared]));
  } catch { /* private mode: scores just do not persist */ }
}

const saved = loadBest();
const state = {
  screen: 'title', // title | select | play | complete | gameover | workshopDone
  sceneIndex: 0,
  found: new Set(),
  score: 0,
  streak: 0,
  timeLeft: 0,
  hintsLeft: RULES.hintCount,
  hint: null,
  wrongFlash: null,
  foundPop: null,
  magnifier: false,
  mouse: null,
  cursor: null,
  muted: false,
  toast: null,
  best: saved.best,
  sceneBest: saved.sceneBest,
  cleared: saved.cleared,
  lastBonus: 0,
  lastRoomScore: 0,
  roomScore: 0,
  frozen: false, // screenshot mode: the clock never moves
};

function scene() { return SCENE_LIST[state.sceneIndex]; }

function announce(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function startScene(i) {
  state.sceneIndex = i;
  state.found = new Set();
  state.streak = 0;
  state.timeLeft = scene().timeLimit;
  state.hintsLeft = RULES.hintCount;
  state.hint = null;
  state.wrongFlash = null;
  state.foundPop = null;
  state.roomScore = 0;
  state.cursor = { side: 'left', sx: 300, sy: 318 };
  state.screen = 'play';
  announce(`${scene().name}. Find ${scene().diffs.length} differences. ${scene().diffs.length} still hidden.`);
}

function useHint() {
  if (state.screen !== 'play') return;
  if (state.hintsLeft <= 0) { setToast('No hints left — trust your eyes.'); return; }
  const rest = scene().diffs.filter((d) => !state.found.has(d.id));
  if (!rest.length) return;
  const d = rest[Math.floor(Math.random() * rest.length)];
  state.hintsLeft -= 1;
  state.hint = { id: d.id, until: performance.now() + RULES.hintSeconds * 1000 };
  sfx.playHint();
  announce(`Hint: look near ${d.label.toLowerCase()}.`);
}

function setToast(text) {
  state.toast = { text, until: performance.now() + 2600 };
}

function markAt(sx, sy, side) {
  if (state.screen !== 'play') return;
  const d = nearestDiff(scene(), state.found, sx, sy);
  const now = performance.now();
  if (d) {
    state.found.add(d.id);
    const bonus = Math.min(state.streak * SCORE.streakStep, SCORE.streakCap);
    const gained = SCORE.find + bonus;
    state.score += gained;
    state.roomScore += gained;
    state.streak += 1;
    state.foundPop = { id: d.id, at: now };
    if (!state.muted) sfx.playFound(state.streak);
    setToast(`${d.label} — +${gained}`);
    announce(`Found ${state.found.size} of ${scene().diffs.length}. ${scene().diffs.length - state.found.size} still hidden.`);
    if (state.found.size === scene().diffs.length) finishScene();
  } else {
    state.timeLeft = Math.max(0, state.timeLeft - RULES.wrongClickSeconds);
    state.streak = 0;
    state.wrongFlash = { side, sx, sy, at: now, until: now + RULES.wrongFlashMs };
    if (!state.muted) sfx.playWrong();
    setToast(`Not a difference — ${RULES.wrongClickSeconds} seconds lost.`);
    announce(`Wrong spot. ${RULES.wrongClickSeconds} seconds lost.`);
  }
}

function finishScene() {
  const bonus = Math.ceil(state.timeLeft) * SCORE.clearPerSecondLeft;
  state.lastBonus = bonus;
  state.score += bonus;
  state.roomScore += bonus;
  state.lastRoomScore = state.roomScore;
  state.cleared.add(state.sceneIndex);
  if (state.roomScore > state.sceneBest[state.sceneIndex]) {
    state.sceneBest[state.sceneIndex] = state.roomScore;
  }
  if (state.score > state.best) state.best = state.score;
  saveBest();
  if (!state.muted) sfx.playClear();
  state.screen = 'complete';
  announce(`Room complete. Time bonus plus ${bonus}. Total score ${state.score}.`);
}

function advance() {
  if (state.sceneIndex + 1 < SCENE_LIST.length) startScene(state.sceneIndex + 1);
  else {
    state.screen = 'workshopDone';
    announce(`Workshop complete. Final score ${state.score}.`);
  }
}

function toSelect() {
  state.screen = 'select';
  state.hint = null;
  state.wrongFlash = null;
  announce('Choose a room.');
}

function toggleMagnifier() {
  state.magnifier = !state.magnifier;
  if (!state.muted) sfx.playClick();
}

// --- input wiring
// The canvas click handler routes panel clicks to onMark even on screens
// that draw no panels (title/select), so a card click must be re-routed
// here: onMark falls back to the background-click path off the play screen.
const api = {
  onMouseMove(p) { state.mouse = p; },
  onMark(sx, sy, side) {
    if (state.screen !== 'play') {
      const x = (side === 'left' ? 20 : 660) + sx;
      api.onBackgroundClick({ x, y: 76 + sy });
      return;
    }
    markAt(sx, sy, side);
  },
  onBackgroundClick(p) {
    if (state.screen === 'title') { toSelect(); return; }
    if (state.screen === 'select') {
      for (let i = 0; i < SCENE_LIST.length; i++) {
        const x = 60 + i * 310;
        if (p.x >= x && p.x <= x + 280 && p.y >= 170 && p.y <= 590) { startScene(i); return; }
      }
      return;
    }
    if (state.screen === 'complete') { advance(); return; }
    if (state.screen === 'gameover') { startScene(state.sceneIndex); return; }
    if (state.screen === 'workshopDone') { state.score = 0; toSelect(); }
  },
  onBar(id) {
    if (id === 'hint') useHint();
    else if (id === 'magnifier') toggleMagnifier();
    else if (id === 'sound') { state.muted = !state.muted; if (!state.muted) sfx.playClick(); }
    else if (id === 'menu') {
      if (state.screen === 'play' || state.screen === 'complete' || state.screen === 'gameover') toSelect();
      else if (state.screen === 'select') state.screen = 'title';
    }
  },
  onCursorMove(key) {
    if (state.screen !== 'play') return;
    if (!state.cursor) state.cursor = { side: 'left', sx: 300, sy: 318 };
    const step = 26;
    if (key === 'ArrowLeft') state.cursor.sx -= step;
    if (key === 'ArrowRight') state.cursor.sx += step;
    if (key === 'ArrowUp') state.cursor.sy -= step;
    if (key === 'ArrowDown') state.cursor.sy += step;
    state.cursor.sx = Math.max(0, Math.min(600, state.cursor.sx));
    state.cursor.sy = Math.max(0, Math.min(636, state.cursor.sy));
  },
  onConfirm() {
    if (state.screen === 'title') { toSelect(); return; }
    if (state.screen === 'select') {
      const next = SCENE_LIST.findIndex((_, i) => !state.cleared.has(i));
      startScene(next === -1 ? 0 : next);
      return;
    }
    if (state.screen === 'play' && state.cursor) {
      markAt(state.cursor.sx, state.cursor.sy, state.cursor.side);
      return;
    }
    if (state.screen === 'complete') { advance(); return; }
    if (state.screen === 'gameover') { startScene(state.sceneIndex); return; }
    if (state.screen === 'workshopDone') { state.score = 0; toSelect(); }
  },
  onDigit(n) {
    if (state.screen === 'select' && n >= 1 && n <= SCENE_LIST.length) startScene(n - 1);
  },
  onTab() {
    if (state.screen === 'play' && state.cursor) {
      state.cursor.side = state.cursor.side === 'left' ? 'right' : 'left';
    }
  },
};
installInput(canvas, api);

// --- screenshot hooks: deterministic staged states, real renders of this code
// ?shot=cover      scene 1 mid-hunt, 3 found, 4 still hidden, clock at 2:22
// ?shot=magnifier  scene 2, magnifier open over a gear, hint ring showing
// ?shot=select     the room menu, first room cleared
// ?shot=complete   scene 1 cleared, fanfare card showing
function applyShotHook() {
  const shot = new URLSearchParams(location.search).get('shot');
  if (!shot) return;
  state.frozen = true; // the clock never moves in a staged shot
  if (shot === 'cover') {
    startScene(0);
    for (const id of ['clock', 'tail', 'mug']) state.found.add(id);
    state.timeLeft = 142;
    state.score = 350;
    state.streak = 3;
    state.cursor = null;
  } else if (shot === 'magnifier') {
    startScene(1);
    for (const id of ['fly', 'oil']) state.found.add(id);
    state.timeLeft = 98;
    state.score = 620;
    state.streak = 2;
    state.magnifier = true;
    // park the lens over the small teal gear, where the zoom is unmistakable
    const o = { x: 660, y: 76 };
    state.mouse = { x: o.x + 420, y: o.y + 420 };
    state.hint = { id: 'teeth', until: performance.now() + 60000 };
    state.cursor = null;
  } else if (shot === 'select') {
    state.cleared.add(0);
    state.sceneBest[0] = 1240;
    state.best = 1240;
    toSelect();
  } else if (shot === 'complete') {
    startScene(0);
    for (const d of scene().diffs) state.found.add(d.id);
    state.timeLeft = 61;
    state.score = 1330;
    state.lastBonus = 610;
    state.lastRoomScore = 1330;
    state.cleared.add(0);
    state.screen = 'complete';
    state.cursor = null;
  }
}
applyShotHook();

// --- the loop
let last = performance.now();
let lastTickSecond = -1;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (state.screen === 'play' && !state.frozen) {
    state.timeLeft -= dt;
    const s = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10 && s !== lastTickSecond && state.timeLeft > 0) {
      lastTickSecond = s;
      if (!state.muted) sfx.playTick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = 'gameover';
      if (state.score > state.best) { state.best = state.score; saveBest(); }
      announce(`Time is up. You found ${state.found.size} of ${scene().diffs.length}.`);
    }
  }
  drawFrame(ctx, state, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// For play-testing and scripted screenshots: the live state, read-only-ish.
window.__game = { state, scenes: SCENE_LIST };
