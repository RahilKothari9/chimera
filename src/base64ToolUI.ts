import { encodeBase64, decodeBase64, looksLikeBase64, type Base64Variant } from './base64Tool';
import { trackActivity } from './activityFeed';

export function createBase64ToolUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'base64-tool-dashboard';
  container.className = 'base64-tool-container card-section';

  container.innerHTML = `
    <h2 class="section-title">🔐 Base64 Encoder / Decoder</h2>
    <p class="section-description">Encode text to Base64 or decode Base64 back to plain text. Supports standard and URL-safe alphabets.</p>

    <div class="b64-mode-bar" role="group" aria-label="Operation mode">
      <button id="b64-mode-encode" class="b64-mode-btn active" aria-pressed="true">Encode</button>
      <button id="b64-mode-decode" class="b64-mode-btn" aria-pressed="false">Decode</button>
      <button id="b64-mode-auto" class="b64-mode-btn" aria-pressed="false">Auto-detect</button>
    </div>

    <div class="b64-variant-bar" id="b64-variant-bar">
      <label class="b64-variant-label">
        <input type="radio" name="b64-variant" value="standard" checked> Standard (+ /)
      </label>
      <label class="b64-variant-label">
        <input type="radio" name="b64-variant" value="url-safe"> URL-safe (- _)
      </label>
    </div>

    <div class="b64-io">
      <div class="b64-io-group">
        <label class="b64-io-label" for="b64-input" id="b64-input-label">Plain Text</label>
        <textarea
          id="b64-input"
          class="b64-textarea"
          rows="6"
          placeholder="Enter text to encode…"
          aria-label="Input"
          spellcheck="false"
        ></textarea>
      </div>
      <div class="b64-io-group">
        <label class="b64-io-label" for="b64-output" id="b64-output-label">Base64</label>
        <textarea
          id="b64-output"
          class="b64-textarea b64-textarea-output"
          rows="6"
          placeholder="Output will appear here…"
          aria-label="Output"
          spellcheck="false"
        ></textarea>
      </div>
    </div>

    <div class="b64-toolbar">
      <button id="b64-run-btn" class="b64-btn b64-btn-primary">⚡ Encode</button>
      <button id="b64-swap-btn" class="b64-btn" title="Swap input ↔ output">⇄ Swap</button>
      <button id="b64-clear-btn" class="b64-btn">🗑 Clear</button>
      <button id="b64-copy-btn" class="b64-btn">📋 Copy Output</button>
    </div>

    <div id="b64-stats" class="b64-stats" aria-live="polite" hidden></div>
    <div id="b64-error" class="b64-error" aria-live="polite" role="alert" hidden></div>
  `;

  const inputTA = container.querySelector<HTMLTextAreaElement>('#b64-input')!;
  const outputTA = container.querySelector<HTMLTextAreaElement>('#b64-output')!;
  const runBtn = container.querySelector<HTMLButtonElement>('#b64-run-btn')!;
  const swapBtn = container.querySelector<HTMLButtonElement>('#b64-swap-btn')!;
  const clearBtn = container.querySelector<HTMLButtonElement>('#b64-clear-btn')!;
  const copyBtn = container.querySelector<HTMLButtonElement>('#b64-copy-btn')!;
  const statsEl = container.querySelector<HTMLDivElement>('#b64-stats')!;
  const errorEl = container.querySelector<HTMLDivElement>('#b64-error')!;
  const inputLabel = container.querySelector<HTMLLabelElement>('#b64-input-label')!;
  const outputLabel = container.querySelector<HTMLLabelElement>('#b64-output-label')!;
  const variantBar = container.querySelector<HTMLDivElement>('#b64-variant-bar')!;
  const modeEncode = container.querySelector<HTMLButtonElement>('#b64-mode-encode')!;
  const modeDecode = container.querySelector<HTMLButtonElement>('#b64-mode-decode')!;
  const modeAuto = container.querySelector<HTMLButtonElement>('#b64-mode-auto')!;

  type Mode = 'encode' | 'decode' | 'auto';
  let mode: Mode = 'encode';

  function getVariant(): Base64Variant {
    const selected = container.querySelector<HTMLInputElement>('input[name="b64-variant"]:checked');
    return (selected?.value as Base64Variant) ?? 'standard';
  }

  function updateLabels() {
    const isEncode = mode === 'encode' || (mode === 'auto' && !looksLikeBase64(inputTA.value));
    inputLabel.textContent = isEncode ? 'Plain Text' : 'Base64';
    outputLabel.textContent = isEncode ? 'Base64' : 'Plain Text';
    inputTA.placeholder = isEncode ? 'Enter text to encode…' : 'Paste Base64 to decode…';
    runBtn.textContent = `⚡ ${isEncode ? 'Encode' : 'Decode'}`;
    variantBar.style.display = isEncode ? '' : 'none';
  }

  function setMode(m: Mode) {
    mode = m;
    modeEncode.classList.toggle('active', m === 'encode');
    modeEncode.setAttribute('aria-pressed', String(m === 'encode'));
    modeDecode.classList.toggle('active', m === 'decode');
    modeDecode.setAttribute('aria-pressed', String(m === 'decode'));
    modeAuto.classList.toggle('active', m === 'auto');
    modeAuto.setAttribute('aria-pressed', String(m === 'auto'));
    updateLabels();
    clearOutput();
  }

  function clearOutput() {
    outputTA.value = '';
    statsEl.hidden = true;
    statsEl.innerHTML = '';
    errorEl.hidden = true;
    errorEl.innerHTML = '';
  }

  function showError(msg: string) {
    errorEl.hidden = false;
    errorEl.textContent = msg;
    statsEl.hidden = true;
  }

  function runOperation() {
    const input = inputTA.value;
    errorEl.hidden = true;
    statsEl.hidden = true;

    // Determine effective direction
    let effectiveEncode: boolean;
    if (mode === 'encode') {
      effectiveEncode = true;
    } else if (mode === 'decode') {
      effectiveEncode = false;
    } else {
      // auto: guess based on content
      effectiveEncode = !looksLikeBase64(input);
      updateLabels();
    }

    if (effectiveEncode) {
      const result = encodeBase64(input, getVariant());
      outputTA.value = result.encoded;
      statsEl.hidden = false;
      statsEl.innerHTML = `
        <span class="b64-stat">Input: ${result.byteLength} byte${result.byteLength === 1 ? '' : 's'}</span>
        <span class="b64-stat">Output: ${result.encoded.length} chars</span>
        <span class="b64-stat">Variant: ${getVariant()}</span>
      `;
      trackActivity('base64', 'Encoded to Base64', `${result.byteLength} bytes → ${result.encoded.length} chars`);
    } else {
      const result = decodeBase64(input);
      if (!result.success) {
        showError(`⚠️ Invalid Base64: ${result.error}`);
        outputTA.value = '';
        return;
      }
      outputTA.value = result.decoded;
      const outBytes = new TextEncoder().encode(result.decoded).length;
      statsEl.hidden = false;
      statsEl.innerHTML = `
        <span class="b64-stat">Input: ${input.trim().length} chars</span>
        <span class="b64-stat">Output: ${outBytes} byte${outBytes === 1 ? '' : 's'}</span>
      `;
      trackActivity('base64', 'Decoded from Base64', `${input.trim().length} chars → ${outBytes} bytes`);
    }
  }

  modeEncode.addEventListener('click', () => setMode('encode'));
  modeDecode.addEventListener('click', () => setMode('decode'));
  modeAuto.addEventListener('click', () => setMode('auto'));

  runBtn.addEventListener('click', runOperation);

  swapBtn.addEventListener('click', () => {
    const prevInput = inputTA.value;
    const prevOutput = outputTA.value;
    // Flip mode first (without clearing output), then restore values
    if (mode === 'encode') setMode('decode');
    else if (mode === 'decode') setMode('encode');
    inputTA.value = prevOutput;
    outputTA.value = prevInput;
  });

  clearBtn.addEventListener('click', () => {
    inputTA.value = '';
    clearOutput();
  });

  copyBtn.addEventListener('click', () => {
    if (!outputTA.value) return;
    if (!navigator.clipboard) {
      copyBtn.textContent = '❌ Not supported';
      setTimeout(() => { copyBtn.textContent = '📋 Copy Output'; }, 2000);
      return;
    }
    navigator.clipboard.writeText(outputTA.value).then(() => {
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => { copyBtn.textContent = '📋 Copy Output'; }, 2000);
      trackActivity('base64', 'Copied Base64 output', 'Output copied to clipboard');
    }).catch(() => {
      copyBtn.textContent = '❌ Failed';
      setTimeout(() => { copyBtn.textContent = '📋 Copy Output'; }, 2000);
    });
  });

  return container;
}
