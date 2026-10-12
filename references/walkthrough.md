# Walkthroughs

Two figures designed step by step: first a native structure from this skill, then Anatomy's test rig, the quality bar for the drawing itself.

# Walkthrough 1: the GA population (`examples/ga-population/`)

A figure for a report on randomized optimisation, explaining what one generation of a genetic algorithm does to its population.

## 1. Truth
The model is `model.mjs`, copied from the report's own GA: 8 individuals of 6 genes in [0, 1], a target of 6 genes, RMS loss, keep the best 4, breed 4 children by uniform crossover (p = 0.5) from two survivors chosen with replacement, mutate each gene with probability 0.1 by Gaussian noise of 0.12, stop at 40 generations or a loss of 0.02. A seeded generator (`makeRng`) makes every run the same. The readout (generation, best loss, evaluations) and the caption's numbers come from it.

## 2. Native form
The mapping sentence: *each cube is one gene and its height is the gene's value; each row of six is one individual in its slot; a culled row sinks and a child rises in the same slot; a lit cube is a mutated gene.* The target is the same kind of row, so it gets the same cubes, on a plinth so it reads as the reference. Loss is a scalar that belongs to a row, so it is a pin, not a cube, at the row's end. The history of best loss is a series, so it is `columns` with a socket for every generation still to run.

## 3. Structure list (about 150 elements)
- Stage: datum plate, 4 feet with collars, groove, 4 corner screws, a gene ruler (6 ticks), a slot ruler (8 ticks), a generation ruler (41 ticks).
- Holders: 8 row trays with 2 screw dots each, a plinth with 2 dots, a track with 17 ticks and 2 end stops under the loss pins.
- Structure: 48 gene cubes, 6 target cubes, 8 loss pins, 41 history columns or sockets.

## 4. Camera and layout
Genes run along x at a pitch of 13, slots along y at a pitch of 16, so the gap between rows (where the trays show) is wider than the gap between genes and each row reads as one record. Gene heights are 2 + 18 × value; a taller scale (26) hid the rows behind each other. Azimuth 42° puts genes running down-right and slots down-left.

## 5. Painter's order
The datum, rulers, trays, track and plinth are flat and drawn first. Every raised element (gene cubes, target cubes, loss pins, history columns) goes into one list and `itemsInOrder` sorts it by depth. All are boxes or cylinders standing on the same floor in a grid, so a centre-depth sort is exact and no audit is needed.

## 6. Live behaviour
One step is 3.4 s: hold, sink the culled rows (0.25–0.5), raise the children with their tones (0.55–0.9), grow the newest history column with them. The page holds the model's source (inlined from `model.mjs`) and `cellsOf` from the build (via `toString()`, with `schemaScript()` inlined), and rebuilds the cell group each frame of a transition only. The tour breeds a generation every half second after each step settles, and restarts with the next seed when the run finishes. Enter, Space and → breed, Home restarts, and hovering holds the tour.

## 7. Checks
`lines.mjs` found 7 track ticks 9 px long ending mid-rail; `track()` now uses the same short ticks as the rulers, and both themes print `line ends: 0`. Captures at 1.2 s caught the sinking rows; the phone capture still reads at 390 px.

# Walkthrough 2: the test rig (Fig 6)

How `examples/test-rig/` was designed. It is a figure for a "Stretch" section explaining how a glass button responds to touch: a press swells it, pulling makes it lean toward the finger (with less give the further you pull), and letting go springs it back past rest once.

## 1. Truth
The behaviour was copied into a pure model, `rig.ts`, from the library source:
- The rest size is 120 × 32 (`HALF = [60, 16]`).
- A press swells it by 8%, at most 6 px a side.
- The lean is a rubber band: `give · (1 − 1/(1 + 0.55·d/give))`, with `give` = 14 px.
- There are three springs: press 700/32, hold 540/40 and release 320/16, as stiffness/drag.
- The capsule stretches along the lean by at most 8% and thins across.

`step(member, held, pull, dt)` advances it and `poseOf(member)` returns the shape. The readout, the aria text, the caption numbers and every moving part read from this one model.

## 2. Object
"A test rig." A real lab would hold a button in a sprung fixture and measure it with a probe and a dial gauge. Each part carries meaning:
- **The glass capsule** is the subject. It is lit while held and its shape is rebuilt every frame from the pose.
- **A carriage on two guide rods with four coil springs** shows that the glass is springy and returns. The springs compress and extend as it leans.
- **A finger probe on a rail behind it** is the pointer. It comes down to press, then slides along the rail to pull. A ruler and a rider on the rail show how far it has pulled.
- **A dial gauge with a plunger touching the carriage** reads the lean. Its needle turns 20 px per revolution, with a mark at `give`.
- **A base plate on feet** carries a frame of four bars with a ruler and a zero mark, screws, a label plate, a floor grid and bores for the rods.

## 3. Parts list (53 solids)
| Group | Parts |
|---|---|
| Base | plate, 4 feet (flange and foot), groove, 4 corner screws with rings, label plate with screws and rule |
| Rail | 2 posts on feet, the beam with a ruler (minor every 5, major every 25), 2 end stops, screws, a rider |
| Probe | block, thumb knob with knurl, pointer, index line, arm, housing with cap, collar, seams, lock screw, stem, collar, pad |
| Frame | back, left, right and front bars with screws, floor with grid, rod bores and ends, ticks with a zero mark |
| Mechanism | 2 rods, 4 coils (split back and front), the carriage plate with a seat outline, 4 bushings, rivets, a contact block, a plunger rod with a collar |
| Dial | stand with screws, sleeve, clamp, lug, puck, knurled band, bezel and face rings, ticks, give marks, crown, a "px" engraving, the needle |
| Subject | the glass capsule (fill, shades, top, crease, bevel, inner rim, shine, edge) and the dotted rest outline |

## 4. Camera and layout (`view.ts`)
- **Camera.** Azimuth 57°, so the long front of the frame faces the viewer. The viewBox is 600 × 340, fitted to the base and the top of the rail with a pad of 34.
- **Layout.** The rig is laid out around the origin. The glass is centred at (0, 0) on the carriage top, the rods run along x at y = ±18, the dial stands at x = 131 and the rail sits behind at y = −66, z = 50.
- **Helpers.** `at(point)` projects a point and `shift(x, z)` moves things along x and z.

## 5. Geometry (`geometry.ts`, `pose.ts`)
- `geometry.ts` computes every static part once: a `solid(plan, z, h, steps, bevel)` wrapper over `slabOf`, a `cylinder`, `knurl`, `sideArc`, `faceRing` and ruler helpers.
- `pose.ts` has `frameOf(pose, …)`, which rebuilds only what changes: the capsule's paths, the 4 coils, the carriage and probe transforms, the needle and the pull wire.

## 6. Painter's order (`live.tsx`)
1. Base.
2. Rail, with the rider and the probe block.
3. Back frame bars.
4. Back coil halves.
5. Rods.
6. Left coils.
7. Carriage.
8. Glass.
9. Rest outline.
10. Pull wire.
11. Right-back coils.
12. Plunger.
13. Right-front coils.
14. Front frame bars.
15. Dial with needle.
16. Finger.
17. Arm.

The frame and the springs are split so the carriage sits *inside* them.

## 7. Live behaviour (`live.tsx`)
- **One loop.** It reads the scripted tour or the user's hand, eases the finger (τ 0.09 s) and the lift, steps the spring model, then writes every changed attribute through refs and says the readout.
- **Idle tour.** It starts after 1.4 s in view and loops every 7.6 s: rest, press, pull 80, release, settle. It pauses on hover, focus or press and resumes 3.6 s after the last input.
- **Pointer.** Hover moves the finger along the rail; press-and-drag presses and pulls.
- **Keyboard.** Space presses or lets go, arrows move and pull (Shift for bigger steps), Home and End go to the ends, and Escape releases.
- **Accessibility.** `role="slider"`, and `aria-valuetext` such as "Pressed: 129.6 by 34.6 pixels, pulled 80.0 px, leaning 10.6 px".
- **Reduced motion.** The springs become critically damped: the glass still swells, but it never leans or bounces.

## 8. Card
- **Corners.** "Fig 6" · "Press and pull" · hint "Press, then pull ← →" · readout "120.0 × 32.0 · lean 0.0 px".
- **Legend keys.** The glass while it is held (raised) · where it rests (dotted) · the pull, from where I pressed to the finger (edge).
- **Caption.** States the rig and the true numbers.
