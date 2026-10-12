# Changelog

All notable changes to Schematic are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The skill has no version numbers yet, so entries are dated. Entries from before 2026-10-11 are Anatomy's history, kept from the upstream repository.

## [Unreleased]

## 2026-10-11: forked from Anatomy as Schematic

### Added

- The skill is now `schematic` (`name: schematic` in `SKILL.md`, `/schematic`, `$schematic` in Codex). It draws a concept's own structure, exactly, instead of a machine metaphor: a new one idea ("the structure is the explanation"), a workflow step to choose the native form, and craft rules for exact abstraction, scaffolding, numerals on cell faces and flow by tokens.
- `kit/schema.mjs`: `datum`, `indexRuler`, `cell`, `cellGrid`, `columns`, `plateStack`, `node`, `edge`, `track`, `heightField` and `itemsInOrder`, with `references/schema.md` and `scripts/schema.test.mjs`.
- `schemaScript()` in `scripts/inline-kit.mjs`, so a page can rebuild cells with the same primitives the build uses.
- `examples/ga-population/`: a genetic algorithm's population as rows of gene cubes; culled rows sink and children rise each generation, with mutated genes lit.
- `examples/attention/`: one attention head as Q, Kᵀ, V, softmax score and output grids, with conduits proved by `--audit`.
- `references/idiom.md`: about twenty concepts mapped to their native forms, each with its mapping sentence.
- A GA population walkthrough in `references/walkthrough.md`, a scaffolding vocabulary in `references/craft.md`, operations on a structure in `references/motion.md`, and exactness checks in the `references/verify.md` checklist.
- New evals for attention, a BST insert, a hash table with chaining, gradient descent and a message queue.

### Changed

- README, CONTRIBUTING, SECURITY, the Code of Conduct, the issue forms, the PR template, `agents/openai.yaml` and CI now describe and build Schematic, and point at `ochlodeep/anatomy-schematic`.
- `dial-indicator`, `raptor-engine`, `test-rig` and `turning-dial` stay as kit references, unchanged. The CSS tokens keep their `--anatomy-*` names.

### Removed

- `examples/desk-computer/`, `examples/arcade-cabinet/`, `examples/ripple-tank/` and `examples/spot-plate/`. Their lessons stay in the references, which point to the upstream Anatomy repository for their source.

## Anatomy history (upstream)

### Added

- OpenCode and Codex support, alongside Claude Code. `SKILL.md` exposes `/anatomy` to OpenCode through `metadata`, `agents/openai.yaml` gives Codex its display name, and the README, CONTRIBUTING and the bug report form cover all three agents.
- `examples/arcade-cabinet/`, an upright arcade cabinet with its side panel off. A quarter rolls down the coin chute past the coin-switch wire into the cash box, the switch's pulse runs along its cable to the board, and the CRT warms up, self-tests and runs an attract mode drawn in the plane of the tilted monitor; the stick closes a microswitch under the panel. It draws in the light and dark themes and passes `--audit`.
- `examples/spot-plate/`, a second React figure from the same site as `test-rig`: six pairs of glass drops that run together into one piece of glass as a fan of feeler blades sets `merge`. It draws in the light and dark themes.
- A first workflow step, **Size it before you start**: every request is sized as a Figure (about 30–90 minutes), a Hero (2–4 hours) or an Epic (6 hours or more), and the estimate is told to the user first. An Epic is not started until the user chooses it over a proposed Hero version. Every size has a working page within the first hour, and Claude reports when a step runs past twice its share of the estimate.

### Fixed

- `scripts/drive.mjs` now fails when a browser evaluation throws or rejects, rather than reporting a clean successful session.
- The arcade cabinet now accepts coins with reduced motion enabled, preserving the meter, credit and power-on events when the coin animation is skipped.
- The turning dial stops its idle tour when reduced motion is enabled while the page is open and cancels its pending automatic restart while preserving keyboard and pointer input.
- `scripts/drive.mjs` now exits with status 1 and stops subsequent actions when an `until` condition times out.
- `scripts/capture.mjs` now creates the output directory for screenshots, including nested paths under `shots/`.
- The line-end check now includes the selected element when `--select` names an SVG, rather than checking only SVGs inside it.
- `scripts/drive.mjs` now rejects unknown actions before running the session, so a misspelled verification step cannot report success.
- Browser checks now fail promptly and remove their temporary profiles when Chrome exits before its debugging port is ready.
- The line-end check now uses ellipse boundaries and transformed circle boundaries, and treats hollow interiors as empty instead of solid dots.
- The line-end check now follows SVG arc curves instead of treating each arc as a straight chord.
- Capture and drive now fail when Chrome cannot load the requested page, instead of reporting a clean browser error page.
- Orbit checks reject invalid sampling steps and empty pose lists before a zero-state sweep can pass.
- Solid clearance audits rebuild cached surface grids when sampling spacing or cell size changes.
- Tube geometry audits use tapered radii instead of replacing every segment with an averaged cylinder.
- The line verifier reflects smooth Bezier controls only after the matching curve family.
- Capture and drive send native Enter activation so button and form checks perform their default action.
- Fixed-part and coverage bounds restore a closed SVG subpath origin before relative moves.
- Audit ray casts now refresh body camera coefficients when the projection direction changes, so repeated builds retain the correct depth order.
- Audit profile tracing now checks quarter-span deviations, preserving inflected analytic and smooth profiles whose midpoint lies on their chord.
- Depth-key solving now allows large acyclic figures to converge beyond 400 rounds and avoids choosing a cycle victim from an empty set of violated rules.
- Splitting now accepts default fixed rounds and preserves explicit prism/round ownership, so a pipe fitting can be split without inventing collisions with its own pipe.
- Turning builders now reject missing named part/parent groups and duplicate group names before authored motions silently become static or alias one value.
- Native fidelity checks now compare complete filled silhouettes for cut parts and honor open round ends in the kit reference, preserving deliberately unstroked cut edges.
- Tube fidelity checks path coverage in both directions when vertex counts differ, rejecting empty or truncated live silhouettes while preserving equivalent resampling.
- Solid clearances check sliding rods whose drawn reach changes, even when their stretching geometry leaves no relative translation to a stationary obstacle.
- `examples/test-rig/` drew its glass button dark in the light theme. `stretch.css` now has light values for its own colours.

### Changed

- The workflow steps are renumbered 1–10.
- The 4× detail sweep scales with the size: the subject and mechanism for a Figure, the whole drawing for a Hero or an Epic. The density rule itself still holds for every figure.

## 2026-10-08

### Changed

- The skill is now called Anatomy: `name: anatomy` in `SKILL.md`, invoked as `/anatomy`. It was developed privately as `isometric-objects` before this date, without releases.
- The CSS tokens are now `--anatomy-*` (for example `--anatomy-card`, `--anatomy-face`, `--anatomy-shade-0`); they were `--iso-*`. Every example is rebuilt with the new names.
- The figure card (`.iso-plate`) is square and flat: no rounded corners and no floating shadow, just a 1 px rule in the drawing's mid tone.
- `SKILL.md` makes high detail a standing rule for every figure, raises the parts list to at least 40 parts (60–150 for a hero figure), and adds a 4× detail pass to the final check.

### Added

- The public repository: a README with screenshots of the examples, the MIT license, a contributing guide, a code of conduct, a security policy, issue forms, a pull request template, and a CI workflow that rebuilds every example and fails if a committed page changes.
- What the skill contains at this point: the workflow and craft rules in `SKILL.md`; the kit (SVG core, round parts, pipes, the geometry audit, the WebGL layer, React components, and the 3D mode in beta); eight references; the headless Chrome checks in `scripts/`; six examples (`dial-indicator`, `desk-computer`, `raptor-engine`, `ripple-tank`, `test-rig`, `turning-dial`); and five evals.
