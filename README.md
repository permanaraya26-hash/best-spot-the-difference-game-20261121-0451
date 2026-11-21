[![Make the best spot the difference game](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/permanaraya26-hash/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/permanaraya26-hash/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# The Clockmaker’s Workshop — Spot the Difference

**The Clockmaker’s Workshop** is an original spot-the-difference game built for the make.fun “Make the best spot the difference game” bounty (best-spot-the-difference-game-20261121-0451). It runs entirely from static files in `game/` — no build step, no network requests, all art drawn procedurally on canvas, all sounds synthesized with WebAudio.

Two pictures hang side by side. Seven small things changed. Find them all before the clock runs out.

## What is in the game

- **4 rooms, 28 differences** — The Workbench, The Gear Wall, The Window at Dusk, and The Grandfather Clock, each with 7 differences hidden by design (a clock showing another time, a cat’s tail on the other side, a moon turned full, a gear that lost three teeth…) and a tightening timer.
- **A real hunt** — click a difference on either picture to ring it on both; a wrong click costs 8 seconds; streaks multiply the score; clearing a room banks a time bonus.
- **Hints that behave** — 3 hints per room, each pulsing a gold ring around one difference still hidden.
- **A magnifier** — hold the lens over either picture to zoom in 2.1× and study the fine print.
- **Keyboard play** — arrow keys move the crosshair, Enter marks a spot, Tab switches pictures, H hints, M magnifies, Esc returns to the menu.
- **Sound, synthesized** — a chime that rises with your streak, a buzz for a miss, a little arpeggio when a room clears. No audio files.
- **Best scores** — room bests and a total best, kept in localStorage.

## How to play

Serve `game/` with any static server and open `game/index.html` in a desktop browser:

```sh
node serve.ts   # http://localhost:8080
```

Or open `game/index.html` directly from disk. Click a difference on either picture — or move the crosshair with the arrow keys and press Enter. Find all 7 before the timer ends to clear the room.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.
- `game/index.html` — the shell; `game/src/main.js` — state machine and loop; `game/src/scenes.js` — the four rooms and their differences; `game/src/props.js` — the vector props (clocks, gears, the cat, the lamp…); `game/src/render.js` — every frame; `game/src/input.js` — mouse and keyboard; `game/src/audio.js` — synthesized sounds; `game/src/config.js` — tuning and palette.
- `screenshots/` — 4 real renders of the game’s own code.
- `vendor/makefun-game.ts` — the kit’s dossier library, unchanged.
- `LICENSE` — MIT.

## Screenshots

1. `1-cover.jpg` — The Workbench mid-hunt: 3 differences found and ringed, 4 still hidden.
2. `2-magnifier.jpg` — The Gear Wall with the magnifier open and a hint pulsing.
3. `3-rooms.jpg` — the room menu, the first room cleared.
4. `4-complete.jpg` — The Workbench cleared, fanfare and time bonus.
