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
  const { X: X2, Y: Y2 } = chooseNearestNodes(xs, ys, xStar, 2);
  const { X: X3, Y: Y3 } = chooseNearestNodes(xs, ys, xStar, 3);

  const coeffs2 = dividedDifferences(X2, Y2);
  const coeffs3 = dividedDifferences(X3, Y3);

  const p2AtStar = evaluateNewton(X2, coeffs2, xStar);
  const p3AtStar = evaluateNewton(X3, coeffs3, xStar);

  const verify2 = verifyAtAllNodes(X2, Y2, coeffs2);
  const verify3 = verifyAtAllNodes(X3, Y3, coeffs3);

  const maxDeriv2 = estimateMaxDerivative(X2, Y2);
  const maxDeriv3 = estimateMaxDerivative(X3, Y3);
  const error2 = estimateError(X2, xStar, maxDeriv2);
  const error3 = estimateError(X3, xStar, maxDeriv3);

  console.log("Заданная точка x* =", xStar);
  console.log("\nВыбранные узлы для многочлена 2-й степени:");
  console.table(X2.map((x, i) => ({ x, y: Y2[i] })));
  console.log("\nВыбранные узлы для многочлена 3-й степени:");
  console.table(X3.map((x, i) => ({ x, y: Y3[i] })));

  console.log("\n=== МНОГОЧЛЕН НЬЮТОНА 2-Й СТЕПЕНИ ===");
  console.log("Коэффициенты разделённых разностей:", coeffs2.map(c => c.toFixed(6)));
  console.log("\nP₂(x) =", newtonPolynomialToString(X2, coeffs2));
  console.log("\nЗначение в точке x*:");
  console.log(`P₂(${xStar}) = ${p2AtStar.toFixed(6)}`);
  console.log("\nПроверка во всех узловых точках:");
  verify2.forEach(v => {
    console.log(`  x = ${v.xi.toFixed(2)}: P₂(x) = ${v.p.toFixed(6)}, y = ${v.yi}, погрешность = ${v.diff.toExponential(3)}`);
  });
  console.log(`\nОценка погрешности интерполяции в точке x*: ≤ ${error2.toExponential(3)}`);

  console.log("\n=== МНОГОЧЛЕН НЬЮТОНА 3-Й СТЕПЕНИ ===");
  console.log("Коэффициенты разделённых разностей:", coeffs3.map(c => c.toFixed(6)));
  console.log("\nP₃(x) =", newtonPolynomialToString(X3, coeffs3));
  console.log("\nЗначение в точке x*:");
  console.log(`P₃(${xStar}) = ${p3AtStar.toFixed(6)}`);
  console.log("\nПроверка во всех узловых точках:");
  verify3.forEach(v => {
    console.log(`  x = ${v.xi.toFixed(2)}: P₃(x) = ${v.p.toFixed(6)}, y = ${v.yi}, погрешность = ${v.diff.toExponential(3)}`);
  });
  console.log(`\nОценка погрешности интерполяции в точке x*: ≤ ${error3.toExponential(3)}`);

  console.log("\n=== СРАВНЕНИЕ РЕЗУЛЬТАТОВ ===");
  console.log(`P₂(${xStar}) = ${p2AtStar.toFixed(6)}`);
  console.log(`P₃(${xStar}) = ${p3AtStar.toFixed(6)}`);
  console.log(`Разница |P₃ - P₂| = ${Math.abs(p3AtStar - p2AtStar).toFixed(6)}`);
}

if (typeof module !== 'undefined' && module.exports) {
  run();
}

