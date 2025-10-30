// Основной скрипт для запуска расчетов

// Импортируем функции из numerical_differentiation.js
const {
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
} = require('./numerical_differentiation.js');

const a = -1.0;
const b = 1.0;
const h = 0.10;
const h_half = h / 2;

console.log("=== ЧИСЛЕННОЕ ДИФФЕРЕНЦИРОВАНИЕ ===");
console.log("Вариант 29");
console.log("Функция: y = (2sin(2x) - 3cos(3x)) / sqrt(2x + 3)");
console.log(`Интервал: [${a}, ${b}]`);
console.log(`Шаг h = ${h}`);
console.log(`Шаг h/2 = ${h_half}`);
console.log("");

// Вычисление для h
console.log("\n========== РЕЗУЛЬТАТЫ ДЛЯ ШАГА h = " + h + " ==========\n");
const resultsH = computeOnInterval(a, b, h);

// Выводим таблицу для первой производной с шагом h
console.log("=== ПЕРВАЯ ПРОИЗВОДНАЯ (h = " + h + ") ===\n");
const samplePointH = resultsH[Math.floor(resultsH.length / 2)];
console.log(`Пример в точке x = ${samplePointH.x.toFixed(2)}:`);
console.log(`Аналитическое значение: ${samplePointH.firstDerivative.analytical.toFixed(8)}\n`);

console.log("Метод".padEnd(35) + " | " + "Значение".padEnd(12) + " | " + "Погрешность");
console.log("-".repeat(70));
samplePointH.firstDerivative.methods.forEach(method => {
  console.log(
    method.name.padEnd(35) + " | " + 
    method.value.toFixed(8).padStart(12) + " | " + 
    method.error.toExponential(4)
  );
});

// Выводим таблицу для второй производной с шагом h
console.log("\n=== ВТОРАЯ ПРОИЗВОДНАЯ (h = " + h + ") ===\n");
console.log(`Пример в точке x = ${samplePointH.x.toFixed(2)}:`);
console.log(`Аналитическое значение: ${samplePointH.secondDerivative.analytical.toFixed(8)}\n`);

console.log("Метод".padEnd(35) + " | " + "Значение".padEnd(12) + " | " + "Погрешность");
console.log("-".repeat(70));
samplePointH.secondDerivative.methods.forEach(method => {
  console.log(
    method.name.padEnd(35) + " | " + 
    method.value.toFixed(8).padStart(12) + " | " + 
    method.error.toExponential(4)
  );
});

// Вычисление для h/2
console.log("\n\n========== РЕЗУЛЬТАТЫ ДЛЯ ШАГА h/2 = " + h_half + " ==========\n");
const resultsHHalf = computeOnInterval(a, b, h_half);

// Выводим таблицу для первой производной с шагом h/2
console.log("=== ПЕРВАЯ ПРОИЗВОДНАЯ (h/2 = " + h_half + ") ===\n");
const samplePointHHalf = resultsHHalf[Math.floor(resultsHHalf.length / 2)];
console.log(`Пример в точке x = ${samplePointHHalf.x.toFixed(2)}:`);
console.log(`Аналитическое значение: ${samplePointHHalf.firstDerivative.analytical.toFixed(8)}\n`);

console.log("Метод".padEnd(35) + " | " + "Значение".padEnd(12) + " | " + "Погрешность");
console.log("-".repeat(70));
samplePointHHalf.firstDerivative.methods.forEach(method => {
  console.log(
    method.name.padEnd(35) + " | " + 
    method.value.toFixed(8).padStart(12) + " | " + 
    method.error.toExponential(4)
  );
});

// Выводим таблицу для второй производной с шагом h/2
console.log("\n=== ВТОРАЯ ПРОИЗВОДНАЯ (h/2 = " + h_half + ") ===\n");
console.log(`Пример в точке x = ${samplePointHHalf.x.toFixed(2)}:`);
console.log(`Аналитическое значение: ${samplePointHHalf.secondDerivative.analytical.toFixed(8)}\n`);

console.log("Метод".padEnd(35) + " | " + "Значение".padEnd(12) + " | " + "Погрешность");
console.log("-".repeat(70));
samplePointHHalf.secondDerivative.methods.forEach(method => {
  console.log(
    method.name.padEnd(35) + " | " + 
    method.value.toFixed(8).padStart(12) + " | " + 
    method.error.toExponential(4)
  );
});

// Сравнение средних погрешностей
console.log("\n\n=== СРАВНЕНИЕ СРЕДНИХ ПОГРЕШНОСТЕЙ ===\n");

function calculateAverageError(results, isFirstDerivative) {
  const errors = {};
  
  results.forEach(point => {
    const methods = isFirstDerivative ? point.firstDerivative.methods : point.secondDerivative.methods;
    methods.forEach(method => {
      if (!errors[method.name]) {
        errors[method.name] = [];
      }
      errors[method.name].push(method.error);
    });
  });
  
  const averages = {};
  for (const [name, errorArray] of Object.entries(errors)) {
    const sum = errorArray.reduce((acc, val) => acc + val, 0);
    averages[name] = sum / errorArray.length;
  }
  
  return averages;
}

const avgErrorsFirstH = calculateAverageError(resultsH, true);
const avgErrorsFirstHHalf = calculateAverageError(resultsHHalf, true);
const avgErrorsSecondH = calculateAverageError(resultsH, false);
const avgErrorsSecondHHalf = calculateAverageError(resultsHHalf, false);

console.log("ПЕРВАЯ ПРОИЗВОДНАЯ:");
console.log("\nМетод".padEnd(35) + " | " + "Средняя погр. (h)".padEnd(18) + " | " + "Средняя погр. (h/2)");
console.log("-".repeat(75));
for (const [name, errorH] of Object.entries(avgErrorsFirstH)) {
  const errorHHalf = avgErrorsFirstHHalf[name] || 0;
  console.log(
    name.padEnd(35) + " | " + 
    errorH.toExponential(4).padStart(18) + " | " + 
    errorHHalf.toExponential(4)
  );
}

console.log("\n\nВТОРАЯ ПРОИЗВОДНАЯ:");
console.log("\nМетод".padEnd(35) + " | " + "Средняя погр. (h)".padEnd(18) + " | " + "Средняя погр. (h/2)");
console.log("-".repeat(75));
for (const [name, errorH] of Object.entries(avgErrorsSecondH)) {
  const errorHHalf = avgErrorsSecondHHalf[name] || 0;
  console.log(
    name.padEnd(35) + " | " + 
    errorH.toExponential(4).padStart(18) + " | " + 
    errorHHalf.toExponential(4)
  );
}

console.log("\n\n=== ФОРМУЛА РУНГЕ-РОМБЕРГА ===\n");

// Применяем формулу Рунге-Ромберга для уточнения
const testPoint = 0.5;
console.log(`Тестовая точка x = ${testPoint}:`);

const analyticalFirst = fPrimeAnalytical(testPoint);
const analyticalSecond = fDoublePrimeAnalytical(testPoint);

const centralH = firstDerivativeCentral2(f, testPoint, h);
const centralHHalf = firstDerivativeCentral2(f, testPoint, h_half);
const rungeFirst = rungeRombergFirstDerivative(f, testPoint, h_half);

console.log("\nПервая производная:");
console.log(`  Аналитическая:                     ${analyticalFirst.toFixed(10)}`);
console.log(`  Центральная разность (h):          ${centralH.toFixed(10)}, погрешность: ${Math.abs(centralH - analyticalFirst).toExponential(4)}`);
console.log(`  Центральная разность (h/2):        ${centralHHalf.toFixed(10)}, погрешность: ${Math.abs(centralHHalf - analyticalFirst).toExponential(4)}`);
console.log(`  Рунге-Ромберг:                     ${rungeFirst.toFixed(10)}, погрешность: ${Math.abs(rungeFirst - analyticalFirst).toExponential(4)}`);

const secondCentralH = secondDerivativeCentral3(f, testPoint, h);
const secondCentralHHalf = secondDerivativeCentral3(f, testPoint, h_half);
const rungeSecond = rungeRombergSecondDerivative(f, testPoint, h_half);

console.log("\nВторая производная:");
console.log(`  Аналитическая:                     ${analyticalSecond.toFixed(10)}`);
console.log(`  Центральная разность (h):          ${secondCentralH.toFixed(10)}, погрешность: ${Math.abs(secondCentralH - analyticalSecond).toExponential(4)}`);
console.log(`  Центральная разность (h/2):        ${secondCentralHHalf.toFixed(10)}, погрешность: ${Math.abs(secondCentralHHalf - analyticalSecond).toExponential(4)}`);
console.log(`  Рунге-Ромберг:                     ${rungeSecond.toFixed(10)}, погрешность: ${Math.abs(rungeSecond - analyticalSecond).toExponential(4)}`);

console.log("\n\n=== ВЫВОДЫ ===\n");
console.log("1. С уменьшением шага с h до h/2 погрешность численного дифференцирования уменьшается.");
console.log("2. Схемы с большим числом точек (4-5 точек) дают более высокую точность.");
console.log("3. Центральные схемы обычно точнее односторонних (правых и левых).");
console.log("4. Формула Рунге-Ромберга позволяет дополнительно уточнить результат.");
console.log("5. Для второй производной погрешность выше, чем для первой, что типично для численного дифференцирования.");

// Сохраняем данные для графиков
if (typeof window !== 'undefined') {
  window.resultsH = resultsH;
  window.resultsHHalf = resultsHHalf;
}

