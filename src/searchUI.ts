import { getAvailableCategories } from './search';
import type { SearchFilters } from './search';

export interface SearchUICallbacks {
  onSearchChange: (filters: SearchFilters) => void;
  initialQuery?: string;
  initialCategory?: string;
}

/**
 * Creates the search and filter UI component
 */
export function createSearchUI(callbacks: SearchUICallbacks): HTMLElement {
  const container = document.createElement('div');
  container.className = 'search-container';

  // Search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'search-input';
  searchInput.placeholder = '🔍 Search evolutions...';
  searchInput.setAttribute('aria-label', 'Search evolutions');
  searchInput.value = callbacks.initialQuery || '';

  // Category filter dropdown
  const categorySelect = document.createElement('select');
  categorySelect.className = 'category-select';
  categorySelect.setAttribute('aria-label', 'Filter by category');

  const categories = getAvailableCategories();
  categories.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    if (value === callbacks.initialCategory) {
      option.selected = true;
    }
    categorySelect.appendChild(option);
  });

  // Results counter
  const resultsCounter = document.createElement('div');
  resultsCounter.className = 'results-counter';
  resultsCounter.setAttribute('role', 'status');
  resultsCounter.setAttribute('aria-live', 'polite');

  // Event handlers
  const handleFilterChange = () => {
    const filters: SearchFilters = {
      searchTerm: searchInput.value,
      category: categorySelect.value
    };
    callbacks.onSearchChange(filters);
  };

  searchInput.addEventListener('input', handleFilterChange);
  categorySelect.addEventListener('change', handleFilterChange);

  // Assemble the UI
  const controlsWrapper = document.createElement('div');
  controlsWrapper.className = 'search-controls';
  controlsWrapper.appendChild(searchInput);
  controlsWrapper.appendChild(categorySelect);

  container.appendChild(controlsWrapper);
  container.appendChild(resultsCounter);

  return container;
}

/**
 * Updates the results counter display
 */
export function updateResultsCounter(
  container: HTMLElement,
  totalResults: number,
  totalEntries: number
) {
  const counter = container.querySelector('.results-counter');
  if (!counter) return;

  if (totalResults === totalEntries) {
    counter.textContent = `Showing all ${totalEntries} evolution${totalEntries !== 1 ? 's' : ''}`;
  } else {
    counter.textContent = `Found ${totalResults} of ${totalEntries} evolution${totalEntries !== 1 ? 's' : ''}`;
  }
}

/**
 * Clears the search filters
 */
export function clearSearchFilters(container: HTMLElement) {
  const searchInput = container.querySelector<HTMLInputElement>('.search-input');
  const categorySelect = container.querySelector<HTMLSelectElement>('.category-select');
  
  if (searchInput) searchInput.value = '';
  if (categorySelect) categorySelect.value = 'all';
}
