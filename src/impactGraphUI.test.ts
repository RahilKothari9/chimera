import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderImpactGraphUI, setupImpactGraph } from './impactGraphUI';
import type { ChangelogEntry } from './changelogParser';

describe('renderImpactGraphUI', () => {
  let mockEntries: ChangelogEntry[];

  beforeEach(() => {
    mockEntries = [
      {
        date: '2026-01-19',
        day: '1',
        feature: 'Evolution Timeline Tracker',
        description: 'Added 5 comprehensive tests',
        filesModified: 'timeline.ts, timeline.test.ts'
      },
      {
        date: '2026-01-20',
        day: '2',
        feature: 'Interactive Statistics Dashboard',
        description: 'Implemented with 10 tests',
        filesModified: 'dashboard.ts, dashboard.test.ts, statistics.ts'
      },
      {
        date: '2026-01-21',
        day: '3',
        feature: 'Search and Filter',
        description: 'Added 29 comprehensive tests',
        filesModified: 'search.ts, searchUI.ts, search.test.ts, searchUI.test.ts'
      }
    ];
  });

  it('should create impact graph container', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    expect(element.className).toBe('impact-graph-container');
  });

  it('should have a header with title and subtitle', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const title = element.querySelector('h2');
    expect(title?.textContent).toBe('📊 Visual Impact Graph');
    
    const subtitle = element.querySelector('.impact-graph-subtitle');
    expect(subtitle?.textContent).toContain('Track the evolution');
  });

  it('should create metrics summary', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const metrics = element.querySelector('.impact-metrics');
    expect(metrics).toBeTruthy();
  });

  it('should display metric cards', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const metricCards = element.querySelectorAll('.metric-card');
    expect(metricCards.length).toBe(4); // Total Tests, Total Files, Avg Tests/Feature, Most Productive Day
  });

  it('should show correct total tests metric', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const metricCards = element.querySelectorAll('.metric-card');
    const totalTestsCard = Array.from(metricCards).find(card => 
      card.textContent?.includes('Total Tests')
    );
    
    expect(totalTestsCard).toBeTruthy();
    expect(totalTestsCard?.textContent).toContain('44'); // 5 + 10 + 29
  });

  it('should show correct total files metric', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const metricCards = element.querySelectorAll('.metric-card');
    const totalFilesCard = Array.from(metricCards).find(card => 
      card.textContent?.includes('Total Files')
    );
    
    expect(totalFilesCard).toBeTruthy();
    expect(totalFilesCard?.textContent).toContain('9'); // 2 + 3 + 4
  });

  it('should calculate average tests per feature', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const metricCards = element.querySelectorAll('.metric-card');
    const avgCard = Array.from(metricCards).find(card => 
      card.textContent?.includes('Avg Tests/Feature')
    );
    
    expect(avgCard).toBeTruthy();
    // 44 total tests / 3 features = 14.7
    expect(avgCard?.textContent).toContain('14.7');
  });

  it('should show most productive day', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const metricCards = element.querySelectorAll('.metric-card');
    const productiveCard = Array.from(metricCards).find(card => 
      card.textContent?.includes('Most Productive Day')
    );
    
    expect(productiveCard).toBeTruthy();
    expect(productiveCard?.textContent).toContain('Day'); // Day 3 has most tests (29)
  });

  it('should contain SVG chart', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const svg = element.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should have chart container', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const chartContainer = element.querySelector('.impact-chart-container');
    expect(chartContainer).toBeTruthy();
  });

  it('should include explanation text', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const explanation = element.querySelector('.impact-explanation');
    expect(explanation).toBeTruthy();
    expect(explanation?.textContent).toContain('How to read this graph');
  });

  it('should handle empty entries', () => {
    const element = renderImpactGraphUI([]);
    
    expect(element.className).toBe('impact-graph-container');
    // Should still render but with no data
    const svg = element.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should display metric icons', () => {
    const element = renderImpactGraphUI(mockEntries);
    
    const icons = element.querySelectorAll('.metric-icon');
    expect(icons.length).toBe(4);
  });
});

describe('setupImpactGraph', () => {
  let mockEntries: ChangelogEntry[];

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>';
    
    mockEntries = [
      {
        date: '2026-01-19',
        day: '1',
        feature: 'Test Feature',
        description: 'Added 10 tests',
        filesModified: 'file1.ts'
      }
    ];
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should add impact graph to the DOM', () => {
    setupImpactGraph(mockEntries);
    
    const graphContainer = document.querySelector('.impact-graph-container');
    expect(graphContainer).toBeTruthy();
  });

  it('should remove existing graph before adding new one', () => {
    setupImpactGraph(mockEntries);
    setupImpactGraph(mockEntries);
    
    const graphContainers = document.querySelectorAll('.impact-graph-container');
    expect(graphContainers.length).toBe(1);
  });

  it('should insert after dashboard section if it exists', () => {
    const app = document.querySelector('#app')!;
    const dashboardSection = document.createElement('div');
    dashboardSection.className = 'dashboard-section';
    app.appendChild(dashboardSection);
    
    setupImpactGraph(mockEntries);
    
    const graphContainer = document.querySelector('.impact-graph-container');
    expect(graphContainer?.previousElementSibling).toBe(dashboardSection);
  });

  it('should append to app if no dashboard exists', () => {
    setupImpactGraph(mockEntries);
    
    const app = document.querySelector('#app')!;
    const graphContainer = document.querySelector('.impact-graph-container');
    
    expect(app.contains(graphContainer)).toBe(true);
  });

  it('should handle missing app container gracefully', () => {
    document.body.innerHTML = '';
    
    expect(() => setupImpactGraph(mockEntries)).not.toThrow();
  });
});
