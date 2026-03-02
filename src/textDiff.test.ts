import { describe, it, expect } from 'vitest';
import { computeDiff, toUnifiedString } from './textDiff';

describe('computeDiff', () => {
  it('returns empty result for two empty strings', () => {
    const result = computeDiff('', '');
    expect(result.lines).toHaveLength(0);
    expect(result.stats).toEqual({ added: 0, removed: 0, unchanged: 0 });
  });

  it('marks all lines as added when original is empty', () => {
    const result = computeDiff('', 'foo\nbar');
    expect(result.stats).toEqual({ added: 2, removed: 0, unchanged: 0 });
    expect(result.lines.every(l => l.type === 'added')).toBe(true);
  });

  it('marks all lines as removed when modified is empty', () => {
    const result = computeDiff('foo\nbar', '');
    expect(result.stats).toEqual({ added: 0, removed: 2, unchanged: 0 });
    expect(result.lines.every(l => l.type === 'removed')).toBe(true);
  });

  it('marks all lines as unchanged for identical strings', () => {
    const text = 'hello\nworld\nfoo';
    const result = computeDiff(text, text);
    expect(result.stats).toEqual({ added: 0, removed: 0, unchanged: 3 });
    expect(result.lines.every(l => l.type === 'unchanged')).toBe(true);
  });

  it('detects a single added line', () => {
    const result = computeDiff('a\nb', 'a\nx\nb');
    expect(result.stats.added).toBe(1);
    expect(result.stats.unchanged).toBe(2);
    const added = result.lines.find(l => l.type === 'added');
    expect(added?.line).toBe('x');
  });

  it('detects a single removed line', () => {
    const result = computeDiff('a\nx\nb', 'a\nb');
    expect(result.stats.removed).toBe(1);
    expect(result.stats.unchanged).toBe(2);
    const removed = result.lines.find(l => l.type === 'removed');
    expect(removed?.line).toBe('x');
  });

  it('detects a changed line (remove + add)', () => {
    const result = computeDiff('hello world', 'hello there');
    expect(result.stats.removed).toBe(1);
    expect(result.stats.added).toBe(1);
    expect(result.stats.unchanged).toBe(0);
  });

  it('assigns left line numbers to removed and unchanged lines', () => {
    const result = computeDiff('a\nb\nc', 'a\nc');
    const aLine = result.lines.find(l => l.line === 'a');
    expect(aLine?.leftLineNum).toBe(1);
    const bLine = result.lines.find(l => l.line === 'b');
    expect(bLine?.leftLineNum).toBe(2);
    const cLine = result.lines.find(l => l.line === 'c');
    expect(cLine?.leftLineNum).toBe(3);
  });

  it('assigns right line numbers to added and unchanged lines', () => {
    const result = computeDiff('a\nc', 'a\nb\nc');
    const aLine = result.lines.find(l => l.line === 'a');
    expect(aLine?.rightLineNum).toBe(1);
    const bLine = result.lines.find(l => l.type === 'added' && l.line === 'b');
    expect(bLine?.rightLineNum).toBe(2);
    const cLine = result.lines.find(l => l.line === 'c' && l.type === 'unchanged');
    expect(cLine?.rightLineNum).toBe(3);
  });

  it('does not assign rightLineNum to removed lines', () => {
    const result = computeDiff('a\nb', 'a');
    const removed = result.lines.find(l => l.type === 'removed');
    expect(removed?.rightLineNum).toBeUndefined();
  });

  it('does not assign leftLineNum to added lines', () => {
    const result = computeDiff('a', 'a\nb');
    const added = result.lines.find(l => l.type === 'added');
    expect(added?.leftLineNum).toBeUndefined();
  });

  it('handles single-line strings correctly', () => {
    const result = computeDiff('foo', 'bar');
    expect(result.stats).toEqual({ added: 1, removed: 1, unchanged: 0 });
  });

  it('handles strings with blank lines', () => {
    const result = computeDiff('a\n\nb', 'a\n\nb');
    expect(result.stats.unchanged).toBe(3);
  });

  it('handles a completely replaced block', () => {
    const result = computeDiff('a\nb\nc', 'x\ny\nz');
    expect(result.stats.removed).toBe(3);
    expect(result.stats.added).toBe(3);
    expect(result.stats.unchanged).toBe(0);
  });

  it('orders lines correctly in output', () => {
    const result = computeDiff('a\nb\nc', 'a\nX\nc');
    const types = result.lines.map(l => l.type);
    expect(types[0]).toBe('unchanged'); // a
    expect(types).toContain('removed');  // b
    expect(types).toContain('added');    // X
    expect(types[types.length - 1]).toBe('unchanged'); // c
  });

  it('handles large inputs without stack overflow (iterative fallback note)', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line ${i}`).join('\n');
    const result = computeDiff(lines, lines);
    expect(result.stats.unchanged).toBe(100);
    expect(result.stats.added).toBe(0);
    expect(result.stats.removed).toBe(0);
  });
});

describe('toUnifiedString', () => {
  it('prefixes added lines with "+ "', () => {
    const result = computeDiff('', 'hello');
    const output = toUnifiedString(result);
    expect(output).toBe('+ hello');
  });

  it('prefixes removed lines with "- "', () => {
    const result = computeDiff('hello', '');
    const output = toUnifiedString(result);
    expect(output).toBe('- hello');
  });

  it('prefixes unchanged lines with "  "', () => {
    const result = computeDiff('hello', 'hello');
    const output = toUnifiedString(result);
    expect(output).toBe('  hello');
  });

  it('produces correct unified output for a mixed diff', () => {
    const result = computeDiff('a\nb\nc', 'a\nX\nc');
    const output = toUnifiedString(result);
    const lines = output.split('\n');
    expect(lines[0]).toBe('  a');
    expect(lines).toContain('- b');
    expect(lines).toContain('+ X');
    expect(lines[lines.length - 1]).toBe('  c');
  });

  it('returns empty string for empty inputs', () => {
    const result = computeDiff('', '');
    expect(toUnifiedString(result)).toBe('');
  });
});
