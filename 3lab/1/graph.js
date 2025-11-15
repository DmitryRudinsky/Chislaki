window.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Loading Lagrange graphs with all intervals...');
    
    const xStar = 0.413;
    const xs = [-1.33, -0.94, -0.55, -0.16, 0.23, 0.62, 1.01, 1.40, 1.79];
    const ys = [-8.6254, -7.2165, -5.1761, 4.0349, 3.9539, 4.5172, -2.6217, -4.9364, -5.0512];

    // Получаем все возможные интервалы
    const intervals2 = getAllConsecutiveIntervals(xs, ys, 2);
    const intervals3 = getAllConsecutiveIntervals(xs, ys, 3);
    
    console.log('Intervals degree 2:', intervals2.length);
    console.log('Intervals degree 3:', intervals3.length);

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

    // Очищаем контейнер и создаем новую структуру
    const contentDiv = document.querySelector('.content');
    
    // Создаем заголовок с информацией
    let html = `
      <div class="info-box">
        <h2>Условие задачи</h2>
        <p><strong>Точка интерполяции:</strong> x* = ${xStar}</p>
        <p><strong>Исходные данные:</strong> ${xs.length} точек</p>
        <p><strong>Интервалов для степени 2:</strong> ${intervals2.length}</p>
        <p><strong>Интервалов для степени 3:</strong> ${intervals3.length}</p>
      </div>
    `;
    
    // Создаем графики для многочлена 2-й степени
    html += '<div class="section-title"><h2>Многочлены Лагранжа 2-й степени (все интервалы)</h2></div>';
    
    intervals2.forEach((interval, idx) => {
      const inInterval = isPointInInterval(xStar, interval.X);
      const coeffs = lagrangeCoefficients(interval.X, interval.Y);
      const pAtStar = evaluatePolynomial(coeffs, xStar);
      
      html += `
        <div class="chart-container ${inInterval ? 'interval-contains' : ''}">
          <h3>
            P₂ интервал ${idx + 1}: ${interval.interval}
            ${inInterval ? '<span class="badge-contains">✓ Содержит x*</span>' : ''}
          </h3>
          <div class="chart-info">
            <p><strong>Узлы:</strong> ${interval.X.map(x => x.toFixed(2)).join(', ')}</p>
            <p><strong>P₂(${xStar}) =</strong> ${pAtStar.toFixed(6)}</p>
          </div>
          <div class="chart-wrapper">
            <canvas id="degree2_interval${idx}"></canvas>
          </div>
        </div>
      `;
    });
    
    // Создаем графики для многочлена 3-й степени
    html += '<div class="section-title"><h2>Многочлены Лагранжа 3-й степени (все интервалы)</h2></div>';
    
    intervals3.forEach((interval, idx) => {
      const inInterval = isPointInInterval(xStar, interval.X);
      const coeffs = lagrangeCoefficients(interval.X, interval.Y);
      const pAtStar = evaluatePolynomial(coeffs, xStar);
      
      html += `
        <div class="chart-container ${inInterval ? 'interval-contains' : ''}">
          <h3>
            P₃ интервал ${idx + 1}: ${interval.interval}
            ${inInterval ? '<span class="badge-contains">✓ Содержит x*</span>' : ''}
          </h3>
          <div class="chart-info">
            <p><strong>Узлы:</strong> ${interval.X.map(x => x.toFixed(2)).join(', ')}</p>
            <p><strong>P₃(${xStar}) =</strong> ${pAtStar.toFixed(6)}</p>
          </div>
          <div class="chart-wrapper">
            <canvas id="degree3_interval${idx}"></canvas>
          </div>
        </div>
      `;
    });
    
    // Добавляем сравнительную таблицу
    html += `
      <div class="chart-container">
        <h3>Сравнение результатов для x* = ${xStar}</h3>
        <table class="results-table" id="comparisonTable"></table>
      </div>
    `;
    
    contentDiv.innerHTML = html;
    
    // Создаем графики для степени 2
    intervals2.forEach((interval, idx) => {
      const coeffs = lagrangeCoefficients(interval.X, interval.Y);
      const pAtStar = evaluatePolynomial(coeffs, xStar);
      const inInterval = isPointInInterval(xStar, interval.X);
      
      // Генерируем точки для интерполяции
      const xMin = Math.min(...xs);
      const xMax = Math.max(...xs);
      const interpPoints = generateInterpolationPoints(coeffs, xMin, xMax, 200);
      
      const ctx = document.getElementById(`degree2_interval${idx}`);
      
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: `P₂(x) на интервале ${interval.interval}`,
              data: interpPoints,
              borderColor: inInterval ? '#FF6384' : '#FFB3C6',
              backgroundColor: inInterval ? 'rgba(255, 99, 132, 0.1)' : 'rgba(255, 179, 198, 0.05)',
              borderWidth: inInterval ? 3 : 2,
              pointRadius: 0,
              tension: 0
            },
            {
              label: 'Все исходные данные',
              data: xs.map((x, i) => ({ x, y: ys[i] })),
              borderColor: '#CCCCCC',
              backgroundColor: '#CCCCCC',
              pointRadius: 4,
              pointHoverRadius: 6,
              showLine: false
            },
            {
              label: 'Узлы интерполяции',
              data: interval.X.map((x, i) => ({ x, y: interval.Y[i] })),
              borderColor: '#4BC0C0',
              backgroundColor: '#4BC0C0',
              pointRadius: 8,
              pointHoverRadius: 10,
              showLine: false,
              pointStyle: 'triangle'
            },
            {
              label: `x* = ${xStar}`,
              data: [{ x: xStar, y: pAtStar }],
              borderColor: inInterval ? '#FF9F40' : '#999999',
              backgroundColor: inInterval ? '#FF9F40' : '#999999',
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
            legend: {
              display: true,
              position: 'bottom',
              labels: { font: { size: 10 } }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: (${context.parsed.x.toFixed(3)}, ${context.parsed.y.toFixed(4)})`;
                }
              }
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
    });
    
    // Создаем графики для степени 3
    intervals3.forEach((interval, idx) => {
      const coeffs = lagrangeCoefficients(interval.X, interval.Y);
      const pAtStar = evaluatePolynomial(coeffs, xStar);
      const inInterval = isPointInInterval(xStar, interval.X);
      
      // Генерируем точки для интерполяции
      const xMin = Math.min(...xs);
      const xMax = Math.max(...xs);
      const interpPoints = generateInterpolationPoints(coeffs, xMin, xMax, 200);
      
      const ctx = document.getElementById(`degree3_interval${idx}`);
      
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: `P₃(x) на интервале ${interval.interval}`,
              data: interpPoints,
              borderColor: inInterval ? '#9966FF' : '#D4B3FF',
              backgroundColor: inInterval ? 'rgba(153, 102, 255, 0.1)' : 'rgba(212, 179, 255, 0.05)',
              borderWidth: inInterval ? 3 : 2,
              pointRadius: 0,
              tension: 0
            },
            {
              label: 'Все исходные данные',
              data: xs.map((x, i) => ({ x, y: ys[i] })),
              borderColor: '#CCCCCC',
              backgroundColor: '#CCCCCC',
              pointRadius: 4,
              pointHoverRadius: 6,
              showLine: false
            },
            {
              label: 'Узлы интерполяции',
              data: interval.X.map((x, i) => ({ x, y: interval.Y[i] })),
              borderColor: '#4BC0C0',
              backgroundColor: '#4BC0C0',
              pointRadius: 8,
              pointHoverRadius: 10,
              showLine: false,
              pointStyle: 'triangle'
            },
            {
              label: `x* = ${xStar}`,
              data: [{ x: xStar, y: pAtStar }],
              borderColor: inInterval ? '#FF9F40' : '#999999',
              backgroundColor: inInterval ? '#FF9F40' : '#999999',
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
            legend: {
              display: true,
              position: 'bottom',
              labels: { font: { size: 10 } }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: (${context.parsed.x.toFixed(3)}, ${context.parsed.y.toFixed(4)})`;
                }
              }
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
    });
    
    // Заполняем таблицу сравнения
    fillComparisonTable();
    
    console.log('All graphs created successfully!');
  } catch (error) {
    console.error('Error creating graphs:', error);
    alert('Ошибка при создании графиков: ' + error.message);
  }
});

function fillComparisonTable() {
  const xStar = 0.413;
  const xs = [-1.33, -0.94, -0.55, -0.16, 0.23, 0.62, 1.01, 1.40, 1.79];
  const ys = [-8.6254, -7.2165, -5.1761, 4.0349, 3.9539, 4.5172, -2.6217, -4.9364, -5.0512];
  
  const intervals2 = getAllConsecutiveIntervals(xs, ys, 2);
  const intervals3 = getAllConsecutiveIntervals(xs, ys, 3);
  
  const table = document.getElementById('comparisonTable');
  
  let html = `
    <thead>
      <tr>
        <th>Степень</th>
        <th>Интервал</th>
        <th>Содержит x*?</th>
        <th>Узлы</th>
        <th>P(x*)</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  intervals2.forEach((interval, idx) => {
    const coeffs = lagrangeCoefficients(interval.X, interval.Y);
    const pAtStar = evaluatePolynomial(coeffs, xStar);
    const inInterval = isPointInInterval(xStar, interval.X);
    
    html += `
      <tr class="${inInterval ? 'highlight-row' : ''}">
        <td><strong>2</strong></td>
        <td>${interval.interval}</td>
        <td>${inInterval ? '✓ Да' : '✗ Нет'}</td>
        <td>${interval.X.map(x => x.toFixed(2)).join(', ')}</td>
        <td>${pAtStar.toFixed(6)}</td>
      </tr>
    `;
  });
  
  intervals3.forEach((interval, idx) => {
    const coeffs = lagrangeCoefficients(interval.X, interval.Y);
    const pAtStar = evaluatePolynomial(coeffs, xStar);
    const inInterval = isPointInInterval(xStar, interval.X);
    
    html += `
      <tr class="${inInterval ? 'highlight-row' : ''}">
        <td><strong>3</strong></td>
        <td>${interval.interval}</td>
        <td>${inInterval ? '✓ Да' : '✗ Нет'}</td>
        <td>${interval.X.map(x => x.toFixed(2)).join(', ')}</td>
        <td>${pAtStar.toFixed(6)}</td>
      </tr>
    `;
  });
  
  html += '</tbody>';
  table.innerHTML = html;
}
