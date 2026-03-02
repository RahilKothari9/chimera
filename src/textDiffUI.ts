import { computeDiff, toUnifiedString, type DiffResult } from './textDiff';
import { trackActivity } from './activityFeed';

const PLACEHOLDER_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}`;

const PLACEHOLDER_MODIFIED = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return name.length > 0;
}`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderSideBySide(result: DiffResult): string {
  if (result.stats.added === 0 && result.stats.removed === 0) {
    return '<div class="diff-empty">No differences found — texts are identical.</div>';
  }

  const rows = result.lines.map(dl => {
    const escaped = escapeHtml(dl.line);
    const leftNum = dl.leftLineNum != null ? String(dl.leftLineNum) : '';
    const rightNum = dl.rightLineNum != null ? String(dl.rightLineNum) : '';

    if (dl.type === 'unchanged') {
      return `<tr class="diff-unchanged">
        <td class="diff-line-num">${leftNum}</td>
        <td class="diff-cell">${escaped}</td>
        <td class="diff-line-num">${rightNum}</td>
        <td class="diff-cell">${escaped}</td>
      </tr>`;
    }
    if (dl.type === 'removed') {
      return `<tr class="diff-removed">
        <td class="diff-line-num">${leftNum}</td>
        <td class="diff-cell">${escaped}</td>
        <td class="diff-line-num"></td>
        <td class="diff-cell diff-empty-cell"></td>
      </tr>`;
    }
    // added
    return `<tr class="diff-added">
      <td class="diff-line-num"></td>
      <td class="diff-cell diff-empty-cell"></td>
      <td class="diff-line-num">${rightNum}</td>
      <td class="diff-cell">${escaped}</td>
    </tr>`;
  });

  return `<table class="diff-table" aria-label="Side-by-side diff">
    <thead>
      <tr>
        <th class="diff-line-num"></th>
        <th class="diff-col-header">Original</th>
        <th class="diff-line-num"></th>
        <th class="diff-col-header">Modified</th>
      </tr>
    </thead>
    <tbody>${rows.join('')}</tbody>
  </table>`;
}

function renderUnified(result: DiffResult): string {
  if (result.stats.added === 0 && result.stats.removed === 0) {
    return '<div class="diff-empty">No differences found — texts are identical.</div>';
  }

  const rows = result.lines.map(dl => {
    const escaped = escapeHtml(dl.line);
    const prefix = dl.type === 'added' ? '+' : dl.type === 'removed' ? '−' : ' ';
    const lineNum = dl.type === 'added'
      ? (dl.rightLineNum != null ? String(dl.rightLineNum) : '')
      : (dl.leftLineNum != null ? String(dl.leftLineNum) : '');

    return `<tr class="diff-${dl.type}">
      <td class="diff-line-num">${lineNum}</td>
      <td class="diff-prefix">${prefix}</td>
      <td class="diff-cell">${escaped}</td>
    </tr>`;
  });

  return `<table class="diff-table" aria-label="Unified diff">
    <thead>
      <tr>
        <th class="diff-line-num">#</th>
        <th class="diff-prefix"></th>
        <th class="diff-col-header">Diff</th>
      </tr>
    </thead>
    <tbody>${rows.join('')}</tbody>
  </table>`;
}

export function createTextDiffUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'text-diff-dashboard';
  container.className = 'text-diff-container card-section';

  container.innerHTML = `
    <h2 class="section-title">📄 Text Diff Tool</h2>
    <p class="section-description">Compare two blocks of text and see the line-by-line differences.</p>

    <div class="diff-inputs">
      <div class="diff-input-group">
        <label class="diff-label" for="diff-original">Original</label>
        <textarea
          id="diff-original"
          class="diff-textarea"
          rows="10"
          placeholder="Paste original text here…"
          aria-label="Original text"
          spellcheck="false"
        >${PLACEHOLDER_ORIGINAL}</textarea>
      </div>
      <div class="diff-input-group">
        <label class="diff-label" for="diff-modified">Modified</label>
        <textarea
          id="diff-modified"
          class="diff-textarea"
          rows="10"
          placeholder="Paste modified text here…"
          aria-label="Modified text"
          spellcheck="false"
        >${PLACEHOLDER_MODIFIED}</textarea>
      </div>
    </div>

    <div class="diff-toolbar">
      <button id="diff-run-btn" class="diff-btn diff-btn-primary">⚡ Compare</button>
      <button id="diff-clear-btn" class="diff-btn">🗑 Clear</button>
      <div class="diff-view-toggle" role="group" aria-label="View mode">
        <button id="diff-view-side" class="diff-view-btn active" aria-pressed="true">Side by Side</button>
        <button id="diff-view-unified" class="diff-view-btn" aria-pressed="false">Unified</button>
      </div>
      <button id="diff-copy-btn" class="diff-btn">📋 Copy Diff</button>
    </div>

    <div id="diff-stats" class="diff-stats" aria-live="polite" hidden></div>

    <div id="diff-output" class="diff-output" aria-live="polite"></div>
  `;

  // Wire up logic after inserting into DOM
  const originalTA = container.querySelector<HTMLTextAreaElement>('#diff-original')!;
  const modifiedTA = container.querySelector<HTMLTextAreaElement>('#diff-modified')!;
  const runBtn = container.querySelector<HTMLButtonElement>('#diff-run-btn')!;
  const clearBtn = container.querySelector<HTMLButtonElement>('#diff-clear-btn')!;
  const viewSideBtn = container.querySelector<HTMLButtonElement>('#diff-view-side')!;
  const viewUnifiedBtn = container.querySelector<HTMLButtonElement>('#diff-view-unified')!;
  const copyBtn = container.querySelector<HTMLButtonElement>('#diff-copy-btn')!;
  const statsEl = container.querySelector<HTMLDivElement>('#diff-stats')!;
  const outputEl = container.querySelector<HTMLDivElement>('#diff-output')!;

  let currentResult: DiffResult | null = null;
  let viewMode: 'side' | 'unified' = 'side';

  function renderOutput() {
    if (!currentResult) return;
    outputEl.innerHTML = viewMode === 'side'
      ? renderSideBySide(currentResult)
      : renderUnified(currentResult);
  }

  function runDiff() {
    const original = originalTA.value;
    const modified = modifiedTA.value;
    currentResult = computeDiff(original, modified);

    const { added, removed, unchanged } = currentResult.stats;
    statsEl.hidden = false;
    statsEl.innerHTML = `
      <span class="diff-stat diff-stat-added">+${added} added</span>
      <span class="diff-stat diff-stat-removed">−${removed} removed</span>
      <span class="diff-stat diff-stat-unchanged">${unchanged} unchanged</span>
    `;

    renderOutput();
    trackActivity('text_diff', 'Ran text diff', `${added} added, ${removed} removed, ${unchanged} unchanged`);
  }

  function setView(mode: 'side' | 'unified') {
    viewMode = mode;
    viewSideBtn.classList.toggle('active', mode === 'side');
    viewSideBtn.setAttribute('aria-pressed', String(mode === 'side'));
    viewUnifiedBtn.classList.toggle('active', mode === 'unified');
    viewUnifiedBtn.setAttribute('aria-pressed', String(mode === 'unified'));
    renderOutput();
  }

  runBtn.addEventListener('click', runDiff);

  clearBtn.addEventListener('click', () => {
    originalTA.value = '';
    modifiedTA.value = '';
    currentResult = null;
    statsEl.hidden = true;
    statsEl.innerHTML = '';
    outputEl.innerHTML = '';
  });

  viewSideBtn.addEventListener('click', () => setView('side'));
  viewUnifiedBtn.addEventListener('click', () => setView('unified'));

  copyBtn.addEventListener('click', () => {
    if (!currentResult) return;
    const text = toUnifiedString(currentResult);
    if (!navigator.clipboard) {
      copyBtn.textContent = '❌ Not supported';
      setTimeout(() => { copyBtn.textContent = '📋 Copy Diff'; }, 2000);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => { copyBtn.textContent = '📋 Copy Diff'; }, 2000);
      trackActivity('text_diff', 'Copied diff', 'Unified diff copied to clipboard');
    }).catch(() => {
      copyBtn.textContent = '❌ Failed';
      setTimeout(() => { copyBtn.textContent = '📋 Copy Diff'; }, 2000);
    });
  });

  // Run an initial diff with the placeholder text
  runDiff();

  return container;
}
