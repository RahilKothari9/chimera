/**
 * Timestamp Converter UI
 *
 * Provides two modes:
 *  1. Unix → Date   – input a Unix timestamp, see multiple date formats
 *  2. Date → Unix   – input a date string, get the Unix timestamp
 *
 * A "Use Now" button seeds the current epoch so users can immediately
 * inspect today's timestamp.
 */

import {
  getCurrentTimestamp,
  unixToDate,
  dateToUnix,
  detectInputType,
} from './timestampConverter';
import { trackActivity } from './activityFeed';

export function createTimestampConverterUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'timestamp-converter-dashboard';
  container.className = 'ts-container card-section';

  container.innerHTML = `
    <h2 class="section-title">🕐 Timestamp Converter</h2>
    <p class="section-description">Convert between Unix timestamps and human-readable dates. Supports seconds, milliseconds, ISO 8601, and relative time.</p>

    <div class="ts-mode-bar" role="group" aria-label="Conversion direction">
      <button id="ts-mode-to-date" class="ts-mode-btn active" aria-pressed="true">Unix → Date</button>
      <button id="ts-mode-to-unix" class="ts-mode-btn" aria-pressed="false">Date → Unix</button>
    </div>

    <!-- Unix → Date panel -->
    <div id="ts-panel-to-date" class="ts-panel">
      <div class="ts-input-row">
        <div class="ts-input-group">
          <label class="ts-label" for="ts-unix-input">Unix Timestamp</label>
          <input
            type="text"
            id="ts-unix-input"
            class="ts-input"
            placeholder="e.g. 1700000000"
            aria-label="Unix timestamp"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
        <div class="ts-unit-group" role="group" aria-label="Timestamp unit">
          <label class="ts-unit-label">
            <input type="radio" name="ts-unit" value="seconds" checked> Seconds
          </label>
          <label class="ts-unit-label">
            <input type="radio" name="ts-unit" value="milliseconds"> Milliseconds
          </label>
        </div>
        <button id="ts-use-now-btn" class="ts-btn ts-btn-secondary" title="Use the current Unix timestamp">
          ⏱ Use Now
        </button>
        <button id="ts-convert-btn" class="ts-btn ts-btn-primary">⚡ Convert</button>
      </div>

      <div id="ts-result-grid" class="ts-result-grid" hidden>
        <div class="ts-result-row">
          <span class="ts-result-label">ISO 8601</span>
          <span class="ts-result-value" id="ts-r-iso"></span>
          <button class="ts-copy-btn" data-target="ts-r-iso" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">UTC</span>
          <span class="ts-result-value" id="ts-r-utc"></span>
          <button class="ts-copy-btn" data-target="ts-r-utc" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">Local</span>
          <span class="ts-result-value" id="ts-r-local"></span>
          <button class="ts-copy-btn" data-target="ts-r-local" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">Relative</span>
          <span class="ts-result-value" id="ts-r-relative"></span>
          <button class="ts-copy-btn" data-target="ts-r-relative" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">Date only</span>
          <span class="ts-result-value" id="ts-r-date-only"></span>
          <button class="ts-copy-btn" data-target="ts-r-date-only" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">Time only (UTC)</span>
          <span class="ts-result-value" id="ts-r-time-only"></span>
          <button class="ts-copy-btn" data-target="ts-r-time-only" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">Day of week</span>
          <span class="ts-result-value" id="ts-r-dow"></span>
          <button class="ts-copy-btn" data-target="ts-r-dow" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">Unix (s)</span>
          <span class="ts-result-value" id="ts-r-unix-s"></span>
          <button class="ts-copy-btn" data-target="ts-r-unix-s" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">Unix (ms)</span>
          <span class="ts-result-value" id="ts-r-unix-ms"></span>
          <button class="ts-copy-btn" data-target="ts-r-unix-ms" title="Copy">📋</button>
        </div>
      </div>
    </div>

    <!-- Date → Unix panel -->
    <div id="ts-panel-to-unix" class="ts-panel" hidden>
      <div class="ts-input-row">
        <div class="ts-input-group">
          <label class="ts-label" for="ts-date-input">Date / Time String</label>
          <input
            type="text"
            id="ts-date-input"
            class="ts-input"
            placeholder="e.g. 2024-01-15T10:30:00Z or 2024-01-15"
            aria-label="Date string"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
        <button id="ts-date-convert-btn" class="ts-btn ts-btn-primary">⚡ Convert</button>
      </div>

      <div id="ts-unix-result-grid" class="ts-result-grid" hidden>
        <div class="ts-result-row">
          <span class="ts-result-label">Unix (seconds)</span>
          <span class="ts-result-value" id="ts-r2-unix-s"></span>
          <button class="ts-copy-btn" data-target="ts-r2-unix-s" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">Unix (milliseconds)</span>
          <span class="ts-result-value" id="ts-r2-unix-ms"></span>
          <button class="ts-copy-btn" data-target="ts-r2-unix-ms" title="Copy">📋</button>
        </div>
        <div class="ts-result-row">
          <span class="ts-result-label">ISO 8601</span>
          <span class="ts-result-value" id="ts-r2-iso"></span>
          <button class="ts-copy-btn" data-target="ts-r2-iso" title="Copy">📋</button>
        </div>
      </div>
    </div>

    <div id="ts-error" class="ts-error" role="alert" aria-live="polite" hidden></div>

    <div class="ts-live-bar" id="ts-live-bar" aria-live="polite">
      <span class="ts-live-label">Current Unix time:</span>
      <span class="ts-live-seconds" id="ts-live-s">—</span> s &nbsp;/&nbsp;
      <span class="ts-live-ms" id="ts-live-ms">—</span> ms
    </div>
  `;

  // ── Element references ────────────────────────────────────────────────────
  const modeToDate = container.querySelector<HTMLButtonElement>('#ts-mode-to-date')!;
  const modeToUnix = container.querySelector<HTMLButtonElement>('#ts-mode-to-unix')!;
  const panelToDate = container.querySelector<HTMLDivElement>('#ts-panel-to-date')!;
  const panelToUnix = container.querySelector<HTMLDivElement>('#ts-panel-to-unix')!;

  const unixInput = container.querySelector<HTMLInputElement>('#ts-unix-input')!;
  const useNowBtn = container.querySelector<HTMLButtonElement>('#ts-use-now-btn')!;
  const convertBtn = container.querySelector<HTMLButtonElement>('#ts-convert-btn')!;
  const resultGrid = container.querySelector<HTMLDivElement>('#ts-result-grid')!;

  const dateInput = container.querySelector<HTMLInputElement>('#ts-date-input')!;
  const dateConvertBtn = container.querySelector<HTMLButtonElement>('#ts-date-convert-btn')!;
  const unixResultGrid = container.querySelector<HTMLDivElement>('#ts-unix-result-grid')!;

  const errorEl = container.querySelector<HTMLDivElement>('#ts-error')!;
  const liveS = container.querySelector<HTMLSpanElement>('#ts-live-s')!;
  const liveMs = container.querySelector<HTMLSpanElement>('#ts-live-ms')!;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getUnit(): 'seconds' | 'milliseconds' {
    const checked = container.querySelector<HTMLInputElement>('input[name="ts-unit"]:checked');
    return (checked?.value as 'seconds' | 'milliseconds') ?? 'seconds';
  }

  function showError(msg: string) {
    errorEl.hidden = false;
    errorEl.textContent = `⚠️ ${msg}`;
  }

  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  function setText(id: string, value: string) {
    const el = container.querySelector<HTMLElement>(`#${id}`);
    if (el) el.textContent = value;
  }

  function copyValue(targetId: string, btn: HTMLButtonElement) {
    const el = container.querySelector<HTMLElement>(`#${targetId}`);
    if (!el?.textContent) return;
    if (!navigator.clipboard) {
      btn.textContent = '❌';
      setTimeout(() => { btn.textContent = '📋'; }, 1500);
      return;
    }
    navigator.clipboard.writeText(el.textContent).then(() => {
      btn.textContent = '✅';
      setTimeout(() => { btn.textContent = '📋'; }, 1500);
      trackActivity('timestamp', 'Copied timestamp value', 'Value copied to clipboard');
    }).catch(() => {
      btn.textContent = '❌';
      setTimeout(() => { btn.textContent = '📋'; }, 1500);
    });
  }

  // ── Mode switching ────────────────────────────────────────────────────────
  function setMode(mode: 'to-date' | 'to-unix') {
    const isToDate = mode === 'to-date';
    modeToDate.classList.toggle('active', isToDate);
    modeToDate.setAttribute('aria-pressed', String(isToDate));
    modeToUnix.classList.toggle('active', !isToDate);
    modeToUnix.setAttribute('aria-pressed', String(!isToDate));
    panelToDate.hidden = !isToDate;
    panelToUnix.hidden = isToDate;
    clearError();
  }

  // ── Unix → Date conversion ────────────────────────────────────────────────
  function convertUnixToDate() {
    clearError();
    const raw = unixInput.value.trim();
    if (!raw) { showError('Please enter a Unix timestamp.'); return; }
    if (!/^-?\d+$/.test(raw)) { showError('Unix timestamp must be a whole number.'); return; }

    const ts = parseInt(raw, 10);
    const unit = getUnit();
    const result = unixToDate(ts, unit);

    setText('ts-r-iso', result.iso);
    setText('ts-r-utc', result.utc);
    setText('ts-r-local', result.local);
    setText('ts-r-relative', result.relative);
    setText('ts-r-date-only', result.dateOnly);
    setText('ts-r-time-only', result.timeOnly);
    setText('ts-r-dow', result.dayOfWeek);
    setText('ts-r-unix-s', String(result.unixSeconds));
    setText('ts-r-unix-ms', String(result.unixMilliseconds));

    resultGrid.hidden = false;
    trackActivity('timestamp', 'Converted Unix → Date', `${raw} (${unit}) → ${result.iso}`);
  }

  // ── Date → Unix conversion ────────────────────────────────────────────────
  function convertDateToUnix() {
    clearError();
    const raw = dateInput.value.trim();
    if (!raw) { showError('Please enter a date or time string.'); return; }

    const result = dateToUnix(raw);
    if (!result.success) {
      showError(result.error ?? 'Unknown error');
      unixResultGrid.hidden = true;
      return;
    }

    setText('ts-r2-unix-s', String(result.unixSeconds));
    setText('ts-r2-unix-ms', String(result.unixMilliseconds));
    setText('ts-r2-iso', result.iso);

    unixResultGrid.hidden = false;
    trackActivity('timestamp', 'Converted Date → Unix', `"${raw}" → ${result.unixSeconds}`);
  }

  // ── Auto-detect on Enter ──────────────────────────────────────────────────
  function handleSmartInput(value: string) {
    const type = detectInputType(value);
    if (type === 'unix') {
      setMode('to-date');
      unixInput.value = value;
    } else if (type === 'date') {
      setMode('to-unix');
      dateInput.value = value;
    }
  }

  // ── Live clock ────────────────────────────────────────────────────────────
  function updateLiveClock() {
    const { seconds, milliseconds } = getCurrentTimestamp();
    liveS.textContent = String(seconds);
    liveMs.textContent = String(milliseconds);
  }

  updateLiveClock();
  const clockInterval = setInterval(updateLiveClock, 1000);

  // Clean up interval when element is removed from DOM
  const observer = new MutationObserver(() => {
    if (!document.contains(container)) {
      clearInterval(clockInterval);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ── Event wiring ──────────────────────────────────────────────────────────
  modeToDate.addEventListener('click', () => setMode('to-date'));
  modeToUnix.addEventListener('click', () => setMode('to-unix'));

  useNowBtn.addEventListener('click', () => {
    const { seconds, milliseconds } = getCurrentTimestamp();
    const unit = getUnit();
    unixInput.value = String(unit === 'seconds' ? seconds : milliseconds);
    trackActivity('timestamp', 'Used current timestamp', 'Populated with current Unix time');
  });

  convertBtn.addEventListener('click', convertUnixToDate);
  unixInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') convertUnixToDate(); });

  dateConvertBtn.addEventListener('click', convertDateToUnix);
  dateInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') convertDateToUnix(); });

  // Paste smart-routing: detect what was pasted and switch mode automatically
  container.addEventListener('paste', (e) => {
    const text = e.clipboardData?.getData('text') ?? '';
    if (text.trim()) {
      // Small delay to let the paste event complete first
      setTimeout(() => handleSmartInput(text.trim()), 0);
    }
  });

  // Copy buttons
  container.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.ts-copy-btn');
    if (btn) {
      const target = btn.dataset.target;
      if (target) copyValue(target, btn);
    }
  });

  return container;
}
