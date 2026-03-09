import { generateUUIDs, isValidUUID, type UUIDFormat } from './uuidGenerator';
import { trackActivity } from './activityFeed';

export function createUUIDGeneratorUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'uuid-generator-dashboard';
  container.className = 'uuid-gen-container card-section';

  container.innerHTML = `
    <h2 class="section-title">🪪 UUID Generator</h2>
    <p class="section-description">Generate RFC 4122 UUID v4 values instantly using the browser's built-in <code>crypto.randomUUID()</code> API.</p>

    <div class="uuid-gen-controls">
      <div class="uuid-gen-control-row">
        <label class="uuid-gen-label" for="uuid-gen-count">How many?</label>
        <select id="uuid-gen-count" class="uuid-gen-select" aria-label="Number of UUIDs to generate">
          <option value="1" selected>1</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>

        <label class="uuid-gen-label" for="uuid-gen-format">Format</label>
        <select id="uuid-gen-format" class="uuid-gen-select" aria-label="UUID output format">
          <option value="lowercase" selected>Lowercase</option>
          <option value="uppercase">Uppercase</option>
          <option value="no-hyphens">No hyphens</option>
        </select>

        <button id="uuid-gen-btn" class="uuid-gen-btn uuid-gen-btn-primary">⚡ Generate</button>
        <button id="uuid-gen-clear-btn" class="uuid-gen-btn">🗑 Clear</button>
        <button id="uuid-gen-copy-all-btn" class="uuid-gen-btn" hidden>📋 Copy All</button>
      </div>
    </div>

    <ol id="uuid-gen-list" class="uuid-gen-list" aria-live="polite" aria-label="Generated UUIDs"></ol>

    <div class="uuid-gen-validator-section">
      <h3 class="uuid-gen-subheading">🔍 UUID Validator</h3>
      <p class="uuid-gen-hint">Paste any string to check whether it is a valid UUID v4.</p>
      <div class="uuid-gen-validator-row">
        <input
          id="uuid-gen-validate-input"
          class="uuid-gen-input"
          type="text"
          placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
          aria-label="UUID to validate"
          spellcheck="false"
          autocomplete="off"
        />
        <span id="uuid-gen-validate-badge" class="uuid-gen-validate-badge" aria-live="polite"></span>
      </div>
    </div>
  `;

  // ── Element references ──────────────────────────────────────────────────────
  const countSelect = container.querySelector<HTMLSelectElement>('#uuid-gen-count')!;
  const formatSelect = container.querySelector<HTMLSelectElement>('#uuid-gen-format')!;
  const generateBtn = container.querySelector<HTMLButtonElement>('#uuid-gen-btn')!;
  const clearBtn = container.querySelector<HTMLButtonElement>('#uuid-gen-clear-btn')!;
  const copyAllBtn = container.querySelector<HTMLButtonElement>('#uuid-gen-copy-all-btn')!;
  const list = container.querySelector<HTMLOListElement>('#uuid-gen-list')!;
  const validateInput = container.querySelector<HTMLInputElement>('#uuid-gen-validate-input')!;
  const validateBadge = container.querySelector<HTMLSpanElement>('#uuid-gen-validate-badge')!;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function getCount(): number {
    return parseInt(countSelect.value, 10);
  }

  function getFormat(): UUIDFormat {
    return formatSelect.value as UUIDFormat;
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderList(uuids: string[]) {
    list.innerHTML = uuids
      .map(
        (u, i) => `
        <li class="uuid-gen-item">
          <span class="uuid-gen-index">${i + 1}.</span>
          <code class="uuid-gen-code">${escapeHtml(u)}</code>
          <button
            class="uuid-gen-copy-btn"
            data-uuid="${escapeHtml(u)}"
            aria-label="Copy UUID ${i + 1}"
          >📋</button>
        </li>`,
      )
      .join('');

    copyAllBtn.hidden = uuids.length === 0;

    // Attach per-item copy handlers
    list.querySelectorAll<HTMLButtonElement>('.uuid-gen-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.uuid ?? '';
        copyToClipboard(value, btn, '📋', '✅', '❌');
        trackActivity('uuid_generator', 'Copied UUID', `Single UUID copied to clipboard`);
      });
    });
  }

  function copyToClipboard(
    text: string,
    btn: HTMLButtonElement,
    defaultLabel: string,
    successLabel: string,
    errorLabel: string,
  ) {
    if (!navigator.clipboard) {
      btn.textContent = errorLabel;
      setTimeout(() => { btn.textContent = defaultLabel; }, 2000);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = successLabel;
      setTimeout(() => { btn.textContent = defaultLabel; }, 2000);
    }).catch(() => {
      btn.textContent = errorLabel;
      setTimeout(() => { btn.textContent = defaultLabel; }, 2000);
    });
  }

  // ── Generate ─────────────────────────────────────────────────────────────────
  function handleGenerate() {
    const count = getCount();
    const format = getFormat();
    const results = generateUUIDs(count, format);
    const formatted = results.map(r => r.formatted);
    renderList(formatted);
    trackActivity(
      'uuid_generator',
      'Generated UUIDs',
      `Generated ${count} UUID${count === 1 ? '' : 's'} (${format})`,
    );
  }

  generateBtn.addEventListener('click', handleGenerate);

  // ── Clear ─────────────────────────────────────────────────────────────────
  clearBtn.addEventListener('click', () => {
    list.innerHTML = '';
    copyAllBtn.hidden = true;
  });

  // ── Copy All ──────────────────────────────────────────────────────────────
  copyAllBtn.addEventListener('click', () => {
    const codes = Array.from(list.querySelectorAll<HTMLElement>('.uuid-gen-code')).map(
      c => c.textContent ?? '',
    );
    copyToClipboard(codes.join('\n'), copyAllBtn, '📋 Copy All', '✅ Copied!', '❌ Failed');
    trackActivity('uuid_generator', 'Copied all UUIDs', `Copied ${codes.length} UUIDs to clipboard`);
  });

  // ── Validator ──────────────────────────────────────────────────────────────
  validateInput.addEventListener('input', () => {
    const val = validateInput.value;
    if (!val.trim()) {
      validateBadge.textContent = '';
      validateBadge.className = 'uuid-gen-validate-badge';
      return;
    }
    const valid = isValidUUID(val);
    validateBadge.textContent = valid ? '✅ Valid UUID v4' : '❌ Invalid UUID';
    validateBadge.className = `uuid-gen-validate-badge ${valid ? 'uuid-gen-badge-valid' : 'uuid-gen-badge-invalid'}`;
  });

  return container;
}
