window.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Loading numerical integration graphs...');
    
    const a = -0.5;
    const b = 1.5;
    const h1 = 0.2;
    const h2 = 0.1;
    
    const exact = exactIntegral();
    
    const results_h1 = computeAllMethods(a, b, h1);
    const results_h2 = computeAllMethods(a, b, h2);
    
    const midpoint_rr = rungeRomberg(results_h1.midpoint, results_h2.midpoint, 2, 2);
    const trapezoid_rr = rungeRomberg(results_h1.trapezoid, results_h2.trapezoid, 2, 2);
    const simpson_rr = rungeRomberg(results_h1.simpson, results_h2.simpson, 2, 4);
    const euler_rr = rungeRomberg(results_h1.euler, results_h2.euler, 2, 2);
    
    console.log('Calculations complete:', {
      exact,
      h1: results_h1,
      h2: results_h2
    });
    
    function createFunctionChart() {
      const ctx = document.getElementById('functionChart');
      const points = [];
      const step = (b - a) / 200;
      
      for (let x = a; x <= b; x += step) {
        points.push({ x: x, y: f(x) });
      }
      
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'f(x) = [tg(x/2) + ln(x+1)] / [cos²(x-1) + 1]',
            data: points,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Подынтегральная функция на отрезке [${a}, ${b}]`,
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
                text: 'f(x)'
              }
            }
          }
        }
      });
      console.log('Function chart created');
    }
    
    function createComparisonH1Chart() {
      const ctx = document.getElementById('comparisonH1Chart');
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Средние\nпрямоугольники', 'Трапеции', 'Симпсон', 'Эйлер', 'Эталон'],
          datasets: [{
            label: 'Значение интеграла',
            data: [
              results_h1.midpoint,
              results_h1.trapezoid,
              results_h1.simpson,
              results_h1.euler,
              exact
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 206, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)'
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
              text: `Сравнение методов интегрирования (h = ${h1})`,
              font: { size: 16 }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Значение интеграла'
              }
            }
          }
        }
      });
      console.log('Comparison H1 chart created');
    }
    
    function createComparisonH2Chart() {
      const ctx = document.getElementById('comparisonH2Chart');
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Средние\nпрямоугольники', 'Трапеции', 'Симпсон', 'Эйлер', 'Эталон'],
          datasets: [{
            label: 'Значение интеграла',
            data: [
              results_h2.midpoint,
              results_h2.trapezoid,
              results_h2.simpson,
              results_h2.euler,
              exact
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 206, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)'
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
              text: `Сравнение методов интегрирования (h = ${h2})`,
              font: { size: 16 }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Значение интеграла'
              }
            }
          }
        }
      });
      console.log('Comparison H2 chart created');
    }
    
    function createErrorsChart() {
      const ctx = document.getElementById('errorsChart');
      
      const errors_h1 = {
        midpoint: Math.abs(results_h1.midpoint - exact),
        trapezoid: Math.abs(results_h1.trapezoid - exact),
        simpson: Math.abs(results_h1.simpson - exact),
        euler: Math.abs(results_h1.euler - exact)
      };
      
      const errors_h2 = {
        midpoint: Math.abs(results_h2.midpoint - exact),
        trapezoid: Math.abs(results_h2.trapezoid - exact),
        simpson: Math.abs(results_h2.simpson - exact),
        euler: Math.abs(results_h2.euler - exact)
      };
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Средние\nпрямоугольники', 'Трапеции', 'Симпсон', 'Эйлер'],
          datasets: [
            {
              label: `h = ${h1}`,
              data: [
                errors_h1.midpoint,
                errors_h1.trapezoid,
                errors_h1.simpson,
                errors_h1.euler
              ],
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 2
            },
            {
              label: `h = ${h2}`,
              data: [
                errors_h2.midpoint,
                errors_h2.trapezoid,
                errors_h2.simpson,
                errors_h2.euler
              ],
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Погрешности методов интегрирования',
              font: { size: 16 }
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          scales: {
            y: {
              type: 'logarithmic',
              title: {
                display: true,
                text: 'Абсолютная погрешность (log scale)'
              }
            }
          }
        }
      });
      console.log('Errors chart created');
    }
    
    function createRungeRombergChart() {
      const ctx = document.getElementById('rungeRombergChart');
      
      const errors_h2 = {
        midpoint: Math.abs(results_h2.midpoint - exact),
        trapezoid: Math.abs(results_h2.trapezoid - exact),
        simpson: Math.abs(results_h2.simpson - exact),
        euler: Math.abs(results_h2.euler - exact)
      };
      
      const errors_rr = {
        midpoint: Math.abs(midpoint_rr - exact),
        trapezoid: Math.abs(trapezoid_rr - exact),
        simpson: Math.abs(simpson_rr - exact),
        euler: Math.abs(euler_rr - exact)
      };
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Средние\nпрямоугольники', 'Трапеции', 'Симпсон', 'Эйлер'],
          datasets: [
            {
              label: `h = ${h2} (без уточнения)`,
              data: [
                errors_h2.midpoint,
                errors_h2.trapezoid,
                errors_h2.simpson,
                errors_h2.euler
              ],
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 2
            },
            {
              label: 'С уточнением Рунге-Ромберга',
              data: [
                errors_rr.midpoint,
                errors_rr.trapezoid,
                errors_rr.simpson,
                errors_rr.euler
              ],
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Эффект уточнения по методу Рунге-Ромберга',
              font: { size: 16 }
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          scales: {
            y: {
              type: 'logarithmic',
              title: {
                display: true,
                text: 'Абсолютная погрешность (log scale)'
              }
            }
          }
        }
      });
      console.log('Runge-Romberg chart created');
    }
    
    function fillResultsTable() {
      const table = document.getElementById('resultsTable');
      
      const errors_h1 = {
        midpoint: Math.abs(results_h1.midpoint - exact),
        trapezoid: Math.abs(results_h1.trapezoid - exact),
        simpson: Math.abs(results_h1.simpson - exact),
        euler: Math.abs(results_h1.euler - exact)
      };
      
      const errors_h2 = {
        midpoint: Math.abs(results_h2.midpoint - exact),
        trapezoid: Math.abs(results_h2.trapezoid - exact),
        simpson: Math.abs(results_h2.simpson - exact),
        euler: Math.abs(results_h2.euler - exact)
      };
      
      const errors_rr = {
        midpoint: Math.abs(midpoint_rr - exact),
        trapezoid: Math.abs(trapezoid_rr - exact),
        simpson: Math.abs(simpson_rr - exact),
        euler: Math.abs(euler_rr - exact)
      };
      
      let html = `
        <tr>
          <th>Метод</th>
          <th>h = ${h1}</th>
          <th>Погрешность</th>
          <th>h = ${h2}</th>
          <th>Погрешность</th>
          <th>Рунге-Ромберг</th>
          <th>Погрешность</th>
        </tr>
        <tr>
          <td><strong>Средние прямоугольники</strong></td>
          <td>${results_h1.midpoint.toFixed(8)}</td>
          <td>${errors_h1.midpoint.toExponential(4)}</td>
          <td>${results_h2.midpoint.toFixed(8)}</td>
          <td>${errors_h2.midpoint.toExponential(4)}</td>
          <td>${midpoint_rr.toFixed(8)}</td>
          <td>${errors_rr.midpoint.toExponential(4)}</td>
        </tr>
        <tr>
          <td><strong>Трапеции</strong></td>
          <td>${results_h1.trapezoid.toFixed(8)}</td>
          <td>${errors_h1.trapezoid.toExponential(4)}</td>
          <td>${results_h2.trapezoid.toFixed(8)}</td>
          <td>${errors_h2.trapezoid.toExponential(4)}</td>
          <td>${trapezoid_rr.toFixed(8)}</td>
          <td>${errors_rr.trapezoid.toExponential(4)}</td>
        </tr>
        <tr>
          <td><strong>Симпсон</strong></td>
          <td>${results_h1.simpson.toFixed(8)}</td>
          <td>${errors_h1.simpson.toExponential(4)}</td>
          <td>${results_h2.simpson.toFixed(8)}</td>
          <td>${errors_h2.simpson.toExponential(4)}</td>
          <td>${simpson_rr.toFixed(8)}</td>
          <td>${errors_rr.simpson.toExponential(4)}</td>
        </tr>
        <tr>
          <td><strong>Эйлер</strong></td>
          <td>${results_h1.euler.toFixed(8)}</td>
          <td>${errors_h1.euler.toExponential(4)}</td>
          <td>${results_h2.euler.toFixed(8)}</td>
          <td>${errors_h2.euler.toExponential(4)}</td>
          <td>${euler_rr.toFixed(8)}</td>
          <td>${errors_rr.euler.toExponential(4)}</td>
        </tr>
        <tr style="background: #f0f0f0; font-weight: bold;">
          <td colspan="7">Эталонное значение (Симпсон с h=0.00001): ${exact.toFixed(10)}</td>
        </tr>
      `;
      
      table.innerHTML = html;
      console.log('Results table filled');
    }
    
    createFunctionChart();
    createComparisonH1Chart();
    createComparisonH2Chart();
    createErrorsChart();
    createRungeRombergChart();
    fillResultsTable();
    
    console.log('All graphs and tables created successfully!');
  } catch (error) {
    console.error('Error creating graphs:', error);
    alert('Ошибка при создании графиков: ' + error.message);
  }
});

