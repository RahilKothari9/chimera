import { describe, it, expect } from 'vitest';
import { filterEntries, getAvailableCategories } from './search';
import type { ChangelogEntry } from './changelogParser';

describe('filterEntries', () => {
  const mockEntries: ChangelogEntry[] = [
    {
      day: '1',
      date: '2026-01-19',
      feature: 'Evolution Timeline Tracker',
      description: 'Added an interactive visual timeline that displays Chimera evolution history',
      filesModified: 'src/main.ts, src/style.css, src/timeline.ts'
    },
    {
      day: '2',
      date: '2026-01-20',
      feature: 'Interactive Statistics Dashboard',
      description: 'Added a comprehensive statistics dashboard with UI features',
      filesModified: 'src/statistics.ts, src/dashboard.ts'
    },
    {
      day: '3',
      date: '2026-01-21',
      feature: 'Testing Coverage Improvement',
      description: 'Improved test coverage across the codebase',
      filesModified: 'src/*.test.ts'
    }
  ];

  it('should return all entries when no filters applied', () => {
    const result = filterEntries(mockEntries, { searchTerm: '', category: '' });
    expect(result).toHaveLength(3);
  });

  it('should filter by search term in feature name', () => {
    const result = filterEntries(mockEntries, { searchTerm: 'Timeline', category: '' });
    expect(result).toHaveLength(1);
    expect(result[0].feature).toBe('Evolution Timeline Tracker');
  });

  it('should filter by search term in description', () => {
    const result = filterEntries(mockEntries, { searchTerm: 'dashboard', category: '' });
    expect(result).toHaveLength(1);
    expect(result[0].feature).toBe('Interactive Statistics Dashboard');
  });

  it('should filter by search term in files modified', () => {
    const result = filterEntries(mockEntries, { searchTerm: 'statistics', category: '' });
    expect(result).toHaveLength(1);
    expect(result[0].feature).toBe('Interactive Statistics Dashboard');
  });

  it('should filter by search term in date', () => {
    const result = filterEntries(mockEntries, { searchTerm: '2026-01-20', category: '' });
    expect(result).toHaveLength(1);
    expect(result[0].feature).toBe('Interactive Statistics Dashboard');
  });

  it('should be case-insensitive when searching', () => {
    const result = filterEntries(mockEntries, { searchTerm: 'TIMELINE', category: '' });
    expect(result).toHaveLength(1);
    expect(result[0].feature).toBe('Evolution Timeline Tracker');
  });

  it('should filter by UI/UX category', () => {
    const result = filterEntries(mockEntries, { searchTerm: '', category: 'ui-ux' });
    // Both entries 1 and 2 contain UI-related keywords (visual, UI)
    expect(result.length).toBeGreaterThan(0);
    expect(result.some(r => r.feature === 'Interactive Statistics Dashboard')).toBe(true);
  });

  it('should filter by testing category', () => {
    const result = filterEntries(mockEntries, { searchTerm: '', category: 'testing' });
    expect(result).toHaveLength(1);
    expect(result[0].feature).toBe('Testing Coverage Improvement');
  });

  it('should apply both search term and category filters', () => {
    const result = filterEntries(mockEntries, { searchTerm: 'statistics', category: 'ui-ux' });
    expect(result).toHaveLength(1);
    expect(result[0].feature).toBe('Interactive Statistics Dashboard');
  });

  it('should return empty array when no matches found', () => {
    const result = filterEntries(mockEntries, { searchTerm: 'nonexistent', category: '' });
    expect(result).toHaveLength(0);
  });

  it('should handle whitespace in search term', () => {
    const result = filterEntries(mockEntries, { searchTerm: '  timeline  ', category: '' });
    expect(result).toHaveLength(1);
  });

  it('should return all entries when category is "all"', () => {
    const result = filterEntries(mockEntries, { searchTerm: '', category: 'all' });
    expect(result).toHaveLength(3);
  });
});

describe('getAvailableCategories', () => {
  it('should return all available categories', () => {
    const categories = getAvailableCategories();
    expect(categories).toHaveLength(7);
  });

  it('should include "All Categories" as first option', () => {
    const categories = getAvailableCategories();
    expect(categories[0]).toEqual({ value: 'all', label: 'All Categories' });
  });

  it('should include all expected categories', () => {
    const categories = getAvailableCategories();
    const values = categories.map(c => c.value);
    expect(values).toContain('ui-ux');
    expect(values).toContain('feature');
    expect(values).toContain('refactor');
    expect(values).toContain('testing');
    expect(values).toContain('documentation');
    expect(values).toContain('build-deploy');
  });
});
