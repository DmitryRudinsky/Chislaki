// Численные методы для решения нелинейного уравнения
// f(x) = x^4 - 5x^2 + 5sin(2x/3) + 1 = 0

// Основная функция
function f(x) {
  return Math.pow(x, 4) - 5 * Math.pow(x, 2) + 5 * Math.sin(2 * x / 3) + 1;
}

// Производная функции f'(x) = 4x^3 - 10x + (10/3)cos(2x/3)
function df(x) {
  return 4 * Math.pow(x, 3) - 10 * x + (10/3) * Math.cos(2 * x / 3);
}

// Вторая производная f''(x) = 12x^2 - 10 - (20/9)sin(2x/3)
function d2f(x) {
  return 12 * Math.pow(x, 2) - 10 - (20/9) * Math.sin(2 * x / 3);
}

// 1. Метод дихотомии (бисекции)
function bisectionMethod(a, b, epsilon, maxIter) {
  let iterations = 0;
  let convergenceCheck = "";
  
  // Проверка условия сходимости
  const fa = f(a);
  const fb = f(b);
  
  if (fa * fb >= 0) {
    convergenceCheck = "❌ f(a) * f(b) ≥ 0 - метод не применим";
    return { root: null, iterations: 0, convergenceCheck, steps: [] };
  }
  convergenceCheck = "✅ f(a) * f(b) < 0 - условие выполнено\n";
  convergenceCheck += `   f(${a.toFixed(2)}) = ${fa.toFixed(4)}, f(${b.toFixed(2)}) = ${fb.toFixed(4)}`;
  
  let steps = [];
  let c = (a + b) / 2;
  
  while (Math.abs(b - a) > 2 * epsilon && iterations < maxIter) {
    c = (a + b) / 2;
    const fc = f(c);
    
    steps.push({
      iteration: iterations + 1,
      a: a.toFixed(6),
      b: b.toFixed(6),
      c: c.toFixed(6),
      fc: fc.toFixed(6),
      error: Math.abs(b - a).toFixed(6)
    });
    
    if (Math.abs(fc) < epsilon) break;
    
    if (f(a) * fc < 0) {
      b = c;
    } else {
      a = c;
    }
    
    iterations++;
  }
  
  return {
    root: c,
    iterations: iterations,
    convergenceCheck: convergenceCheck,
    steps: steps,
    finalError: Math.abs(f(c))
  };
}

// 2. Метод Ньютона
function newtonMethod(a, b, epsilon, maxIter) {
  let iterations = 0;
  let convergenceCheck = "";
  let steps = [];
  
  // Проверка условий сходимости на отрезке [a, b]
  const fa = f(a);
  const fb = f(b);
  
  // 1. Проверка смены знака функции
  if (fa * fb >= 0) {
    convergenceCheck = "❌ f(a) * f(b) ≥ 0 - функция не меняет знак на отрезке";
    return { root: null, iterations: 0, convergenceCheck, steps: [] };
  }
  
  // 2. Проверка знакопостоянства производной (монотонность)
  const dfa = df(a);
  const dfb = df(b);
  let derivativeConstantSign = (dfa * dfb > 0);
  if (!derivativeConstantSign) {
    convergenceCheck += "⚠️ f'(a) * f'(b) ≤ 0 - производная меняет знак (немонотонность)\n";
  } else {
    convergenceCheck += "✅ f'(a) * f'(b) > 0 - производная сохраняет знак\n";
  }
  
  // 3. Проверка знакопостоянства второй производной (выпуклость/вогнутость)
  const d2fa = d2f(a);
  const d2fb = d2f(b);
  let secondDerivativeConstantSign = (d2fa * d2fb > 0);
  if (!secondDerivativeConstantSign) {
    convergenceCheck += "⚠️ f''(a) * f''(b) ≤ 0 - вторая производная меняет знак\n";
  } else {
    convergenceCheck += "✅ f''(a) * f''(b) > 0 - вторая производная сохраняет знак\n";
  }
  
  // 4. Выбор начальной точки: x0 должна удовлетворять f(x0) * f''(x0) > 0
  let x0;
  const conditionA = fa * d2fa;
  const conditionB = fb * d2fb;
  
  if (conditionA > 0 && conditionB > 0) {
    // Оба конца подходят, выбираем тот, где |f(x)| больше
    x0 = Math.abs(fa) > Math.abs(fb) ? a : b;
    convergenceCheck += `✅ Оба конца удовлетворяют f(x)*f''(x) > 0. Выбрана точка x0 = ${x0.toFixed(6)}\n`;
  } else if (conditionA > 0) {
    x0 = a;
    convergenceCheck += `✅ f(a)*f''(a) > 0. Выбрана начальная точка x0 = a = ${a.toFixed(6)}\n`;
  } else if (conditionB > 0) {
    x0 = b;
    convergenceCheck += `✅ f(b)*f''(b) > 0. Выбрана начальная точка x0 = b = ${b.toFixed(6)}\n`;
  } else {
    convergenceCheck += `⚠️ Ни один конец не удовлетворяет f(x)*f''(x) > 0. Используется x0 = ${((a+b)/2).toFixed(6)} (середина)\n`;
    x0 = (a + b) / 2;
  }
  
  let x = x0;
  
  while (iterations < maxIter) {
    const fx = f(x);
    const dfx = df(x);
    
    if (Math.abs(dfx) < 1e-10) {
      convergenceCheck += "❌ Производная близка к нулю - метод не сходится";
      break;
    }
    
    const xNew = x - fx / dfx;
    
    steps.push({
      iteration: iterations + 1,
      x: x.toFixed(6),
      fx: fx.toFixed(6),
      dfx: dfx.toFixed(6),
      xNew: xNew.toFixed(6),
      error: Math.abs(xNew - x).toFixed(6)
    });
    
    if (Math.abs(xNew - x) < epsilon) {
      x = xNew;
      break;
    }
    
    x = xNew;
    iterations++;
  }
  
  return {
    root: x,
    iterations: iterations + 1,
    convergenceCheck: convergenceCheck,
    steps: steps,
    finalError: Math.abs(f(x))
  };
}

// 3. Метод секущих
function secantMethod(x0, x1, epsilon, maxIter) {
  let iterations = 0;
  let steps = [];
  let convergenceCheck = "";
  
  // Проверка начальных условий
  const f0 = f(x0);
  const f1 = f(x1);
  
  convergenceCheck = `✅ Начальные точки: x₀ = ${x0.toFixed(4)}, x₁ = ${x1.toFixed(4)}\n`;
  convergenceCheck += `   f(x₀) = ${f0.toFixed(4)}, f(x₁) = ${f1.toFixed(4)}\n`;
  
  // Диагностика: предупреждение, если точки не ограничивают корень
  if (f0 * f1 >= 0) {
    convergenceCheck += "⚠️ f(x₀)·f(x₁) ≥ 0 — нет интервала изоляции; возможна несходимость\n";
  } else {
    convergenceCheck += "✅ f(x₀)·f(x₁) < 0 — корень изолирован на отрезке\n";
  }
  
  // Проверка расстояния между начальными точками
  if (Math.abs(x1 - x0) < epsilon) {
    convergenceCheck += "⚠️ Начальные точки слишком близки";
  }
  
  while (iterations < maxIter) {
    const fx0 = f(x0);
    const fx1 = f(x1);
    
    if (Math.abs(fx1 - fx0) < 1e-10) {
      convergenceCheck += "\n❌ f(x₁) - f(x₀) ≈ 0 - деление на ноль, метод не сходится";
      break;
    }
    
    const x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
    
    steps.push({
      iteration: iterations + 1,
      x0: x0.toFixed(6),
      x1: x1.toFixed(6),
      fx0: fx0.toFixed(6),
      fx1: fx1.toFixed(6),
      x2: x2.toFixed(6),
      error: Math.abs(x2 - x1).toFixed(6)
    });
    
    if (Math.abs(x2 - x1) < epsilon) {
      return {
        root: x2,
        iterations: iterations + 1,
        convergenceCheck: convergenceCheck,
        steps: steps,
        finalError: Math.abs(f(x2))
      };
    }
    
    x0 = x1;
    x1 = x2;
    iterations++;
  }
  
  return {
    root: x1,
    iterations: iterations,
    convergenceCheck: convergenceCheck,
    steps: steps,
    finalError: Math.abs(f(x1))
  };
}

// 4. Метод хорд
function chordMethod(a, b, epsilon, maxIter) {
  let iterations = 0;
  let convergenceCheck = "";
  let steps = [];
  
  // Проверка условий сходимости на отрезке [a, b]
  const fa = f(a);
  const fb = f(b);
  
  // 1. Проверка смены знака функции
  if (fa * fb >= 0) {
    convergenceCheck = "❌ f(a) * f(b) ≥ 0 - метод не применим";
    return { root: null, iterations: 0, convergenceCheck, steps: [] };
  }
  convergenceCheck = "✅ f(a) * f(b) < 0 - функция меняет знак\n";
  
  // 2. Проверка знакопостоянства производной (монотонность)
  const dfa = df(a);
  const dfb = df(b);
  if (dfa * dfb <= 0) {
    convergenceCheck += "⚠️ f'(a) * f'(b) ≤ 0 — производная меняет знак; возможна немонотонность\n";
  } else {
    convergenceCheck += "✅ f'(a) * f'(b) > 0 — производная сохраняет знак (монотонность)\n";
  }
  
  // 3. Проверка знакопостоянства второй производной (выпуклость/вогнутость)
  const d2fa = d2f(a);
  const d2fb = d2f(b);
  if (d2fa * d2fb <= 0) {
    convergenceCheck += "⚠️ f''(a) * f''(b) ≤ 0 — вторая производная меняет знак\n";
  } else {
    convergenceCheck += "✅ f''(a) * f''(b) > 0 — вторая производная сохраняет знак\n";
  }
  
  // 4. Определяем неподвижный конец (где f(x) * f''(x) > 0)
  let fixed, moving;
  const conditionA = fa * d2fa;
  const conditionB = fb * d2fb;
  
  if (conditionA > 0) {
    fixed = a;
    moving = b;
    convergenceCheck += `✅ Неподвижный конец: a (f(a)·f''(a) = ${conditionA.toFixed(2)} > 0)`;
  } else if (conditionB > 0) {
    fixed = b;
    moving = a;
    convergenceCheck += `✅ Неподвижный конец: b (f(b)·f''(b) = ${conditionB.toFixed(2)} > 0)`;
  } else {
    // Если ни один конец не подходит, выбираем произвольно
    fixed = a;
    moving = b;
    convergenceCheck += "⚠️ Ни один конец не удовлетворяет f(x)·f''(x) > 0; используется a как неподвижный";
  }
  
  while (iterations < maxIter) {
    const fFixed = f(fixed);
    const fMoving = f(moving);
    
    if (Math.abs(fMoving - fFixed) < 1e-10) {
      convergenceCheck += "\n❌ f(moving) - f(fixed) ≈ 0 - деление на ноль";
      break;
    }
    
    const x = moving - fMoving * (moving - fixed) / (fMoving - fFixed);
    
    steps.push({
      iteration: iterations + 1,
      fixed: fixed.toFixed(6),
      moving: moving.toFixed(6),
      x: x.toFixed(6),
      fx: f(x).toFixed(6),
      error: Math.abs(x - moving).toFixed(6)
    });
    
    if (Math.abs(x - moving) < epsilon) {
      return {
        root: x,
        iterations: iterations + 1,
        convergenceCheck: convergenceCheck,
        steps: steps,
        finalError: Math.abs(f(x))
      };
    }
    
    moving = x;
    iterations++;
  }
  
  return {
    root: moving,
    iterations: iterations,
    convergenceCheck: convergenceCheck,
    steps: steps,
    finalError: Math.abs(f(moving))
  };
}

// 5. Метод простой итерации
function simpleIterationMethod(a, b, epsilon, maxIter) {
  let iterations = 0;
  let steps = [];
  let convergenceCheck = "";
  
  // Проверка условий сходимости на отрезке [a, b]
  const fa = f(a);
  const fb = f(b);
  
  // 1. Проверка смены знака функции
  if (fa * fb >= 0) {
    convergenceCheck = "❌ f(a) * f(b) ≥ 0 - функция не меняет знак на отрезке";
    return { root: null, iterations: 0, convergenceCheck, steps: [] };
  }
  convergenceCheck += "✅ f(a) * f(b) < 0 - функция меняет знак\n";
  
  // Преобразуем уравнение к виду x = φ(x)
  // Из f(x) = x^4 - 5x^2 + 5sin(2x/3) + 1 = 0
  // Выберем φ(x) = x - λf(x), где λ подбираем для сходимости
  // Условие сходимости: |φ'(x)| = |1 - λf'(x)| < 1 на всём отрезке [a, b]
  
  const samples = 101;
  
  // Оценка min и max f'(x) на отрезке [a, b]
  function estimateMinMaxDf(left, right, n) {
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let i = 0; i < n; i++) {
      const t = left + ((right - left) * i) / (n - 1);
      const val = df(t);
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    }
    return { min: minVal, max: maxVal };
  }
  
  // Оценка max|φ'(x)| = max|1 - λ·f'(x)| на отрезке [a, b]
  function estimateMaxAbsDPhi(lambdaVal, left, right, n) {
    let maxVal = 0;
    for (let i = 0; i < n; i++) {
      const t = left + ((right - left) * i) / (n - 1);
      const val = Math.abs(1 - lambdaVal * df(t));
      if (val > maxVal) maxVal = val;
    }
    return maxVal;
  }
  
  // Находим диапазон производной на отрезке
  const dfRange = estimateMinMaxDf(a, b, samples);
  const m = dfRange.min;
  const M = dfRange.max;
  
  // Проверка знакопостоянства производной
  if (m * M <= 0) {
    convergenceCheck += "⚠️ f'(x) меняет знак на отрезке - функция немонотонна\n";
  } else {
    convergenceCheck += `✅ f'(x) сохраняет знак: f'∈[${m.toFixed(2)}, ${M.toFixed(2)}]\n`;
  }
  
  // Оптимальный выбор λ для минимизации max|φ'(x)|
  // Для |1 - λf'(x)| < 1 нужно: 0 < λf'(x) < 2
  // Если f'(x) ∈ [m, M] и m, M одного знака:
  // - оптимальное λ = 2/(m + M) минимизирует max(|1-λm|, |1-λM|)
  let lambda;
  
  if (m > 0 && M > 0) {
    // Производная положительна на всём отрезке
    lambda = 2 / (m + M);
    convergenceCheck += `   Оптимальное λ = 2/(m+M) = ${lambda.toFixed(4)}\n`;
  } else if (m < 0 && M < 0) {
    // Производная отрицательна на всём отрезке
    lambda = 2 / (m + M);
    convergenceCheck += `   Оптимальное λ = 2/(m+M) = ${lambda.toFixed(4)}\n`;
  } else {
    // Производная меняет знак - используем меньшее значение λ
    const absM = Math.max(Math.abs(m), Math.abs(M));
    lambda = 0.5 / absM;
    convergenceCheck += `   Используется λ = 0.5/max|f'| = ${lambda.toFixed(4)}\n`;
  }
  
  // Проверяем условие сжатия с выбранным λ
  let maxAbsDPhi = estimateMaxAbsDPhi(lambda, a, b, samples);
  
  // Если не удалось обеспечить сжатие, уменьшаем λ
  let backoffCount = 0;
  while (maxAbsDPhi >= 0.99 && backoffCount < 10) {
    lambda *= 0.8;
    maxAbsDPhi = estimateMaxAbsDPhi(lambda, a, b, samples);
    backoffCount++;
  }
  
  function phi(x) {
    return x - lambda * f(x);
  }
  
  // Производная φ'(x) = 1 - λf'(x)
  function dPhi(x) {
    return 1 - lambda * df(x);
  }
  
  // Проверка условия сходимости на концах отрезка
  const dPhiA = dPhi(a);
  const dPhiB = dPhi(b);
  
  if (maxAbsDPhi < 0.99) {
    convergenceCheck += `✅ Условие сжатия выполнено: max|φ'(x)|≈${maxAbsDPhi.toFixed(3)} < 1\n`;
    convergenceCheck += `   λ = ${lambda.toFixed(6)}, φ'(a)≈${dPhiA.toFixed(3)}, φ'(b)≈${dPhiB.toFixed(3)}`;
  } else {
    convergenceCheck += `⚠️ Не удалось обеспечить max|φ'(x)|<1\n`;
    convergenceCheck += `   max|φ'(x)|≈${maxAbsDPhi.toFixed(3)}, λ=${lambda.toFixed(6)}; возможна медленная сходимость`;
  }
  
  // Выбор начальной точки: используем середину отрезка
  let x = (a + b) / 2;
  
  while (iterations < maxIter) {
    const xNew = phi(x);
    
    // Проверка, что новое значение остаётся в разумных пределах
    if (Math.abs(xNew - x) > (b - a) * 100) {
      convergenceCheck += "\n❌ Метод расходится (итерация вышла за пределы)";
      break;
    }
    
    steps.push({
      iteration: iterations + 1,
      x: x.toFixed(6),
      phi_x: xNew.toFixed(6),
      error: Math.abs(xNew - x).toFixed(6),
      dPhi: dPhi(x).toFixed(6)
    });
    
    if (Math.abs(xNew - x) < epsilon) {
      return {
        root: xNew,
        iterations: iterations + 1,
        convergenceCheck: convergenceCheck,
        steps: steps,
        finalError: Math.abs(f(xNew))
      };
    }
    
    x = xNew;
    iterations++;
  }
  
  return {
    root: x,
    iterations: iterations,
    convergenceCheck: convergenceCheck,
    steps: steps,
    finalError: Math.abs(f(x))
  };
}
