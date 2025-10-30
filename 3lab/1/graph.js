window.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Loading Lagrange graphs...');
    
    const xStar = 0.413;
    const xs = [-1.33, -0.94, -0.55, -0.16, 0.23, 0.62, 1.01, 1.40, 1.79];
    const ys = [-8.6254, -7.2165, -5.1761, 4.0349, 3.9539, 4.5172, -2.6217, -4.9364, -5.0512];

    console.log('Functions check:', {
      chooseNearestNodes: typeof chooseNearestNodes,
      lagrangeCoefficients: typeof lagrangeCoefficients,
      evaluatePolynomial: typeof evaluatePolynomial
    });

    const { X: X2, Y: Y2 } = chooseNearestNodes(xs, ys, xStar, 2);
    const { X: X3, Y: Y3 } = chooseNearestNodes(xs, ys, xStar, 3);

    console.log('Selected nodes:', { X2, Y2, X3, Y3 });

    const coeffs2 = lagrangeCoefficients(X2, Y2);
    const coeffs3 = lagrangeCoefficients(X3, Y3);

    const p2AtStar = evaluatePolynomial(coeffs2, xStar);
    const p3AtStar = evaluatePolynomial(coeffs3, xStar);

    console.log('Results:', { p2AtStar, p3AtStar });

    function generateInterpolationPoints(coeffs, xMin, xMax, numPoints = 100) {
      const points = [];
      const step = (xMax - xMin) / (numPoints - 1);
      for (let i = 0; i < numPoints; i++) {
        const x = xMin + i * step;
        const y = evaluatePolynomial(coeffs, x);
        points.push({ x, y });
      }
      return points;
    }

    const interp2Points = generateInterpolationPoints(coeffs2, X2[0], X2[X2.length - 1]);
    const interp3Points = generateInterpolationPoints(coeffs3, X3[0], X3[X3.length - 1]);

    const allXs = [...xs].sort((a, b) => a - b);
    const fullInterp2 = generateInterpolationPoints(coeffs2, allXs[0], allXs[allXs.length - 1]);
    const fullInterp3 = generateInterpolationPoints(coeffs3, allXs[0], allXs[allXs.length - 1]);

    function createDegree2Chart() {
      const ctx = document.getElementById('degree2Chart');
      
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Многочлен Лагранжа P₂(x)',
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
              text: `P₂(${xStar}) = ${p2AtStar.toFixed(6)}`,
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
      console.log('Degree 2 chart created');
    }

    function createDegree3Chart() {
      const ctx = document.getElementById('degree3Chart');
      
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Многочлен Лагранжа P₃(x)',
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
              text: `P₃(${xStar}) = ${p3AtStar.toFixed(6)}`,
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
      console.log('Degree 3 chart created');
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
      console.log('Comparison chart created');
    }

    function fillResultsTable() {
      const table = document.getElementById('resultsTable');
      
      const verify2 = verifyAtAllNodes(coeffs2, X2, Y2);
      const verify3 = verifyAtAllNodes(coeffs3, X3, Y3);
      
      let html = `
        <tr>
          <th>Степень</th>
          <th>Многочлен</th>
          <th>Значение в x*</th>
          <th>Узлы</th>
        </tr>
        <tr>
          <td><strong>2</strong></td>
          <td>${polynomialToString(coeffs2, 4)}</td>
          <td>P₂(${xStar}) = ${p2AtStar.toFixed(6)}</td>
          <td>${X2.map(x => x.toFixed(2)).join(', ')}</td>
        </tr>
        <tr>
          <td><strong>3</strong></td>
          <td>${polynomialToString(coeffs3, 4)}</td>
          <td>P₃(${xStar}) = ${p3AtStar.toFixed(6)}</td>
          <td>${X3.map(x => x.toFixed(2)).join(', ')}</td>
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
      console.log('Results table filled');
    }

    createDegree2Chart();
    createDegree3Chart();
    createComparisonChart();
    fillResultsTable();
    
    console.log('All graphs created successfully!');
  } catch (error) {
    console.error('Error creating graphs:', error);
    alert('Ошибка при создании графиков: ' + error.message);
  }
});
