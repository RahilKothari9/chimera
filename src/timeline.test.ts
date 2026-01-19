import { describe, it, expect, beforeEach } from 'vitest';
import { setupTimeline } from './timeline';
import type { ChangelogEntry } from './changelogParser';

describe('setupTimeline', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('should display empty message when no entries', () => {
    setupTimeline(container, []);
    
    const emptyMessage = container.querySelector('.timeline-empty');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage?.textContent).toContain('No evolution entries yet');
  });

  it('should display header with entry count', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Initial Setup',
        description: 'Created the base framework',
        filesModified: 'All initial files'
      }
    ];
    
    setupTimeline(container, entries);
    
    const header = container.querySelector('.timeline-header');
    expect(header?.textContent).toBe('1 Evolution');
  });

  it('should pluralize header for multiple entries', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Initial Setup',
        description: 'Created the base framework',
        filesModified: 'All initial files'
      },
      {
        day: '1',
        date: '2026-01-19',
        feature: 'New Feature',
        description: 'Added something cool',
        filesModified: 'src/main.ts'
      }
    ];
    
    setupTimeline(container, entries);
    
    const header = container.querySelector('.timeline-header');
    expect(header?.textContent).toBe('2 Evolutions');
  });

  it('should create timeline entry for each changelog entry', () => {
    const entries: ChangelogEntry[] = [
      {
        day: '0',
        date: '2026-01-18',
        feature: 'Initial Setup',
        description: 'Created the base framework',
        filesModified: 'All initial files'
      }
    ];
    
    setupTimeline(container, entries);
    
    const timelineEntries = container.querySelectorAll('.timeline-entry');
    expect(timelineEntries).toHaveLength(1);
    
    const entry = timelineEntries[0];
    expect(entry.querySelector('.timeline-date')?.textContent).toBe('Day 0 - 2026-01-18');
    expect(entry.querySelector('.timeline-feature')?.textContent).toBe('Initial Setup');
    expect(entry.querySelector('.timeline-description')?.textContent).toBe('Created the base framework');
    expect(entry.querySelector('.timeline-files')?.textContent).toBe('Files: All initial files');
  });

  it('should clear existing content before rendering', () => {
    container.innerHTML = '<p>Old content</p>';
    
    setupTimeline(container, []);
    
    expect(container.querySelector('p')?.textContent).not.toBe('Old content');
  });
});
