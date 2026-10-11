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

Final result: **22 model tests passed, 24 browser scenarios passed (12 each in Chromium and WebKit), and the static build succeeded.** Follow-up checks cover null-preference recovery, preschool pattern variation, answered-question interruption handling, emulated touchscreen events, pointer cancellation, and a second pointer releasing while the first pointer continues steering.

An independent whole-implementation review found two issues: corrected preschool answers did not receive their 100-point bonus, and non-owning pointer releases interrupted joystick steering. Both were reproduced with failing regression tests, fixed, and included in the final green suites. Corrected answers now earn points while retaining zero first-attempt streak credit. Joystick release handlers now check pointer ownership.

Visual inspection: desktop setup at 1200px and active game at 390 × 844. Browser console had zero errors or warnings in the inspected session. Browser scenarios also check 375 × 667, 768 × 1024, and 844 × 390 for horizontal overflow and usable answers/joystick.

Browser tooling required an external npm cache and temporary browser downloads, plus permission to launch browser processes outside the macOS sandbox. These are test-environment requirements, not game runtime dependencies.

## Limits

No physical iPhone/iPad was available for verification. Device-specific speech output, real finger steering, and Mac firewall/LAN access need a family-device check. Browser tests verify WebKit behavior and emulated screen sizes; they do not establish physical-device performance or speech audibility. The game has not been published to a hosted URL.

## Correct-answer automatic resume

Correct answers now immediately close the question and resume play with the full 12-second bonus, in both age modes and after preschool retries. Incorrect math answers retain the correction and Continue action. Added browser regression coverage for automatic resumption and a running bonus timer; all 22 model tests, 24 browser scenarios, and the static build pass.
