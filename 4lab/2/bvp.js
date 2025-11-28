const BVP = (() => {
  const config = {
    a: 0.1,
    b: 2.5,
    leftDerivative: -15.21,
    rightValue: 191.85
  };

  const EPS = 1e-12;

  const analyticSolution = (x) => {
    const sinX = Math.sin(x);
    const safeSin = Math.max(Math.abs(sinX), 1e-12);
    const factor = 1 / Math.sqrt(safeSin);
    return factor * (Math.exp(2 * x) + Math.exp(-2 * x));
  };

  const safeSin = (sinX) => {
    if (Math.abs(sinX) < 1e-8) {
      return sinX >= 0 ? 1e-8 : -1e-8;
    }
    return sinX;
  };

  const p = (x) => {
    const sinX = safeSin(Math.sin(x));
    return Math.cos(x) / sinX;
  };

  const q = (x) => {
    const sinX = safeSin(Math.sin(x));
    const sinSq = sinX * sinX;
    return -((17 * sinSq + 1) / (4 * sinSq));
  };

  const gaussianSolve = (matrix, rhs) => {
    const A = matrix.map((row) => row.slice());
    const b = rhs.slice();
    const n = b.length;

    for (let col = 0; col < n; col += 1) {
      let pivotRow = col;
      let pivotVal = Math.abs(A[col][col]);

      for (let row = col + 1; row < n; row += 1) {
        const candidate = Math.abs(A[row][col]);
        if (candidate > pivotVal) {
          pivotVal = candidate;
          pivotRow = row;
        }
      }

      if (pivotVal < EPS) {
        throw new Error('Матрица вырождена: не удаётся выбрать опорный элемент');
      }

      if (pivotRow !== col) {
        [A[pivotRow], A[col]] = [A[col], A[pivotRow]];
        [b[pivotRow], b[col]] = [b[col], b[pivotRow]];
      }

      const pivot = A[col][col];

      for (let j = col; j < n; j += 1) {
        A[col][j] /= pivot;
      }
      b[col] /= pivot;

      for (let row = 0; row < n; row += 1) {
        if (row === col) continue;
        const factor = A[row][col];
        if (Math.abs(factor) < EPS) continue;

        for (let j = col; j < n; j += 1) {
          A[row][j] -= factor * A[col][j];
        }
        b[row] -= factor * b[col];
      }
    }

    return b;
  };

  const buildGrid = (segments) => {
    const n = Math.max(6, Math.round(segments));
    const length = config.b - config.a;
    const h = length / n;
    const xs = Array.from({ length: n + 1 }, (_, i) => config.a + i * h);
    return { xs, h, n };
  };

  const buildSystem = (order, grid) => {
    const size = grid.xs.length;
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));
    const rhs = Array(size).fill(0);
    const h = grid.h;

    if (order === 1) {
      matrix[0][0] = -1 / h;
      matrix[0][1] = 1 / h;
      rhs[0] = config.leftDerivative;
    } else {
      matrix[0][0] = -3 / (2 * h);
      matrix[0][1] = 4 / (2 * h);
      matrix[0][2] = -1 / (2 * h);
      rhs[0] = config.leftDerivative;
    }

    for (let i = 1; i < size - 1; i += 1) {
      const x = grid.xs[i];
      const coeffP = p(x);
      const coeffQ = q(x);

      matrix[i][i - 1] = 1 / (h * h) - coeffP / (2 * h);
      matrix[i][i] = -2 / (h * h) + coeffQ;
      matrix[i][i + 1] = 1 / (h * h) + coeffP / (2 * h);
      rhs[i] = 0;
    }

    matrix[size - 1][size - 1] = 1;
    rhs[size - 1] = config.rightValue;

    return { matrix, rhs };
  };

  const solveWithOrder = (order, grid) => {
    const { matrix, rhs } = buildSystem(order, grid);
    const values = gaussianSolve(matrix, rhs);
    return values;
  };

  const summarize = (approx, exact) => {
    const errors = approx.map((val, idx) => val - exact[idx]);
    const absErrors = errors.map((val) => Math.abs(val));
    const maxAbs = Math.max(...absErrors);
    const avgAbs = absErrors.reduce((acc, val) => acc + val, 0) / absErrors.length;
    const rms = Math.sqrt(errors.reduce((acc, val) => acc + val * val, 0) / errors.length);
    return { errors, absErrors, maxAbs, avgAbs, rms };
  };

  const solveBundle = (segments) => {
    const grid = buildGrid(segments);
    const exact = grid.xs.map((x) => analyticSolution(x));

    const firstOrder = solveWithOrder(1, grid);
    const secondOrder = solveWithOrder(2, grid);

    return {
      grid,
      exact,
      approximations: [
        { order: 1, label: '1-й порядок условий', values: firstOrder, stats: summarize(firstOrder, exact) },
        { order: 2, label: '2-й порядок условий', values: secondOrder, stats: summarize(secondOrder, exact) }
      ]
    };
  };

  return {
    config,
    analyticSolution,
    solveBundle
  };
})();

if (typeof window !== 'undefined') {
  window.BVP = BVP;
}


