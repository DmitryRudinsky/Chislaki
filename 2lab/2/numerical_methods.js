// Численные методы для решения системы нелинейных уравнений
// Система: x₁² + x₂² - 2cos(x₁) = 3
//          e^(x₁²-1) - x₂ = 3

// Система функций F(x) = 0
function F1(x1, x2) {
  return Math.pow(x1, 2) + Math.pow(x2, 2) - 2 * Math.cos(x1) - 3;
}

function F2(x1, x2) {
  return Math.exp(Math.pow(x1, 2) - 1) - x2 - 3;
}

// Частные производные для матрицы Якоби
function dF1_dx1(x1, x2) {
  return 2 * x1 + 2 * Math.sin(x1);
}

function dF1_dx2(x1, x2) {
  return 2 * x2;
}

function dF2_dx1(x1, x2) {
  return 2 * x1 * Math.exp(Math.pow(x1, 2) - 1);
}

function dF2_dx2(x1, x2) {
  return -1;
}

// Матрица Якоби
function jacobianMatrix(x1, x2) {
  return [
    [dF1_dx1(x1, x2), dF1_dx2(x1, x2)],
    [dF2_dx1(x1, x2), dF2_dx2(x1, x2)]
  ];
}

// Определитель матрицы 2x2
function determinant2x2(matrix) {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}

// Обратная матрица 2x2
function inverse2x2(matrix) {
  const det = determinant2x2(matrix);
  if (Math.abs(det) < 1e-10) {
    return null; // Матрица вырожденная
  }
  
  return [
    [matrix[1][1] / det, -matrix[0][1] / det],
    [-matrix[1][0] / det, matrix[0][0] / det]
  ];
}

// Умножение матрицы на вектор
function multiplyMatrixVector(matrix, vector) {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1]
  ];
}

// Норма вектора
function vectorNorm(vector) {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
}

// 1. Метод Ньютона для системы нелинейных уравнений
// x^(k+1) = x^k - J^(-1)(x^k) · F(x^k)
// J — матрица Якоби (матрица частных производных)
// F(x) — вектор-функция системы
function newtonSystemMethod(x1_0, x2_0, epsilon, maxIter) {
  let iterations = 0;
  let x1 = x1_0;
  let x2 = x2_0;
  let convergenceCheck = "";
  let steps = [];
  let converged = false;
  
  while (iterations < maxIter) {
    const f1 = F1(x1, x2);
    const f2 = F2(x1, x2);
    const F_vector = [f1, f2];
    const F_norm = vectorNorm(F_vector);
    
    // Вычисляем матрицу Якоби
    const J = jacobianMatrix(x1, x2);
    const detJ = determinant2x2(J);
    
    // Проверяем, что матрица Якоби не вырожденная
    if (Math.abs(detJ) < 1e-10) {
      convergenceCheck = "❌ Матрица Якоби вырожденная - метод не сходится";
      break;
    }
    
    // Обращаем матрицу Якоби
    const J_inv = inverse2x2(J);
    if (!J_inv) {
      convergenceCheck = "❌ Не удается обратить матрицу Якоби";
      break;
    }
    
    // Вычисляем приращение: Δx = -J⁻¹ * F
    const delta = multiplyMatrixVector(J_inv, [-f1, -f2]);
    const x1_new = x1 + delta[0];
    const x2_new = x2 + delta[1];
    
    const error = vectorNorm(delta);
    
    steps.push({
      iteration: iterations + 1,
      x1: x1.toFixed(6),
      x2: x2.toFixed(6),
      f1: f1.toFixed(6),
      f2: f2.toFixed(6),
      detJ: detJ.toFixed(6),
      x1_new: x1_new.toFixed(6),
      x2_new: x2_new.toFixed(6),
      error: error.toFixed(6),
      F_norm: F_norm.toFixed(6)
    });
    
    if (error < epsilon) {
      convergenceCheck = "✅ Метод сходится - условие |Δx| < ε выполнено";
      x1 = x1_new;
      x2 = x2_new;
      converged = true;
      break;
    }
    
    x1 = x1_new;
    x2 = x2_new;
    iterations++;
  }
  
  if (iterations >= maxIter && convergenceCheck === "") {
    convergenceCheck = "⚠️ Достигнуто максимальное количество итераций";
  }
  
  return {
    x1: x1,
    x2: x2,
    iterations: iterations + 1,
    convergenceCheck: convergenceCheck,
    steps: steps,
    finalError: vectorNorm([F1(x1, x2), F2(x1, x2)]),
    converged: converged
  };
}

// 2. Метод простой итерации для системы (адаптирован из 1lab/4.js)
// x^(k+1) = x^k − ω·B·F(x^k)
function simpleIterationSystemMethod(x1_0, x2_0, epsilon, maxIter) {
  let iterations = 0;
  let x = [x1_0, x2_0];
  let maxError = Infinity;
  let convergenceCheck = "";
  let steps = [];
  
  
  // 1) Вычисляем и «замораживаем» обратную Якоби при старте: B ≈ J(x0)^{-1}
  const J0 = jacobianMatrix(x[0], x[1]);
  const B = inverse2x2(J0);
  if (!B) {
    convergenceCheck = "❌ J(x0) вырожденная — невозможно построить итератор";
    return {
      x1: x[0],
      x2: x[1],
      iterations: iterations,
      convergenceCheck: convergenceCheck,
      steps: steps,
      finalError: vectorNorm([F1(x[0], x[1]), F2(x[0], x[1])]),
      converged: false
    };
  }
  
  // Небольшая релаксация для устойчивости
  const omega = 0.3;
  
  // Умножение 2x2 на 2x2
  function multiply2x2(A, C) {
    return [
      [A[0][0]*C[0][0] + A[0][1]*C[1][0], A[0][0]*C[0][1] + A[0][1]*C[1][1]],
      [A[1][0]*C[0][0] + A[1][1]*C[1][0], A[1][0]*C[0][1] + A[1][1]*C[1][1]]
    ];
  }
  
  // Итерационный оператор Φ(x) = x - ω B F(x)
  function phiVec(xVec) {
    const Fv = [F1(xVec[0], xVec[1]), F2(xVec[0], xVec[1])];
    const B_F = multiplyMatrixVector(B, Fv);
    return [xVec[0] - omega * B_F[0], xVec[1] - omega * B_F[1]];
  }
  
  // Оценка sup-нормы ||Φ'(x)|| = ||I - ω B J(x)|| в окрестности x0
  function estimateSupNorm(centerX1, centerX2, radius = 0.2, samples = 5) {
    let supInfNorm = 0;
    for (let i = 0; i < samples; i++) {
      for (let j = 0; j < samples; j++) {
        const xi1 = centerX1 + (-radius + (2*radius)*i/(samples-1));
        const xi2 = centerX2 + (-radius + (2*radius)*j/(samples-1));
        const Jx = jacobianMatrix(xi1, xi2);
        const BJ = multiply2x2(B, Jx);
        const I_minus_omega_BJ = [
          [1 - omega * BJ[0][0], - omega * BJ[0][1]],
          [- omega * BJ[1][0], 1 - omega * BJ[1][1]]
        ];
        const row1 = Math.abs(I_minus_omega_BJ[0][0]) + Math.abs(I_minus_omega_BJ[0][1]);
        const row2 = Math.abs(I_minus_omega_BJ[1][0]) + Math.abs(I_minus_omega_BJ[1][1]);
        supInfNorm = Math.max(supInfNorm, row1, row2);
      }
    }
    return supInfNorm;
  }
  
  const supNorm = estimateSupNorm(x[0], x[1]);
  if (supNorm < 1) {
    convergenceCheck = `✅ sup||Φ'|| ≈ ${supNorm.toFixed(3)} < 1 — локальная сходимость гарантирована (ω = ${omega})`;
  } else {
    convergenceCheck = `⚠️ sup||Φ'|| ≈ ${supNorm.toFixed(3)} ≥ 1 — сходимость не гарантирована (ω = ${omega})`;
  }
  
  while (iterations < maxIter && maxError > epsilon) {
    const xNew = phiVec(x);
    
    // Погрешность по максимум-норме компонент
    const err0 = Math.abs(xNew[0] - x[0]);
    const err1 = Math.abs(xNew[1] - x[1]);
    maxError = Math.max(err0, err1);
    
    const F_norm = vectorNorm([F1(xNew[0], xNew[1]), F2(xNew[0], xNew[1])]);
    
    steps.push({
      iteration: iterations + 1,
      x1: x[0].toFixed(6),
      x2: x[1].toFixed(6),
      x1_new: xNew[0].toFixed(6),
      x2_new: xNew[1].toFixed(6),
      error: maxError.toFixed(6),
      F_norm: F_norm.toFixed(6)
    });
    
    if (isNaN(maxError) || !isFinite(maxError)) {
      break;
    }
    
    // Критерий останова по шагу и невязке
    if (maxError <= epsilon && F_norm <= epsilon) {
      x = xNew;
      iterations++;
      break;
    }
    
    x = xNew;
    iterations++;
  }
  
  const finalError = vectorNorm([F1(x[0], x[1]), F2(x[0], x[1])]);
  
  return {
    x1: x[0],
    x2: x[1],
    iterations: iterations,
    convergenceCheck: convergenceCheck,
    steps: steps,
    finalError: finalError,
    converged: maxError <= epsilon && finalError <= epsilon && !isNaN(maxError) && isFinite(maxError)
  };
}

// 3. Метод Зейделя (Gauss-Seidel) с замороженной обратной Якоби
// x₁^(k+1) = x₁^k - ω · (B[0][0]·F₁(x^k) + B[0][1]·F₂(x^k))
// x₂^(k+1) = x₂^k - ω · (B[1][0]·F₁(x₁^(k+1), x₂^k) + B[1][1]·F₂(x₁^(k+1), x₂^k))
function seidelSystemMethod(x1_0, x2_0, epsilon, maxIter) {
  let iterations = 0;
  let x = [x1_0, x2_0];
  let maxError = Infinity;
  let convergenceCheck = "";
  let steps = [];
  
  // 1) Вычисляем и замораживаем обратную Якоби при старте
  const J0 = jacobianMatrix(x[0], x[1]);
  const B = inverse2x2(J0);
  if (!B) {
    convergenceCheck = "❌ J(x0) вырожденная — невозможно построить итератор";
    return {
      x1: x[0],
      x2: x[1],
      iterations: iterations,
      convergenceCheck: convergenceCheck,
      steps: steps,
      finalError: vectorNorm([F1(x[0], x[1]), F2(x[0], x[1])]),
      converged: false
    };
  }
  
  // Параметр релаксации (можно подстроить)
  const omega = 0.4;
  
  // Умножение 2x2 на 2x2
  function multiply2x2(A, C) {
    return [
      [A[0][0]*C[0][0] + A[0][1]*C[1][0], A[0][0]*C[0][1] + A[0][1]*C[1][1]],
      [A[1][0]*C[0][0] + A[1][1]*C[1][0], A[1][0]*C[0][1] + A[1][1]*C[1][1]]
    ];
  }
  
  // Оператор Зейделя: обновляем компоненты последовательно с использованием уже обновлённых значений
  // x₁^(k+1) = x₁^k - ω * (B[0][0]*F₁ + B[0][1]*F₂)
  // x₂^(k+1) = x₂^k - ω * (B[1][0]*F₁^new + B[1][1]*F₂^new)  <- используем новый x₁
  function seidelStep(xVec) {
    // Шаг 1: обновляем x₁
    let Fv = [F1(xVec[0], xVec[1]), F2(xVec[0], xVec[1])];
    let B_F = multiplyMatrixVector(B, Fv);
    const x1_new = xVec[0] - omega * B_F[0];
    
    // Шаг 2: обновляем x₂, используя УЖЕ обновлённый x₁
    Fv = [F1(x1_new, xVec[1]), F2(x1_new, xVec[1])];
    B_F = multiplyMatrixVector(B, Fv);
    const x2_new = xVec[1] - omega * B_F[1];
    
    return [x1_new, x2_new];
  }
  
  // Оценка sup-нормы оператора Зейделя в окрестности старта
  // Упрощённая оценка через ||I - ω·B·J(x)||
  function estimateSupNorm(centerX1, centerX2, radius = 0.2, samples = 5) {
    let supInfNorm = 0;
    for (let i = 0; i < samples; i++) {
      for (let j = 0; j < samples; j++) {
        const xi1 = centerX1 + (-radius + (2*radius)*i/(samples-1));
        const xi2 = centerX2 + (-radius + (2*radius)*j/(samples-1));
        const Jx = jacobianMatrix(xi1, xi2);
        const BJ = multiply2x2(B, Jx);
        // Для Зейделя оператор сложнее, но аппроксимируем через ||I - ω·B·J||
        const I_minus_omega_BJ = [
          [1 - omega * BJ[0][0], - omega * BJ[0][1]],
          [- omega * BJ[1][0], 1 - omega * BJ[1][1]]
        ];
        const row1 = Math.abs(I_minus_omega_BJ[0][0]) + Math.abs(I_minus_omega_BJ[0][1]);
        const row2 = Math.abs(I_minus_omega_BJ[1][0]) + Math.abs(I_minus_omega_BJ[1][1]);
        supInfNorm = Math.max(supInfNorm, row1, row2);
      }
    }
    return supInfNorm;
  }
  
  const supNorm = estimateSupNorm(x[0], x[1]);
  if (supNorm < 1) {
    convergenceCheck = `✅ sup||Φ'|| ≈ ${supNorm.toFixed(3)} < 1 — локальная сходимость (Зейдель, ω = ${omega})`;
  } else {
    convergenceCheck = `⚠️ sup||Φ'|| ≈ ${supNorm.toFixed(3)} ≥ 1 — сходимость не гарантирована (Зейдель, ω = ${omega})`;
  }
  
  while (iterations < maxIter && maxError > epsilon) {
    const xNew = seidelStep(x);
    
    // Погрешность по максимум-норме
    const err0 = Math.abs(xNew[0] - x[0]);
    const err1 = Math.abs(xNew[1] - x[1]);
    maxError = Math.max(err0, err1);
    
    const F_norm = vectorNorm([F1(xNew[0], xNew[1]), F2(xNew[0], xNew[1])]);
    
    steps.push({
      iteration: iterations + 1,
      x1_old: x[0].toFixed(6),
      x2_old: x[1].toFixed(6),
      x1_new: xNew[0].toFixed(6),
      x2_new: xNew[1].toFixed(6),
      error: maxError.toFixed(6),
      F_norm: F_norm.toFixed(6)
    });
    
    if (isNaN(maxError) || !isFinite(maxError)) {
      break;
    }
    
    // Двойной критерий останова
    if (maxError <= epsilon && F_norm <= epsilon) {
      x = xNew;
      iterations++;
      break;
    }
    
    x = xNew;
    iterations++;
  }
  
  const finalError = vectorNorm([F1(x[0], x[1]), F2(x[0], x[1])]);
  
  return {
    x1: x[0],
    x2: x[1],
    iterations: iterations,
    convergenceCheck: convergenceCheck,
    steps: steps,
    finalError: finalError,
    converged: maxError <= epsilon && finalError <= epsilon && !isNaN(maxError) && isFinite(maxError)
  };
}

// Эквивалентные функции для графического анализа
function equivalentFunction1(x1) {
  // Из первого уравнения: x₂² = 3 - x₁² + 2cos(x₁)
  const value = 3 - Math.pow(x1, 2) + 2 * Math.cos(x1);
  return value >= 0 ? Math.sqrt(value) : null;
}

function equivalentFunction1Negative(x1) {
  const value = 3 - Math.pow(x1, 2) + 2 * Math.cos(x1);
  return value >= 0 ? -Math.sqrt(value) : null;
}

function equivalentFunction2(x1) {
  // Из второго уравнения: x₂ = e^(x₁²-1) - 3
  return Math.exp(Math.pow(x1, 2) - 1) - 3;
}

// Альтернативный метод простой итерации с другим преобразованием
function simpleIterationAlternative(x1_0, x2_0, epsilon, maxIter) {
  let iterations = 0;
  let x1 = x1_0;
  let x2 = x2_0;
  let convergenceCheck = "";
  let steps = [];
  
  // Альтернативное преобразование системы:
  // Из первого уравнения выражаем x₁ через итерационную схему:
  // x₁² = 3 - x₂² + 2cos(x₁) => x₁ = ±√(3 - x₂² + 2cos(x₁))
  // Из второго: x₂ = e^(x₁²-1) - 3
  
  // Используем релаксацию для улучшения сходимости
  const omega = 0.2; // Уменьшенный параметр релаксации для лучшей сходимости
  
  function phi1_relaxed(x1, x2) {
    const value = 3 - x2*x2 + 2*Math.cos(x1);
    if (value <= 0) return x1;
    const sqrt_val = Math.sqrt(value);
    const new_x1 = x1 >= 0 ? sqrt_val : -sqrt_val;
    return omega * new_x1 + (1 - omega) * x1; // Релаксация
  }
  
  function phi2_relaxed(x1, x2) {
    const new_x2 = Math.exp(x1*x1 - 1) - 3;
    return omega * new_x2 + (1 - omega) * x2; // Релаксация
  }
  
  convergenceCheck = `✅ Используется релаксация с параметром ω = ${omega}`;
  
  while (iterations < maxIter) {
    const x1_new = phi1_relaxed(x1, x2);
    const x2_new = phi2_relaxed(x1, x2);
    
    const error = vectorNorm([x1_new - x1, x2_new - x2]);
    const F_norm = vectorNorm([F1(x1, x2), F2(x1, x2)]);
    
    steps.push({
      iteration: iterations + 1,
      x1: x1.toFixed(6),
      x2: x2.toFixed(6),
      x1_new: x1_new.toFixed(6),
      x2_new: x2_new.toFixed(6),
      error: error.toFixed(6),
      F_norm: F_norm.toFixed(6)
    });
    
    // Проверка на расхождение
    if (isNaN(error) || !isFinite(error) || error > 100) {
      return {
        x1: x1,
        x2: x2,
        iterations: iterations,
        convergenceCheck: convergenceCheck + "\n❌ Метод расходится",
        steps: steps,
        finalError: vectorNorm([F1(x1, x2), F2(x1, x2)]),
        converged: false
      };
    }
    
    // Проверяем как изменение переменных, так и невязку системы
    if (error < epsilon && F_norm < epsilon) {
      return {
        x1: x1_new,
        x2: x2_new,
        iterations: iterations + 1,
        convergenceCheck: convergenceCheck + "\n✅ Достигнута точность по обоим критериям",
        steps: steps,
        finalError: vectorNorm([F1(x1_new, x2_new), F2(x1_new, x2_new)]),
        converged: true
      };
    }
    
    x1 = x1_new;
    x2 = x2_new;
    iterations++;
  }
  
  return {
    x1: x1,
    x2: x2,
    iterations: iterations,
    convergenceCheck: convergenceCheck + "\n⚠️ Достигнуто максимальное количество итераций",
    steps: steps,
    finalError: vectorNorm([F1(x1, x2), F2(x1, x2)]),
    converged: false
  };
}
