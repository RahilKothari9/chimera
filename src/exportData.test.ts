import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportToJSON,
  exportToCSV,
  exportToMarkdown,
  exportEvolutionData,
  type ExportFormat,
} from './exportData';
import type { ChangelogEntry } from './changelogParser';

describe('exportData', () => {
  let mockEntries: ChangelogEntry[];

  beforeEach(() => {
    mockEntries = [
      {
        day: '2',
        date: '2026-01-20',
        feature: 'Statistics Dashboard',
        description: 'Added comprehensive statistics with metrics',
        filesModified: 'src/statistics.ts, src/dashboard.ts',
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'Timeline Tracker',
        description: 'Added visual timeline display',
        filesModified: 'src/timeline.ts, src/main.ts',
      },
    ];
  });

  describe('exportToJSON', () => {
    it('should export entries to JSON with metadata', () => {
      const result = exportToJSON(mockEntries, true);
      const parsed = JSON.parse(result);

      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.totalEntries).toBe(2);
      expect(parsed.metadata.dateRange.earliest).toBe('2026-01-19');
      expect(parsed.metadata.dateRange.latest).toBe('2026-01-20');
      expect(parsed.entries).toEqual(mockEntries);
    });

    it('should export entries to JSON without metadata', () => {
      const result = exportToJSON(mockEntries, false);
      const parsed = JSON.parse(result);

      expect(parsed.metadata).toBeUndefined();
      expect(parsed.entries).toEqual(mockEntries);
    });

    it('should handle empty entries array', () => {
      const result = exportToJSON([], true);
      const parsed = JSON.parse(result);

      expect(parsed.metadata.totalEntries).toBe(0);
      expect(parsed.metadata.dateRange.earliest).toBeNull();
      expect(parsed.metadata.dateRange.latest).toBeNull();
      expect(parsed.entries).toEqual([]);
    });

    it('should produce valid JSON', () => {
      const result = exportToJSON(mockEntries);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include exportDate in metadata', () => {
      const result = exportToJSON(mockEntries, true);
      const parsed = JSON.parse(result);

      expect(parsed.metadata.exportDate).toBeDefined();
      expect(new Date(parsed.metadata.exportDate).getTime()).toBeGreaterThan(0);
    });
  });

  describe('exportToCSV', () => {
    it('should export entries to CSV format', () => {
      const result = exportToCSV(mockEntries);
      const lines = result.split('\n');

      expect(lines[0]).toBe('Date,Feature,Description,Files Modified');
      expect(lines[1]).toContain('2026-01-20');
      expect(lines[1]).toContain('Statistics Dashboard');
      expect(lines[2]).toContain('2026-01-19');
      expect(lines[2]).toContain('Timeline Tracker');
    });

    it('should handle empty entries array', () => {
      const result = exportToCSV([]);
      expect(result).toBe('Date,Feature,Description,Files Modified\n');
    });

    it('should escape CSV values with commas', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '1',
          date: '2026-01-19',
          feature: 'Feature, with comma',
          description: 'Description text',
          filesModified: 'file1.ts',
        },
      ];

      const result = exportToCSV(entries);
      expect(result).toContain('"Feature, with comma"');
    });

    it('should escape CSV values with quotes', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '1',
          date: '2026-01-19',
          feature: 'Feature with "quotes"',
          description: 'Description',
          filesModified: 'file1.ts',
        },
      ];

      const result = exportToCSV(entries);
      expect(result).toContain('""quotes""');
    });

    it('should join multiple files with semicolon', () => {
      const result = exportToCSV(mockEntries);
      const lines = result.split('\n');

      expect(lines[1]).toContain('src/statistics.ts');
      expect(lines[2]).toContain('src/timeline.ts');
    });

    it('should produce valid CSV with correct number of rows', () => {
      const result = exportToCSV(mockEntries);
      const lines = result.split('\n').filter(line => line.trim());

      expect(lines.length).toBe(3); // header + 2 entries
    });
  });

  describe('exportToMarkdown', () => {
    it('should export entries to Markdown with metadata', () => {
      const result = exportToMarkdown(mockEntries, true);

      expect(result).toContain('# Chimera Evolution History');
      expect(result).toContain('**Export Date:**');
      expect(result).toContain('**Total Evolutions:** 2');
      expect(result).toContain('**Date Range:** 2026-01-19 to 2026-01-20');
    });

    it('should export entries to Markdown without metadata', () => {
      const result = exportToMarkdown(mockEntries, false);

      expect(result).toContain('# Chimera Evolution History');
      expect(result).not.toContain('**Export Date:**');
      expect(result).not.toContain('**Total Evolutions:**');
    });

    it('should format entries with proper headers', () => {
      const result = exportToMarkdown(mockEntries);

      expect(result).toContain('## Day 2: 2026-01-20');
      expect(result).toContain('**Feature/Change:** Statistics Dashboard');
      expect(result).toContain('**Description:** Added comprehensive statistics with metrics');
    });

    it('should list files as bullet points', () => {
      const result = exportToMarkdown(mockEntries);

      expect(result).toContain('src/statistics.ts');
      expect(result).toContain('src/dashboard.ts');
      expect(result).toContain('src/timeline.ts');
    });

    it('should separate entries with horizontal rules', () => {
      const result = exportToMarkdown(mockEntries);
      const hrCount = (result.match(/---/g) || []).length;

      expect(hrCount).toBeGreaterThan(0);
    });

    it('should handle entries without day number', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '',
          date: '2026-01-20',
          feature: 'Test Feature',
          description: 'Test description',
          filesModified: 'test.ts',
        },
      ];

      const result = exportToMarkdown(entries);
      expect(result).toContain('## 2026-01-20');
    });
  });

  describe('exportEvolutionData', () => {
    it('should export to JSON format', () => {
      const result = exportEvolutionData(mockEntries, {
        format: 'json',
        includeMetadata: true,
      });

      expect(result.filename).toMatch(/chimera-evolution-\d{4}-\d{2}-\d{2}\.json/);
      expect(result.mimeType).toBe('application/json');
      expect(() => JSON.parse(result.content)).not.toThrow();
    });

    it('should export to CSV format', () => {
      const result = exportEvolutionData(mockEntries, {
        format: 'csv',
      });

      expect(result.filename).toMatch(/chimera-evolution-\d{4}-\d{2}-\d{2}\.csv/);
      expect(result.mimeType).toBe('text/csv');
      expect(result.content).toContain('Date,Feature,Description,Files Modified');
    });

    it('should export to Markdown format', () => {
      const result = exportEvolutionData(mockEntries, {
        format: 'markdown',
        includeMetadata: true,
      });

      expect(result.filename).toMatch(/chimera-evolution-\d{4}-\d{2}-\d{2}\.md/);
      expect(result.mimeType).toBe('text/markdown');
      expect(result.content).toContain('# Chimera Evolution History');
    });

    it('should throw error for unsupported format', () => {
      expect(() =>
        exportEvolutionData(mockEntries, {
          format: 'xml' as ExportFormat,
        })
      ).toThrow('Unsupported export format: xml');
    });

    it('should generate filename with current date', () => {
      const result = exportEvolutionData(mockEntries, { format: 'json' });
      const today = new Date().toISOString().split('T')[0];

      expect(result.filename).toContain(today);
    });

    it('should respect includeMetadata option for JSON', () => {
      const withMetadata = exportEvolutionData(mockEntries, {
        format: 'json',
        includeMetadata: true,
      });
      const withoutMetadata = exportEvolutionData(mockEntries, {
        format: 'json',
        includeMetadata: false,
      });

      expect(withMetadata.content).toContain('metadata');
      expect(withoutMetadata.content).not.toContain('metadata');
    });

    it('should respect includeMetadata option for Markdown', () => {
      const withMetadata = exportEvolutionData(mockEntries, {
        format: 'markdown',
        includeMetadata: true,
      });
      const withoutMetadata = exportEvolutionData(mockEntries, {
        format: 'markdown',
        includeMetadata: false,
      });

      expect(withMetadata.content).toContain('**Total Evolutions:**');
      expect(withoutMetadata.content).not.toContain('**Total Evolutions:**');
    });
  });
});
