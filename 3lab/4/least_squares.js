const xStar = -0.185;
const xs = [-1.2, -0.95, -0.70, -0.45, -0.20, 0.05, 0.30, 0.55, 0.80, 1.05, 1.30];
const ys = [8.7261, 5.9842, 3.7347, 2.2423, 1.4658, 1.2147, 1.7239, 2.5624, 2.8157, 2.6783, 1.5237];

function solveSLAU(A, b) {
  const n = b.length;
  const augmented = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }

  return x;
}

function leastSquares(X, Y, degree) {
  const n = degree + 1;
  const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
  const rightSide = Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const power = i + j;
      matrix[i][j] = X.reduce((sum, x) => sum + Math.pow(x, power), 0);
    }
  }

  for (let i = 0; i < n; i++) {
    rightSide[i] = X.reduce((sum, x, idx) => sum + Y[idx] * Math.pow(x, i), 0);
  }

  const coefficients = solveSLAU(matrix, rightSide);

  return coefficients;
}

function evaluatePolynomial(coeffs, x) {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result += coeffs[i] * Math.pow(x, i);
  }
  return result;
}

function polynomialToString(coeffs, degree) {
  const parts = [];
  
  for (let i = 0; i <= degree; i++) {
    const c = coeffs[i];
    const absC = Math.abs(c);
    
    if (i === 0) {
      parts.push(c.toFixed(6));
    } else {
      const sign = c >= 0 ? " + " : " - ";
      if (i === 1) {
        parts.push(`${sign}${absC.toFixed(6)}·x`);
      } else {
        parts.push(`${sign}${absC.toFixed(6)}·x^${i}`);
      }
    }
  }
  
  return parts.join("");
}

function calculateSquaredError(X, Y, coeffs) {
  let sum = 0;
  for (let i = 0; i < X.length; i++) {
    const predicted = evaluatePolynomial(coeffs, X[i]);
    const error = predicted - Y[i];
    sum += error * error;
  }
  return sum;
}

function calculateMeanSquaredError(X, Y, coeffs) {
  return Math.sqrt(calculateSquaredError(X, Y, coeffs) / (X.length + 1));
}

function run() {
  console.log("=== МЕТОД НАИМЕНЬШИХ КВАДРАТОВ (МНК) ===");
  console.log("Вариант 29");
  console.log(`Заданная точка x* = ${xStar}\n`);

  console.log("Исходные данные:");
  console.table(xs.map((x, i) => ({ i, x, y: ys[i] })));

  const coeffs1 = leastSquares(xs, ys, 1);
  const coeffs2 = leastSquares(xs, ys, 2);
  const coeffs3 = leastSquares(xs, ys, 3);

  console.log("\n=== МНОГОЧЛЕН 1-Й СТЕПЕНИ ===");
  console.log("F₁(x) =", polynomialToString(coeffs1, 1));
  const error1 = calculateSquaredError(xs, ys, coeffs1);
  const mse1 = calculateMeanSquaredError(xs, ys, coeffs1);
  console.log(`Сумма квадратов ошибок: Φ₁ = ${error1.toFixed(6)}`);
  console.log(`Среднеквадратичное отклонение: E₁ = ${mse1.toFixed(6)}`);
  const value1 = evaluatePolynomial(coeffs1, xStar);
  console.log(`F₁(${xStar}) = ${value1.toFixed(6)}`);

  console.log("\n=== МНОГОЧЛЕН 2-Й СТЕПЕНИ ===");
  console.log("F₂(x) =", polynomialToString(coeffs2, 2));
  const error2 = calculateSquaredError(xs, ys, coeffs2);
  const mse2 = calculateMeanSquaredError(xs, ys, coeffs2);
  console.log(`Сумма квадратов ошибок: Φ₂ = ${error2.toFixed(6)}`);
  console.log(`Среднеквадратичное отклонение: E₂ = ${mse2.toFixed(6)}`);
  const value2 = evaluatePolynomial(coeffs2, xStar);
  console.log(`F₂(${xStar}) = ${value2.toFixed(6)}`);

  console.log("\n=== МНОГОЧЛЕН 3-Й СТЕПЕНИ ===");
  console.log("F₃(x) =", polynomialToString(coeffs3, 3));
  const error3 = calculateSquaredError(xs, ys, coeffs3);
  const mse3 = calculateMeanSquaredError(xs, ys, coeffs3);
  console.log(`Сумма квадратов ошибок: Φ₃ = ${error3.toFixed(6)}`);
  console.log(`Среднеквадратичное отклонение: E₃ = ${mse3.toFixed(6)}`);
  const value3 = evaluatePolynomial(coeffs3, xStar);
  console.log(`F₃(${xStar}) = ${value3.toFixed(6)}`);

  console.log("\n=== СРАВНЕНИЕ РЕЗУЛЬТАТОВ ===");
  console.log("┌──────────┬─────────────────┬──────────────┬────────────────┐");
  console.log("│ Степень  │ Φ (сумма кв.)   │ E (СКО)      │ F(x*)          │");
  console.log("├──────────┼─────────────────┼──────────────┼────────────────┤");
  console.log(`│    1     │ ${error1.toFixed(8).padStart(15)} │ ${mse1.toFixed(8).padStart(12)} │ ${value1.toFixed(10).padStart(14)} │`);
  console.log(`│    2     │ ${error2.toFixed(8).padStart(15)} │ ${mse2.toFixed(8).padStart(12)} │ ${value2.toFixed(10).padStart(14)} │`);
  console.log(`│    3     │ ${error3.toFixed(8).padStart(15)} │ ${mse3.toFixed(8).padStart(12)} │ ${value3.toFixed(10).padStart(14)} │`);
  console.log("└──────────┴─────────────────┴──────────────┴────────────────┘");

  console.log("\n=== ПРОВЕРКА: ЗНАЧЕНИЯ МНОГОЧЛЕНОВ В УЗЛОВЫХ ТОЧКАХ ===");
  console.log("┌────────┬──────────┬──────────┬──────────┬──────────┐");
  console.log("│   x    │    y     │   F₁(x)  │   F₂(x)  │   F₃(x)  │");
  console.log("├────────┼──────────┼──────────┼──────────┼──────────┤");
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];
    const f1 = evaluatePolynomial(coeffs1, x);
    const f2 = evaluatePolynomial(coeffs2, x);
    const f3 = evaluatePolynomial(coeffs3, x);
    console.log(`│ ${x.toFixed(2).padStart(6)} │ ${y.toFixed(4).padStart(8)} │ ${f1.toFixed(4).padStart(8)} │ ${f2.toFixed(4).padStart(8)} │ ${f3.toFixed(4).padStart(8)} │`);
  }
  console.log("└────────┴──────────┴──────────┴──────────┴──────────┘");

  console.log("\n=== КОЭФФИЦИЕНТЫ МНОГОЧЛЕНОВ ===");
  console.log("\nМногочлен 1-й степени: F₁(x) = a₀ + a₁·x");
  coeffs1.forEach((c, i) => console.log(`  a${i} = ${c.toFixed(10)}`));
  
  console.log("\nМногочлен 2-й степени: F₂(x) = a₀ + a₁·x + a₂·x²");
  coeffs2.forEach((c, i) => console.log(`  a${i} = ${c.toFixed(10)}`));
  
  console.log("\nМногочлен 3-й степени: F₃(x) = a₀ + a₁·x + a₂·x² + a₃·x³");
  coeffs3.forEach((c, i) => console.log(`  a${i} = ${c.toFixed(10)}`));

  console.log("\n=== ВЫВОД ===");
  const minError = Math.min(error1, error2, error3);
  let bestDegree = 1;
  if (error2 === minError) bestDegree = 2;
  if (error3 === minError) bestDegree = 3;
  console.log(`Наименьшая сумма квадратов ошибок у многочлена ${bestDegree}-й степени: Φ = ${minError.toFixed(6)}`);
  console.log(`С увеличением степени многочлена точность аппроксимации улучшается.`);
}

run();

