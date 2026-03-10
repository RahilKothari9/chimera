import { generateUuids, isValidUuidV4, type UuidFormat } from './uuidGenerator';
import { trackActivity } from './activityFeed';

export function createUuidGeneratorUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'uuid-generator-dashboard';
  container.className = 'uuid-generator-container card-section';

  container.innerHTML = `
    <h2 class="section-title">🔑 UUID Generator</h2>
    <div class="uuid-controls-row">
      <label class="uuid-label" for="uuid-count">Count</label>
      <input
        type="number"
        id="uuid-count"
        class="uuid-count-input"
        value="1"
        min="1"
        max="100"
        aria-label="Number of UUIDs to generate"
      />
      <label class="uuid-label" for="uuid-format">Format</label>
      <select id="uuid-format" class="uuid-format-select" aria-label="UUID format">
        <option value="standard">Standard (lowercase with dashes)</option>
        <option value="uppercase">Uppercase</option>
        <option value="no-dashes">No dashes</option>
        <option value="braces">Braces {uuid}</option>
      </select>
      <button id="uuid-generate-btn" class="uuid-btn uuid-btn-primary">Generate</button>
    </div>
    <div class="uuid-output-header">
      <span id="uuid-output-label" class="uuid-output-label">Generated UUIDs</span>
      <div class="uuid-output-actions">
        <button id="uuid-copy-all-btn" class="uuid-btn uuid-btn-secondary" disabled>Copy All</button>
        <button id="uuid-clear-btn" class="uuid-btn uuid-btn-secondary" disabled>Clear</button>
      </div>
    </div>
    <div id="uuid-output-list" class="uuid-output-list" role="list" aria-label="Generated UUIDs list">
      <p class="uuid-empty-state">Click "Generate" to create UUIDs</p>
    </div>
    <div class="uuid-validate-section">
      <h3 class="uuid-validate-title">Validate UUID</h3>
      <div class="uuid-validate-row">
        <input
          type="text"
          id="uuid-validate-input"
          class="uuid-validate-input"
          placeholder="Paste a UUID to validate..."
          aria-label="UUID to validate"
        />
        <span id="uuid-validate-result" class="uuid-validate-result" aria-live="polite"></span>
      </div>
    </div>
  `;

  const countInput = container.querySelector<HTMLInputElement>('#uuid-count')!;
  const formatSelect = container.querySelector<HTMLSelectElement>('#uuid-format')!;
  const generateBtn = container.querySelector<HTMLButtonElement>('#uuid-generate-btn')!;
  const copyAllBtn = container.querySelector<HTMLButtonElement>('#uuid-copy-all-btn')!;
  const clearBtn = container.querySelector<HTMLButtonElement>('#uuid-clear-btn')!;
  const outputList = container.querySelector<HTMLDivElement>('#uuid-output-list')!;
  const validateInput = container.querySelector<HTMLInputElement>('#uuid-validate-input')!;
  const validateResult = container.querySelector<HTMLSpanElement>('#uuid-validate-result')!;

  let currentUuids: string[] = [];

  function renderUuids(uuids: string[]) {
    if (uuids.length === 0) {
      outputList.innerHTML = '<p class="uuid-empty-state">Click "Generate" to create UUIDs</p>';
      copyAllBtn.disabled = true;
      clearBtn.disabled = true;
      return;
    }

    outputList.innerHTML = uuids
      .map(
        (uuid, i) => `
      <div class="uuid-item" role="listitem">
        <span class="uuid-index">${i + 1}.</span>
        <code class="uuid-value" id="uuid-val-${i}">${uuid}</code>
        <button class="uuid-copy-single-btn uuid-btn uuid-btn-icon" data-index="${i}" aria-label="Copy UUID ${i + 1}">
          📋
        </button>
      </div>
    `
      )
      .join('');

    copyAllBtn.disabled = false;
    clearBtn.disabled = false;

    // Attach individual copy handlers
    outputList.querySelectorAll<HTMLButtonElement>('.uuid-copy-single-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index ?? '0', 10);
        navigator.clipboard.writeText(uuids[idx]).then(() => {
          btn.textContent = '✅';
          setTimeout(() => (btn.textContent = '📋'), 1500);
          trackActivity('uuid_generator', 'Copied UUID', `Copied UUID: ${uuids[idx].slice(0, 8)}...`);
        });
      });
    });
  }

  function handleGenerate() {
    const count = parseInt(countInput.value, 10) || 1;
    const format = formatSelect.value as UuidFormat;
    const result = generateUuids({ count, format });
    currentUuids = result.uuids;
    renderUuids(currentUuids);
    trackActivity(
      'uuid_generator',
      `Generated ${result.count} UUID${result.count > 1 ? 's' : ''}`,
      `Format: ${format}`
    );
  }

  generateBtn.addEventListener('click', handleGenerate);

  copyAllBtn.addEventListener('click', () => {
    const text = currentUuids.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      copyAllBtn.textContent = '✅ Copied!';
      setTimeout(() => (copyAllBtn.textContent = 'Copy All'), 1500);
      trackActivity('uuid_generator', `Copied all ${currentUuids.length} UUIDs`, 'All UUIDs copied to clipboard');
    });
  });

  clearBtn.addEventListener('click', () => {
    currentUuids = [];
    renderUuids([]);
    trackActivity('uuid_generator', 'Cleared UUID list', 'UUID list cleared');
  });

  validateInput.addEventListener('input', () => {
    const val = validateInput.value.trim();
    if (!val) {
      validateResult.textContent = '';
      validateResult.className = 'uuid-validate-result';
      return;
    }
    if (isValidUuidV4(val)) {
      validateResult.textContent = '✅ Valid UUID v4';
      validateResult.className = 'uuid-validate-result uuid-valid';
    } else {
      validateResult.textContent = '❌ Invalid UUID v4';
      validateResult.className = 'uuid-validate-result uuid-invalid';
    }
  });

  return container;
}
