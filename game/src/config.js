// config.js — tuning and palette for "The Clockmaker's Workshop".
// One job: every number the game balances on lives here, so tuning never
// means hunting through the drawing code.

export const VIEW = { w: 1280, h: 800 };
export const HUD_H = 64;
export const PANEL = { w: 600, h: 636, gap: 40, top: 76 };
export const BAR_H = 52; // bottom bar height

export const PALETTE = {
  page: '#241a12',
  hud: '#2e2115',
  hudLine: '#6b4f2a',
  cream: '#f7ead2',
  gold: '#e8b64c',
  goldDim: '#b98a2e',
  ink: '#2b1d10',
  panelFrame: '#8a6a35',
  panelShadow: 'rgba(0,0,0,0.45)',
  wall: '#c98f4e',
  wallDark: '#a96f33',
  floor: '#7a5230',
  wood: '#8a5a28',
  woodDark: '#6b421c',
  brass: '#d9a441',
  brassDark: '#a67c2e',
  copper: '#c47b4a',
  red: '#c0392b',
  teal: '#2e7f7a',
  green: '#5d8a4a',
  blue: '#3f6fb5',
  skyDusk: '#3b2d5e',
  skyDusk2: '#7a4a6e',
  found: '#37d67a',
  wrong: '#ff5a4e',
  hint: '#ffd94a',
};

export const RULES = {
  wrongClickSeconds: 8, // time lost on a wrong click
  hintCount: 3, // hints per scene
  hintSeconds: 2.5, // how long a hint ring pulses
  wrongFlashMs: 450,
  foundPopMs: 420,
  magnifierRadius: 92,
  magnifierZoom: 2.1,
  cursorRadius: 10,
  clickRadiusBoost: 6, // forgiveness around a difference centre
};

// Points: base per find, streak bonus, scene-clear time bonus.
export const SCORE = {
  find: 100,
  streakStep: 25,
  streakCap: 150,
  clearPerSecondLeft: 10,
};

export const SCENE_ORDER = ['workbench', 'gearwall', 'duskwindow', 'grandfather'];
