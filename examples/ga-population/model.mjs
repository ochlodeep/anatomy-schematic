export const GA = { size: 8, genes: 6, keep: 4, rate: 0.1, step: 0.12, cross: 0.5, maxGen: 40, done: 0.02 };

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

export function gaussOf(rand) {
  let u = 0;
  while (!u) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

export function lossOf(genes, target) {
  return Math.sqrt(genes.reduce((sum, value, index) => sum + (value - target[index]) ** 2, 0) / genes.length);
}

export function seeded(seed) {
  const rand = makeRng(seed);
  const target = Array.from({ length: GA.genes }, () => 0.1 + 0.8 * rand());
  const pop = Array.from({ length: GA.size }, () => {
    const genes = Array.from({ length: GA.genes }, () => rand());
    return { genes, tones: genes.map(() => "hi"), loss: lossOf(genes, target) };
  });
  const best = Math.min(...pop.map((p) => p.loss));
  return { seed, rand, target, pop, gen: 0, evals: GA.size, best, history: [best] };
}

export function breed(state) {
  const { rand, pop, target } = state;
  const order = pop.map((_, index) => index).sort((a, b) => pop[a].loss - pop[b].loss || a - b);
  const survivors = order.slice(0, GA.keep);
  const culled = order.slice(GA.keep);
  const children = culled.map((slot) => {
    const a = survivors[Math.floor(rand() * GA.keep)];
    const b = survivors[Math.floor(rand() * GA.keep)];
    const tones = [];
    const genes = pop[a].genes.map((value, index) => {
      const first = rand() < GA.cross;
      let gene = first ? value : pop[b].genes[index];
      let tone = first || a === b ? "hi" : "lo";
      if (rand() < GA.rate) {
        gene = Math.min(1, Math.max(0, gene + GA.step * gaussOf(rand)));
        tone = "lit";
      }
      tones.push(tone);
      return gene;
    });
    return { slot, a, b, genes, tones, loss: lossOf(genes, target) };
  });
  return { order, survivors, culled, children };
}

export function apply(state, plan) {
  const pop = state.pop.map((p) => ({ ...p, tones: p.genes.map(() => "hi") }));
  for (const child of plan.children) pop[child.slot] = { genes: child.genes, tones: child.tones, loss: child.loss };
  const best = Math.min(state.best, ...pop.map((p) => p.loss));
  return { ...state, pop, gen: state.gen + 1, evals: state.evals + plan.children.length, best, history: [...state.history, best] };
}

export const finished = (state) => state.gen >= GA.maxGen || state.best <= GA.done;
