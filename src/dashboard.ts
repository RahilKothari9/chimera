import type { EvolutionStatistics } from './statistics';

/**
 * Creates a statistics dashboard element
 */
export function createStatsDashboard(stats: EvolutionStatistics): HTMLElement {
  const dashboard = document.createElement('div');
  dashboard.className = 'stats-dashboard';

  // Total evolutions card
  const totalCard = createStatCard(
    '🧬',
    stats.totalEvolutions.toString(),
    'Total Evolutions',
    'The number of times Chimera has evolved'
  );

  // Days active card
  const daysCard = createStatCard(
    '📅',
    stats.daysActive.toString(),
    'Days Active',
    'Days of autonomous development'
  );

  // Top files section
  const topFilesSection = createTopFilesSection(stats.mostModifiedFiles);

  // Recent activity section
  const recentActivitySection = createRecentActivitySection(stats.evolutionsByDate);

  dashboard.appendChild(createDashboardHeader());
  
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'stats-cards';
  cardsContainer.appendChild(totalCard);
  cardsContainer.appendChild(daysCard);
  
  dashboard.appendChild(cardsContainer);
  
  if (stats.mostModifiedFiles.length > 0) {
    dashboard.appendChild(topFilesSection);
  }
  
  if (stats.evolutionsByDate.length > 0) {
    dashboard.appendChild(recentActivitySection);
  }

  return dashboard;
}

function createDashboardHeader(): HTMLElement {
  const header = document.createElement('div');
  header.className = 'stats-header';
  
  const title = document.createElement('h2');
  title.className = 'stats-title';
  title.textContent = '📊 Evolution Statistics';
  
  const subtitle = document.createElement('p');
  subtitle.className = 'stats-subtitle';
  subtitle.textContent = "Insights into Chimera's autonomous development";
  
  header.appendChild(title);
  header.appendChild(subtitle);
  
  return header;
}

function createStatCard(emoji: string, value: string, label: string, description: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'stat-card';
  
  const emojiEl = document.createElement('div');
  emojiEl.className = 'stat-emoji';
  emojiEl.textContent = emoji;
  
  const valueEl = document.createElement('div');
  valueEl.className = 'stat-value';
  valueEl.textContent = value;
  
  const labelEl = document.createElement('div');
  labelEl.className = 'stat-label';
  labelEl.textContent = label;
  
  const descEl = document.createElement('div');
  descEl.className = 'stat-description';
  descEl.textContent = description;
  
  card.appendChild(emojiEl);
  card.appendChild(valueEl);
  card.appendChild(labelEl);
  card.appendChild(descEl);
  
  return card;
}

function createTopFilesSection(topFiles: Array<{ file: string; count: number }>): HTMLElement {
  const section = document.createElement('div');
  section.className = 'stats-section';
  
  const title = document.createElement('h3');
  title.className = 'stats-section-title';
  title.textContent = '🔥 Most Modified Files';
  
  const list = document.createElement('div');
  list.className = 'top-files-list';
  
  topFiles.forEach((item, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'top-file-item';
    
    const rank = document.createElement('span');
    rank.className = 'file-rank';
    rank.textContent = `#${index + 1}`;
    
    const fileName = document.createElement('span');
    fileName.className = 'file-name';
    fileName.textContent = item.file;
    
    const count = document.createElement('span');
    count.className = 'file-count';
    count.textContent = `${item.count} ${item.count === 1 ? 'change' : 'changes'}`;
    
    // Create a visual bar
    const barContainer = document.createElement('div');
    barContainer.className = 'file-bar-container';
    
    const bar = document.createElement('div');
    bar.className = 'file-bar';
    const maxCount = Math.max(topFiles[0].count, 1); // Avoid division by zero
    const percentage = (item.count / maxCount) * 100;
    bar.style.width = `${percentage}%`;
    
    barContainer.appendChild(bar);
    
    fileItem.appendChild(rank);
    fileItem.appendChild(fileName);
    fileItem.appendChild(count);
    fileItem.appendChild(barContainer);
    
    list.appendChild(fileItem);
  });
  
  section.appendChild(title);
  section.appendChild(list);
  
  return section;
}

function createRecentActivitySection(evolutions: Array<{ date: string; day: string; feature: string }>): HTMLElement {
  const section = document.createElement('div');
  section.className = 'stats-section';
  
  const title = document.createElement('h3');
  title.className = 'stats-section-title';
  title.textContent = '⚡ Recent Activity';
  
  const list = document.createElement('div');
  list.className = 'recent-activity-list';
  
  // Show last 3 evolutions
  const recentEvolutions = evolutions.slice(-3).reverse();
  
  recentEvolutions.forEach(evolution => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const date = document.createElement('span');
    date.className = 'activity-date';
    date.textContent = `Day ${evolution.day}`;
    
    const feature = document.createElement('span');
    feature.className = 'activity-feature';
    feature.textContent = evolution.feature;
    
    item.appendChild(date);
    item.appendChild(feature);
    
    list.appendChild(item);
  });
  
  section.appendChild(title);
  section.appendChild(list);
  
  return section;
}

/**
 * Sets up the statistics dashboard
 */
export function setupStatsDashboard(container: HTMLElement, stats: EvolutionStatistics) {
  container.innerHTML = '';
  
  if (stats.totalEvolutions === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'stats-empty';
    emptyMessage.textContent = 'No statistics available yet. Start evolving!';
    container.appendChild(emptyMessage);
    return;
  }
  
  const dashboard = createStatsDashboard(stats);
  container.appendChild(dashboard);
}
