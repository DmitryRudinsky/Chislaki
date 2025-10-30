class GaussMethod {
    constructor() {
        this.epsilon = 1e-10;
    }
    
    solveSystem(A, b) {
        const n = A.length;
        if (n !== b.length || A.some(row => row.length !== n)) {
            throw new Error("Некорректные размеры матрицы или вектора");
        }
        
        const augmented = A.map((row, i) => [...row, b[i]]);

        this.printMatrix(augmented, 'РАСШИРЕННАЯ МАТРИЦА');
        
        for (let i = 0; i < n; i++) {
            if (Math.abs(augmented[i][i]) < this.epsilon) {
                console.log("Матрица вырождена или система имеет бесконечно много решений");
                console.log(`Диагональный элемент [${i}][${i}] = ${augmented[i][i]} слишком мал`);
                return null;
            }
            
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmented[k][i]) > this.epsilon) {
                    const factor = augmented[k][i] / augmented[i][i];
                    console.log(`Строка ${k + 1}: вычитаем ${factor.toFixed(4)} × строка ${i + 1}`);
                    
                    for (let j = i; j < n + 1; j++) {
                        augmented[k][j] -= factor * augmented[i][j];
                    }
                }
            }
            
            console.log(`После обработки столбца ${i + 1}:`);
            this.printMatrix(augmented, `Шаг ${i + 1}`);
        }
        
        const x = new Array(n).fill(0.0);
        for (let i = n - 1; i >= 0; i--) {
            x[i] = augmented[i][n];
            for (let j = i + 1; j < n; j++) {
                x[i] -= augmented[i][j] * x[j];
            }
            x[i] /= augmented[i][i];
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
    
    inverseMatrix(A) {
        const n = A.length;
        if (A.some(row => row.length !== n)) {
            throw new Error("Матрица должна быть квадратной");
        }
        
        const det = this.determinant(A);
        if (Math.abs(det) < this.epsilon) {
            console.log("Матрица вырождена, обратная матрица не существует");
            return null;
        }
        
        const augmented = [];
        for (let i = 0; i < n; i++) {
            const row = [...A[i], ...new Array(n).fill(0.0)];
            row[n + i] = 1.0;
            augmented.push(row);
        }

        this.printMatrix(augmented, 'РАСШИРЕННАЯ МАТРИЦА');
        
        for (let i = 0; i < n; i++) {
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }
            
            if (maxRow !== i) {
                [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
            }
            
            const pivot = augmented[i][i];
            for (let j = 0; j < 2 * n; j++) {
                augmented[i][j] /= pivot;
            }
            
            for (let k = 0; k < n; k++) {
                if (k !== i && Math.abs(augmented[k][i]) > this.epsilon) {
                    const factor = augmented[k][i];
                    for (let j = 0; j < 2 * n; j++) {
                        augmented[k][j] -= factor * augmented[i][j];
                    }
                }
            }
        }
        
        const inverse = [];
        for (let i = 0; i < n; i++) {
            inverse.push(augmented[i].slice(n));
        }
        
        return inverse;
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

function main() {
    solveSpecificSystem();
}

function solveSpecificSystem() {
    const gauss = new GaussMethod();
    
    console.log("=".repeat(60));
    console.log("РЕШЕНИЕ СИСТЕМЫ ЛИНЕЙНЫХ УРАВНЕНИЙ МЕТОДОМ ГАУССА");
    console.log("=".repeat(60));
    
    const A = [
        [3, -5, -4, -7, 1],
        [4, 3, 1, 2, 3],
        [-2, 3, 4, 5, 2],
        [2, 5, -4, 1, 3],
        [2, -3, -5, 1, -2]
    ];
    
    const b = [18, 9, 3, -24, -20];
    
    console.log("Система уравнений:");
    const equations = [
        "3x₁ - 5x₂ - 4x₃ - 7x₄ + x₅ = 18",
        "4x₁ + 3x₂ + x₃ + 2x₄ + 3x₅ = 9",
        "-2x₁ + 3x₂ + 4x₃ + 5x₄ + 2x₅ = 3",
        "2x₁ + 5x₂ - 4x₃ + x₄ + 3x₅ = -24",
        "2x₁ - 3x₂ - 5x₃ + x₄ - 2x₅ = -20"
    ];
    
    equations.forEach((eq, i) => {
        console.log(`  ${i + 1}. ${eq}`);
    });
    
    gauss.printMatrix(A, "Матрица коэффициентов A");
    gauss.printVector(b, "Вектор правых частей b");
    
    console.log("\n" + "-".repeat(50));
    console.log("1. РЕШЕНИЕ СИСТЕМЫ МЕТОДОМ ГАУССА");
    console.log("-".repeat(50));
    
    const solution = gauss.solveSystem(A, b);
    if (solution) {
        gauss.printVector(solution, "Решение системы x");
        
        console.log("\nПроверка решения Ax = b:");
        for (let i = 0; i < A.length; i++) {
            const result = A[i].reduce((sum, coeff, j) => sum + coeff * solution[j], 0);
            const error = Math.abs(result - b[i]);
            console.log(`  Уравнение ${i + 1}: ${result.toFixed(6).padStart(10)} = ${b[i].toString().padStart(6)} (погрешность: ${error.toExponential(2)})`);
        }
        
        console.log("\nОтвет:");
        const variables = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'];
        variables.forEach((variable, i) => {
            console.log(`  ${variable} = ${solution[i].toFixed(6).padStart(10)}`);
        });
    }
    
    console.log("\n" + "-".repeat(50));
    console.log("2. ВЫЧИСЛЕНИЕ ОПРЕДЕЛИТЕЛЯ МАТРИЦЫ");
    console.log("-".repeat(50));
    
    const det = gauss.determinant(A);
    console.log(`Определитель матрицы A: ${det.toFixed(6)}`);
    
    if (Math.abs(det) < gauss.epsilon) {
        console.log("⚠️  Матрица вырождена (det = 0)");
        console.log("   Система может быть несовместной или иметь бесконечно много решений");
    } else {
        console.log("✅ Матрица невырождена (det ≠ 0)");
        console.log("   Система имеет единственное решение");
    }
    
    console.log("\n" + "-".repeat(50));
    console.log("3. ВЫЧИСЛЕНИЕ ОБРАТНОЙ МАТРИЦЫ");
    console.log("-".repeat(50));
    
    const inverse = gauss.inverseMatrix(A);
    if (inverse) {
        gauss.printMatrix(inverse, "Обратная матрица A⁻¹");
        
        console.log("\nПроверка: A × A⁻¹ = I");
        const n = A.length;
        const identityCheck = Array(n).fill().map(() => Array(n).fill(0.0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < n; k++) {
                    identityCheck[i][j] += A[i][k] * inverse[k][j];
                }
            }
        }
        
        gauss.printMatrix(identityCheck, "Результат A × A⁻¹");

        console.log("\n" + "-".repeat(30));
        console.log("АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ: x = A⁻¹ × b");
        console.log("-".repeat(30));
        
        const alternativeSolution = new Array(n).fill(0.0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                alternativeSolution[i] += inverse[i][j] * b[j];
            }
        }
        
        gauss.printVector(alternativeSolution, "Решение через обратную матрицу");
        
        if (solution) {
            console.log("\nСравнение методов решения:");
            const variables = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'];
            variables.forEach((variable, i) => {
                const diff = Math.abs(solution[i] - alternativeSolution[i]);
                console.log(`  ${variable}: Гаусс = ${solution[i].toFixed(6).padStart(10)}, A⁻¹×b = ${alternativeSolution[i].toFixed(6).padStart(10)}, разность = ${diff.toExponential(2)}`);
            });
        }
    }
}

if (typeof require !== 'undefined' && require.main === module) {
    main();
}

if (typeof window !== 'undefined') {
    window.GaussMethod = GaussMethod;
    window.main = main;
    window.solveSpecificSystem = solveSpecificSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GaussMethod, main, solveSpecificSystem };
}