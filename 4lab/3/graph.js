(() => {
  if (!window.ShootingLab) {
    // eslint-disable-next-line no-alert
    alert('shooting.js не загрузился — проверьте подключение скрипта.');
    return;
  }

  const {
    shootingConfig,
    exactSolution,
    solveShooting
  } = window.ShootingLab;

  const problemInfo = document.getElementById('problemInfo');
  const stepSlider = document.getElementById('stepSlider');
  const stepInput = document.getElementById('stepInput');
  const tolInput = document.getElementById('tolInput');
  const maxIterInput = document.getElementById('maxIterInput');
  const stepInfo = document.getElementById('stepInfo');
  const analyticInfo = document.getElementById('analyticInfo');
  const recalcBtn = document.getElementById('recalculateBtn');
  const iterationsTable = document.getElementById('iterationsTable');

  const charts = {
    analytic: null,
    solution: null,
    error: null,
    iterError: null
  };

  const fmt = (value, digits = 6) => value.toFixed(digits);

  const renderProblemInfo = () => {
    const { a, b, leftValue, rightValue } = shootingConfig;
    problemInfo.innerHTML = `
      <h2>Краевая задача №29 (метод стрельбы)</h2>
      <p><strong>Дифференциальное уравнение:</strong></p>
      <p style="margin-left:10px;">
        x²(2x + 1)·y″ − 4x(x + 1)·y′ + 2(2x + 3)·y = 0
      </p>
      <p><strong>Граничные условия:</strong></p>
      <p style="margin-left:10px;">
        y(${a}) = ${leftValue.toFixed(6)}, &nbsp;
        y(${b}) ≈ ${rightValue.toFixed(6)}, &nbsp;
        h = 0.2
      </p>
      <p><strong>Аналитическое решение:</strong></p>
      <p style="margin-left:10px;">
        y(x) = \\( \\dfrac{2x^2(1 + 3x)}{2x + 1} \\)
      </p>
      <p>
        Цель: численно решить краевую задачу методом стрельбы (подбор начального наклона y′(${a}))
        и сравнить полученное решение с аналитическим, оценив погрешность.
      </p>
    `;
  };

  const buildStepInfo = (cfg) => {
    const steps = Math.round((cfg.b - cfg.a) / cfg.h);
    return `
      <p>
        <strong>Интервал:</strong> [${cfg.a}; ${cfg.b}] ·
        <strong>Шаг:</strong> h = ${cfg.h.toFixed(4)} ·
        <strong>Количество шагов:</strong> ${steps + 1} узлов
      </p>
      <p>
        <strong>Условие в левой точке:</strong> y(${cfg.a}) = ${cfg.leftValue.toFixed(6)} ·
        <strong>Условие в правой точке:</strong> y(${cfg.b}) ≈ ${cfg.rightValue.toFixed(6)}
      </p>
    `;
  };

  const renderAnalyticChart = (cfg) => {
    const points = 400;
    const xs = [];
    const ys = [];
    const step = (cfg.b - cfg.a) / (points - 1);

    for (let i = 0; i < points; i += 1) {
      const x = cfg.a + i * step;
      xs.push(x);
      ys.push(exactSolution(x));
    }

    const datasets = [
      {
        label: 'Аналитическое решение',
        data: ys.map((y, idx) => ({ x: xs[idx], y })),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.18)',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.08
      }
    ];

    updateChart('analytic', 'analyticChart', xs, datasets, 'y(x)');

    const ya = exactSolution(cfg.a);
    const yb = exactSolution(cfg.b);
    analyticInfo.innerHTML = `
      <p><strong>Контроль аналитического решения:</strong></p>
      <p>y(${cfg.a}) = ${fmt(ya, 6)}, &nbsp; y(${cfg.b}) = ${fmt(yb, 6)}</p>
      <p>Тот же интервал и шаг используются в численном решении методом стрельбы.</p>
    `;
  };

  const createLineOptions = (yTitle) => ({
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label(context) {
            const { dataset } = context;
            const { x, y } = context.parsed;
            return `${dataset.label}: (x=${x.toFixed(3)}, y=${y.toExponential(4)})`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'x' }
      },
      y: {
        title: { display: true, text: yTitle }
      }
    }
  });

  const updateChart = (key, canvasId, labels, datasets, yTitle, customOptions = null) => {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (charts[key]) {
      charts[key].data.labels = labels;
      charts[key].data.datasets = datasets;
      if (customOptions) {
        charts[key].options = customOptions;
      } else {
        charts[key].options.scales.y.title.text = yTitle;
      }
      charts[key].update();
      return;
    }

    charts[key] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: customOptions || createLineOptions(yTitle)
    });
  };

  const renderSolutionChart = (result) => {
    const xs = result.solution.xs;
    const ys = result.solution.ys;
    const exact = xs.map((x) => exactSolution(x));

    const labels = xs;
    const datasets = [
      {
        label: 'Аналитическое решение',
        data: exact.map((y, idx) => ({ x: xs[idx], y })),
        borderColor: '#21d4fd',
        backgroundColor: 'rgba(33, 212, 253, 0.12)',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.12,
        yAxisID: 'y'
      },
      {
        label: 'Численное решение (метод стрельбы + RK4)',
        data: ys.map((y, idx) => ({ x: xs[idx], y })),
        borderColor: '#ff784f',
        backgroundColor: 'rgba(255, 120, 79, 0.18)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.12,
        yAxisID: 'y'
      }
    ];

    // Добавляем траектории для всех итераций с разными α
    const { iterations, cfg } = result;
    
    console.log(`Всего итераций: ${iterations.length}`);
    iterations.forEach((it, idx) => {
      console.log(`  Итерация ${idx}: α=${it.alpha.toFixed(6)}, finalY=${it.finalY.toFixed(6)}, boundaryError=${it.boundaryError.toExponential(3)}`);
    });
    
    // Показываем ВСЕ итерации как пунктирные линии
    // (включая ту, которая стала финальным решением - пусть будет дубликат)
    for (let i = 0; i < iterations.length; i += 1) {
      const alpha = iterations[i].alpha;
      const iterResult = window.ShootingLab.integrateForAlpha(alpha, cfg);
      const finalError = iterResult.boundaryError;
      const status = finalError > 0 ? 'Перелёт' : 'Недолёт';
      const statusEmoji = finalError > 0 ? '↗️' : '↘️';
      
      console.log(`  -> Добавляем на график: Итерация ${i}, α=${alpha.toFixed(6)}, статус=${status}`);
      
      datasets.push({
        label: `Итерация ${i}: α=${alpha.toFixed(4)} (${status} ${statusEmoji})`,
        data: iterResult.ys.map((y, idx) => ({ x: iterResult.xs[idx], y })),
        borderColor: finalError > 0 ? 'rgba(255, 99, 132, 0.6)' : 'rgba(54, 162, 235, 0.6)',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.12,
        borderDash: [5, 5],
        yAxisID: 'y'
      });
    }

    // Вычисляем диапазон для левой оси Y (решения)
    const allYValues = [...exact, ...ys];
    const minY = Math.min(...allYValues);
    const maxY = Math.max(...allYValues);
    const yPadding = (maxY - minY) * 0.1;

    // Добавляем маркеры значений α на правой оси
    const alphaValues = iterations.map(it => it.alpha);
    const minAlpha = Math.min(...alphaValues);
    const maxAlpha = Math.max(...alphaValues);
    const alphaPadding = (maxAlpha - minAlpha) * 0.1;
    
    datasets.push({
      label: 'Значения α (правая ось)',
      data: iterations.map((it, idx) => ({ 
        x: cfg.a + (cfg.b - cfg.a) * (idx / Math.max(1, iterations.length - 1)), 
        y: it.alpha 
      })),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.3)',
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
      yAxisID: 'y2',
      pointStyle: 'rectRot',
      fill: false
    });

    // Создаём кастомные опции с двумя осями Y
    const customOptions = {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      plugins: {
        legend: { 
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 10,
            font: { size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const { dataset } = context;
              const { x, y } = context.parsed;
              if (dataset.yAxisID === 'y2') {
                return `${dataset.label}: α=${y.toFixed(6)} (итерация ${context.dataIndex})`;
              }
              return `${dataset.label}: x=${x.toFixed(3)}, y=${y.toFixed(4)}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'x', font: { size: 13, weight: 'bold' } }
        },
        y: {
          type: 'linear',
          title: { display: true, text: 'y(x)', font: { size: 13, weight: 'bold' } },
          position: 'left',
          min: minY - yPadding,
          max: maxY + yPadding,
          ticks: {
            color: '#203a43'
          }
        },
        y2: {
          type: 'linear',
          title: { display: true, text: 'α = y\'(a)', font: { size: 13, weight: 'bold' } },
          position: 'right',
          min: minAlpha - alphaPadding,
          max: maxAlpha + alphaPadding,
          ticks: {
            color: '#10b981'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    };

    updateChart('solution', 'solutionChart', labels, datasets, 'y(x)', customOptions);
  };

  const renderErrorChart = (result) => {
    const xs = result.solution.xs;
    const absErrors = result.solution.absErrors;

    const labels = xs;
    const datasets = [
      {
        label: '|y числ − y аналит|',
        data: absErrors.map((e, idx) => ({ x: xs[idx], y: e })),
        borderColor: '#c33764',
        backgroundColor: 'rgba(195, 55, 100, 0.2)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.15
      }
    ];

    updateChart('error', 'errorChart', labels, datasets, '|ошибка|');
  };

  const renderIterationsTable = (result) => {
    const { iterations, cfg } = result;

    let html = `
      <tr>
        <th>k</th>
        <th>α<sub>k</sub> = y′(${cfg.a})</th>
        <th>y<sub>k</sub>(${cfg.b})</th>
        <th>y(${cfg.b}) задано</th>
        <th>Ошибка на правой границе</th>
      </tr>
    `;

    iterations.forEach((it, idx) => {
      html += `
        <tr>
          <td>${idx}</td>
          <td>${fmt(it.alpha, 6)}</td>
          <td>${fmt(it.finalY, 6)}</td>
          <td>${fmt(cfg.rightValue, 6)}</td>
          <td>${it.boundaryError.toExponential(3)}</td>
        </tr>
      `;
    });

    iterationsTable.innerHTML = html;
  };

  const renderIterationsErrorChart = (result) => {
    const { iterations } = result;
    const ks = iterations.map((_, idx) => idx);
    const absBoundary = iterations.map((it) => Math.abs(it.boundaryError));

    const datasets = [
      {
        label: '|y_k(b) − y(b)|',
        data: absBoundary.map((e, idx) => ({ x: ks[idx], y: e })),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1
      }
    ];

    updateChart('iterError', 'iterErrorChart', ks, datasets, '|ошибка на правой границе|');
  };

  const recalculate = () => {
    let h = Number(stepSlider.value);
    if (!Number.isFinite(h) || h <= 0) {
      h = shootingConfig.h;
      stepSlider.value = h;
      stepInput.value = h;
    } else {
      stepInput.value = h;
    }

    let tol = Number(tolInput.value);
    if (!Number.isFinite(tol) || tol <= 0) {
      tol = 1e-8;
      tolInput.value = tol;
    }

    let maxIter = Number(maxIterInput.value);
    if (!Number.isFinite(maxIter) || maxIter < 2) {
      maxIter = 8;
      maxIterInput.value = maxIter;
    }

    const result = solveShooting({
      h,
      tolerance: tol,
      maxIter
    });

    stepInfo.innerHTML = buildStepInfo(result.cfg);
    renderAnalyticChart(result.cfg);
    renderSolutionChart(result);
    renderErrorChart(result);
    renderIterationsTable(result);
    renderIterationsErrorChart(result);
  };

  renderProblemInfo();
  recalculate();

  const syncStepFromSlider = () => {
    stepInput.value = stepSlider.value;
    recalculate();
  };

  const syncStepFromInput = () => {
    let value = Number(stepInput.value);
    if (!Number.isFinite(value) || value <= 0) {
      value = shootingConfig.h;
    }
    const min = Number(stepSlider.min);
    const max = Number(stepSlider.max);
    const clamped = Math.min(max, Math.max(min, value));
    stepSlider.value = clamped;
    stepInput.value = clamped;
    recalculate();
  };

  stepSlider.addEventListener('input', syncStepFromSlider);
  stepInput.addEventListener('change', syncStepFromInput);
  recalcBtn.addEventListener('click', () => recalculate());
})();


