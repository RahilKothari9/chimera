import { describe, it, expect, beforeEach } from 'vitest';
import { setupStatsDashboard } from './dashboard';
import type { EvolutionStatistics } from './statistics';

describe('setupStatsDashboard', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('should display empty message when no evolutions', () => {
    const stats: EvolutionStatistics = {
      totalEvolutions: 0,
      daysActive: 0,
      mostModifiedFiles: [],
      evolutionsByDate: []
    };

    setupStatsDashboard(container, stats);

    const emptyMessage = container.querySelector('.stats-empty');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage?.textContent).toContain('No statistics available yet');
  });

  it('should display dashboard with statistics', () => {
    const stats: EvolutionStatistics = {
      totalEvolutions: 2,
      daysActive: 2,
      mostModifiedFiles: [
        { file: 'src/main.ts', count: 2 },
        { file: 'README.md', count: 1 }
      ],
      evolutionsByDate: [
        { date: '2026-01-18', day: '0', feature: 'Initial Setup' },
        { date: '2026-01-19', day: '1', feature: 'New Feature' }
      ]
    };

    setupStatsDashboard(container, stats);

    const dashboard = container.querySelector('.stats-dashboard');
    expect(dashboard).toBeTruthy();
  });

  it('should display stat cards with correct values', () => {
    const stats: EvolutionStatistics = {
      totalEvolutions: 5,
      daysActive: 5,
      mostModifiedFiles: [],
      evolutionsByDate: []
    };

    setupStatsDashboard(container, stats);

    const statValues = container.querySelectorAll('.stat-value');
    expect(statValues).toHaveLength(2);
    expect(statValues[0].textContent).toBe('5');
    expect(statValues[1].textContent).toBe('5');
  });

  it('should display top files section when files exist', () => {
    const stats: EvolutionStatistics = {
      totalEvolutions: 1,
      daysActive: 1,
      mostModifiedFiles: [
        { file: 'src/app.ts', count: 3 },
        { file: 'src/main.ts', count: 2 }
      ],
      evolutionsByDate: []
    };

    setupStatsDashboard(container, stats);

    const topFilesSection = container.querySelector('.top-files-list');
    expect(topFilesSection).toBeTruthy();
    
    const fileItems = container.querySelectorAll('.top-file-item');
    expect(fileItems).toHaveLength(2);
  });

  it('should display file ranks correctly', () => {
    const stats: EvolutionStatistics = {
      totalEvolutions: 1,
      daysActive: 1,
      mostModifiedFiles: [
        { file: 'file1.ts', count: 5 },
        { file: 'file2.ts', count: 3 }
      ],
      evolutionsByDate: []
    };

    setupStatsDashboard(container, stats);

    const ranks = container.querySelectorAll('.file-rank');
    expect(ranks[0].textContent).toBe('#1');
    expect(ranks[1].textContent).toBe('#2');
  });

  it('should display recent activity section', () => {
    const stats: EvolutionStatistics = {
      totalEvolutions: 2,
      daysActive: 2,
      mostModifiedFiles: [],
      evolutionsByDate: [
        { date: '2026-01-18', day: '0', feature: 'Feature A' },
        { date: '2026-01-19', day: '1', feature: 'Feature B' }
      ]
    };

    setupStatsDashboard(container, stats);

    const activitySection = container.querySelector('.recent-activity-list');
    expect(activitySection).toBeTruthy();
    
    const activityItems = container.querySelectorAll('.activity-item');
    expect(activityItems.length).toBeGreaterThan(0);
  });

  it('should clear existing content before rendering', () => {
    container.innerHTML = '<p>Old content</p>';
    
    const stats: EvolutionStatistics = {
      totalEvolutions: 1,
      daysActive: 1,
      mostModifiedFiles: [],
      evolutionsByDate: []
    };

    setupStatsDashboard(container, stats);

    expect(container.querySelector('p')?.textContent).not.toBe('Old content');
  });

  it('should show dashboard header', () => {
    const stats: EvolutionStatistics = {
      totalEvolutions: 1,
      daysActive: 1,
      mostModifiedFiles: [],
      evolutionsByDate: []
    };

    setupStatsDashboard(container, stats);

    const header = container.querySelector('.stats-header');
    expect(header).toBeTruthy();
    
    const title = container.querySelector('.stats-title');
    expect(title?.textContent).toContain('Evolution Statistics');
  });
});
