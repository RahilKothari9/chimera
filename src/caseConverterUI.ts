import { convertAllCases, CASE_LABELS, type CaseType } from './caseConverter';
import { trackActivity } from './activityFeed';

const CASE_ORDER: CaseType[] = [
  'camel',
  'pascal',
  'snake',
  'kebab',
  'screaming_snake',
  'title',
  'sentence',
  'dot',
  'path',
  'lower',
  'upper',
];

export function createCaseConverterUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'case-converter-dashboard';
  container.className = 'case-converter-container card-section';

  container.innerHTML = `
    <h2 class="section-title">🔤 String Case Converter</h2>
    <p class="case-converter-description">
      Instantly convert text between all common naming conventions.
    </p>
    <div class="case-converter-input-row">
      <input
        type="text"
        id="case-converter-input"
        class="case-converter-input"
        placeholder="Enter text to convert, e.g. helloWorld or my-variable-name"
        aria-label="Text to convert"
        autocomplete="off"
        spellcheck="false"
      />
      <button id="case-converter-clear-btn" class="case-converter-btn case-converter-btn-secondary" aria-label="Clear input">
        Clear
      </button>
    </div>
    <div id="case-converter-results" class="case-converter-results" aria-live="polite" aria-label="Conversion results">
      <p class="case-converter-empty-state">Type above to see conversions</p>
    </div>
  `;

  const input = container.querySelector<HTMLInputElement>('#case-converter-input')!;
  const clearBtn = container.querySelector<HTMLButtonElement>('#case-converter-clear-btn')!;
  const results = container.querySelector<HTMLDivElement>('#case-converter-results')!;

  let trackDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  function debouncedTrack(value: string) {
    if (trackDebounceTimer !== null) clearTimeout(trackDebounceTimer);
    trackDebounceTimer = setTimeout(() => {
      if (value.trim()) {
        trackActivity(
          'case_converter',
          'Converted string',
          `Input: ${value.slice(0, 40)}${value.length > 40 ? '…' : ''}`
        );
      }
    }, 500);
  }

  function renderResults(text: string) {
    if (!text.trim()) {
      results.innerHTML = '<p class="case-converter-empty-state">Type above to see conversions</p>';
      return;
    }

    const conversion = convertAllCases(text);

    results.innerHTML = CASE_ORDER.map((caseType) => {
      const value = conversion.results[caseType];
      const label = CASE_LABELS[caseType];
      return `
        <div class="case-converter-row" data-case="${caseType}">
          <span class="case-converter-label">${label}</span>
          <code class="case-converter-value" id="case-val-${caseType}">${escapeHtml(value)}</code>
          <button
            class="case-converter-copy-btn case-converter-btn case-converter-btn-icon"
            data-case="${caseType}"
            aria-label="Copy ${label}"
          >📋</button>
        </div>
      `;
    }).join('');

    // Attach copy handlers
    results.querySelectorAll<HTMLButtonElement>('.case-converter-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ct = btn.dataset.case as CaseType;
        const value = conversion.results[ct];
        navigator.clipboard.writeText(value).then(() => {
          btn.textContent = '✅';
          setTimeout(() => (btn.textContent = '📋'), 1500);
          trackActivity(
            'case_converter',
            `Copied ${CASE_LABELS[ct]}`,
            `Value: ${value.slice(0, 40)}${value.length > 40 ? '…' : ''}`
          );
        });
      });
    });
  }

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  input.addEventListener('input', () => {
    renderResults(input.value);
    debouncedTrack(input.value);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    renderResults('');
    input.focus();
    trackActivity('case_converter', 'Cleared input', 'String case converter cleared');
  });

  return container;
}
