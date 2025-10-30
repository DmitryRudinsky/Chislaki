const xStar = 9.625;
const xs = [2.40, 3.422, 4.736, 6.634, 7.948, 9.116, 10.868, 12.182, 13.350, 15.248, 17.0];
const ys = [8.269, 6.182, 6.748, 4.173, 3.181, 1.218, 0.346, 1.584, 4.276, 5.374, 7.921];

function solveTridiagonal(a, b, c, d) {
  const n = d.length;
  const cp = Array(n).fill(0);
  const dp = Array(n).fill(0);
  const x = Array(n).fill(0);

  cp[0] = c[0] / b[0];
  dp[0] = d[0] / b[0];

  for (let i = 1; i < n; i++) {
    const denom = b[i] - a[i] * cp[i - 1];
    cp[i] = c[i] / denom;
    dp[i] = (d[i] - a[i] * dp[i - 1]) / denom;
  }

  x[n - 1] = dp[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    x[i] = dp[i] - cp[i] * x[i + 1];
  }

  return x;
}

function buildNaturalCubicSpline(X, Y) {
  const n = X.length - 1;
  const h = Array(n).fill(0);
  
  for (let i = 0; i < n; i++) {
    h[i] = X[i + 1] - X[i];
  }

  const alpha = Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    alpha[i] = (3 / h[i]) * (Y[i + 1] - Y[i]) - (3 / h[i - 1]) * (Y[i] - Y[i - 1]);
  }

  const size = n - 1;
  const a = Array(size).fill(0);
  const b = Array(size).fill(0);
  const c = Array(size).fill(0);
  const d = Array(size).fill(0);

  b[0] = 2 * (h[0] + h[1]);
  c[0] = h[1];
  d[0] = alpha[1];

  for (let i = 1; i < size - 1; i++) {
    a[i] = h[i];
    b[i] = 2 * (h[i] + h[i + 1]);
    c[i] = h[i + 1];
    d[i] = alpha[i + 1];
  }

  if (size > 1) {
    a[size - 1] = h[n - 2];
    b[size - 1] = 2 * (h[n - 2] + h[n - 1]);
    d[size - 1] = alpha[n - 1];
  }

  const cInner = solveTridiagonal(a, b, c, d);

  const cCoeffs = Array(n + 1).fill(0);
  cCoeffs[0] = 0;
  for (let i = 0; i < cInner.length; i++) {
    cCoeffs[i + 1] = cInner[i];
  }
  cCoeffs[n] = 0;

  const splines = [];
  for (let i = 0; i < n; i++) {
    const ai = Y[i];
    const bi = (Y[i + 1] - Y[i]) / h[i] - h[i] * (2 * cCoeffs[i] + cCoeffs[i + 1]) / 3;
    const ci = cCoeffs[i];
    const di = (cCoeffs[i + 1] - cCoeffs[i]) / (3 * h[i]);

    splines.push({
      interval: [X[i], X[i + 1]],
      a: ai,
      b: bi,
      c: ci,
      d: di,
      x0: X[i]
    });
  }

  return splines;
}

function evaluateSpline(splines, x) {
  for (let i = 0; i < splines.length; i++) {
    const s = splines[i];
    if (x >= s.interval[0] && x <= s.interval[1]) {
      const dx = x - s.x0;
      return s.a + s.b * dx + s.c * dx * dx + s.d * dx * dx * dx;
    }
  }
  
  if (x < splines[0].interval[0]) {
    const s = splines[0];
    const dx = x - s.x0;
    return s.a + s.b * dx + s.c * dx * dx + s.d * dx * dx * dx;
  } else {
    const s = splines[splines.length - 1];
    const dx = x - s.x0;
    return s.a + s.b * dx + s.c * dx * dx + s.d * dx * dx * dx;
  }
}

function findSplineSegment(splines, x) {
  for (let i = 0; i < splines.length; i++) {
    const s = splines[i];
    if (x >= s.interval[0] && x <= s.interval[1]) {
      return i;
    }
  }
  
  if (x < splines[0].interval[0]) return 0;
  return splines.length - 1;
}

function verifySplineAtNodes(splines, X, Y) {
  const results = [];
  for (let i = 0; i < X.length; i++) {
    const xi = X[i];
    const yi = Y[i];
    const si = evaluateSpline(splines, xi);
    results.push({ xi, yi, si, diff: Math.abs(si - yi) });
  }
  return results;
}

function splineSegmentToString(spline) {
  const { a, b, c, d, x0 } = spline;
  let str = `S₃(x) = ${a.toFixed(6)}`;
  
  if (b !== 0) {
    const sign = b >= 0 ? " + " : " - ";
    str += `${sign}${Math.abs(b).toFixed(6)}·(x - ${x0.toFixed(3)})`;
  }
  
  if (c !== 0) {
    const sign = c >= 0 ? " + " : " - ";
    str += `${sign}${Math.abs(c).toFixed(6)}·(x - ${x0.toFixed(3)})²`;
  }
  
  if (d !== 0) {
    const sign = d >= 0 ? " + " : " - ";
    str += `${sign}${Math.abs(d).toFixed(6)}·(x - ${x0.toFixed(3)})³`;
  }
  
  return str;
}

function run() {
  console.log("=== ЕСТЕСТВЕННЫЙ КУБИЧЕСКИЙ СПЛАЙН ДЕФЕКТА 1 ===");
  console.log("Вариант 29");
  console.log(`Заданная точка x* = ${xStar}`);
  
  console.log("\nИсходные данные:");
  console.table(xs.map((x, i) => ({ i, x, y: ys[i] })));

  const splines = buildNaturalCubicSpline(xs, ys);

  const segmentIdx = findSplineSegment(splines, xStar);
  const targetSpline = splines[segmentIdx];

  console.log(`\nТочка x* = ${xStar} находится на отрезке [${targetSpline.interval[0]}, ${targetSpline.interval[1]}]`);
  console.log(`Это отрезок с индексом ${segmentIdx} (между узлами x${segmentIdx} и x${segmentIdx + 1})`);

  console.log("\n=== КОЭФФИЦИЕНТЫ СПЛАЙНА НА ОТРЕЗКЕ, СОДЕРЖАЩЕМ x* ===");
  console.log(`Отрезок: [${targetSpline.interval[0]}, ${targetSpline.interval[1]}]`);
  console.log(`a${segmentIdx + 1} = ${targetSpline.a.toFixed(6)}`);
  console.log(`b${segmentIdx + 1} = ${targetSpline.b.toFixed(6)}`);
  console.log(`c${segmentIdx + 1} = ${targetSpline.c.toFixed(6)}`);
  console.log(`d${segmentIdx + 1} = ${targetSpline.d.toFixed(6)}`);
  console.log(`x₀ = ${targetSpline.x0.toFixed(3)}`);

  console.log("\nФормула сплайна на этом отрезке:");
  console.log(splineSegmentToString(targetSpline));

  const valueAtStar = evaluateSpline(splines, xStar);
  console.log(`\n=== ЗНАЧЕНИЕ В ТОЧКЕ x* ===`);
  console.log(`S₃(${xStar}) = ${valueAtStar.toFixed(6)}`);

  console.log("\n=== ПРОВЕРКА ИНТЕРПОЛЯЦИИ ВО ВСЕХ УЗЛОВЫХ ТОЧКАХ ===");
  const verification = verifySplineAtNodes(splines, xs, ys);
  verification.forEach(v => {
    console.log(`x = ${v.xi.toFixed(3)}: S₃(x) = ${v.si.toFixed(6)}, y = ${v.yi.toFixed(3)}, погрешность = ${v.diff.toExponential(3)}`);
  });

  console.log("\n=== ВСЕ КОЭФФИЦИЕНТЫ СПЛАЙНА ===");
  console.log("(для каждого отрезка)");
  splines.forEach((s, i) => {
    console.log(`\nОтрезок ${i + 1}: [${s.interval[0].toFixed(3)}, ${s.interval[1].toFixed(3)}]`);
    console.log(`  a${i + 1} = ${s.a.toFixed(6)}, b${i + 1} = ${s.b.toFixed(6)}, c${i + 1} = ${s.c.toFixed(6)}, d${i + 1} = ${s.d.toFixed(6)}`);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  run();
}

