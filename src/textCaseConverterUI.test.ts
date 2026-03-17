import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTextCaseConverterUI } from './textCaseConverterUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
});

describe('Text Case Converter UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    writeTextMock.mockClear();
  });

  describe('createTextCaseConverterUI', () => {
    it('creates a container with the correct id', () => {
      const el = createTextCaseConverterUI();
      expect(el.id).toBe('text-case-converter-dashboard');
    });

    it('contains the correct CSS class', () => {
      const el = createTextCaseConverterUI();
      expect(el.classList.contains('text-case-container')).toBe(true);
    });

    it('contains an input textarea', () => {
      const el = createTextCaseConverterUI();
      expect(el.querySelector('#tcc-input')).toBeTruthy();
    });

    it('contains a clear button', () => {
      const el = createTextCaseConverterUI();
      expect(el.querySelector('#tcc-clear-btn')).toBeTruthy();
    });

    it('contains a results container', () => {
      const el = createTextCaseConverterUI();
      expect(el.querySelector('#tcc-results')).toBeTruthy();
    });

    it('shows a placeholder message initially', () => {
      const el = createTextCaseConverterUI();
      const results = el.querySelector('#tcc-results')!;
      expect(results.querySelector('.tcc-placeholder')).toBeTruthy();
    });

    it('shows the section title', () => {
      const el = createTextCaseConverterUI();
      const title = el.querySelector('h2');
      expect(title?.textContent).toContain('Text Case Converter');
    });
  });

  describe('input interaction', () => {
    it('renders result rows when input is provided', () => {
      const el = createTextCaseConverterUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLTextAreaElement>('#tcc-input')!;
      input.value = 'hello world';
      input.dispatchEvent(new Event('input'));

      const rows = el.querySelectorAll('.tcc-result-row');
      expect(rows.length).toBe(10);
    });

    it('renders camelCase result', () => {
      const el = createTextCaseConverterUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLTextAreaElement>('#tcc-input')!;
      input.value = 'hello world';
      input.dispatchEvent(new Event('input'));

      const camelRow = el.querySelector('[data-case="camel"]');
      expect(camelRow?.querySelector('code')?.textContent).toBe('helloWorld');
    });

    it('renders snake_case result', () => {
      const el = createTextCaseConverterUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLTextAreaElement>('#tcc-input')!;
      input.value = 'hello world';
      input.dispatchEvent(new Event('input'));

      const snakeRow = el.querySelector('[data-case="snake"]');
      expect(snakeRow?.querySelector('code')?.textContent).toBe('hello_world');
    });

    it('renders SCREAMING_SNAKE_CASE result', () => {
      const el = createTextCaseConverterUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLTextAreaElement>('#tcc-input')!;
      input.value = 'hello world';
      input.dispatchEvent(new Event('input'));

      const row = el.querySelector('[data-case="screaming_snake"]');
      expect(row?.querySelector('code')?.textContent).toBe('HELLO_WORLD');
    });

    it('restores placeholder when input is cleared via clear button', () => {
      const el = createTextCaseConverterUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLTextAreaElement>('#tcc-input')!;
      input.value = 'hello world';
      input.dispatchEvent(new Event('input'));

      const clearBtn = el.querySelector<HTMLButtonElement>('#tcc-clear-btn')!;
      clearBtn.click();

      expect(input.value).toBe('');
      expect(el.querySelector('.tcc-placeholder')).toBeTruthy();
    });

    it('shows placeholder for whitespace-only input', () => {
      const el = createTextCaseConverterUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLTextAreaElement>('#tcc-input')!;
      input.value = '   ';
      input.dispatchEvent(new Event('input'));

      expect(el.querySelector('.tcc-placeholder')).toBeTruthy();
    });

    it('each result row has a copy button', () => {
      const el = createTextCaseConverterUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLTextAreaElement>('#tcc-input')!;
      input.value = 'hello world';
      input.dispatchEvent(new Event('input'));

      const copyBtns = el.querySelectorAll('.tcc-copy-btn');
      expect(copyBtns.length).toBe(10);
    });

    it('copy button writes correct text to clipboard', async () => {
      const el = createTextCaseConverterUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLTextAreaElement>('#tcc-input')!;
      input.value = 'hello world';
      input.dispatchEvent(new Event('input'));

      const camelCopyBtn = el.querySelector<HTMLButtonElement>('[data-case="camel"].tcc-copy-btn')!;
      camelCopyBtn.click();

      await Promise.resolve();
      expect(writeTextMock).toHaveBeenCalledWith('helloWorld');
    });

    it('updates results when input changes', () => {
      const el = createTextCaseConverterUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLTextAreaElement>('#tcc-input')!;
      input.value = 'foo bar';
      input.dispatchEvent(new Event('input'));

      const row = el.querySelector('[data-case="pascal"]');
      expect(row?.querySelector('code')?.textContent).toBe('FooBar');
    });
  });
});
