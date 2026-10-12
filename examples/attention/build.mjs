import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as s from "../../kit/schema.mjs";
import * as A from "../../kit/audit.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";
import { kitScript } from "../../scripts/inline-kit.mjs";
import { TOKENS, D, attention } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 660;
const HEIGHT = 460;

const { Q, K, V, A: W, O } = attention();
const N = TOKENS.length;
const PITCH = 11;
const SIZE = 8.4;
const TRAY_H = 1.6;
const TRAY_PAD = 3.4;
const SCALE = { qk: 5, w: 52, vo: 24 };
const MIN = 0.8;

const span = (count) => (count - 1) * PITCH + SIZE;
const GAP = 14;
const GRID = {
  S: { x: 0, y: 0, nx: N, ny: N },
  Q: { x: -GAP - span(D), y: 0, nx: D, ny: N },
  K: { x: 0, y: -GAP - span(D), nx: N, ny: D },
  O: { x: span(N) + GAP + 6, y: 0, nx: D, ny: N },
  V: { x: 0, y: span(N) + GAP, nx: N, ny: D },
};
const trayOf = ({ x, y, nx, ny }) => ({ x: x - TRAY_PAD, y: y - TRAY_PAD, w: span(nx) + TRAY_PAD * 2, d: span(ny) + TRAY_PAD * 2, r: 1.6 });

const value = {
  S: (i, j) => W[j][i] * SCALE.w,
  Q: (i, j) => Q[j][i] * SCALE.qk,
  K: (i, j) => K[i][j] * SCALE.qk,
  O: (i, j) => O[j][i] * SCALE.vo,
  V: (i, j) => V[i][j] * SCALE.vo,
};
const rowOf = { S: (i, j) => j, Q: (i, j) => j, O: (i, j) => j, K: () => null, V: () => null };

const PLATE = { x: GRID.Q.x - 22, y: GRID.K.y - 10, w: GRID.O.x + span(D) + 10 - (GRID.Q.x - 22), d: GRID.V.y + span(D) + 18 - (GRID.K.y - 10), r: 8 };
const SEL_X = GRID.Q.x - TRAY_PAD - 9;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -15, 0), [GRID.S.x, GRID.S.y, 30], [GRID.K.x, GRID.K.y, 20], [GRID.Q.x, GRID.Q.y, 20]],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: 42 },
);

const R = A.recorder(P);
R.solid(A.slab(PLATE, -10, 10, { name: "stand.datum" }));
const trays = Object.fromEntries(Object.entries(GRID).map(([name, grid]) => [name, trayOf(grid)]));
for (const [name, tray] of Object.entries(trays)) R.solid(A.slab(tray, 0, TRAY_H, { name: `stand.tray.${name}` }));

function stage() {
  const out = [
    s.datum(PLATE, P, {
      rulers: [
        { axis: "x", edge: PLATE.y + PLATE.d - 12, from: GRID.S.x - 4, to: GRID.S.x + span(N) + 4, positions: TOKENS.map((_, j) => GRID.S.x + j * PITCH + SIZE / 2), every: 6 },
      ],
    }),
  ];
  for (const tray of Object.values(trays)) {
    out.push(k.solidSvg(k.slabOf(tray, 0, TRAY_H, P, 4, 0.4), { tone: "lo" }));
    out.push(k.dotsSvg(k.corners(tray, 1.8).map(([x, y]) => k.iso([x, y, TRAY_H], P)), { size: 0.4, tone: "lo" }));
  }
  out.push(s.track([SEL_X, GRID.Q.y + SIZE / 2 - 3], [SEL_X, GRID.Q.y + (N - 1) * PITCH + SIZE / 2 + 3], N - 1, P, { width: 5, height: 1.6, every: 5 }));
  return out.join("");
}

for (const [name, grid] of Object.entries(GRID)) {
  for (let j = 0; j < grid.ny; j++) {
    for (let i = 0; i < grid.nx; i++) {
      const x = grid.x + i * PITCH;
      const y = grid.y + j * PITCH;
      const h = Math.max(MIN, value[name](i, j));
      const row = rowOf[name](i, j);
      const svg = s.cell({ x, y, z: TRAY_H, size: SIZE, h, tone: name === "S" ? "hi" : "mid" }, P);
      R.put({ at: [x + SIZE / 2, y + SIZE / 2, TRAY_H + h / 2], svg: row === null ? svg : `<g data-q="${row}">${svg}</g>`, name: `${name}.${i}.${j}`, shapes: [R.solid(A.slab({ x, y, w: SIZE, d: SIZE, r: 0.8 }, TRAY_H, h, { name: `${name}.${i}.${j}` }, 3))] });
    }
  }
}

const PIPE_R = 1.1;
const PORT = { w: 2.4, d: 4.4, h: 4.4 };
const PIPE_Z = TRAY_H + PORT.h / 2;
for (let i = 0; i < N; i++) {
  const y = GRID.S.y + i * PITCH + SIZE / 2;
  const from = trays.S.x + trays.S.w;
  const to = trays.O.x;
  const ports = [
    { x: from - PORT.w, y: y - PORT.d / 2, w: PORT.w, d: PORT.d, r: 0.6 },
    { x: to, y: y - PORT.d / 2, w: PORT.w, d: PORT.d, r: 0.6 },
  ];
  ports.forEach((plan, side) => {
    const name = `port.${i}.${side}`;
    const svg = k.solidSvg(k.slabOf(plan, TRAY_H, PORT.h, P, 3, 0.3), { tone: "mid" });
    R.put({ at: [plan.x + plan.w / 2, y, TRAY_H + PORT.h / 2], svg, name, shapes: [R.solid(A.slab(plan, TRAY_H, PORT.h, { name }, 3))] });
  });
  const route = [[from, y, PIPE_Z], [to, y, PIPE_Z]];
  const id = `wire.${i}`;
  R.route(id, route, PIPE_R, { owner: id });
  tubePieces(route, PIPE_R, P, { maxLength: 6 }).forEach((part, index) => {
    R.put({ at: part.mid, svg: `<g data-wire="${i}">${tubeSvg(part, { tone: "mid" })}</g>`, name: `${id}:${index}`, route: id, chunk: index, shapes: [A.tube(part.points, part.radii)] });
  });
}

A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);

const CAR = { x: SEL_X - 4.5, y: GRID.Q.y + SIZE / 2 - 4, w: 9, d: 8, r: 1.2 };
function carriage() {
  const out = [k.solidSvg(k.slabOf(CAR, 1.6, 3.2, P, 3, 0.4), { tone: "hi", lit: true })];
  out.push(k.lineSvg(k.lineOnTop([CAR.x, CAR.y + CAR.d / 2], [CAR.x + CAR.w, CAR.y + CAR.d / 2], 4.8, P), { tone: "lit" }));
  out.push(k.dotsSvg([k.iso([CAR.x + 1.6, CAR.y + 1.6, 4.8], P), k.iso([CAR.x + 1.6, CAR.y + CAR.d - 1.6, 4.8], P)], { size: 0.45, tone: "hi" }));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Scaled dot-product attention for six tokens drawn as grids of cubes on a datum plate, each cube as tall as its value. The 6 by 6 score grid in the middle holds the softmax weights, query rows along one side and key columns along the other; Q feeds it from the left, the transposed K from behind, V lies in front under the same key columns, and each query row's weighted sum runs along a conduit into its row of the output grid on the right.",
  body: [stage(), `<g data-part="car">${carriage()}</g>`, R.items.map((item) => item.svg).join("")],
});

const rows = TOKENS.map((_, i) => ({
  from: k.iso([GRID.Q.x, GRID.Q.y + i * PITCH + SIZE / 2, TRAY_H], P),
  to: k.iso([GRID.O.x + span(D), GRID.O.y + i * PITCH + SIZE / 2, TRAY_H], P),
}));

const live = `
const P = ${JSON.stringify(P)};
const TOKENS = ${JSON.stringify(TOKENS)};
const W = ${JSON.stringify(W.map((row) => row.map((v) => +v.toFixed(4))))};
const O = ${JSON.stringify(O.map((row) => row.map((v) => +v.toFixed(4))))};
const ROWS = ${JSON.stringify(rows)};
const PITCH = ${PITCH};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const car = svg.querySelector('[data-part="car"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let query = 0, at = 0, frame = 0, last = 0, visible = false, touring = !still.matches, clock = 0, resume = 0;
function light(i) {
  svg.querySelectorAll("[data-q] > .iso-solid[data-lit]").forEach((el) => el.removeAttribute("data-lit"));
  svg.querySelectorAll('[data-q="' + i + '"] > .iso-solid').forEach((el) => el.setAttribute("data-lit", ""));
  svg.querySelectorAll("[data-wire] .tb-edge").forEach((el) => el.setAttribute("data-tone", "mid"));
  svg.querySelectorAll('[data-wire="' + i + '"] .tb-edge').forEach((el) => el.setAttribute("data-tone", "lit"));
  const best = W[i].indexOf(Math.max(...W[i]));
  readout.textContent = '"' + TOKENS[i] + '" → "' + TOKENS[best] + '" ' + W[i][best].toFixed(2);
  stage.setAttribute("aria-valuetext", "query " + TOKENS[i] + ", most weight on " + TOKENS[best] + " at " + W[i][best].toFixed(2) + ", output " + O[i].map((v) => v.toFixed(2)).join(" "));
  stage.setAttribute("aria-valuenow", String(i));
}
function pick(i) { if (i !== query) { query = i; light(i); } run(); }
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { clock += dt; if (clock > 2.6) { clock = 0; pick((query + 1) % TOKENS.length); } }
  at = still.matches ? query : at + (query - at) * (1 - Math.exp(-dt / 0.22));
  if (Math.abs(query - at) < 0.002) at = query;
  car.setAttribute("transform", translateAlong(P, [0, at * PITCH, 0]));
  frame = visible && (touring || at !== query) ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } }
const hold = () => { touring = false; clearTimeout(resume); resume = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 4000); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
const toSvg = (event) => { const m = svg.getScreenCTM().inverse(); return [event.clientX * m.a + event.clientY * m.c + m.e, event.clientX * m.b + event.clientY * m.d + m.f]; };
const distance = ([px, py], { from: [ax, ay], to: [bx, by] }) => { const dx = bx - ax, dy = by - ay; const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(px - ax - t * dx, py - ay - t * dy); };
stage.addEventListener("pointermove", (event) => {
  hold();
  const p = toSvg(event);
  let best = 0;
  ROWS.forEach((row, i) => { if (distance(p, row) < distance(p, ROWS[best])) best = i; });
  pick(best);
});
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowDown" || event.key === "ArrowRight") to = Math.min(TOKENS.length - 1, query + 1);
  if (event.key === "ArrowUp" || event.key === "ArrowLeft") to = Math.max(0, query - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = TOKENS.length - 1;
  if (to === null) return;
  event.preventDefault();
  hold();
  pick(to);
});
light(0);
`;

const body = k.plateHtml({
  fig: "Fig 2",
  title: "Attention",
  hint: "Hover a row to pick a query",
  readout: "",
  keys: [
    { mark: "raised", label: "One cube per number, as tall as its value" },
    { mark: "lit", label: "The chosen query: its Q row, its softmax weights and its output row" },
  ],
  caption: `One attention head over "${TOKENS.join(" ")}", d = ${D}. The middle grid is softmax(QKᵀ/√${D}): row i holds how much query i draws from each key, and every row sums to 1. Q stands to its left and Kᵀ behind it; V lies in front under the same key columns. Each output row on the right is its weights times V, carried along its own conduit.`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Attention: arrow keys pick the query token" aria-valuemin="0" aria-valuemax="${N - 1}" aria-valuenow="0">${svg}</div>`,
});

const name = theme === "light" ? "attention-light.html" : "attention.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "Attention", theme, body, script: kitScript() + live }));
console.log("wrote", name, `${R.items.length} items`);

A.auditOrExit(R, P);
