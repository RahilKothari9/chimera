import {
  validateCronExpression,
  describeCronExpression,
  getNextExecutions,
  CRON_PRESETS,
  CRON_FIELDS,
} from './cronParser';
import { trackActivity } from './activityFeed';

export function createCronParserUI(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'cron-parser-dashboard';
  container.className = 'cron-parser-container card-section';

  container.innerHTML = `
    <h2 class="section-title">⏰ Cron Expression Parser</h2>
    <p class="cron-subtitle">Parse and understand cron expressions for scheduled tasks</p>

    <div class="cron-input-row">
      <input
        type="text"
        id="cron-expression-input"
        class="cron-expression-input"
        placeholder="e.g. */5 * * * *"
        value="* * * * *"
        aria-label="Cron expression"
        spellcheck="false"
        autocomplete="off"
      />
      <button id="cron-parse-btn" class="cron-btn cron-btn-primary">Parse</button>
    </div>

    <div class="cron-field-labels" aria-label="Cron field positions">
      ${CRON_FIELDS.map((f) => `<span class="cron-field-label">${f.name}</span>`).join('')}
    </div>

    <div id="cron-validation-banner" class="cron-validation-banner" role="alert" aria-live="polite"></div>

    <div id="cron-results" class="cron-results" aria-live="polite">
      <div class="cron-summary-card">
        <div class="cron-summary-label">Expression means:</div>
        <div id="cron-summary-text" class="cron-summary-text">—</div>
      </div>

      <div class="cron-breakdown-grid" id="cron-breakdown-grid" aria-label="Field breakdown">
      </div>

      <div class="cron-next-runs">
        <h3 class="cron-next-title">Next 5 Scheduled Runs</h3>
        <ol id="cron-next-list" class="cron-next-list" aria-label="Next execution times">
          <li class="cron-next-item cron-empty">Enter an expression to see upcoming runs</li>
        </ol>
      </div>
    </div>

    <div class="cron-presets-section">
      <h3 class="cron-presets-title">Common Presets</h3>
      <div class="cron-presets-grid" id="cron-presets-grid" role="list" aria-label="Cron presets">
      </div>
    </div>
  `;

  const expressionInput = container.querySelector<HTMLInputElement>('#cron-expression-input')!;
  const parseBtn = container.querySelector<HTMLButtonElement>('#cron-parse-btn')!;
  const validationBanner = container.querySelector<HTMLDivElement>('#cron-validation-banner')!;
  const summaryText = container.querySelector<HTMLDivElement>('#cron-summary-text')!;
  const breakdownGrid = container.querySelector<HTMLDivElement>('#cron-breakdown-grid')!;
  const nextList = container.querySelector<HTMLOListElement>('#cron-next-list')!;
  const presetsGrid = container.querySelector<HTMLDivElement>('#cron-presets-grid')!;

  // Render presets
  presetsGrid.innerHTML = CRON_PRESETS.map(
    (preset) => `
    <button
      class="cron-preset-btn"
      data-expression="${preset.expression}"
      title="${preset.description}"
      role="listitem"
      aria-label="Use preset: ${preset.label} (${preset.expression})"
    >
      <span class="cron-preset-label">${preset.label}</span>
      <code class="cron-preset-expr">${preset.expression}</code>
    </button>
  `
  ).join('');

  presetsGrid.querySelectorAll<HTMLButtonElement>('.cron-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expr = btn.dataset.expression!;
      expressionInput.value = expr;
      parseExpression(expr);
      trackActivity('cron_parser', 'Used preset', `Preset: ${expr}`);
    });
  });

  function renderBreakdown(expression: string) {
    const validation = validateCronExpression(expression);
    breakdownGrid.innerHTML = validation.descriptions
      .map(
        (d) => `
      <div class="cron-field-card ${d.valid ? 'cron-field-valid' : 'cron-field-invalid'}">
        <span class="cron-field-name">${d.field}</span>
        <code class="cron-field-raw">${d.raw}</code>
        <span class="cron-field-desc">${d.description}</span>
      </div>
    `
      )
      .join('');
  }

  function renderNextRuns(expression: string) {
    const dates = getNextExecutions(expression, 5);
    if (dates.length === 0) {
      nextList.innerHTML = '<li class="cron-next-item cron-empty">No upcoming runs found</li>';
      return;
    }
    nextList.innerHTML = dates
      .map((date) => {
        const formatted = formatDateTime(date);
        const relative = getRelativeTime(date);
        return `<li class="cron-next-item">
          <span class="cron-next-datetime">${formatted}</span>
          <span class="cron-next-relative">${relative}</span>
        </li>`;
      })
      .join('');
  }

  function parseExpression(expression: string) {
    const trimmed = expression.trim();
    if (!trimmed) {
      validationBanner.textContent = '';
      validationBanner.className = 'cron-validation-banner';
      summaryText.textContent = '—';
      breakdownGrid.innerHTML = '';
      nextList.innerHTML = '<li class="cron-next-item cron-empty">Enter an expression to see upcoming runs</li>';
      return;
    }

    const validation = validateCronExpression(trimmed);

    if (!validation.valid) {
      validationBanner.textContent = `❌ ${validation.error ?? 'Invalid expression'}`;
      validationBanner.className = 'cron-validation-banner cron-banner-error';
      summaryText.textContent = 'Invalid expression';
      renderBreakdown(trimmed);
      nextList.innerHTML = '<li class="cron-next-item cron-empty">Fix the expression to see upcoming runs</li>';
    } else {
      validationBanner.textContent = '✅ Valid cron expression';
      validationBanner.className = 'cron-validation-banner cron-banner-success';
      summaryText.textContent = describeCronExpression(trimmed);
      renderBreakdown(trimmed);
      renderNextRuns(trimmed);
    }

    trackActivity('cron_parser', 'Parsed cron expression', trimmed);
  }

  parseBtn.addEventListener('click', () => {
    parseExpression(expressionInput.value);
  });

  expressionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') parseExpression(expressionInput.value);
  });

  // Parse the default value on load
  parseExpression(expressionInput.value);

  return container;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  if (diffMs < 0) return 'in the past';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'in less than a minute';
  if (diffMin < 60) return `in ${diffMin} minute${diffMin !== 1 ? 's' : ''}`;
  if (diffHr < 24) return `in ${diffHr} hour${diffHr !== 1 ? 's' : ''}`;
  return `in ${diffDay} day${diffDay !== 1 ? 's' : ''}`;
}
