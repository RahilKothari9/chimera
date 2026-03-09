import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUUIDGeneratorUI } from './uuidGeneratorUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
});

describe('UUID Generator UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    writeTextMock.mockClear();
  });

  describe('createUUIDGeneratorUI', () => {
    it('creates a container with the correct id', () => {
      const el = createUUIDGeneratorUI();
      expect(el.id).toBe('uuid-generator-dashboard');
    });

    it('contains a count select', () => {
      const el = createUUIDGeneratorUI();
      expect(el.querySelector('#uuid-gen-count')).toBeTruthy();
    });

    it('contains a format select', () => {
      const el = createUUIDGeneratorUI();
      const sel = el.querySelector<HTMLSelectElement>('#uuid-gen-format');
      expect(sel).toBeTruthy();
      expect(sel!.value).toBe('lowercase');
    });

    it('format select has lowercase, uppercase, and no-hyphens options', () => {
      const el = createUUIDGeneratorUI();
      const sel = el.querySelector<HTMLSelectElement>('#uuid-gen-format')!;
      const values = Array.from(sel.options).map(o => o.value);
      expect(values).toContain('lowercase');
      expect(values).toContain('uppercase');
      expect(values).toContain('no-hyphens');
    });

    it('contains a generate button', () => {
      const el = createUUIDGeneratorUI();
      const btn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn');
      expect(btn).toBeTruthy();
      expect(btn!.textContent).toContain('Generate');
    });

    it('contains a clear button', () => {
      const el = createUUIDGeneratorUI();
      expect(el.querySelector('#uuid-gen-clear-btn')).toBeTruthy();
    });

    it('contains a copy-all button that is initially hidden', () => {
      const el = createUUIDGeneratorUI();
      const btn = el.querySelector<HTMLButtonElement>('#uuid-gen-copy-all-btn')!;
      expect(btn).toBeTruthy();
      expect(btn.hidden).toBe(true);
    });

    it('contains a UUID list element', () => {
      const el = createUUIDGeneratorUI();
      expect(el.querySelector('#uuid-gen-list')).toBeTruthy();
    });

    it('list is empty initially', () => {
      const el = createUUIDGeneratorUI();
      const list = el.querySelector('#uuid-gen-list')!;
      expect(list.children).toHaveLength(0);
    });

    it('contains a validator input', () => {
      const el = createUUIDGeneratorUI();
      expect(el.querySelector('#uuid-gen-validate-input')).toBeTruthy();
    });
  });

  describe('Generate button', () => {
    it('renders list items after clicking generate', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const list = el.querySelector<HTMLOListElement>('#uuid-gen-list')!;

      generateBtn.click();

      expect(list.children.length).toBeGreaterThan(0);
    });

    it('default count of 1 renders exactly 1 item', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const list = el.querySelector<HTMLOListElement>('#uuid-gen-list')!;

      generateBtn.click();

      expect(list.children).toHaveLength(1);
    });

    it('selecting count 5 renders 5 items', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const countSelect = el.querySelector<HTMLSelectElement>('#uuid-gen-count')!;
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const list = el.querySelector<HTMLOListElement>('#uuid-gen-list')!;

      countSelect.value = '5';
      generateBtn.click();

      expect(list.children).toHaveLength(5);
    });

    it('renders UUID values in the correct format (lowercase)', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const list = el.querySelector<HTMLOListElement>('#uuid-gen-list')!;

      generateBtn.click();

      const code = list.querySelector<HTMLElement>('.uuid-gen-code')!;
      expect(code.textContent).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('uppercase format produces uppercase values', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const formatSelect = el.querySelector<HTMLSelectElement>('#uuid-gen-format')!;
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const list = el.querySelector<HTMLOListElement>('#uuid-gen-list')!;

      formatSelect.value = 'uppercase';
      generateBtn.click();

      const code = list.querySelector<HTMLElement>('.uuid-gen-code')!;
      expect(code.textContent).toBe(code.textContent!.toUpperCase());
    });

    it('no-hyphens format produces 32-char strings without hyphens', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const formatSelect = el.querySelector<HTMLSelectElement>('#uuid-gen-format')!;
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const list = el.querySelector<HTMLOListElement>('#uuid-gen-list')!;

      formatSelect.value = 'no-hyphens';
      generateBtn.click();

      const code = list.querySelector<HTMLElement>('.uuid-gen-code')!;
      expect(code.textContent).toHaveLength(32);
      expect(code.textContent).not.toContain('-');
    });

    it('each generated item has a copy button', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const countSelect = el.querySelector<HTMLSelectElement>('#uuid-gen-count')!;
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;

      countSelect.value = '5';
      generateBtn.click();

      const copyBtns = el.querySelectorAll('.uuid-gen-copy-btn');
      expect(copyBtns).toHaveLength(5);
    });

    it('shows the Copy All button after generating', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const copyAllBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-copy-all-btn')!;

      generateBtn.click();

      expect(copyAllBtn.hidden).toBe(false);
    });

    it('renders numbered index labels', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const countSelect = el.querySelector<HTMLSelectElement>('#uuid-gen-count')!;
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;

      countSelect.value = '5';
      generateBtn.click();

      const indices = el.querySelectorAll('.uuid-gen-index');
      expect(indices[0].textContent).toContain('1');
      expect(indices[1].textContent).toContain('2');
      expect(indices[2].textContent).toContain('3');
    });
  });

  describe('Clear button', () => {
    it('empties the list', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const clearBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-clear-btn')!;
      const list = el.querySelector<HTMLOListElement>('#uuid-gen-list')!;

      generateBtn.click();
      clearBtn.click();

      expect(list.children).toHaveLength(0);
    });

    it('hides the Copy All button', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const clearBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-clear-btn')!;
      const copyAllBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-copy-all-btn')!;

      generateBtn.click();
      clearBtn.click();

      expect(copyAllBtn.hidden).toBe(true);
    });
  });

  describe('Copy buttons', () => {
    it('calls clipboard.writeText when a per-item copy button is clicked', async () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;

      generateBtn.click();
      const copyBtn = el.querySelector<HTMLButtonElement>('.uuid-gen-copy-btn')!;
      copyBtn.click();
      await new Promise(r => setTimeout(r, 20));

      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });

    it('calls clipboard.writeText with the UUID value', async () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;

      generateBtn.click();
      const code = el.querySelector<HTMLElement>('.uuid-gen-code')!;
      const expectedValue = code.textContent ?? '';
      const copyBtn = el.querySelector<HTMLButtonElement>('.uuid-gen-copy-btn')!;
      copyBtn.click();
      await new Promise(r => setTimeout(r, 20));

      expect(writeTextMock).toHaveBeenCalledWith(expectedValue);
    });

    it('Copy All writes all UUIDs joined by newlines', async () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const countSelect = el.querySelector<HTMLSelectElement>('#uuid-gen-count')!;
      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
      const copyAllBtn = el.querySelector<HTMLButtonElement>('#uuid-gen-copy-all-btn')!;

      countSelect.value = '3';
      generateBtn.click();
      const uuids = Array.from(el.querySelectorAll<HTMLElement>('.uuid-gen-code')).map(c => c.textContent ?? '');
      copyAllBtn.click();
      await new Promise(r => setTimeout(r, 20));

      expect(writeTextMock).toHaveBeenCalledWith(uuids.join('\n'));
    });
  });

  describe('UUID Validator', () => {
    it('badge is empty initially', () => {
      const el = createUUIDGeneratorUI();
      const badge = el.querySelector<HTMLSpanElement>('#uuid-gen-validate-badge')!;
      expect(badge.textContent).toBe('');
    });

    it('shows valid badge for a well-formed UUID', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const input = el.querySelector<HTMLInputElement>('#uuid-gen-validate-input')!;
      const badge = el.querySelector<HTMLSpanElement>('#uuid-gen-validate-badge')!;

      input.value = '550e8400-e29b-41d4-a716-446655440000';
      input.dispatchEvent(new Event('input'));

      expect(badge.textContent).toContain('Valid');
    });

    it('shows invalid badge for a non-UUID string', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const input = el.querySelector<HTMLInputElement>('#uuid-gen-validate-input')!;
      const badge = el.querySelector<HTMLSpanElement>('#uuid-gen-validate-badge')!;

      input.value = 'not-a-uuid';
      input.dispatchEvent(new Event('input'));

      expect(badge.textContent).toContain('Invalid');
    });

    it('clears the badge when input is emptied', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const input = el.querySelector<HTMLInputElement>('#uuid-gen-validate-input')!;
      const badge = el.querySelector<HTMLSpanElement>('#uuid-gen-validate-badge')!;

      input.value = 'something';
      input.dispatchEvent(new Event('input'));
      input.value = '';
      input.dispatchEvent(new Event('input'));

      expect(badge.textContent).toBe('');
    });

    it('adds valid CSS class for a valid UUID', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const input = el.querySelector<HTMLInputElement>('#uuid-gen-validate-input')!;
      const badge = el.querySelector<HTMLSpanElement>('#uuid-gen-validate-badge')!;

      input.value = '550e8400-e29b-41d4-a716-446655440000';
      input.dispatchEvent(new Event('input'));

      expect(badge.className).toContain('uuid-gen-badge-valid');
    });

    it('adds invalid CSS class for an invalid string', () => {
      const el = createUUIDGeneratorUI();
      document.body.appendChild(el);
      const input = el.querySelector<HTMLInputElement>('#uuid-gen-validate-input')!;
      const badge = el.querySelector<HTMLSpanElement>('#uuid-gen-validate-badge')!;

      input.value = 'bad-value';
      input.dispatchEvent(new Event('input'));

      expect(badge.className).toContain('uuid-gen-badge-invalid');
    });
  });
});
