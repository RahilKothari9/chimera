import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUnitConverterUI } from './unitConverterUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

describe('Unit Converter UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createUnitConverterUI', () => {
    it('creates a container with the correct id', () => {
      const el = createUnitConverterUI();
      expect(el.id).toBe('unit-converter-dashboard');
    });

    it('contains a category select with all 8 categories', () => {
      const el = createUnitConverterUI();
      const catSelect = el.querySelector('#unit-category-select') as HTMLSelectElement;
      expect(catSelect).toBeDefined();
      expect(catSelect.options.length).toBe(8);
    });

    it('contains from and to value inputs', () => {
      const el = createUnitConverterUI();
      expect(el.querySelector('#unit-from-value')).toBeDefined();
      expect(el.querySelector('#unit-to-value')).toBeDefined();
    });

    it('contains from and to unit selects', () => {
      const el = createUnitConverterUI();
      expect(el.querySelector('#unit-from-select')).toBeDefined();
      expect(el.querySelector('#unit-to-select')).toBeDefined();
    });

    it('contains a swap button', () => {
      const el = createUnitConverterUI();
      expect(el.querySelector('#unit-swap-btn')).toBeDefined();
    });

    it('contains a result display element', () => {
      const el = createUnitConverterUI();
      expect(el.querySelector('#unit-result-display')).toBeDefined();
    });

    it('shows a result on initial render (1 m → km)', () => {
      const el = createUnitConverterUI();
      document.body.appendChild(el);
      const result = el.querySelector('#unit-result-display') as HTMLElement;
      // Default category is length, default from is mm[0] and to is cm[1]
      expect(result.textContent).not.toBe('');
    });
  });

  describe('category change', () => {
    it('repopulates unit selects when category changes', () => {
      const el = createUnitConverterUI();
      document.body.appendChild(el);

      const catSelect = el.querySelector('#unit-category-select') as HTMLSelectElement;
      const fromSelect = el.querySelector('#unit-from-select') as HTMLSelectElement;

      // Change to temperature
      catSelect.value = 'temperature';
      catSelect.dispatchEvent(new Event('change'));

      const symbols = Array.from(fromSelect.options).map(o => o.value);
      expect(symbols).toContain('°C');
      expect(symbols).toContain('°F');
      expect(symbols).toContain('K');
    });
  });

  describe('unit swap', () => {
    it('swaps from and to unit selections', () => {
      const el = createUnitConverterUI();
      document.body.appendChild(el);

      const fromSelect = el.querySelector('#unit-from-select') as HTMLSelectElement;
      const toSelect = el.querySelector('#unit-to-select') as HTMLSelectElement;
      const swapBtn = el.querySelector('#unit-swap-btn') as HTMLButtonElement;

      const originalFrom = fromSelect.value;
      const originalTo = toSelect.value;

      swapBtn.click();

      expect(fromSelect.value).toBe(originalTo);
      expect(toSelect.value).toBe(originalFrom);
    });
  });

  describe('conversion output', () => {
    it('updates result when input value changes', () => {
      const el = createUnitConverterUI();
      document.body.appendChild(el);

      const fromValue = el.querySelector('#unit-from-value') as HTMLInputElement;
      const result = el.querySelector('#unit-result-display') as HTMLElement;

      fromValue.value = '100';
      fromValue.dispatchEvent(new Event('input'));

      expect(result.textContent).toContain('100');
    });

    it('clears result when input is empty', () => {
      const el = createUnitConverterUI();
      document.body.appendChild(el);

      const fromValue = el.querySelector('#unit-from-value') as HTMLInputElement;
      const result = el.querySelector('#unit-result-display') as HTMLElement;

      fromValue.value = '';
      fromValue.dispatchEvent(new Event('input'));

      expect(result.textContent).toBe('');
    });
  });
});
