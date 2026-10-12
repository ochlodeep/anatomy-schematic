---
name: schematic
description: Build crafted, highly detailed, interactive isometric SVG figures of abstract technical concepts drawn as their own structure (data structures, algorithms, ML architectures, protocols, math objects), not as a machine metaphor. A tensor is a block of cubes, attention a score grid fed by Q and K, a hash table a row of buckets, a loss a seated surface; every element sits at its true count on a datum plate with index rulers, with four-tone shading, true painter's order, one lit accent, a framed card with a live readout and calm motion. Use this whenever someone wants an isometric or "premium" figure of a matrix, tensor, graph, tree, queue, network layer, state machine or distribution, or says "show the structure itself" or "no machine", even if they never say "isometric". To explain an idea through an invented physical object instead, use the anatomy skill. Works framework-free (JS that writes SVG and HTML) and in React/Next.js, and can add WebGL shaders inside the drawing.
license: MIT
compatibility: Written for Claude Code; also runs in OpenCode and Codex. Needs Node.js 20.10+, and Chrome or Chromium for the checks.
metadata:
  opencode/slash: "true"
---

# Schematic

This skill draws a concept as the thing it actually is: the matrix as a block of cells, the tree as nodes on terraces, the graph as pucks joined by conduits, the loss as a surface you could put a ball on. It is not a diagram of boxes and arrows, and it is not a machine standing in for the idea. It is the idea's own structure, built as a precise, solid isometric object on a datum plate, with every element at its true count and every height carrying a real value. Every number the figure shows comes from the same model that shapes and moves its parts.

Schematic is a fork of Anatomy. It keeps Anatomy's finish, kit, audit and browser checks, and changes what gets drawn: Anatomy invents a physical machine whose working is the concept, while Schematic draws the concept's own elements. When a reader would understand the idea faster from a lock or a gauge than from the structure itself, that is an Anatomy figure.

Start from the closest example. Each is built with `node examples/<name>/build.mjs`, which writes a standalone HTML page next to the script; add `--light` for the light theme.

**Native-structure examples (start here):**
- `examples/ga-population/` is a genetic algorithm's population: eight rows of six gene cubes on trays, each cube as tall as its gene, beside a target row on a plinth. Each generation the worst four rows sink and children rise in their slots, gene by gene from two survivors, with mutated genes lit. A loss pin stands at each row's end on a track, and a strip of sockets fills with the best loss per generation. It rebuilds its cells live from the same `kit/schema.mjs` the build uses (`schemaScript()`).
- `examples/attention/` is scaled dot-product attention for six tokens with d = 4: a 6 × 6 softmax score grid with Q to its left, Kᵀ behind, V in front under the same key columns, and each query row's output carried along a conduit into the output grid. A carriage on a track picks the query and lights its path. The cells, ports and conduits go through the audit recorder, and `node build.mjs --audit` proves them.

**Kit references (for techniques the native examples don't use):**
- `examples/dial-indicator/` is the smallest Anatomy figure, about 300 lines: the plate, feet, screws, ruler strip and a moving part in its painter's slot. `datum()` in `kit/schema.mjs` is its plate.
- `examples/raptor-engine/` is the reference for dense pipework, `kit/lathe.mjs` round parts, the full audit with an exploded view, and WebGL inside the drawing.
- `examples/test-rig/` is a production React/Next figure, and the reference for the server/client split (`references/react.md`, `references/walkthrough.md`).
- `examples/turning-dial/` is the optional 3D mode (`references/3d.md`).

## The one idea that matters

**The structure is the explanation.** Draw the concept's own elements, each one real, at its true count and in proportion, and let geometry carry the data: height, tone and position are values. Before any geometry, write the mapping sentence: what one element is, what its height or position means, and what moves. For example, "each cube is one gene; its height is the gene's value; each row is one individual; a row sinks when it is culled".

| Concept | Native form |
|---|---|
| A tensor of shape 4 × 3 × 2 | A block of 24 cubes in layers on a datum plate, index rulers on two edges |
| Matrix multiplication | Two grids feeding a result grid, rows and columns aligned along shared rulers |
| Attention | Q and Kᵀ grids feeding a softmax score grid whose heights are the weights; V weighted into an output row |
| A binary search tree | Node pucks on stepped terraces, one terrace per depth, joined by conduits |
| A hash table with chaining | A row of bucket trays on an index ruler, colliding keys as tokens stacked in the bucket |
| Gradient descent | A ball resting on a seated height field, its path as tokens left on the surface |
| A genetic algorithm | A population grid: rows are individuals, column height is a gene |

`references/idiom.md` maps about twenty concepts to their native forms, with the mapping sentence for each.

Two ways this fails:

- **Inexact abstraction.** Floating slabs, uncounted "some cubes", rows that don't line up with their ruler, a matrix with the wrong shape, heights that mean nothing. Abstract forms are allowed only when they are exact.
- **Too flat and bland.** A grid of identical cubes on a bare plane has no volume, no scaffolding and nothing to discover.

The fix for both is the same: a true structure, with every element counted and seated, built on precise scaffolding.

**Every creation is highly detailed.** This holds for every figure, however small the idea: a quick explainer is still a dense, exact structure, never a few slabs. Density comes from the concept's own elements at their true count, and from the scaffolding that holds them.
- **Scaffolding replaces machine parts.** A datum plate on feet with a groove and corner screws, index rulers with a tick per element and a major every 5th, trays under rows, plinths under reference values, tracks with end stops for anything that moves, ports where conduits land, spacer pillars under stacked layers, and a socket for every slot that is still empty.
- **Two looks.** At 1× it reads as one clear structure. At 4× every region still has something true to find: seams between cells, the tick under each index, the cap line on each cell, the screws on each tray.
- **Purposeful, never noise.** Every element is part of the concept or holds a part of it. Each sits on another part, ends on an edge, and fades rather than stops.
- **Check it last.** Before you finish, zoom to 4× and add what is missing wherever a region is plain.

## Workflow

Work in this order. Write the mapping sentence and the structure list before any geometry. Most of the quality is decided there.

1. **Size it before you start.** Tell the user which size the request is and roughly how long it will take, before any other work.
   - **Figure**: one structure and one operation, 40–120 elements, SVG with at most one WebGL layer. About 30–90 minutes. Build it without asking.
   - **Hero**: several linked structures (a whole layer of a network, a full protocol round) or one 3D subject, 120–300 elements. About 2–4 hours. Say so, then build it unless the user asked for something quick.
   - **Epic**: a whole system with many moving parts, or 3D on more than one subject. 6 hours or more. Do not start it. Give the estimate, propose a Hero version that keeps the core of the idea, and list what the full version would add. Build the Epic only when the user chooses it.
   - Whatever the size, have a working page that opens in the browser within the first hour, and deepen it from there. Run `date` at the start and at each step, and when a step runs past twice its share of the estimate, tell the user where it stands and what is left.
2. **Truth first.** Collect the real numbers and behaviour: shapes, counts, thresholds, the exact algorithm. Write the model as a small pure module (`model.mjs`, as in both native examples) and drive the geometry, readout, motion and caption from it. Pick sizes small enough to draw every element (six tokens, not 512) and say so in the caption.
3. **Choose the native form.** Find the concept in `references/idiom.md`, or derive its form: what is one element, what is the grid or graph they live on, which axis is which index, what height means. Write the mapping sentence. Align structures that share an index along a shared ruler, so the reader can follow a row from one grid into the next.
4. **Structure list.** Write every element and every piece of scaffolding, grouped: stage (datum plate, feet, groove, screws, index rulers), holders (trays, plinths, pillars, tracks, ports), the structure itself (cells, nodes, conduits, surface) and the moving or lit subject. Each element sits on another. `references/craft.md` has the scaffolding vocabulary with recipes.
5. **Plan the world.** Use world units of about 1 px: x and y on the floor, z up. Give every structure a pitch and a cell size (a gap of 15–25% of the pitch reads as seams), and a height scale per kind of value. Lay out plans as rounded rectangles `{x, y, w, d, r}`. Choose the camera: azimuth 42–45° by default, so the two index axes run down-left and down-right; elevation 30°. Then fit with `fitProjection(points, width, height, { pad, azimuth })`, including the tallest element.
6. **Build geometry once.** Use `kit/schema.mjs` for the structure (`datum`, `indexRuler`, `cell`, `cellGrid`, `columns`, `plateStack`, `node`, `edge`, `track`, `heightField`) and `kit/iso-kit.mjs` for everything else. When values change, rebuild only the cells that change, in the page, with `schemaScript()` (as `ga-population` does). When only emphasis changes, toggle `data-lit` and `data-tone` on the drawn elements instead (as `attention` does).
7. **Paint back to front, bottom to top.** Static flat scaffolding first, then every raised element sorted by depth with `itemsInOrder`. Once the figure has conduits or round parts, put every element into `A.recorder(P)` with its true shape, let `A.settle(R, P)` set the keys, and end the build with `A.auditOrExit(R, P)` (as `attention` does).
8. **Frame it.** Put the figure in a card: `Fig n` at top left, a short title at top right, the interaction hint at bottom left and a short live readout at bottom right (keep it under about 40 characters so it never meets the hint). Legend keys and a true caption go under the card.
9. **Make it live.** Show the operation, not just the state: rows sink and rise, a carriage moves to the selected index, tokens travel a conduit. Use calm time-based motion: smoothstep phases or exponential follow. An idle tour loops when nobody touches it. The figure responds to pointer and keyboard, stops when offscreen, and jumps to the end state under reduced motion. See `references/motion.md`.
10. **Verify like a critic.** Read every PNG you make.
   - Capture desktop, phone (390 wide), several moments of motion and reduced motion with `scripts/capture.mjs`; use `scripts/drive.mjs` for sequences.
   - **Run the line check to zero:** `node scripts/lines.mjs page.html --out shots/lines.png` on both themes must print `line ends: 0`.
   - **Run the audit to zero** when the figure has conduits, tubes or round parts: `node build.mjs --audit` must end `audit passed`.
   - **4× close-ups** of cell seams, ruler ticks, ports, conduit ends and the lit path, in both themes.
   - **Check the numbers.** Count the elements on screen against the model's shape, and check the readout against the model.
   - Ask: is it instantly the concept itself, exact and counted, with volume and scaffolding, every line ending on something? Is it rich at 1× and still rewarding at 4×? Iterate until yes. Checklist: `references/verify.md`.

## Setup

The kit is in `kit/`:

| File | Use it for |
|---|---|
| `kit/schema.mjs` | The native-structure primitives: `datum` (stage plate with feet, groove, screws and rulers), `indexRuler` (a tick per element), `cell`, `cellGrid` (tensors and matrices, as depth-sortable items), `columns` (histograms and series), `plateStack` (layers on pillars), `node` and `edge` (graph pucks and conduits that land on their rims), `track` (a rail with a tick per step and end stops), `heightField` (a seated surface shaded per facet) and `itemsInOrder` (the depth sort). `references/schema.md`. |
| `kit/iso-kit.ts` | The whole core in one file: camera, solids, a parts library, an SVG string renderer, card and page builders, and the CSS (`ISO_CSS`). Copy it into a TypeScript project. |
| `kit/iso-kit.mjs` | The same core compiled to plain ESM, for Node scripts. Import it directly. |
| `kit/iso.css` | `ISO_CSS` written out. Import it once and put `class="iso"` (plus `data-theme="light"` for light) on a wrapper or `<body>`. The tokens are named `--anatomy-*`, inherited from the upstream kit. |
| `kit/react/draw.tsx` | Server-safe React components: `Solid`, `Line`, `Wire`, `Dots`, `FaceText`, `IsoFigure`, `Plate`. |
| `kit/react/live.tsx` | `"use client"` hooks: `useReadout`, `useLoop`, `useEased`, `useInView`, `useStillness`, plus `spring` and `follow`. |
| `kit/lathe.mjs` | Round parts along any axis: `lathe`, `solidOf`, `disc`, `sphereOf`, `bandsOf`, `ribsOf`, `dotsOf`, `fillet` and more. `references/kit.md`, section 10. |
| `kit/tube.mjs` | `tubePieces` splits a conduit into depth-sortable chunks (with `gaps` under collars and elliptical end caps), and `tubeSvg` draws one. |
| `kit/audit.mjs` | Proves the geometry: `recorder`, `settle` (true depth order) and `auditOrExit` (clearance, terminals, supports, depth order, crowding and more). `references/kit.md`, section 12. |
| `kit/gl.mjs` | The WebGL layer for shaders inside the drawing (`references/webgl.md`). |
| `kit/turn.mjs`, `kit/turn-build.mjs`, `kit/turn-audit.mjs` | The optional 3D mode (`references/3d.md`). |
| `scripts/capture.mjs` | Headless Chrome screenshots, close-ups and console checks. |
| `scripts/drive.mjs` | Scripted headless Chrome: move, click, key, slow motion, wait-until, shots and contact sheets. |
| `scripts/lines.mjs` | The line-end check on a built page: every texture line must end on a stroke, a dot or an outline. |
| `scripts/inline-kit.mjs` | `kitScript()`, `schemaScript()`, `glScript()` and `turnScript()` return the kit, the schema primitives, the WebGL layer and the 3D runtime as source to inline into a standalone page. `schemaScript()` goes after `kitScript()`; `edge()` needs `kit/tube.mjs`, so call it in the build. |
| `scripts/turn-check.mjs`, `scripts/turn-bench.mjs` | 3D figures: fidelity, order, pops, line ends and timing. |

Pick the path that fits the project:

- **Standalone HTML, a static SVG, a blog post or any non-React site.** Write a Node build script like `examples/ga-population/build.mjs`. It imports `kit/iso-kit.mjs` and `kit/schema.mjs`, assembles strings, wraps them with `figureSvg` and `plateHtml`, and writes the page with `pageHtml({ script: kitScript() + schemaScript() + live })`. For a lone `.svg` file use `figureSvg({ standalone: "dark" | "light" })`, which embeds the styles.
- **React or Next.js.** Copy `kit/` into the project (for example `components/iso/`). Keep the model and geometry in plain `.ts` modules, build the static art in a server component with the `draw.tsx` components, and pass it as element props to one `"use client"` live component. `references/react.md` explains the split.

## Craft rules (short form)

`references/craft.md` gives the full reasoning and recipes.

**Carried over from Anatomy unchanged:**
- **Solids, not wireframes.** Every element is filled and painted in order, so things in front hide things behind. No see-through edges and no dashed hidden lines.
- **Let the kit shade.** `extrude` returns four side tones by facing plus a lighter top. Keep it for anything with height, and use `flat` only for inlays thinner than 1 unit.
- **Tone hierarchy.** Datum and feet are `lo`, scaffolding and holders `mid`, the structure itself `hi`. Exactly one accent is `lit`: the elements the reader should watch now (the selected row, the mutated genes, the visited node). Grooves are `faint`, minor ticks `lo`, major ticks `mid`. Use colour only when colour is the subject.
- **Small precise detail, never noise.** Bevels of 0.3–1.6, a cap line inset on each cell top, grooves inset 3–5 from an edge, screws as 0.4–0.55 dots, ruler ticks with a major every 5th. Each detail belongs to a part.
- **Lines resolve.** Every line ends on something: a face, another line or a terminal dot. There are no leader lines, balloons, dimension arrows or labels floating in the air.
- **No conduit passes through anything**, and every crossing is drawn in true depth order, proved by `A.settle` and the audit, never tuned by eye. Conduits land on ports, node rims or collars.
- **A texture ends on a real edge or fades.** Ticks hang from a ruler strip's edge and stay short (under 7 px on screen), a line on one face runs edge to edge, and a line that must stop ramps out with `fadeLineSvg`.
- **Volume.** Real thickness, everything standing on something, a soft halo under the datum.
- **Monochrome.** One lit accent, plus true colour only when colour is the subject.
- **Composition.** Centre the figure and let it fill about 55–65% of the card. Keep a consistent scale across a set of figures, and make sure it still reads at 390 px wide.

**Changed for native structure:**
- **Abstraction must be exact.** True counts, a consistent unit scale per kind of value, and every element seated. Nothing floats: cells stand on trays, layers on spacer pillars, grids on a datum plate with index rulers along their edges, and a surface on its skirts.
- **Scaffolding replaces machine parts** for density (trays, plinths, rulers, tracks, ports, pillars, sockets), never decoration that means nothing.
- **Numerals on cell faces are allowed**, sparingly, where a value is the subject (`cell({ label })`, fitted to the face). Names, axes and units still go in the legend, caption and readout, never on leaders in the air.
- **Flow is shown by tokens and lit paths**, never by arrows: a token moving along a conduit, a carriage moving along a track, a row sinking or rising in place.
- **Shared indices share a ruler.** If two structures share an index (Q's rows and the score grid's rows), they line up along the same axis and pitch.

## WebGL inside the drawing

Use a shader only for what lines can't draw: a glow that spreads over a surface, a density field, heat on a loss surface, light through a medium. The structure stays SVG. The core rules come from the first shader figure, whose colour change between phases looked cut rather than crossfaded:

- **Three layers.** A back SVG holds what the effect covers, the canvas holds the effect (`pointer-events: none`), and a front SVG holds what covers it. Split a part, or the effect, when it is on both sides.
- **World space, same camera.** Build every shader point from `onFloor`, `onWallX` and `onWallY`, or march the pixel's ray `rayOf(vb) + t·towardViewer()`. Size everything in world units times `uK`. Anything lying on a plane registers exactly with that plane's SVG lines.
- **Nothing pops.** Every uniform follows an envelope with an attack and a decay (the kit's `burst` for events, `settle` for levels). Phase changes are crossfades where colour shifts continuously with the physical quantity, and a fade-out only gets darker.
- **No hard cut-offs.** Every term reaches zero before any `if`, bound or canvas edge, and before any cell edge of a cell noise.
- **Seen through an opening, masked twice.** Content behind a window or a recess is masked in its own plane and by the opening in the face plane, multiplied (`references/webgl.md`, section 5).
- **Blending.** Use `tonemap()` and dither. In dark, a canvas that only adds light uses premultiplied output with `mix-blend-mode: screen`, and one that must also darken what it covers stays normal-blended.
- **Light theme ships, and its shaders are designed for paper.** Use normal premultiplied alpha, never screen. Write the colour the paper should show and solve for the ink. A glow is a saturated body with a pale core, a coloured rim and an alpha floor, never a darkened dark-theme colour: that gave the Raptor's "red ink smoke".
  - What the light falls on takes a tint, and the cavity that holds it gets a darker physical ground (soot, refractory, water depth).
  - Hot bodies follow one blackbody ink table shared with the fallback.
  - Ink only grows with light: fade the finished ink once, never one term at a time.
  - Ink ends at each stroke's inner edge.
  - Measure ink per frame. `references/webgl.md`, section 8, has the recipes and the faults reviewers found.
- **Restraint.** Cap the device ratio at 1.5 and render only while the effect is active and onscreen. Reduced motion gets one still frame, and the SVG must still read without WebGL.

Read `references/webgl.md` before writing any shader.

## 3D: figures that turn (beta)

3D is an option like WebGL. Use it when seeing the structure from more than one side is the idea: a tensor block turned to show its third axis, a lattice, a graph embedded in 3D. The rest of the figure stays static kit art.

It is in beta: the engine is proved on its example and one test figure, not yet on a production figure. Turn one subject at a time and keep the clutter around it static. A small figure runs at 60 fps; a dense 380-part flexing hand measured about 20 fps at 1440 and 13–15 fps on a phone profile (390 px, 4× CPU throttle) on a heavily loaded machine.

- **Live parts are the kit's own picture.** Each frame, convex kit primitives (prisms, rounds, domes, balls with flats, lathes, tubes) are re-projected and re-shaded by the kit's rules. A turn by θ is the kit drawing at azimuth `a − θ`.
- **Order comes from separating planes.** Same-group pairs get a plane fixed in the group, pairs on different links get one fixed in their common frame, and the rest are solved each frame. The audit proves there are no cycles at any angle or in any clip frame.
- **Contacts are flush, tangent or rim-on-flat.** Joints are coaxial knuckle discs on the child group that touch the parent's link, or the audit calls the whole child group loose. No live line spans two moving groups: a cable crosses a joint through a clip on each side, or reaches the turntable through a slip ring at the hub.
- **Live tubes bend in near-horizontal planes or inside fittings, and never point along the view.** A bend needs R ≥ 2r / sin²(e − θmax), where θmax includes the pitch range of every hinge it rides: 8r is the bound when flat, and on a ±12° hinge it is 21r. Each route runs from mount surface to mount surface, with its ports in `gaps`. That holds at every angle and in every pose.
- **Materials remap the ramp.** Gold, chrome, steel, gunmetal, rubber, brass and copper each have a light and a dark set; tones still come from facing.
- **Free groups break off without a jump.** Coaxial parts are fixed pictures with turning textures.
- **Shaders follow the motion.** Anchor them to a group with `controller.anchor` or `toGroup`, occlude a front canvas with `coverOf`, and keep world effects (smoke, falling sparks, oil on the bench) out of group space.
- **Verify with `--audit`** (`turn audit passed`) and `scripts/turn-check.mjs` (`--fidelity`, `--order`, `--pops`, `--lines`, `--perf`). Iterate with `--quick --only=…`. Only a full run proves the figure, and it takes 15–20 minutes for 30 parts, so run it in the background.

Read `references/3d.md` first.

## References

Read these as you need them:

- `references/idiom.md`: concept → native form, with the mapping sentence for each. Read it before choosing a form.
- `references/craft.md`: the look in depth, including the scaffolding vocabulary, the parts vocabulary with code, tone tables, painter's order, round parts and conduits, screens on faces, and the anti-patterns that got figures rejected. Read it before designing.
- `references/schema.md`: the `kit/schema.mjs` API.
- `references/kit.md`: the core kit API, with signatures and examples.
- `references/motion.md`: live behaviour (loops, springs, tours, pointer, keyboard, accessibility, reduced motion), in vanilla JS and React.
- `references/react.md`: the React/Next.js server/client split and the large-payload key-warning trap.
- `references/verify.md`: the `capture.mjs`, `drive.mjs` and `lines.mjs` commands, the audit, the review checklist and common faults.
- `references/webgl.md`: shaders inside the drawing.
- `references/walkthrough.md`: how the GA population figure and the test rig were designed, step by step.
- `references/3d.md`: the optional 3D mode.
