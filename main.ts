// main.ts — the hand-in program for "The Clockmaker's Workshop".
// Node 22, standard library only. It copies this repository's game/ and
// screenshots/ beside it into /output and writes /output/dossier.json with
// the vendored make.fun library, exactly as the kit's starter does. Outside
// the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The game itself is plain static files: game/index.html opens in desktop
// Chrome and plays with no network request.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps, as the kit's gate names them: at most 4 screenshots
// of at most 256 KiB each, at most 993 files and 48 MiB under game/, and the
// dossier text capped at 160 KiB. package.json marks this directory an ES
// module so Node parses main.ts (and vendor/makefun-game.ts) as ESM without
// a reparsing warning; it ships no dependencies and changes no output.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
