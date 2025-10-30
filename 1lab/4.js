class JacobiMethod {
    constructor() {
        this.epsilon = 1e-6;
        this.maxIterations = 1000;
    }
    
    solveSystem(A, b, initialGuess = null, tolerance = 1e-6) {
        // x[i]^(k+1) = (b[i] - Σ(A[i][j] * x[j]^(k))) / A[i][i]
        const n = A.length;
        if (n !== b.length || A.some(row => row.length !== n)) {
            throw new Error("Некорректные размеры матрицы или вектора");
        }
        
        console.log("=".repeat(60));
        console.log("РЕШЕНИЕ СИСТЕМЫ МЕТОДОМ ПРОСТЫХ ИТЕРАЦИЙ (ЯКОБИ)");
        console.log("=".repeat(60));
        
        let x = initialGuess ? [...initialGuess] : new Array(n).fill(0);
        let xNew = new Array(n).fill(0);
        let iteration = 0;
        let maxError = Infinity;
        
        console.log(`Начальное приближение: [${x.map(val => val.toFixed(6)).join(', ')}]`);
        console.log(`Точность: ${tolerance}`);
        console.log(`Максимальное количество итераций: ${this.maxIterations}`);
        
        console.log("\nИтерационный процесс:");
        console.log("Итерация | Решение | Максимальная погрешность");
        console.log("-".repeat(60));
        
        while (iteration < this.maxIterations && maxError > tolerance) {
            iteration++;
            
            for (let i = 0; i < n; i++) { // Вычисление нового приближения 
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    if (i !== j) {
                        sum += A[i][j] * x[j];
                    }
                }
                xNew[i] = (b[i] - sum) / A[i][i];
            }
            
            maxError = 0;
            for (let i = 0; i < n; i++) {
                const error = Math.abs(xNew[i] - x[i]);
                if (!isNaN(error) && isFinite(error)) {
                    maxError = Math.max(maxError, error);
                }
            }
            
            if (iteration <= 10 || iteration % 10 === 0 || maxError <= tolerance) {
                console.log(`${iteration.toString().padStart(8)} | [${xNew.map(val => val.toFixed(4)).join(', ')}] | ${maxError.toExponential(2)}`);
            }
            
            if (isNaN(maxError) || !isFinite(maxError)) {
                console.log(`❌ Метод расходится на итерации ${iteration}`);
                break;
            }
            
            [x, xNew] = [xNew, x];
        }
        
        console.log("-".repeat(60));
        
        if (iteration >= this.maxIterations || isNaN(maxError) || !isFinite(maxError)) {
            console.log(`⚠️  Метод не сошелся`);
            console.log(`   Количество итераций: ${iteration}`);
            console.log(`   Финальная погрешность: ${isNaN(maxError) ? 'NaN' : maxError.toExponential(2)}`);
        } else {
            console.log(`✅ Сходимость достигнута за ${iteration} итераций`);
            console.log(`   Финальная погрешность: ${maxError.toExponential(2)}`);
        }
        
        return {
            solution: x,
            iterations: iteration,
            error: maxError,
            converged: maxError <= tolerance && !isNaN(maxError) && isFinite(maxError)
        };
    }
    
    checkConvergence(A) {
        const n = A.length;
        
        // Одновременное вычисление сумм по строкам и столбцам за один проход
        const rowSums = new Array(n).fill(0);
        const colSums = new Array(n).fill(0);
        const diagonalElements = new Array(n);
        
        for (let i = 0; i < n; i++) {
            diagonalElements[i] = A[i][i];
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    const absValue = Math.abs(A[i][j]);
                    rowSums[i] += absValue;
                    colSums[j] += absValue;
                }
            }
        }
        
        // Вычисление отношений и максимумов
        let maxRowSum = 0;
        let maxColSum = 0;
        const rowRatios = new Array(n);
        const colRatios = new Array(n);
        
        for (let i = 0; i < n; i++) {
            rowRatios[i] = rowSums[i] / Math.abs(diagonalElements[i]);
            colRatios[i] = colSums[i] / Math.abs(diagonalElements[i]);
            maxRowSum = Math.max(maxRowSum, rowRatios[i]);
            maxColSum = Math.max(maxColSum, colRatios[i]);
        }
        
        // Вывод результатов по строкам
        console.log(`\nПроверка сходимости по строкам:`);
        console.log("Строка | Диагональный элемент | Сумма внедиагональных | Отношение");
        console.log("-".repeat(70));
        
        for (let i = 0; i < n; i++) {
            console.log(`${(i + 1).toString().padStart(6)} | ${diagonalElements[i].toString().padStart(18)} | ${rowSums[i].toFixed(4).padStart(19)} | ${rowRatios[i].toFixed(6)}`);
        }
        
        console.log("-".repeat(70));
        console.log(`Максимальное отношение по строкам: ${maxRowSum.toFixed(6)}`);
        
        const rowConverges = maxRowSum < 1;
        if (rowConverges) {
            console.log(`✅ Условие диагонального преобладания по строкам выполнено (${maxRowSum.toFixed(6)} < 1)`);
        } else {
            console.log(`⚠️  Условие диагонального преобладания по строкам не выполнено (${maxRowSum.toFixed(6)} ≥ 1)`);
        }
        
        // Вывод результатов по столбцам
        console.log(`\nПроверка сходимости по столбцам:`);
        console.log("Столбец | Диагональный элемент | Сумма внедиагональных | Отношение");
        console.log("-".repeat(70));
        
        for (let j = 0; j < n; j++) {
            console.log(`${(j + 1).toString().padStart(7)} | ${diagonalElements[j].toString().padStart(18)} | ${colSums[j].toFixed(4).padStart(19)} | ${colRatios[j].toFixed(6)}`);
        }
        
        console.log("-".repeat(70));
        console.log(`Максимальное отношение по столбцам: ${maxColSum.toFixed(6)}`);
        
        const colConverges = maxColSum < 1;
        if (colConverges) {
            console.log(`✅ Условие диагонального преобладания по столбцам выполнено (${maxColSum.toFixed(6)} < 1)`);
        } else {
            console.log(`⚠️  Условие диагонального преобладания по столбцам не выполнено (${maxColSum.toFixed(6)} ≥ 1)`);
        }
        
        // Итоговый вывод
        console.log(`\n${"=".repeat(70)}`);
        if (rowConverges || colConverges) {
            console.log(`✅ МЕТОД ЯКОБИ ГАРАНТИРОВАННО СХОДИТСЯ`);
            if (rowConverges && colConverges) {
                console.log(`   Условие выполнено как по строкам, так и по столбцам`);
            } else if (rowConverges) {
                console.log(`   Условие выполнено по строкам`);
            } else {
                console.log(`   Условие выполнено по столбцам`);
            }
        } else {
            console.log(`⚠️  СХОДИМОСТЬ НЕ ГАРАНТИРОВАНА`);
            console.log(`   Условие не выполнено ни по строкам, ни по столбцам`);
            console.log(`   Метод может сходиться, но это не гарантировано`);
        }
        console.log(`${"=".repeat(70)}`);
        
        return rowConverges || colConverges;
    }
    
    reorderForDiagonalDominance(A, b) {
        const n = A.length;
        const originalA = A.map(row => [...row]);
        const originalB = [...b];
        
        const rowMapping = Array.from({length: n}, (_, i) => i);
        
        console.log("\nАвтоматическая перестановка строк для улучшения сходимости:");
        
        for (let i = 0; i < n; i++) {
            let bestRow = i;
            let bestRatio = Math.abs(A[i][i]) / A[i].reduce((sum, val, j) => sum + (j !== i ? Math.abs(val) : 0), 0); // ratio = |диагональный элемент| / |сумма внедиагональных элементов|
            
            for (let j = i + 1; j < n; j++) {
                const ratio = Math.abs(A[j][i]) / A[j].reduce((sum, val, k) => sum + (k !== i ? Math.abs(val) : 0), 0);
                if (ratio > bestRatio) {
                    bestRow = j;
                    bestRatio = ratio;
                }
            }
            
            if (bestRow !== i) {
                [A[i], A[bestRow]] = [A[bestRow], A[i]];
                [b[i], b[bestRow]] = [b[bestRow], b[i]];
                [rowMapping[i], rowMapping[bestRow]] = [rowMapping[bestRow], rowMapping[i]];
                console.log(`  Перестановка строк ${i + 1} и ${bestRow + 1}`);
            }
        }
        
        console.log("Перестановка завершена");
        return { A, b, originalA, originalB, rowMapping };
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

function solveSystemWithJacobi() {
    const jacobi = new JacobiMethod();
    
    console.log("=".repeat(60));
    console.log("РЕШЕНИЕ СИСТЕМЫ ЛИНЕЙНЫХ УРАВНЕНИЙ МЕТОДОМ ПРОСТЫХ ИТЕРАЦИЙ");
    console.log("=".repeat(60));
    
    const A = [
        [6, -5, 16, 4],
        [5, -3, -4, 14],
        [-3, 12, -2, -7],
        [15, -4, -9, -2]
    ];
    
    const b = [60, -53, 32, 80];
    
    console.log("Система уравнений:");
    const equations = [
        "6x₁ - 5x₂ + 16x₃ + 4x₄ = 60",
        "5x₁ - 3x₂ - 4x₃ + 14x₄ = -53",
        "-3x₁ + 12x₂ - 2x₃ - 7x₄ = 32",
        "15x₁ - 4x₂ - 9x₃ - 2x₄ = 80"
    ];
    
    equations.forEach((eq, i) => {
        console.log(`  ${i + 1}. ${eq}`);
    });
    
    jacobi.printMatrix(A, "Исходная матрица коэффициентов A");
    jacobi.printVector(b, "Исходный вектор правых частей b");
    
    console.log("\n" + "-".repeat(50));
    console.log("1. АВТОМАТИЧЕСКАЯ ПЕРЕСТАНОВКА СТРОК");
    console.log("-".repeat(50));
    
    const reordered = jacobi.reorderForDiagonalDominance(A, b);
    
    jacobi.printMatrix(reordered.A, "Переставленная матрица коэффициентов A");
    jacobi.printVector(reordered.b, "Переставленный вектор правых частей b");
    
    console.log("\n" + "-".repeat(50));
    console.log("2. ПРОВЕРКА СХОДИМОСТИ");
    console.log("-".repeat(50));
    
    const converges = jacobi.checkConvergence(reordered.A);
    
    console.log("\n" + "-".repeat(50));
    console.log("3. РЕШЕНИЕ МЕТОДОМ ПРОСТЫХ ИТЕРАЦИЙ");
    console.log("-".repeat(50));
    
    const tolerance = 1e-6;
    const result = jacobi.solveSystem(reordered.A, reordered.b, null, tolerance);
    
    if (result.converged) {
        jacobi.printVector(result.solution, "Решение системы x");
        
        console.log("\nПроверка решения Ax = b (исходная система):");
        for (let i = 0; i < reordered.originalA.length; i++) {
            const calculated = reordered.originalA[i].reduce((sum, coeff, j) => sum + coeff * result.solution[j], 0);
            const error = Math.abs(calculated - reordered.originalB[i]);
            console.log(`  Уравнение ${i + 1}: ${calculated.toFixed(6).padStart(10)} = ${reordered.originalB[i].toString().padStart(6)} (погрешность: ${error.toExponential(2)})`);
        }
        
        console.log("\nОтвет:");
        console.log(`  x₁ = ${result.solution[0].toFixed(6).padStart(10)}`);
        console.log(`  x₂ = ${result.solution[1].toFixed(6).padStart(10)}`);
        console.log(`  x₃ = ${result.solution[2].toFixed(6).padStart(10)}`);
        console.log(`  x₄ = ${result.solution[3].toFixed(6).padStart(10)}`);
        
        console.log(`\nКоличество итераций: ${result.iterations}`);
        console.log(`Достигнутая точность: ${result.error.toExponential(2)}`);
    } else {
        console.log("\n❌ Метод не сошелся за максимальное количество итераций");
        console.log("   Попробуйте изменить начальное приближение или использовать другой метод");
    }
}

function main() {
    solveSystemWithJacobi();
}

if (typeof require !== 'undefined' && require.main === module) {
    main();
}

if (typeof window !== 'undefined') {
    window.JacobiMethod = JacobiMethod;
    window.main = main;
    window.solveSystemWithJacobi = solveSystemWithJacobi;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JacobiMethod, main, solveSystemWithJacobi };
}
