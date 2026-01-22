import type { ChangelogEntry } from './changelogParser';
import { extractImpactData, calculateImpactMetrics, prepareCumulativeData } from './impactData';
import { createImpactChart } from './impactGraph';

/**
 * Renders the Impact Graph UI component
 */
export function renderImpactGraphUI(entries: ChangelogEntry[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'impact-graph-container';

  // Create header
  const header = document.createElement('div');
  header.className = 'impact-graph-header';
  
  const title = document.createElement('h2');
  title.textContent = '📊 Visual Impact Graph';
  header.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Track the evolution and growth of Chimera over time';
  subtitle.className = 'impact-graph-subtitle';
  header.appendChild(subtitle);

  container.appendChild(header);

  // Extract and prepare data
  const impactData = extractImpactData(entries);
  const cumulativeData = prepareCumulativeData(impactData);
  const metrics = calculateImpactMetrics(impactData);

  // Create metrics summary
  const metricsDiv = document.createElement('div');
  metricsDiv.className = 'impact-metrics';

  const metricsItems = [
    { label: 'Total Tests', value: metrics.totalTests, icon: '🧪' },
    { label: 'Total Files', value: metrics.totalFiles, icon: '📄' },
    { label: 'Avg Tests/Feature', value: metrics.averageTestsPerFeature.toFixed(1), icon: '📈' },
    { 
      label: 'Most Productive Day', 
      value: metrics.mostProductiveDay ? `Day ${metrics.mostProductiveDay.dayNumber}` : 'N/A',
      icon: '🏆'
    }
  ];

  metricsItems.forEach(item => {
    const metricCard = document.createElement('div');
    metricCard.className = 'metric-card';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'metric-icon';
    iconSpan.textContent = item.icon;
    metricCard.appendChild(iconSpan);

    const metricContent = document.createElement('div');
    metricContent.className = 'metric-content';

    const valueSpan = document.createElement('div');
    valueSpan.className = 'metric-value';
    valueSpan.textContent = item.value.toString();
    metricContent.appendChild(valueSpan);

    const labelSpan = document.createElement('div');
    labelSpan.className = 'metric-label';
    labelSpan.textContent = item.label;
    metricContent.appendChild(labelSpan);

    metricCard.appendChild(metricContent);
    metricsDiv.appendChild(metricCard);
  });

  container.appendChild(metricsDiv);

  // Create chart container
  const chartContainer = document.createElement('div');
  chartContainer.className = 'impact-chart-container';

  // Create and append SVG chart
  const svg = createImpactChart(cumulativeData);
  chartContainer.appendChild(svg);

  container.appendChild(chartContainer);

  // Add explanation
  const explanation = document.createElement('div');
  explanation.className = 'impact-explanation';
  explanation.innerHTML = `
    <p>
      <strong>How to read this graph:</strong> The chart shows cumulative growth over time. 
      Each point represents a day of evolution. Hover over data points to see details.
      The purple line tracks total tests added, while the blue line shows files modified.
    </p>
  `;
  container.appendChild(explanation);

  return container;
}

/**
 * Initializes the Impact Graph section in the DOM
 */
export function setupImpactGraph(entries: ChangelogEntry[]): void {
  const existingGraph = document.querySelector('.impact-graph-container');
  if (existingGraph) {
    existingGraph.remove();
  }

  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const graphUI = renderImpactGraphUI(entries);
  
  // Insert after the dashboard section
  const dashboardSection = document.querySelector('.dashboard-section');
  if (dashboardSection) {
    dashboardSection.insertAdjacentElement('afterend', graphUI);
  } else {
    app.appendChild(graphUI);
  }
}
