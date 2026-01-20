import { describe, it, expect, beforeEach } from 'vitest';
import { setupDashboard } from './dashboard';
import type { EvolutionStats } from './statistics';

describe('setupDashboard', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('should create stats grid with four stat cards', () => {
    const stats: EvolutionStats = {
      totalEvolutions: 5,
      daysSinceStart: 3,
      avgEvolutionsPerDay: 1.67,
      recentActivity: 2,
      featureCategories: new Map()
    };

    setupDashboard(container, stats);

    const grid = container.querySelector('.stats-grid');
    expect(grid).toBeTruthy();

    const cards = container.querySelectorAll('.stat-card');
    expect(cards.length).toBe(4);
  });

  it('should display total evolutions correctly', () => {
    const stats: EvolutionStats = {
      totalEvolutions: 10,
      daysSinceStart: 5,
      avgEvolutionsPerDay: 2,
      recentActivity: 3,
      featureCategories: new Map()
    };

    setupDashboard(container, stats);

    const cards = container.querySelectorAll('.stat-card');
    const totalCard = cards[0];
    
    expect(totalCard.querySelector('.stat-value')?.textContent).toBe('10');
    expect(totalCard.querySelector('.stat-label')?.textContent).toBe('Total Evolutions');
  });

  it('should display days since start correctly', () => {
    const stats: EvolutionStats = {
      totalEvolutions: 10,
      daysSinceStart: 7,
      avgEvolutionsPerDay: 1.43,
      recentActivity: 3,
      featureCategories: new Map()
    };

    setupDashboard(container, stats);

    const cards = container.querySelectorAll('.stat-card');
    const daysCard = cards[1];
    
    expect(daysCard.querySelector('.stat-value')?.textContent).toBe('7');
    expect(daysCard.querySelector('.stat-label')?.textContent).toBe('Days Active');
  });

  it('should display average evolutions per day with 2 decimal places', () => {
    const stats: EvolutionStats = {
      totalEvolutions: 7,
      daysSinceStart: 3,
      avgEvolutionsPerDay: 2.333333,
      recentActivity: 4,
      featureCategories: new Map()
    };

    setupDashboard(container, stats);

    const cards = container.querySelectorAll('.stat-card');
    const avgCard = cards[2];
    
    expect(avgCard.querySelector('.stat-value')?.textContent).toBe('2.33');
  });

  it('should display recent activity correctly', () => {
    const stats: EvolutionStats = {
      totalEvolutions: 10,
      daysSinceStart: 14,
      avgEvolutionsPerDay: 0.71,
      recentActivity: 5,
      featureCategories: new Map()
    };

    setupDashboard(container, stats);

    const cards = container.querySelectorAll('.stat-card');
    const recentCard = cards[3];
    
    expect(recentCard.querySelector('.stat-value')?.textContent).toBe('5');
    expect(recentCard.querySelector('.stat-label')?.textContent).toBe('Recent Activity');
  });

  it('should display feature categories when present', () => {
    const categories = new Map<string, number>();
    categories.set('UI/UX', 3);
    categories.set('Feature', 5);
    categories.set('Testing', 2);

    const stats: EvolutionStats = {
      totalEvolutions: 10,
      daysSinceStart: 5,
      avgEvolutionsPerDay: 2,
      recentActivity: 4,
      featureCategories: categories
    };

    setupDashboard(container, stats);

    const categoriesSection = container.querySelector('.categories-section');
    expect(categoriesSection).toBeTruthy();

    const title = container.querySelector('.categories-title');
    expect(title?.textContent).toBe('Evolution Categories');
  });

  it('should not display categories section when empty', () => {
    const stats: EvolutionStats = {
      totalEvolutions: 0,
      daysSinceStart: 0,
      avgEvolutionsPerDay: 0,
      recentActivity: 0,
      featureCategories: new Map()
    };

    setupDashboard(container, stats);

    const categoriesSection = container.querySelector('.categories-section');
    expect(categoriesSection).toBeFalsy();
  });

  it('should create category items with bars', () => {
    const categories = new Map<string, number>();
    categories.set('UI/UX', 3);
    categories.set('Feature', 5);

    const stats: EvolutionStats = {
      totalEvolutions: 8,
      daysSinceStart: 4,
      avgEvolutionsPerDay: 2,
      recentActivity: 3,
      featureCategories: categories
    };

    setupDashboard(container, stats);

    const categoryItems = container.querySelectorAll('.category-item');
    expect(categoryItems.length).toBe(2);

    const firstItem = categoryItems[0];
    expect(firstItem.querySelector('.category-name')).toBeTruthy();
    expect(firstItem.querySelector('.category-count')).toBeTruthy();
    expect(firstItem.querySelector('.category-bar')).toBeTruthy();
  });

  it('should sort categories by count in descending order', () => {
    const categories = new Map<string, number>();
    categories.set('UI/UX', 3);
    categories.set('Feature', 5);
    categories.set('Testing', 1);

    const stats: EvolutionStats = {
      totalEvolutions: 9,
      daysSinceStart: 5,
      avgEvolutionsPerDay: 1.8,
      recentActivity: 4,
      featureCategories: categories
    };

    setupDashboard(container, stats);

    const categoryItems = container.querySelectorAll('.category-item');
    
    // First should be Feature (5), then UI/UX (3), then Testing (1)
    expect(categoryItems[0].querySelector('.category-name')?.textContent).toBe('Feature');
    expect(categoryItems[0].querySelector('.category-count')?.textContent).toBe('5');
    expect(categoryItems[1].querySelector('.category-name')?.textContent).toBe('UI/UX');
    expect(categoryItems[2].querySelector('.category-name')?.textContent).toBe('Testing');
  });

  it('should clear existing content before rendering', () => {
    container.innerHTML = '<p>Old content</p>';

    const stats: EvolutionStats = {
      totalEvolutions: 1,
      daysSinceStart: 1,
      avgEvolutionsPerDay: 1,
      recentActivity: 1,
      featureCategories: new Map()
    };

    setupDashboard(container, stats);

    expect(container.querySelector('p')).toBeFalsy();
    expect(container.querySelector('.stats-grid')).toBeTruthy();
  });
});
