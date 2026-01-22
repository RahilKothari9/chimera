import { describe, it, expect, beforeEach } from 'vitest';
import { createImpactChart } from './impactGraph';
import type { ImpactDataPoint } from './impactData';

describe('createImpactChart', () => {
  let mockData: ImpactDataPoint[];

  beforeEach(() => {
    mockData = [
      {
        date: '2026-01-19',
        dayNumber: 1,
        featuresAdded: 1,
        testsAdded: 10,
        filesModified: 5,
        category: 'Features'
      },
      {
        date: '2026-01-20',
        dayNumber: 2,
        featuresAdded: 1,
        testsAdded: 20,
        filesModified: 8,
        category: 'Testing'
      },
      {
        date: '2026-01-21',
        dayNumber: 3,
        featuresAdded: 1,
        testsAdded: 15,
        filesModified: 12,
        category: 'UI/UX'
      }
    ];
  });

  it('should create an SVG element', () => {
    const svg = createImpactChart(mockData);
    
    expect(svg).toBeInstanceOf(SVGSVGElement);
    expect(svg.tagName).toBe('svg');
  });

  it('should set correct SVG dimensions', () => {
    const svg = createImpactChart(mockData);
    
    expect(svg.getAttribute('width')).toBe('800');
    expect(svg.getAttribute('height')).toBe('400');
  });

  it('should respect custom config', () => {
    const customConfig = {
      width: 1000,
      height: 500
    };
    
    const svg = createImpactChart(mockData, customConfig);
    
    expect(svg.getAttribute('width')).toBe('1000');
    expect(svg.getAttribute('height')).toBe('500');
  });

  it('should contain a main group element', () => {
    const svg = createImpactChart(mockData);
    const groups = svg.querySelectorAll('g');
    
    expect(groups.length).toBeGreaterThan(0);
  });

  it('should create grid lines', () => {
    const svg = createImpactChart(mockData);
    const lines = svg.querySelectorAll('line');
    
    // Should have grid lines, axes, and data lines
    expect(lines.length).toBeGreaterThan(0);
  });

  it('should create data visualization lines', () => {
    const svg = createImpactChart(mockData);
    const polylines = svg.querySelectorAll('polyline');
    
    // Should have two polylines: one for tests, one for files
    expect(polylines.length).toBe(2);
  });

  it('should create circles for data points', () => {
    const svg = createImpactChart(mockData);
    const circles = svg.querySelectorAll('circle');
    
    // Should have 3 data points * 2 lines = 6 circles
    expect(circles.length).toBe(6);
  });

  it('should handle empty data gracefully', () => {
    const svg = createImpactChart([]);
    
    expect(svg).toBeInstanceOf(SVGSVGElement);
    const text = svg.querySelector('text');
    expect(text?.textContent).toBe('No data available');
  });

  it('should create text labels', () => {
    const svg = createImpactChart(mockData);
    const texts = svg.querySelectorAll('text');
    
    // Should have various text elements for labels, axes, etc.
    expect(texts.length).toBeGreaterThan(0);
  });

  it('should set viewBox attribute', () => {
    const svg = createImpactChart(mockData);
    const viewBox = svg.getAttribute('viewBox');
    
    expect(viewBox).toBe('0 0 800 400');
  });

  it('should apply correct styles to polylines', () => {
    const svg = createImpactChart(mockData);
    const polylines = svg.querySelectorAll('polyline');
    
    expect(polylines[0].getAttribute('fill')).toBe('none');
    expect(polylines[0].getAttribute('stroke-width')).toBe('3');
    expect(polylines[1].getAttribute('fill')).toBe('none');
  });

  it('should create circles with hover effects', () => {
    const svg = createImpactChart(mockData);
    const circles = svg.querySelectorAll('circle');
    
    // Check that circles have initial radius
    circles.forEach(circle => {
      expect(circle.getAttribute('r')).toBe('4');
    });
  });
});
