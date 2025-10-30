window.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Loading Newton graphs...');
    
    const xStar = 0.413;
    const xs = [-1.33, -0.94, -0.55, -0.16, 0.23, 0.62, 1.01, 1.40, 1.79];
    const ys = [-8.6254, -7.2165, -5.1761, 4.0349, 3.9539, 4.5172, -2.6217, -4.9364, -5.0512];

    const { X: X2, Y: Y2 } = chooseNearestNodes(xs, ys, xStar, 2);
    const { X: X3, Y: Y3 } = chooseNearestNodes(xs, ys, xStar, 3);

    const coeffs2 = dividedDifferences(X2, Y2);
    const coeffs3 = dividedDifferences(X3, Y3);

    const p2AtStar = evaluateNewton(X2, coeffs2, xStar);
    const p3AtStar = evaluateNewton(X3, coeffs3, xStar);

    const maxDeriv2 = estimateMaxDerivative(X2, Y2);
    const maxDeriv3 = estimateMaxDerivative(X3, Y3);
    const error2 = estimateError(X2, xStar, maxDeriv2);
    const error3 = estimateError(X3, xStar, maxDeriv3);

    function generateNewtonPoints(X, coeffs, xMin, xMax, numPoints = 100) {
      const points = [];
      const step = (xMax - xMin) / (numPoints - 1);
      for (let i = 0; i < numPoints; i++) {
        const x = xMin + i * step;
        const y = evaluateNewton(X, coeffs, x);
        points.push({ x, y });
      }
      return points;
    }

    const interp2Points = generateNewtonPoints(X2, coeffs2, X2[0], X2[X2.length - 1]);
    const interp3Points = generateNewtonPoints(X3, coeffs3, X3[0], X3[X3.length - 1]);

    const allXs = [...xs].sort((a, b) => a - b);
    const fullInterp2 = generateNewtonPoints(X2, coeffs2, allXs[0], allXs[allXs.length - 1]);
    const fullInterp3 = generateNewtonPoints(X3, coeffs3, allXs[0], allXs[allXs.length - 1]);

    function createDegree2Chart() {
      const ctx = document.getElementById('degree2Chart');
      
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Многочлен Ньютона P₂(x)',
              data: interp2Points,
              borderColor: '#FF6384',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderWidth: 3,
              pointRadius: 0,
              tension: 0
            },
            {
              label: 'Исходные данные (все)',
              data: xs.map((x, i) => ({ x, y: ys[i] })),
              borderColor: '#36A2EB',
              backgroundColor: '#36A2EB',
              pointRadius: 6,
              pointHoverRadius: 8,
              showLine: false
            },
            {
              label: 'Узлы интерполяции (для P₂)',
              data: X2.map((x, i) => ({ x, y: Y2[i] })),
              borderColor: '#4BC0C0',
              backgroundColor: '#4BC0C0',
              pointRadius: 8,
              pointHoverRadius: 10,
              showLine: false,
              pointStyle: 'triangle'
            },
            {
              label: `x* = ${xStar}`,
              data: [{ x: xStar, y: p2AtStar }],
              borderColor: '#FF9F40',
              backgroundColor: '#FF9F40',
              pointRadius: 10,
              pointHoverRadius: 12,
              showLine: false,
              pointStyle: 'star'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `P₂(${xStar}) = ${p2AtStar.toFixed(6)}, погрешность ≤ ${error2.toExponential(3)}`,
              font: { size: 16 }
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          scales: {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'x'
              }
            },
            y: {
              title: {
                display: true,
                text: 'y'
              }
            }
          }
        }
      });
    }

    function createDegree3Chart() {
      const ctx = document.getElementById('degree3Chart');
      
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Многочлен Ньютона P₃(x)',
              data: interp3Points,
              borderColor: '#9966FF',
              backgroundColor: 'rgba(153, 102, 255, 0.1)',
              borderWidth: 3,
              pointRadius: 0,
              tension: 0
            },
            {
              label: 'Исходные данные (все)',
              data: xs.map((x, i) => ({ x, y: ys[i] })),
              borderColor: '#36A2EB',
              backgroundColor: '#36A2EB',
              pointRadius: 6,
              pointHoverRadius: 8,
              showLine: false
            },
            {
              label: 'Узлы интерполяции (для P₃)',
              data: X3.map((x, i) => ({ x, y: Y3[i] })),
              borderColor: '#4BC0C0',
              backgroundColor: '#4BC0C0',
              pointRadius: 8,
              pointHoverRadius: 10,
              showLine: false,
              pointStyle: 'triangle'
            },
            {
              label: `x* = ${xStar}`,
              data: [{ x: xStar, y: p3AtStar }],
              borderColor: '#FF9F40',
              backgroundColor: '#FF9F40',
              pointRadius: 10,
              pointHoverRadius: 12,
              showLine: false,
              pointStyle: 'star'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `P₃(${xStar}) = ${p3AtStar.toFixed(6)}, погрешность ≤ ${error3.toExponential(3)}`,
              font: { size: 16 }
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          scales: {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'x'
              }
            },
            y: {
              title: {
                display: true,
                text: 'y'
              }
            }
          }
        }
      });
    }

    function createComparisonChart() {
      const ctx = document.getElementById('comparisonChart');
      
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'P₂(x)',
              data: fullInterp2,
              borderColor: '#FF6384',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              borderDash: [5, 5]
            },
            {
              label: 'P₃(x)',
              data: fullInterp3,
              borderColor: '#9966FF',
              backgroundColor: 'rgba(153, 102, 255, 0.1)',
              borderWidth: 2,
              pointRadius: 0
            },
            {
              label: 'Исходные данные',
              data: xs.map((x, i) => ({ x, y: ys[i] })),
              borderColor: '#36A2EB',
              backgroundColor: '#36A2EB',
              pointRadius: 6,
              showLine: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Сравнение: |P₃ - P₂| в точке x* = ${Math.abs(p3AtStar - p2AtStar).toFixed(6)}`,
              font: { size: 16 }
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          scales: {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'x'
              }
            },
            y: {
              title: {
                display: true,
                text: 'y'
              }
            }
          }
        }
      });
    }

    function createErrorChart() {
      const ctx = document.getElementById('errorChart');
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['P₂(x)', 'P₃(x)'],
          datasets: [{
            label: 'Оценка погрешности',
            data: [error2, error3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderColor: [
              '#FF6384',
              '#9966FF'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Оценка погрешности интерполяции в точке x*',
              font: { size: 16 }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              type: 'logarithmic',
              title: {
                display: true,
                text: 'Погрешность (логарифмическая шкала)'
              }
            }
          }
        }
      });
    }

    function fillResultsTable() {
      const table = document.getElementById('resultsTable');
      
      const verify2 = verifyAtAllNodes(X2, Y2, coeffs2);
      const verify3 = verifyAtAllNodes(X3, Y3, coeffs3);
      
      let html = `
        <tr>
          <th>Степень</th>
          <th>Коэффициенты</th>
          <th>Значение в x*</th>
          <th>Оценка погрешности</th>
        </tr>
        <tr>
          <td><strong>2</strong></td>
          <td>${coeffs2.map(c => c.toFixed(4)).join(', ')}</td>
          <td>P₂(${xStar}) = ${p2AtStar.toFixed(6)}</td>
          <td>≤ ${error2.toExponential(3)}</td>
        </tr>
        <tr>
          <td><strong>3</strong></td>
          <td>${coeffs3.map(c => c.toFixed(4)).join(', ')}</td>
          <td>P₃(${xStar}) = ${p3AtStar.toFixed(6)}</td>
          <td>≤ ${error3.toExponential(3)}</td>
        </tr>
        <tr>
          <td colspan="4"><strong>Проверка интерполяции в узловых точках</strong></td>
        </tr>
      `;
      
      html += '<tr><th>Узел</th><th>x</th><th>y (исходное)</th><th>P(x) (вычисленное)</th></tr>';
      
      verify2.forEach((v, i) => {
        html += `<tr>
          <td>P₂ узел ${i + 1}</td>
          <td>${v.xi.toFixed(2)}</td>
          <td>${v.yi.toFixed(4)}</td>
          <td>${v.p.toFixed(4)} (погр: ${v.diff.toExponential(2)})</td>
        </tr>`;
      });
      
      verify3.forEach((v, i) => {
        html += `<tr>
          <td>P₃ узел ${i + 1}</td>
          <td>${v.xi.toFixed(2)}</td>
          <td>${v.yi.toFixed(4)}</td>
          <td>${v.p.toFixed(4)} (погр: ${v.diff.toExponential(2)})</td>
        </tr>`;
      });
      
      table.innerHTML = html;
    }

    createDegree2Chart();
    createDegree3Chart();
    createComparisonChart();
    createErrorChart();
    fillResultsTable();
    
    console.log('All Newton graphs created successfully!');
  } catch (error) {
    console.error('Error creating graphs:', error);
    alert('Ошибка при создании графиков: ' + error.message);
  }
});
