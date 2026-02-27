import {
  UNIT_GROUPS,
  type UnitCategory,
  convert,
  formatResult,
} from './unitConverter';
import { trackActivity } from './activityFeed';

function buildCategoryOptions(): string {
  return (Object.keys(UNIT_GROUPS) as UnitCategory[])
    .map(cat => `<option value="${cat}">${UNIT_GROUPS[cat].label}</option>`)
    .join('');
}

function buildUnitOptions(category: UnitCategory, selectedSymbol?: string): string {
  return UNIT_GROUPS[category].units
    .map(u => `<option value="${u.symbol}" ${u.symbol === selectedSymbol ? 'selected' : ''}>${u.label} (${u.symbol})</option>`)
    .join('');
}

export function createUnitConverterUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'unit-converter-dashboard';
  container.className = 'unit-converter-container card-section';

  const defaultCategory: UnitCategory = 'length';
  const defaultUnits = UNIT_GROUPS[defaultCategory].units;

  container.innerHTML = `
    <h2 class="section-title">🔄 Unit Converter</h2>
    <p class="section-description">Convert values between common units of measurement across 8 categories.</p>

    <div class="unit-converter-controls">
      <div class="unit-converter-row">
        <label for="unit-category-select" class="unit-label">Category</label>
        <select id="unit-category-select" class="unit-select">
          ${buildCategoryOptions()}
        </select>
      </div>

      <div class="unit-converter-row unit-converter-inputs">
        <div class="unit-input-group">
          <label for="unit-from-value" class="unit-label">From</label>
          <div class="unit-input-pair">
            <input
              id="unit-from-value"
              type="number"
              class="unit-input"
              value="1"
              placeholder="Enter value"
              aria-label="Value to convert"
            />
            <select id="unit-from-select" class="unit-select">
              ${buildUnitOptions(defaultCategory, defaultUnits[0].symbol)}
            </select>
          </div>
        </div>

        <button id="unit-swap-btn" class="unit-swap-btn" title="Swap units" aria-label="Swap from/to units">⇄</button>

        <div class="unit-input-group">
          <label for="unit-to-value" class="unit-label">To</label>
          <div class="unit-input-pair">
            <input
              id="unit-to-value"
              type="number"
              class="unit-input unit-output"
              readonly
              aria-label="Converted value"
            />
            <select id="unit-to-select" class="unit-select">
              ${buildUnitOptions(defaultCategory, defaultUnits[1].symbol)}
            </select>
          </div>
        </div>
      </div>

      <div id="unit-result-display" class="unit-result-display" aria-live="polite"></div>
    </div>
  `;

  setupUnitConverterEvents(container);
  performConversion(container);

  return container;
}

function performConversion(container: HTMLElement): void {
  const categorySelect = container.querySelector('#unit-category-select') as HTMLSelectElement;
  const fromValue = container.querySelector('#unit-from-value') as HTMLInputElement;
  const fromSelect = container.querySelector('#unit-from-select') as HTMLSelectElement;
  const toValue = container.querySelector('#unit-to-value') as HTMLInputElement;
  const toSelect = container.querySelector('#unit-to-select') as HTMLSelectElement;
  const resultDisplay = container.querySelector('#unit-result-display') as HTMLElement;

  if (!categorySelect || !fromValue || !fromSelect || !toValue || !toSelect) return;

  const category = categorySelect.value as UnitCategory;
  const inputStr = fromValue.value.trim();
  const num = parseFloat(inputStr);

  if (inputStr === '' || isNaN(num)) {
    toValue.value = '';
    resultDisplay.textContent = '';
    return;
  }

  try {
    const result = convert(num, fromSelect.value, toSelect.value, category);
    const formatted = formatResult(result);
    toValue.value = formatted;
    resultDisplay.textContent = `${num} ${fromSelect.value} = ${formatted} ${toSelect.value}`;
  } catch {
    toValue.value = '';
    resultDisplay.textContent = 'Conversion error.';
  }
}

function setupUnitConverterEvents(container: HTMLElement): void {
  const categorySelect = container.querySelector('#unit-category-select') as HTMLSelectElement;
  const fromSelect = container.querySelector('#unit-from-select') as HTMLSelectElement;
  const toSelect = container.querySelector('#unit-to-select') as HTMLSelectElement;
  const fromValue = container.querySelector('#unit-from-value') as HTMLInputElement;
  const swapBtn = container.querySelector('#unit-swap-btn') as HTMLButtonElement;

  categorySelect?.addEventListener('change', () => {
    const category = categorySelect.value as UnitCategory;
    const units = UNIT_GROUPS[category].units;
    fromSelect.innerHTML = buildUnitOptions(category, units[0].symbol);
    toSelect.innerHTML = buildUnitOptions(category, units[1].symbol);
    performConversion(container);
    trackActivity('unit_converter', `Switched to ${UNIT_GROUPS[category].label} category`, 'Category changed in unit converter');
  });

  fromSelect?.addEventListener('change', () => performConversion(container));
  toSelect?.addEventListener('change', () => performConversion(container));
  fromValue?.addEventListener('input', () => performConversion(container));

  swapBtn?.addEventListener('click', () => {
    const fromSymbol = fromSelect.value;
    const toSymbol = toSelect.value;
    const category = categorySelect.value as UnitCategory;
    fromSelect.innerHTML = buildUnitOptions(category, toSymbol);
    toSelect.innerHTML = buildUnitOptions(category, fromSymbol);
    performConversion(container);
  });
}
