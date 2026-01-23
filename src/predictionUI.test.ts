import { describe, it, expect, beforeEach } from 'vitest';
import { setupPredictionUI } from './predictionUI';
import type { EvolutionPrediction } from './predictionEngine';

describe('Prediction UI', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('setupPredictionUI', () => {
    it('should create prediction section with header', () => {
      const prediction: EvolutionPrediction = {
        predictions: [],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Expanding into new territories',
        suggestionCount: 0
      };

      setupPredictionUI(container, prediction);

      expect(container.className).toBe('prediction-section');
      expect(container.querySelector('.section-title')).toBeTruthy();
      expect(container.querySelector('.prediction-subtitle')).toBeTruthy();
    });

    it('should display overall trend', () => {
      const prediction: EvolutionPrediction = {
        predictions: [],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Steady evolution with balanced development',
        suggestionCount: 0
      };

      setupPredictionUI(container, prediction);

      const trendValue = container.querySelector('.trend-box .metadata-value');
      expect(trendValue?.textContent).toBe('Steady evolution with balanced development');
    });

    it('should display next likely date in readable format', () => {
      const prediction: EvolutionPrediction = {
        predictions: [],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Growing',
        suggestionCount: 0
      };

      setupPredictionUI(container, prediction);

      const dateValue = container.querySelector('.date-box .metadata-value');
      expect(dateValue?.textContent).toContain('January');
      expect(dateValue?.textContent).toContain('24');
      expect(dateValue?.textContent).toContain('2026');
    });

    it('should show empty message when no predictions', () => {
      const prediction: EvolutionPrediction = {
        predictions: [],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Just getting started',
        suggestionCount: 0
      };

      setupPredictionUI(container, prediction);

      const emptyMessage = container.querySelector('.empty-predictions');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage?.textContent).toContain('No predictions available');
    });

    it('should create prediction cards for each prediction', () => {
      const prediction: EvolutionPrediction = {
        predictions: [
          {
            category: 'UI/UX',
            probability: 75,
            confidence: 'High',
            reasoning: 'Strong trend in UI development'
          },
          {
            category: 'Testing',
            probability: 45,
            confidence: 'Medium',
            reasoning: 'Moderate testing activity'
          }
        ],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Growing',
        suggestionCount: 2
      };

      setupPredictionUI(container, prediction);

      const cards = container.querySelectorAll('.prediction-card');
      expect(cards.length).toBe(2);
    });

    it('should display category name in card', () => {
      const prediction: EvolutionPrediction = {
        predictions: [
          {
            category: 'Data Visualization',
            probability: 60,
            confidence: 'High',
            reasoning: 'Test reasoning'
          }
        ],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Growing',
        suggestionCount: 1
      };

      setupPredictionUI(container, prediction);

      const category = container.querySelector('.prediction-category');
      expect(category?.textContent).toBe('Data Visualization');
    });

    it('should display probability percentage', () => {
      const prediction: EvolutionPrediction = {
        predictions: [
          {
            category: 'UI/UX',
            probability: 85,
            confidence: 'High',
            reasoning: 'Test reasoning'
          }
        ],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Growing',
        suggestionCount: 1
      };

      setupPredictionUI(container, prediction);

      const probability = container.querySelector('.prediction-probability');
      expect(probability?.textContent).toBe('85%');
    });

    it('should display confidence badge', () => {
      const prediction: EvolutionPrediction = {
        predictions: [
          {
            category: 'Testing',
            probability: 50,
            confidence: 'Medium',
            reasoning: 'Test reasoning'
          }
        ],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Growing',
        suggestionCount: 1
      };

      setupPredictionUI(container, prediction);

      const badge = container.querySelector('.confidence-badge');
      expect(badge?.textContent).toBe('Medium');
      expect(badge?.classList.contains('confidence-medium')).toBe(true);
    });

    it('should display reasoning text', () => {
      const prediction: EvolutionPrediction = {
        predictions: [
          {
            category: 'Performance',
            probability: 40,
            confidence: 'Low',
            reasoning: 'This is the test reasoning for performance improvements'
          }
        ],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Growing',
        suggestionCount: 1
      };

      setupPredictionUI(container, prediction);

      const reasoning = container.querySelector('.prediction-reasoning');
      expect(reasoning?.textContent).toBe('This is the test reasoning for performance improvements');
    });

    it('should create probability bar', () => {
      const prediction: EvolutionPrediction = {
        predictions: [
          {
            category: 'UI/UX',
            probability: 70,
            confidence: 'High',
            reasoning: 'Test'
          }
        ],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Growing',
        suggestionCount: 1
      };

      setupPredictionUI(container, prediction);

      const barContainer = container.querySelector('.probability-bar-container');
      expect(barContainer).toBeTruthy();
      
      const bar = barContainer?.querySelector('.probability-bar') as HTMLDivElement;
      expect(bar).toBeTruthy();
      expect(bar.style.width).toBe('70%');
    });

    it('should style high probability bars differently', () => {
      const prediction: EvolutionPrediction = {
        predictions: [
          {
            category: 'High Prob',
            probability: 80,
            confidence: 'High',
            reasoning: 'Test'
          },
          {
            category: 'Low Prob',
            probability: 15,
            confidence: 'Low',
            reasoning: 'Test'
          }
        ],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Growing',
        suggestionCount: 2
      };

      setupPredictionUI(container, prediction);

      const bars = container.querySelectorAll('.probability-bar') as NodeListOf<HTMLDivElement>;
      expect(bars.length).toBe(2);
      
      // High probability should use purple gradient
      expect(bars[0].style.background).toContain('#8b5cf6');
      
      // Low probability should use gray gradient
      expect(bars[1].style.background).toContain('#6b7280');
    });

    it('should clear previous content when called multiple times', () => {
      const prediction1: EvolutionPrediction = {
        predictions: [
          {
            category: 'First',
            probability: 50,
            confidence: 'Medium',
            reasoning: 'First'
          }
        ],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'First trend',
        suggestionCount: 1
      };

      const prediction2: EvolutionPrediction = {
        predictions: [
          {
            category: 'Second',
            probability: 60,
            confidence: 'High',
            reasoning: 'Second'
          }
        ],
        nextLikelyDate: '2026-01-25',
        overallTrend: 'Second trend',
        suggestionCount: 1
      };

      setupPredictionUI(container, prediction1);
      setupPredictionUI(container, prediction2);

      const cards = container.querySelectorAll('.prediction-card');
      expect(cards.length).toBe(1);
      
      const category = container.querySelector('.prediction-category');
      expect(category?.textContent).toBe('Second');
    });

    it('should create predictions grid', () => {
      const prediction: EvolutionPrediction = {
        predictions: [
          {
            category: 'Test',
            probability: 50,
            confidence: 'Medium',
            reasoning: 'Test'
          }
        ],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Growing',
        suggestionCount: 1
      };

      setupPredictionUI(container, prediction);

      const grid = container.querySelector('.predictions-grid');
      expect(grid).toBeTruthy();
    });

    it('should have proper metadata structure', () => {
      const prediction: EvolutionPrediction = {
        predictions: [],
        nextLikelyDate: '2026-01-24',
        overallTrend: 'Test trend',
        suggestionCount: 0
      };

      setupPredictionUI(container, prediction);

      const metadata = container.querySelector('.prediction-metadata');
      expect(metadata).toBeTruthy();
      
      const metadataBoxes = metadata?.querySelectorAll('.metadata-box');
      expect(metadataBoxes?.length).toBe(2);
      
      expect(metadata?.querySelector('.trend-box')).toBeTruthy();
      expect(metadata?.querySelector('.date-box')).toBeTruthy();
    });
  });
});
