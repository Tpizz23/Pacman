# Learning Pac-Man implementation plan

> Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Deliver a playable classic maze game with age 3 and age 7 learning modes on touch devices and Mac.

**Architecture:** Dependency-free browser ES modules. A pure simulation owns movement and game rules; a separate question generator owns learning content. Canvas draws the maze, while HTML supplies accessible controls and dialogs.

**Tech stack:** JavaScript, HTML, CSS, Node built-in test runner, Playwright browser verification.

**Spec:** `docs/superpowers/specs/2026-10-11-learning-pacman-design.md`

## Global constraints

- Start with five lives; reward streaks of 10 (age 7) or 3 (age 3).
- Questions freeze simulation; age 7 receives 12/5 seconds; age 3 retries and receives 12 seconds.
- Four changing maze layouts; progressively harder questions; integer division and nonnegative subtraction.
- Joystick on touch devices, arrow keys on Mac, explicit pause/resume, visibility pause.
- Local preferences only, no accounts or server data.

## Review focus

- A wrong preschool answer followed by a correction must not earn streak progress.
- A final power pellet must finish its question before the maze advances.
- A hidden tab or open dialog must never consume frightened time.
- Small landscape screens must keep controls usable without horizontal overflow.
- A ghost returning home must not immediately become an invisible collision hazard.

## Task 1: Questions and maze data

Files: `src/questions.js`, `src/mazes.js`, `tests/questions.test.js`, `tests/mazes.test.js`, `package.json`.

Interfaces: `createQuestion(settings, level, previousKey)` returns `{key,prompt,choices,answer,visual}`; `makeMaze(level)` returns `{width,height,tiles,player,ghosts,powers}`; `validateMaze(maze)` returns boolean.

- [x] Write generation tests covering every operation/difficulty/stage, three unique choices, exact division, subtraction, all preschool categories, and maze flood-fill reachability.
- [x] Run `npm test`; observe missing-module failures before implementing.
- [x] Implement bounded question generation and four connected maze layouts. Run `npm test` until green.

## Task 2: Simulation and input rules

Files: `src/game.js`, `src/input.js`, `tests/game.test.js`.

Interfaces: `new Game(settings)`, `game.step(seconds)`, `game.requestDirection(direction)`, `game.answer(choice)`, `game.continue()`, `game.pause()`, `game.resume()`; `joystickDirection(dx,dy)` yields a cardinal direction or null. State is readable for rendering and tests.

- [x] Write tests for question time freeze, correct/incorrect outcomes, retries and streaks, collision/respawn/game over, final power-pellet transition, and joystick dead zone.
- [x] Run `npm test` and verify failures identify absent behavior.
- [x] Implement tile-center movement, queued turns, distinct ghost targets, frightened/return states, capped progression, scores and lives. Rerun the suite.

## Task 3: Playable interface

Files: `index.html`, `src/main.js`, `src/render.js`, `src/audio.js`, `style.css`, `scripts/serve.mjs`, `scripts/build.mjs`, `tests/browser.spec.js`.

- [x] Write browser tests for mode selection, keyboard movement, questions, replay, joystick, mobile/tablet layout, and visibility interruption.
- [x] Run the browser tests against the initial page and observe missing-interface failures.
- [x] Implement the setup, HUD, maze renderer, question/feedback dialogs, joystick, pause/game-over screens, generated sounds and speech. Use a royal-blue maze with yellow/pink/cyan arcade accents, a dark cabinet frame, and bold rounded system typography. Keep the maze central and avoid marketing-page content.
- [x] Run unit and browser suites, inspect desktop and mobile screenshots and console errors, and fix observed issues.

## Task 4: Delivery and review

Files: `README.md`, `docs/verification.md`, `.gitignore`.

- [x] Document local running, LAN access for iPhone/iPad, mode rules, browser limitations, and tests.
- [x] Review the whole implementation against the spec and fix material findings with regression tests.
- [x] Run `npm test`, `npm run test:browser`, and `npm run build` on the final source. Commit and push implementation to the requested repository.

## Execution ledger

- User explicitly requested starting the build and creating GitHub repository. Execute inline in the new checkout; no additional worktree is needed because there is no existing application or concurrent work to protect.
- GitHub repository created private at `https://github.com/Tpizz23/Pacman`; design pushed to main.
- Publishing is outside this GitHub-build request; provide a local preview and repository source.

- Final verification: 22 Node tests and 22 Chromium/WebKit browser scenarios passed; static build passed. Independent review findings for retry scoring and multitouch ownership were fixed with regression tests.
