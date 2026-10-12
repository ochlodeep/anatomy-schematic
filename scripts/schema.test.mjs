import { test } from "node:test";
import assert from "node:assert/strict";
import * as k from "../kit/iso-kit.mjs";
import * as s from "../kit/schema.mjs";
import { kitScript, schemaScript } from "./inline-kit.mjs";

const P = k.fitProjection(k.boxCorners({ x: -60, y: -60, w: 120, d: 120 }, -15, 30), 600, 400, { azimuth: 42 });

test("cellGrid emits one item per cell, and itemsInOrder paints them back to front", () => {
  const items = s.cellGrid({ origin: [0, 0, 1], dims: [4, 3, 2], pitch: 10, value: (i, j, k) => ({ h: 2 + i + j + k }) }, P);
  assert.equal(items.length, 4 * 3 * 2);
  const seen = new Set(items.map(({ i, j, k }) => `${i}.${j}.${k}`));
  assert.equal(seen.size, 24);
  const svg = s.itemsInOrder(items, P);
  const depths = items.map((item) => ({ svg: item.svg, depth: k.depthOf(item.at, P) })).sort((a, b) => a.depth - b.depth);
  let from = 0;
  for (const { svg: part } of depths) {
    const at = svg.indexOf(part, from);
    assert.ok(at >= from, "cells come out in depth order");
    from = at + part.length;
  }
});

test("cellGrid skips cells and seats lifted cells above the grid", () => {
  const items = s.cellGrid({ dims: [3, 3], pitch: 10, size: 8, value: (i, j) => (i === j ? { skip: true } : { h: 4, lift: i }) }, P);
  assert.equal(items.length, 6);
  for (const item of items) assert.equal(item.at[2], item.i + 2);
});

test("columns stand one cell per value with a floor height", () => {
  const items = s.columns([0, 0.5, 2], { pitch: 6, scale: 10 }, P);
  assert.equal(items.length, 3);
  assert.deepEqual(items.map((item) => item.at[2] * 2), [0.6, 5, 20]);
});

test("edge lands both ends on the node rims", () => {
  const a = [0, 0];
  const b = [40, 30];
  const rim = 6;
  const pieces = s.edge(a, b, P, { rimA: rim, rimB: rim, z: 3 });
  assert.ok(pieces.length > 1, "a long conduit is split into depth-sortable chunks");
  const first = pieces[0].piece.points[0];
  const last = pieces.at(-1).piece.points.at(-1);
  assert.ok(Math.abs(Math.hypot(first[0] - a[0], first[1] - a[1]) - rim) < 1e-6);
  assert.ok(Math.abs(Math.hypot(last[0] - b[0], last[1] - b[1]) - rim) < 1e-6);
  assert.equal(first[2], 3);
});

test("plateStack stacks layers on pillars and reports its top", () => {
  const plan = { x: 0, y: 0, w: 30, d: 20, r: 2 };
  const { svg, top } = s.plateStack([{ plan, h: 3 }, { plan, h: 3, gap: 8 }, { plan, h: 2, gap: 8 }], P);
  assert.equal(top, 3 + 8 + 3 + 8 + 2);
  assert.equal((svg.match(/class="iso-solid"/g) ?? []).length, 3 + 4 + 4);
});

test("schemaScript inlines after kitScript with no imports or exports left", () => {
  const source = schemaScript();
  assert.doesNotMatch(source, /^import /m);
  assert.doesNotMatch(source, /^export /m);
  const run = new Function(`${kitScript()}\n${source}\nreturn { cell, cellGrid, itemsInOrder };`);
  const api = run();
  const items = api.cellGrid({ dims: [2, 2], pitch: 10 }, P);
  assert.equal(items.length, 4);
  assert.match(api.itemsInOrder(items, P), /iso-solid/);
});
