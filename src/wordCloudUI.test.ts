import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createWordCloudUI } from './wordCloudUI';
import type { ChangelogEntry } from './changelogParser';

function makeEntry(day: string, feature: string, description: string): ChangelogEntry {
  return { day, date: `2026-01-${day.padStart(2, '0')}`, feature, description, filesModified: '' };
}

describe('createWordCloudUI', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns an HTMLElement', () => {
    const el = createWordCloudUI([]);
    expect(el instanceof HTMLElement).toBe(true);
  });

  it('shows empty message when entries array is empty', () => {
    const el = createWordCloudUI([]);
    expect(el.textContent).toContain('No evolution data');
  });

  it('renders the section title when entries are provided', () => {
    const entries = [
      makeEntry('1', 'Interactive Dashboard', 'A comprehensive dashboard showing evolution metrics'),
    ];
    const el = createWordCloudUI(entries);
    expect(el.textContent).toContain('Evolution Word Cloud');
  });

  it('renders word cloud words', () => {
    const entries = [
      makeEntry('1', 'Dashboard Metrics', 'Interactive dashboard for code metrics analysis'),
      makeEntry('2', 'Dashboard Update', 'Better dashboard performance improvements'),
    ];
    const el = createWordCloudUI(entries);
    const cloud = el.querySelector('#wc-cloud');
    expect(cloud).not.toBeNull();
    const words = cloud!.querySelectorAll('.wc-word');
    expect(words.length).toBeGreaterThan(0);
  });

  it('renders top 10 list', () => {
    const entries = Array.from({ length: 20 }, (_, i) =>
      makeEntry(String(i + 1), `feature${i} analysis`, `detailed analysis of code metrics${i}`)
    );
    const el = createWordCloudUI(entries);
    const topList = el.querySelector('#wc-top-list');
    expect(topList).not.toBeNull();
    const items = topList!.querySelectorAll('.wc-top-item');
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(10);
  });

  it('sets font size based on word weight', () => {
    const entries = [
      makeEntry('1', 'testing testing testing', 'testing testing testing testing'),
      makeEntry('2', 'coding once', 'coding once here'),
    ];
    const el = createWordCloudUI(entries);
    const wordSpans = el.querySelectorAll<HTMLElement>('.wc-word');
    const sizes = Array.from(wordSpans).map(s => parseFloat(s.style.fontSize));
    // There should be variation in sizes
    const hasVariation = sizes.some((s, i) => i > 0 && s !== sizes[0]);
    expect(hasVariation).toBe(true);
  });

  it('word spans have title tooltips showing count', () => {
    const entries = [
      makeEntry('1', 'dashboard dashboard', 'dashboard analysis dashboard'),
    ];
    const el = createWordCloudUI(entries);
    const cloud = el.querySelector('#wc-cloud')!;
    const wordSpan = cloud.querySelector<HTMLElement>('.wc-word[title]');
    expect(wordSpan).not.toBeNull();
    expect(wordSpan!.title).toMatch(/appears \d+ time/);
  });

  it('shows description with entry count', () => {
    const entries = [
      makeEntry('1', 'Timeline Feature', 'A beautiful timeline showing evolution history'),
      makeEntry('2', 'Dashboard Update', 'Updated dashboard with new metrics'),
    ];
    const el = createWordCloudUI(entries);
    expect(el.textContent).toContain('2');
  });

  it('shows not enough data message when all words are stop words', () => {
    // Very short/stop words only
    const entries = [makeEntry('1', 'a an the', 'is was be')];
    const el = createWordCloudUI(entries);
    // Either empty message or cloud with no words
    const cloud = el.querySelector('#wc-cloud');
    if (cloud) {
      const words = cloud.querySelectorAll('.wc-word');
      // Either cloud is empty or not shown
      expect(words.length).toBe(0);
    } else {
      expect(el.textContent).toContain('Not enough');
    }
  });

  it('top list items have rank, term and count', () => {
    const entries = [
      makeEntry('1', 'analysis analysis', 'detailed analysis metrics analysis'),
    ];
    const el = createWordCloudUI(entries);
    const firstItem = el.querySelector('.wc-top-item');
    expect(firstItem).not.toBeNull();
    expect(firstItem!.querySelector('.wc-rank')).not.toBeNull();
    expect(firstItem!.querySelector('.wc-term')).not.toBeNull();
    expect(firstItem!.querySelector('.wc-count')).not.toBeNull();
  });

  it('respects up to 60 word limit in cloud', () => {
    const entries = Array.from({ length: 100 }, (_, i) =>
      makeEntry(String(i + 1), `uniqueterm${i} anotherterm${i}`, `description${i} detail${i}`)
    );
    const el = createWordCloudUI(entries);
    const cloud = el.querySelector('#wc-cloud');
    const words = cloud?.querySelectorAll('.wc-word') ?? [];
    expect(words.length).toBeLessThanOrEqual(60);
  });
});
