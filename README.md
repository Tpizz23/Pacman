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

Drag the yellow joystick in the direction you want to go. Release it to keep traveling in that direction. Turns queue until the next open intersection. The local server must remain running; `localhost` on a phone refers to the phone, not the Mac.

## Deploy to a VPS with Docker Compose

Requires Docker Engine and the Docker Compose plugin on the VPS. Clone the implementation branch (the game has not yet been merged into `main`):

```sh
git clone --branch codex/learning-pacman --single-branch https://github.com/Tpizz23/Pacman.git
cd Pacman
docker compose up -d --build
docker compose ps
```

The repository is private, so use your normal GitHub authentication or deploy key when cloning. Alternatively, upload `compose.yaml`, `Dockerfile`, `.dockerignore`, `docker/`, `index.html`, `style.css`, and `src/` together to one directory on the VPS, then run the Compose command from that directory. No `npm install` or separate build step is needed.

Open `http://YOUR-VPS-IP:8080` from your Mac, iPhone, or iPad. Port 8080 must be allowed by your VPS/provider firewall. By default, this serves the game to anyone who can reach that port.

To choose another host port:

```sh
PACMAN_PORT=8090 docker compose up -d --build
```

For an existing reverse proxy running on the VPS host, bind the game to localhost and route your domain's HTTPS traffic to `http://127.0.0.1:8080`:

```sh
PACMAN_BIND_ADDRESS=127.0.0.1 docker compose up -d --build
```

Put `PACMAN_PORT=8090` and/or `PACMAN_BIND_ADDRESS=127.0.0.1` in a `.env` file beside `compose.yaml` to keep those settings between commands. A proxy running in another container should instead share a Docker network and connect to `pacman:8080`; its own localhost refers to the proxy container. TLS and any desired access control are handled by your reverse proxy.

To update, inspect logs, or stop the game:

```sh
git pull --ff-only
docker compose up -d --build --pull always
docker compose logs --tail=100 pacman
docker compose down
```

The container uses the official Nginx Alpine image, runs as an unprivileged user with a read-only filesystem, and includes a health check and restart policy. It needs no database, persistent volumes, or secrets. Player preferences remain in each device's browser.

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
