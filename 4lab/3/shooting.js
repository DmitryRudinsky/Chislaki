const shootingConfig = {
  a: 0.2,
  b: 3.0,
  h: 0.2,
  leftValue: 0.09142857142857143, // y(0.2)
  rightValue: 25.714285714285715 // y(3)
};

function exactSolution(x) {
  // y(x) = 2 x^2 (1 + 3x) / (2x + 1)
  return (2 * x * x * (1 + 3 * x)) / (2 * x + 1);
}

function systemRhs(x, y, z) {
  // y1 = y, y2 = z = y'
  // исходное уравнение:
  // x^2 (2x + 1) y'' − 4x(x + 1) y' + 2(2x + 3) y = 0
  // => y'' = [4x(x + 1) y' − 2(2x + 3) y] / [x^2 (2x + 1)]
  const denom = x * x * (2 * x + 1);
  const ypp = (4 * x * (x + 1) * z - 2 * (2 * x + 3) * y) / denom;
  return { fy: z, fz: ypp };
}

function rk4Step(x, y, z, h) {
  const k1 = systemRhs(x, y, z);
  const k2 = systemRhs(
    x + h / 2,
    y + (h / 2) * k1.fy,
    z + (h / 2) * k1.fz
  );
  const k3 = systemRhs(
    x + h / 2,
    y + (h / 2) * k2.fy,
    z + (h / 2) * k2.fz
  );
  const k4 = systemRhs(
    x + h,
    y + h * k3.fy,
    z + h * k3.fz
  );

  const nextY =
    y + (h / 6) * (k1.fy + 2 * k2.fy + 2 * k3.fy + k4.fy);
  const nextZ =
    z + (h / 6) * (k1.fz + 2 * k2.fz + 2 * k3.fz + k4.fz);

  return { x: x + h, y: nextY, z: nextZ };
}

function integrateForAlpha(alpha, overrides = {}) {
  const cfg = { ...shootingConfig, ...overrides };
  const { a, b, h, leftValue, rightValue } = cfg;

  const steps = Math.round((b - a) / h);
  const xs = [];
  const ys = [];
  const exact = [];
  const errors = [];

  let x = a;
  let y = leftValue;
  let z = alpha;

  xs.push(x);
  ys.push(y);
  exact.push(exactSolution(x));
  errors.push(y - exact[0]);

  for (let i = 0; i < steps; i += 1) {
    const next = rk4Step(x, y, z, h);
    x = next.x;
    y = next.y;
    z = next.z;

    xs.push(x);
    ys.push(y);
    const ex = exactSolution(x);
    exact.push(ex);
    errors.push(y - ex);
  }

  const finalError = y - rightValue;

  return {
    cfg,
    xs,
    ys,
    exact,
    errors,
    finalY: y,
    boundaryError: finalError
  };
}

function estimateInitialSlope(cfg) {
  const { a, b, leftValue, rightValue } = cfg;
  return (rightValue - leftValue) / (b - a);
}

function solveShooting(options = {}) {
  const cfg = { ...shootingConfig, ...options };
  const { a, b, h, rightValue } = cfg;

  const tol = options.tolerance ?? 1e-8;
  const maxIter = options.maxIter ?? 10;

  const alpha0 = options.alpha0 ?? estimateInitialSlope(cfg);
  const alpha1 = options.alpha1 ?? (alpha0 * 1.2);

  const iterations = [];

  let prevAlpha = alpha0;
  let prevRes = integrateForAlpha(prevAlpha, cfg);
  iterations.push({
    alpha: prevAlpha,
    finalY: prevRes.finalY,
    boundaryError: prevRes.boundaryError
  });

  let currAlpha = alpha1;
  let currRes = integrateForAlpha(currAlpha, cfg);
  iterations.push({
    alpha: currAlpha,
    finalY: currRes.finalY,
    boundaryError: currRes.boundaryError
  });

  let bestRes =
    Math.abs(prevRes.boundaryError) < Math.abs(currRes.boundaryError)
      ? prevRes
      : currRes;

  for (let k = 2; k < maxIter; k += 1) {
    const Fk_1 = prevRes.boundaryError;
    const Fk = currRes.boundaryError;

    if (Math.abs(Fk) < tol || Math.abs(Fk - Fk_1) < 1e-16) {
      break;
    }

    // итерационная формула секущих (по методичке)
    const nextAlpha =
      currAlpha - Fk * (currAlpha - prevAlpha) / (Fk - Fk_1);

    prevAlpha = currAlpha;
    prevRes = currRes;

    currAlpha = nextAlpha;
    currRes = integrateForAlpha(currAlpha, cfg);

    iterations.push({
      alpha: currAlpha,
      finalY: currRes.finalY,
      boundaryError: currRes.boundaryError
    });

    if (Math.abs(currRes.boundaryError) < Math.abs(bestRes.boundaryError)) {
      bestRes = currRes;
    }

    if (Math.abs(currRes.boundaryError) < tol) {
      break;
    }
  }

  // вычисляем абсолютную погрешность вдоль сетки для лучшего решения
  const absErrors = bestRes.errors.map((e) => Math.abs(e));
  const maxAbsError = Math.max(...absErrors);

  return {
    cfg: { ...cfg, rightValue },
    iterations,
    solution: {
      ...bestRes,
      absErrors,
      maxAbsError
    }
  };
}

const shootingApi = {
  shootingConfig,
  exactSolution,
  integrateForAlpha,
  solveShooting
};

if (typeof window !== 'undefined') {
  window.ShootingLab = shootingApi;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = shootingApi;
}

if (
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module
) {
  const result = solveShooting();
  const { cfg, iterations, solution } = result;
  console.log('=== Метод стрельбы для задачи 29 ===');
  console.log(
    `Интервал [${cfg.a}, ${cfg.b}], h = ${cfg.h}, y(${cfg.a}) = ${cfg.leftValue}, y(${cfg.b}) = ${cfg.rightValue}`
  );
  console.log('Итерации подбора начального наклона y\'(a):');
  iterations.forEach((it, idx) => {
    console.log(
      `  k=${idx}: alpha=${it.alpha.toFixed(
        8
      )}, y(b)=${it.finalY.toFixed(8)}, ошибка=${it.boundaryError.toExponential(
        3
      )}`
    );
  });
  console.log(
    `Максимальная абсолютная погрешность по сетке: ${solution.maxAbsError.toExponential(
      3
    )}`
  );
}



