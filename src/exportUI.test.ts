import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createExportUI,
  getFormatSelect,
  getMetadataCheckbox,
  getExportButton,
  getStatusMessage,
} from './exportUI';
import type { ChangelogEntry } from './changelogParser';
import * as exportData from './exportData';

describe('exportUI', () => {
  let mockEntries: ChangelogEntry[];

  beforeEach(() => {
    mockEntries = [
      {
        day: '2',
        date: '2026-01-20',
        feature: 'Statistics Dashboard',
        description: 'Added comprehensive statistics',
        filesModified: 'src/statistics.ts, src/dashboard.ts',
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'Timeline Tracker',
        description: 'Added visual timeline',
        filesModified: 'src/timeline.ts',
      },
    ];
  });

  describe('createExportUI', () => {
    it('should create export UI container', () => {
      const ui = createExportUI(mockEntries);

      expect(ui).toBeInstanceOf(HTMLElement);
      expect(ui.className).toBe('export-section');
    });

    it('should include header with title and description', () => {
      const ui = createExportUI(mockEntries);

      const title = ui.querySelector('h2');
      expect(title?.textContent).toBe('📥 Export Evolution Data');

      const description = ui.querySelector('.export-description');
      expect(description?.textContent).toContain('evolution history');
    });

    it('should include format select dropdown', () => {
      const ui = createExportUI(mockEntries);
      const select = getFormatSelect(ui);

      expect(select).toBeInstanceOf(HTMLSelectElement);
      expect(select?.options.length).toBe(3);
      expect(select?.options[0].value).toBe('json');
      expect(select?.options[1].value).toBe('csv');
      expect(select?.options[2].value).toBe('markdown');
    });

    it('should include metadata checkbox', () => {
      const ui = createExportUI(mockEntries);
      const checkbox = getMetadataCheckbox(ui);

      expect(checkbox).toBeInstanceOf(HTMLInputElement);
      expect(checkbox?.type).toBe('checkbox');
      expect(checkbox?.checked).toBe(true);
    });

    it('should include export button', () => {
      const ui = createExportUI(mockEntries);
      const button = getExportButton(ui);

      expect(button).toBeInstanceOf(HTMLButtonElement);
      expect(button?.textContent).toContain('Download Export');
    });

    it('should include status message element (hidden initially)', () => {
      const ui = createExportUI(mockEntries);
      const status = getStatusMessage(ui);

      expect(status).toBeInstanceOf(HTMLElement);
      expect(status?.style.display).toBe('none');
    });
  });

  describe('export button functionality', () => {
    it('should export JSON when button is clicked', () => {
      const exportSpy = vi.spyOn(exportData, 'exportEvolutionData');
      const downloadSpy = vi.spyOn(exportData, 'downloadExport').mockImplementation(() => {});

      const ui = createExportUI(mockEntries);
      const button = getExportButton(ui);
      const select = getFormatSelect(ui);

      select!.value = 'json';
      button?.click();

      expect(exportSpy).toHaveBeenCalledWith(mockEntries, {
        format: 'json',
        includeMetadata: true,
      });
      expect(downloadSpy).toHaveBeenCalled();

      exportSpy.mockRestore();
      downloadSpy.mockRestore();
    });

    it('should export CSV when CSV format is selected', () => {
      const exportSpy = vi.spyOn(exportData, 'exportEvolutionData');
      const downloadSpy = vi.spyOn(exportData, 'downloadExport').mockImplementation(() => {});

      const ui = createExportUI(mockEntries);
      const button = getExportButton(ui);
      const select = getFormatSelect(ui);

      select!.value = 'csv';
      button?.click();

      expect(exportSpy).toHaveBeenCalledWith(mockEntries, {
        format: 'csv',
        includeMetadata: true,
      });

      exportSpy.mockRestore();
      downloadSpy.mockRestore();
    });

    it('should export Markdown when Markdown format is selected', () => {
      const exportSpy = vi.spyOn(exportData, 'exportEvolutionData');
      const downloadSpy = vi.spyOn(exportData, 'downloadExport').mockImplementation(() => {});

      const ui = createExportUI(mockEntries);
      const button = getExportButton(ui);
      const select = getFormatSelect(ui);

      select!.value = 'markdown';
      button?.click();

      expect(exportSpy).toHaveBeenCalledWith(mockEntries, {
        format: 'markdown',
        includeMetadata: true,
      });

      exportSpy.mockRestore();
      downloadSpy.mockRestore();
    });

    it('should respect metadata checkbox state', () => {
      const exportSpy = vi.spyOn(exportData, 'exportEvolutionData');
      const downloadSpy = vi.spyOn(exportData, 'downloadExport').mockImplementation(() => {});

      const ui = createExportUI(mockEntries);
      const button = getExportButton(ui);
      const checkbox = getMetadataCheckbox(ui);

      checkbox!.checked = false;
      button?.click();

      expect(exportSpy).toHaveBeenCalledWith(mockEntries, {
        format: 'json',
        includeMetadata: false,
      });

      exportSpy.mockRestore();
      downloadSpy.mockRestore();
    });

    it('should show success message after export', () => {
      vi.spyOn(exportData, 'exportEvolutionData').mockReturnValue({
        filename: 'test.json',
        content: '{}',
        mimeType: 'application/json',
      });
      vi.spyOn(exportData, 'downloadExport').mockImplementation(() => {});

      const ui = createExportUI(mockEntries);
      const button = getExportButton(ui);
      const status = getStatusMessage(ui);

      button?.click();

      expect(status?.style.display).toBe('block');
      expect(status?.textContent).toContain('Successfully exported');
      expect(status?.textContent).toContain('2 entries');
      expect(status?.className).toContain('export-status-success');

      vi.restoreAllMocks();
    });

    it('should show error message on export failure', () => {
      vi.spyOn(exportData, 'exportEvolutionData').mockImplementation(() => {
        throw new Error('Export failed');
      });

      const ui = createExportUI(mockEntries);
      const button = getExportButton(ui);
      const status = getStatusMessage(ui);

      button?.click();

      expect(status?.style.display).toBe('block');
      expect(status?.textContent).toContain('Export failed');
      expect(status?.className).toContain('export-status-error');

      vi.restoreAllMocks();
    });

    it('should hide success message after 5 seconds', () => {
      vi.useFakeTimers();
      vi.spyOn(exportData, 'exportEvolutionData').mockReturnValue({
        filename: 'test.json',
        content: '{}',
        mimeType: 'application/json',
      });
      vi.spyOn(exportData, 'downloadExport').mockImplementation(() => {});

      const ui = createExportUI(mockEntries);
      const button = getExportButton(ui);
      const status = getStatusMessage(ui);

      button?.click();
      expect(status?.style.display).toBe('block');

      vi.advanceTimersByTime(5000);
      expect(status?.style.display).toBe('none');

      vi.restoreAllMocks();
      vi.useRealTimers();
    });
  });

  describe('helper functions', () => {
    it('getFormatSelect should return format select element', () => {
      const ui = createExportUI(mockEntries);
      const select = getFormatSelect(ui);

      expect(select).toBeInstanceOf(HTMLSelectElement);
    });

    it('getMetadataCheckbox should return metadata checkbox', () => {
      const ui = createExportUI(mockEntries);
      const checkbox = getMetadataCheckbox(ui);

      expect(checkbox).toBeInstanceOf(HTMLInputElement);
    });

    it('getExportButton should return export button', () => {
      const ui = createExportUI(mockEntries);
      const button = getExportButton(ui);

      expect(button).toBeInstanceOf(HTMLButtonElement);
    });

    it('getStatusMessage should return status message element', () => {
      const ui = createExportUI(mockEntries);
      const status = getStatusMessage(ui);

      expect(status).toBeInstanceOf(HTMLElement);
    });

    it('helper functions should return null for wrong container', () => {
      const wrongContainer = document.createElement('div');

      expect(getFormatSelect(wrongContainer)).toBeNull();
      expect(getMetadataCheckbox(wrongContainer)).toBeNull();
      expect(getExportButton(wrongContainer)).toBeNull();
      expect(getStatusMessage(wrongContainer)).toBeNull();
    });
  });
});
