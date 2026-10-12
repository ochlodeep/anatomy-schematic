import { iso, pathOf, depthOf, cameraOf, slabOf, cylinder, insetPlan, planOutline, haloOf, corners, ring, lineOnTop, solidSvg, lineSvg, dotsSvg, faceTextSvg, topMatrix } from "./iso-kit.mjs";
import { tubePieces, tubeSvg } from "./tube.mjs";

const TICK = [1.6, 3];

export function itemsInOrder(items, P) {
  return [...items]
    .map((item, index) => ({ item, index, depth: item.depth ?? depthOf(item.at, P) }))
    .sort((a, b) => a.depth - b.depth || a.index - b.index)
    .map(({ item }) => item.svg)
    .join("");
}

export function indexRuler({ axis = "x", positions, edge, z, from, to, depth = 7, every = 5, majors = [] }, P) {
  const strip = axis === "x" ? { x: from, y: edge, w: to - from, d: depth, r: 1 } : { x: edge, y: from, w: depth, d: to - from, r: 1 };
  const minor = [];
  const major = [];
  positions.forEach((at, index) => {
    const big = index % every === 0 || majors.includes(index);
    const length = big ? TICK[1] : TICK[0];
    const a = axis === "x" ? [at, edge] : [edge, at];
    const b = axis === "x" ? [at, edge + length] : [edge + length, at];
    (big ? major : minor).push(lineOnTop(a, b, z + 0.6, P));
  });
  const ends = axis === "x" ? [[from + 2, edge + depth / 2], [to - 2, edge + depth / 2]] : [[edge + depth / 2, from + 2], [edge + depth / 2, to - 2]];
  return [
    solidSvg(slabOf(strip, z, 0.6, P, 3), { tone: "lo", crease: "none" }),
    lineSvg(minor.join(""), { tone: "lo" }),
    lineSvg(major.join(""), { tone: "mid" }),
    dotsSvg(ends.map(([x, y]) => iso([x, y, z + 0.6], P)), { size: 0.45 }),
  ].join("");
}

export function datum(plan, P, { height = 10, foot = 5, groove = 5, screws = true, rulers = [] } = {}) {
  const base = -height - foot;
  const out = [`<path class="iso-halo" d="${haloOf(plan, base, height, P)}"/>`];
  const feet = corners(plan, Math.min(22, plan.w / 5, plan.d / 4)).sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P));
  for (const [x, y] of feet) {
    out.push(solidSvg(cylinder(x, y, 7, base, 1.6, P, 28), { tone: "lo" }));
    out.push(solidSvg(cylinder(x, y, 5.4, base + 1.6, foot - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(solidSvg(slabOf(plan, -height, height, P, 8, 1.6), { tone: "mid" }));
  if (groove) out.push(lineSvg(planOutline(insetPlan(plan, groove), 0, P), { tone: "lo" }));
  if (screws) {
    const at = corners(plan, groove + 5);
    out.push(lineSvg(at.map(([x, y]) => ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
    out.push(dotsSvg(at.map(([x, y]) => iso([x, y, 0], P)), { size: 0.5 }));
  }
  for (const ruler of rulers) out.push(indexRuler({ z: 0, ...ruler }, P));
  return out.join("");
}

export function cell({ x, y, z = 0, size, depth = size, h, tone = "hi", lit = false, round = 0.8, bevel = 0.4, label, labelTone = "mid", labelSize }, P) {
  const plan = { x, y, w: size, d: depth, r: round };
  const top = z + h;
  const inner = size > 6 && depth > 6 ? lineSvg(planOutline(insetPlan(plan, 1.6), top, P, 3), { tone: "faint" }) : "";
  const text = label === undefined ? "" : faceTextSvg(topMatrix([x + size / 2, y + depth / 2 + 1], top, P, "x"), String(label), { size: labelSize ?? Math.min(size, depth) * 0.32, tone: labelTone, anchor: "middle" });
  return solidSvg(slabOf(plan, z, h, P, 3, bevel), { tone, crease: lit ? "mid" : "lo", lit, inner: inner + text });
}

export function cellGrid({ origin = [0, 0, 0], dims, pitch, size = pitch * 0.82, layer = pitch, value = () => ({}) }, P) {
  const [nx, ny, nz = 1] = dims;
  const [ox, oy, oz] = origin;
  const items = [];
  for (let k = 0; k < nz; k++) {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const v = value(i, j, k) ?? {};
        if (v.skip) continue;
        const h = v.h ?? size;
        const x = ox + i * pitch;
        const y = oy + j * pitch;
        const z = oz + k * layer + (v.lift ?? 0);
        items.push({ i, j, k, at: [x + size / 2, y + size / 2, z + h / 2], svg: cell({ x, y, z, size, h, ...v }, P) });
      }
    }
  }
  return items;
}

export function columns(values, { origin = [0, 0, 0], axis = "x", pitch, size = pitch * 0.7, scale = 1, min = 0.6, tone = "hi", lit = () => false }, P) {
  return cellGrid(
    {
      origin,
      dims: axis === "x" ? [values.length, 1] : [1, values.length],
      pitch,
      size,
      value: (i, j) => {
        const index = axis === "x" ? i : j;
        return { h: Math.max(min, values[index] * scale), tone, lit: lit(index) };
      },
    },
    P,
  );
}

export function plateStack(layers, P, { pillar = 2.2 } = {}) {
  const out = [];
  let z = 0;
  layers.forEach(({ plan, h = 3, gap = 0, tone = "mid", lit = false }, index) => {
    if (index > 0 && gap > 0) {
      const below = layers[index - 1].plan;
      const posts = corners(insetPlan(below, Math.min(6, below.w / 4, below.d / 4)), 0).sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P));
      for (const [x, y] of posts) out.push(solidSvg(cylinder(x, y, pillar, z, gap, P, 20), { tone: "mid", crease: "none" }));
      z += gap;
    }
    out.push(solidSvg(slabOf(plan, z, h, P, 4, 0.5), { tone, lit }));
    z += h;
  });
  return { svg: out.join(""), top: z };
}

export function node(cx, cy, r, z, P, { h = 4, tone = "hi", lit = false, label, collar = true } = {}) {
  const out = [];
  if (collar) out.push(solidSvg(cylinder(cx, cy, r + 1.4, z, 1.2, P, 40), { tone: "lo" }));
  const base = collar ? z + 1.2 : z;
  out.push(solidSvg(cylinder(cx, cy, r, base, h, P, 40, 0.5), { tone, lit, crease: lit ? "mid" : "lo" }));
  out.push(lineSvg(ring(cx, cy, r * 0.62, base + h, P, 32), { tone: "faint" }));
  out.push(dotsSvg([iso([cx, cy, base + h], P)], { size: 0.55, tone: lit ? "hi" : "mid" }));
  if (label !== undefined) out.push(faceTextSvg(topMatrix([cx, cy + r * 0.38, base + h], 0, P, "x"), String(label), { size: r * 0.55, tone: "mid", anchor: "middle" }));
  return out.join("");
}

export function edge(from, to, P, { z = 2.4, radius = 1.1, rimA = 0, rimB = 0, lift = 0, maxLength = 12, tone = "mid" } = {}) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const a = [from[0] + ux * rimA, from[1] + uy * rimA, z];
  const b = [to[0] - ux * rimB, to[1] - uy * rimB, z];
  const points = lift > 0 ? Array.from({ length: 17 }, (_, index) => {
    const t = index / 16;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, z + lift * Math.sin(Math.PI * t)];
  }) : [a, b];
  return tubePieces(points, radius, P, { maxLength }).map((piece) => ({ at: piece.mid, svg: tubeSvg(piece, { tone }), piece }));
}

export function track(from, to, steps, P, { z = 0, width = 5, height = 2.4, stops = true, every = 4 } = {}) {
  const alongX = Math.abs(to[0] - from[0]) >= Math.abs(to[1] - from[1]);
  const lo = alongX ? Math.min(from[0], to[0]) : Math.min(from[1], to[1]);
  const hi = alongX ? Math.max(from[0], to[0]) : Math.max(from[1], to[1]);
  const mid = alongX ? from[1] : from[0];
  const plan = alongX ? { x: lo, y: mid - width / 2, w: hi - lo, d: width, r: 1 } : { x: mid - width / 2, y: lo, w: width, d: hi - lo, r: 1 };
  const out = [solidSvg(slabOf(plan, z, height, P, 3, 0.4), { tone: "mid" })];
  const minor = [];
  const major = [];
  for (let index = 0; index <= steps; index++) {
    const at = lo + 3 + ((hi - lo - 6) * index) / Math.max(1, steps);
    const big = index % every === 0;
    const length = big ? TICK[1] : TICK[0];
    const a = alongX ? [at, plan.y] : [plan.x, at];
    const b = alongX ? [at, plan.y + length] : [plan.x + length, at];
    (big ? major : minor).push(lineOnTop(a, b, z + height, P));
  }
  out.push(lineSvg(minor.join(""), { tone: "lo" }), lineSvg(major.join(""), { tone: "mid" }));
  if (stops) {
    for (const at of [lo - 3, hi]) {
      const stop = alongX ? { x: at, y: plan.y - 1.5, w: 3, d: width + 3, r: 0.8 } : { x: plan.x - 1.5, y: at, w: width + 3, d: 3, r: 0.8 };
      out.push(solidSvg(slabOf(stop, z, height + 2.4, P, 2, 0.3), { tone: "mid" }));
    }
  }
  return out.join("");
}

export function heightField(fn, { x0, y0, nx, ny, step, floor = 0 }, P, { tone = "lo", lines = "faint" } = {}) {
  const { sinA, cosA } = cameraOf(P);
  const light = (() => {
    const l = [-sinA, cosA, 1.4];
    const n = Math.hypot(...l);
    return l.map((v) => v / n);
  })();
  const zAt = (i, j) => fn(x0 + i * step, y0 + j * step);
  const quads = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => [x0 + a * step, y0 + b * step, zAt(a, b)]);
      const gx = (c[1][2] + c[2][2] - c[0][2] - c[3][2]) / (2 * step);
      const gy = (c[3][2] + c[2][2] - c[0][2] - c[1][2]) / (2 * step);
      const n = [-gx, -gy, 1];
      const len = Math.hypot(...n);
      const lit = ((n[0] * light[0] + n[1] * light[1] + n[2] * light[2]) / len + 1) / 2;
      const shade = Math.min(3, Math.max(0, Math.floor((lit - 0.5) * 8)));
      const centre = [c[0][0] + step / 2, c[0][1] + step / 2, (c[0][2] + c[1][2] + c[2][2] + c[3][2]) / 4];
      const d = pathOf(c.map((p) => iso(p, P)), true);
      quads.push({ at: centre, svg: `<path class="iso-shade" data-shade="${shade}" d="${d}"/>`, d });
    }
  }
  const sorted = [...quads].sort((a, b) => depthOf(a.at, P) - depthOf(b.at, P));
  const out = [`<g class="iso-solid">`, ...sorted.map((quad) => `<path class="iso-fill" d="${quad.d}"/>${quad.svg}`)];
  const grid = [];
  for (let i = 0; i <= nx; i++) grid.push(pathOf(Array.from({ length: ny + 1 }, (_, j) => iso([x0 + i * step, y0 + j * step, zAt(i, j)], P))));
  for (let j = 0; j <= ny; j++) grid.push(pathOf(Array.from({ length: nx + 1 }, (_, i) => iso([x0 + i * step, y0 + j * step, zAt(i, j)], P))));
  out.push(`<path class="iso-line" data-tone="${lines}" d="${grid.join("")}"/>`);
  const skirt = (points) => {
    const top = points.map((p) => iso(p, P));
    const bottom = points.map(([x, y]) => iso([x, y, floor], P)).reverse();
    return pathOf([...top, ...bottom], true);
  };
  const right = Array.from({ length: ny + 1 }, (_, j) => [x0 + nx * step, y0 + j * step, zAt(nx, j)]);
  const front = Array.from({ length: nx + 1 }, (_, i) => [x0 + i * step, y0 + ny * step, zAt(i, ny)]);
  const faces = [skirt(right), skirt(front)];
  out.push(`<path class="iso-fill" d="${faces.join("")}"/><path class="iso-shade" data-shade="1" d="${faces[0]}"/><path class="iso-shade" data-shade="2" d="${faces[1]}"/>`);
  const rim = pathOf([...right.map((p) => iso(p, P))]) + pathOf(front.map((p) => iso(p, P)));
  const base = pathOf([iso([x0 + nx * step, y0, floor], P), iso([x0 + nx * step, y0 + ny * step, floor], P), iso([x0, y0 + ny * step, floor], P)]);
  const posts = [[x0 + nx * step, y0], [x0 + nx * step, y0 + ny * step], [x0, y0 + ny * step]].map(([x, y]) => pathOf([iso([x, y, floor], P), iso([x, y, fn(x, y)], P)])).join("");
  const backRim = pathOf(Array.from({ length: ny + 1 }, (_, j) => iso([x0, y0 + j * step, zAt(0, j)], P))) + pathOf(Array.from({ length: nx + 1 }, (_, i) => iso([x0 + i * step, y0, zAt(i, 0)], P)));
  out.push(`<path class="iso-line iso-edge" data-tone="${tone}" d="${rim + base + posts + backRim}"/>`, `</g>`);
  return out.join("");
}
