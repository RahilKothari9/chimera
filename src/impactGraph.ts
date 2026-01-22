import type { ImpactDataPoint } from './impactData';

export interface GraphConfig {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  colors: {
    tests: string;
    files: string;
    grid: string;
    text: string;
  };
}

const DEFAULT_CONFIG: GraphConfig = {
  width: 800,
  height: 400,
  padding: { top: 40, right: 40, bottom: 60, left: 60 },
  colors: {
    tests: '#8b5cf6',
    files: '#3b82f6',
    grid: '#e5e7eb',
    text: '#374151'
  }
};

/**
 * Creates an SVG chart visualization of impact data
 */
export function createImpactChart(
  dataPoints: ImpactDataPoint[],
  config: Partial<GraphConfig> = {}
): SVGSVGElement {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const chartWidth = cfg.width - cfg.padding.left - cfg.padding.right;
  const chartHeight = cfg.height - cfg.padding.top - cfg.padding.bottom;

  // Create SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', cfg.width.toString());
  svg.setAttribute('height', cfg.height.toString());
  svg.setAttribute('viewBox', `0 0 ${cfg.width} ${cfg.height}`);
  svg.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  // Create main group with padding offset
  const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  mainGroup.setAttribute('transform', `translate(${cfg.padding.left}, ${cfg.padding.top})`);
  svg.appendChild(mainGroup);

  if (dataPoints.length === 0) {
    addText(mainGroup, chartWidth / 2, chartHeight / 2, 'No data available', {
      textAnchor: 'middle',
      fill: cfg.colors.text,
      fontSize: '16'
    });
    return svg;
  }

  // Calculate scales
  const maxTests = Math.max(...dataPoints.map(d => d.testsAdded), 1);
  const maxFiles = Math.max(...dataPoints.map(d => d.filesModified), 1);
  const maxValue = Math.max(maxTests, maxFiles);

  // Add grid lines
  addGridLines(mainGroup, chartWidth, chartHeight, maxValue, cfg.colors.grid);

  // Add axes
  addAxes(mainGroup, chartWidth, chartHeight, cfg.colors.text);

  // Add data lines
  addDataLine(mainGroup, dataPoints, chartWidth, chartHeight, maxValue, 'testsAdded', cfg.colors.tests);
  addDataLine(mainGroup, dataPoints, chartWidth, chartHeight, maxValue, 'filesModified', cfg.colors.files);

  // Add legend
  addLegend(mainGroup, chartWidth, cfg.colors);

  // Add labels
  addAxisLabels(mainGroup, chartWidth, chartHeight, cfg.colors.text);

  return svg;
}

function addGridLines(
  group: SVGGElement,
  width: number,
  height: number,
  maxValue: number,
  color: string
) {
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = height - (i / gridLines) * height;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', y.toString());
    line.setAttribute('x2', width.toString());
    line.setAttribute('y2', y.toString());
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-dasharray', '4,4');
    group.appendChild(line);

    // Add Y-axis labels
    const value = Math.round((i / gridLines) * maxValue);
    addText(group, -10, y + 4, value.toString(), {
      textAnchor: 'end',
      fill: '#6b7280',
      fontSize: '12'
    });
  }
}

function addAxes(group: SVGGElement, width: number, height: number, color: string) {
  // X-axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', '0');
  xAxis.setAttribute('y1', height.toString());
  xAxis.setAttribute('x2', width.toString());
  xAxis.setAttribute('y2', height.toString());
  xAxis.setAttribute('stroke', color);
  xAxis.setAttribute('stroke-width', '2');
  group.appendChild(xAxis);

  // Y-axis
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', '0');
  yAxis.setAttribute('y1', '0');
  yAxis.setAttribute('x2', '0');
  yAxis.setAttribute('y2', height.toString());
  yAxis.setAttribute('stroke', color);
  yAxis.setAttribute('stroke-width', '2');
  group.appendChild(yAxis);
}

function addDataLine(
  group: SVGGElement,
  dataPoints: ImpactDataPoint[],
  width: number,
  height: number,
  maxValue: number,
  key: 'testsAdded' | 'filesModified',
  color: string
) {
  if (dataPoints.length === 0) return;

  const points: string[] = [];
  const xStep = width / Math.max(dataPoints.length - 1, 1);

  dataPoints.forEach((dp, i) => {
    const x = i * xStep;
    const y = height - (dp[key] / maxValue) * height;
    points.push(`${x},${y}`);
  });

  // Create path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  path.setAttribute('points', points.join(' '));
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', '3');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  group.appendChild(path);

  // Add dots at each point
  dataPoints.forEach((dp, i) => {
    const x = i * xStep;
    const y = height - (dp[key] / maxValue) * height;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', y.toString());
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '2');
    circle.style.cursor = 'pointer';
    
    // Add tooltip on hover
    circle.addEventListener('mouseenter', () => {
      circle.setAttribute('r', '6');
      showTooltip(group, x, y, dp, key);
    });
    circle.addEventListener('mouseleave', () => {
      circle.setAttribute('r', '4');
      removeTooltip(group);
    });

    group.appendChild(circle);
  });
}

function showTooltip(
  group: SVGGElement,
  x: number,
  y: number,
  data: ImpactDataPoint,
  key: 'testsAdded' | 'filesModified'
) {
  const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  tooltip.setAttribute('class', 'impact-tooltip');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', (x + 10).toString());
  rect.setAttribute('y', (y - 40).toString());
  rect.setAttribute('width', '120');
  rect.setAttribute('height', '60');
  rect.setAttribute('fill', 'rgba(0, 0, 0, 0.8)');
  rect.setAttribute('rx', '4');
  tooltip.appendChild(rect);

  const label = key === 'testsAdded' ? 'Tests' : 'Files';
  const value = data[key];

  addText(tooltip, x + 15, y - 25, `Day ${data.dayNumber}`, {
    fill: 'white',
    fontSize: '12',
    fontWeight: 'bold'
  });
  addText(tooltip, x + 15, y - 10, data.date, {
    fill: '#aaa',
    fontSize: '10'
  });
  addText(tooltip, x + 15, y + 5, `${label}: ${value}`, {
    fill: 'white',
    fontSize: '12'
  });

  group.appendChild(tooltip);
}

function removeTooltip(group: SVGGElement) {
  const tooltip = group.querySelector('.impact-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

function addLegend(group: SVGGElement, width: number, colors: GraphConfig['colors']) {
  const legendY = -20;

  // Tests legend
  const testsLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  testsLine.setAttribute('x1', (width - 150).toString());
  testsLine.setAttribute('y1', legendY.toString());
  testsLine.setAttribute('x2', (width - 120).toString());
  testsLine.setAttribute('y2', legendY.toString());
  testsLine.setAttribute('stroke', colors.tests);
  testsLine.setAttribute('stroke-width', '3');
  group.appendChild(testsLine);

  addText(group, width - 115, legendY + 4, 'Cumulative Tests', {
    fill: colors.text,
    fontSize: '12'
  });

  // Files legend
  const filesLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  filesLine.setAttribute('x1', (width - 350).toString());
  filesLine.setAttribute('y1', legendY.toString());
  filesLine.setAttribute('x2', (width - 320).toString());
  filesLine.setAttribute('y2', legendY.toString());
  filesLine.setAttribute('stroke', colors.files);
  filesLine.setAttribute('stroke-width', '3');
  group.appendChild(filesLine);

  addText(group, width - 315, legendY + 4, 'Cumulative Files', {
    fill: colors.text,
    fontSize: '12'
  });
}

function addAxisLabels(group: SVGGElement, width: number, height: number, color: string) {
  // X-axis label
  addText(group, width / 2, height + 40, 'Evolution Timeline →', {
    textAnchor: 'middle',
    fill: color,
    fontSize: '14',
    fontWeight: '600'
  });

  // Y-axis label
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.textContent = '← Impact Metrics';
  yLabel.setAttribute('x', (-height / 2).toString());
  yLabel.setAttribute('y', '-40');
  yLabel.setAttribute('transform', 'rotate(-90)');
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('fill', color);
  yLabel.setAttribute('font-size', '14');
  yLabel.setAttribute('font-weight', '600');
  group.appendChild(yLabel);
}

function addText(
  parent: SVGElement,
  x: number,
  y: number,
  text: string,
  attrs: Record<string, string> = {}
) {
  const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  textEl.textContent = text;
  textEl.setAttribute('x', x.toString());
  textEl.setAttribute('y', y.toString());
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'textAnchor') {
      textEl.setAttribute('text-anchor', value);
    } else if (key === 'fontSize') {
      textEl.setAttribute('font-size', value);
    } else if (key === 'fontWeight') {
      textEl.setAttribute('font-weight', value);
    } else {
      textEl.setAttribute(key, value);
    }
  });

  parent.appendChild(textEl);
}
