import type { EvolutionStats } from './statistics';

/**
 * Creates a dashboard displaying evolution statistics
 */
export function setupDashboard(container: HTMLElement, stats: EvolutionStats) {
  // Clear existing content
  container.innerHTML = '';

  // Create dashboard grid
  const grid = document.createElement('div');
  grid.className = 'stats-grid';

  // Total Evolutions Card
  const totalCard = createStatCard(
    'Total Evolutions',
    stats.totalEvolutions.toString(),
    '🧬',
    'The total number of autonomous changes made to Chimera'
  );
  grid.appendChild(totalCard);

  // Days Active Card
  const daysCard = createStatCard(
    'Days Active',
    stats.daysSinceStart.toString(),
    '📅',
    'Days since the first evolution'
  );
  grid.appendChild(daysCard);

  // Avg per Day Card
  const avgCard = createStatCard(
    'Avg per Day',
    stats.avgEvolutionsPerDay.toFixed(2),
    '📊',
    'Average evolutions per day'
  );
  grid.appendChild(avgCard);

  // Recent Activity Card
  const recentCard = createStatCard(
    'Recent Activity',
    stats.recentActivity.toString(),
    '⚡',
    'Evolutions in the last 7 days'
  );
  grid.appendChild(recentCard);

  container.appendChild(grid);

  // Add feature categories breakdown if there are any
  if (stats.featureCategories.size > 0) {
    const categoriesSection = createCategoriesSection(stats.featureCategories);
    container.appendChild(categoriesSection);
  }
}

/**
 * Creates a single stat card element
 */
function createStatCard(
  label: string,
  value: string,
  icon: string,
  description: string
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'stat-card';

  const iconEl = document.createElement('div');
  iconEl.className = 'stat-icon';
  iconEl.textContent = icon;

  const valueEl = document.createElement('div');
  valueEl.className = 'stat-value';
  valueEl.textContent = value;

  const labelEl = document.createElement('div');
  labelEl.className = 'stat-label';
  labelEl.textContent = label;

  const descEl = document.createElement('div');
  descEl.className = 'stat-description';
  descEl.textContent = description;

  card.appendChild(iconEl);
  card.appendChild(valueEl);
  card.appendChild(labelEl);
  card.appendChild(descEl);

  return card;
}

/**
 * Creates the feature categories breakdown section
 */
function createCategoriesSection(categories: Map<string, number>): HTMLElement {
  const section = document.createElement('div');
  section.className = 'categories-section';

  const title = document.createElement('h3');
  title.className = 'categories-title';
  title.textContent = 'Evolution Categories';
  section.appendChild(title);

  const categoriesContainer = document.createElement('div');
  categoriesContainer.className = 'categories-container';

  // Find the maximum count for scaling the bars
  const maxCount = Math.max(...Array.from(categories.values()));

  // Sort categories by count (descending)
  const sortedCategories = Array.from(categories.entries()).sort((a, b) => b[1] - a[1]);

  sortedCategories.forEach(([name, count]) => {
    const categoryItem = createCategoryItem(name, count, maxCount);
    categoriesContainer.appendChild(categoryItem);
  });

  section.appendChild(categoriesContainer);

  return section;
}

/**
 * Creates a single category item with progress bar
 */
function createCategoryItem(name: string, count: number, maxCount: number): HTMLElement {
  const item = document.createElement('div');
  item.className = 'category-item';

  const header = document.createElement('div');
  header.className = 'category-header';

  const nameEl = document.createElement('span');
  nameEl.className = 'category-name';
  nameEl.textContent = name;

  const countEl = document.createElement('span');
  countEl.className = 'category-count';
  countEl.textContent = count.toString();

  header.appendChild(nameEl);
  header.appendChild(countEl);

  const barContainer = document.createElement('div');
  barContainer.className = 'category-bar-container';

  const bar = document.createElement('div');
  bar.className = 'category-bar';
  // Safety check to prevent division by zero
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  bar.style.width = `${percentage}%`;

  barContainer.appendChild(bar);

  item.appendChild(header);
  item.appendChild(barContainer);

  return item;
}
