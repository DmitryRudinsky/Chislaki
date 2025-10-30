// Функции для визуализации системы нелинейных уравнений

// Функция для вычисления точек графика
function calculatePoints(func, xRange = [-5, 5], step = 0.01) {
  let x = [], y = [];
  for(let xi = xRange[0]; xi <= xRange[1]; xi += step) {
    x.push(xi);
    const yi = func(xi);
    y.push(yi);
  }
  return { x, y };
}

// Функция для создания layout графика
function createLayout(title = "График системы уравнений") {
  return {
    title: title,
    xaxis: {
      title: 'x₁',
      showgrid: true,
      gridwidth: 1,
      gridcolor: 'lightgray',
      zeroline: true,
      zerolinewidth: 2,
      zerolinecolor: 'black',
      range: [-3, 3]
    },
    yaxis: {
      title: 'x₂',
      showgrid: true,
      gridwidth: 1,
      gridcolor: 'lightgray',
      zeroline: true,
      zerolinewidth: 2,
      zerolinecolor: 'black',
      range: [-5, 10]
    },
    showlegend: true,
    margin: {
      l: 60,
      r: 50,
      t: 80,
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

// Построение графиков эквивалентных функций
function drawEquivalentFunctions() {
  // Вычисляем точки для всех функций
  const points1_pos = calculatePoints(equivalentFunction1, [-3, 3], 0.01);
  const points1_neg = calculatePoints(equivalentFunction1Negative, [-3, 3], 0.01);
  const points2 = calculatePoints(equivalentFunction2, [-3, 3], 0.01);
  
  // Очищаем null значения для положительной ветви
  const cleanPoints1_pos = {
    x: [],
    y: []
  };
  
  for (let i = 0; i < points1_pos.x.length; i++) {
    if (points1_pos.y[i] !== null && !isNaN(points1_pos.y[i])) {
      cleanPoints1_pos.x.push(points1_pos.x[i]);
      cleanPoints1_pos.y.push(points1_pos.y[i]);
    }
  }
  
  // Очищаем null значения для отрицательной ветви
  const cleanPoints1_neg = {
    x: [],
    y: []
  };
  
  for (let i = 0; i < points1_neg.x.length; i++) {
    if (points1_neg.y[i] !== null && !isNaN(points1_neg.y[i])) {
      cleanPoints1_neg.x.push(points1_neg.x[i]);
      cleanPoints1_neg.y.push(points1_neg.y[i]);
    }
  }
  
  const data = [
    {
      x: cleanPoints1_pos.x,
      y: cleanPoints1_pos.y,
      mode: 'lines',
      name: 'x₂ = +√(3 - x₁² + 2cos(x₁))',
      line: { color: 'blue', width: 3 }
    },
    {
      x: cleanPoints1_neg.x,
      y: cleanPoints1_neg.y,
      mode: 'lines',
      name: 'x₂ = -√(3 - x₁² + 2cos(x₁))',
      line: { color: 'blue', width: 3, dash: 'dash' }
    },
    {
      x: points2.x,
      y: points2.y,
      mode: 'lines',
      name: 'x₂ = e^(x₁²-1) - 3',
      line: { color: 'red', width: 3 }
    }
  ];
  
  Plotly.newPlot('equivalentPlot', data, createLayout('Графики эквивалентных функций'), createConfig());
}

// Поиск точек пересечения графиков
function findIntersectionPoints() {
  let intersections = [];
  
  // Получаем параметры поиска из UI (с проверкой существования элементов)
  const minInput = document.getElementById('search_x1_min');
  const maxInput = document.getElementById('search_x1_max');
  const stepInput = document.getElementById('search_step');
  
  const x1_min = minInput ? parseFloat(minInput.value) : -3;
  const x1_max = maxInput ? parseFloat(maxInput.value) : 3;
  const step = stepInput ? parseFloat(stepInput.value) : 0.01;
  const tolerance = 0.1;
  
  // Валидация параметров
  if (x1_min >= x1_max) {
    alert('⚠️ Ошибка: минимум должен быть меньше максимума!');
    return [];
  }
  
  if (step <= 0 || step > (x1_max - x1_min)) {
    alert('⚠️ Ошибка: шаг должен быть положительным и меньше длины интервала!');
    return [];
  }
  
  console.log(`Поиск корней на интервале [${x1_min}, ${x1_max}] с шагом ${step}`);
  
  for (let x1 = x1_min; x1 <= x1_max; x1 += step) {
    const y2_exp = equivalentFunction2(x1);
    
    // Проверяем пересечение с положительной ветвью
    const y2_pos = equivalentFunction1(x1);
    if (y2_pos !== null && Math.abs(y2_exp - y2_pos) < tolerance) {
      // Уточняем точку пересечения методом дихотомии
      const refined = refineIntersection(x1 - step, x1 + step, 'positive');
      if (refined) {
        intersections.push(refined);
      }
    }
    
    // Проверяем пересечение с отрицательной ветвью
    const y2_neg = equivalentFunction1Negative(x1);
    if (y2_neg !== null && Math.abs(y2_exp - y2_neg) < tolerance) {
      // Уточняем точку пересечения методом дихотомии
      const refined = refineIntersection(x1 - step, x1 + step, 'negative');
      if (refined) {
        intersections.push(refined);
      }
    }
  }
  
  // Удаляем дубликаты
  intersections = removeDuplicateIntersections(intersections);
  
  console.log(`Найдено корней: ${intersections.length}`);
  
  // Отображаем точки пересечения на графике
  displayIntersectionPoints(intersections);
  
  // Заполняем начальные приближения
  fillInitialApproximations(intersections);
  
  return intersections;
}

// Уточнение точки пересечения методом дихотомии
function refineIntersection(a, b, branch) {
  const epsilon = 1e-6;
  let iterations = 0;
  const maxIter = 50;
  
  function difference(x1) {
    const y2_exp = equivalentFunction2(x1);
    const y2_branch = branch === 'positive' ? equivalentFunction1(x1) : equivalentFunction1Negative(x1);
    return y2_branch !== null ? y2_exp - y2_branch : null;
  }
  
  let fa = difference(a);
  let fb = difference(b);
  
  if (fa === null || fb === null || fa * fb >= 0) {
    return null;
  }
  
  while (Math.abs(b - a) > epsilon && iterations < maxIter) {
    const c = (a + b) / 2;
    const fc = difference(c);
    
    if (fc === null) break;
    
    if (Math.abs(fc) < epsilon) {
      const x1 = c;
      const x2 = equivalentFunction2(x1);
      return { x1, x2, branch };
    }
    
    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
    
    iterations++;
  }
  
  const x1 = (a + b) / 2;
  const x2 = equivalentFunction2(x1);
  return { x1, x2, branch };
}

// Удаление дубликатов точек пересечения
function removeDuplicateIntersections(intersections) {
  const tolerance = 0.1;
  const unique = [];
  
  for (let i = 0; i < intersections.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < unique.length; j++) {
      if (Math.abs(intersections[i].x1 - unique[j].x1) < tolerance &&
          Math.abs(intersections[i].x2 - unique[j].x2) < tolerance) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      unique.push(intersections[i]);
    }
  }
  
  return unique;
}

// Отображение точек пересечения на графике
function displayIntersectionPoints(intersections) {
  // Удаляем старые точки пересечения, если они есть
  const plot = document.getElementById('equivalentPlot');
  if (plot && plot.data) {
    // Ищем trace с именем 'Точки пересечения (корни)'
    const traceIndices = [];
    plot.data.forEach((trace, index) => {
      if (trace.name === 'Точки пересечения (корни)') {
        traceIndices.push(index);
      }
    });
    // Удаляем в обратном порядке, чтобы индексы не сдвигались
    if (traceIndices.length > 0) {
      Plotly.deleteTraces('equivalentPlot', traceIndices);
    }
  }
  
  // Добавляем новые точки, если они есть
  if (intersections.length > 0) {
    const x_points = intersections.map(p => p.x1);
    const y_points = intersections.map(p => p.x2);
    
    const pointTrace = {
      x: x_points,
      y: y_points,
      mode: 'markers',
      name: 'Точки пересечения (корни)',
      marker: {
        color: 'green',
        size: 10,
        symbol: 'circle',
        line: { color: 'darkgreen', width: 2 }
      }
    };
    
    Plotly.addTraces('equivalentPlot', [pointTrace]);
  }
  
  // Обновляем анализ корней (всегда, даже если корни не найдены)
  updateRootsAnalysis(intersections);
}

// Обновление анализа корней
function updateRootsAnalysis(intersections) {
  let analysisHTML = '';
  
  // Получаем параметры поиска для отображения (с проверкой существования элементов)
  const minInput = document.getElementById('search_x1_min');
  const maxInput = document.getElementById('search_x1_max');
  const stepInput = document.getElementById('search_step');
  
  const x1_min = minInput ? parseFloat(minInput.value) : -3;
  const x1_max = maxInput ? parseFloat(maxInput.value) : 3;
  const step = stepInput ? parseFloat(stepInput.value) : 0.01;
  
  if (intersections.length === 0) {
    analysisHTML = `
      <strong style="color: red;">❌ Точки пересечения не найдены</strong><br>
      Интервал поиска: x₁ ∈ [${x1_min}, ${x1_max}], шаг: ${step}<br>
      Попробуйте изменить масштаб графика или расширить диапазон поиска.
    `;
  } else {
    analysisHTML = `
      <strong style="color: green;">✅ Найдено ${intersections.length} точек пересечения (корней системы)</strong><br>
      <em style="color: #666;">Интервал поиска: x₁ ∈ [${x1_min}, ${x1_max}], шаг: ${step}</em><br><br>
    `;
    
    intersections.forEach((point, index) => {
      const verification1 = F1(point.x1, point.x2);
      const verification2 = F2(point.x1, point.x2);
      
      analysisHTML += `
        <strong>Корень ${index + 1}:</strong><br>
        • x₁ ≈ ${point.x1.toFixed(4)}, x₂ ≈ ${point.x2.toFixed(4)}<br>
        • Проверка: F₁ ≈ ${verification1.toFixed(6)}, F₂ ≈ ${verification2.toFixed(6)}<br>
        • Ветвь: ${point.branch === 'positive' ? 'положительная' : 'отрицательная'}<br><br>
      `;
    });
    
    analysisHTML += `
      <div style="background: #e8f5e8; padding: 10px; border-radius: 3px; margin-top: 10px;">
        <strong>🎯 Начальные приближения автоматически заполнены!</strong><br>
        Используйте найденные точки как начальные приближения для численных методов.
      </div>
    `;
  }
  
  document.getElementById('roots_analysis').innerHTML = analysisHTML;
}

// Заполнение начальных приближений
function fillInitialApproximations(intersections) {
  if (intersections.length > 0) {
    const firstRoot = intersections[0];
    
    // Заполняем поля для всех методов
    document.getElementById('newton_x1_0').value = firstRoot.x1.toFixed(2);
    document.getElementById('newton_x2_0').value = firstRoot.x2.toFixed(2);
    
    document.getElementById('iteration_x1_0').value = firstRoot.x1.toFixed(2);
    document.getElementById('iteration_x2_0').value = firstRoot.x2.toFixed(2);
    
    document.getElementById('seidel_x1_0').value = firstRoot.x1.toFixed(2);
    document.getElementById('seidel_x2_0').value = firstRoot.x2.toFixed(2);
  }
}

// Обработчик нажатия клавиш
function handleKeyPress(event) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    drawEquivalentFunctions();
  }
}

// Функция инициализации
function initGraph() {
  // Строим графики при загрузке
  drawEquivalentFunctions();
}

// =========================
// РЕШЕНИЕ ЧИСЛЕННЫМИ МЕТОДАМИ
// =========================

// Решение методом Ньютона
function solveNewton() {
  const x1_0 = parseFloat(document.getElementById('newton_x1_0').value);
  const x2_0 = parseFloat(document.getElementById('newton_x2_0').value);
  const epsilon = parseFloat(document.getElementById('epsilon').value);
  const maxIter = parseInt(document.getElementById('maxIter').value);
  
  const result = newtonSystemMethod(x1_0, x2_0, epsilon, maxIter);
  displayResult('newton_result', result, 'Метод Ньютона');
}

// Решение методом простой итерации
function solveSimpleIteration() {
  const x1_0 = parseFloat(document.getElementById('iteration_x1_0').value);
  const x2_0 = parseFloat(document.getElementById('iteration_x2_0').value);
  const epsilon = parseFloat(document.getElementById('epsilon').value);
  const maxIter = parseInt(document.getElementById('maxIter').value);
  
  // Сначала пробуем основной метод
  let result = simpleIterationSystemMethod(x1_0, x2_0, epsilon, maxIter);
  
  // Если основной метод не сходится, пробуем альтернативный с релаксацией
  if (!result.converged) {
    console.log('Основной метод простой итерации не сошелся, пробуем с релаксацией...');
    result = simpleIterationAlternative(x1_0, x2_0, epsilon, maxIter);
    result.methodName = 'Простая итерация (с релаксацией)';
  } else {
    result.methodName = 'Простая итерация';
  }
  
  displayResult('iteration_result', result, result.methodName);
}

// Решение методом Зейделя
function solveSeidel() {
  const x1_0 = parseFloat(document.getElementById('seidel_x1_0').value);
  const x2_0 = parseFloat(document.getElementById('seidel_x2_0').value);
  const epsilon = parseFloat(document.getElementById('epsilon').value);
  const maxIter = parseInt(document.getElementById('maxIter').value);
  
  const result = seidelSystemMethod(x1_0, x2_0, epsilon, maxIter);
  displayResult('seidel_result', result, 'Метод Зейделя');
}

// Отображение результата
function displayResult(elementId, result, methodName) {
  const element = document.getElementById(elementId);
  
  element.innerHTML = `
    <strong>Корень:</strong> x₁ = ${result.x1.toFixed(6)}, x₂ = ${result.x2.toFixed(6)}<br>
    <strong>Итераций:</strong> ${result.iterations}<br>
    <strong>Погрешность:</strong> ||F(x)|| = ${result.finalError.toFixed(8)}<br>
    <strong>Сходимость:</strong> ${result.convergenceCheck}
  `;
}

// Решение всеми методами
function solveAllMethods() {
  solveNewton();
  solveSimpleIteration();
  solveSeidel();
  
  createSummaryTable();
  document.getElementById('all_results').style.display = 'block';
}

// Создание сводной таблицы результатов
function createSummaryTable() {
  const methods = [
    { 
      name: 'Ньютон', 
      func: () => newtonSystemMethod(
        parseFloat(document.getElementById('newton_x1_0').value),
        parseFloat(document.getElementById('newton_x2_0').value),
        parseFloat(document.getElementById('epsilon').value),
        parseInt(document.getElementById('maxIter').value)
      )
    },
    { 
      name: 'Простая итерация', 
      func: () => {
        const x1_0 = parseFloat(document.getElementById('iteration_x1_0').value);
        const x2_0 = parseFloat(document.getElementById('iteration_x2_0').value);
        const epsilon = parseFloat(document.getElementById('epsilon').value);
        const maxIter = parseInt(document.getElementById('maxIter').value);
        
        let result = simpleIterationSystemMethod(x1_0, x2_0, epsilon, maxIter);
        if (result.finalError > epsilon || !result.convergenceCheck.includes('✅')) {
          result = simpleIterationAlternative(x1_0, x2_0, epsilon, maxIter);
          result.methodName = 'Простая итерация (релаксация)';
        } else {
          result.methodName = 'Простая итерация';
        }
        return result;
      }
    },
    { 
      name: 'Зейдель', 
      func: () => seidelSystemMethod(
        parseFloat(document.getElementById('seidel_x1_0').value),
        parseFloat(document.getElementById('seidel_x2_0').value),
        parseFloat(document.getElementById('epsilon').value),
        parseInt(document.getElementById('maxIter').value)
      )
    }
  ];
  
  let tableHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 10px;">Метод</th>
          <th style="border: 1px solid #ddd; padding: 10px;">x₁</th>
          <th style="border: 1px solid #ddd; padding: 10px;">x₂</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Итерации</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Погрешность</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Сходимость</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  methods.forEach(method => {
    const result = method.func();
    const convergenceIcon = result.converged ? '✅' : (result.convergenceCheck.includes('⚠️') ? '⚠️' : '❌');
    
    const displayName = result.methodName || method.name;
    
    tableHTML += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${displayName}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${result.x1 ? result.x1.toFixed(6) : 'Не найден'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${result.x2 ? result.x2.toFixed(6) : 'Не найден'}</td>
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
