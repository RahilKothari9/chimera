import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createHashGeneratorUI } from './hashGeneratorUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
});

describe('Hash Generator UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    writeTextMock.mockClear();
  });

  describe('createHashGeneratorUI', () => {
    it('creates a container with the correct id', () => {
      const el = createHashGeneratorUI();
      expect(el.id).toBe('hash-generator-dashboard');
    });

    it('contains a textarea for input', () => {
      const el = createHashGeneratorUI();
      expect(el.querySelector('#hash-gen-input')).toBeTruthy();
    });

    it('contains a compute button', () => {
      const el = createHashGeneratorUI();
      const btn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn');
      expect(btn).toBeTruthy();
      expect(btn!.textContent).toContain('Compute Hashes');
    });

    it('contains a clear button', () => {
      const el = createHashGeneratorUI();
      expect(el.querySelector('#hash-gen-clear-btn')).toBeTruthy();
    });

    it('contains a format select', () => {
      const el = createHashGeneratorUI();
      const sel = el.querySelector<HTMLSelectElement>('#hash-gen-format');
      expect(sel).toBeTruthy();
      expect(sel!.value).toBe('hex');
    });

    it('format select has hex and base64 options', () => {
      const el = createHashGeneratorUI();
      const sel = el.querySelector<HTMLSelectElement>('#hash-gen-format')!;
      const values = Array.from(sel.options).map(o => o.value);
      expect(values).toContain('hex');
      expect(values).toContain('base64');
    });

    it('results panel is hidden initially', () => {
      const el = createHashGeneratorUI();
      const results = el.querySelector<HTMLDivElement>('#hash-gen-results')!;
      expect(results.hidden).toBe(true);
    });

    it('error panel is hidden initially', () => {
      const el = createHashGeneratorUI();
      const errorEl = el.querySelector<HTMLDivElement>('#hash-gen-error')!;
      expect(errorEl.hidden).toBe(true);
    });
  });

  describe('Compute Hashes', () => {
    it('shows results table after computing hashes', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;
      const resultsEl = el.querySelector<HTMLDivElement>('#hash-gen-results')!;

      inputTA.value = 'hello';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      expect(resultsEl.hidden).toBe(false);
    });

    it('renders 4 rows (one per algorithm)', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;
      const tbody = el.querySelector<HTMLTableSectionElement>('#hash-gen-tbody')!;

      inputTA.value = 'test';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      const rows = tbody.querySelectorAll('tr');
      expect(rows).toHaveLength(4);
    });

    it('displays SHA-256 badge in results', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;

      inputTA.value = 'chimera';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      expect(el.textContent).toContain('SHA-256');
    });

    it('shows correct SHA-256 hex for "hello"', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;

      inputTA.value = 'hello';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      const codes = el.querySelectorAll<HTMLElement>('.hash-gen-value');
      const sha256Row = Array.from(codes).find(c => c.dataset.alg === 'SHA-256');
      expect(sha256Row).toBeTruthy();
      expect(sha256Row!.textContent).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    it('displays bit-width labels', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;

      inputTA.value = 'bits';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      expect(el.textContent).toContain('256-bit');
      expect(el.textContent).toContain('512-bit');
    });

    it('works with empty input', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;
      const resultsEl = el.querySelector<HTMLDivElement>('#hash-gen-results')!;

      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      expect(resultsEl.hidden).toBe(false);
    });

    it('switches to base64 format when format changes', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;
      const formatSelect = el.querySelector<HTMLSelectElement>('#hash-gen-format')!;

      inputTA.value = 'hello';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      formatSelect.value = 'base64';
      formatSelect.dispatchEvent(new Event('change'));

      const codes = el.querySelectorAll<HTMLElement>('.hash-gen-value');
      const sha256Row = Array.from(codes).find(c => c.dataset.alg === 'SHA-256');
      // SHA-256 of "hello" in base64 should not be a plain hex string
      expect(sha256Row!.textContent).not.toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });
  });

  describe('Clear button', () => {
    it('clears input and hides results', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;
      const clearBtn = el.querySelector<HTMLButtonElement>('#hash-gen-clear-btn')!;
      const resultsEl = el.querySelector<HTMLDivElement>('#hash-gen-results')!;

      inputTA.value = 'hello';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      clearBtn.click();

      expect(inputTA.value).toBe('');
      expect(resultsEl.hidden).toBe(true);
    });

    it('clears the tbody rows', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;
      const clearBtn = el.querySelector<HTMLButtonElement>('#hash-gen-clear-btn')!;
      const tbody = el.querySelector<HTMLTableSectionElement>('#hash-gen-tbody')!;

      inputTA.value = 'hello';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      clearBtn.click();

      expect(tbody.innerHTML).toBe('');
    });
  });

  describe('Copy buttons', () => {
    it('renders a copy button per algorithm row', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;

      inputTA.value = 'hello';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      const copyBtns = el.querySelectorAll('.hash-gen-copy-btn');
      expect(copyBtns).toHaveLength(4);
    });

    it('calls clipboard.writeText when copy button is clicked', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const computeBtn = el.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;

      inputTA.value = 'hello';
      computeBtn.click();
      await new Promise(r => setTimeout(r, 50));

      const copyBtns = el.querySelectorAll<HTMLButtonElement>('.hash-gen-copy-btn');
      copyBtns[0].click();
      await new Promise(r => setTimeout(r, 20));

      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard shortcut', () => {
    it('triggers hashing on Ctrl+Enter in the textarea', async () => {
      const el = createHashGeneratorUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
      const resultsEl = el.querySelector<HTMLDivElement>('#hash-gen-results')!;

      inputTA.value = 'keyboard shortcut test';
      inputTA.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
      await new Promise(r => setTimeout(r, 50));

      expect(resultsEl.hidden).toBe(false);
    });
  });
});
