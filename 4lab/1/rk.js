const odeConfig = {
  x0: 1,
  y0: Math.E,
  xEnd: 3,
  h: 0.1,
  f: (x, y) => (y * Math.log(y)) / x,
  exact: (x) => Math.exp(x)
};

const solverOptions = {
  implicitMaxIterations: 30,
  implicitTolerance: 1e-10
};

const methodFamilies = {
  explicit: [
    {
      id: 'explicit_euler',
      name: 'Метод Эйлера',
      order: 1,
      reference: 'Схема 1',
      type: 'explicit',
      tableau: {
        c: [0],
        a: [[0]],
        b: [1]
      },
      description: 'Базовая явная схема первого порядка точности.'
    },
    {
      id: 'explicit_heun',
      name: 'Метод Хойна (Heun)',
      order: 2,
      reference: 'Схема 2',
      type: 'explicit',
      tableau: {
        c: [0, 0.5],
        a: [
          [0, 0],
          [0.5, 0]
        ],
        b: [0, 1]
      },
      description: 'Явная двухшаговая схема второго порядка по таблице Бутчера.'
    },
    {
      id: 'explicit_rk3_heun',
      name: 'Метод Хойна 3-го порядка',
      order: 3,
      reference: 'Схема 6',
      type: 'explicit',
      tableau: {
        c: [0, 1/3, 2/3],
        a: [
          [0, 0, 0],
          [1/3, 0, 0],
          [0, 2/3, 0]
        ],
        b: [1/4, 0, 3/4]
      },
      description: 'Явная трехстадийная схема третьего порядка (метод Хойна).'
    },
    {
      id: 'explicit_rk3_ralston',
      name: 'Метод Ральстона 3-го порядка',
      order: 3,
      reference: 'Схема 4',
      type: 'explicit',
      tableau: {
        c: [0, 2/3, 2/3],
        a: [
          [0, 0, 0],
          [2/3, 0, 0],
          [0, 2/3, 0]
        ],
        b: [1/4, 3/8, 3/8]
      },
      description: 'Явная схема Ральстона третьего порядка.'
    },
    {
      id: 'explicit_rk4',
      name: 'Классический Рунге–Кутта 4-го порядка',
      order: 4,
      reference: 'Схема 10',
      type: 'explicit',
      tableau: {
        c: [0, 0.5, 0.5, 1],
        a: [
          [0, 0, 0, 0],
          [0.5, 0, 0, 0],
          [0, 0.5, 0, 0],
          [0, 0, 1, 0]
        ],
        b: [1 / 6, 1 / 3, 1 / 3, 1 / 6]
      },
      description: 'Классическая схема четвертого порядка (таблица Бутчера 4×4).'
    }
  ],
  implicit: [
    {
      id: 'implicit_backward_euler',
      name: 'Неявный метод Эйлера',
      order: 1,
      reference: 'Семейство неявных схем, 1 стадия',
      type: 'implicit',
      tableau: {
        c: [1],
        a: [[1]],
        b: [1]
      },
      description: 'Полностью неявная одношаговая схема первого порядка.'
    },
    {
      id: 'implicit_midpoint',
      name: 'Неявный середний (midpoint)',
      order: 2,
      reference: 'Семейство неявных схем, с = 1/2',
      type: 'implicit',
      tableau: {
        c: [0.5],
        a: [[0.5]],
        b: [1]
      },
      description: 'Сингл-стадийная диагонально-неявная схема второго порядка.'
    },
    {
      id: 'implicit_trapezoidal',
      name: 'Метод трапеций (CN)',
      order: 2,
      reference: 'Семейство неявных схем, 2 стадии',
      type: 'implicit',
      tableau: {
        c: [0, 1],
        a: [
          [0, 0],
          [0.5, 0.5]
        ],
        b: [0.5, 0.5]
      },
      description: 'Неявный аналог метода Хойна — схема второго порядка.'
    },
    {
      id: 'implicit_rk3',
      name: 'Метод Радо IIA 3-го порядка',
      order: 3,
      reference: 'Схема 36 (Radau IIA, 2 стадии)',
      type: 'implicit',
      tableau: {
        c: [1 / 3, 1],
        a: [
          [5 / 12, -1 / 12],
          [3 / 4, 1 / 4]
        ],
        b: [3 / 4, 1 / 4]
      },
      description: 'Двухстадийная неявная схема Радо IIA третьего порядка.'
    },
    {
      id: 'implicit_gauss',
      name: 'Метод Гаусса (Gauss-Legendre) 4-го порядка',
      order: 4,
      reference: 'Схема Гаусса 2-стадии',
      type: 'implicit',
      tableau: {
        c: [0.5 - Math.sqrt(3)/6, 0.5 + Math.sqrt(3)/6],
        a: [
          [0.25, 0.25 - Math.sqrt(3)/6],
          [0.25 + Math.sqrt(3)/6, 0.25]
        ],
        b: [0.5, 0.5]
      },
      description: 'Полностью неявная схема четвертого порядка (Гаусса-Лежандра).'
    }
  ]
};

function solveRungeKutta(method, overrides = {}) {
  const cfg = { ...odeConfig, ...overrides };
  const { f, exact, x0, xEnd, y0, h } = cfg;
  const stepsTotal = Math.round((xEnd - x0) / h);
  const points = [];
  const stageHistory = [];
  let x = x0;
  let y = y0;

  points.push(buildPoint(0, x, y, exact));

  for (let step = 1; step <= stepsTotal; step += 1) {
    const { nextY, stages, iterations, converged } = performStep(method, f, x, y, h);
    x = Number((x0 + step * h).toFixed(12));
    y = nextY;

    stageHistory.push({ step, stages, iterations, converged });
    points.push(buildPoint(step, x, y, exact));
  }

  const errors = points.map((p) => p.absError);
  const maxError = Math.max(...errors);

  return {
    method,
    points,
    stageHistory,
    maxError,
    finalError: errors[errors.length - 1],
    config: cfg
  };
}

function buildPoint(step, x, y, exact) {
  const exactValue = exact(x);
  const diff = y - exactValue;
  return {
    step,
    x,
    y,
    exact: exactValue,
    error: diff,
    absError: Math.abs(diff)
  };
}

function performStep(method, f, x, y, h) {
  const { tableau, type } = method;
  const s = tableau.c.length;
  let stages;
  let iterations = 0;
  let converged = true;

  if (type === 'explicit') {
    stages = computeExplicitStages(f, x, y, h, tableau);
  } else {
    const implicitResult = computeImplicitStages(f, x, y, h, tableau);
    stages = implicitResult.stages;
    iterations = implicitResult.iterations;
    converged = implicitResult.converged;
  }

  const deltaY = h * tableau.b.reduce((acc, bi, i) => acc + bi * stages[i], 0);
  return { nextY: y + deltaY, stages, iterations, converged };
}

function computeExplicitStages(f, x, y, h, tableau) {
  const { c, a } = tableau;
  const s = c.length;
  const stages = Array(s).fill(0);

  for (let i = 0; i < s; i += 1) {
    let stageY = y;
    for (let j = 0; j < i; j += 1) {
      stageY += h * (a[i][j] || 0) * stages[j];
    }
    stages[i] = f(x + c[i] * h, stageY);
  }

  return stages;
}

function computeImplicitStages(f, x, y, h, tableau) {
  const { c, a } = tableau;
  const s = c.length;
  let stages = Array(s).fill(0).map((_, i) => f(x + c[i] * h, y));
  let converged = false;
  let iterations = 0;

  for (; iterations < solverOptions.implicitMaxIterations; iterations += 1) {
    const nextStages = [];
    let maxDiff = 0;

    for (let i = 0; i < s; i += 1) {
      let stageY = y;
      for (let j = 0; j < s; j += 1) {
        stageY += h * (a[i][j] || 0) * stages[j];
      }
      const candidate = f(x + c[i] * h, stageY);
      nextStages[i] = candidate;
      maxDiff = Math.max(maxDiff, Math.abs(candidate - stages[i]));
    }

    stages = nextStages;
    if (maxDiff < solverOptions.implicitTolerance) {
      converged = true;
      break;
    }
  }

  return { stages, iterations, converged };
}

function runCli() {
  const allMethods = [...methodFamilies.explicit, ...methodFamilies.implicit];
  console.log('=== Численное решение задачи Коши методом Рунге–Кутты ===');
  console.log('x y\' = y ln y, y(1) = e, шаг h = 0.1, x ∈ [1, 3]');

  allMethods.forEach((method) => {
    const solution = solveRungeKutta(method);
    console.log(`\n--- ${method.name} (${method.type}, порядок ${method.order}) ---`);
    console.log(`Максимальная погрешность: ${solution.maxError.toExponential(6)}`);
    console.log(`Погрешность в x=3: ${solution.finalError.toExponential(6)}`);
  });
}

const rkApi = {
  odeConfig,
  methodFamilies,
  solverOptions,
  solveRungeKutta,
  runCli
};

if (typeof window !== 'undefined') {
  window.rkLab = rkApi;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = rkApi;
}

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runCli();
}


