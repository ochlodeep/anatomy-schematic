# Schema API (`kit/schema.mjs`)

The primitives a concept is made of when it is drawn as itself. They are built on `kit/iso-kit.mjs` (`slabOf`, `cylinder`, `solidSvg`, `lineSvg`, `dotsSvg`, `depthOf`) and, for conduits, on `kit/tube.mjs`. World units, `P` and plans are as in `references/kit.md`.

```js
import * as s from "../../kit/schema.mjs";
import { kitScript, schemaScript } from "../../scripts/inline-kit.mjs";
```

Grids, columns and conduits return **items** (`{ at, svg, ... }`) rather than finished SVG, so you can merge them with your other raised parts and paint the lot in depth order with `itemsInOrder`, or hand them to the audit recorder (`R.put({ at, svg, shapes })`). The rest return SVG strings.

## Contents
1. Stage
2. Cells and grids
3. Stacks
4. Graphs
5. Tracks
6. Surfaces
7. Painter's order
8. In the page

## 1. Stage

| Function | What it does |
|---|---|
| `datum(plan, P, { height = 10, foot = 5, groove = 5, screws = true, rulers = [] })` | The stage plate: a halo, four feet (collar and foot, depth-sorted), the plate slab with a bevel, an inset groove, corner screws, and any number of index rulers on its top. Each entry of `rulers` is passed to `indexRuler` with `z: 0`. Draw it first. |
| `indexRuler({ axis = "x", positions, edge, z, from, to, depth = 7, every = 5, majors = [] }, P)` | A ruler strip from `from` to `to` along `axis`, its near edge at `edge`, with one tick hanging from that edge at each of `positions` (the element centres, so every tick sits under its element). Every `every`th tick, and any index in `majors`, is a major. Ticks are short enough to count as rooted for `scripts/lines.mjs`. |

## 2. Cells and grids

| Function | What it does |
|---|---|
| `cell({ x, y, z = 0, size, depth = size, h, tone = "hi", lit = false, round = 0.8, bevel = 0.4, label, labelTone = "mid", labelSize }, P)` | One block standing at `z`: a rounded slab with a cap line inset on its top (when it is more than 6 units across) and, with `label`, a numeral engraved on the top face, fitted to it. Returns SVG. |
| `cellGrid({ origin = [0, 0, 0], dims: [nx, ny, nz = 1], pitch, size = pitch * 0.82, layer = pitch, value(i, j, k) })` | Every cell of a grid as an item `{ i, j, k, at, svg }`. `value` returns any `cell` options for that cell (`h`, `tone`, `lit`, `label`), plus `lift` (extra z) and `skip`. Cells sit `pitch` apart, so the gap between them reads as a seam; layers sit `layer` apart in z. |
| `columns(values, { origin, axis = "x", pitch, size = pitch * 0.7, scale = 1, min = 0.6, tone = "hi", lit(index) })` | A histogram or series: one cell per value, `values[i] * scale` tall (at least `min`), as items. |

Seat every grid on something: a tray (`slabOf` with `tone: "lo"`, 1–2 units thick, 2–4 units larger than the grid) on the datum, with the cells' `z` on the tray's top.

## 3. Stacks

| Function | What it does |
|---|---|
| `plateStack(layers, P, { pillar = 2.2 })` | Layers bottom up. Each layer is `{ plan, h = 3, gap = 0, tone = "mid", lit = false }`; a layer with a `gap` stands on four pillars rising from the corners of the layer below. Returns `{ svg, top }`, where `top` is the z of the last layer's top. |

## 4. Graphs

| Function | What it does |
|---|---|
| `node(cx, cy, r, z, P, { h = 4, tone = "hi", lit = false, label, collar = true })` | A puck: a low collar, a bevelled cylinder, an inner ring and a centre dot on its top, and an optional engraved label. Returns SVG. |
| `edge(from, to, P, { z = 2.4, radius = 1.1, rimA = 0, rimB = 0, lift = 0, maxLength = 12, tone = "mid" })` | A conduit between two plan points, starting `rimA` from `from` and ending `rimB` short of `to` (pass each node's collar radius, so both ends land on a rim). `lift` arches it. Returns tube items `{ at, svg, piece }`; record `piece.points` and `piece.radii` with `A.tube` when you use the audit. Build-time only (it needs `kit/tube.mjs`). |

Where a conduit leaves a tray or grid rather than a node, end it on a port: a small slab on the tray whose face the conduit's end lands on (`examples/attention/`).

## 5. Tracks

| Function | What it does |
|---|---|
| `track(from, to, steps, P, { z = 0, width = 5, height = 2.4, stops = true, every = 4 })` | An axis-aligned rail from `from` to `to` (plan points), with `steps + 1` ticks evenly spaced from 3 units inside each end (so a track from `first − 3` to `last + 3` puts a tick under every element), a major every `every`th tick, and an end stop at each end. Returns SVG. A carriage riding it is your own slab, moved with `translateAlong`. |

## 6. Surfaces

| Function | What it does |
|---|---|
| `heightField(fn, { x0, y0, nx, ny, step, floor = 0 }, P, { tone = "lo", lines = "faint" })` | The surface `z = fn(x, y)` over an `nx × ny` grid of `step`-sized facets, painted back to front, each facet shaded into one of the four kit tones by its normal against the kit's light. Grid lines in `lines` tone; the two near skirts down to `floor` shaded as sides; the rim, the three visible corner posts and the far edges as an outline in `tone`. Returns one `.iso-solid` group. A ball or token resting on it is a separate item placed at `fn(x, y)`. |

## 7. Painter's order

| Function | What it does |
|---|---|
| `itemsInOrder(items, P)` | Sorts items by `depthOf(item.at)` (or `item.depth`), stably, and joins their `svg`. Correct for cells of one size on one grid, and for most mixed grids standing on a common floor. Once conduits or round parts join them, use `A.recorder` and `A.settle` instead (`references/kit.md`, section 12). |

## 8. In the page

`schemaScript()` (from `scripts/inline-kit.mjs`) returns this module's source with its imports and `export`s stripped. Inline it after `kitScript()`, and the page can rebuild cells with the same `cell`, `cellGrid`, `columns` and `itemsInOrder` the build used:

```js
writeFileSync(file, k.pageHtml({ title, theme, body, script: kitScript() + schemaScript() + live }));
```

`examples/ga-population/` does this: its `cellsOf(pose)` is written once in the build, serialised into the page with `toString()`, and called every frame of a transition. Only `edge` needs `kit/tube.mjs`, which is not inlined; draw conduits in the build, and change their emphasis in the page by setting `data-tone` on their `.tb-edge` paths, as `examples/attention/` does.
