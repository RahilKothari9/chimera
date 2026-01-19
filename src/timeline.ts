import type { ChangelogEntry } from './changelogParser';

/**
 * Creates a timeline element for a single changelog entry
 */
function createTimelineEntry(entry: ChangelogEntry): HTMLElement {
  const container = document.createElement('div');
  container.className = 'timeline-entry';
  
  const dateEl = document.createElement('div');
  dateEl.className = 'timeline-date';
  dateEl.textContent = `Day ${entry.day} - ${entry.date}`;
  
  const featureEl = document.createElement('h3');
  featureEl.className = 'timeline-feature';
  featureEl.textContent = entry.feature;
  
  const descEl = document.createElement('p');
  descEl.className = 'timeline-description';
  descEl.textContent = entry.description;
  
  const filesEl = document.createElement('div');
  filesEl.className = 'timeline-files';
  filesEl.textContent = `Files: ${entry.filesModified}`;
  
  container.appendChild(dateEl);
  container.appendChild(featureEl);
  container.appendChild(descEl);
  container.appendChild(filesEl);
  
  return container;
}

/**
 * Sets up the evolution timeline display
 */
export function setupTimeline(container: HTMLElement, entries: ChangelogEntry[]) {
  // Clear existing content
  container.innerHTML = '';
  
  if (entries.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'timeline-empty';
    emptyMessage.textContent = 'No evolution entries yet. The journey is just beginning...';
    container.appendChild(emptyMessage);
    return;
  }
  
  // Create timeline header
  const header = document.createElement('h2');
  header.className = 'timeline-header';
  header.textContent = `${entries.length} Evolution${entries.length > 1 ? 's' : ''}`;
  container.appendChild(header);
  
  // Add each entry
  entries.forEach(entry => {
    const entryEl = createTimelineEntry(entry);
    container.appendChild(entryEl);
  });
}
