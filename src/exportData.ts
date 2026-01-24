import type { ChangelogEntry } from './changelogParser';

export type ExportFormat = 'json' | 'csv' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
}

export interface ExportResult {
  filename: string;
  content: string;
  mimeType: string;
}

/**
 * Exports changelog entries to JSON format
 */
export function exportToJSON(entries: ChangelogEntry[], includeMetadata = true): string {
  const exportData = {
    metadata: includeMetadata ? {
      exportDate: new Date().toISOString(),
      totalEntries: entries.length,
      dateRange: {
        earliest: entries.length > 0 ? entries[entries.length - 1].date : null,
        latest: entries.length > 0 ? entries[0].date : null,
      },
    } : undefined,
    entries,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Exports changelog entries to CSV format
 */
export function exportToCSV(entries: ChangelogEntry[]): string {
  if (entries.length === 0) {
    return 'Date,Feature,Description,Files Modified\n';
  }

  const headers = 'Date,Feature,Description,Files Modified\n';
  const rows = entries.map(entry => {
    const date = entry.date;
    const feature = escapeCSV(entry.feature);
    const description = escapeCSV(entry.description);
    const files = escapeCSV(entry.filesModified);
    return `${date},${feature},${description},${files}`;
  }).join('\n');

  return headers + rows;
}

/**
 * Exports changelog entries to Markdown format
 */
export function exportToMarkdown(entries: ChangelogEntry[], includeMetadata = true): string {
  let markdown = '# Chimera Evolution History\n\n';

  if (includeMetadata && entries.length > 0) {
    markdown += `**Export Date:** ${new Date().toLocaleString()}\n\n`;
    markdown += `**Total Evolutions:** ${entries.length}\n\n`;
    markdown += `**Date Range:** ${entries[entries.length - 1].date} to ${entries[0].date}\n\n`;
    markdown += '---\n\n';
  }

  entries.forEach((entry, index) => {
    const dayPrefix = entry.day ? `Day ${entry.day}: ` : '';
    markdown += `## ${dayPrefix}${entry.date}\n\n`;
    markdown += `**Feature/Change:** ${entry.feature}\n\n`;
    markdown += `**Description:** ${entry.description}\n\n`;
    markdown += `**Files Modified:** ${entry.filesModified}\n\n`;
    
    if (index < entries.length - 1) {
      markdown += '---\n\n';
    }
  });

  return markdown;
}

/**
 * Main export function that handles all formats
 */
export function exportEvolutionData(
  entries: ChangelogEntry[],
  options: ExportOptions
): ExportResult {
  const timestamp = new Date().toISOString().split('T')[0];
  let content: string;
  let filename: string;
  let mimeType: string;

  switch (options.format) {
    case 'json':
      content = exportToJSON(entries, options.includeMetadata);
      filename = `chimera-evolution-${timestamp}.json`;
      mimeType = 'application/json';
      break;
    case 'csv':
      content = exportToCSV(entries);
      filename = `chimera-evolution-${timestamp}.csv`;
      mimeType = 'text/csv';
      break;
    case 'markdown':
      content = exportToMarkdown(entries, options.includeMetadata);
      filename = `chimera-evolution-${timestamp}.md`;
      mimeType = 'text/markdown';
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }

  return { filename, content, mimeType };
}

/**
 * Triggers a browser download for the exported data
 */
export function downloadExport(result: ExportResult): void {
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper function to escape CSV values
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
