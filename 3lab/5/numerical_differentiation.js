// Вариант 29
// y = (2sin(2x) - 3cos(3x)) / sqrt(2x + 3)
// Интервал: [-1.0; 1.0], h = 0.10

function f(x) {
  return (2 * Math.sin(2 * x) - 3 * Math.cos(3 * x)) / Math.sqrt(2 * x + 3);
}

function fPrimeAnalytical(x) {
  const numerator = 2 * Math.sin(2 * x) - 3 * Math.cos(3 * x);
  const denominator = Math.sqrt(2 * x + 3);
  const numeratorPrime = 4 * Math.cos(2 * x) + 9 * Math.sin(3 * x);
  const denominatorPrime = 1 / Math.sqrt(2 * x + 3);
  return (numeratorPrime * denominator - numerator * denominatorPrime) / (denominator * denominator);
}

function fDoublePrimeAnalytical(x) {
  const h = 1e-7;
  return (fPrimeAnalytical(x + h) - fPrimeAnalytical(x - h)) / (2 * h);
}

function firstDerivativeForward2(f, x, h) {
  return (f(x + h) - f(x)) / h;
}

function firstDerivativeBackward2(f, x, h) {
  return (f(x) - f(x - h)) / h;
}

function firstDerivativeCentral2(f, x, h) {
  return (f(x + h) - f(x - h)) / (2 * h);
}

function firstDerivativeForward3(f, x, h) {
  return (-3 * f(x) + 4 * f(x + h) - f(x + 2 * h)) / (2 * h);
}

function firstDerivativeBackward3(f, x, h) {
  return (3 * f(x) - 4 * f(x - h) + f(x - 2 * h)) / (2 * h);
}

function firstDerivativeCentral4(f, x, h) {
  return (-2 * f(x - h) - 3 * f(x) + 6 * f(x + h) - f(x + 2 * h)) / (6 * h);
}

function secondDerivativeCentral3(f, x, h) {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}

function secondDerivativeForward3(f, x, h) {
  return (f(x) - 2 * f(x + h) + f(x + 2 * h)) / (h * h);
}

function secondDerivativeBackward3(f, x, h) {
  return (f(x - 2 * h) - 2 * f(x - h) + f(x)) / (h * h);
}

function secondDerivativeCentral5(f, x, h) {
  return (-f(x - 2 * h) + 16 * f(x - h) - 30 * f(x) + 16 * f(x + h) - f(x + 2 * h)) / (12 * h * h);
}

function rungeRombergFirstDerivative(f, x, h, k = 2, p = 2) {
  const phi_h = firstDerivativeCentral2(f, x, h);
  const phi_kh = firstDerivativeCentral2(f, x, k * h);
  return phi_h + (phi_h - phi_kh) / (Math.pow(k, p) - 1);
}

function rungeRombergSecondDerivative(f, x, h, k = 2, p = 2) {
  const phi_h = secondDerivativeCentral3(f, x, h);
  const phi_kh = secondDerivativeCentral3(f, x, k * h);
  return phi_h + (phi_h - phi_kh) / (Math.pow(k, p) - 1);
}

function computeAllDerivatives(x, h) {
  const analytical1st = fPrimeAnalytical(x);
  const analytical2nd = fDoublePrimeAnalytical(x);
  
  const results = {
    x: x,
    h: h,
    firstDerivative: {
      analytical: analytical1st,
      methods: []
    },
    secondDerivative: {
      analytical: analytical2nd,
      methods: []
    }
  };
  
  const canUseForward2 = (x + h <= 1.0);
  const canUseBackward2 = (x - h >= -1.0);
  const canUseCentral2 = canUseForward2 && canUseBackward2;
  const canUseForward3 = (x + 2 * h <= 1.0);
  const canUseBackward3 = (x - 2 * h >= -1.0);
  const canUseCentral4 = canUseForward3 && canUseBackward2;
  const canUseCentral5 = canUseForward3 && canUseBackward3;
  
  if (canUseForward2) {
    const value = firstDerivativeForward2(f, x, h);
    results.firstDerivative.methods.push({
      name: "Правая разность (2 точки)",
      value: value,
      error: Math.abs(value - analytical1st)
    });
  }
  
  if (canUseBackward2) {
    const value = firstDerivativeBackward2(f, x, h);
    results.firstDerivative.methods.push({
      name: "Левая разность (2 точки)",
      value: value,
      error: Math.abs(value - analytical1st)
    });
  }
  
  if (canUseCentral2) {
    const value = firstDerivativeCentral2(f, x, h);
    results.firstDerivative.methods.push({
      name: "Центральная разность (2 точки)",
      value: value,
      error: Math.abs(value - analytical1st)
    });
  }
  
  if (canUseForward3) {
    const value = firstDerivativeForward3(f, x, h);
    results.firstDerivative.methods.push({
      name: "Правая схема (3 точки)",
      value: value,
      error: Math.abs(value - analytical1st)
    });
  }
  
  if (canUseBackward3) {
    const value = firstDerivativeBackward3(f, x, h);
    results.firstDerivative.methods.push({
      name: "Левая схема (3 точки)",
      value: value,
      error: Math.abs(value - analytical1st)
    });
  }
  
  if (canUseCentral4) {
    const value = firstDerivativeCentral4(f, x, h);
    results.firstDerivative.methods.push({
      name: "Центральная схема (4 точки)",
      value: value,
      error: Math.abs(value - analytical1st)
    });
  }
  
  if (canUseCentral2) {
    const value = secondDerivativeCentral3(f, x, h);
    results.secondDerivative.methods.push({
      name: "Центральная разность (3 точки)",
      value: value,
      error: Math.abs(value - analytical2nd)
    });
  }
  
  if (canUseForward3) {
    const value = secondDerivativeForward3(f, x, h);
    results.secondDerivative.methods.push({
      name: "Правая схема (3 точки)",
      value: value,
      error: Math.abs(value - analytical2nd)
    });
  }
  
  if (canUseBackward3) {
    const value = secondDerivativeBackward3(f, x, h);
    results.secondDerivative.methods.push({
      name: "Левая схема (3 точки)",
      value: value,
      error: Math.abs(value - analytical2nd)
    });
  }
  
  if (canUseCentral5) {
    const value = secondDerivativeCentral5(f, x, h);
    results.secondDerivative.methods.push({
      name: "Центральная схема (5 точек)",
      value: value,
      error: Math.abs(value - analytical2nd)
    });
  }
  
  return results;
}

function computeOnInterval(a, b, h) {
  const results = [];
  let x = a;
  
  while (x <= b + 1e-9) {
    results.push(computeAllDerivatives(x, h));
    x += h;
  }
  
  return results;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    f,
    fPrimeAnalytical,
    fDoublePrimeAnalytical,
    firstDerivativeForward2,
    firstDerivativeBackward2,
    firstDerivativeCentral2,
    firstDerivativeForward3,
    firstDerivativeBackward3,
    firstDerivativeCentral4,
    secondDerivativeCentral3,
    secondDerivativeForward3,
    secondDerivativeBackward3,
    secondDerivativeCentral5,
    rungeRombergFirstDerivative,
    rungeRombergSecondDerivative,
    computeAllDerivatives,
    computeOnInterval
  };
}

