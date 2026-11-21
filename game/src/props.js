// props.js — the workshop's reusable vector props.
// One job: every drawable object (clock, gear, cat, lamp, jar...) as a small
// function that paints itself into a scene. Scenes compose these; nothing
// here knows about game state, panels, or differences.

const TAU = Math.PI * 2;

export function circle(ctx, x, y, r, fill, stroke, lw = 2) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

export function ellipse(ctx, x, y, rx, ry, fill, stroke, lw = 2) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

export function rect(ctx, x, y, w, h, fill, stroke, lw = 2) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

export function rrect(ctx, x, y, w, h, r, fill, stroke, lw = 2) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

export function poly(ctx, pts, fill, stroke, lw = 2) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

export function line(ctx, x1, y1, x2, y2, stroke, lw = 2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// A round wall clock. `minutes` sets the hands (0 = 12:00). `face` is the
// dial colour; `numeral` switches 12 <-> XII on the top mark.
export function drawWallClock(ctx, x, y, r, minutes, opts = {}) {
  const face = opts.face || '#f7ead2';
  const rim = opts.rim || '#6b421c';
  const hands = opts.hands || '#2b1d10';
  circle(ctx, x, y, r, face, rim, r * 0.14);
  circle(ctx, x, y, r * 0.86, null, rim, 1.5);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const big = i % 3 === 0;
    line(ctx, x + Math.sin(a) * r * (big ? 0.68 : 0.74), y - Math.cos(a) * r * (big ? 0.68 : 0.74),
      x + Math.sin(a) * r * 0.8, y - Math.cos(a) * r * 0.8, '#2b1d10', big ? 3 : 1.5);
  }
  ctx.fillStyle = '#2b1d10';
  ctx.font = `bold ${Math.round(r * 0.34)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(opts.numeral || '12', x, y - r * 0.52);
  const ha = ((minutes / 60) % 12) / 12 * TAU;
  const ma = (minutes % 60) / 60 * TAU;
  line(ctx, x, y, x + Math.sin(ha) * r * 0.48, y - Math.cos(ha) * r * 0.48, hands, 4);
  line(ctx, x, y, x + Math.sin(ma) * r * 0.72, y - Math.cos(ma) * r * 0.72, hands, 2.5);
  circle(ctx, x, y, r * 0.07, hands);
}

// A toothed gear. `teeth` changes the silhouette; `spokes` draws inner spokes.
export function drawGear(ctx, x, y, r, teeth, fill, opts = {}) {
  const rot = opts.rot || 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  const outer = r, inner = r * 0.82, root = r * 0.62;
  const step = TAU / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    ctx.lineTo(Math.cos(a) * root, Math.sin(a) * root);
    ctx.lineTo(Math.cos(a + step * 0.18) * outer, Math.sin(a + step * 0.18) * outer);
    ctx.lineTo(Math.cos(a + step * 0.42) * outer, Math.sin(a + step * 0.42) * outer);
    ctx.lineTo(Math.cos(a + step * 0.6) * inner, Math.sin(a + step * 0.6) * inner);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = opts.rim || '#6b421c';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  circle(ctx, 0, 0, r * 0.34, opts.hub || '#f7ead2', opts.rim || '#6b421c', 2.5);
  if (opts.spokes !== false) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      line(ctx, Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36,
        Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, opts.rim || '#6b421c', 2);
    }
  }
  circle(ctx, 0, 0, r * 0.09, '#2b1d10');
  ctx.restore();
}

// A sitting cat, drawn as one warm silhouette. `tailUp` flips the tail;
// `sleeping` closes the eyes and flattens the ears.
export function drawCat(ctx, x, y, s, coat, opts = {}) {
  const tailUp = opts.tailUp !== false;
  const sleeping = !!opts.sleeping;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = coat;
  ctx.strokeStyle = '#2b1d10';
  ctx.lineWidth = 2;
  // tail
  ctx.beginPath();
  if (tailUp) {
    ctx.moveTo(26, -6);
    ctx.quadraticCurveTo(52, -14, 48, -44);
    ctx.quadraticCurveTo(47, -52, 40, -50);
    ctx.quadraticCurveTo(40, -26, 22, -18);
  } else {
    ctx.moveTo(26, 2);
    ctx.quadraticCurveTo(52, 6, 54, -8);
    ctx.quadraticCurveTo(55, -16, 47, -14);
    ctx.quadraticCurveTo(40, -4, 22, -8);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // body
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 26, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  // haunches
  ctx.beginPath();
  ctx.ellipse(-14, 12, 16, 12, 0, 0, TAU);
  ctx.fill();
  // head
  circle(ctx, -6, -34, 17, coat, '#2b1d10', 2);
  // ears
  poly(ctx, [[-20, -44], [-24, -60], [-12, -48]], coat, '#2b1d10', 2);
  poly(ctx, [[6, -46], [10, -62], [18, -46]], coat, '#2b1d10', 2);
  if (!sleeping) {
    poly(ctx, [[-19, -46], [-21, -55], [-14, -48]], '#e88ca0');
    poly(ctx, [[8, -47], [10, -56], [15, -47]], '#e88ca0');
  }
  // face
  if (sleeping) {
    line(ctx, -14, -34, -8, -32, '#2b1d10', 1.5);
    line(ctx, -2, -32, 4, -34, '#2b1d10', 1.5);
  } else {
    circle(ctx, -12, -36, 2.6, '#2b1d10');
    circle(ctx, 2, -36, 2.6, '#2b1d10');
    circle(ctx, -12.8, -36.8, 0.9, '#fff');
    circle(ctx, 1.2, -36.8, 0.9, '#fff');
  }
  poly(ctx, [[-6, -29], [-3, -29], [-4.5, -26]], '#c0392b');
  line(ctx, -4.5, -26, -4.5, -23, '#2b1d10', 1.2);
  // whiskers
  line(ctx, -18, -28, -30, -30, '#2b1d10', 1);
  line(ctx, -18, -25, -30, -23, '#2b1d10', 1);
  line(ctx, 8, -28, 20, -30, '#2b1d10', 1);
  line(ctx, 8, -25, 20, -23, '#2b1d10', 1);
  ctx.restore();
}

// A desk lamp. `on` lights the bulb and casts a warm cone.
export function drawLamp(ctx, x, y, s, on) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (on) {
    const g = ctx.createRadialGradient(0, -58, 4, 0, -58, 90);
    g.addColorStop(0, 'rgba(255,214,120,0.55)');
    g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -58, 90, 0, TAU);
    ctx.fill();
  }
  line(ctx, -14, 40, 0, -40, '#2b1d10', 5);
  line(ctx, 0, -40, 26, -52, '#2b1d10', 5);
  poly(ctx, [[14, -66], [38, -66], [30, -44], [22, -44]], on ? '#ffd94a' : '#8a6a35', '#2b1d10', 2);
  circle(ctx, 26, -50, 6, on ? '#fff3c4' : '#d9c9a8', '#2b1d10', 1.5);
  ellipse(ctx, -14, 42, 20, 6, '#3a2a18', '#2b1d10', 2);
  ctx.restore();
}

export function drawJar(ctx, x, y, w, h, fill, opts = {}) {
  ctx.save();
  ctx.translate(x, y);
  rrect(ctx, -w / 2, -h, w, h, 6, fill, '#2b1d10', 2);
  rrect(ctx, -w / 2 - 2, -h - 8, w + 4, 10, 4, opts.lid || '#8a5a28', '#2b1d10', 2);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(-w / 2 + 4, -h + 6, 5, h - 12);
  if (opts.dots) {
    ctx.fillStyle = opts.dots;
    for (let i = 0; i < 3; i++) circle(ctx, -w / 4 + i * w / 4, -h / 2, 3, opts.dots);
  }
  ctx.restore();
}

export function drawBook(ctx, x, y, w, h, fill, tilt = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  rrect(ctx, 0, 0, w, h, 2, fill, '#2b1d10', 2);
  ctx.fillStyle = 'rgba(247,234,210,0.9)';
  ctx.fillRect(3, 3, w - 6, h - 6);
  line(ctx, 6, 8, w - 4, 8, '#2b1d10', 1);
  line(ctx, 6, 13, w - 8, 13, '#2b1d10', 1);
  line(ctx, 6, 18, w - 6, 18, '#2b1d10', 1);
  ctx.restore();
}

export function drawMug(ctx, x, y, s, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  rrect(ctx, -14, -20, 28, 24, 4, fill, '#2b1d10', 2);
  ctx.beginPath();
  ctx.arc(16, -8, 8, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = '#2b1d10';
  ctx.lineWidth = 3;
  ctx.stroke();
  ellipse(ctx, 0, -20, 14, 3, '#6b4f2a', '#2b1d10', 1.5);
  ctx.restore();
}

// Hand tools lying flat.
export function drawWrench(ctx, x, y, angle, len = 64) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  line(ctx, -len / 2, 0, len / 2, 0, '#9aa3ad', 7);
  circle(ctx, -len / 2, 0, 9, '#9aa3ad', '#2b1d10', 2);
  circle(ctx, -len / 2, 0, 4.5, '#241a12');
  circle(ctx, len / 2, 0, 8, '#9aa3ad', '#2b1d10', 2);
  circle(ctx, len / 2, 0, 3.5, '#241a12');
  ctx.restore();
}

export function drawScrewdriver(ctx, x, y, angle, len = 58) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  rrect(ctx, -len / 2, -5, len * 0.45, 10, 4, '#c0392b', '#2b1d10', 2);
  line(ctx, -len / 2 + len * 0.45, 0, len / 2, 0, '#c9ccd2', 4);
  poly(ctx, [[len / 2, -3], [len / 2 + 7, 0], [len / 2, 3]], '#c9ccd2', '#2b1d10', 1.5);
  ctx.restore();
}

export function drawHammer(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  line(ctx, -26, 0, 26, 0, '#8a5a28', 7);
  rrect(ctx, 18, -9, 18, 18, 3, '#6f7680', '#2b1d10', 2);
  ctx.restore();
}

// A four-pane window. `sky` is a [top, bottom] gradient pair; `moon` is
// 'crescent' | 'full' | null; `stars` is a list of [x, y, r] in window space.
export function drawWindow(ctx, x, y, w, h, opts = {}) {
  const { sky = ['#3b2d5e', '#7a4a6e'], moon = 'crescent', stars = [] } = opts;
  ctx.save();
  ctx.translate(x, y);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, sky[0]);
  g.addColorStop(1, sky[1]);
  rrect(ctx, 0, 0, w, h, 6, g, '#2b1d10', 3);
  ctx.save();
  ctx.beginPath();
  ctx.rect(4, 4, w - 8, h - 8);
  ctx.clip();
  for (const [sx, sy, sr] of stars) {
    circle(ctx, sx, sy, sr, '#ffe9a8');
    circle(ctx, sx, sy, sr * 2.4, 'rgba(255,233,168,0.25)');
  }
  if (moon === 'crescent') {
    circle(ctx, w * 0.68, h * 0.3, 20, '#f7ead2');
    circle(ctx, w * 0.68 + 9, h * 0.3 - 4, 17, sky[0]);
  } else if (moon === 'full') {
    circle(ctx, w * 0.68, h * 0.3, 22, '#f7ead2');
    circle(ctx, w * 0.68 - 7, h * 0.3 - 4, 3.5, '#d9c9a8');
    circle(ctx, w * 0.68 + 6, h * 0.3 + 6, 2.5, '#d9c9a8');
  }
  // distant rooftops
  ctx.fillStyle = '#241a33';
  poly(ctx, [[0, h], [0, h * 0.82], [w * 0.3, h * 0.72], [w * 0.55, h * 0.84], [w, h * 0.78], [w, h]]);
  ctx.fillStyle = '#ffd94a';
  ctx.fillRect(w * 0.18, h * 0.8, 5, 6);
  ctx.fillRect(w * 0.72, h * 0.84, 5, 6);
  ctx.restore();
  // mullions
  line(ctx, w / 2, 0, w / 2, h, '#2b1d10', 5);
  line(ctx, 0, h / 2, w, h / 2, '#2b1d10', 5);
  rrect(ctx, -6, -6, w + 12, h + 12, 8, null, '#8a5a28', 6);
  ctx.restore();
}

export function drawPlant(ctx, x, y, s, leaves = 5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // pot
  poly(ctx, [[-16, 0], [16, 0], [12, 22], [-12, 22]], '#c47b4a', '#2b1d10', 2);
  rect(ctx, -18, -4, 36, 6, '#a85f36', '#2b1d10', 2);
  for (let i = 0; i < leaves; i++) {
    const a = -Math.PI / 2 + (i - (leaves - 1) / 2) * 0.42;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(Math.cos(a) * 26, Math.sin(a) * 26 - 8, Math.cos(a) * 40, Math.sin(a) * 40);
    ctx.quadraticCurveTo(Math.cos(a) * 14, Math.sin(a) * 14 + 4, 0, -2);
    ctx.fillStyle = i % 2 ? '#5d8a4a' : '#6fa055';
    ctx.fill();
    ctx.strokeStyle = '#2b1d10';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  circle(ctx, 0, -30, 4, '#e8b64c');
  ctx.restore();
}

export function drawButterfly(ctx, x, y, s, wing = '#e88ca0') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ellipse(ctx, -7, -4, 8, 11, wing, '#2b1d10', 1.5);
  ellipse(ctx, 7, -4, 8, 11, wing, '#2b1d10', 1.5);
  ellipse(ctx, -6, 8, 5, 7, '#f7ead2', '#2b1d10', 1.2);
  ellipse(ctx, 6, 8, 5, 7, '#f7ead2', '#2b1d10', 1.2);
  line(ctx, 0, -8, 0, 8, '#2b1d10', 2.5);
  ctx.restore();
}

export function drawBird(ctx, x, y, s, body = '#3f6fb5') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ellipse(ctx, 0, 0, 14, 10, body, '#2b1d10', 2);
  circle(ctx, 12, -8, 8, body, '#2b1d10', 2);
  poly(ctx, [[18, -10], [26, -7], [18, -4]], '#e8b64c', '#2b1d10', 1.5);
  circle(ctx, 14, -10, 1.8, '#2b1d10');
  poly(ctx, [[-12, -4], [-22, -10], [-20, 0]], body, '#2b1d10', 1.5);
  line(ctx, -4, 9, -4, 14, '#e8b64c', 2);
  line(ctx, 3, 9, 3, 14, '#e8b64c', 2);
  ctx.restore();
}

export function drawCandle(ctx, x, y, s, lit) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (lit) {
    const g = ctx.createRadialGradient(0, -26, 2, 0, -26, 26);
    g.addColorStop(0, 'rgba(255,214,120,0.8)');
    g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -26, 26, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.quadraticCurveTo(6, -26, 0, -18);
    ctx.quadraticCurveTo(-6, -26, 0, -34);
    ctx.fillStyle = '#ffd94a';
    ctx.fill();
  }
  rect(ctx, -5, -18, 10, 22, '#f7ead2', '#2b1d10', 1.5);
  ellipse(ctx, 0, 6, 12, 3.5, '#8a6a35', '#2b1d10', 1.5);
  ctx.restore();
}

export function drawStar(ctx, x, y, r, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}
