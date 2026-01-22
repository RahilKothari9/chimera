import { describe, it, expect } from 'vitest';
import { extractImpactData, calculateImpactMetrics, prepareCumulativeData } from './impactData';
import type { ChangelogEntry } from './changelogParser';

describe('extractImpactData', () => {
  it('should extract impact data from evolution entries', () => {
    const entries: ChangelogEntry[] = [
      {
        date: '2026-01-19',
        day: '1',
        feature: 'Test Feature',
        description: 'Added 10 comprehensive tests',
        filesModified: 'file1.ts, file2.ts'
      },
      {
        date: '2026-01-20',
        day: '2',
        feature: 'Another Feature',
        description: 'Added 5 tests for validation',
        filesModified: 'file3.ts'
      }
    ];

    const result = extractImpactData(entries);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2026-01-19');
    expect(result[0].testsAdded).toBe(10);
    expect(result[0].filesModified).toBe(2);
    expect(result[0].dayNumber).toBe(1);
    
    expect(result[1].date).toBe('2026-01-20');
    expect(result[1].testsAdded).toBe(5);
    expect(result[1].filesModified).toBe(1);
    expect(result[1].dayNumber).toBe(2);
  });

  it('should handle entries without test information', () => {
    const entries: ChangelogEntry[] = [
      {
        date: '2026-01-19',
        day: '1',
        feature: 'Test Feature',
        description: 'No test information',
        filesModified: 'file1.ts'
      }
    ];

    const result = extractImpactData(entries);

    expect(result).toHaveLength(1);
    expect(result[0].testsAdded).toBe(0);
  });

  it('should handle entries without files modified', () => {
    const entries: ChangelogEntry[] = [
      {
        date: '2026-01-19',
        day: '1',
        feature: 'Test Feature',
        description: 'Added 5 tests',
        filesModified: ''
      }
    ];

    const result = extractImpactData(entries);

    expect(result).toHaveLength(1);
    expect(result[0].filesModified).toBe(0);
  });

  it('should extract test count from different formats', () => {
    const entries: ChangelogEntry[] = [
      {
        date: '2026-01-19',
        day: '1',
        feature: 'Feature 1',
        description: 'Added 15 comprehensive tests',
        filesModified: ''
      },
      {
        date: '2026-01-20',
        day: '2',
        feature: 'Feature 2',
        description: 'Implemented with 20 test cases',
        filesModified: ''
      }
    ];

    const result = extractImpactData(entries);

    expect(result[0].testsAdded).toBe(15);
    expect(result[1].testsAdded).toBe(20);
  });

  it('should return empty array for empty input', () => {
    const result = extractImpactData([]);
    expect(result).toEqual([]);
  });

  it('should categorize features correctly', () => {
    const entries: ChangelogEntry[] = [
      {
        date: '2026-01-19',
        day: '1',
        feature: 'Visual Dashboard',
        description: 'Added UI for statistics',
        filesModified: 'dashboard.ts'
      },
      {
        date: '2026-01-20',
        day: '2',
        feature: 'New Search Feature',
        description: 'Implemented search functionality',
        filesModified: 'search.ts'
      }
    ];

    const result = extractImpactData(entries);

    expect(result[0].category).toBe('UI/UX');
    expect(result[1].category).toBe('Feature');
  });
});

describe('calculateImpactMetrics', () => {
  it('should calculate correct metrics from data points', () => {
    const dataPoints = [
      {
        date: '2026-01-19',
        dayNumber: 1,
        featuresAdded: 1,
        testsAdded: 10,
        filesModified: 2,
        category: 'Features'
      },
      {
        date: '2026-01-20',
        dayNumber: 2,
        featuresAdded: 1,
        testsAdded: 20,
        filesModified: 3,
        category: 'Testing'
      },
      {
        date: '2026-01-21',
        dayNumber: 3,
        featuresAdded: 1,
        testsAdded: 15,
        filesModified: 4,
        category: 'UI/UX'
      }
    ];

    const metrics = calculateImpactMetrics(dataPoints);

    expect(metrics.totalFeatures).toBe(3);
    expect(metrics.totalTests).toBe(45);
    expect(metrics.totalFiles).toBe(9);
    expect(metrics.averageTestsPerFeature).toBe(15);
    expect(metrics.mostProductiveDay).toBe(dataPoints[1]);
  });

  it('should handle empty data points', () => {
    const metrics = calculateImpactMetrics([]);

    expect(metrics.totalFeatures).toBe(0);
    expect(metrics.totalTests).toBe(0);
    expect(metrics.totalFiles).toBe(0);
    expect(metrics.averageTestsPerFeature).toBe(0);
    expect(metrics.mostProductiveDay).toBeNull();
  });

  it('should handle single data point', () => {
    const dataPoints = [
      {
        date: '2026-01-19',
        dayNumber: 1,
        featuresAdded: 1,
        testsAdded: 5,
        filesModified: 2,
        category: 'Features'
      }
    ];

    const metrics = calculateImpactMetrics(dataPoints);

    expect(metrics.totalFeatures).toBe(1);
    expect(metrics.totalTests).toBe(5);
    expect(metrics.mostProductiveDay).toBe(dataPoints[0]);
  });
});

describe('prepareCumulativeData', () => {
  it('should create cumulative data correctly', () => {
    const dataPoints = [
      {
        date: '2026-01-19',
        dayNumber: 1,
        featuresAdded: 1,
        testsAdded: 10,
        filesModified: 2,
        category: 'Features'
      },
      {
        date: '2026-01-20',
        dayNumber: 2,
        featuresAdded: 1,
        testsAdded: 5,
        filesModified: 3,
        category: 'Testing'
      },
      {
        date: '2026-01-21',
        dayNumber: 3,
        featuresAdded: 1,
        testsAdded: 8,
        filesModified: 1,
        category: 'UI/UX'
      }
    ];

    const result = prepareCumulativeData(dataPoints);

    expect(result).toHaveLength(3);
    expect(result[0].testsAdded).toBe(10);
    expect(result[0].filesModified).toBe(2);
    expect(result[1].testsAdded).toBe(15);
    expect(result[1].filesModified).toBe(5);
    expect(result[2].testsAdded).toBe(23);
    expect(result[2].filesModified).toBe(6);
  });

  it('should handle empty array', () => {
    const result = prepareCumulativeData([]);
    expect(result).toEqual([]);
  });

  it('should preserve other properties', () => {
    const dataPoints = [
      {
        date: '2026-01-19',
        dayNumber: 1,
        featuresAdded: 1,
        testsAdded: 5,
        filesModified: 2,
        category: 'Features'
      }
    ];

    const result = prepareCumulativeData(dataPoints);

    expect(result[0].date).toBe('2026-01-19');
    expect(result[0].dayNumber).toBe(1);
    expect(result[0].category).toBe('Features');
  });
});
