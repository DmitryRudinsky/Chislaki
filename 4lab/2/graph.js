(() => {
  const problemInfo = document.getElementById('problemInfo');
  const segmentsSlider = document.getElementById('segmentsSlider');
  const segmentsInput = document.getElementById('segmentsInput');
  const stepInfo = document.getElementById('stepInfo');
  const recalcBtn = document.getElementById('recalculateBtn');
  const summaryTable = document.getElementById('summaryTable');
  const firstOrderMetrics = document.getElementById('firstOrderMetrics');
  const secondOrderMetrics = document.getElementById('secondOrderMetrics');

  const formatter = (value, digits = 4) => value.toFixed(digits);

  const renderProblemInfo = () => {
    const { a, b, leftDerivative, rightValue } = BVP.config;
    problemInfo.innerHTML = `
      <h2>Краевая задача #29</h2>
      <div class="info-grid">
        <div class="info-card">
          <strong>Дифференциальное уравнение</strong>
          <p>4y''·sin²x + 4y'·sinx·cosx − (17sin²x + 1)·y = 0</p>
          <p>Стандартный вид: y'' + cot(x)·y' − ((17sin²x + 1)/(4sin²x)) · y = 0</p>
        </div>
        <div class="info-card">
          <strong>Граничные условия</strong>
          <p>y′(${a}) = ${leftDerivative}</p>
          <p>y(${b}) = ${rightValue}</p>
          <p>N регулируется пользователем (12 ≤ N ≤ 360), h = (b − a)/N.</p>
        </div>
        <div class="info-card">
          <strong>Аналитическое решение</strong>
          <p>y(x) = |sin x|<sup>-1/2</sup> · (e<sup>2x</sup> + e<sup>-2x</sup>)</p>
          <p>Используется как эталон для оценки ошибок.</p>
        </div>
      </div>
    `;
  };

  const charts = {
    solutions: null,
    absError: null,
    relError: null,
    diff: null
  };

  const createLineOptions = (yTitle) => ({
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${formatter(context.parsed.y, 4)}`;
          }
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'x' } },
      y: { title: { display: true, text: yTitle } }
    }
  });

  const updateChartInstance = (key, canvasId, labels, datasets, yTitle) => {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (charts[key]) {
      charts[key].data.labels = labels;
      charts[key].data.datasets = datasets;
      charts[key].options.scales.y.title.text = yTitle;
      charts[key].update();
      return;
    }

    charts[key] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: createLineOptions(yTitle)
    });
  };

  const updateSolutionsChart = (grid, bundle) => {
    updateChartInstance(
      'solutions',
      'solutionsChart',
      grid.xs,
      [
        {
          label: 'Аналитическое решение',
          data: bundle.exact,
          borderColor: '#ff5f6d',
          backgroundColor: 'rgba(255,95,109,0.15)',
          borderWidth: 3,
          tension: 0.25
        },
        {
          label: '1-й порядок условий',
          data: bundle.approximations[0].values,
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74,144,226,0.2)',
          borderWidth: 3,
          borderDash: [8, 4],
          tension: 0.2
        },
        {
          label: '2-й порядок условий',
          data: bundle.approximations[1].values,
          borderColor: '#50c878',
          backgroundColor: 'rgba(80,200,120,0.2)',
          borderWidth: 3,
          borderDash: [4, 4],
          tension: 0.2
        }
      ],
      'y(x)'
    );
  };

  const updateAbsErrorChart = (grid, bundle) => {
    updateChartInstance(
      'absError',
      'absErrorChart',
      grid.xs,
      [
        {
          label: '|e| (1-й порядок)',
          data: bundle.approximations[0].stats.absErrors,
          borderColor: '#ff9500',
          backgroundColor: 'rgba(255,149,0,0.2)',
          borderWidth: 3,
          tension: 0.2
        },
        {
          label: '|e| (2-й порядок)',
          data: bundle.approximations[1].stats.absErrors,
          borderColor: '#d946ef',
          backgroundColor: 'rgba(217,70,239,0.2)',
          borderWidth: 3,
          borderDash: [6, 3],
          tension: 0.2
        }
      ],
      '|y числ − y аналит|'
    );
  };

  const updateRelErrorChart = (grid, bundle) => {
    const computeRelative = (absErrors) =>
      absErrors.map((val, idx) => val / Math.max(Math.abs(bundle.exact[idx]), 1e-8));

    updateChartInstance(
      'relError',
      'relErrorChart',
      grid.xs,
      [
        {
          label: 'Отн. погрешность (1-й)',
          data: computeRelative(bundle.approximations[0].stats.absErrors),
          borderColor: '#0891b2',
          backgroundColor: 'rgba(8,145,178,0.2)',
          borderWidth: 3,
          tension: 0.2
        },
        {
          label: 'Отн. погрешность (2-й)',
          data: computeRelative(bundle.approximations[1].stats.absErrors),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.2)',
          borderWidth: 3,
          borderDash: [6, 3],
          tension: 0.2
        }
      ],
      '|e| / |y аналит|'
    );
  };

  const updateDiffChart = (grid, bundle) => {
    const differences = bundle.approximations[0].values.map(
      (val, idx) => val - bundle.approximations[1].values[idx]
    );

    updateChartInstance(
      'diff',
      'diffChart',
      grid.xs,
      [
        {
          label: 'y(1-й порядок) − y(2-й порядок)',
          data: differences,
          borderColor: '#845ef7',
          backgroundColor: 'rgba(132,94,247,0.25)',
          borderWidth: 2,
          tension: 0.2
        }
      ],
      'Разность решений'
    );
  };

  const renderMetricsCard = (element, title, stats) => {
    element.innerHTML = `
      <h4>${title}</h4>
      <div class="metric-list">
        <span>‖e‖<sub>∞</sub> = ${formatter(stats.maxAbs, 4)}</span>
        <span>Средняя |e| = ${formatter(stats.avgAbs, 4)}</span>
        <span>RMS(e) = ${formatter(stats.rms, 4)}</span>
      </div>
    `;
  };

  const renderTable = (grid, bundle) => {
    const [firstApprox, secondApprox] = bundle.approximations;
    const header = `
      <tr>
        <th>k</th>
        <th>x<sub>k</sub></th>
        <th>y<sub>аналит.</sub></th>
        <th>y<sub>h</sub> (1-й)</th>
        <th>|e| (1-й)</th>
        <th>y<sub>h</sub> (2-й)</th>
        <th>|e| (2-й)</th>
      </tr>
    `;

    const rows = grid.xs.map((x, idx) => {
      const exact = bundle.exact[idx];
      const first = firstApprox.values[idx];
      const second = secondApprox.values[idx];
      const err1 = Math.abs(first - exact);
      const err2 = Math.abs(second - exact);
      return `
        <tr>
          <td>${idx}</td>
          <td>${formatter(x, 3)}</td>
          <td>${formatter(exact, 3)}</td>
          <td>${formatter(first, 3)}</td>
          <td>${formatter(err1, 3)}</td>
          <td>${formatter(second, 3)}</td>
          <td>${formatter(err2, 3)}</td>
        </tr>
      `;
    }).join('');

    summaryTable.innerHTML = header + rows;
  };

  const updateStepInfo = (grid) => {
    stepInfo.innerHTML = `
      <strong>Интервал:</strong> [${BVP.config.a}; ${BVP.config.b}] ·
      <strong>N:</strong> ${grid.n} сегм. ·
      <strong>h:</strong> ${formatter(grid.h, 5)} ·
      <strong>Узлов:</strong> ${grid.n + 1}
    `;
  };

  const recalculate = () => {
    const segments = Number(segmentsSlider.value);
    const bundle = BVP.solveBundle(segments);
    const grid = bundle.grid;

    updateStepInfo(grid);
    updateSolutionsChart(grid, bundle);
    updateAbsErrorChart(grid, bundle);
    updateRelErrorChart(grid, bundle);
    updateDiffChart(grid, bundle);
    renderMetricsCard(firstOrderMetrics, '1-й порядок аппроксимации условий', bundle.approximations[0].stats);
    renderMetricsCard(secondOrderMetrics, '2-й порядок аппроксимации условий', bundle.approximations[1].stats);
    renderTable(grid, bundle);
  };

  renderProblemInfo();
  recalculate();

  const syncSegments = (value) => {
    const min = Number(segmentsSlider.min);
    const max = Number(segmentsSlider.max);
    const clamped = Math.min(max, Math.max(min, Math.round(value)));
    segmentsSlider.value = clamped;
    segmentsInput.value = clamped;
    recalculate();
  };

  segmentsSlider.addEventListener('input', () => {
    segmentsInput.value = segmentsSlider.value;
    recalculate();
  });

  segmentsInput.addEventListener('change', () => {
    const value = Number(segmentsInput.value);
    if (Number.isNaN(value)) {
      segmentsInput.value = segmentsSlider.value;
      return;
    }
    syncSegments(value);
  });

  recalcBtn.addEventListener('click', () => recalculate());
})();

