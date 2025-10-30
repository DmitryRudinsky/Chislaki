const N = 5;

function main() {
    const A = [
        [3, -5, -4, -7, 1],
        [4, 3, 1, 2, 3],
        [-2, 3, 4, 5, 2],
        [2, 5, -4, 1, 3],
        [2, -3, -5, 1, -2]
    ];
    
    const b = [18, 9, 3, -24, -20];
    
    const A_original = [];
    for (let i = 0; i < 5; i++) {
        A_original[i] = [...A[i]];
    }

    luInPlace(A);

    const x = solveLUInPlace(A, b);
    printVector(x, "Решение системы:");

    const det = determinantInPlace(A);
    console.log(`\nОпределитель матрицы A: ${det.toFixed(2)}`);

    const invA = inverseMatrixInPlace(A);
    printMatrix(invA, "Обратная матрица A^(-1):");
    
    console.log("\nПроверка: A * A^-1 (должно быть ~E):");
    const result = [];
    for (let i = 0; i < N; i++) {
        result[i] = [];
        for (let j = 0; j < N; j++) {
            result[i][j] = 0;
            for (let k = 0; k < N; k++) {
                result[i][j] += A_original[i][k] * invA[k][j];
            }
        }
    }
    printMatrix(result, "A * A^-1");
}

// luInPlace - выполняет LU-разложение внутри матрицы A
function luInPlace(A) {
    const n = A.length;
    for (let k = 0; k < n; k++) {
        // Шаг 1: обновление верхней части (U)
        for (let j = k; j < n; j++) {
            let sum = 0.0;
            for (let m = 0; m < k; m++) {
                sum += A[k][m] * A[m][j];
            }
            A[k][j] -= sum;
        }

        // Шаг 2: обновление нижней части (L)
        for (let i = k + 1; i < n; i++) {
            let sum = 0.0;
            for (let m = 0; m < k; m++) {
                sum += A[i][m] * A[m][k];
            }
            A[i][k] = (A[i][k] - sum) / A[k][k];
        }
    }
}

// forwardSubstitutionInPlace - решает Ly = b, используя нижнюю часть A
function forwardSubstitutionInPlace(A, b) {
    const n = b.length;
    const y = new Array(n);
    for (let i = 0; i < n; i++) {
        let sum = 0.0;
        for (let j = 0; j < i; j++) {
            sum += A[i][j] * y[j];
        }
        y[i] = b[i] - sum;
    }
    return y;
}

// backwardSubstitutionInPlace - решает Ux = y, используя верхнюю часть A
function backwardSubstitutionInPlace(A, y) {
    const n = y.length;
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0.0;
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (y[i] - sum) / A[i][i];
    }
    return x;
}

// solveLUInPlace - решает Ax = b с использованием LU-разложения внутри A
function solveLUInPlace(A, b) {
    const y = forwardSubstitutionInPlace(A, b); // Ly = b
    const x = backwardSubstitutionInPlace(A, y); // Ux = y
    return x;
}

// determinantInPlace - определитель через произведение диагоналей U
function determinantInPlace(A) {
    let det = 1.0;
    for (let i = 0; i < A.length; i++) {
        det *= A[i][i];
    }
    return det;
}

// inverseMatrixInPlace - строит обратную матрицу, используя LU-разложение
function inverseMatrixInPlace(A) {
    const n = A.length;
    const inv = [];
    for (let i = 0; i < n; i++) {
        inv[i] = new Array(n);
    }

    // Для каждого столбца единичной матрицы e_j
    for (let j = 0; j < n; j++) {
        const ej = new Array(n).fill(0);
        ej[j] = 1.0;

        const y = forwardSubstitutionInPlace(A, ej);
        const x = backwardSubstitutionInPlace(A, y);

        // Сохраняем столбец x в обратной матрице
        for (let i = 0; i < n; i++) {
            inv[i][j] = x[i];
        }
    }

    return inv;
}

function printVector(v, name) {
    console.log(`\n${name}:`);
    for (let i = 0; i < v.length; i++) {
        console.log(`x${i + 1} = ${v[i].toFixed(4)}`);
    }
}

function printMatrix(mat, name) {
    console.log(`\n${name}:`);
    for (let i = 0; i < mat.length; i++) {
        let row = '';
        for (let j = 0; j < mat[i].length; j++) {
            row += mat[i][j].toFixed(4).padStart(10, ' ') + ' ';
        }
        console.log(row);
    }
}

// Запуск программы
main();

