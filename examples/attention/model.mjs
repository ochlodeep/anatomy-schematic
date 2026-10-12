export const TOKENS = ["the", "cat", "sat", "on", "the", "mat"];
export const D = 4;

export const X = [
  [0.9, 0.1, 0.2, 0.1],
  [0.2, 0.9, 0.1, 0.6],
  [0.1, 0.3, 0.9, 0.2],
  [0.6, 0.1, 0.3, 0.2],
  [0.9, 0.1, 0.2, 0.1],
  [0.2, 0.7, 0.2, 0.8],
];

export const WQ = [
  [1.2, 0.1, 0.0, 0.2],
  [0.1, 0.4, 1.3, 0.1],
  [0.0, 1.4, 0.2, 0.3],
  [0.2, 0.1, 0.3, 1.1],
];
export const WK = [
  [1.0, 0.2, 0.1, 0.0],
  [0.0, 1.3, 0.2, 0.4],
  [0.2, 0.1, 1.4, 0.1],
  [0.1, 0.3, 0.1, 1.2],
];
export const WV = [
  [0.8, 0.1, 0.1, 0.2],
  [0.1, 0.9, 0.2, 0.1],
  [0.2, 0.1, 0.9, 0.1],
  [0.1, 0.2, 0.1, 0.8],
];

const SHARP = 2.2;
const scaled = (m, by) => m.map((row) => row.map((v) => v * by));
const matmul = (a, b) => a.map((row) => b[0].map((_, j) => row.reduce((sum, v, k) => sum + v * b[k][j], 0)));
const transpose = (m) => m[0].map((_, j) => m.map((row) => row[j]));
const softmax = (row) => {
  const top = Math.max(...row);
  const e = row.map((v) => Math.exp(v - top));
  const total = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / total);
};

export function attention() {
  const Q = matmul(X, scaled(WQ, SHARP));
  const K = matmul(X, scaled(WK, SHARP));
  const V = matmul(X, WV);
  const S = matmul(Q, transpose(K)).map((row) => row.map((v) => v / Math.sqrt(D)));
  const A = S.map(softmax);
  const O = matmul(A, V);
  return { Q, K, V, S, A, O };
}
