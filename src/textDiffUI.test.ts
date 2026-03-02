import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTextDiffUI } from './textDiffUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

// Provide a minimal clipboard mock
const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
});

describe('Text Diff UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    writeTextMock.mockClear();
  });

  describe('createTextDiffUI', () => {
    it('creates a container with the correct id', () => {
      const el = createTextDiffUI();
      expect(el.id).toBe('text-diff-dashboard');
    });

    it('contains original textarea', () => {
      const el = createTextDiffUI();
      expect(el.querySelector('#diff-original')).toBeTruthy();
    });

    it('contains modified textarea', () => {
      const el = createTextDiffUI();
      expect(el.querySelector('#diff-modified')).toBeTruthy();
    });

    it('contains a Compare button', () => {
      const el = createTextDiffUI();
      const btn = el.querySelector('#diff-run-btn') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Compare');
    });

    it('contains a Clear button', () => {
      const el = createTextDiffUI();
      expect(el.querySelector('#diff-clear-btn')).toBeTruthy();
    });

    it('contains Side by Side view button', () => {
      const el = createTextDiffUI();
      const btn = el.querySelector('#diff-view-side') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Side by Side');
    });

    it('contains Unified view button', () => {
      const el = createTextDiffUI();
      const btn = el.querySelector('#diff-view-unified') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Unified');
    });

    it('contains a Copy Diff button', () => {
      const el = createTextDiffUI();
      const btn = el.querySelector('#diff-copy-btn') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Copy Diff');
    });

    it('renders initial diff from placeholder content', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);
      const output = el.querySelector('#diff-output') as HTMLDivElement;
      expect(output.innerHTML).not.toBe('');
    });

    it('shows stats after initial diff', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);
      const stats = el.querySelector('#diff-stats') as HTMLDivElement;
      expect(stats.hidden).toBe(false);
    });

    it('renders a diff table in side-by-side mode', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);
      const table = el.querySelector('.diff-table');
      expect(table).toBeTruthy();
    });
  });

  describe('Compare button', () => {
    it('updates output when Compare is clicked with new text', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      const original = el.querySelector('#diff-original') as HTMLTextAreaElement;
      const modified = el.querySelector('#diff-modified') as HTMLTextAreaElement;
      const runBtn = el.querySelector('#diff-run-btn') as HTMLButtonElement;
      const output = el.querySelector('#diff-output') as HTMLDivElement;

      original.value = 'hello';
      modified.value = 'world';
      runBtn.click();

      expect(output.innerHTML).toContain('hello');
      expect(output.innerHTML).toContain('world');
    });

    it('shows stats with added and removed counts', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      const original = el.querySelector('#diff-original') as HTMLTextAreaElement;
      const modified = el.querySelector('#diff-modified') as HTMLTextAreaElement;
      const runBtn = el.querySelector('#diff-run-btn') as HTMLButtonElement;
      const stats = el.querySelector('#diff-stats') as HTMLDivElement;

      original.value = 'a\nb';
      modified.value = 'a\nc';
      runBtn.click();

      expect(stats.textContent).toContain('1 added');
      expect(stats.textContent).toContain('1 removed');
    });

    it('shows "No differences" message for identical texts', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      const original = el.querySelector('#diff-original') as HTMLTextAreaElement;
      const modified = el.querySelector('#diff-modified') as HTMLTextAreaElement;
      const runBtn = el.querySelector('#diff-run-btn') as HTMLButtonElement;
      const output = el.querySelector('#diff-output') as HTMLDivElement;

      original.value = 'same text';
      modified.value = 'same text';
      runBtn.click();

      expect(output.textContent).toContain('identical');
    });
  });

  describe('Clear button', () => {
    it('clears both textareas', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      const original = el.querySelector('#diff-original') as HTMLTextAreaElement;
      const modified = el.querySelector('#diff-modified') as HTMLTextAreaElement;
      const clearBtn = el.querySelector('#diff-clear-btn') as HTMLButtonElement;

      original.value = 'foo';
      modified.value = 'bar';
      clearBtn.click();

      expect(original.value).toBe('');
      expect(modified.value).toBe('');
    });

    it('hides stats after clearing', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      const stats = el.querySelector('#diff-stats') as HTMLDivElement;
      const clearBtn = el.querySelector('#diff-clear-btn') as HTMLButtonElement;

      clearBtn.click();
      expect(stats.hidden).toBe(true);
    });

    it('clears the output after clearing', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      const output = el.querySelector('#diff-output') as HTMLDivElement;
      const clearBtn = el.querySelector('#diff-clear-btn') as HTMLButtonElement;

      clearBtn.click();
      expect(output.innerHTML).toBe('');
    });
  });

  describe('View mode toggle', () => {
    it('switches to unified view and re-renders', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      const original = el.querySelector('#diff-original') as HTMLTextAreaElement;
      const modified = el.querySelector('#diff-modified') as HTMLTextAreaElement;
      const runBtn = el.querySelector('#diff-run-btn') as HTMLButtonElement;
      const unifiedBtn = el.querySelector('#diff-view-unified') as HTMLButtonElement;

      original.value = 'a\nb';
      modified.value = 'a\nc';
      runBtn.click();

      unifiedBtn.click();
      expect(unifiedBtn.classList.contains('active')).toBe(true);
    });

    it('Side by Side button is active by default', () => {
      const el = createTextDiffUI();
      const sideBtn = el.querySelector('#diff-view-side') as HTMLButtonElement;
      expect(sideBtn.classList.contains('active')).toBe(true);
    });

    it('toggles active class when switching views', () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      const original = el.querySelector('#diff-original') as HTMLTextAreaElement;
      const modified = el.querySelector('#diff-modified') as HTMLTextAreaElement;
      const runBtn = el.querySelector('#diff-run-btn') as HTMLButtonElement;
      const sideBtn = el.querySelector('#diff-view-side') as HTMLButtonElement;
      const unifiedBtn = el.querySelector('#diff-view-unified') as HTMLButtonElement;

      original.value = 'x';
      modified.value = 'y';
      runBtn.click();

      unifiedBtn.click();
      expect(sideBtn.classList.contains('active')).toBe(false);
      expect(unifiedBtn.classList.contains('active')).toBe(true);

      sideBtn.click();
      expect(sideBtn.classList.contains('active')).toBe(true);
      expect(unifiedBtn.classList.contains('active')).toBe(false);
    });
  });

  describe('Copy Diff button', () => {
    it('calls clipboard writeText when diff is available', async () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      const copyBtn = el.querySelector('#diff-copy-btn') as HTMLButtonElement;
      copyBtn.click();

      await new Promise(r => setTimeout(r, 0));
      expect(writeTextMock).toHaveBeenCalled();
    });

    it('does not call clipboard when no diff has been run', async () => {
      const el = createTextDiffUI();
      document.body.appendChild(el);

      // Clear to reset state
      const clearBtn = el.querySelector('#diff-clear-btn') as HTMLButtonElement;
      clearBtn.click();
      writeTextMock.mockClear();

      const copyBtn = el.querySelector('#diff-copy-btn') as HTMLButtonElement;
      copyBtn.click();

      await new Promise(r => setTimeout(r, 0));
      expect(writeTextMock).not.toHaveBeenCalled();
    });
  });
});
