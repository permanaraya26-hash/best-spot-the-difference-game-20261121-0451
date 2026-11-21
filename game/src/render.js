// render.js — everything the player sees.
// One job: paint one frame from the game state. It never mutates state and
// never reads input; main.js owns the state, input.js owns the clicks.

import { VIEW, HUD_H, PANEL, BAR_H, PALETTE as P, RULES } from './config.js';
import { SCENES } from './scenes.js';
import { circle, ellipse, rect, rrect, line, drawStar } from './props.js';

const LEFT_X = 20;
const RIGHT_X = LEFT_X + PANEL.w + PANEL.gap;
const PANEL_Y = PANEL.top;
const BAR_Y = VIEW.h - BAR_H - 8;

export const BUTTONS = [
  { id: 'hint', label: 'Hint (H)', x: 20, w: 150 },
  { id: 'magnifier', label: 'Magnifier (M)', x: 186, w: 190 },
  { id: 'sound', label: 'Sound: on', x: 392, w: 170 },
  { id: 'menu', label: 'Menu (Esc)', x: 578, w: 160 },
];

export function hitBottomBar(x, y) {
  if (y < BAR_Y || y > BAR_Y + 40) return null;
  for (const b of BUTTONS) if (x >= b.x && x <= b.x + b.w) return b.id;
  return null;
}

function panelOrigin(side) {
  return { x: side === 'left' ? LEFT_X : RIGHT_X, y: PANEL_Y };
}

export function scenePointToCanvas(side, sx, sy) {
  const o = panelOrigin(side);
  return { x: o.x + sx, y: o.y + sy };
}

// Which panel (if any) is the canvas point over? Returns null outside.
export function pickPanel(x, y) {
  if (y < PANEL_Y || y > PANEL_Y + PANEL.h) return null;
  if (x >= LEFT_X && x <= LEFT_X + PANEL.w) return { side: 'left', sx: x - LEFT_X, sy: y - PANEL_Y };
  if (x >= RIGHT_X && x <= RIGHT_X + PANEL.w) return { side: 'right', sx: x - RIGHT_X, sy: y - PANEL_Y };
  return null;
}

function drawPanel(ctx, scene, side, state, now) {
  const o = panelOrigin(side);
  ctx.save();
  ctx.beginPath();
  ctx.rect(o.x, o.y, PANEL.w, PANEL.h);
  ctx.clip();
  ctx.translate(o.x, o.y);
  scene.draw(ctx, side === 'right');
  // found markers: a ring on both panels, popping in just after the find
  for (const d of scene.diffs) {
    if (!state.found.has(d.id)) continue;
    const pop = state.foundPop && state.foundPop.id === d.id
      ? 1 + 0.35 * Math.sin(((now - state.foundPop.at) / RULES.foundPopMs) * Math.PI)
      : 1;
    ctx.save();
    ctx.strokeStyle = P.found;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * pop, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * pop + 5, 0, Math.PI * 2);
    ctx.stroke();
    // tick: dark green with a white halo, so it reads on any background
    line(ctx, d.x - 8, d.y, d.x - 2, d.y + 7, '#fff', 7);
    line(ctx, d.x - 2, d.y + 7, d.x + 10, d.y - 7, '#fff', 7);
    line(ctx, d.x - 8, d.y, d.x - 2, d.y + 7, '#14532d', 3.5);
    line(ctx, d.x - 2, d.y + 7, d.x + 10, d.y - 7, '#14532d', 3.5);
    ctx.restore();
  }
  // hint ring: pulsing gold dashed circle around one unfound difference
  if (state.hint && now < state.hint.until) {
    const d = scene.diffs.find((dd) => dd.id === state.hint.id);
    if (d) {
      const pulse = 1 + 0.12 * Math.sin(now / 120);
      ctx.save();
      ctx.strokeStyle = P.hint;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * pulse + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  // wrong-click flash
  if (state.wrongFlash && now < state.wrongFlash.until) {
    const p = state.wrongFlash;
    if (p.side === side) {
      const a = 1 - (now - p.at) / RULES.wrongFlashMs;
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      line(ctx, p.sx - 12, p.sy - 12, p.sx + 12, p.sy + 12, P.wrong, 5);
      line(ctx, p.sx + 12, p.sy - 12, p.sx - 12, p.sy + 12, P.wrong, 5);
      ctx.restore();
    }
  }
  ctx.restore();
  // frame
  rrect(ctx, o.x - 4, o.y - 4, PANEL.w + 8, PANEL.h + 8, 10, null, P.panelFrame, 5);
  ctx.fillStyle = side === 'left' ? P.gold : P.teal;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(side === 'left' ? '◀  ORIGINAL' : 'CHANGED  ▶', o.x + 10, o.y + 10);
}

function drawMagnifier(ctx, scene, state) {
  if (!state.magnifier || !state.mouse) return;
  const pick = pickPanel(state.mouse.x, state.mouse.y);
  if (!pick) return;
  const { x, y } = state.mouse;
  const z = RULES.magnifierZoom;
  const r = RULES.magnifierRadius;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#000';
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.translate(x, y);
  ctx.scale(z, z);
  ctx.translate(-pick.sx, -pick.sy);
  scene.draw(ctx, pick.side === 'right');
  ctx.restore();
  circle(ctx, x, y, r, null, P.gold, 4);
  circle(ctx, x, y, r - 6, null, 'rgba(255,255,255,0.6)', 1.5);
  line(ctx, x - 8, y, x + 8, y, 'rgba(255,255,255,0.8)', 2);
  line(ctx, x, y - 8, x, y + 8, 'rgba(255,255,255,0.8)', 2);
}

function fmtTime(s) {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function drawHud(ctx, state, now) {
  const scene = SCENES[state.sceneIndex];
  rect(ctx, 0, 0, VIEW.w, HUD_H, P.hud, null);
  line(ctx, 0, HUD_H, VIEW.w, HUD_H, P.hudLine, 2);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = P.gold;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('The Clockmaker’s Workshop', 20, 26);
  ctx.fillStyle = P.cream;
  ctx.font = '15px Georgia, serif';
  ctx.fillText(`${scene.name} — ${scene.sub}`, 20, 50);
  // timer
  const low = state.timeLeft <= 30;
  ctx.textAlign = 'center';
  ctx.fillStyle = low ? P.wrong : P.cream;
  ctx.font = `bold 30px Georgia, serif`;
  ctx.fillText(`⏱ ${fmtTime(state.timeLeft)}`, 640, 30);
  // time bar
  const frac = Math.max(0, state.timeLeft / scene.timeLimit);
  rect(ctx, 520, 52, 240, 8, '#3a2a18', null);
  rect(ctx, 520, 52, 240 * frac, 8, low ? P.wrong : P.gold, null);
  // found counter — the number the screenshots must show
  ctx.textAlign = 'right';
  ctx.fillStyle = P.cream;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`Found ${state.found.size} / ${scene.diffs.length}`, 1080, 26);
  ctx.font = '16px Georgia, serif';
  ctx.fillText(`${scene.diffs.length - state.found.size} still hidden`, 1080, 50);
  // score + streak
  ctx.textAlign = 'right';
  ctx.fillStyle = P.gold;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`Score ${state.score}`, 1260, 26);
  if (state.streak >= 2) {
    ctx.fillStyle = P.hint;
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText(`🔥 streak ×${state.streak}`, 1260, 50);
  }
}

function drawBottomBar(ctx, state) {
  rect(ctx, 0, BAR_Y - 6, VIEW.w, BAR_H + 14, P.hud, null);
  line(ctx, 0, BAR_Y - 6, VIEW.w, BAR_Y - 6, P.hudLine, 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const b of BUTTONS) {
    const active = (b.id === 'magnifier' && state.magnifier) || (b.id === 'sound' && state.muted);
    const label = b.id === 'sound' ? (state.muted ? 'Sound: off' : 'Sound: on')
      : b.id === 'hint' ? `Hint (H) · ${state.hintsLeft} left`
      : b.label;
    rrect(ctx, b.x, BAR_Y, b.w, 40, 8, active ? P.goldDim : '#3a2a18', P.gold, 2);
    ctx.fillStyle = active ? '#fff' : P.cream;
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(label, b.x + b.w / 2, BAR_Y + 21);
  }
  // last-find toast
  if (state.toast && performance.now() < state.toast.until) {
    ctx.textAlign = 'right';
    ctx.fillStyle = P.found;
    ctx.font = 'bold 17px Georgia, serif';
    ctx.fillText(state.toast.text, 1260, BAR_Y + 21);
  }
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(20,12,6,0.72)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

function card(ctx, w, h, title, lines, foot) {
  const x = (VIEW.w - w) / 2, y = (VIEW.h - h) / 2;
  rrect(ctx, x, y, w, h, 16, '#2e2115', P.gold, 3);
  ctx.textAlign = 'center';
  ctx.fillStyle = P.gold;
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText(title, VIEW.w / 2, y + 62);
  ctx.fillStyle = P.cream;
  ctx.font = '19px Georgia, serif';
  lines.forEach((ln, i) => ctx.fillText(ln, VIEW.w / 2, y + 118 + i * 32));
  if (foot) {
    ctx.fillStyle = P.hint;
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText(foot, VIEW.w / 2, y + h - 44);
  }
  return { x, y, w, h };
}

export function drawFrame(ctx, state, now) {
  ctx.fillStyle = P.page;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  const scene = SCENES[state.sceneIndex];

  if (state.screen === 'title') {
    // a quiet backdrop: the first scene, unplayed
    drawPanel(ctx, SCENES[0], 'left', { ...state, found: new Set(), hint: null, wrongFlash: null, foundPop: null }, now);
    drawPanel(ctx, SCENES[0], 'right', { ...state, found: new Set(), hint: null, wrongFlash: null, foundPop: null }, now);
    dim(ctx);
    card(ctx, 760, 430, 'The Clockmaker’s Workshop',
      ['Two pictures hang side by side. Seven small things changed.',
       'Find them all before the clock runs out.',
       '',
       'Click a difference on either picture · or move with ← → ↑ ↓ and press Enter',
       'H gives a hint · M opens the magnifier · a wrong click costs 8 seconds',
       '',
       `Best score: ${state.best}   ·   4 rooms · 28 differences`],
      'Click anywhere, or press Enter, to begin');
    return;
  }

  if (state.screen === 'select') {
    ctx.textAlign = 'center';
    ctx.fillStyle = P.gold;
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText('Choose a room', VIEW.w / 2, 90);
    ctx.fillStyle = P.cream;
    ctx.font = '18px Georgia, serif';
    ctx.fillText('Each room hides 7 differences. Clear all four to finish the workshop.', VIEW.w / 2, 122);
    SCENES.forEach((s, i) => {
      const x = 60 + i * 310, y = 170, w = 280, h = 420;
      const done = state.cleared.has(i);
      rrect(ctx, x, y, w, h, 14, done ? '#3d5a2e' : '#2e2115', done ? P.found : P.gold, 3);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 14, y + 14, w - 28, 200);
      ctx.clip();
      ctx.translate(x + 14, y + 14);
      ctx.scale((w - 28) / 600, 200 / 636);
      s.draw(ctx, false);
      ctx.restore();
      ctx.textAlign = 'center';
      ctx.fillStyle = P.cream;
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText(s.name, x + w / 2, y + 252);
      ctx.font = '16px Georgia, serif';
      ctx.fillText(s.sub, x + w / 2, y + 282);
      ctx.fillStyle = done ? P.found : P.hint;
      ctx.font = 'bold 17px Georgia, serif';
      const best = state.sceneBest[i];
      ctx.fillText(done ? `✓ Cleared · best ${best}` : (best ? `Best ${best}` : 'Not yet cleared'), x + w / 2, y + 318);
      ctx.fillStyle = P.gold;
      ctx.font = 'bold 16px Georgia, serif';
      ctx.fillText(`Press ${i + 1} or click`, x + w / 2, y + 380);
    });
    ctx.fillStyle = P.cream;
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Total score carries across rooms. Good hunting.', VIEW.w / 2, 660);
    return;
  }

  drawHud(ctx, state, now);
  drawPanel(ctx, scene, 'left', state, now);
  drawPanel(ctx, scene, 'right', state, now);
  drawMagnifier(ctx, scene, state);
  // keyboard cursor
  if (state.cursor && state.screen === 'play') {
    const side = state.cursor.side;
    const o = panelOrigin(side);
    const cx = o.x + state.cursor.sx, cy = o.y + state.cursor.sy;
    circle(ctx, cx, cy, RULES.cursorRadius, null, P.hint, 2.5);
    line(ctx, cx - 16, cy, cx - 6, cy, P.hint, 2);
    line(ctx, cx + 6, cy, cx + 16, cy, P.hint, 2);
    line(ctx, cx, cy - 16, cx, cy - 6, P.hint, 2);
    line(ctx, cx, cy + 6, cx, cy + 16, P.hint, 2);
  }
  drawBottomBar(ctx, state);

  if (state.screen === 'complete') {
    dim(ctx);
    card(ctx, 680, 380, 'Room complete!',
      [`You found all ${scene.diffs.length} differences in ${scene.name}.`,
       `Time bonus: +${state.lastBonus}   ·   Room score: ${state.lastRoomScore}`,
       `Total score: ${state.score}`],
      state.sceneIndex + 1 < SCENES.length ? 'Press Enter for the next room' : 'Press Enter to see your total');
  }
  if (state.screen === 'gameover') {
    dim(ctx);
    card(ctx, 680, 400, state.timeLeft <= 0 ? 'Time’s up!' : 'Workshop closed',
      [`You found ${state.found.size} of ${scene.diffs.length} differences in ${scene.name}.`,
       `Total score: ${state.score}`,
       `Best score: ${state.best}`],
      'Press Enter to try again · Esc for the menu');
  }
  if (state.screen === 'workshopDone') {
    dim(ctx);
    card(ctx, 720, 420, 'The workshop is yours!',
      ['All four rooms cleared — 28 differences found.',
       `Final score: ${state.score}`,
       `Best score: ${state.best}`,
       '',
       'Thank you for playing. The clocks all agree: it is time for tea.'],
      'Press Enter to play again');
  }
}

export { LEFT_X, RIGHT_X, PANEL_Y, BAR_Y };
