class ThomasMethod {
    constructor() {
        this.epsilon = 1e-10;
    }
    solveSystem(A, b) {
        const n = A.length;
        if (n !== b.length) {
            throw new Error("Размеры матрицы и вектора не совпадают");
        }
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (Math.abs(i - j) > 1 && Math.abs(A[i][j]) > this.epsilon) {
                    console.log(`⚠️  Матрица не является трехдиагональной: элемент A[${i}][${j}] = ${A[i][j]}`);
                    return null;
                }
            }
        }
        
        const a = new Array(n).fill(0); 
        const b_diag = new Array(n).fill(0);
        const c = new Array(n).fill(0);
        
        for (let i = 0; i < n; i++) {
            b_diag[i] = A[i][i];
            if (i > 0) a[i] = A[i][i-1];
            if (i < n-1) c[i] = A[i][i+1];
        }
        
        console.log("Диагонали трехдиагональной матрицы:");
        console.log(`a (нижняя): [${a.map(x => x.toFixed(4)).join(', ')}]`);
        console.log(`b (главная): [${b_diag.map(x => x.toFixed(4)).join(', ')}]`);
        console.log(`c (верхняя): [${c.map(x => x.toFixed(4)).join(', ')}]`);
        
        // ═══════════════════════════════════════════════════════════════════════
        // ПРЯМОЙ ХОД ПРОГОНКИ: вычисление коэффициентов αᵢ и βᵢ
        // ═══════════════════════════════════════════════════════════════════════
        // Цель: привести каждое уравнение к виду xᵢ = αᵢ·xᵢ₊₁ + βᵢ
        
        const alpha = new Array(n).fill(0);  // Прогоночные коэффициенты αᵢ
        const beta = new Array(n).fill(0);   // Прогоночные коэффициенты βᵢ
        
        // Начальные значения для i = 0:
        // Из уравнения: b₀x₀ + c₀x₁ = d₀
        // Выражаем: x₀ = (-c₀/b₀)x₁ + (d₀/b₀) = α₀x₁ + β₀
        alpha[0] = -c[0] / b_diag[0];        // α₀ = -c₀/b₀
        beta[0] = b[0] / b_diag[0];          // β₀ = d₀/b₀
        
        console.log(`\nПрямой ход прогонки:`);
        console.log(`α[0] = -c[0]/b[0] = -${c[0]}/${b_diag[0]} = ${alpha[0].toFixed(6)}`);
        console.log(`β[0] = d[0]/b[0] = ${b[0]}/${b_diag[0]} = ${beta[0].toFixed(6)}`);
        
        // Рекуррентные формулы для i = 1, 2, ..., n-1:
        for (let i = 1; i < n; i++) {
            // Знаменатель: bᵢ + aᵢ·αᵢ₋₁
            // Получается из подстановки xᵢ₋₁ = αᵢ₋₁·xᵢ + βᵢ₋₁ в уравнение i
            const denom = b_diag[i] + a[i] * alpha[i-1];
            
            // Проверка на вырожденность
            if (Math.abs(denom) < this.epsilon) {
                console.log(`Ошибка: знаменатель на шаге ${i} равен нулю`);
                return null;
            }
            
            // Рекуррентные формулы прогонки:
            // αᵢ = -cᵢ / (bᵢ + aᵢ·αᵢ₋₁)
            // βᵢ = (dᵢ - aᵢ·βᵢ₋₁) / (bᵢ + aᵢ·αᵢ₋₁)
            alpha[i] = -c[i] / denom;
            beta[i] = (b[i] - a[i] * beta[i-1]) / denom;
            
            console.log(`α[${i}] = -c[${i}]/(b[${i}] + a[${i}]*α[${i-1}]) = -${c[i]}/(${b_diag[i]} + ${a[i]}*${alpha[i-1].toFixed(4)}) = ${alpha[i].toFixed(6)}`);
            console.log(`β[${i}] = (d[${i}] - a[${i}]*β[${i-1}])/(b[${i}] + a[${i}]*α[${i-1}]) = (${b[i]} - ${a[i]}*${beta[i-1].toFixed(4)})/${denom.toFixed(4)} = ${beta[i].toFixed(6)}`);
        }
        
        // ═══════════════════════════════════════════════════════════════════════
        // ОБРАТНЫЙ ХОД ПРОГОНКИ: вычисление неизвестных xᵢ
        // ═══════════════════════════════════════════════════════════════════════
        // Используем соотношение xᵢ = αᵢ·xᵢ₊₁ + βᵢ для нахождения всех xᵢ
        
        const x = new Array(n).fill(0);
        
        // Граничное условие: в последнем уравнении нет xₙ
        // Поэтому: xₙ₋₁ = αₙ₋₁·0 + βₙ₋₁ = βₙ₋₁
        x[n-1] = beta[n-1];
        
        console.log(`\nОбратный ход прогонки:`);
        console.log(`x[${n-1}] = β[${n-1}] = ${x[n-1].toFixed(6)}`);
        
        // Обратная подстановка по формуле: xᵢ = αᵢ·xᵢ₊₁ + βᵢ
        // для i = n-2, n-3, ..., 1, 0
        for (let i = n-2; i >= 0; i--) {
            x[i] = alpha[i] * x[i+1] + beta[i];  // xᵢ = αᵢ·xᵢ₊₁ + βᵢ
            console.log(`x[${i}] = α[${i}]*x[${i+1}] + β[${i}] = ${alpha[i].toFixed(4)}*${x[i+1].toFixed(4)} + ${beta[i].toFixed(4)} = ${x[i].toFixed(6)}`);
        }

        return x;
    }
    
    determinant(A) {
        const n = A.length;
        if (A.some(row => row.length !== n)) {
            throw new Error("Матрица должна быть квадратной");
        }
        
        const matrix = A.map(row => [...row]);
        let det = 1.0;
        let signChanges = 0;
        
        for (let i = 0; i < n; i++) {
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
                    maxRow = k;
                }
            }
            
            if (maxRow !== i) {
                [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
                signChanges++;
            }
            
            if (Math.abs(matrix[i][i]) < this.epsilon) {
                return 0.0;
            }
            
            det *= matrix[i][i];
            
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(matrix[k][i]) > this.epsilon) {
                    const factor = matrix[k][i] / matrix[i][i];
                    for (let j = i; j < n; j++) {
                        matrix[k][j] -= factor * matrix[i][j];
                    }
                }
            }
        }
        
        if (signChanges % 2 === 1) {
            det = -det;
        }
        
        return det;
    }
    
    printMatrix(matrix, title = "Матрица") {
        console.log(`\n${title}:`);
        for (const row of matrix) {
            console.log("  [" + row.map(x => x.toFixed(4).padStart(8)).join("  ") + "]");
        }
    }
    
    printVector(vector, title = "Вектор") {
        console.log(`\n${title}:`);
        console.log("  [" + vector.map(x => x.toFixed(4).padStart(8)).join("  ") + "]");
    }
}

function solveSystemWithThomas() {
    const thomas = new ThomasMethod();
    
    console.log("=".repeat(60));
    console.log("РЕШЕНИЕ СИСТЕМЫ ЛИНЕЙНЫХ УРАВНЕНИЙ МЕТОДОМ ПРОГОНКИ");
    console.log("=".repeat(60));
    
    const A = [
        [6, -5, 0, 0, 0, 0, 0, 0],
        [3, -5, -2, 0, 0, 0, 0, 0],
        [0, 2, 6, -1, 0, 0, 0, 0],
        [0, 0, -2, 5, -3, 0, 0, 0],
        [0, 0, 0, 3, -5, 2, 0, 0],
        [0, 0, 0, 0, -5, -9, 4, 0],
        [0, 0, 0, 0, 0, 4, -7, -3],
        [0, 0, 0, 0, 0, 0, 3, 4]
    ];
    
    const b = [56, 34, 1, 11, 7, 13, -20, 15];
    
    console.log("Система уравнений:");
    const equations = [
        "6x₁ - 5x₂ = 56",
        "3x₁ - 5x₂ - 2x₃ = 34",
        "2x₂ + 6x₃ - x₄ = 1",
        "-2x₃ + 5x₄ - 3x₅ = 11",
        "3x₄ - 5x₅ + 2x₆ = 7",
        "-5x₅ - 9x₆ + 4x₇ = 13",
        "4x₆ - 7x₇ - 3x₈ = -20",
        "3x₇ + 4x₈ = 15"
    ];
    
    equations.forEach((eq, i) => {
        console.log(`  ${i + 1}. ${eq}`);
    });
    
    thomas.printMatrix(A, "Матрица коэффициентов A");
    thomas.printVector(b, "Вектор правых частей b");
    
    console.log("\n" + "-".repeat(50));
    console.log("1. РЕШЕНИЕ СИСТЕМЫ МЕТОДОМ ПРОГОНКИ");
    console.log("-".repeat(50));
    
    const solution = thomas.solveSystem(A, b);
    if (solution) {
        thomas.printVector(solution, "Решение системы x");
        
        console.log("\nПроверка решения Ax = b:");
        for (let i = 0; i < A.length; i++) {
            const result = A[i].reduce((sum, coeff, j) => sum + coeff * solution[j], 0);
            const error = Math.abs(result - b[i]);
            console.log(`  Уравнение ${i + 1}: ${result.toFixed(6).padStart(10)} = ${b[i].toString().padStart(6)} (погрешность: ${error.toExponential(2)})`);
        }
        
        console.log("\nОтвет:");
        const variables = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅', 'x₆', 'x₇', 'x₈'];
        variables.forEach((variable, i) => {
            console.log(`  ${variable} = ${solution[i].toFixed(6).padStart(10)}`);
        });
    }
    
    console.log("\n" + "-".repeat(50));
    console.log("2. ВЫЧИСЛЕНИЕ ОПРЕДЕЛИТЕЛЯ МАТРИЦЫ");
    console.log("-".repeat(50));
    
    const det = thomas.determinant(A);
    console.log(`Определитель матрицы A: ${det.toFixed(6)}`);
    
    if (Math.abs(det) < thomas.epsilon) {
        console.log("⚠️  Матрица вырождена (det = 0)");
        console.log("   Система может быть несовместной или иметь бесконечно много решений");
    } else {
        console.log("✅ Матрица невырождена (det ≠ 0)");
        console.log("   Система имеет единственное решение");
    }
    
}

function main() {
    solveSystemWithThomas();
}

if (typeof require !== 'undefined' && require.main === module) {
    main();
}

if (typeof window !== 'undefined') {
    window.ThomasMethod = ThomasMethod;
    window.main = main;
    window.solveSystemWithThomas = solveSystemWithThomas;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThomasMethod, main, solveSystemWithThomas };
}
