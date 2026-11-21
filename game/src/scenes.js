// scenes.js — the four rooms of the workshop.
// One job: what each scene looks like, and where its 7 differences hide.
// draw(ctx, R) paints the scene in a 600x636 space; R=false is the left
// panel, R=true the right panel with every difference applied. A difference
// is only ever a branch on R inside the drawing, so the two panels can never
// drift apart by accident.

import {
  circle, ellipse, rect, rrect, poly, line,
  drawWallClock, drawGear, drawCat, drawLamp, drawJar, drawBook,
  drawMug, drawWrench, drawScrewdriver, drawHammer, drawWindow,
  drawPlant, drawButterfly, drawBird, drawCandle, drawStar,
} from './props.js';
import { PALETTE as P } from './config.js';

function wall(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 636);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 600, 636);
}

function floorboards(ctx, y) {
  ctx.fillStyle = P.floor;
  ctx.fillRect(0, y, 600, 636 - y);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 600; x += 75) line(ctx, x, y, x, 636, 'rgba(0,0,0,0.25)', 2);
  line(ctx, 0, y, 600, y, '#2b1d10', 3);
}

function pegboard(ctx, x, y, w, h) {
  rrect(ctx, x, y, w, h, 8, '#b98a5e', '#2b1d10', 2.5);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let px = x + 14; px < x + w - 8; px += 22)
    for (let py = y + 14; py < y + h - 8; py += 22) {
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
}

function bench(ctx, y) {
  rect(ctx, 0, y, 600, 636 - y, P.wood, '#2b1d10', 3);
  rect(ctx, 0, y, 600, 10, P.woodDark, null);
  line(ctx, 0, y + 34, 600, y + 34, 'rgba(0,0,0,0.2)', 2);
}

// ---------------------------------------------------------------- scene 1
function drawWorkbench(ctx, R) {
  wall(ctx, '#c98f4e', '#a96f33');
  floorboards(ctx, 520);
  // window, dusk sky
  drawWindow(ctx, 36, 40, 150, 130, {
    moon: R ? 'full' : 'crescent',
    stars: [[30, 26, 2], [95, 18, 2.4], [120, 48, 1.8], [60, 60, 1.6], [15, 80, 2]],
  });
  // pegboard with tools and gears
  pegboard(ctx, 230, 46, 190, 130);
  drawGear(ctx, 268, 92, 26, 8, P.brass, { rot: 0.3 });
  drawGear(ctx, 322, 130, 20, 8, P.copper, { rot: 0.9 });
  if (R) drawGear(ctx, 386, 88, 22, 7, P.teal, { rot: 0.2 }); // difference 6
  drawWrench(ctx, 360, 150, 0.5);
  drawHammer(ctx, 262, 152, -0.35);
  // wall clock: 10:10 on the left, 2:40 on the right
  drawWallClock(ctx, 492, 108, 54, R ? 160 : 610);
  // shelf with jars and books
  rect(ctx, 330, 208, 220, 10, P.woodDark, '#2b1d10', 2);
  drawJar(ctx, 372, 208, 34, 44, P.teal, { dots: '#f7ead2' });
  drawJar(ctx, 420, 208, 30, 38, '#c47b4a');
  drawBook(ctx, 452, 176, 16, 32, P.red, 0.08);
  drawBook(ctx, 470, 176, 16, 32, P.blue, -0.05);
  drawBook(ctx, 488, 176, 16, 32, P.green, 0.12);
  // bench and everything on it
  bench(ctx, 500);
  drawCat(ctx, 148, 462, 1, '#3a3a3a', { tailUp: !R }); // difference 2
  drawMug(ctx, 300, 478, 1.15, R ? P.blue : P.red); // difference 3
  if (!R) drawScrewdriver(ctx, 392, 512, 0.22); // difference 4
  drawLamp(ctx, 512, 452, 1, !R); // difference 5
  // scattered gears and a notebook on the bench
  drawGear(ctx, 232, 540, 22, 8, P.brass, { rot: 0.6 });
  drawGear(ctx, 452, 556, 16, 7, P.copper, { rot: 1.2 });
  drawBook(ctx, 330, 540, 52, 34, '#7a4a6e', 0.03);
}

// ---------------------------------------------------------------- scene 2
function drawGearWall(ctx, R) {
  wall(ctx, '#8a6a35', '#6b4f2a');
  floorboards(ctx, 540);
  // a shelf along the bottom with the oil can
  rect(ctx, 30, 540, 540, 12, P.woodDark, '#2b1d10', 2);
  // the great interlocked gears
  drawGear(ctx, 180, 260, 112, R ? 9 : 12, P.brass, { rot: 0.15 }); // difference 6
  drawGear(ctx, 384, 196, 82, 9, R ? P.copper : P.brass, { rot: 0.7 }); // difference 1
  drawGear(ctx, 420, 420, 56, 8, P.teal, { rot: 1.1 });
  drawGear(ctx, 148, 470, 70, 10, '#b98a2e', { rot: 0.4 });
  drawGear(ctx, 300, 380, 40, 7, '#9aa3ad', { rot: 0.2 });
  if (R) drawStar(ctx, 420, 420, 14, '#ffd94a'); // difference 7 (star in the hub)
  // butterfly resting on the great gear
  if (!R) drawButterfly(ctx, 232, 196, 1); // difference 3
  // wall clock, present on the left only
  if (!R) drawWallClock(ctx, 488, 92, 46, 355); // difference 2
  // pendulum clock in the middle
  rrect(ctx, 262, 330, 76, 120, 8, '#6b421c', '#2b1d10', 2.5);
  circle(ctx, 300, 366, 26, '#f7ead2', '#2b1d10', 2);
  line(ctx, 300, 392, 300 + (R ? 14 : -14), 428, '#2b1d10', 3); // difference 5
  circle(ctx, 300 + (R ? 14 : -14), 432, 9, P.brass, '#2b1d10', 2);
  // oil can on the shelf, present on the left only
  if (!R) { // difference 4
    ctx.save();
    ctx.translate(516, 522);
    rrect(ctx, -16, -22, 32, 26, 4, '#9aa3ad', '#2b1d10', 2);
    poly(ctx, [[14, -18], [26, -30], [26, -24], [14, -10]], '#9aa3ad', '#2b1d10', 2);
    line(ctx, -8, -22, -8, -30, '#2b1d10', 3);
    ctx.restore();
  }
  // scattered bolts on the floor
  circle(ctx, 90, 580, 5, '#9aa3ad', '#2b1d10', 1.5);
  circle(ctx, 120, 592, 4, '#9aa3ad', '#2b1d10', 1.5);
  circle(ctx, 470, 586, 5, '#9aa3ad', '#2b1d10', 1.5);
}

// ---------------------------------------------------------------- scene 3
function drawDuskWindow(ctx, R) {
  wall(ctx, '#7a4a6e', '#5d3550');
  floorboards(ctx, 520);
  // curtains
  poly(ctx, [[120, 40], [170, 40], [150, 330], [110, 330]], '#8a2f3c', '#2b1d10', 2);
  poly(ctx, [[430, 40], [480, 40], [490, 330], [450, 330]], '#8a2f3c', '#2b1d10', 2);
  if (!R) { // difference 7: the left curtain's gold tie
    line(ctx, 128, 190, 162, 196, '#e8b64c', 5);
    circle(ctx, 145, 193, 5, '#e8b64c', '#2b1d10', 1.5);
  }
  // the big window; one star is missing on the right
  const stars = [[40, 40, 2.2], [120, 26, 2], [200, 60, 2.6], [250, 30, 1.8],
    [90, 110, 2], [170, 140, 2.2], [260, 120, 2], [60, 180, 1.8], [210, 190, 2.4]];
  drawWindow(ctx, 150, 60, 300, 260, {
    sky: ['#2c2350', '#8a4a6e'],
    moon: 'crescent',
    stars: R ? stars.filter((s) => !(s[0] === 200 && s[1] === 60)) : stars, // difference 1
  });
  // bird on the sill, left only
  if (!R) drawBird(ctx, 300, 336, 1); // difference 4
  // shelves with jars
  rect(ctx, 30, 400, 180, 10, P.woodDark, '#2b1d10', 2);
  rect(ctx, 390, 400, 180, 10, P.woodDark, '#2b1d10', 2);
  drawJar(ctx, 84, 400, 36, 48, R ? P.red : P.teal, { dots: '#f7ead2' }); // difference 2
  drawJar(ctx, 140, 400, 30, 40, '#c47b4a');
  drawJar(ctx, 440, 400, 34, 44, P.green, { dots: '#ffd94a' });
  drawJar(ctx, 500, 400, 30, 40, P.blue);
  drawBook(ctx, 530, 368, 16, 32, P.red, 0.1);
  // plant on the sill, five leaves left, four right
  drawPlant(ctx, 492, 318, 1, R ? 4 : 5); // difference 3
  // picture frame: mountains left, sun right
  rrect(ctx, 452, 428, 104, 78, 4, '#f7ead2', '#8a5a28', 4);
  ctx.save();
  ctx.beginPath();
  ctx.rect(460, 436, 88, 62);
  ctx.clip();
  if (!R) {
    poly(ctx, [[460, 498], [486, 452], [510, 498]], '#5d8a4a');
    poly(ctx, [[496, 498], [522, 446], [548, 498]], '#3f6fb5');
    circle(ctx, 524, 452, 9, '#e8b64c');
  } else {
    circle(ctx, 504, 466, 16, '#e8b64c', '#c47b4a', 2);
    line(ctx, 488, 446, 520, 446, '#e8b64c', 3);
    line(ctx, 488, 486, 520, 486, '#e8b64c', 3);
  }
  ctx.restore();
  // table with a candle, lit left, unlit right
  rect(ctx, 60, 520, 190, 12, P.wood, '#2b1d10', 2);
  rect(ctx, 70, 532, 10, 88, P.woodDark, '#2b1d10', 2);
  rect(ctx, 230, 532, 10, 88, P.woodDark, '#2b1d10', 2);
  drawCandle(ctx, 120, 508, 1.1, !R); // difference 5
  drawMug(ctx, 200, 506, 1, P.teal);
}

// ---------------------------------------------------------------- scene 4
function drawGrandfather(ctx, R) {
  wall(ctx, '#5d3550', '#46305e');
  floorboards(ctx, 540);
  // chandelier: three candles left, two right
  line(ctx, 300, 0, 300, 34, '#2b1d10', 4);
  circle(ctx, 300, 44, 34, 'rgba(0,0,0,0)', '#d9a441', 3);
  drawCandle(ctx, 272, 46, 0.9, true);
  drawCandle(ctx, 300, 52, 0.9, true);
  if (!R) drawCandle(ctx, 328, 46, 0.9, true); // difference 6
  // portraits
  rrect(ctx, 52, 84, 92, 112, 4, '#d9a441', '#2b1d10', 3);
  rrect(ctx, 60, 92, 76, 96, 2, '#c9a06a', '#2b1d10', 2);
  circle(ctx, 98, 132, 22, '#f7d9b0', '#2b1d10', 2);
  circle(ctx, 88, 128, 2.5, '#2b1d10');
  circle(ctx, 108, 128, 2.5, '#2b1d10');
  if (!R) line(ctx, 90, 148, 106, 148, '#2b1d10', 2.5); // difference 3: moustache
  poly(ctx, [[76, 168], [120, 168], [112, 188], [84, 188]], '#3f6fb5', '#2b1d10', 2);
  rrect(ctx, 456, 84, 92, 112, 4, '#d9a441', '#2b1d10', 3);
  rrect(ctx, 464, 92, 76, 96, 2, '#8aa06a', '#2b1d10', 2);
  drawStar(ctx, 502, 132, 16, '#e8b64c');
  circle(ctx, 502, 132, 5, '#c0392b');
  // the grandfather clock
  rrect(ctx, 236, 130, 128, 420, 10, '#6b421c', '#2b1d10', 3);
  rrect(ctx, 248, 142, 104, 120, 8, '#8a5a28', '#2b1d10', 2);
  drawWallClock(ctx, 300, 202, 48, 610, { numeral: R ? 'XII' : '12' }); // difference 2
  rrect(ctx, 248, 274, 104, 150, 6, '#f7ead2', '#2b1d10', 2);
  line(ctx, 300, 286, 300 + (R ? 16 : -16), 380, '#2b1d10', 3); // difference 1: pendulum
  circle(ctx, 300 + (R ? 16 : -16), 388, 14, P.brass, '#2b1d10', 2);
  circle(ctx, 300, 452, 10, P.brass, '#2b1d10', 2);
  // rug with stripes
  poly(ctx, [[120, 540], [480, 540], [500, 620], [100, 620]], '#8a2f3c', '#2b1d10', 2.5);
  const stripes = R ? [180, 300, 420] : [160, 240, 320, 400, 470]; // difference 4
  for (const sx of stripes) line(ctx, sx, 546, sx + 8, 614, '#e8b64c', 6);
  // side table with a vase of flowers
  rect(ctx, 40, 470, 110, 10, P.wood, '#2b1d10', 2);
  rect(ctx, 48, 480, 9, 80, P.woodDark, '#2b1d10', 2);
  rect(ctx, 132, 480, 9, 80, P.woodDark, '#2b1d10', 2);
  poly(ctx, [[86, 470], [108, 470], [104, 432], [90, 432]], '#3f6fb5', '#2b1d10', 2);
  const flowers = R ? 5 : 3; // difference 5
  for (let i = 0; i < flowers; i++) {
    const fx = 78 + i * 9;
    line(ctx, 97, 434, fx, 412 - (i % 2) * 6, '#5d8a4a', 2);
    circle(ctx, fx, 410 - (i % 2) * 6, 6, i % 2 ? '#e88ca0' : '#e8b64c', '#2b1d10', 1.5);
  }
  // the sleeping cat on the rug
  drawCat(ctx, 500, 596, 0.85, '#3a3a3a', { tailUp: false, sleeping: true });
  // a little mouse by the clock, right only
  if (R) { // difference 7
    ellipse(ctx, 392, 592, 14, 8, '#9aa3ad', '#2b1d10', 1.5);
    circle(ctx, 404, 586, 6, '#9aa3ad', '#2b1d10', 1.5);
    circle(ctx, 402, 581, 2.5, '#c47b4a');
    line(ctx, 380, 594, 366, 590, '#2b1d10', 1.5);
  }
}

export const SCENES = [
  {
    id: 'workbench', name: 'The Workbench', sub: 'Warm-up · 7 differences · 3:00',
    timeLimit: 180, draw: drawWorkbench,
    diffs: [
      { id: 'clock', x: 492, y: 108, r: 44, label: 'The clock shows a different time' },
      { id: 'tail', x: 148, y: 452, r: 36, label: 'The cat’s tail changed sides' },
      { id: 'mug', x: 300, y: 472, r: 26, label: 'The mug changed colour' },
      { id: 'driver', x: 392, y: 508, r: 30, label: 'A screwdriver vanished' },
      { id: 'lamp', x: 512, y: 440, r: 38, label: 'The lamp went out' },
      { id: 'gear', x: 386, y: 88, r: 26, label: 'A new gear appeared on the pegboard' },
      { id: 'moon', x: 108, y: 84, r: 26, label: 'The moon turned full' },
    ],
  },
  {
    id: 'gearwall', name: 'The Gear Wall', sub: 'Brass & copper · 7 differences · 2:30',
    timeLimit: 150, draw: drawGearWall,
    diffs: [
      { id: 'colour', x: 384, y: 196, r: 62, label: 'A gear turned from brass to copper' },
      { id: 'clock', x: 488, y: 92, r: 40, label: 'A wall clock is missing' },
      { id: 'fly', x: 232, y: 196, r: 24, label: 'A butterfly flew away' },
      { id: 'oil', x: 516, y: 522, r: 28, label: 'The oil can is gone' },
      { id: 'pendulum', x: 300, y: 408, r: 30, label: 'The pendulum swung the other way' },
      { id: 'teeth', x: 180, y: 260, r: 82, label: 'The great gear lost three teeth' },
      { id: 'star', x: 420, y: 420, r: 30, label: 'A star appeared in a gear’s hub' },
    ],
  },
  {
    id: 'duskwindow', name: 'The Window at Dusk', sub: 'Quiet evening · 7 differences · 2:30',
    timeLimit: 150, draw: drawDuskWindow,
    diffs: [
      { id: 'star', x: 320, y: 122, r: 20, label: 'A star went out over the rooftops' },
      { id: 'jar', x: 84, y: 378, r: 26, label: 'A jar changed colour' },
      { id: 'plant', x: 492, y: 296, r: 30, label: 'The plant lost a leaf' },
      { id: 'bird', x: 300, y: 332, r: 26, label: 'A bird left the windowsill' },
      { id: 'candle', x: 120, y: 496, r: 28, label: 'The candle went out' },
      { id: 'picture', x: 504, y: 466, r: 30, label: 'The picture changed its view' },
      { id: 'tie', x: 145, y: 193, r: 24, label: 'The curtain lost its gold tie' },
    ],
  },
  {
    id: 'grandfather', name: 'The Grandfather Clock', sub: 'The final room · 7 differences · 2:00',
    timeLimit: 120, draw: drawGrandfather,
    diffs: [
      { id: 'pendulum', x: 300, y: 380, r: 30, label: 'The pendulum swung the other way' },
      { id: 'numeral', x: 300, y: 180, r: 26, label: 'The clock’s 12 became XII' },
      { id: 'moustache', x: 98, y: 144, r: 28, label: 'The portrait lost its moustache' },
      { id: 'rug', x: 300, y: 580, r: 44, label: 'The rug lost two stripes' },
      { id: 'flowers', x: 96, y: 420, r: 30, label: 'Two flowers bloomed in the vase' },
      { id: 'candles', x: 328, y: 40, r: 26, label: 'A chandelier candle went out' },
      { id: 'mouse', x: 390, y: 590, r: 24, label: 'A mouse appeared by the clock' },
    ],
  },
];
