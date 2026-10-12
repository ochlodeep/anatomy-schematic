export const GA = { size: 12, keep: 6, levels: 16, rate: 0.2, cross: 0.5, maxGen: 20 };

export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bump = (u, v, cu, cv, s) => Math.exp(-((u - cu) ** 2 + (v - cv) ** 2) / (2 * s * s));
const raw = (gx, gy) => {
  const u = gx / (GA.levels - 1);
  const v = gy / (GA.levels - 1);
  return 0.06 + bump(u, v, 0.74, 0.26, 0.13) + 0.64 * bump(u, v, 0.24, 0.72, 0.17) + 0.05 * Math.cos(9 * u) * Math.cos(7 * v);
};
const PEAK = Math.max(...Array.from({ length: GA.levels ** 2 }, (_, n) => raw(n % GA.levels, Math.floor(n / GA.levels))));
export const fitnessOf = (gx, gy) => raw(gx, gy) / PEAK;

const clamp = (g) => Math.min(GA.levels - 1, Math.max(0, g));
const mean = (pop) => pop.reduce((sum, p) => sum + p.fit, 0) / pop.length;
const individual = (genes, extra = {}) => ({ genes, fit: fitnessOf(genes[0], genes[1]), lit: false, ...extra });

export function seeded(seed) {
  const rand = makeRng(seed);
  const pop = Array.from({ length: GA.size }, () => individual([0, 1].map(() => Math.floor(rand() * GA.levels))));
  const best = Math.max(...pop.map((p) => p.fit));
  return { seed, rand, pop, gen: 0, evals: GA.size, best, mean: mean(pop), history: [best] };
}

export function breed(state) {
  const { rand, pop } = state;
  const order = pop.map((_, index) => index).sort((a, b) => pop[b].fit - pop[a].fit || a - b);
  const survivors = order.slice(0, GA.keep);
  const culled = order.slice(GA.keep);
  const children = culled.map((slot) => {
    const a = survivors[Math.floor(rand() * GA.keep)];
    const b = survivors[Math.floor(rand() * GA.keep)];
    let lit = false;
    const genes = [0, 1].map((index) => {
      let gene = rand() < GA.cross ? pop[a].genes[index] : pop[b].genes[index];
      if (rand() < GA.rate) {
        gene = clamp(gene + (rand() < 0.5 ? -1 : 1) * (rand() < 0.25 ? 2 : 1));
        lit = true;
      }
      return gene;
    });
    return { slot, a, b, ...individual(genes, { lit }) };
  });
  return { order, survivors, culled, children };
}

export function apply(state, plan) {
  const pop = state.pop.map((p) => ({ ...p, lit: false }));
  for (const child of plan.children) pop[child.slot] = individual(child.genes, { lit: child.lit });
  const best = Math.max(state.best, ...pop.map((p) => p.fit));
  return { ...state, pop, gen: state.gen + 1, evals: state.evals + plan.children.length, best, mean: mean(pop), history: [...state.history, best] };
}

export const finished = (state) => state.gen >= GA.maxGen;
