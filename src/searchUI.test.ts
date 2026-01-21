import { describe, it, expect, vi } from 'vitest';
import { createSearchUI, updateResultsCounter, clearSearchFilters } from './searchUI';

describe('createSearchUI', () => {
  it('should create search container with correct structure', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);

    expect(ui.className).toBe('search-container');
    expect(ui.querySelector('.search-input')).toBeTruthy();
    expect(ui.querySelector('.category-select')).toBeTruthy();
    expect(ui.querySelector('.results-counter')).toBeTruthy();
  });

  it('should create search input with correct attributes', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);
    const input = ui.querySelector<HTMLInputElement>('.search-input');

    expect(input).toBeTruthy();
    expect(input?.type).toBe('text');
    expect(input?.placeholder).toContain('Search');
    expect(input?.getAttribute('aria-label')).toBe('Search evolutions');
  });

  it('should create category select with all options', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);
    const select = ui.querySelector<HTMLSelectElement>('.category-select');

    expect(select).toBeTruthy();
    const options = select?.querySelectorAll('option');
    expect(options?.length).toBeGreaterThan(0);
    expect(options?.[0].value).toBe('all');
    expect(options?.[0].textContent).toBe('All Categories');
  });

  it('should call onSearchChange when search input changes', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);
    const input = ui.querySelector<HTMLInputElement>('.search-input');

    input!.value = 'test search';
    input!.dispatchEvent(new Event('input'));

    expect(callbacks.onSearchChange).toHaveBeenCalledWith({
      searchTerm: 'test search',
      category: 'all'
    });
  });

  it('should call onSearchChange when category changes', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);
    const select = ui.querySelector<HTMLSelectElement>('.category-select');

    select!.value = 'testing';
    select!.dispatchEvent(new Event('change'));

    expect(callbacks.onSearchChange).toHaveBeenCalledWith({
      searchTerm: '',
      category: 'testing'
    });
  });

  it('should have accessibility attributes', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);
    const counter = ui.querySelector('.results-counter');

    expect(counter?.getAttribute('role')).toBe('status');
    expect(counter?.getAttribute('aria-live')).toBe('polite');
  });
});

describe('updateResultsCounter', () => {
  it('should display "all" message when showing all results', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);

    updateResultsCounter(ui, 5, 5);

    const counter = ui.querySelector('.results-counter');
    expect(counter?.textContent).toBe('Showing all 5 evolutions');
  });

  it('should display "found" message when filtered', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);

    updateResultsCounter(ui, 2, 5);

    const counter = ui.querySelector('.results-counter');
    expect(counter?.textContent).toBe('Found 2 of 5 evolutions');
  });

  it('should use singular form for single result', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);

    updateResultsCounter(ui, 1, 1);

    const counter = ui.querySelector('.results-counter');
    expect(counter?.textContent).toBe('Showing all 1 evolution');
  });

  it('should handle zero results', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);

    updateResultsCounter(ui, 0, 5);

    const counter = ui.querySelector('.results-counter');
    expect(counter?.textContent).toBe('Found 0 of 5 evolutions');
  });

  it('should do nothing if counter element not found', () => {
    const div = document.createElement('div');
    // Should not throw
    expect(() => updateResultsCounter(div, 5, 10)).not.toThrow();
  });
});

describe('clearSearchFilters', () => {
  it('should clear search input value', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);
    const input = ui.querySelector<HTMLInputElement>('.search-input');

    input!.value = 'test';
    clearSearchFilters(ui);

    expect(input!.value).toBe('');
  });

  it('should reset category select to "all"', () => {
    const callbacks = { onSearchChange: vi.fn() };
    const ui = createSearchUI(callbacks);
    const select = ui.querySelector<HTMLSelectElement>('.category-select');

    select!.value = 'testing';
    clearSearchFilters(ui);

    expect(select!.value).toBe('all');
  });

  it('should handle missing elements gracefully', () => {
    const div = document.createElement('div');
    // Should not throw
    expect(() => clearSearchFilters(div)).not.toThrow();
  });
});
