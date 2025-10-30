// Функция для вычисления точек графика
function calculatePoints(expr) {
  let x = [], y = [];
  for(let i = -10000; i <= 10000; i++) {
    let xi = i * 0.01;
    x.push(xi);
    try {
      y.push(eval(expr.replace(/x/g, '(' + xi + ')')));
    } catch(e) { 
      y.push(null); 
    }
  }
  return { x, y };
}

// Функция для создания layout графика
function createLayout() {
  return {
    xaxis: {
      scaleanchor: 'y',
      scaleratio: 1,
      showgrid: true,
      gridwidth: 1,
      gridcolor: 'lightgray',
      zeroline: true,
      zerolinewidth: 2,
      zerolinecolor: 'black',
      range: [-5, 5]
    },
    yaxis: {
      showgrid: true,
      gridwidth: 1,
      gridcolor: 'lightgray',
      zeroline: true,
      zerolinewidth: 2,
      zerolinecolor: 'black',
      range: [-5, 5]
    },
    showlegend: true,
    margin: {
      l: 50,
      r: 50,
      t: 50,
      b: 50
    },
    dragmode: 'pan',
    scrollZoom: true,
    doubleClick: 'reset+autosize'
  };
}

// Функция для создания config графика
function createConfig() {
  return {
    scrollZoom: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToAdd: [
      {
        name: 'Pan',
        icon: Plotly.Icons.pan,
        direction: 'up',
        click: function(gd) {
          Plotly.relayout(gd, {'dragmode': 'pan'});
        }
      },
      {
        name: 'Zoom',
        icon: Plotly.Icons.zoomin,
        direction: 'up', 
        click: function(gd) {
          Plotly.relayout(gd, {'dragmode': 'zoom'});
        }
      }
    ],
    modeBarButtonsToRemove: ['lasso2d', 'select2d']
  };
}

// Универсальная функция для построения конкретного графика
function drawSpecificGraph(graphNumber) {
  const expr = document.getElementById(`func${graphNumber}`).value;
  if (!expr.trim()) return;
  
  const points = calculatePoints(expr);
  const data = [{
    x: points.x,
    y: points.y,
    mode: 'lines',
    name: `f(x) = ${expr}`,
    line: { color: 'blue', width: 2 }
  }];
  
  Plotly.newPlot(`plot${graphNumber}`, data, createLayout(), createConfig());
}

// Обработчик нажатия клавиш
function handleKeyPress(event, graphNumber) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    drawSpecificGraph(graphNumber);
  }
}

// Функция инициализации
function initGraph() {
  // Строим первый график при загрузке
  drawSpecificGraph(1);
}

// Автоматический анализ корней
function analyzeRoots() {
  const expr = document.getElementById('func1').value;
  
  // Читаем параметры поиска из полей ввода
  const searchMin = parseFloat(document.getElementById('search_min').value);
  const searchMax = parseFloat(document.getElementById('search_max').value);
  const searchStep = parseFloat(document.getElementById('search_step').value);
  
  // Проверка корректности параметров
  if (isNaN(searchMin) || isNaN(searchMax) || isNaN(searchStep)) {
    document.getElementById('roots_analysis').innerHTML = 
      '<strong style="color: red;">❌ Ошибка: некорректные параметры поиска</strong>';
    return;
  }
  
  if (searchMin >= searchMax) {
    document.getElementById('roots_analysis').innerHTML = 
      '<strong style="color: red;">❌ Ошибка: начало интервала должно быть меньше конца</strong>';
    return;
  }
  
  if (searchStep <= 0 || searchStep > (searchMax - searchMin)) {
    document.getElementById('roots_analysis').innerHTML = 
      '<strong style="color: red;">❌ Ошибка: некорректный шаг поиска</strong>';
    return;
  }
  
  if (searchStep < 0.0001) {
    document.getElementById('roots_analysis').innerHTML = 
      '<strong style="color: red;">❌ Ошибка: шаг не может быть меньше 0.0001</strong><br>' +
      'Слишком малый шаг может привести к очень долгому вычислению.';
    return;
  }
  
  function evaluateFunction(x) {
    try {
      return eval(expr.replace(/x/g, '(' + x + ')'));
    } catch(e) {
      return null;
    }
  }
  
  let roots = [];
  let intervals = [];
  
  // Вычисляем количество шагов
  const numSteps = Math.floor((searchMax - searchMin) / searchStep);
  
  for(let i = 0; i < numSteps; i++) {
    let x1 = searchMin + i * searchStep;
    let x2 = searchMin + (i + 1) * searchStep;
    let f1 = evaluateFunction(x1);
    let f2 = evaluateFunction(x2);
    
    if (f1 !== null && f2 !== null && f1 * f2 < 0) {
      intervals.push({a: x1, b: x2, fa: f1, fb: f2});
      roots.push((x1 + x2) / 2); // Приближенное значение корня
    }
  }
  
  let analysisHTML = '';
  
  if (intervals.length === 0) {
    analysisHTML = `
      <strong style="color: red;">❌ Корни не найдены в диапазоне [${searchMin}, ${searchMax}] с шагом ${searchStep}</strong><br>
      Попробуйте изменить параметры поиска: расширить диапазон или уменьшить шаг.
    `;
  } else {
    analysisHTML = `
      <strong style="color: green;">✅ Найдено ${intervals.length} интервал(ов) изоляции корней</strong><br>
      <span style="color: #666; font-size: 0.9em;">Диапазон поиска: [${searchMin}, ${searchMax}], шаг: ${searchStep}</span><br><br>
    `;
    
    intervals.forEach((interval, index) => {
      analysisHTML += `
        <strong>Корень ${index + 1}:</strong><br>
        • Интервал: [${interval.a.toFixed(6)}, ${interval.b.toFixed(6)}]<br>
        • f(${interval.a.toFixed(6)}) = ${interval.fa.toFixed(6)}<br>
        • f(${interval.b.toFixed(6)}) = ${interval.fb.toFixed(6)}<br>
        • Приближенное значение: x ≈ ${roots[index].toFixed(6)}<br>
        • Рекомендуемое начальное приближение: x₀ = ${roots[index].toFixed(1)}<br><br>
      `;
    });
    
    // Автоматически заполняем поля начальных приближений
    if (roots.length >= 1) {
      // Для первого корня
      document.getElementById('bisection_a').value = intervals[0].a.toFixed(1);
      document.getElementById('bisection_b').value = intervals[0].b.toFixed(1);
      document.getElementById('newton_a').value = intervals[0].a.toFixed(1);
      document.getElementById('newton_b').value = intervals[0].b.toFixed(1);
      document.getElementById('secant_x0').value = intervals[0].a.toFixed(1);
      document.getElementById('secant_x1').value = intervals[0].b.toFixed(1);
      document.getElementById('chord_a').value = intervals[0].a.toFixed(1);
      document.getElementById('chord_b').value = intervals[0].b.toFixed(1);
      document.getElementById('iteration_a').value = intervals[0].a.toFixed(1);
      document.getElementById('iteration_b').value = intervals[0].b.toFixed(1);
      
      analysisHTML += `
        <div style="background: #e8f5e8; padding: 10px; border-radius: 3px; margin-top: 10px;">
          <strong>🎯 Начальные приближения автоматически заполнены для первого корня!</strong><br>
          Для анализа других корней измените значения в полях ввода методов.
        </div>
      `;
    }
  }
  
  document.getElementById('roots_analysis').innerHTML = analysisHTML;
}

// =========================
// ЧИСЛЕННЫЕ МЕТОДЫ
// =========================

// Решение методом дихотомии
function solveBisection() {
  const a = parseFloat(document.getElementById('bisection_a').value);
  const b = parseFloat(document.getElementById('bisection_b').value);
  const epsilon = parseFloat(document.getElementById('epsilon').value);
  const maxIter = parseInt(document.getElementById('maxIter').value);
  
  const result = bisectionMethod(a, b, epsilon, maxIter);
  displayResult('bisection_result', result, 'Дихотомия');
}

// Решение методом Ньютона
function solveNewton() {
  const a = parseFloat(document.getElementById('newton_a').value);
  const b = parseFloat(document.getElementById('newton_b').value);
  const epsilon = parseFloat(document.getElementById('epsilon').value);
  const maxIter = parseInt(document.getElementById('maxIter').value);
  
  const result = newtonMethod(a, b, epsilon, maxIter);
  displayResult('newton_result', result, 'Ньютон');
}

// Решение методом секущих
function solveSecant() {
  const x0 = parseFloat(document.getElementById('secant_x0').value);
  const x1 = parseFloat(document.getElementById('secant_x1').value);
  const epsilon = parseFloat(document.getElementById('epsilon').value);
  const maxIter = parseInt(document.getElementById('maxIter').value);
  
  const result = secantMethod(x0, x1, epsilon, maxIter);
  displayResult('secant_result', result, 'Секущие');
}

// Решение методом хорд
function solveChord() {
  const a = parseFloat(document.getElementById('chord_a').value);
  const b = parseFloat(document.getElementById('chord_b').value);
  const epsilon = parseFloat(document.getElementById('epsilon').value);
  const maxIter = parseInt(document.getElementById('maxIter').value);
  
  const result = chordMethod(a, b, epsilon, maxIter);
  displayResult('chord_result', result, 'Хорды');
}

// Решение методом простой итерации
function solveIteration() {
  const a = parseFloat(document.getElementById('iteration_a').value);
  const b = parseFloat(document.getElementById('iteration_b').value);
  const epsilon = parseFloat(document.getElementById('epsilon').value);
  const maxIter = parseInt(document.getElementById('maxIter').value);
  
  const result = simpleIterationMethod(a, b, epsilon, maxIter);
  displayResult('iteration_result', result, 'Простая итерация');
}

// Отображение результата
function displayResult(elementId, result, methodName) {
  const element = document.getElementById(elementId);
  
  if (!result.root) {
    element.innerHTML = `<strong style="color: red;">Метод не сходится</strong><br>${result.convergenceCheck}`;
    return;
  }
  
  element.innerHTML = `
    <strong>Корень:</strong> x = ${result.root.toFixed(6)}<br>
    <strong>Итераций:</strong> ${result.iterations}<br>
    <strong>Погрешность:</strong> |f(x)| = ${result.finalError.toFixed(8)}<br>
    <strong>Сходимость:</strong> ${result.convergenceCheck}
  `;
}

// Решение всеми методами
function solveAllMethods() {
  // Решаем всеми методами
  solveBisection();
  solveNewton();
  solveSecant();
  solveChord();
  solveIteration();
  
  // Создаем сводную таблицу
  createSummaryTable();
  
  // Показываем блок результатов
  document.getElementById('all_results').style.display = 'block';
}

// Создание сводной таблицы результатов
function createSummaryTable() {
  const methods = [
    { name: 'Дихотомия', id: 'bisection', func: () => bisectionMethod(
      parseFloat(document.getElementById('bisection_a').value),
      parseFloat(document.getElementById('bisection_b').value),
      parseFloat(document.getElementById('epsilon').value),
      parseInt(document.getElementById('maxIter').value)
    )},
    { name: 'Ньютон', id: 'newton', func: () => newtonMethod(
      parseFloat(document.getElementById('newton_a').value),
      parseFloat(document.getElementById('newton_b').value),
      parseFloat(document.getElementById('epsilon').value),
      parseInt(document.getElementById('maxIter').value)
    )},
    { name: 'Секущие', id: 'secant', func: () => secantMethod(
      parseFloat(document.getElementById('secant_x0').value),
      parseFloat(document.getElementById('secant_x1').value),
      parseFloat(document.getElementById('epsilon').value),
      parseInt(document.getElementById('maxIter').value)
    )},
    { name: 'Хорды', id: 'chord', func: () => chordMethod(
      parseFloat(document.getElementById('chord_a').value),
      parseFloat(document.getElementById('chord_b').value),
      parseFloat(document.getElementById('epsilon').value),
      parseInt(document.getElementById('maxIter').value)
    )},
    { name: 'Простая итерация', id: 'iteration', func: () => simpleIterationMethod(
      parseFloat(document.getElementById('iteration_a').value),
      parseFloat(document.getElementById('iteration_b').value),
      parseFloat(document.getElementById('epsilon').value),
      parseInt(document.getElementById('maxIter').value)
    )}
  ];
  
  let tableHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 10px;">Метод</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Корень</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Итерации</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Погрешность</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Сходимость</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  methods.forEach(method => {
    const result = method.func();
    const convergenceIcon = result.convergenceCheck.includes('✅') ? '✅' : 
                           result.convergenceCheck.includes('⚠️') ? '⚠️' : '❌';
    
    tableHTML += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${method.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${result.root ? result.root.toFixed(6) : 'Не найден'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${result.iterations}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${result.finalError ? result.finalError.toFixed(8) : '-'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${convergenceIcon}</td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  document.getElementById('results_table').innerHTML = tableHTML;
}