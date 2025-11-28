let currentStep = 0.1;
let allCharts = [];
let verificationChartInstance = null;

window.addEventListener('DOMContentLoaded', () => {
  if (!window.rkLab) {
    alert('rk.js не загрузился — проверьте подключение скрипта.');
    return;
  }

  const stepSelector = document.getElementById('stepSelector');
  const recalculateBtn = document.getElementById('recalculateBtn');

  // Инициализация
  renderAll();

  // Обработчики событий
  recalculateBtn.addEventListener('click', () => {
    currentStep = parseFloat(stepSelector.value);
    renderAll();
  });

  stepSelector.addEventListener('change', () => {
    const stepInfo = document.getElementById('stepInfo');
    const h = parseFloat(stepSelector.value);
    const steps = Math.round((3 - 1) / h);
    stepInfo.innerHTML = `
      <p><strong>Выбран шаг h = ${h}</strong></p>
      <p>Количество шагов: ${steps}</p>
      <p>${h >= 0.5 ? '⚠️ При большом шаге различия между методами станут более заметными!' : '✅ При малом шаге методы высокого порядка очень точны.'}</p>
    `;
  });

  // Инициализируем подсказку
  stepSelector.dispatchEvent(new Event('change'));
});

function renderAll() {
  // Уничтожаем старые графики
  allCharts.forEach(chart => chart.destroy());
  allCharts = [];
  if (verificationChartInstance) {
    verificationChartInstance.destroy();
    verificationChartInstance = null;
  }

  const { odeConfig, methodFamilies, solveRungeKutta } = window.rkLab;
  
  // Пересчитываем решения с новым шагом
  const explicitSolutions = methodFamilies.explicit.map((method) => 
    solveRungeKutta(method, { h: currentStep })
  );
  const implicitSolutions = methodFamilies.implicit.map((method) => 
    solveRungeKutta(method, { h: currentStep })
  );
  const allSolutions = [...explicitSolutions, ...implicitSolutions];

  renderProblemInfo({ ...odeConfig, h: currentStep });
  renderVerificationChart({ ...odeConfig, h: currentStep });
  renderCardSection(explicitSolutions, 'explicitCards');
  renderCardSection(implicitSolutions, 'implicitCards');
  renderSummaryTable(allSolutions);
}

function renderProblemInfo(cfg) {
  const box = document.getElementById('problemInfo');
  box.innerHTML = `
    <h2>Условие задачи Коши</h2>
    <p><strong>Дифференциальное уравнение:</strong> x·y' = y·ln(y)</p>
    <p><strong>Начальное условие:</strong> y(1) = e</p>
    <p><strong>Область интегрирования:</strong> x ∈ [${cfg.x0}, ${cfg.xEnd}] с шагом h = ${cfg.h}</p>
    <p><strong>Аналитическое решение:</strong> y(x) = e<sup>x</sup></p>
    <p><strong>Цель:</strong> Сравнить численные решения явных и неявных схем Рунге–Кутты (таблицы Бутчера) с аналитическим решением и оценить погрешность.</p>
  `;
}

function renderCardSection(solutions, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const exactCurve = generateExactCurve();

  solutions.forEach((solution, idx) => {
    const card = document.createElement('div');
    card.className = 'method-card';
    card.innerHTML = buildCardHeader(solution, idx);

    const canvas = document.createElement('canvas');
    canvas.id = `${solution.method.id}-chart`;

    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'chart-wrapper';
    chartWrapper.appendChild(canvas);
    card.appendChild(chartWrapper);

    const metrics = document.createElement('div');
    metrics.className = 'metrics';
    metrics.innerHTML = buildMetrics(solution);
    card.appendChild(metrics);

    container.appendChild(card);

    createChart(canvas, solution, exactCurve);
  });
}

function buildCardHeader(solution, idx) {
  const { method } = solution;
  return `
    <h3>
      ${idx + 1}. ${method.name}
      <span class="badge ${method.type}">${method.type === 'explicit' ? 'явная' : 'неявная'}</span>
    </h3>
    <div class="method-meta">
      <p><strong>Порядок точности:</strong> ${method.order}</p>
      <p><strong>Ссылка на таблицу:</strong> ${method.reference}</p>
      <p>${method.description}</p>
    </div>
  `;
}

function buildMetrics(solution) {
  const iterations = solution.method.type === 'implicit'
    ? solution.stageHistory.filter((s) => Number.isFinite(s.iterations)).map((s) => s.iterations)
    : [];

  const avgIter = iterations.length
    ? (iterations.reduce((acc, v) => acc + v, 0) / iterations.length).toFixed(1)
    : '—';

  const divergedSteps = solution.method.type === 'implicit'
    ? solution.stageHistory.filter((s) => s.converged === false).length
    : 0;
  const lastPoint = solution.points[solution.points.length - 1];

  // Проверка на численную неустойчивость
  const maxValue = Math.max(...solution.points.map(p => Math.abs(p.y)));
  const isUnstable = !Number.isFinite(maxValue) || maxValue > 1e10;
  const hasInvalidValues = solution.points.some(p => !Number.isFinite(p.y));

  let stabilityWarning = '';
  if (isUnstable || hasInvalidValues) {
    stabilityWarning = `<span style="color: #c33764; font-weight: bold;">⚠️ ЧИСЛЕННАЯ НЕУСТОЙЧИВОСТЬ! Метод непригоден с текущим шагом.</span>`;
  }

  return `
    <span><strong>Максимальная погрешность:</strong> ${formatSci(solution.maxError)}</span>
    <span><strong>Погрешность в x=${lastPoint.x}:</strong> ${formatSci(lastPoint.absError)}</span>
    <span><strong>Средние итерации (неявн.):</strong> ${avgIter}</span>
    ${divergedSteps ? `<span><strong>Несошедшихся шагов:</strong> ${divergedSteps}</span>` : ''}
    ${stabilityWarning}
  `;
}

function createChart(canvas, solution, exactCurve) {
  const numericData = solution.points.map((p) => ({ x: p.x, y: p.y }));
  const errorData = solution.points.map((p) => ({ x: p.x, y: p.absError }));

  // Проверяем, нужна ли логарифмическая шкала
  const maxNumeric = Math.max(...numericData.map(p => Math.abs(p.y)));
  const maxExact = Math.max(...exactCurve.map(p => Math.abs(p.y)));
  const useLogScale = maxNumeric > maxExact * 100; // Если расхождение больше 100x

  // Фильтруем NaN и Infinity для логарифмической шкалы
  const validNumericData = numericData.filter(p => Number.isFinite(p.y) && p.y > 0);
  const validErrorData = errorData.filter(p => Number.isFinite(p.y) && p.y > 0);

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Аналитическое решение e^x',
          data: exactCurve,
          borderColor: '#21d4fd',
          backgroundColor: 'rgba(33, 212, 253, 0.08)',
          borderWidth: 3,
          pointRadius: 0
        },
        {
          label: 'Численное решение' + (useLogScale ? ' (⚠️ неустойчиво!)' : ''),
          data: useLogScale ? validNumericData : numericData,
          borderColor: solution.method.type === 'explicit' ? '#ff784f' : '#16a085',
          backgroundColor: solution.method.type === 'explicit'
            ? 'rgba(255, 120, 79, 0.15)'
            : 'rgba(22, 160, 133, 0.15)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.15,
          spanGaps: true
        },
        {
          label: 'Абсолютная погрешность',
          data: useLogScale ? validErrorData : errorData,
          borderColor: '#c33764',
          backgroundColor: 'rgba(195, 55, 100, 0.15)',
          borderDash: [8, 6],
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'errorAxis',
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const { dataset } = context;
              const { x, y } = context.parsed;
              return `${dataset.label}: (${x.toFixed(2)}, ${y.toExponential(3)})`;
            }
          }
        },
        title: useLogScale ? {
          display: true,
          text: '⚠️ Логарифмическая шкала из-за численной неустойчивости',
          color: '#c33764',
          font: { size: 11, weight: 'bold' }
        } : undefined
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'x' }
        },
        y: {
          type: useLogScale ? 'logarithmic' : 'linear',
          title: { 
            display: true, 
            text: useLogScale ? 'y (log шкала)' : 'y'
          },
          ticks: useLogScale ? {
            callback: function(value) {
              return value.toExponential(0);
            }
          } : undefined
        },
        errorAxis: {
          type: useLogScale ? 'logarithmic' : 'linear',
          position: 'right',
          title: { 
            display: true, 
            text: useLogScale ? '|ошибка| (log)' : '|ошибка|'
          },
          grid: { drawOnChartArea: false },
          beginAtZero: !useLogScale,
          ticks: useLogScale ? {
            callback: function(value) {
              return value.toExponential(0);
            }
          } : undefined
        }
      }
    }
  });

  allCharts.push(chart);
}

function renderSummaryTable(solutions) {
  const table = document.getElementById('summaryTable');
  const best = solutions.reduce(
    (acc, sol) => (sol.maxError < acc.maxError ? sol : acc),
    solutions[0]
  );

  let html = `
    <thead>
      <tr>
        <th>#</th>
        <th>Тип</th>
        <th>Схема</th>
        <th>Порядок</th>
        <th>Таблица</th>
        <th>max |ε|</th>
        <th>|ε(x=3)|</th>
      </tr>
    </thead>
    <tbody>
  `;

  solutions.forEach((solution, idx) => {
    const lastPoint = solution.points[solution.points.length - 1];
    html += `
      <tr class="${solution.method.id === best.method.id ? 'highlight-row' : ''}">
        <td>${idx + 1}</td>
        <td>${solution.method.type === 'explicit' ? 'Явная' : 'Неявная'}</td>
        <td>${solution.method.name}</td>
        <td>${solution.method.order}</td>
        <td>${solution.method.reference}</td>
        <td>${formatSci(solution.maxError)}</td>
        <td>${formatSci(lastPoint.absError)}</td>
      </tr>
    `;
  });

  html += '</tbody>';
  table.innerHTML = html;
}

function generateExactCurve(points = 400) {
  const { x0, xEnd, exact } = window.rkLab.odeConfig;
  const data = [];
  const step = (xEnd - x0) / (points - 1);

  for (let i = 0; i < points; i += 1) {
    const x = x0 + i * step;
    data.push({ x, y: exact(x) });
  }
  return data;
}

function formatSci(val) {
  if (!Number.isFinite(val)) return '—';
  if (Math.abs(val) >= 1e-3) {
    return val.toFixed(6);
  }
  return val.toExponential(3);
}

function renderVerificationChart(cfg) {
  const { x0, y0, xEnd, h, f, exact } = cfg;
  const canvas = document.getElementById('verificationChart');
  const info = document.getElementById('verificationInfo');

  // Генерируем аналитическое решение (плотная сетка)
  const exactCurve = [];
  const pointsCount = 400;
  const step = (xEnd - x0) / (pointsCount - 1);
  for (let i = 0; i < pointsCount; i++) {
    const x = x0 + i * step;
    exactCurve.push({ x, y: exact(x) });
  }

  // Проверяем начальное условие
  const y0Exact = exact(x0);
  const initialError = Math.abs(y0 - y0Exact);

  // Вычисляем производную в начальной точке
  const dydt_numerical = f(x0, y0);
  const dydt_analytical = exact(x0 + 1e-8) - exact(x0);  // численная производная

  // Создаём график
  verificationChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Аналитическое решение y = e^x',
          data: exactCurve,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0
        },
        {
          label: 'Начальное условие y(1) = e',
          data: [{ x: x0, y: y0 }],
          borderColor: '#ff6b6b',
          backgroundColor: '#ff6b6b',
          pointRadius: 12,
          pointHoverRadius: 15,
          showLine: false,
          pointStyle: 'circle'
        },
        {
          label: 'Контрольная точка y(3) = e³',
          data: [{ x: xEnd, y: exact(xEnd) }],
          borderColor: '#4ecdc4',
          backgroundColor: '#4ecdc4',
          pointRadius: 12,
          pointHoverRadius: 15,
          showLine: false,
          pointStyle: 'star'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { font: { size: 12 } }
        },
        title: {
          display: true,
          text: 'Задача Коши: x·y\' = y·ln(y), y(1) = e',
          font: { size: 16, weight: 'bold' },
          color: '#1d2671'
        },
        tooltip: {
          callbacks: {
            label(context) {
              const { dataset } = context;
              const { x, y } = context.parsed;
              return `${dataset.label}: (x=${x.toFixed(3)}, y=${y.toFixed(6)})`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'x', font: { size: 14 } },
          min: x0 - 0.1,
          max: xEnd + 0.1
        },
        y: {
          title: { display: true, text: 'y', font: { size: 14 } },
          beginAtZero: false
        }
      }
    }
  });

  // Заполняем информацию
  const stepsCount = Math.round((xEnd - x0) / h);
  info.innerHTML = `
    <p><strong>Начальное условие:</strong> y(${x0}) = ${y0.toFixed(6)} (заданное) ≈ ${y0Exact.toFixed(6)} (аналитическое)</p>
    <p><strong>Погрешность начального условия:</strong> |ε| = ${initialError.toExponential(3)}</p>
    <p><strong>Производная в начальной точке:</strong> y'(${x0}) = ${dydt_numerical.toFixed(6)}</p>
    <p><strong>Конечная точка (точное):</strong> y(${xEnd}) = e³ ≈ ${exact(xEnd).toFixed(6)}</p>
    <p><strong>Шаг интегрирования:</strong> h = ${h}, количество шагов = ${stepsCount}</p>
    <p><strong>Цель:</strong> Численно решить задачу Коши различными методами Рунге-Кутты и сравнить с аналитическим решением.</p>
  `;
}


