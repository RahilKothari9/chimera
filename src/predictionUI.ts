import type { EvolutionPrediction, CategoryPrediction } from './predictionEngine';

/**
 * Creates a confidence badge element
 */
function createConfidenceBadge(confidence: 'High' | 'Medium' | 'Low'): HTMLSpanElement {
  const badge = document.createElement('span');
  badge.className = `confidence-badge confidence-${confidence.toLowerCase()}`;
  badge.textContent = confidence;
  return badge;
}

/**
 * Creates a probability bar element
 */
function createProbabilityBar(probability: number): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'probability-bar-container';
  
  const bar = document.createElement('div');
  bar.className = 'probability-bar';
  bar.style.width = `${probability}%`;
  
  // Color based on probability
  if (probability >= 50) {
    bar.style.background = 'linear-gradient(90deg, #8b5cf6, #a78bfa)';
  } else if (probability >= 25) {
    bar.style.background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
  } else {
    bar.style.background = 'linear-gradient(90deg, #6b7280, #9ca3af)';
  }
  
  container.appendChild(bar);
  return container;
}

/**
 * Creates a single prediction card
 */
function createPredictionCard(prediction: CategoryPrediction): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'prediction-card';
  
  const header = document.createElement('div');
  header.className = 'prediction-header';
  
  const titleRow = document.createElement('div');
  titleRow.className = 'prediction-title-row';
  
  const title = document.createElement('h3');
  title.className = 'prediction-category';
  title.textContent = prediction.category;
  
  const probability = document.createElement('span');
  probability.className = 'prediction-probability';
  probability.textContent = `${prediction.probability}%`;
  
  titleRow.appendChild(title);
  titleRow.appendChild(probability);
  header.appendChild(titleRow);
  header.appendChild(createConfidenceBadge(prediction.confidence));
  
  const bar = createProbabilityBar(prediction.probability);
  
  const reasoning = document.createElement('p');
  reasoning.className = 'prediction-reasoning';
  reasoning.textContent = prediction.reasoning;
  
  card.appendChild(header);
  card.appendChild(bar);
  card.appendChild(reasoning);
  
  return card;
}

/**
 * Creates the predictions grid
 */
function createPredictionsGrid(predictions: CategoryPrediction[]): HTMLDivElement {
  const grid = document.createElement('div');
  grid.className = 'predictions-grid';
  
  if (predictions.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-predictions';
    emptyMessage.textContent = 'No predictions available yet. Add more evolutions to generate predictions!';
    grid.appendChild(emptyMessage);
    return grid;
  }
  
  predictions.forEach(prediction => {
    grid.appendChild(createPredictionCard(prediction));
  });
  
  return grid;
}

/**
 * Creates the prediction header with metadata
 */
function createPredictionHeader(prediction: EvolutionPrediction): HTMLDivElement {
  const header = document.createElement('div');
  header.className = 'prediction-header-section';
  
  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = '🔮 AI Evolution Predictions';
  
  const subtitle = document.createElement('p');
  subtitle.className = 'prediction-subtitle';
  subtitle.textContent = 'Based on historical patterns, here\'s what might evolve next...';
  
  const metadata = document.createElement('div');
  metadata.className = 'prediction-metadata';
  
  const trendBox = document.createElement('div');
  trendBox.className = 'metadata-box trend-box';
  
  const trendLabel = document.createElement('span');
  trendLabel.className = 'metadata-label';
  trendLabel.textContent = '📈 Overall Trend';
  
  const trendValue = document.createElement('span');
  trendValue.className = 'metadata-value';
  trendValue.textContent = prediction.overallTrend;
  
  trendBox.appendChild(trendLabel);
  trendBox.appendChild(trendValue);
  
  const dateBox = document.createElement('div');
  dateBox.className = 'metadata-box date-box';
  
  const dateLabel = document.createElement('span');
  dateLabel.className = 'metadata-label';
  dateLabel.textContent = '📅 Next Likely Evolution';
  
  const dateValue = document.createElement('span');
  dateValue.className = 'metadata-value';
  dateValue.textContent = new Date(prediction.nextLikelyDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  dateBox.appendChild(dateLabel);
  dateBox.appendChild(dateValue);
  
  metadata.appendChild(trendBox);
  metadata.appendChild(dateBox);
  
  header.appendChild(title);
  header.appendChild(subtitle);
  header.appendChild(metadata);
  
  return header;
}

/**
 * Sets up the prediction UI in the provided container
 */
export function setupPredictionUI(
  container: HTMLElement,
  prediction: EvolutionPrediction
): void {
  container.innerHTML = '';
  container.className = 'prediction-section';
  
  const header = createPredictionHeader(prediction);
  const grid = createPredictionsGrid(prediction.predictions);
  
  container.appendChild(header);
  container.appendChild(grid);
}
