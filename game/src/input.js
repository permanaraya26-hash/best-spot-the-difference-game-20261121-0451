// input.js — mouse and keyboard, and nothing else.
// One job: turn canvas events into game actions (mark, hint, magnifier,
// menu, cursor moves) and hand them to main.js through callbacks.

import { pickPanel, hitBottomBar } from './render.js';
import { RULES, PANEL } from './config.js';

export function installInput(canvas, api) {
  function scaleEvent(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    api.onMouseMove(scaleEvent(e));
  });
  canvas.addEventListener('mouseleave', () => api.onMouseMove(null));
  canvas.addEventListener('click', (e) => {
    const p = scaleEvent(e);
    const bar = hitBottomBar(p.x, p.y);
    if (bar) { api.onBar(bar); return; }
    const pick = pickPanel(p.x, p.y);
    if (pick) api.onMark(pick.sx, pick.sy, pick.side);
    else api.onBackgroundClick(p);
  });

  window.addEventListener('keydown', (e) => {
    if (e.repeat && !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
      e.preventDefault();
      api.onCursorMove(k);
    } else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      api.onConfirm();
    } else if (k === 'h' || k === 'H') api.onBar('hint');
    else if (k === 'm' || k === 'M') api.onBar('magnifier');
    else if (k === 'Escape') api.onBar('menu');
    else if (k >= '1' && k <= '4') api.onDigit(Number(k));
    else if (k === 'Tab') {
      e.preventDefault();
      api.onTab();
    }
  });
}

// Find the nearest unfound difference to a click, if it is close enough.
export function nearestDiff(scene, found, sx, sy) {
  let best = null;
  let bestD = Infinity;
  for (const d of scene.diffs) {
    if (found.has(d.id)) continue;
    const dist = Math.hypot(d.x - sx, d.y - sy);
    const reach = d.r + RULES.clickRadiusBoost;
    if (dist <= reach && dist < bestD) { best = d; bestD = dist; }
  }
  return best;
}

export { PANEL };
