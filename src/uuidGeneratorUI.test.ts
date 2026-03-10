import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUuidGeneratorUI } from './uuidGeneratorUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
});

describe('createUuidGeneratorUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('returns an element with the correct id', () => {
    const el = createUuidGeneratorUI();
    expect(el.id).toBe('uuid-generator-dashboard');
  });

  it('contains a count input with default value 1', () => {
    const el = createUuidGeneratorUI();
    const input = el.querySelector<HTMLInputElement>('#uuid-count');
    expect(input).toBeTruthy();
    expect(input!.value).toBe('1');
  });

  it('contains a format select', () => {
    const el = createUuidGeneratorUI();
    expect(el.querySelector('#uuid-format')).toBeTruthy();
  });

  it('contains a generate button', () => {
    const el = createUuidGeneratorUI();
    expect(el.querySelector('#uuid-generate-btn')).toBeTruthy();
  });

  it('contains a validate input', () => {
    const el = createUuidGeneratorUI();
    expect(el.querySelector('#uuid-validate-input')).toBeTruthy();
  });

  it('shows empty state message before generating', () => {
    const el = createUuidGeneratorUI();
    expect(el.querySelector('.uuid-empty-state')).toBeTruthy();
  });

  describe('Generate button', () => {
    it('generates UUIDs when clicked', () => {
      const el = createUuidGeneratorUI();
      document.body.appendChild(el);

      const generateBtn = el.querySelector<HTMLButtonElement>('#uuid-generate-btn')!;
      generateBtn.click();

      const items = el.querySelectorAll('.uuid-item');
      expect(items.length).toBe(1);
    });

    it('generates multiple UUIDs when count > 1', () => {
      const el = createUuidGeneratorUI();
      document.body.appendChild(el);

      const countInput = el.querySelector<HTMLInputElement>('#uuid-count')!;
      countInput.value = '5';
      el.querySelector<HTMLButtonElement>('#uuid-generate-btn')!.click();

      expect(el.querySelectorAll('.uuid-item').length).toBe(5);
    });

    it('enables the Copy All and Clear buttons after generating', () => {
      const el = createUuidGeneratorUI();
      document.body.appendChild(el);

      const copyAllBtn = el.querySelector<HTMLButtonElement>('#uuid-copy-all-btn')!;
      const clearBtn = el.querySelector<HTMLButtonElement>('#uuid-clear-btn')!;

      expect(copyAllBtn.disabled).toBe(true);
      expect(clearBtn.disabled).toBe(true);

      el.querySelector<HTMLButtonElement>('#uuid-generate-btn')!.click();

      expect(copyAllBtn.disabled).toBe(false);
      expect(clearBtn.disabled).toBe(false);
    });
  });

  describe('Clear button', () => {
    it('clears the UUID list and shows empty state', () => {
      const el = createUuidGeneratorUI();
      document.body.appendChild(el);

      el.querySelector<HTMLButtonElement>('#uuid-generate-btn')!.click();
      expect(el.querySelectorAll('.uuid-item').length).toBe(1);

      el.querySelector<HTMLButtonElement>('#uuid-clear-btn')!.click();
      expect(el.querySelector('.uuid-empty-state')).toBeTruthy();
    });
  });

  describe('Validate input', () => {
    it('shows valid message for a correct UUID v4', () => {
      const el = createUuidGeneratorUI();
      document.body.appendChild(el);

      const validateInput = el.querySelector<HTMLInputElement>('#uuid-validate-input')!;
      validateInput.value = '550e8400-e29b-4cd4-a716-446655440000';
      validateInput.dispatchEvent(new Event('input'));

      const result = el.querySelector<HTMLSpanElement>('#uuid-validate-result')!;
      expect(result.textContent).toContain('Valid');
      expect(result.classList.contains('uuid-valid')).toBe(true);
    });

    it('shows invalid message for a non-UUID string', () => {
      const el = createUuidGeneratorUI();
      document.body.appendChild(el);

      const validateInput = el.querySelector<HTMLInputElement>('#uuid-validate-input')!;
      validateInput.value = 'not-a-uuid';
      validateInput.dispatchEvent(new Event('input'));

      const result = el.querySelector<HTMLSpanElement>('#uuid-validate-result')!;
      expect(result.textContent).toContain('Invalid');
      expect(result.classList.contains('uuid-invalid')).toBe(true);
    });

    it('clears the validate result when input is empty', () => {
      const el = createUuidGeneratorUI();
      document.body.appendChild(el);

      const validateInput = el.querySelector<HTMLInputElement>('#uuid-validate-input')!;
      validateInput.value = 'bad';
      validateInput.dispatchEvent(new Event('input'));

      validateInput.value = '';
      validateInput.dispatchEvent(new Event('input'));

      const result = el.querySelector<HTMLSpanElement>('#uuid-validate-result')!;
      expect(result.textContent).toBe('');
    });
  });
});
