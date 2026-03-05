import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTimestampConverterUI } from './timestampConverterUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
});

describe('TimestampConverterUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    writeTextMock.mockClear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createTimestampConverterUI – structure', () => {
    it('creates a container with the correct id', () => {
      const el = createTimestampConverterUI();
      expect(el.id).toBe('timestamp-converter-dashboard');
    });

    it('has a Unix → Date mode button', () => {
      const el = createTimestampConverterUI();
      const btn = el.querySelector('#ts-mode-to-date') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Unix');
    });

    it('has a Date → Unix mode button', () => {
      const el = createTimestampConverterUI();
      const btn = el.querySelector('#ts-mode-to-unix') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Date');
    });

    it('Unix → Date panel is visible by default', () => {
      const el = createTimestampConverterUI();
      const panel = el.querySelector<HTMLDivElement>('#ts-panel-to-date')!;
      expect(panel.hidden).toBe(false);
    });

    it('Date → Unix panel is hidden by default', () => {
      const el = createTimestampConverterUI();
      const panel = el.querySelector<HTMLDivElement>('#ts-panel-to-unix')!;
      expect(panel.hidden).toBe(true);
    });

    it('has a unix input field', () => {
      const el = createTimestampConverterUI();
      expect(el.querySelector('#ts-unix-input')).toBeTruthy();
    });

    it('has a "Use Now" button', () => {
      const el = createTimestampConverterUI();
      expect(el.querySelector('#ts-use-now-btn')).toBeTruthy();
    });

    it('has a convert button for Unix → Date', () => {
      const el = createTimestampConverterUI();
      expect(el.querySelector('#ts-convert-btn')).toBeTruthy();
    });

    it('has a date input field', () => {
      const el = createTimestampConverterUI();
      expect(el.querySelector('#ts-date-input')).toBeTruthy();
    });

    it('has a live clock bar', () => {
      const el = createTimestampConverterUI();
      expect(el.querySelector('#ts-live-bar')).toBeTruthy();
    });

    it('result grid is hidden initially', () => {
      const el = createTimestampConverterUI();
      const grid = el.querySelector<HTMLDivElement>('#ts-result-grid')!;
      expect(grid.hidden).toBe(true);
    });

    it('error element is hidden initially', () => {
      const el = createTimestampConverterUI();
      const err = el.querySelector<HTMLDivElement>('#ts-error')!;
      expect(err.hidden).toBe(true);
    });
  });

  describe('Mode switching', () => {
    it('switches to Date → Unix panel when clicking mode button', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      const toUnixBtn = el.querySelector<HTMLButtonElement>('#ts-mode-to-unix')!;
      toUnixBtn.click();

      expect(el.querySelector<HTMLDivElement>('#ts-panel-to-unix')!.hidden).toBe(false);
      expect(el.querySelector<HTMLDivElement>('#ts-panel-to-date')!.hidden).toBe(true);
    });

    it('switches back to Unix → Date panel', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLButtonElement>('#ts-mode-to-unix')!.click();
      el.querySelector<HTMLButtonElement>('#ts-mode-to-date')!.click();

      expect(el.querySelector<HTMLDivElement>('#ts-panel-to-date')!.hidden).toBe(false);
    });

    it('sets aria-pressed correctly when switching to Date → Unix', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      const toUnixBtn = el.querySelector<HTMLButtonElement>('#ts-mode-to-unix')!;
      toUnixBtn.click();

      expect(toUnixBtn.getAttribute('aria-pressed')).toBe('true');
      expect(el.querySelector<HTMLButtonElement>('#ts-mode-to-date')!.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('Unix → Date conversion', () => {
    it('shows error when input is empty', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLButtonElement>('#ts-convert-btn')!.click();

      const err = el.querySelector<HTMLDivElement>('#ts-error')!;
      expect(err.hidden).toBe(false);
      expect(err.textContent).toContain('Unix timestamp');
    });

    it('shows error when input is non-numeric', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLInputElement>('#ts-unix-input')!.value = 'abc';
      el.querySelector<HTMLButtonElement>('#ts-convert-btn')!.click();

      const err = el.querySelector<HTMLDivElement>('#ts-error')!;
      expect(err.hidden).toBe(false);
    });

    it('converts Unix epoch 0 to ISO 1970-01-01', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLInputElement>('#ts-unix-input')!.value = '0';
      el.querySelector<HTMLButtonElement>('#ts-convert-btn')!.click();

      expect(el.querySelector('#ts-r-iso')!.textContent).toContain('1970-01-01');
    });

    it('reveals the result grid after a successful conversion', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLInputElement>('#ts-unix-input')!.value = '1700000000';
      el.querySelector<HTMLButtonElement>('#ts-convert-btn')!.click();

      expect(el.querySelector<HTMLDivElement>('#ts-result-grid')!.hidden).toBe(false);
    });

    it('populates ISO, UTC, local, relative, dateOnly, timeOnly, dayOfWeek results', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLInputElement>('#ts-unix-input')!.value = '1700000000';
      el.querySelector<HTMLButtonElement>('#ts-convert-btn')!.click();

      expect(el.querySelector('#ts-r-iso')!.textContent!.length).toBeGreaterThan(0);
      expect(el.querySelector('#ts-r-utc')!.textContent!.length).toBeGreaterThan(0);
      expect(el.querySelector('#ts-r-local')!.textContent!.length).toBeGreaterThan(0);
      expect(el.querySelector('#ts-r-relative')!.textContent!.length).toBeGreaterThan(0);
      expect(el.querySelector('#ts-r-date-only')!.textContent!.length).toBeGreaterThan(0);
      expect(el.querySelector('#ts-r-time-only')!.textContent!.length).toBeGreaterThan(0);
      expect(el.querySelector('#ts-r-dow')!.textContent!.length).toBeGreaterThan(0);
    });

    it('populates unix seconds and milliseconds results', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLInputElement>('#ts-unix-input')!.value = '1000';
      el.querySelector<HTMLButtonElement>('#ts-convert-btn')!.click();

      expect(el.querySelector('#ts-r-unix-s')!.textContent).toBe('1000');
      expect(el.querySelector('#ts-r-unix-ms')!.textContent).toBe('1000000');
    });

    it('triggers conversion on Enter key in unix input', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      const input = el.querySelector<HTMLInputElement>('#ts-unix-input')!;
      input.value = '0';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(el.querySelector<HTMLDivElement>('#ts-result-grid')!.hidden).toBe(false);
    });
  });

  describe('"Use Now" button', () => {
    it('populates unix input with a non-empty numeric value', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLButtonElement>('#ts-use-now-btn')!.click();

      const val = el.querySelector<HTMLInputElement>('#ts-unix-input')!.value;
      expect(val).toBeTruthy();
      expect(/^\d+$/.test(val)).toBe(true);
    });

    it('populates with milliseconds when ms unit is selected', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      const msRadio = el.querySelector<HTMLInputElement>('input[value="milliseconds"]')!;
      msRadio.checked = true;
      el.querySelector<HTMLButtonElement>('#ts-use-now-btn')!.click();

      const val = el.querySelector<HTMLInputElement>('#ts-unix-input')!.value;
      expect(val).toBe('1700000000000');
    });
  });

  describe('Date → Unix conversion', () => {
    it('shows error when date input is empty', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLButtonElement>('#ts-mode-to-unix')!.click();
      el.querySelector<HTMLButtonElement>('#ts-date-convert-btn')!.click();

      const err = el.querySelector<HTMLDivElement>('#ts-error')!;
      expect(err.hidden).toBe(false);
    });

    it('shows error for unparseable date string', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLButtonElement>('#ts-mode-to-unix')!.click();
      el.querySelector<HTMLInputElement>('#ts-date-input')!.value = 'not-a-date!!!';
      el.querySelector<HTMLButtonElement>('#ts-date-convert-btn')!.click();

      expect(el.querySelector<HTMLDivElement>('#ts-error')!.hidden).toBe(false);
    });

    it('converts ISO date to Unix 0 for epoch', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLButtonElement>('#ts-mode-to-unix')!.click();
      el.querySelector<HTMLInputElement>('#ts-date-input')!.value = '1970-01-01T00:00:00.000Z';
      el.querySelector<HTMLButtonElement>('#ts-date-convert-btn')!.click();

      expect(el.querySelector('#ts-r2-unix-s')!.textContent).toBe('0');
      expect(el.querySelector('#ts-r2-unix-ms')!.textContent).toBe('0');
    });

    it('reveals the unix result grid after successful conversion', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLButtonElement>('#ts-mode-to-unix')!.click();
      el.querySelector<HTMLInputElement>('#ts-date-input')!.value = '2024-06-01T00:00:00Z';
      el.querySelector<HTMLButtonElement>('#ts-date-convert-btn')!.click();

      expect(el.querySelector<HTMLDivElement>('#ts-unix-result-grid')!.hidden).toBe(false);
    });

    it('triggers conversion on Enter key in date input', () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLButtonElement>('#ts-mode-to-unix')!.click();
      const input = el.querySelector<HTMLInputElement>('#ts-date-input')!;
      input.value = '1970-01-01T00:00:00.000Z';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(el.querySelector<HTMLDivElement>('#ts-unix-result-grid')!.hidden).toBe(false);
    });
  });

  describe('Copy buttons', () => {
    it('calls clipboard.writeText when a copy button is clicked after conversion', async () => {
      const el = createTimestampConverterUI();
      document.body.appendChild(el);
      el.querySelector<HTMLInputElement>('#ts-unix-input')!.value = '0';
      el.querySelector<HTMLButtonElement>('#ts-convert-btn')!.click();

      // Click the first copy button (ISO result)
      const copyBtn = el.querySelector<HTMLButtonElement>('.ts-copy-btn')!;
      copyBtn.click();

      await new Promise(r => setTimeout(r, 10));
      expect(writeTextMock).toHaveBeenCalled();
    });
  });
});
