import { describe, it, expect } from 'vitest';
import { parseChangelog } from './changelogParser';

describe('parseChangelog', () => {
  it('should parse a single changelog entry', () => {
    const readme = `
# Chimera

Some content here...

### Day 0: 2026-01-18
**Feature/Change**: Initial Setup
**Description**: Created the base Chimera framework with Vite + TypeScript, GitHub Actions workflow for daily evolution, and this changelog system.
**Files Modified**: All initial files

---
`;

    const entries = parseChangelog(readme);
    
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({
      day: '0',
      date: '2026-01-18',
      feature: 'Initial Setup',
      description: 'Created the base Chimera framework with Vite + TypeScript, GitHub Actions workflow for daily evolution, and this changelog system.',
      filesModified: 'All initial files'
    });
  });

  it('should parse multiple changelog entries', () => {
    const readme = `
### Day 0: 2026-01-18
**Feature/Change**: Initial Setup
**Description**: Created the base framework.
**Files Modified**: All initial files

---

### Day 1: 2026-01-19
**Feature/Change**: New Feature
**Description**: Added a cool new feature.
**Files Modified**: src/main.ts, src/feature.ts

---
`;

    const entries = parseChangelog(readme);
    
    expect(entries).toHaveLength(2);
    expect(entries[0].day).toBe('0');
    expect(entries[1].day).toBe('1');
  });

  it('should return empty array for invalid content', () => {
    const readme = 'Just some random text without changelog entries';
    const entries = parseChangelog(readme);
    
    expect(entries).toHaveLength(0);
  });

  it('should handle entries without trailing dashes', () => {
    const readme = `
### Day 0: 2026-01-18
**Feature/Change**: Test
**Description**: Test description.
**Files Modified**: test.ts`;

    const entries = parseChangelog(readme);
    
    expect(entries).toHaveLength(1);
    expect(entries[0].feature).toBe('Test');
  });
});
