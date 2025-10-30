window.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Loading Spline graphs...');
    
    const xStar = 9.625;
    const xs = [2.40, 3.422, 4.736, 6.634, 7.948, 9.116, 10.868, 12.182, 13.350, 15.248, 17.0];
    const ys = [8.269, 6.182, 6.748, 4.173, 3.181, 1.218, 0.346, 1.584, 4.276, 5.374, 7.921];

    const splines = buildNaturalCubicSpline(xs, ys);
    const segmentIdx = findSplineSegment(splines, xStar);
    const targetSpline = splines[segmentIdx];
    const valueAtStar = evaluateSpline(splines, xStar);

    console.log('Splines built:', splines.length, 'segments');

    function generateSplinePoints(splines, numPointsPerSegment = 50) {
      const allPoints = [];
      
      splines.forEach(spline => {
        const [x0, x1] = spline.interval;
        const points = [];
        for (let i = 0; i <= numPointsPerSegment; i++) {
          const t = i / numPointsPerSegment;
          const x = x0 + t * (x1 - x0);
          const dx = x - spline.x0;
          const y = spline.a + spline.b * dx + spline.c * dx * dx + spline.d * dx * dx * dx;
          points.push({ x, y });
        }
        allPoints.push(...points);
      });
      
      return allPoints;
    }

    const splinePoints = generateSplinePoints(splines);

    function createSplineChart() {
      const ctx = document.getElementById('splineChart');
      
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Кубический сплайн S₃(x)',
              data: splinePoints,
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              borderWidth: 3,
              pointRadius: 0,
              tension: 0
            },
            {
              label: 'Узловые точки',
              data: xs.map((x, i) => ({ x, y: ys[i] })),
              borderColor: '#FF6384',
              backgroundColor: '#FF6384',
              pointRadius: 8,
              pointHoverRadius: 10,
              showLine: false
            },
            {
              label: `x* = ${xStar}`,
              data: [{ x: xStar, y: valueAtStar }],
              borderColor: '#FF9F40',
              backgroundColor: '#FF9F40',
              pointRadius: 12,
              pointHoverRadius: 14,
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
              text: `S₃(${xStar}) = ${valueAtStar.toFixed(6)}`,
              font: { size: 18 }
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
                text: 'x',
                font: { size: 14 }
              }
            },
            y: {
              title: {
                display: true,
                text: 'y',
                font: { size: 14 }
              }
            }
          }
        }
      });
    }

    function createSegmentsChart() {
      const ctx = document.getElementById('segmentsChart');
      
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#9966FF', '#36A2EB'
      ];
      
      const datasets = [];
      
      splines.forEach((spline, idx) => {
        const [x0, x1] = spline.interval;
        const points = [];
        for (let i = 0; i <= 50; i++) {
          const t = i / 50;
          const x = x0 + t * (x1 - x0);
          const dx = x - spline.x0;
          const y = spline.a + spline.b * dx + spline.c * dx * dx + spline.d * dx * dx * dx;
          points.push({ x, y });
        }
        
        datasets.push({
          label: `Сегмент ${idx + 1}: [${x0.toFixed(2)}, ${x1.toFixed(2)}]`,
          data: points,
          borderColor: colors[idx % colors.length],
          backgroundColor: colors[idx % colors.length] + '20',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0
        });
      });
      
      datasets.push({
        label: 'Узловые точки',
        data: xs.map((x, i) => ({ x, y: ys[i] })),
        borderColor: '#000000',
        backgroundColor: '#000000',
        pointRadius: 6,
        showLine: false
      });
      
      datasets.push({
        label: `x* = ${xStar}`,
        data: [{ x: xStar, y: valueAtStar }],
        borderColor: '#FF9F40',
        backgroundColor: '#FF9F40',
        pointRadius: 12,
        showLine: false,
        pointStyle: 'star'
      });
      
      new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Сплайн разбит на ${splines.length} сегментов`,
              font: { size: 18 }
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
                text: 'x',
                font: { size: 14 }
              }
            },
            y: {
              title: {
                display: true,
                text: 'y',
                font: { size: 14 }
              }
            }
          }
        }
      });
    }

    function fillCoefficientsTable() {
      const table = document.getElementById('coefficientsTable');
      
      let html = `
        <tr>
          <th>Сегмент</th>
          <th>Интервал</th>
          <th>a</th>
          <th>b</th>
          <th>c</th>
          <th>d</th>
        </tr>
      `;
      
      splines.forEach((s, idx) => {
        const isTarget = idx === segmentIdx;
        const rowStyle = isTarget ? ' style="background: #fffacd;"' : '';
        html += `<tr${rowStyle}>
          <td><strong>${idx + 1}${isTarget ? ' ★' : ''}</strong></td>
          <td>[${s.interval[0].toFixed(3)}, ${s.interval[1].toFixed(3)}]</td>
          <td>${s.a.toFixed(6)}</td>
          <td>${s.b.toFixed(6)}</td>
          <td>${s.c.toFixed(6)}</td>
          <td>${s.d.toFixed(6)}</td>
        </tr>`;
      });
      
      html += `
        <tr style="background: #e7f3ff;">
          <td colspan="6">
            <strong>Сплайн для точки x* = ${xStar} (сегмент ${segmentIdx + 1}):</strong><br>
            ${splineSegmentToString(targetSpline)}
          </td>
        </tr>
      `;
      
      table.innerHTML = html;
    }

    function fillVerificationTable() {
      const table = document.getElementById('verificationTable');
      const verification = verifySplineAtNodes(splines, xs, ys);
      
      let html = `
        <tr>
          <th>Узел</th>
          <th>x</th>
          <th>y (исходное)</th>
          <th>S₃(x) (вычисленное)</th>
          <th>Погрешность</th>
        </tr>
      `;
      
      verification.forEach((v, idx) => {
        html += `<tr>
          <td>${idx + 1}</td>
          <td>${v.xi.toFixed(3)}</td>
          <td>${v.yi.toFixed(6)}</td>
          <td>${v.si.toFixed(6)}</td>
          <td>${v.diff.toExponential(3)}</td>
        </tr>`;
      });
      
      const maxError = Math.max(...verification.map(v => v.diff));
      html += `
        <tr style="background: #e7f3ff;">
          <td colspan="5">
            <strong>Максимальная погрешность:</strong> ${maxError.toExponential(3)}<br>
            <strong>Значение в точке x* = ${xStar}:</strong> S₃(${xStar}) = ${valueAtStar.toFixed(6)}
          </td>
        </tr>
      `;
      
      table.innerHTML = html;
    }

    createSplineChart();
    createSegmentsChart();
    fillCoefficientsTable();
    fillVerificationTable();
    
    console.log('All spline graphs created successfully!');
  } catch (error) {
    console.error('Error creating graphs:', error);
    alert('Ошибка при создании графиков: ' + error.message);
  }
});
