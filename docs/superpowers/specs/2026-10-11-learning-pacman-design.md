# Learning Pac-Man design

Date: October 11, 2026

## Purpose

Build a classic Pac-Man-style browser game for two children, ages 3 and 7. Keep familiar maze navigation, pellets, power pellets, four ghosts, blue frightened ghosts, scores, lives, and advancing maps. Learning questions appear at every power pellet. The game must work on iPhone, iPad, and Mac.

The user approved the proposed in-chat design. This document makes the behavior and acceptance criteria explicit for implementation.

## Start screen

- Choose age 3 or age 7 before playing.
- Age 7: select addition, subtraction, multiplication, or division, and Easy, Medium, or Hard difficulty.
- Age 3: select counting, number matching, shapes and colors, repeating patterns, or a mix. Use a gentle default game difficulty; learning questions advance with map level.
- Show a short explanation of controls and the extra-life goal.
- Save preferences locally on the device. A new game always starts with five lives, zero score, zero streak, and map level one.
- Include sound controls. Start speech/audio only after the player interacts with the page, respecting browser restrictions.

## Game loop and classic behavior

The player eats pellets while moving through a maze. Four ghosts chase or roam through reachable passages. A collision with a normal ghost costs one life. Losing a life preserves collected pellets and score, resets actor positions, clears frightened time, and gives a short safe restart countdown. A collision with a frightened ghost earns points and sends the ghost back to its home before it returns to play.

Clearing all regular and power pellets advances to the next maze. If the final pellet is a power pellet, finish the question before advancing (correct answers advance automatically; incorrect answers wait for Continue). Carry score, remaining lives, and learning streak between maps; reset actor positions and frightened time. At zero lives, show game over, score, map reached, and learning results, with replay and mode-selection actions.

Use connected, validated maze layouts with at least four visibly different layouts. Cycle through them after the fourth map while increasing difficulty gradually. Each maze contains four power pellets, safe actor spawns, and no unreachable collectible cells. Increase ghost speed gradually with a cap; age 3 remains slower and more forgiving than age 7. Use a tile-based simulation with smooth visual movement and queued turns at intersections.

Suggested classic scoring: regular pellet 10 points, power pellet 50, frightened ghosts 200/400/800/1600 within a power-up. Correct answers add 100 points. Scores and remaining lives are always visible.

## Power pellets and learning

Every power pellet immediately pauses maze simulation and any existing frightened timer. Display one question with large answer buttons. No question countdown applies. No actor can move, collide, or consume game time while the question is open.

Age 7 uses three distinct answer choices. A submitted answer is locked to prevent repeated taps from changing the result. Correct answers set frightened time to 12 seconds; incorrect answers set it to 5 seconds, compared with the normal reference duration of 8 seconds. A new power pellet replaces the remaining frightened timer rather than stacking time. Show feedback and, on an incorrect answer, the correct answer. Correct answers immediately resume play with no extra click. Incorrect answers show feedback and wait for a clear Continue button before movement restarts.

Age 3 uses three large visual choices, spoken instructions when available, and a repeat-instruction button. A wrong answer gives gentle feedback and allows another attempt. After a correct answer, immediately resume play and start 12 seconds of frightened time with no extra click. A question counts as correct toward the streak only if the first attempt was correct. A wrong first attempt immediately resets the streak; later correction completes the question without rebuilding that streak. Speech failure must not block play: text and pictures remain visible, and an adult can read the prompt.

The answer layout must avoid giving away correct choices through repeated position, size, or distinctive styling. Randomize answer positions. Render number names, quantities, shapes, colors, and patterns clearly, without relying solely on color to distinguish controls.

## Streaks and extra lives

Start both modes with five lives. Award one extra life for each block of 10 consecutive correct answers in age 7 mode and each block of 3 first-attempt correct answers in age 3 mode. After a reward, reset the displayed progress to zero toward the next reward. An incorrect answer resets progress. Preserve progress across losing a life and advancing maps. No life cap is required. Clearly announce the awarded life.

## Age 7 question progression

Use map level to increase question ranges within the selected starting difficulty. Let stage = min(map level minus one, 9), capping growth so long games remain suitable for a child.

| Type | Easy | Medium | Hard |
| --- | --- | --- | --- |
| Addition | operands 0 to 5 + stage | operands 0 to 12 + 2 × stage | operands 0 to 25 + 5 × stage |
| Subtraction | operands 0 to 5 + stage | operands 0 to 12 + 2 × stage | operands 0 to 25 + 5 × stage |
| Multiplication | factors 1 to min(5, 2 + stage) | factors 1 to min(10, 5 + stage) | factors 1 to min(12, 8 + stage) |
| Division | divisor and quotient 1 to min(5, 2 + stage) | divisor and quotient 1 to min(10, 5 + stage) | divisor and quotient 1 to min(12, 8 + stage) |

Subtraction orders operands so answers are nonnegative. Division generates divisor and quotient first, then computes the dividend, ensuring exact integer results and no division by zero. Generate distinct, plausible, nonnegative wrong answers. Avoid immediately repeating the same question when alternatives exist. Do not silently switch arithmetic operations during a game.

## Age 3 question progression

- Counting: count large repeated objects; quantities 1–3 on maps 1–2, 1–5 on maps 3–4, and 1–8 thereafter.
- Number matching: match a spoken/written number name to a pictured group using the same quantity bands. Include the numeral alongside the written number name for reinforcement.
- Shapes and colors: identify circles, squares, and triangles first; introduce rectangles and stars on later maps. Use familiar color names, visible shape labels where helpful, and spoken prompts.
- Patterns: choose the missing next object in an AB pattern first, then AAB and ABC on later maps. Distinguish objects by shape as well as color.
- Mixed mode rotates through all four categories so each receives regular practice.

## Controls and device layout

On Mac, arrow keys request movement; prevent page scrolling while actively playing. Allow keyboard selection of answer buttons with standard focus and Enter/Space. Provide a visible pause button and keyboard pause shortcut.

On touch devices, use a large fixed joystick beneath or alongside the maze based on available space. A drag from its center chooses the dominant cardinal direction with a dead zone. Holding or moving the joystick updates the desired direction. Releasing preserves the last requested direction, matching classic continuous movement. Use pointer capture and disable page scrolling only on the play controls. Reset held pointer state on cancellation or focus loss.

Fit the maze, score/lives, and controls to portrait iPhone and portrait/landscape iPad. Account for safe-area insets. On small screens, answer dialogs may scroll independently while the maze stays paused. Buttons have generous touch targets, readable contrast, and clear selected/focus states. Support browser resizing and orientation changes without resetting play.

## Pause, audio, and interruptions

Pause freezes movement, frightened time, and countdowns. Returning from pause uses an explicit Resume action. Leaving the tab or switching apps automatically pauses; returning never silently resumes. A paused question stays open with its answer state intact.

Use lightweight generated arcade sounds and browser speech synthesis for preschool prompts; provide a mute toggle and replay prompt control. Cancel stale speech on question changes, navigation, or mute. No microphone, accounts, server, or personal data collection is needed.

## Architecture

Use a lightweight browser application with a canvas maze renderer and accessible HTML setup, HUD, question, and pause screens. Keep code divided into:

1. Maze data and validation: tile layouts, spawn points, paths, collectible placement.
2. Pure game model: movement, ghost decisions, collisions, pellets, lives, scoring, timers, level changes, and pause states.
3. Learning model: question generation, progressive bounds, first-attempt tracking, streak rewards, and answer validation.
4. Presentation and input: responsive layout, canvas drawing, joystick, keyboard, dialogs, and audio.

Run simulation on a stable timestep, rendering with animation frames. Keep game time separate from wall-clock time so pausing and browser suspension cannot consume frightened time. Preferences may use local storage with a safe fallback if storage is unavailable. No backend is needed for the first version.

## Verification and acceptance

- Validate every maze for connected collectibles and reachable spawns.
- Test generated arithmetic across all types, difficulties, and map stages, including integer division, nonnegative subtraction, and distinct answer choices.
- Test first-attempt preschool streak behavior, reward thresholds, wrong-answer resets, and extra-life awards across map transitions.
- Test power-pellet pauses, 12/5-second outcomes, repeated power pellets, pause/resume, collisions, respawns, and game over.
- Test keyboard turning and joystick input, including pointer cancellation and queued corner turns.
- Exercise setup-to-game-to-question-to-resume flows in a browser, plus replay and returning to setup.
- Check representative iPhone, iPad, and desktop viewport sizes for clipped UI, scrolling, touch targets, and orientation changes; inspect browser errors.
- Automated browser checks and emulation establish coverage, but real iPhone/iPad speech and touch behavior remain a final device check when physical devices are available.

## Delivery

Deliver a playable local application, source code, run instructions, and the verification results. Publishing to a publicly reachable host is a separate delivery decision. The initial implementation uses drawn arcade graphics and does not depend on external image downloads.
