import type { ChangelogEntry } from './changelogParser';

export interface SearchFilters {
  searchTerm: string;
  category: string;
}

/**
 * Filters changelog entries based on search term and category
 */
export function filterEntries(
  entries: ChangelogEntry[],
  filters: SearchFilters
): ChangelogEntry[] {
  let filtered = [...entries];

  // Apply search term filter
  if (filters.searchTerm.trim()) {
    const searchLower = filters.searchTerm.trim().toLowerCase();
    filtered = filtered.filter(entry => {
      const searchableText = [
        entry.feature,
        entry.description,
        entry.filesModified,
        entry.date
      ].join(' ').toLowerCase();
      return searchableText.includes(searchLower);
    });
  }

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(entry => {
      const text = `${entry.feature} ${entry.description}`.toLowerCase();
      return matchesCategory(text, filters.category);
    });
  }

  return filtered;
}

/**
 * Category keywords mapping for filtering
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'ui-ux': ['ui', 'ux', 'design', 'visual', 'interface', 'styling', 'css'],
  'feature': ['feature', 'add', 'new', 'implement'],
  'refactor': ['refactor', 'improve', 'optimize', 'clean'],
  'testing': ['test', 'testing', 'coverage'],
  'documentation': ['doc', 'documentation', 'readme', 'changelog'],
  'build-deploy': ['build', 'deploy', 'ci', 'action', 'workflow']
};

/**
 * Checks if text matches a category based on keywords
 */
function matchesCategory(text: string, category: string): boolean {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) return false;

  return keywords.some(keyword => text.includes(keyword));
}

/**
 * Gets available categories for filtering
 */
export function getAvailableCategories(): Array<{ value: string; label: string }> {
  return [
    { value: 'all', label: 'All Categories' },
    { value: 'ui-ux', label: 'UI/UX' },
    { value: 'feature', label: 'Features' },
    { value: 'refactor', label: 'Refactoring' },
    { value: 'testing', label: 'Testing' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'build-deploy', label: 'Build/Deploy' }
  ];
}
