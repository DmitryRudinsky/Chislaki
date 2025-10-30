// Поиск истинных корней системы методом Ньютона
function F1(x1, x2) {
  return Math.pow(x1, 2) + Math.pow(x2, 2) - 2 * Math.cos(x1) - 3;
}

function F2(x1, x2) {
  return Math.exp(Math.pow(x1, 2) - 1) - x2 - 3;
}

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

function jacobianMatrix(x1, x2) {
  return [
    [dF1_dx1(x1, x2), dF1_dx2(x1, x2)],
    [dF2_dx1(x1, x2), dF2_dx2(x1, x2)]
  ];
}

function determinant2x2(matrix) {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}

function inverse2x2(matrix) {
  const det = determinant2x2(matrix);
  if (Math.abs(det) < 1e-10) {
    return null;
  }
  return [
    [matrix[1][1] / det, -matrix[0][1] / det],
    [-matrix[1][0] / det, matrix[0][0] / det]
  ];
}

function multiplyMatrixVector(matrix, vector) {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1]
  ];
}

function vectorNorm(vector) {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
}

function newtonMethod(x1_0, x2_0, epsilon, maxIter) {
  let iterations = 0;
  let x1 = x1_0;
  let x2 = x2_0;
  
  console.log(`Начальное приближение: x₁ = ${x1}, x₂ = ${x2}`);
  
  while (iterations < maxIter) {
    const f1 = F1(x1, x2);
    const f2 = F2(x1, x2);
    const F_vector = [f1, f2];
    const F_norm = vectorNorm(F_vector);
    
    console.log(`Итерация ${iterations + 1}: x₁ = ${x1.toFixed(6)}, x₂ = ${x2.toFixed(6)}, ||F|| = ${F_norm.toFixed(8)}`);
    
    if (F_norm < epsilon) {
      console.log(`✅ Сходимость достигнута за ${iterations + 1} итераций`);
      return { x1, x2, iterations: iterations + 1, finalError: F_norm, converged: true };
    }
    
    const J = jacobianMatrix(x1, x2);
    const detJ = determinant2x2(J);
    
    if (Math.abs(detJ) < 1e-10) {
      console.log(`❌ Матрица Якоби вырожденная`);
      break;
    }
    
    const J_inv = inverse2x2(J);
    const delta = multiplyMatrixVector(J_inv, [-f1, -f2]);
    
    x1 += delta[0];
    x2 += delta[1];
    iterations++;
  }
  
  return { x1, x2, iterations, finalError: vectorNorm([F1(x1, x2), F2(x1, x2)]), converged: false };
}

console.log("=".repeat(60));
console.log("ПОИСК ИСТИННЫХ КОРНЕЙ МЕТОДОМ НЬЮТОНА");
console.log("=".repeat(60));

// Попробуем разные начальные приближения
const initialGuesses = [
  [-1.3, -1],     // Ваше начальное приближение
  [1.5, 2.5],     // Положительная область
  [-1.5, 2.5],    // Смешанные знаки
  [0, 0],         // Начало координат
  [-1.661510, 1.045025],  // Результат простой итерации
  [-0.513173, -2.521287]  // Результат Зейделя
];

const epsilon = 1e-6; // Более строгая точность
const maxIter = 100;

initialGuesses.forEach((guess, index) => {
  console.log(`\n--- Попытка ${index + 1}: начальное приближение [${guess[0]}, ${guess[1]}] ---`);
  const result = newtonMethod(guess[0], guess[1], epsilon, maxIter);
  
  if (result.converged) {
    console.log(`🎯 КОРЕНЬ НАЙДЕН: x₁ = ${result.x1.toFixed(8)}, x₂ = ${result.x2.toFixed(8)}`);
    console.log(`   Итераций: ${result.iterations}, Погрешность: ${result.finalError.toExponential(3)}`);
  } else {
    console.log(`❌ Не сошелся: итераций = ${result.iterations}, погрешность = ${result.finalError.toFixed(6)}`);
  }
});
