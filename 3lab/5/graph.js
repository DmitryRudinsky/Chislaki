// Скрипт для визуализации результатов

const a = -1.0;
const b = 1.0;
const h = 0.10;
const h_half = h / 2;

// Вычисляем результаты
const resultsH = computeOnInterval(a, b, h);
const resultsHHalf = computeOnInterval(a, b, h_half);

// Цвета для различных методов
const colors = {
  analytical: '#000000',
  method1: '#FF6384',
  method2: '#36A2EB',
  method3: '#FFCE56',
  method4: '#4BC0C0',
  method5: '#9966FF',
  method6: '#FF9F40',
  method7: '#C9CBCF'
};

const methodColors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#C9CBCF',
  '#E7E9ED'
];

let firstDerivativeChart = null;
let secondDerivativeChart = null;
let firstErrorChart = null;
let secondErrorChart = null;
let comparisonChart = null;

// График первой производной
function showFirstDerivativeChart(step) {
  const results = step === 'h' ? resultsH : resultsHHalf;
  const stepValue = step === 'h' ? h : h_half;
  
  // Обновляем активную вкладку
  const tabs = document.querySelectorAll('.chart-container:nth-of-type(2) .tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  tabs[step === 'h' ? 0 : 1].classList.add('active');
  
  const ctx = document.getElementById('firstDerivativeChart');
  
  if (firstDerivativeChart) {
    firstDerivativeChart.destroy();
  }
  
  const xValues = results.map(r => r.x);
  const analyticalValues = results.map(r => r.firstDerivative.analytical);
  
  const datasets = [{
    label: 'Аналитическая производная',
    data: analyticalValues,
    borderColor: colors.analytical,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 3,
    pointRadius: 0,
    borderDash: [5, 5]
  }];
  
  // Получаем все методы
  const methodNames = results[0].firstDerivative.methods.map(m => m.name);
  
  methodNames.forEach((name, idx) => {
    const methodData = results.map(r => {
      const method = r.firstDerivative.methods.find(m => m.name === name);
      return method ? method.value : null;
    });
    
    datasets.push({
      label: name,
      data: methodData,
      borderColor: methodColors[idx % methodColors.length],
      backgroundColor: methodColors[idx % methodColors.length] + '20',
      borderWidth: 2,
      pointRadius: 3
    });
  });
  
  firstDerivativeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xValues,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Первая производная (шаг = ${stepValue})`,
          font: { size: 16 }
        },
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'x'
          }
        },
        y: {
          title: {
            display: true,
            text: "y'"
          }
        }
      }
    }
  });
}

// График второй производной
function showSecondDerivativeChart(step) {
  const results = step === 'h' ? resultsH : resultsHHalf;
  const stepValue = step === 'h' ? h : h_half;
  
  // Обновляем активную вкладку
  const tabs = document.querySelectorAll('.chart-container:nth-of-type(3) .tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  tabs[step === 'h' ? 0 : 1].classList.add('active');
  
  const ctx = document.getElementById('secondDerivativeChart');
  
  if (secondDerivativeChart) {
    secondDerivativeChart.destroy();
  }
  
  const xValues = results.map(r => r.x);
  const analyticalValues = results.map(r => r.secondDerivative.analytical);
  
  const datasets = [{
    label: 'Аналитическая производная',
    data: analyticalValues,
    borderColor: colors.analytical,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 3,
    pointRadius: 0,
    borderDash: [5, 5]
  }];
  
  // Получаем все методы
  const methodNames = results[0].secondDerivative.methods.map(m => m.name);
  
  methodNames.forEach((name, idx) => {
    const methodData = results.map(r => {
      const method = r.secondDerivative.methods.find(m => m.name === name);
      return method ? method.value : null;
    });
    
    datasets.push({
      label: name,
      data: methodData,
      borderColor: methodColors[idx % methodColors.length],
      backgroundColor: methodColors[idx % methodColors.length] + '20',
      borderWidth: 2,
      pointRadius: 3
    });
  });
  
  secondDerivativeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xValues,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Вторая производная (шаг = ${stepValue})`,
          font: { size: 16 }
        },
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'x'
          }
        },
        y: {
          title: {
            display: true,
            text: "y''"
          }
        }
      }
    }
  });
}

// График погрешностей первой производной
function showFirstErrorChart(step) {
  const results = step === 'h' ? resultsH : resultsHHalf;
  const stepValue = step === 'h' ? h : h_half;
  
  // Обновляем активную вкладку
  const tabs = document.querySelectorAll('.chart-container:nth-of-type(4) .tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  tabs[step === 'h' ? 0 : 1].classList.add('active');
  
  const ctx = document.getElementById('firstErrorChart');
  
  if (firstErrorChart) {
    firstErrorChart.destroy();
  }
  
  const xValues = results.map(r => r.x);
  const methodNames = results[0].firstDerivative.methods.map(m => m.name);
  
  const datasets = methodNames.map((name, idx) => {
    const errorData = results.map(r => {
      const method = r.firstDerivative.methods.find(m => m.name === name);
      return method ? method.error : null;
    });
    
    return {
      label: name,
      data: errorData,
      borderColor: methodColors[idx % methodColors.length],
      backgroundColor: methodColors[idx % methodColors.length] + '20',
      borderWidth: 2,
      pointRadius: 3
    };
  });
  
  firstErrorChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xValues,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Погрешность первой производной (шаг = ${stepValue})`,
          font: { size: 16 }
        },
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'x'
          }
        },
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

// График погрешностей второй производной
function showSecondErrorChart(step) {
  const results = step === 'h' ? resultsH : resultsHHalf;
  const stepValue = step === 'h' ? h : h_half;
  
  // Обновляем активную вкладку
  const tabs = document.querySelectorAll('.chart-container:nth-of-type(5) .tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  tabs[step === 'h' ? 0 : 1].classList.add('active');
  
  const ctx = document.getElementById('secondErrorChart');
  
  if (secondErrorChart) {
    secondErrorChart.destroy();
  }
  
  const xValues = results.map(r => r.x);
  const methodNames = results[0].secondDerivative.methods.map(m => m.name);
  
  const datasets = methodNames.map((name, idx) => {
    const errorData = results.map(r => {
      const method = r.secondDerivative.methods.find(m => m.name === name);
      return method ? method.error : null;
    });
    
    return {
      label: name,
      data: errorData,
      borderColor: methodColors[idx % methodColors.length],
      backgroundColor: methodColors[idx % methodColors.length] + '20',
      borderWidth: 2,
      pointRadius: 3
    };
  });
  
  secondErrorChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xValues,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Погрешность второй производной (шаг = ${stepValue})`,
          font: { size: 16 }
        },
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'x'
          }
        },
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

// Вычисление средних погрешностей
function calculateAverageError(results, isFirstDerivative) {
  const errors = {};
  
  results.forEach(point => {
    const methods = isFirstDerivative ? point.firstDerivative.methods : point.secondDerivative.methods;
    methods.forEach(method => {
      if (!errors[method.name]) {
        errors[method.name] = [];
      }
      errors[method.name].push(method.error);
    });
  });
  
  const averages = {};
  for (const [name, errorArray] of Object.entries(errors)) {
    const sum = errorArray.reduce((acc, val) => acc + val, 0);
    averages[name] = sum / errorArray.length;
  }
  
  return averages;
}

// Заполнение таблиц средних погрешностей
function fillAverageErrorTables() {
  const avgErrorsFirstH = calculateAverageError(resultsH, true);
  const avgErrorsFirstHHalf = calculateAverageError(resultsHHalf, true);
  const avgErrorsSecondH = calculateAverageError(resultsH, false);
  const avgErrorsSecondHHalf = calculateAverageError(resultsHHalf, false);
  
  // Таблица для первой производной
  const tableFirst = document.getElementById('avgErrorsFirst');
  let htmlFirst = '<tr><th>Метод</th><th>Средняя погрешность (h)</th><th>Средняя погрешность (h/2)</th><th>Улучшение</th></tr>';
  
  for (const [name, errorH] of Object.entries(avgErrorsFirstH)) {
    const errorHHalf = avgErrorsFirstHHalf[name] || 0;
    const improvement = errorH / errorHHalf;
    htmlFirst += `<tr>
      <td>${name}</td>
      <td>${errorH.toExponential(4)}</td>
      <td>${errorHHalf.toExponential(4)}</td>
      <td>${improvement.toFixed(2)}×</td>
    </tr>`;
  }
  tableFirst.innerHTML = htmlFirst;
  
  // Таблица для второй производной
  const tableSecond = document.getElementById('avgErrorsSecond');
  let htmlSecond = '<tr><th>Метод</th><th>Средняя погрешность (h)</th><th>Средняя погрешность (h/2)</th><th>Улучшение</th></tr>';
  
  for (const [name, errorH] of Object.entries(avgErrorsSecondH)) {
    const errorHHalf = avgErrorsSecondHHalf[name] || 0;
    const improvement = errorH / errorHHalf;
    htmlSecond += `<tr>
      <td>${name}</td>
      <td>${errorH.toExponential(4)}</td>
      <td>${errorHHalf.toExponential(4)}</td>
      <td>${improvement.toFixed(2)}×</td>
    </tr>`;
  }
  tableSecond.innerHTML = htmlSecond;
}

// График сравнения шагов
function createComparisonChart() {
  const ctx = document.getElementById('comparisonChart');
  
  const avgErrorsFirstH = calculateAverageError(resultsH, true);
  const avgErrorsFirstHHalf = calculateAverageError(resultsHHalf, true);
  const avgErrorsSecondH = calculateAverageError(resultsH, false);
  const avgErrorsSecondHHalf = calculateAverageError(resultsHHalf, false);
  
  // Берём только центральные схемы для сравнения
  const methodsToCompare = [
    'Центральная разность (2 точки)',
    'Центральная схема (4 точки)',
    'Центральная разность (3 точки)',
    'Центральная схема (5 точек)'
  ];
  
  const labels = [];
  const dataH = [];
  const dataHHalf = [];
  
  methodsToCompare.forEach(method => {
    if (avgErrorsFirstH[method]) {
      labels.push(method + ' (1-я произв.)');
      dataH.push(avgErrorsFirstH[method]);
      dataHHalf.push(avgErrorsFirstHHalf[method]);
    }
  });
  
  methodsToCompare.forEach(method => {
    if (avgErrorsSecondH[method]) {
      labels.push(method + ' (2-я произв.)');
      dataH.push(avgErrorsSecondH[method]);
      dataHHalf.push(avgErrorsSecondHHalf[method]);
    }
  });
  
  comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Шаг h = 0.10',
        data: dataH,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2
      }, {
        label: 'Шаг h/2 = 0.05',
        data: dataHHalf,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Сравнение погрешностей при разных шагах',
          font: { size: 16 }
        },
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Метод'
          }
        },
        y: {
          type: 'logarithmic',
          title: {
            display: true,
            text: 'Средняя погрешность (логарифмическая шкала)'
          }
        }
      }
    }
  });
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  showFirstDerivativeChart('h');
  showSecondDerivativeChart('h');
  showFirstErrorChart('h');
  showSecondErrorChart('h');
  fillAverageErrorTables();
  createComparisonChart();
});

