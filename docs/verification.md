# Verification record

October 11, 2026

## Implemented scope

- Two selectable learning modes, all four arithmetic operations, and three math difficulties.
- Counting, number-name matching, shapes/colors, repeating patterns, and mixed preschool questions.
- Four validated, connected maze layouts, four ghosts, power-pellet question pauses, frightened chasing and returning ghosts.
- Five starting lives, age-specific streak rewards, scores, respawns, and game over/replay.
- Joystick pointer input, arrow keys, responsive phone/tablet/desktop layouts, pause and focus-loss handling.
- Locally saved preferences, sound toggle, browser speech, and generated arcade graphics/audio.

## Checks

Model suite: `npm test`. Browser suite: `npm run test:browser` with Chromium and WebKit. Static packaging: `npm run build`.

The initial 21 model tests and 14 browser scenarios passed. Follow-up regression checks add null-preference recovery, preschool pattern variation, and answered-question interruption handling. Final counts and review findings will be recorded after the complete final run.

Visual inspection: desktop setup at 1200px and active game at 390 × 844. Browser console had zero errors or warnings in the inspected session. Browser scenarios also check 375 × 667, 768 × 1024, and 844 × 390 for horizontal overflow and usable answers/joystick.

Browser tooling required an external npm cache and temporary browser downloads, plus permission to launch browser processes outside the macOS sandbox. These are test-environment requirements, not game runtime dependencies.

## Limits

No physical iPhone/iPad was available for verification. Device-specific speech output, real finger steering, and Mac firewall/LAN access need a family-device check. Browser tests verify WebKit behavior and emulated screen sizes; they do not establish physical-device performance or speech audibility. The game has not been published to a hosted URL.
