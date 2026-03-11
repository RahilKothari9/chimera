import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCronParserUI } from './cronParserUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

describe('createCronParserUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('returns an element with the correct id', () => {
    const el = createCronParserUI();
    expect(el.id).toBe('cron-parser-dashboard');
  });

  it('contains a cron expression input', () => {
    const el = createCronParserUI();
    const input = el.querySelector<HTMLInputElement>('#cron-expression-input');
    expect(input).toBeTruthy();
  });

  it('has a default value of "* * * * *" in the input', () => {
    const el = createCronParserUI();
    const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
    expect(input.value).toBe('* * * * *');
  });

  it('contains a Parse button', () => {
    const el = createCronParserUI();
    expect(el.querySelector('#cron-parse-btn')).toBeTruthy();
  });

  it('shows a validation banner', () => {
    const el = createCronParserUI();
    document.body.appendChild(el);
    const banner = el.querySelector('#cron-validation-banner');
    expect(banner).toBeTruthy();
  });

  it('shows the summary text element', () => {
    const el = createCronParserUI();
    expect(el.querySelector('#cron-summary-text')).toBeTruthy();
  });

  it('shows the breakdown grid', () => {
    const el = createCronParserUI();
    expect(el.querySelector('#cron-breakdown-grid')).toBeTruthy();
  });

  it('renders presets', () => {
    const el = createCronParserUI();
    document.body.appendChild(el);
    const presets = el.querySelectorAll('.cron-preset-btn');
    expect(presets.length).toBeGreaterThan(0);
  });

  it('auto-parses the default expression on load', () => {
    const el = createCronParserUI();
    document.body.appendChild(el);
    const banner = el.querySelector<HTMLDivElement>('#cron-validation-banner')!;
    expect(banner.textContent).toContain('Valid');
  });

  describe('Parse button', () => {
    it('shows valid banner for valid expression', () => {
      const el = createCronParserUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
      input.value = '0 9 * * 1-5';
      el.querySelector<HTMLButtonElement>('#cron-parse-btn')!.click();

      const banner = el.querySelector<HTMLDivElement>('#cron-validation-banner')!;
      expect(banner.textContent).toContain('Valid');
      expect(banner.classList.contains('cron-banner-success')).toBe(true);
    });

    it('shows error banner for invalid expression', () => {
      const el = createCronParserUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
      input.value = '60 * * * *';
      el.querySelector<HTMLButtonElement>('#cron-parse-btn')!.click();

      const banner = el.querySelector<HTMLDivElement>('#cron-validation-banner')!;
      expect(banner.textContent).toContain('❌');
      expect(banner.classList.contains('cron-banner-error')).toBe(true);
    });

    it('shows error banner for wrong field count', () => {
      const el = createCronParserUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
      input.value = '* * * *';
      el.querySelector<HTMLButtonElement>('#cron-parse-btn')!.click();

      const banner = el.querySelector<HTMLDivElement>('#cron-validation-banner')!;
      expect(banner.classList.contains('cron-banner-error')).toBe(true);
    });

    it('renders 5 field breakdown cards for a valid expression', () => {
      const el = createCronParserUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
      input.value = '*/5 * * * *';
      el.querySelector<HTMLButtonElement>('#cron-parse-btn')!.click();

      const cards = el.querySelectorAll('.cron-field-card');
      expect(cards.length).toBe(5);
    });

    it('shows next runs for valid expression', () => {
      const el = createCronParserUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
      input.value = '* * * * *';
      el.querySelector<HTMLButtonElement>('#cron-parse-btn')!.click();

      const items = el.querySelectorAll('.cron-next-item:not(.cron-empty)');
      expect(items.length).toBe(5);
    });

    it('updates summary text for valid expression', () => {
      const el = createCronParserUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
      input.value = '* * * * *';
      el.querySelector<HTMLButtonElement>('#cron-parse-btn')!.click();

      const summary = el.querySelector<HTMLDivElement>('#cron-summary-text')!;
      expect(summary.textContent).not.toBe('—');
      expect(summary.textContent!.toLowerCase()).toContain('every minute');
    });
  });

  describe('Keyboard interaction', () => {
    it('parses expression when Enter is pressed', () => {
      const el = createCronParserUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
      input.value = '0 12 * * *';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      const banner = el.querySelector<HTMLDivElement>('#cron-validation-banner')!;
      expect(banner.classList.contains('cron-banner-success')).toBe(true);
    });
  });

  describe('Presets', () => {
    it('clicking a preset updates the input and parses it', () => {
      const el = createCronParserUI();
      document.body.appendChild(el);

      const firstPreset = el.querySelector<HTMLButtonElement>('.cron-preset-btn')!;
      const expectedExpr = firstPreset.dataset.expression!;
      firstPreset.click();

      const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
      expect(input.value).toBe(expectedExpr);

      const banner = el.querySelector<HTMLDivElement>('#cron-validation-banner')!;
      expect(banner.classList.contains('cron-banner-success')).toBe(true);
    });
  });

  describe('Empty input', () => {
    it('clears results when input is empty and parsed', () => {
      const el = createCronParserUI();
      document.body.appendChild(el);

      const input = el.querySelector<HTMLInputElement>('#cron-expression-input')!;
      input.value = '';
      el.querySelector<HTMLButtonElement>('#cron-parse-btn')!.click();

      const summary = el.querySelector<HTMLDivElement>('#cron-summary-text')!;
      expect(summary.textContent).toBe('—');
    });
  });
});
