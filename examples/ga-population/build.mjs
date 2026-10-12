import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as s from "../../kit/schema.mjs";
import { kitScript, schemaScript } from "../../scripts/inline-kit.mjs";
import { GA, seeded } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 640;
const HEIGHT = 440;
const SEED = 7;

const PITCH = 13;
const ROW = 16;
const SIZE = 10;
const X0 = -70;
const Y0 = -50;
const TRAY_H = 1.2;
const GENE_H = 18;
const heightOf = (gene) => 2 + GENE_H * gene;

const TARGET_Y = Y0 - 28;
const PLINTH = { x: X0 - 3, y: TARGET_Y - 3, w: (GA.genes - 1) * PITCH + SIZE + 6, d: SIZE + 6, r: 1.2 };
const PLINTH_H = 5;

const LOSS_X = 18;
const LOSS_R = 3.4;
const TRACK_H = 2.4;
const LOSS_SCALE = 60;

const HIST_X = 38;
const HIST_PITCH = 2.8;
const HIST_SIZE = 2.2;
const HIST_Y = Y0 - 6;

const PLATE = { x: -86, y: -92, w: 148, d: 178, r: 8 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -15, 0), [X0, TARGET_Y, PLINTH_H + GENE_H + 2], [X0, Y0, GENE_H + 4], [LOSS_X, Y0, 34], [HIST_X, HIST_Y, 32]],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 42 },
);

const slotY = (j) => Y0 + j * ROW;
const geneX = (i) => X0 + i * PITCH;

function stage() {
  const out = [];
  out.push(
    s.datum(PLATE, P, {
      rulers: [
        { axis: "x", edge: PLATE.y + PLATE.d - 13, from: X0 - 6, to: geneX(GA.genes - 1) + SIZE + 6, positions: Array.from({ length: GA.genes }, (_, i) => geneX(i) + SIZE / 2) },
        { axis: "y", edge: PLATE.x + 7, from: Y0 - 6, to: slotY(GA.size - 1) + SIZE + 6, positions: Array.from({ length: GA.size }, (_, j) => slotY(j) + SIZE / 2), every: 4 },
        { axis: "y", edge: HIST_X + HIST_SIZE + 4, from: HIST_Y - 4, to: HIST_Y + GA.maxGen * HIST_PITCH + HIST_SIZE + 4, positions: Array.from({ length: GA.maxGen + 1 }, (_, g) => HIST_Y + g * HIST_PITCH + HIST_SIZE / 2), every: 10 },
      ],
    }),
  );
  for (let j = 0; j < GA.size; j++) {
    const tray = { x: X0 - 2, y: slotY(j) - 1.5, w: (GA.genes - 1) * PITCH + SIZE + 4, d: ROW - 2, r: 1 };
    out.push(k.solidSvg(k.slabOf(tray, 0, TRAY_H, P, 3, 0.3), { tone: "lo" }));
    out.push(k.dotsSvg([k.iso([tray.x + 1.4, tray.y + tray.d / 2, TRAY_H], P), k.iso([tray.x + tray.w - 1.4, tray.y + tray.d / 2, TRAY_H], P)], { size: 0.4, tone: "lo" }));
  }
  out.push(s.track([LOSS_X, Y0 - 4], [LOSS_X, slotY(GA.size - 1) + SIZE + 4], GA.size * 2, P, { width: 12, height: TRACK_H }));
  out.push(k.solidSvg(k.slabOf(PLINTH, 0, PLINTH_H, P, 4, 0.5), { tone: "mid" }));
  out.push(k.dotsSvg([k.iso([PLINTH.x + 1.6, PLINTH.y + PLINTH.d / 2, PLINTH_H], P), k.iso([PLINTH.x + PLINTH.w - 1.6, PLINTH.y + PLINTH.d / 2, PLINTH_H], P)], { size: 0.45 }));
  return out.join("");
}

function cellsOf(pose) {
  const items = [];
  pose.target.forEach((h, i) => {
    const x = geneX(i);
    items.push({ at: [x + SIZE / 2, TARGET_Y + SIZE / 2, PLINTH_H + h / 2], svg: s.cell({ x, y: TARGET_Y, z: PLINTH_H, size: SIZE, h, tone: "mid" }, P) });
  });
  pose.rows.forEach((row, j) => {
    row.h.forEach((h, i) => {
      const x = geneX(i);
      const y = slotY(j);
      const tone = row.tones[i];
      items.push({ at: [x + SIZE / 2, y + SIZE / 2, TRAY_H + h / 2], svg: s.cell({ x, y, z: TRAY_H, size: SIZE, h, tone: tone === "lo" ? "mid" : "hi", lit: tone === "lit" }, P) });
    });
    const y = slotY(j) + SIZE / 2;
    const h = Math.max(0.6, row.loss * LOSS_SCALE);
    items.push({ at: [LOSS_X, y, TRACK_H + h / 2], svg: k.solidSvg(k.cylinder(LOSS_X, y, LOSS_R, TRACK_H, h, P, 32, 0.4), { tone: "hi", crease: "lo" }) + k.lineSvg(k.ring(LOSS_X, y, LOSS_R - 1.2, TRACK_H + h, P, 24), { tone: "faint" }) });
  });
  for (let g = 0; g <= GA.maxGen; g++) {
    const y = HIST_Y + g * HIST_PITCH;
    const h = Math.max(0.6, pose.history[g] ?? 0);
    const tone = g < pose.history.length ? "mid" : "lo";
    items.push({ at: [HIST_X + HIST_SIZE / 2, y + HIST_SIZE / 2, h / 2], svg: s.cell({ x: HIST_X, y, z: 0, size: HIST_SIZE, h, tone, round: 0.3, bevel: 0 }, P) });
  }
  return s.itemsInOrder(items, P);
}

const start = seeded(SEED);
const restPose = {
  target: start.target.map(heightOf),
  rows: start.pop.map((p) => ({ h: p.genes.map(heightOf), tones: p.tones, loss: p.loss })),
  history: [start.best * LOSS_SCALE],
};

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A genetic algorithm's population drawn as a grid of cubes on a datum plate: eight rows of six genes, each cube as tall as its gene's value, beside a target row on a plinth. Each generation the worst four rows sink and children rise in their slots, built gene by gene from two survivors; mutated genes are lit. A loss column stands at the end of every row and a strip records the best loss per generation.",
  body: [stage(), `<g data-part="cells">${cellsOf(restPose)}</g>`],
});

const model = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");

const live = `
${model}
const P = ${JSON.stringify(P)};
const PITCH = ${PITCH}, ROW = ${ROW}, SIZE = ${SIZE}, X0 = ${X0}, Y0 = ${Y0}, TRAY_H = ${TRAY_H}, GENE_H = ${GENE_H};
const TARGET_Y = ${TARGET_Y}, PLINTH_H = ${PLINTH_H}, LOSS_X = ${LOSS_X}, LOSS_R = ${LOSS_R}, TRACK_H = ${TRACK_H}, LOSS_SCALE = ${LOSS_SCALE};
const HIST_X = ${HIST_X}, HIST_PITCH = ${HIST_PITCH}, HIST_SIZE = ${HIST_SIZE}, HIST_Y = ${HIST_Y};
const heightOf = ${heightOf.toString()};
const slotY = ${slotY.toString()};
const geneX = ${geneX.toString()};
const s = { cell, itemsInOrder };
const k = { solidSvg, cylinder, lineSvg, ring };
const cellsOf = ${cellsOf.toString()};
const stage = document.querySelector(".iso-stage");
const layer = stage.querySelector('[data-part="cells"]');
const readout = document.querySelector("[data-readout]");
readout.setAttribute("aria-live", "polite");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const lerp = (a, b, t) => a + (b - a) * t;
const SINK = [0.25, 0.5], RISE = [0.55, 0.9], LENGTH = 3.4;
let seed = ${SEED};
let state = seeded(seed);
let from = state, to = state, replaced = [], clock = LENGTH, touring = !still.matches, visible = false, frame = 0, last = 0, idle = 0;
const phase = ([a, b]) => ease((clock / LENGTH - a) / (b - a));
function poseAt() {
  const sink = phase(SINK), rise = phase(RISE);
  const rows = to.pop.map((p, j) => {
    if (!replaced.includes(j)) return { h: p.genes.map(heightOf), tones: p.tones.map(() => "hi"), loss: lerp(from.pop[j].loss, p.loss, rise) };
    if (rise <= 0) return { h: from.pop[j].genes.map((g) => lerp(heightOf(g), 0.6, sink)), tones: from.pop[j].tones.map(() => "lo"), loss: lerp(from.pop[j].loss, 0, sink) };
    return { h: p.genes.map((g) => lerp(0.6, heightOf(g), rise)), tones: p.tones, loss: lerp(0, p.loss, rise) };
  });
  const target = to.target.map((g, i) => lerp(heightOf(from.target[i]), heightOf(g), rise));
  const reset = from !== to && to.gen === 0;
  const best = reset ? (rise > 0 ? to.history.map((b) => b * rise) : from.history.map((b) => b * (1 - sink))) : to.history.map((b, g) => (g >= from.history.length ? b * rise : b));
  return { target, rows, history: best.map((b) => b * LOSS_SCALE) };
}
function say() {
  const text = "gen " + to.gen + " · best loss " + to.best.toFixed(3) + " · " + to.evals + " evals";
  if (readout.textContent !== text) readout.textContent = text;
}
function draw() { layer.innerHTML = cellsOf(poseAt()); say(); }
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
  if (moving) clock = Math.min(LENGTH, clock + dt);
  if (moving) draw();
  if (!moving && touring) { idle += dt; if (idle > (finished(to) ? 2.4 : 0.5)) { idle = 0; step(); } }
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
  fig: "Fig 1",
  title: "GA population",
  hint: "Click or press → to breed",
  readout: `gen 0 · best loss ${start.best.toFixed(3)} · ${start.evals} evals`,
  keys: [
    { mark: "raised", label: "One cube per gene, as tall as its value; one row per individual" },
    { mark: "lit", label: "A mutated gene" },
    { mark: "dim", label: "Edge tone: gene taken from the second parent" },
  ],
  caption: `Eight individuals of six genes chase the target row on the plinth. Each generation the four rows with the highest loss sink and four children rise in their slots, each gene copied from one of two surviving parents (p = ${GA.cross}) and mutated with probability ${GA.rate}. The column at each row's end is its RMS loss; the strip on the right keeps the best loss of every generation.`,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="GA population: press Enter or the right arrow to breed the next generation, Home to restart">${svg}</div>`,
});

const name = theme === "light" ? "ga-population-light.html" : "ga-population.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "GA population", theme, body, script: kitScript() + schemaScript() + live }));
console.log("wrote", name);
