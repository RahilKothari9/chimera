import type { ChangelogEntry } from './changelogParser';
import { exportEvolutionData, downloadExport, type ExportFormat } from './exportData';

/**
 * Creates the export UI component
 */
export function createExportUI(entries: ChangelogEntry[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'export-section';

  const header = document.createElement('div');
  header.className = 'export-header';

  const title = document.createElement('h2');
  title.textContent = '📥 Export Evolution Data';
  header.appendChild(title);

  const description = document.createElement('p');
  description.className = 'export-description';
  description.textContent = 'Download Chimera\'s evolution history in your preferred format';
  header.appendChild(description);

  container.appendChild(header);

  const controls = document.createElement('div');
  controls.className = 'export-controls';

  const formatSelect = document.createElement('select');
  formatSelect.className = 'export-format-select';
  
  const jsonOption = document.createElement('option');
  jsonOption.value = 'json';
  jsonOption.textContent = 'JSON - Machine-readable data';
  
  const csvOption = document.createElement('option');
  csvOption.value = 'csv';
  csvOption.textContent = 'CSV - Spreadsheet compatible';
  
  const markdownOption = document.createElement('option');
  markdownOption.value = 'markdown';
  markdownOption.textContent = 'Markdown - Human-readable docs';
  
  formatSelect.appendChild(jsonOption);
  formatSelect.appendChild(csvOption);
  formatSelect.appendChild(markdownOption);

  const metadataCheckbox = document.createElement('label');
  metadataCheckbox.className = 'export-metadata-label';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'export-metadata-checkbox';
  checkbox.checked = true;
  
  const labelText = document.createTextNode('Include metadata (date range, totals)');
  
  metadataCheckbox.appendChild(checkbox);
  metadataCheckbox.appendChild(labelText);

  const exportButton = document.createElement('button');
  exportButton.className = 'export-button';
  exportButton.textContent = '⬇ Download Export';

  const statusMessage = document.createElement('div');
  statusMessage.className = 'export-status';
  statusMessage.style.display = 'none';

  exportButton.addEventListener('click', () => {
    const format = formatSelect.value as ExportFormat;
    const includeMetadata = metadataCheckbox.querySelector('input')?.checked ?? true;

    try {
      const result = exportEvolutionData(entries, {
        format,
        includeMetadata,
      });

      downloadExport(result);

      statusMessage.textContent = `✓ Successfully exported ${entries.length} entries as ${format.toUpperCase()}`;
      statusMessage.className = 'export-status export-status-success';
      statusMessage.style.display = 'block';

      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 5000);
    } catch (error) {
      statusMessage.textContent = `✗ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      statusMessage.className = 'export-status export-status-error';
      statusMessage.style.display = 'block';
    }
  });

  controls.appendChild(formatSelect);
  controls.appendChild(metadataCheckbox);
  controls.appendChild(exportButton);

  container.appendChild(controls);
  container.appendChild(statusMessage);

  return container;
}

/**
 * Returns the format select element if it exists
 */
export function getFormatSelect(container: HTMLElement): HTMLSelectElement | null {
  return container.querySelector('.export-format-select');
}

/**
 * Returns the metadata checkbox element if it exists
 */
export function getMetadataCheckbox(container: HTMLElement): HTMLInputElement | null {
  return container.querySelector('.export-metadata-checkbox');
}

/**
 * Returns the export button element if it exists
 */
export function getExportButton(container: HTMLElement): HTMLButtonElement | null {
  return container.querySelector('.export-button');
}

/**
 * Returns the status message element if it exists
 */
export function getStatusMessage(container: HTMLElement): HTMLElement | null {
  return container.querySelector('.export-status');
}
