import {
  processUrl,
  parseUrl,
  detectEncoding,
  type UrlMode,
} from './urlEncoderDecoder';
import { trackActivity } from './activityFeed';

export function createUrlEncoderDecoderUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'url-encoder-decoder-dashboard';
  container.className = 'url-tool-container card-section';

  container.innerHTML = `
    <h2 class="section-title">🔗 URL Encoder / Decoder</h2>
    <p class="url-tool-subtitle">Encode, decode, and parse URLs and URL components</p>

    <div class="url-tool-mode-row">
      <span class="url-tool-mode-label">Mode:</span>
      <label class="url-tool-radio-label">
        <input type="radio" name="url-mode" value="component" checked />
        Component
        <span class="url-tool-mode-hint">(encodeURIComponent)</span>
      </label>
      <label class="url-tool-radio-label">
        <input type="radio" name="url-mode" value="full" />
        Full URL
        <span class="url-tool-mode-hint">(encodeURI)</span>
      </label>
    </div>

    <div class="url-tool-io">
      <div class="url-tool-panel">
        <label class="url-tool-panel-label" for="url-input">Input</label>
        <textarea
          id="url-input"
          class="url-tool-textarea"
          rows="4"
          placeholder="Paste text or URL here…"
          spellcheck="false"
          aria-label="Input text or URL"
        ></textarea>
        <div class="url-tool-detect" id="url-detect-hint" aria-live="polite"></div>
      </div>

      <div class="url-tool-actions">
        <button id="url-encode-btn" class="url-btn url-btn-primary" aria-label="Encode input">
          Encode →
        </button>
        <button id="url-decode-btn" class="url-btn url-btn-secondary" aria-label="Decode input">
          ← Decode
        </button>
        <button id="url-swap-btn" class="url-btn url-btn-ghost" aria-label="Swap input and output">
          ⇅ Swap
        </button>
        <button id="url-clear-btn" class="url-btn url-btn-ghost" aria-label="Clear all">
          ✕ Clear
        </button>
      </div>

      <div class="url-tool-panel">
        <label class="url-tool-panel-label" for="url-output">Output</label>
        <textarea
          id="url-output"
          class="url-tool-textarea"
          rows="4"
          placeholder="Result will appear here…"
          readonly
          aria-label="Output result"
          aria-live="polite"
        ></textarea>
        <button id="url-copy-btn" class="url-btn url-btn-ghost url-copy-btn" aria-label="Copy output to clipboard">
          📋 Copy
        </button>
      </div>
    </div>

    <div id="url-error-banner" class="url-error-banner" role="alert" aria-live="polite"></div>

    <div class="url-parse-section">
      <h3 class="url-parse-title">URL Parser</h3>
      <p class="url-parse-hint">Enter a full URL (with protocol) to break it into parts</p>
      <div class="url-parse-input-row">
        <input
          type="text"
          id="url-parse-input"
          class="url-parse-input"
          placeholder="https://example.com/path?key=value#section"
          spellcheck="false"
          aria-label="URL to parse"
        />
        <button id="url-parse-btn" class="url-btn url-btn-primary" aria-label="Parse URL">
          Parse
        </button>
      </div>
      <div id="url-parse-result" class="url-parse-result" aria-live="polite"></div>
    </div>
  `;

  // ── Refs ──────────────────────────────────────────────────────────────────
  const inputTA = container.querySelector<HTMLTextAreaElement>('#url-input')!;
  const outputTA = container.querySelector<HTMLTextAreaElement>('#url-output')!;
  const detectHint = container.querySelector<HTMLDivElement>('#url-detect-hint')!;
  const errorBanner = container.querySelector<HTMLDivElement>('#url-error-banner')!;
  const encodeBtn = container.querySelector<HTMLButtonElement>('#url-encode-btn')!;
  const decodeBtn = container.querySelector<HTMLButtonElement>('#url-decode-btn')!;
  const swapBtn = container.querySelector<HTMLButtonElement>('#url-swap-btn')!;
  const clearBtn = container.querySelector<HTMLButtonElement>('#url-clear-btn')!;
  const copyBtn = container.querySelector<HTMLButtonElement>('#url-copy-btn')!;
  const parseInput = container.querySelector<HTMLInputElement>('#url-parse-input')!;
  const parseBtn = container.querySelector<HTMLButtonElement>('#url-parse-btn')!;
  const parseResult = container.querySelector<HTMLDivElement>('#url-parse-result')!;

  function getMode(): UrlMode {
    const checked = container.querySelector<HTMLInputElement>('input[name="url-mode"]:checked');
    return (checked?.value ?? 'component') as UrlMode;
  }

  function setError(msg: string) {
    errorBanner.textContent = msg ? `❌ ${msg}` : '';
    errorBanner.className = msg ? 'url-error-banner url-error-visible' : 'url-error-banner';
  }

  // Update auto-detect hint whenever input changes
  inputTA.addEventListener('input', () => {
    const val = inputTA.value;
    if (!val) {
      detectHint.textContent = '';
      return;
    }
    const detected = detectEncoding(val);
    detectHint.textContent =
      detected === 'encoded' ? '🔍 Detected: looks encoded' : '🔍 Detected: looks plain text';
  });

  encodeBtn.addEventListener('click', () => {
    const input = inputTA.value;
    const result = processUrl(input, getMode(), 'encode');
    outputTA.value = result.value;
    setError(result.error ?? '');
    trackActivity('url_encoder_decoder', 'Encoded URL', `Mode: ${getMode()}`);
  });

  decodeBtn.addEventListener('click', () => {
    const input = inputTA.value;
    const result = processUrl(input, getMode(), 'decode');
    outputTA.value = result.value;
    setError(result.error ?? '');
    trackActivity('url_encoder_decoder', 'Decoded URL', `Mode: ${getMode()}`);
  });

  swapBtn.addEventListener('click', () => {
    const prev = inputTA.value;
    inputTA.value = outputTA.value;
    outputTA.value = prev;
    setError('');
    inputTA.dispatchEvent(new Event('input'));
  });

  clearBtn.addEventListener('click', () => {
    inputTA.value = '';
    outputTA.value = '';
    setError('');
    detectHint.textContent = '';
  });

  copyBtn.addEventListener('click', async () => {
    if (!outputTA.value) return;
    try {
      await navigator.clipboard.writeText(outputTA.value);
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy';
      }, 1500);
    } catch {
      // Fallback for environments without clipboard API
      outputTA.select();
      document.execCommand('copy');
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy';
      }, 1500);
    }
  });

  // ── URL Parser ────────────────────────────────────────────────────────────
  function runParser(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      parseResult.innerHTML = '';
      return;
    }

    const parsed = parseUrl(trimmed);

    if (!parsed.valid) {
      parseResult.innerHTML = `
        <div class="url-parse-error">❌ ${parsed.error}</div>
      `;
      return;
    }

    const qpRows =
      parsed.queryParams.length > 0
        ? parsed.queryParams
            .map(
              (p) => `
          <tr>
            <td class="url-parse-key">${escHtml(p.key)}</td>
            <td class="url-parse-val">${escHtml(p.value)}</td>
          </tr>`,
            )
            .join('')
        : `<tr><td colspan="2" class="url-parse-empty">No query parameters</td></tr>`;

    const fields: Array<[string, string]> = [
      ['Protocol', parsed.protocol],
      ['Hostname', parsed.hostname],
      ['Port', parsed.port || '(default)'],
      ['Path', parsed.pathname],
      ['Query', parsed.search || '(none)'],
      ['Hash / Fragment', parsed.hash || '(none)'],
    ];
    if (parsed.username) fields.splice(2, 0, ['Username', parsed.username]);

    parseResult.innerHTML = `
      <div class="url-parse-grid">
        ${fields
          .map(
            ([label, value]) => `
          <div class="url-parse-field">
            <span class="url-parse-field-label">${label}</span>
            <code class="url-parse-field-value">${escHtml(value)}</code>
          </div>`,
          )
          .join('')}
      </div>
      ${
        parsed.queryParams.length > 0
          ? `
      <div class="url-parse-params">
        <h4 class="url-parse-params-title">Query Parameters (${parsed.queryParams.length})</h4>
        <table class="url-parse-table">
          <thead>
            <tr><th>Key</th><th>Value</th></tr>
          </thead>
          <tbody>${qpRows}</tbody>
        </table>
      </div>`
          : ''
      }
    `;

    trackActivity('url_encoder_decoder', 'Parsed URL', trimmed.slice(0, 80));
  }

  parseBtn.addEventListener('click', () => runParser(parseInput.value));
  parseInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runParser(parseInput.value);
  });

  return container;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
