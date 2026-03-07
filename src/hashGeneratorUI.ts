import { hashAllAlgorithms, type HashResult } from './hashGenerator';
import { trackActivity } from './activityFeed';

export function createHashGeneratorUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'hash-generator-dashboard';
  container.className = 'hash-gen-container card-section';

  container.innerHTML = `
    <h2 class="section-title">🔑 Hash Generator</h2>
    <p class="section-description">Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512) for any text input using the Web Crypto API.</p>

    <div class="hash-gen-input-row">
      <label class="hash-gen-label" for="hash-gen-input">Input Text</label>
      <textarea
        id="hash-gen-input"
        class="hash-gen-textarea"
        rows="4"
        placeholder="Type or paste text here to compute its hashes…"
        aria-label="Text to hash"
        spellcheck="false"
      ></textarea>
    </div>

    <div class="hash-gen-toolbar">
      <button id="hash-gen-compute-btn" class="hash-gen-btn hash-gen-btn-primary">⚡ Compute Hashes</button>
      <button id="hash-gen-clear-btn" class="hash-gen-btn">🗑 Clear</button>
      <label class="hash-gen-format-label">
        Output format:
        <select id="hash-gen-format" class="hash-gen-select" aria-label="Output format">
          <option value="hex" selected>Hexadecimal</option>
          <option value="base64">Base64</option>
        </select>
      </label>
    </div>

    <div id="hash-gen-results" class="hash-gen-results" aria-live="polite" hidden>
      <table class="hash-gen-table" aria-label="Hash results">
        <thead>
          <tr>
            <th scope="col" class="hash-gen-th">Algorithm</th>
            <th scope="col" class="hash-gen-th">Bits</th>
            <th scope="col" class="hash-gen-th hash-gen-th-value">Hash Value</th>
            <th scope="col" class="hash-gen-th">Copy</th>
          </tr>
        </thead>
        <tbody id="hash-gen-tbody"></tbody>
      </table>
    </div>

    <div id="hash-gen-error" class="hash-gen-error" aria-live="polite" role="alert" hidden></div>
  `;

  const inputTA = container.querySelector<HTMLTextAreaElement>('#hash-gen-input')!;
  const computeBtn = container.querySelector<HTMLButtonElement>('#hash-gen-compute-btn')!;
  const clearBtn = container.querySelector<HTMLButtonElement>('#hash-gen-clear-btn')!;
  const formatSelect = container.querySelector<HTMLSelectElement>('#hash-gen-format')!;
  const resultsEl = container.querySelector<HTMLDivElement>('#hash-gen-results')!;
  const tbody = container.querySelector<HTMLTableSectionElement>('#hash-gen-tbody')!;
  const errorEl = container.querySelector<HTMLDivElement>('#hash-gen-error')!;

  let lastResults: HashResult[] | null = null;

  function getFormat(): 'hex' | 'base64' {
    return formatSelect.value as 'hex' | 'base64';
  }

  function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderResults(results: HashResult[]) {
    const fmt = getFormat();
    tbody.innerHTML = results
      .map(r => {
        const value = fmt === 'hex' ? r.hex : r.base64;
        const bits = r.byteLength * 8;
        return `
          <tr class="hash-gen-row">
            <td class="hash-gen-td hash-gen-td-alg">
              <span class="hash-gen-badge">${escapeHtml(r.algorithm)}</span>
            </td>
            <td class="hash-gen-td hash-gen-td-bits">${bits}-bit</td>
            <td class="hash-gen-td hash-gen-td-value">
              <code class="hash-gen-value" data-alg="${escapeHtml(r.algorithm)}">${escapeHtml(value)}</code>
            </td>
            <td class="hash-gen-td hash-gen-td-copy">
              <button
                class="hash-gen-copy-btn"
                data-value="${escapeHtml(value)}"
                data-alg="${escapeHtml(r.algorithm)}"
                aria-label="Copy ${r.algorithm} hash"
              >📋 Copy</button>
            </td>
          </tr>
        `;
      })
      .join('');
    resultsEl.hidden = false;

    // Attach copy handlers
    tbody.querySelectorAll<HTMLButtonElement>('.hash-gen-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value ?? '';
        const alg = btn.dataset.alg ?? '';
        if (!navigator.clipboard) {
          btn.textContent = '❌ Not supported';
          setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
          return;
        }
        navigator.clipboard.writeText(value).then(() => {
          btn.textContent = '✅ Copied!';
          setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
          trackActivity('hash_generator', `Copied ${alg} hash`, `Hash copied to clipboard (${fmt})`);
        }).catch(() => {
          btn.textContent = '❌ Failed';
          setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
        });
      });
    });
  }

  async function runHashing() {
    const input = inputTA.value;
    errorEl.hidden = true;
    computeBtn.disabled = true;
    computeBtn.textContent = '⏳ Computing…';

    try {
      const results = await hashAllAlgorithms(input);
      lastResults = results;
      renderResults(results);
      trackActivity(
        'hash_generator',
        'Computed hashes',
        `Hashed ${new TextEncoder().encode(input).length} bytes with ${results.length} algorithms`,
      );
    } catch (err) {
      errorEl.textContent = `⚠️ Failed to compute hashes: ${err instanceof Error ? err.message : String(err)}`;
      errorEl.hidden = false;
      resultsEl.hidden = true;
    } finally {
      computeBtn.disabled = false;
      computeBtn.textContent = '⚡ Compute Hashes';
    }
  }

  computeBtn.addEventListener('click', runHashing);

  clearBtn.addEventListener('click', () => {
    inputTA.value = '';
    resultsEl.hidden = true;
    tbody.innerHTML = '';
    errorEl.hidden = true;
    lastResults = null;
  });

  // Re-render when format changes (if results are already shown)
  formatSelect.addEventListener('change', () => {
    if (lastResults) renderResults(lastResults);
  });

  // Allow Ctrl+Enter / Cmd+Enter to trigger hashing from the textarea
  inputTA.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runHashing();
    }
  });

  return container;
}
