import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as s from "../../kit/schema.mjs";
import { kitScript, schemaScript } from "../../scripts/inline-kit.mjs";
import { GA, fitnessOf, seeded } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 640;
const HEIGHT = 440;
const SEED = 1;
const N = GA.levels;

const C = {
  N,
  PITCH: 8,
  SIZE: 6.4,
  TRAY_H: 1.4,
  BASE: 1.2,
  ZS: 42,
  PUCK_R: 2.9,
  PUCK_H: 2.4,
  TOKEN_H: 1.4,
  MARGIN: 135,
  MARGIN_TRAY_H: 1.2,
  HIST_X: -18,
  HIST_Y: 1.4,
  HIST_PITCH: 6.2,
  HIST_SIZE: 4.6,
  GENS: GA.maxGen + 1,
};
C.OFF = (C.PITCH - C.SIZE) / 2;
C.SPAN = N * C.PITCH;

const top = (i, j) => C.TRAY_H + C.BASE + C.ZS * fitnessOf(i, j);
const TOP_CELL = (() => {
  let best = [0, 0];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (fitnessOf(i, j) > fitnessOf(...best)) best = [i, j];
  return best;
})();

const PLATE = { x: -34, y: -14, w: 196, d: 176, r: 8 };
const centres = Array.from({ length: N }, (_, i) => i * C.PITCH + C.PITCH / 2);
const histCentres = Array.from({ length: C.GENS }, (_, g) => C.HIST_Y + g * C.HIST_PITCH + C.HIST_SIZE / 2);

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -15, 0),
    [TOP_CELL[0] * C.PITCH + 4, TOP_CELL[1] * C.PITCH + 4, top(...TOP_CELL) + 6 * C.PUCK_H],
    [C.HIST_X, 0, C.TRAY_H + C.BASE + C.ZS],
    [0, C.MARGIN, C.MARGIN_TRAY_H + GA.size * C.TOKEN_H],
  ],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: 42 },
);

function stage() {
  const out = [
    s.datum(PLATE, P, {
      rulers: [
        { axis: "x", edge: C.MARGIN + 11, from: -2, to: C.SPAN + 2, positions: centres },
        { axis: "y", edge: C.MARGIN + 11, from: -2, to: C.SPAN + 2, positions: centres },
        { axis: "y", edge: C.HIST_X - 9, from: C.HIST_Y - 3, to: C.HIST_Y + (C.GENS - 1) * C.HIST_PITCH + C.HIST_SIZE + 3, positions: histCentres },
      ],
    }),
  ];
  const trays = [
    [{ x: C.HIST_X - 1.6, y: C.HIST_Y - 1.6, w: C.HIST_SIZE + 3.2, d: (C.GENS - 1) * C.HIST_PITCH + C.HIST_SIZE + 3.2, r: 1 }, C.TRAY_H],
    [{ x: -2, y: -2, w: C.SPAN + 4, d: C.SPAN + 4, r: 2 }, C.TRAY_H],
  ];
  for (const [plan, h] of trays) {
    out.push(k.solidSvg(k.slabOf(plan, 0, h, P, 3, 0.4), { tone: "lo" }));
  }
  const grid = { x: -2, y: -2, w: C.SPAN + 4, d: C.SPAN + 4 };
  out.push(k.dotsSvg([[grid.x + 1, grid.y + 1], [grid.x + grid.w - 1, grid.y + 1], [grid.x + 1, grid.y + grid.d - 1], [grid.x + grid.w - 1, grid.y + grid.d - 1]].map(([x, y]) => k.iso([x, y, C.TRAY_H], P)), { size: 0.45, tone: "lo" }));
  return out.join("");
}

// The landscape: one column per genome, painted in depth order, each followed by an empty slot for the pucks standing on it.
function landscape() {
  const items = [];
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = i * C.PITCH + C.OFF;
      const y = j * C.PITCH + C.OFF;
      const h = top(i, j) - C.TRAY_H;
      const peak = i === TOP_CELL[0] && j === TOP_CELL[1];
      const mark = peak ? k.lineSvg(k.ring(x + C.SIZE / 2, y + C.SIZE / 2, 1.1, top(i, j), P, 16), { tone: "mid" }) : "";
      items.push({ at: [x + C.SIZE / 2, y + C.SIZE / 2, h / 2], svg: s.cell({ x, y, z: C.TRAY_H, size: C.SIZE, h, tone: "mid" }, P) + mark + `<g data-slot="${i + j * N}"></g>` });
    }
  }
  return s.itemsInOrder(items, P);
}

function marginTrays() {
  const plans = [
    { x: -2, y: C.MARGIN - 1.4, w: C.SPAN + 4, d: C.SIZE + 2.8, r: 1.2 },
    { x: C.MARGIN - 1.4, y: -2, w: C.SIZE + 2.8, d: C.SPAN + 4, r: 1.2 },
  ];
  const out = [];
  for (const plan of plans) {
    out.push(k.solidSvg(k.slabOf(plan, 0, C.MARGIN_TRAY_H, P, 3, 0.4), { tone: "lo" }));
    const sockets = centres.map((c) => (plan.w > plan.d ? k.planOutline({ x: c - C.SIZE / 2, y: C.MARGIN, w: C.SIZE, d: C.SIZE, r: 0.8 }, C.MARGIN_TRAY_H, P, 3) : k.planOutline({ x: C.MARGIN, y: c - C.SIZE / 2, w: C.SIZE, d: C.SIZE, r: 0.8 }, C.MARGIN_TRAY_H, P, 3)));
    out.push(k.lineSvg(sockets.join(""), { tone: "faint" }));
  }
  return out.join("");
}

// Everything that moves is drawn from a pose. These run at build time and again, serialised, in the page.
function stackSvg(i, j, list) {
  let z = top(i, j);
  const cx = i * C.PITCH + C.PITCH / 2;
  const cy = j * C.PITCH + C.PITCH / 2;
  let out = "";
  for (const p of list) {
    if (p.h < 0.05) continue;
    out += s.node(cx, cy, C.PUCK_R, z, P, { h: p.h, tone: p.tone, lit: p.lit, collar: false });
    z += p.h;
  }
  return out;
}

function marginsSvg(pose) {
  const items = [];
  for (const [axis, bins] of [["x", pose.xs], ["y", pose.ys]]) {
    bins.forEach((list, b) => {
      let z = C.MARGIN_TRAY_H;
      const at = b * C.PITCH + C.OFF;
      const x = axis === "x" ? at : C.MARGIN;
      const y = axis === "x" ? C.MARGIN : at;
      let svg = "";
      for (const p of list) {
        const h = (C.TOKEN_H * p.h) / C.PUCK_H;
        if (h < 0.05) continue;
        svg += s.cell({ x, y, z, size: C.SIZE, h, tone: p.tone, lit: p.lit, round: 0.8, bevel: 0.3 }, P);
        z += h;
      }
      if (svg) items.push({ at: [x + C.SIZE / 2, y + C.SIZE / 2, z / 2], svg });
    });
  }
  return s.itemsInOrder(items, P);
}

function historySvg(pose) {
  const items = [];
  for (let g = 0; g < C.GENS; g++) {
    const y = C.HIST_Y + g * C.HIST_PITCH;
    const value = pose.history[g];
    const h = value === undefined ? 0.6 : 0.6 + (C.BASE + C.ZS * value - 0.6) * (pose.grow[g] ?? 1);
    const tone = value === undefined ? "lo" : "mid";
    items.push({ at: [C.HIST_X + C.HIST_SIZE / 2, y + C.HIST_SIZE / 2, h / 2], svg: s.cell({ x: C.HIST_X, y, z: C.TRAY_H, size: C.HIST_SIZE, h, tone, round: 0.5, bevel: 0.2 }, P) });
  }
  return s.itemsInOrder(items, P);
}

// Pucks in each slot: individuals that stay, then the culled ones shrinking, then the children rising.
function poseOf(pop) {
  const order = { stay: 0, sink: 1, rise: 2 };
  const sorted = pop.map((p, j) => ({ ...p, j })).sort((a, b) => order[a.role] - order[b.role] || a.j - b.j);
  const stacks = new Map();
  const xs = Array.from({ length: C.N }, () => []);
  const ys = Array.from({ length: C.N }, () => []);
  for (const p of sorted) {
    const key = p.genes[0] + p.genes[1] * C.N;
    if (!stacks.has(key)) stacks.set(key, []);
    stacks.get(key).push(p);
    xs[p.genes[0]].push(p);
    ys[p.genes[1]].push(p);
  }
  return { stacks, xs, ys };
}

const start = seeded(SEED);
const restPop = start.pop.map((p) => ({ genes: p.genes, h: C.PUCK_H, tone: "hi", lit: false, role: "stay" }));
const rest = poseOf(restPop);
const restHistory = { history: start.history, grow: [] };

function landscapeWithPucks() {
  let svg = landscape();
  for (const [key, list] of rest.stacks) {
    svg = svg.replace(`<g data-slot="${key}"></g>`, `<g data-slot="${key}">${stackSvg(key % N, Math.floor(key / N), list)}</g>`);
  }
  return svg;
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: `A genetic algorithm searching a fitness landscape. The ${N * N} columns are every genome of two genes from 0 to ${N - 1}, each as tall as its fitness, with a broad decoy hill and a taller true peak. Twelve pucks stand on the genomes of the current population, stacked where individuals share a genome. Each generation the six least fit shrink away and six children rise, each gene copied from one of two surviving parents and sometimes nudged by mutation (lit). Token stacks on the near edges count the population per gene value, and the strip on the left keeps the best fitness of every generation.`,
  body: [
    stage(),
    `<g data-part="history">${historySvg(restHistory)}</g>`,
    `<g data-part="landscape">${landscapeWithPucks()}</g>`,
    marginTrays(),
    `<g data-part="margins">${marginsSvg(rest)}</g>`,
  ],
});

const model = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");

const live = `
${model}
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};

const s = { cell, node, itemsInOrder };
const k = { lineSvg, ring };
const top = ${top.toString()};
const stackSvg = ${stackSvg.toString()};
const marginsSvg = ${marginsSvg.toString()};
const historySvg = ${historySvg.toString()};
const poseOf = ${poseOf.toString()};
const stage = document.querySelector(".iso-stage");
const slots = new Map([...stage.querySelectorAll("[data-slot]")].map((g) => [Number(g.dataset.slot), g]));
const margins = stage.querySelector('[data-part="margins"]');
const historyLayer = stage.querySelector('[data-part="history"]');
const readout = document.querySelector("[data-readout]");
readout.setAttribute("aria-live", "polite");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const SINK = [0.1, 0.42], RISE = [0.5, 0.88], LENGTH = 2.6;
let seed = ${SEED};
let state = seeded(seed);
let from = state, to = state, replaced = [], clock = LENGTH, touring = !still.matches, visible = false, frame = 0, last = 0, idle = 0;
let filled = new Set(${JSON.stringify([...rest.stacks.keys()])});
const phase = ([a, b]) => ease((clock / LENGTH - a) / (b - a));
function popAt() {
  const sink = phase(SINK), rise = phase(RISE);
  const pop = [];
  to.pop.forEach((p, j) => {
    if (!replaced.includes(j)) { pop.push({ genes: p.genes, h: C.PUCK_H, tone: "hi", lit: false, role: "stay" }); return; }
    if (sink < 1) pop.push({ genes: from.pop[j].genes, h: C.PUCK_H * (1 - sink), tone: "lo", lit: false, role: "sink" });
    if (rise > 0) pop.push({ genes: p.genes, h: C.PUCK_H * rise, tone: "hi", lit: p.lit, role: "rise" });
  });
  return pop;
}
function historyAt() {
  const sink = phase(SINK), rise = phase(RISE);
  const reset = from !== to && to.gen === 0;
  if (reset && rise <= 0) return { history: from.history, grow: from.history.map(() => 1 - sink) };
  if (reset) return { history: to.history, grow: to.history.map(() => rise) };
  return { history: to.history, grow: to.history.map((_, g) => (g >= from.history.length ? rise : 1)) };
}
function say() {
  const text = "gen " + to.gen + " · best " + to.best.toFixed(2) + " · mean " + to.mean.toFixed(2);
  if (readout.textContent !== text) readout.textContent = text;
}
function draw() {
  const pose = poseOf(popAt());
  const now = new Set(pose.stacks.keys());
  for (const key of filled) if (!now.has(key)) slots.get(key).innerHTML = "";
  for (const [key, list] of pose.stacks) slots.get(key).innerHTML = stackSvg(key % C.N, Math.floor(key / C.N), list);
  filled = now;
  margins.innerHTML = marginsSvg(pose);
  historyLayer.innerHTML = historySvg(historyAt());
  say();
}
function step() {
  from = to;
  if (finished(to)) {
    seed += 1;
    to = seeded(seed);
    replaced = to.pop.map((_, j) => j);
  } else {
    const plan = breed(to);
    to = apply(to, plan);
    replaced = plan.children.map((c) => c.slot);
  }
  clock = still.matches ? LENGTH : 0;
  run();
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const moving = clock < LENGTH;
  if (moving) { clock = Math.min(LENGTH, clock + dt); draw(); }
  if (!moving && touring) { idle += dt; if (idle > (finished(to) ? 2.6 : 0.7)) { idle = 0; step(); } }
  frame = visible && (clock < LENGTH || touring) ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) draw(); }
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
let resume = 0;
const hold = () => { touring = false; clearTimeout(resume); resume = setTimeout(() => { touring = !still.matches; run(); }, 4000); };
stage.addEventListener("pointerenter", hold);
stage.addEventListener("pointerdown", () => { hold(); if (clock >= LENGTH) step(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") { event.preventDefault(); hold(); if (clock >= LENGTH) step(); }
  if (event.key === "Home") { event.preventDefault(); hold(); from = to; seed = ${SEED}; to = seeded(seed); replaced = to.pop.map((_, j) => j); clock = still.matches ? LENGTH : 0; run(); }
});
say();
`;

const body = k.plateHtml({
  fig: "Fig 2",
  title: "GA fitness landscape",
  hint: "Click or press → to breed",
  readout: `gen 0 · best ${start.best.toFixed(2)} · mean ${start.mean.toFixed(2)}`,
  keys: [
    { mark: "raised", label: "Column: one genome, as tall as its fitness" },
    { mark: "raised", label: "Puck: one individual, stacked where genomes repeat" },
    { mark: "lit", label: "A child with a mutated gene" },
  ],
  caption: `Every genome of two genes, each 0–${N - 1}, laid out as a ${N} × ${N} grid: gene x along one ruler, gene y along the other, height the fitness (a decoy hill at 0.65, the true peak at 1.00, ringed). ${GA.size} individuals stand on it. Each generation the ${GA.size - GA.keep} least fit shrink away and ${GA.size - GA.keep} children rise, each gene copied from one of two random survivors (p = ${GA.cross}) and, with probability ${GA.rate}, moved one or two steps. Token stacks on the near edges count the population at each gene value; the strip on the left is the best fitness per generation, on the landscape's height scale. Some seeds settle on the decoy; the tour moves to a new seed after ${GA.maxGen} generations.`,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="GA fitness landscape: press Enter or the right arrow to breed the next generation, Home to restart">${svg}</div>`,
});

const name = theme === "light" ? "ga-landscape-light.html" : "ga-landscape.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "GA fitness landscape", theme, body, script: kitScript() + schemaScript() + live }));
console.log("wrote", name);
