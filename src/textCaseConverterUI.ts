import { convertAllCases, convertCase, CASE_LABELS, type TextCase } from './textCaseConverter';
import { trackActivity } from './activityFeed';

export function createTextCaseConverterUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'text-case-converter-dashboard';
  container.className = 'text-case-container card-section';

  container.innerHTML = `
    <h2 class="section-title">🔡 Text Case Converter</h2>
    <p class="section-description">Convert text between camelCase, PascalCase, snake_case, kebab-case, and more. Paste any text or identifier to see all formats at once.</p>

    <div class="tcc-input-group">
      <label class="tcc-label" for="tcc-input">Input Text</label>
      <textarea
        id="tcc-input"
        class="tcc-textarea"
        rows="3"
        placeholder="Type or paste text here… e.g. hello world, helloWorld, hello_world"
        aria-label="Input text"
        spellcheck="false"
      ></textarea>
      <button id="tcc-clear-btn" class="tcc-btn tcc-btn-secondary" title="Clear input">🗑 Clear</button>
    </div>

    <div id="tcc-results" class="tcc-results" aria-live="polite" aria-label="Conversion results">
      <p class="tcc-placeholder">Results will appear here as you type…</p>
    </div>
  `;

  const inputTA = container.querySelector<HTMLTextAreaElement>('#tcc-input')!;
  const clearBtn = container.querySelector<HTMLButtonElement>('#tcc-clear-btn')!;
  const resultsEl = container.querySelector<HTMLDivElement>('#tcc-results')!;

  const ALL_CASES: TextCase[] = [
    'camel', 'pascal', 'snake', 'kebab', 'screaming_snake',
    'title', 'sentence', 'dot', 'lower', 'upper',
  ];

  function renderResults(input: string) {
    if (!input.trim()) {
      resultsEl.innerHTML = '<p class="tcc-placeholder">Results will appear here as you type…</p>';
      return;
    }

    const converted = convertAllCases(input);

    const rows = ALL_CASES.map((c) => {
      const value = converted[c];
      return `
        <div class="tcc-result-row" data-case="${c}">
          <span class="tcc-result-label">${CASE_LABELS[c]}</span>
          <code class="tcc-result-value" id="tcc-val-${c}">${escapeHtml(value)}</code>
          <button
            class="tcc-copy-btn"
            data-case="${c}"
            aria-label="Copy ${CASE_LABELS[c]}"
            title="Copy"
          >📋</button>
        </div>
      `;
    }).join('');

    resultsEl.innerHTML = `<div class="tcc-result-grid">${rows}</div>`;

    // Attach copy button listeners
    resultsEl.querySelectorAll<HTMLButtonElement>('.tcc-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetCase = btn.dataset.case as TextCase;
        const text = convertCase(input, targetCase).output;
        handleCopy(btn, text, targetCase);
      });
    });
  }

  function handleCopy(btn: HTMLButtonElement, text: string, targetCase: TextCase) {
    if (!navigator.clipboard) {
      btn.textContent = '❌';
      setTimeout(() => { btn.textContent = '📋'; }, 2000);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✅';
      setTimeout(() => { btn.textContent = '📋'; }, 2000);
      trackActivity('text-case-converter', 'Copied case conversion', `${CASE_LABELS[targetCase]}: ${text}`);
    }).catch(() => {
      btn.textContent = '❌';
      setTimeout(() => { btn.textContent = '📋'; }, 2000);
    });
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  inputTA.addEventListener('input', () => {
    renderResults(inputTA.value);
    if (inputTA.value.trim()) {
      trackActivity('text-case-converter', 'Converted text cases', inputTA.value.trim().slice(0, 40));
    }
  });

  clearBtn.addEventListener('click', () => {
    inputTA.value = '';
    renderResults('');
  });

  return container;
}
