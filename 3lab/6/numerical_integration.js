function f(x) {
  return (Math.tan(x / 2) + Math.log(x + 1)) / (Math.pow(Math.cos(x - 1), 2) + 1);
}

function exactIntegral() {
  const h = 0.00001;
  return simpsonMethod(f, -0.5, 1.5, h);
}

function midpointMethod(func, a, b, h) {
  const n = Math.ceil((b - a) / h);
  h = (b - a) / n;
  let sum = 0;
  
  for (let i = 0; i < n; i++) {
    const x_mid = a + (i + 0.5) * h;
    sum += func(x_mid);
  }
  
  return sum * h;
}

function trapezoidMethod(func, a, b, h) {
  const n = Math.ceil((b - a) / h);
  h = (b - a) / n;
  let sum = (func(a) + func(b)) / 2;
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += func(x);
  }
  
  return sum * h;
}

function simpsonMethod(func, a, b, h) {
  let n = Math.ceil((b - a) / h);
  
  if (n % 2 !== 0) {
    n += 1;
  }
  
  h = (b - a) / n;
  let sum = func(a) + func(b);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    if (i % 2 === 0) {
      sum += 2 * func(x);
    } else {
      sum += 4 * func(x);
    }
  }
  
  return (sum * h) / 3;
}

function eulerMethod(func, a, b, h) {
  const eps = 1e-7;
  const f_prime_a = (func(a + eps) - func(a - eps)) / (2 * eps);
  const f_prime_b = (func(b + eps) - func(b - eps)) / (2 * eps);
  
  const trapezoid = trapezoidMethod(func, a, b, h);
  const correction = (h * h / 12) * (f_prime_a - f_prime_b);
  
  return trapezoid + correction;
}

function rungeRomberg(I_h, I_h2, k = 2, p) {
  return I_h2 + (I_h2 - I_h) / (Math.pow(k, p) - 1);
}

function computeAllMethods(a, b, h) {
  const midpoint = midpointMethod(f, a, b, h);
  const trapezoid = trapezoidMethod(f, a, b, h);
  const simpson = simpsonMethod(f, a, b, h);
  const euler = eulerMethod(f, a, b, h);
  
  return {
    h: h,
    midpoint: midpoint,
    trapezoid: trapezoid,
    simpson: simpson,
    euler: euler
  };
}

function fullAnalysis(a, b, h1) {
  const h2 = h1 / 2;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ЧИСЛЕННОЕ ИНТЕГРИРОВАНИЕ`);
  console.log(`Функция: f(x) = [tg(x/2) + ln(x+1)] / [cos²(x-1) + 1]`);
  console.log(`Интервал: [${a}, ${b}]`);
  console.log(`${'='.repeat(80)}\n`);
  
  const exact = exactIntegral();
  console.log(`Эталонное значение (Симпсон с h=0.00001): ${exact.toFixed(10)}\n`);
  
  const results_h1 = computeAllMethods(a, b, h1);
  console.log(`${'─'.repeat(80)}`);
  console.log(`РЕЗУЛЬТАТЫ С ШАГОМ h = ${h1}`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`Метод средних прямоугольников: ${results_h1.midpoint.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(results_h1.midpoint - exact).toExponential(6)}`);
  console.log(`\nМетод трапеций:                ${results_h1.trapezoid.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(results_h1.trapezoid - exact).toExponential(6)}`);
  console.log(`\nМетод Симпсона:                ${results_h1.simpson.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(results_h1.simpson - exact).toExponential(6)}`);
  console.log(`\nМетод Эйлера:                  ${results_h1.euler.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(results_h1.euler - exact).toExponential(6)}`);
  
  const results_h2 = computeAllMethods(a, b, h2);
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`РЕЗУЛЬТАТЫ С ШАГОМ h/2 = ${h2}`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`Метод средних прямоугольников: ${results_h2.midpoint.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(results_h2.midpoint - exact).toExponential(6)}`);
  console.log(`\nМетод трапеций:                ${results_h2.trapezoid.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(results_h2.trapezoid - exact).toExponential(6)}`);
  console.log(`\nМетод Симпсона:                ${results_h2.simpson.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(results_h2.simpson - exact).toExponential(6)}`);
  console.log(`\nМетод Эйлера:                  ${results_h2.euler.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(results_h2.euler - exact).toExponential(6)}`);
  
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`УТОЧНЕНИЕ ПО МЕТОДУ РУНГЕ-РОМБЕРГА`);
  console.log(`${'─'.repeat(80)}`);
  
  const midpoint_rr = rungeRomberg(results_h1.midpoint, results_h2.midpoint, 2, 2);
  console.log(`Средние прямоугольники (p=2): ${midpoint_rr.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(midpoint_rr - exact).toExponential(6)}`);
  console.log(`  Улучшение: ${(Math.abs(results_h2.midpoint - exact) / Math.abs(midpoint_rr - exact)).toFixed(2)}x`);
  
  const trapezoid_rr = rungeRomberg(results_h1.trapezoid, results_h2.trapezoid, 2, 2);
  console.log(`\nТрапеции (p=2):                ${trapezoid_rr.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(trapezoid_rr - exact).toExponential(6)}`);
  console.log(`  Улучшение: ${(Math.abs(results_h2.trapezoid - exact) / Math.abs(trapezoid_rr - exact)).toFixed(2)}x`);
  
  const simpson_rr = rungeRomberg(results_h1.simpson, results_h2.simpson, 2, 4);
  console.log(`\nСимпсон (p=4):                 ${simpson_rr.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(simpson_rr - exact).toExponential(6)}`);
  console.log(`  Улучшение: ${(Math.abs(results_h2.simpson - exact) / Math.abs(simpson_rr - exact)).toFixed(2)}x`);
  
  const euler_rr = rungeRomberg(results_h1.euler, results_h2.euler, 2, 2);
  console.log(`\nЭйлер (p=2):                   ${euler_rr.toFixed(10)}`);
  console.log(`  Погрешность: ${Math.abs(euler_rr - exact).toExponential(6)}`);
  console.log(`  Улучшение: ${(Math.abs(results_h2.euler - exact) / Math.abs(euler_rr - exact)).toFixed(2)}x`);
  
  console.log(`\n${'='.repeat(80)}\n`);
  
  return {
    exact: exact,
    h1: results_h1,
    h2: results_h2,
    rungeRomberg: {
      midpoint: midpoint_rr,
      trapezoid: trapezoid_rr,
      simpson: simpson_rr,
      euler: euler_rr
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  const a = -0.5;
  const b = 1.5;
  const h1 = 0.2;
  
  fullAnalysis(a, b, h1);
  
  module.exports = {
    f,
    midpointMethod,
    trapezoidMethod,
    simpsonMethod,
    eulerMethod,
    rungeRomberg,
    computeAllMethods,
    fullAnalysis,
    exactIntegral
  };
}

