const xStar = 0.413;
const xs = [-1.33, -0.94, -0.55, -0.16, 0.23, 0.62, 1.01, 1.40, 1.79];
const ys = [-8.6254, -7.2165, -5.1761, 4.0349, 3.9539, 4.5172, -2.6217, -4.9364, -5.0512];

function chooseNearestNodes(xValues, yValues, xTarget, degree) {
  const count = degree + 1;
  const idxs = xValues
    .map((x, i) => ({ i, d: Math.abs(x - xTarget) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map(({ i }) => i);

  const pairs = idxs
    .map(i => ({ x: xValues[i], y: yValues[i] }))
    .sort((a, b) => a.x - b.x);

  return {
    X: pairs.map(p => p.x),
    Y: pairs.map(p => p.y)
  };
}

// Новая функция: получить все возможные последовательные интервалы
function getAllConsecutiveIntervals(xValues, yValues, degree) {
  const count = degree + 1;
  const intervals = [];
  
  for (let i = 0; i <= xValues.length - count; i++) {
    const X = xValues.slice(i, i + count);
    const Y = yValues.slice(i, i + count);
    intervals.push({
      X,
      Y,
      startIdx: i,
      endIdx: i + count - 1,
      interval: `[${X[0].toFixed(2)}, ${X[X.length - 1].toFixed(2)}]`
    });
  }
  
  return intervals;
}

// Проверить, находится ли точка внутри интервала
function isPointInInterval(xTarget, X) {
  return xTarget >= X[0] && xTarget <= X[X.length - 1];
}

function dividedDifferences(X, Y) {
  const n = X.length;
  const table = Array(n).fill(0).map(() => Array(n).fill(0));
  
  // Заполняем первый столбец значениями Y
  for (let i = 0; i < n; i += 1) {
    table[i][0] = Y[i];
  }

  // Заполняем остальные столбцы значениями разделённых разностей
  for (let j = 1; j < n; j += 1) {
    for (let i = 0; i < n - j; i += 1) {
      table[i][j] = (table[i + 1][j - 1] - table[i][j - 1]) / (X[i + j] - X[i]);
    }
  }
  
  return table[0];
}

function evaluateNewton(X, coeffs, x) {
  let result = coeffs[0];
  let product = 1;
  
  for (let i = 1; i < coeffs.length; i += 1) {
    product *= (x - X[i - 1]);
    result += coeffs[i] * product;
  }
  
  return result;
}

function newtonPolynomialToString(X, coeffs) {
  let str = coeffs[0].toFixed(6);
  
  for (let i = 1; i < coeffs.length; i += 1) {
    const sign = coeffs[i] >= 0 ? " + " : " - ";
    const coef = Math.abs(coeffs[i]).toFixed(6);
    str += sign + coef;
    
    for (let j = 0; j < i; j += 1) {
      const xj = X[j];
      if (xj >= 0) {
        str += `·(x - ${xj.toFixed(2)})`;
      } else {
        str += `·(x + ${Math.abs(xj).toFixed(2)})`;
      }
    }
  }
  
  return str;
}

function verifyAtAllNodes(X, Y, coeffs) {
  const results = [];
  for (let i = 0; i < X.length; i += 1) {
    const xi = X[i];
    const yi = Y[i];
    const p = evaluateNewton(X, coeffs, xi);
    results.push({ xi, yi, p, diff: Math.abs(p - yi) });
  }
  return results;
}

function estimateError(X, x, maxDerivative) {
  let omega = 1;
  for (let i = 0; i < X.length; i += 1) {
    omega *= Math.abs(x - X[i]);
  }
  
  const n = X.length - 1;
  let factorial = 1;
  for (let i = 2; i <= n + 1; i += 1) {
    factorial *= i;
  }
  
  return (maxDerivative / factorial) * omega;
}

function estimateMaxDerivative(X, Y) {
  const n = X.length;
  const table = Array(n).fill(0).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i += 1) {
    table[i][0] = Y[i];
  }
  
  let maxDiff = 0;
  for (let j = 1; j < n; j += 1) {
    for (let i = 0; i < n - j; i += 1) {
      table[i][j] = (table[i + 1][j - 1] - table[i][j - 1]) / (X[i + j] - X[i]);
      maxDiff = Math.max(maxDiff, Math.abs(table[i][j]));
    }
  }
  
  return maxDiff * 10;
}
// P(x) = a_0 + a_1(x - x_0) + a_2(x - x_0)(x - x_1) + ... + a_n(x - x_0)(x - x_1)...(x - x_{n-1})
function run() {
  console.log("Заданная точка x* =", xStar);
  
  // Получаем все возможные интервалы
  const intervals2 = getAllConsecutiveIntervals(xs, ys, 2);
  const intervals3 = getAllConsecutiveIntervals(xs, ys, 3);
  
  console.log("\n=== ВСЕ ВОЗМОЖНЫЕ ИНТЕРВАЛЫ ДЛЯ МНОГОЧЛЕНА 2-Й СТЕПЕНИ ===");
  console.log(`Всего интервалов: ${intervals2.length}`);
  
  intervals2.forEach((interval, idx) => {
    const inInterval = isPointInInterval(xStar, interval.X);
    console.log(`\n--- Интервал ${idx + 1}: ${interval.interval} ${inInterval ? '✓ содержит x*' : ''} ---`);
    console.log("Узлы:", interval.X.map((x, i) => `(${x.toFixed(2)}, ${interval.Y[i].toFixed(4)})`).join(', '));
    
    const coeffs = dividedDifferences(interval.X, interval.Y);
    const pAtStar = evaluateNewton(interval.X, coeffs, xStar);
    const maxDeriv = estimateMaxDerivative(interval.X, interval.Y);
    const error = estimateError(interval.X, xStar, maxDeriv);
    
    console.log(`P₂(${xStar}) = ${pAtStar.toFixed(6)}`);
    console.log("Коэффициенты:", coeffs.map(c => c.toFixed(4)).join(', '));
    console.log(`Оценка погрешности: ≤ ${error.toExponential(3)}`);
  });
  
  console.log("\n=== ВСЕ ВОЗМОЖНЫЕ ИНТЕРВАЛЫ ДЛЯ МНОГОЧЛЕНА 3-Й СТЕПЕНИ ===");
  console.log(`Всего интервалов: ${intervals3.length}`);
  
  intervals3.forEach((interval, idx) => {
    const inInterval = isPointInInterval(xStar, interval.X);
    console.log(`\n--- Интервал ${idx + 1}: ${interval.interval} ${inInterval ? '✓ содержит x*' : ''} ---`);
    console.log("Узлы:", interval.X.map((x, i) => `(${x.toFixed(2)}, ${interval.Y[i].toFixed(4)})`).join(', '));
    
    const coeffs = dividedDifferences(interval.X, interval.Y);
    const pAtStar = evaluateNewton(interval.X, coeffs, xStar);
    const maxDeriv = estimateMaxDerivative(interval.X, interval.Y);
    const error = estimateError(interval.X, xStar, maxDeriv);
    
    console.log(`P₃(${xStar}) = ${pAtStar.toFixed(6)}`);
    console.log("Коэффициенты:", coeffs.map(c => c.toFixed(4)).join(', '));
    console.log(`Оценка погрешности: ≤ ${error.toExponential(3)}`);
  });

  // Старый подход с ближайшими точками для справки
  console.log("\n=== ПОДХОД С БЛИЖАЙШИМИ ТОЧКАМИ (для справки) ===");
  const { X: X2, Y: Y2 } = chooseNearestNodes(xs, ys, xStar, 2);
  const { X: X3, Y: Y3 } = chooseNearestNodes(xs, ys, xStar, 3);
  
  const coeffs2 = dividedDifferences(X2, Y2);
  const coeffs3 = dividedDifferences(X3, Y3);
  
  const p2AtStar = evaluateNewton(X2, coeffs2, xStar);
  const p3AtStar = evaluateNewton(X3, coeffs3, xStar);
  
  console.log("\nБлижайшие узлы для P₂:", X2.map(x => x.toFixed(2)).join(', '));
  console.log(`P₂(${xStar}) = ${p2AtStar.toFixed(6)}`);
  
  console.log("\nБлижайшие узлы для P₃:", X3.map(x => x.toFixed(2)).join(', '));
  console.log(`P₃(${xStar}) = ${p3AtStar.toFixed(6)}`);
}

if (typeof module !== 'undefined' && module.exports) {
  run();
}

