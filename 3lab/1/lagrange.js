const xStar = 0.413;
const xs = [-1.33, -0.94, -0.55, -0.16, 0.23, 0.62, 1.01, 1.40, 1.79];
const ys = [-8.6254, -7.2165, -5.1761, 4.0349, 3.9539, 4.5172, -2.6217, -4.9364, -5.0512];

// xValues = xs, 
// yValues = ys,
// xTarget = xStar, 
// degree = 2 || 3
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

function multiplyPolynomials(a, b) {
  const res = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      res[i + j] += a[i] * b[j];
    }
  }
  return res;
}

function scalePolynomial(p, c) {
  return p.map(v => v * c);
}

function addPolynomials(a, b) {
  const n = Math.max(a.length, b.length);
  const res = Array(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    const av = i < a.length ? a[i] : 0;
    const bv = i < b.length ? b[i] : 0;
    res[i] = av + bv;
  }
  return res;
}

function lagrangeCoefficients(X, Y) {
  const n = X.length - 1;
  let coeffs = Array(n + 1).fill(0);
  for (let i = 0; i <= n; i += 1) {
    let Li = [1];
    let denom = 1;
    for (let j = 0; j <= n; j += 1) {
      if (i === j) continue;
      Li = multiplyPolynomials(Li, [-X[j], 1]); // x - x_j
      denom *= (X[i] - X[j]);
    }
    const scaled = scalePolynomial(Li, Y[i] / denom);
    coeffs = addPolynomials(coeffs, scaled);
  }
  return coeffs;
}

function evaluatePolynomial(coeffs, x) {
  let acc = 0;
  for (let i = coeffs.length - 1; i >= 0; i -= 1) {
    acc = acc * x + coeffs[i];
  }
  return acc;
}

function polynomialToString(coeffs, prec = 6) {
  const parts = [];
  for (let i = coeffs.length - 1; i >= 0; i -= 1) {
    const c = coeffs[i];
    const abs = Math.abs(c);
    const sign = c < 0 ? " - " : (parts.length ? " + " : "");
    const mag = abs.toFixed(prec);
    if (i === 0) {
      parts.push(`${sign}${mag}`);
    } else if (i === 1) {
      parts.push(`${sign}${mag}·x`);
    } else {
      parts.push(`${sign}${mag}·x^${i}`);
    }
  }
  return parts.join("");
}

function verifyAtAllNodes(coeffs, X, Y) {
  const results = [];
  for (let i = 0; i < X.length; i += 1) {
    const xi = X[i];
    const yi = Y[i];
    const p = evaluatePolynomial(coeffs, xi);
    results.push({ xi, yi, p, diff: Math.abs(p - yi) });
  }
  return results;
}

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
    
    const coeffs = lagrangeCoefficients(interval.X, interval.Y);
    const pAtStar = evaluatePolynomial(coeffs, xStar);
    
    console.log(`P₂(${xStar}) = ${pAtStar.toFixed(6)}`);
    console.log("Многочлен:", polynomialToString(coeffs, 4));
  });
  
  console.log("\n=== ВСЕ ВОЗМОЖНЫЕ ИНТЕРВАЛЫ ДЛЯ МНОГОЧЛЕНА 3-Й СТЕПЕНИ ===");
  console.log(`Всего интервалов: ${intervals3.length}`);
  
  intervals3.forEach((interval, idx) => {
    const inInterval = isPointInInterval(xStar, interval.X);
    console.log(`\n--- Интервал ${idx + 1}: ${interval.interval} ${inInterval ? '✓ содержит x*' : ''} ---`);
    console.log("Узлы:", interval.X.map((x, i) => `(${x.toFixed(2)}, ${interval.Y[i].toFixed(4)})`).join(', '));
    
    const coeffs = lagrangeCoefficients(interval.X, interval.Y);
    const pAtStar = evaluatePolynomial(coeffs, xStar);
    
    console.log(`P₃(${xStar}) = ${pAtStar.toFixed(6)}`);
    console.log("Многочлен:", polynomialToString(coeffs, 4));
  });

  // Старый подход с ближайшими точками для справки
  console.log("\n=== ПОДХОД С БЛИЖАЙШИМИ ТОЧКАМИ (для справки) ===");
  const { X: X2, Y: Y2 } = chooseNearestNodes(xs, ys, xStar, 2);
  const { X: X3, Y: Y3 } = chooseNearestNodes(xs, ys, xStar, 3);
  
  const coeffs2 = lagrangeCoefficients(X2, Y2);
  const coeffs3 = lagrangeCoefficients(X3, Y3);
  
  const p2AtStar = evaluatePolynomial(coeffs2, xStar);
  const p3AtStar = evaluatePolynomial(coeffs3, xStar);
  
  console.log("\nБлижайшие узлы для P₂:", X2.map(x => x.toFixed(2)).join(', '));
  console.log(`P₂(${xStar}) = ${p2AtStar.toFixed(6)}`);
  
  console.log("\nБлижайшие узлы для P₃:", X3.map(x => x.toFixed(2)).join(', '));
  console.log(`P₃(${xStar}) = ${p3AtStar.toFixed(6)}`);
}

if (typeof module !== 'undefined' && module.exports) {
  run();
}


