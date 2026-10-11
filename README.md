# Pac·Learn

A classic Pac-Man-style family maze arcade, with a math mode for age 7 and a picture-question mode for age 3. Runs entirely in the browser with no accounts, microphone, or backend. Graphics and arcade sounds are generated locally; preschool speech uses the browser's available voices.

## Play locally on Mac

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open [the local game](http://localhost:5173). Pick a learning mode and press **Let’s play**. Use the arrow keys to steer and **P** to pause/resume. Use Tab and Enter/Space for menu and answer buttons.

## Play on iPhone or iPad

1. Start the server on your Mac with `npm run dev`.
2. Connect the Mac and phone/tablet to the same Wi-Fi network.
3. Find the Mac’s local IP in System Settings → Wi-Fi → Details → TCP/IP.
4. Open `http://YOUR-MAC-IP:5173` in Safari. Allow the local server through the Mac firewall if prompted.

Drag the yellow joystick in the direction you want to go. Release it to keep traveling in that direction. Turns queue until the next open intersection. The local server must remain running; `localhost` on a phone refers to the phone, not the Mac. A hosted deployment is not included in this repository setup.

## Learning modes

**Math explorer (7+)**: choose addition, subtraction, multiplication, or division and Easy, Medium, or Hard. Each power pellet pauses the game for a three-choice question. Correct answers automatically resume the game with 12 seconds of blue ghosts; incorrect answers show feedback and wait for Continue, then give 5 seconds. The normal reference duration is 8 seconds, so this represents a bonus or deduction. Ten correct answers in a row earn one extra life. Problems become harder with map level; subtraction answers are nonnegative, and division is exact.

**Little explorer (3+)**: choose counting objects, number names, shapes/colors, repeating patterns, or a mix. Picture choices and spoken prompts support emerging readers. Incorrect answers allow another try. A correct answer automatically resumes the game with 12 seconds of blue ghosts, including after a retry. Three first-attempt correct answers in a row earn an extra life; a corrected answer completes the question without adding streak credit. Patterns, quantities, and shapes progress with map level. Ghosts move more slowly in this mode.

Both modes start with five lives. Clear every pellet to advance to a new maze. Four connected layouts cycle with gradually faster ghosts and bounded question progression. Capture blue ghosts for increasing points. Captured ghosts return home harmlessly before rejoining the game. Pause freezes all game timers; switching tabs or apps automatically pauses and requires an explicit resume.

Sound can be muted. Speech availability and voice quality depend on the device/browser; visible prompts remain available if speech fails. Preferences are stored in this browser only. Game progress is not saved between reloads.

## Development and verification

```sh
npm test
npx playwright install chromium webkit
npm run test:browser
npm run build
```

`npm test` checks the pure simulation, question generation, and maze reachability using Node’s test runner. Browser tests cover Chromium and WebKit, including phone/tablet/landscape sizes, joystick pointer input, questions, pausing, and preference recovery. The browser suite uses controlled game-model fixtures for reaching power pellets; keyboard movement is exercised through actual key events. Real iPhone/iPad touch and spoken audio still need a physical-device check.

`npm run build` creates a static `dist/` folder suitable for static hosting. It needs no build-time or runtime secrets. Serve the folder with an HTTP server; ES modules do not run correctly by opening `index.html` with a `file://` URL.

## Source map

- `src/game.js`: simulation, ghost behavior, scores, lives, timers, and learning streaks.
- `src/questions.js`: arithmetic and preschool question generation.
- `src/mazes.js`: four deterministic layouts, tunnels, and connectivity validation.
- `src/main.js`: menus, question dialogs, browser lifecycle, and input wiring.
- `src/render.js`: canvas maze and character drawing.
- `src/audio.js`: generated arcade tones and speech prompts.
- `tests/`: model tests and browser flows.

The agreed design and implementation plan are in `docs/superpowers/`.
