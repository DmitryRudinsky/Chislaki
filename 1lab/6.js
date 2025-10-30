class Complex {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    toString() {
        if (this.imag === 0) {
            return this.real.toFixed(6);
        } else if (this.imag > 0) {
            return `${this.real.toFixed(6)} + ${this.imag.toFixed(6)}i`;
        } else {
            return `${this.real.toFixed(6)} - ${Math.abs(this.imag).toFixed(6)}i`;
        }
    }
}

// Основная функцияю
function main() {
    // Исходная матрица 5x5
    const A = [
        [4, -5, -4, 5, 0],
        [3, 12, 0, 4, 2],
        [-2, 3, 4, 8, 5],
        [0, 2, -4, 1, 3],
        [5, 3, -5, 1, -1]
    ];

    console.log("Исходная матрица:");
    printMatrix(A);

    // Нахождение собственных значений
    // A·v = λ·v
    const eigenvalues = QRAlgorithm(A, 1000, 1e-10);
    
    console.log("\nСобственные значения:");
    eigenvalues.forEach((lambda, i) => {
        console.log(`λ${i + 1} = ${lambda.toString()}`);
    });
}

// QRAlgorithm - основной алгоритм QR-разложения для нахождения собственных значений
function QRAlgorithm(A, maxIterations, epsilon) {
    let currentA = copyMatrix(A);
    
    for (let iter = 0; iter < maxIterations; iter++) {
        // QR-разложение
        // Q — ортогональная матрица (Q^T·Q = I)
        // R — верхнетреугольная матрица
        const [Q, R] = QRDecomposition(currentA, epsilon);
        
        // Обновление матрицы: A_new = R * Q
        const newA = multiplyMatrices(R, Q);
        
        // Проверка сходимости (матрица становится верхней квазитреугольной)
        if (isQuasiUpperTriangular(newA, epsilon)) {
            console.log(`Сходимость достигнута за ${iter + 1} итераций`);
            currentA = newA;
            break;
        }
        
        currentA = newA;
        
        if (iter === maxIterations - 1) {
            console.log(`Достигнуто максимальное число итераций: ${maxIterations}`);
        }
    }
    
    // Извлечение собственных значений из квазитреугольной матрицы
    return extractEigenvalues(currentA, epsilon);
}

// QRDecomposition - QR-разложение с преобразованиями Хаусхолдера
function QRDecomposition(A, epsilon) {
    const n = A.length;
    let Q = identityMatrix(n);
    let R = copyMatrix(A);
    
    for (let k = 0; k < n - 1; k++) {
        // Вектор x из k-го столбца, начиная с k-й строки
        const x = [];
        for (let i = k; i < n; i++) {
            x.push(R[i][k]);
        }
        
        // Норма вектора x
        const normX = norm(x);
        
        // Выбор знака для численной устойчивости
        const sign = x[0] < 0 ? -1.0 : 1.0;
        
        // Вектор v
        const v = [];
        v[0] = x[0] + sign * normX;
        for (let i = 1; i < x.length; i++) {
            v[i] = x[i];
        }
        
        // Норма вектора v
        const normV = norm(v);
        if (normV < epsilon) {
            continue;
        }
        
        // Нормализация v
        for (let i = 0; i < v.length; i++) {
            v[i] /= normV;
        }
        
        // Матрица Хаусхолдера H = I - 2*v*v^T
        const H = identityMatrix(n);
        for (let i = k; i < n; i++) {
            for (let j = k; j < n; j++) {
                H[i][j] -= 2 * v[i - k] * v[j - k];
            }
        }
        
        // Применение преобразования: R = H * R
        R = multiplyMatrices(H, R);
        
        // Накопление Q: Q = Q * H^T (H симметрична)
        Q = multiplyMatrices(Q, H);
    }
    
    return [Q, R];
}

// extractEigenvalues - извлечение собственных значений из квазитреугольной матрицы
function extractEigenvalues(A, epsilon) {
    const n = A.length;
    const eigenvalues = [];
    
    let i = 0;
    while (i < n) {
        if (i === n - 1 || Math.abs(A[i + 1][i]) < epsilon) {
            // Вещественное собственное значение
            eigenvalues.push(new Complex(A[i][i], 0));
            i++;
        } else {
            // Блок 2x2 для комплексных собственных значений
            const a = A[i][i];
            const b = A[i][i + 1];
            const c = A[i + 1][i];
            const d = A[i + 1][i + 1];
            
            // Вычисляем собственные значения блока 2x2
            const trace = a + d;
            const det = a * d - b * c;
            
            const discriminant = trace * trace - 4 * det;
            if (discriminant >= 0) {
                // Вещественные собственные значения
                const lambda1 = (trace + Math.sqrt(discriminant)) / 2;
                const lambda2 = (trace - Math.sqrt(discriminant)) / 2;
                eigenvalues.push(new Complex(lambda1, 0));
                eigenvalues.push(new Complex(lambda2, 0));
            } else {
                // Комплексные собственные значения
                const realPart = trace / 2;
                const imagPart = Math.sqrt(-discriminant) / 2;
                eigenvalues.push(new Complex(realPart, imagPart));
                eigenvalues.push(new Complex(realPart, -imagPart));
            }
            i += 2;
        }
    }
    
    return eigenvalues;
}
 
// isQuasiUpperTriangular - проверка, является ли матрица верхней квазитреугольной
function isQuasiUpperTriangular(A, epsilon) {
    const n = A.length;
    for (let i = 1; i < n; i++) {
        // Пропускаем элементы непосредственно под диагональю, которые могут быть ненулевыми в блоках 2x2
        if (i > 0 && Math.abs(A[i][i - 1]) > epsilon) {
            // Проверяем, что это действительно блок 2x2, а не элемент, который должен быть нулевым
            if (i === 1 || Math.abs(A[i - 1][i - 2]) < epsilon) {
                // Это может быть блок 2x2, продолжаем проверку
                continue;
            }
        }
        
        // Для всех остальных элементов под диагональю проверяем, что они близки к нулю
        for (let j = 0; j < i - 1; j++) {
            if (Math.abs(A[i][j]) > epsilon) {
                return false;
            }
        }
    }
    return true;
}

// Вспомогательные функции

// copyMatrix - создание копии матрицы
function copyMatrix(A) {
    const n = A.length;
    const copyMat = [];
    for (let i = 0; i < n; i++) {
        copyMat[i] = [];
        for (let j = 0; j < A[i].length; j++) {
            copyMat[i][j] = A[i][j];
        }
    }
    return copyMat;
}

// identityMatrix - создание единичной матрицы
function identityMatrix(n) {
    const I = [];
    for (let i = 0; i < n; i++) {
        I[i] = [];
        for (let j = 0; j < n; j++) {
            I[i][j] = i === j ? 1.0 : 0.0;
        }
    }
    return I;
}

// multiplyMatrices - умножение матриц
function multiplyMatrices(A, B) {
    const n = A.length;
    const m = B[0].length;
    const p = B.length;
    
    const result = [];
    for (let i = 0; i < n; i++) {
        result[i] = [];
        for (let j = 0; j < m; j++) {
            result[i][j] = 0;
            for (let k = 0; k < p; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return result;
}

// norm - вычисление евклидовой нормы вектора
function norm(v) {
    let sum = 0.0;
    for (const x of v) {
        sum += x * x;
    }
    return Math.sqrt(sum);
}

// printMatrix - печать матрицы
function printMatrix(A) {
    for (let i = 0; i < A.length; i++) {
        let row = "";
        for (let j = 0; j < A[i].length; j++) {
            row += A[i][j].toFixed(4).padStart(8) + " ";
        }
        console.log(row);
    }
}

// Запуск программы
main();
