import { describe, it, expect } from 'vitest';
import { analyzeWordFrequency, getTopWords } from './wordCloud';
import type { ChangelogEntry } from './changelogParser';

function makeEntry(feature: string, description: string): ChangelogEntry {
  return { day: '1', date: '2026-01-18', feature, description, filesModified: '' };
}

describe('analyzeWordFrequency', () => {
  it('returns empty array for empty entries', () => {
    expect(analyzeWordFrequency([])).toEqual([]);
  });

  it('counts words from feature and description', () => {
    const entries = [
      makeEntry('Dashboard feature', 'A dashboard showing metrics dashboard data'),
    ];
    const result = analyzeWordFrequency(entries);
    const dashboardEntry = result.find(w => w.word === 'dashboard');
    expect(dashboardEntry).toBeDefined();
    expect(dashboardEntry!.count).toBe(3);
  });

  it('filters out stop words', () => {
    const entries = [makeEntry('the and but', 'this is that with from')];
    // All words are stop words or too short
    const result = analyzeWordFrequency(entries);
    expect(result.length).toBe(0);
  });

  it('filters out words shorter than 4 characters', () => {
    const entries = [makeEntry('add fix bug', 'run the app now')];
    const result = analyzeWordFrequency(entries);
    // 'add', 'fix', 'bug', 'run', 'app', 'now' are all length <= 3
    expect(result.every(w => w.word.length >= 4)).toBe(true);
  });

  it('filters out pure numbers', () => {
    const entries = [makeEntry('12345 67890', '100 200 testing')];
    const result = analyzeWordFrequency(entries);
    expect(result.every(w => !/^\d+$/.test(w.word))).toBe(true);
  });

  it('normalizes weight correctly (max count = 1.0)', () => {
    const entries = [
      makeEntry('testing testing testing', 'testing'),
      makeEntry('coding', 'coding'),
    ];
    const result = analyzeWordFrequency(entries);
    const testing = result.find(w => w.word === 'testing');
    expect(testing).toBeDefined();
    expect(testing!.weight).toBe(1);

    const coding = result.find(w => w.word === 'coding');
    expect(coding).toBeDefined();
    expect(coding!.weight).toBeLessThan(1);
    expect(coding!.weight).toBeGreaterThan(0);
  });

  it('sorts results by count descending', () => {
    const entries = [
      makeEntry('alpha', 'alpha alpha beta beta beta gamma'),
    ];
    const result = analyzeWordFrequency(entries);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count);
    }
  });

  it('handles multiple entries', () => {
    const entries = [
      makeEntry('timeline feature', 'shows timeline data'),
      makeEntry('timeline upgrade', 'better timeline performance'),
    ];
    const result = analyzeWordFrequency(entries);
    const timeline = result.find(w => w.word === 'timeline');
    expect(timeline).toBeDefined();
    expect(timeline!.count).toBe(4);
  });

  it('lowercases all words', () => {
    const entries = [makeEntry('Dashboard DASHBOARD DashBoard', '')];
    const result = analyzeWordFrequency(entries);
    const dashboard = result.find(w => w.word === 'dashboard');
    expect(dashboard).toBeDefined();
    expect(dashboard!.count).toBe(3);
    // No uppercase variants should appear
    expect(result.find(w => w.word === 'DASHBOARD')).toBeUndefined();
  });

  it('strips punctuation', () => {
    const entries = [makeEntry('interactive, interactive! interactive.', '')];
    const result = analyzeWordFrequency(entries);
    const word = result.find(w => w.word === 'interactive');
    expect(word).toBeDefined();
    expect(word!.count).toBe(3);
  });
});

describe('getTopWords', () => {
  it('returns empty array for empty entries', () => {
    expect(getTopWords([])).toEqual([]);
  });

  it('respects limit parameter', () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      makeEntry(`feature${i} word${i} topic${i}`, `description${i} detail${i}`)
    );
    const result = getTopWords(entries, 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('defaults to limit of 60', () => {
    // Create entries with many unique words
    const entries = Array.from({ length: 100 }, (_, i) =>
      makeEntry(`uniqueword${i} anotherword${i}`, `description${i}`)
    );
    const result = getTopWords(entries);
    expect(result.length).toBeLessThanOrEqual(60);
  });

  it('returns results sorted by frequency', () => {
    const entries = [
      makeEntry('analysis analysis analysis', 'analysis data'),
      makeEntry('metrics metrics', 'code metrics'),
    ];
    const result = getTopWords(entries);
    expect(result[0].word).toBe('analysis');
    expect(result[0].count).toBeGreaterThan(result[1].count);
  });
});
