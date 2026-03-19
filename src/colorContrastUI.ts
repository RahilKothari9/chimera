import {
  parseColor,
  evaluateContrast,
  rgbToHex,
  suggestAccessibleColor,
  getComplianceSummary,
  type RgbColor,
  type ContrastResult,
} from './colorContrast'
import { trackActivity } from './activityFeed'

export function createColorContrastUI(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'color-contrast-dashboard'
  container.className = 'cc-container card-section'

  container.innerHTML = `
    <h2 class="section-title">🎨 Color Contrast Checker</h2>
    <p class="section-description">
      Check WCAG 2.1 color contrast ratios for accessibility compliance.
      Enter a foreground and background color to get instant feedback.
    </p>

    <div class="cc-inputs">
      <div class="cc-color-group">
        <label class="cc-label" for="cc-fg-text">Foreground Color</label>
        <div class="cc-color-row">
          <input type="color" id="cc-fg-picker" class="cc-picker" value="#7c3aed" aria-label="Foreground color picker" />
          <input
            type="text"
            id="cc-fg-text"
            class="cc-text-input"
            value="#7c3aed"
            placeholder="#rrggbb or rgb()"
            aria-label="Foreground color value"
            spellcheck="false"
          />
        </div>
        <div id="cc-fg-error" class="cc-field-error" hidden></div>
      </div>

      <button id="cc-swap-btn" class="cc-swap-btn" title="Swap foreground and background" aria-label="Swap colors">⇄</button>

      <div class="cc-color-group">
        <label class="cc-label" for="cc-bg-text">Background Color</label>
        <div class="cc-color-row">
          <input type="color" id="cc-bg-picker" class="cc-picker" value="#ffffff" aria-label="Background color picker" />
          <input
            type="text"
            id="cc-bg-text"
            class="cc-text-input"
            value="#ffffff"
            placeholder="#rrggbb or rgb()"
            aria-label="Background color value"
            spellcheck="false"
          />
        </div>
        <div id="cc-bg-error" class="cc-field-error" hidden></div>
      </div>
    </div>

    <div id="cc-preview" class="cc-preview" aria-live="polite">
      <div id="cc-preview-box" class="cc-preview-box" style="background:#ffffff; color:#7c3aed">
        <span class="cc-preview-normal">Normal text sample Aa</span>
        <span class="cc-preview-large">Large text sample Aa</span>
      </div>
    </div>

    <div id="cc-result" class="cc-result" aria-live="polite" hidden></div>

    <div id="cc-suggestion" class="cc-suggestion" aria-live="polite" hidden></div>

    <div class="cc-presets">
      <p class="cc-presets-label">Quick presets:</p>
      <div class="cc-preset-list">
        <button class="cc-preset-btn" data-fg="#000000" data-bg="#ffffff">Black / White</button>
        <button class="cc-preset-btn" data-fg="#ffffff" data-bg="#000000">White / Black</button>
        <button class="cc-preset-btn" data-fg="#1d4ed8" data-bg="#eff6ff">Blue / Light</button>
        <button class="cc-preset-btn" data-fg="#dc2626" data-bg="#fff1f2">Red / Light</button>
        <button class="cc-preset-btn" data-fg="#065f46" data-bg="#ecfdf5">Green / Light</button>
        <button class="cc-preset-btn" data-fg="#7c3aed" data-bg="#f5f3ff">Purple / Light</button>
        <button class="cc-preset-btn" data-fg="#92400e" data-bg="#fffbeb">Amber / Light</button>
        <button class="cc-preset-btn" data-fg="#6b7280" data-bg="#ffffff">Gray / White</button>
      </div>
    </div>
  `

  // --- Element refs ---
  const fgPicker = container.querySelector<HTMLInputElement>('#cc-fg-picker')!
  const fgText = container.querySelector<HTMLInputElement>('#cc-fg-text')!
  const fgError = container.querySelector<HTMLDivElement>('#cc-fg-error')!
  const bgPicker = container.querySelector<HTMLInputElement>('#cc-bg-picker')!
  const bgText = container.querySelector<HTMLInputElement>('#cc-bg-text')!
  const bgError = container.querySelector<HTMLDivElement>('#cc-bg-error')!
  const swapBtn = container.querySelector<HTMLButtonElement>('#cc-swap-btn')!
  const previewBox = container.querySelector<HTMLDivElement>('#cc-preview-box')!
  const resultEl = container.querySelector<HTMLDivElement>('#cc-result')!
  const suggestionEl = container.querySelector<HTMLDivElement>('#cc-suggestion')!

  // --- State ---
  let fgColor: RgbColor = { r: 124, g: 58, b: 237 }
  let bgColor: RgbColor = { r: 255, g: 255, b: 255 }

  // --- Helpers ---
  function checkRow(pass: boolean, label: string): string {
    return `<tr>
      <td class="cc-table-label">${label}</td>
      <td class="cc-table-badge ${pass ? 'cc-pass' : 'cc-fail'}">${pass ? '✅ Pass' : '❌ Fail'}</td>
    </tr>`
  }

  function renderResult() {
    const result: ContrastResult = evaluateContrast(fgColor, bgColor)
    const summary = getComplianceSummary(result.level)

    resultEl.hidden = false
    resultEl.innerHTML = `
      <div class="cc-ratio-hero">
        <span class="cc-ratio-value">${result.ratioLabel}</span>
        <span class="cc-level-badge" style="background:${summary.color}">${summary.label}</span>
      </div>
      <p class="cc-level-desc">${summary.description}</p>

      <table class="cc-table">
        <thead>
          <tr><th>Criterion</th><th>Result</th></tr>
        </thead>
        <tbody>
          ${checkRow(result.normalTextAA, 'Normal text — AA (≥ 4.5:1)')}
          ${checkRow(result.normalTextAAA, 'Normal text — AAA (≥ 7:1)')}
          ${checkRow(result.largeTextAA, 'Large text — AA (≥ 3:1)')}
          ${checkRow(result.largeTextAAA, 'Large text — AAA (≥ 4.5:1)')}
          ${checkRow(result.uiComponentsAA, 'UI components — AA (≥ 3:1)')}
        </tbody>
      </table>
    `

    // Suggestion
    if (result.level !== 'AAA' && result.level !== 'AA') {
      const suggestion = suggestAccessibleColor(fgColor, bgColor, 4.5)
      if (suggestion) {
        const sugHex = rgbToHex(suggestion)
        const sugRatio = evaluateContrast(suggestion, bgColor)
        suggestionEl.hidden = false
        suggestionEl.innerHTML = `
          <p class="cc-suggestion-title">💡 Suggested accessible foreground:</p>
          <div class="cc-suggestion-row">
            <span class="cc-sug-swatch" style="background:${sugHex};border:2px solid var(--color-border)"></span>
            <code class="cc-sug-hex">${sugHex}</code>
            <span class="cc-sug-ratio">${sugRatio.ratioLabel} (${sugRatio.level})</span>
            <button class="cc-sug-apply-btn" data-hex="${sugHex}">Apply</button>
          </div>
        `
        const applyBtn = suggestionEl.querySelector<HTMLButtonElement>('.cc-sug-apply-btn')
        applyBtn?.addEventListener('click', () => {
          setForeground(sugHex)
        })
      } else {
        suggestionEl.hidden = true
      }
    } else {
      suggestionEl.hidden = true
    }

    // Update preview
    previewBox.style.backgroundColor = rgbToHex(bgColor)
    previewBox.style.color = rgbToHex(fgColor)

    trackActivity(
      'color_contrast',
      'Checked color contrast',
      `${rgbToHex(fgColor)} on ${rgbToHex(bgColor)} — ${result.ratioLabel} (${result.level})`,
    )
  }

  function setForeground(hex: string) {
    fgText.value = hex
    fgPicker.value = hex
    const parsed = parseColor(hex)
    if (parsed.color) {
      fgColor = parsed.color
      fgError.hidden = true
    }
    renderResult()
  }

  function setBackground(hex: string) {
    bgText.value = hex
    bgPicker.value = hex
    const parsed = parseColor(hex)
    if (parsed.color) {
      bgColor = parsed.color
      bgError.hidden = true
    }
    renderResult()
  }

  function handleFgTextChange() {
    const parsed = parseColor(fgText.value)
    if (parsed.color) {
      fgColor = parsed.color
      fgError.hidden = true
      const hex = rgbToHex(fgColor)
      fgPicker.value = hex
      renderResult()
    } else {
      fgError.hidden = false
      fgError.textContent = parsed.error ?? 'Invalid color'
    }
  }

  function handleBgTextChange() {
    const parsed = parseColor(bgText.value)
    if (parsed.color) {
      bgColor = parsed.color
      bgError.hidden = true
      const hex = rgbToHex(bgColor)
      bgPicker.value = hex
      renderResult()
    } else {
      bgError.hidden = false
      bgError.textContent = parsed.error ?? 'Invalid color'
    }
  }

  // --- Event listeners ---
  fgPicker.addEventListener('input', () => {
    fgText.value = fgPicker.value
    const parsed = parseColor(fgPicker.value)
    if (parsed.color) {
      fgColor = parsed.color
      fgError.hidden = true
      renderResult()
    }
  })

  bgPicker.addEventListener('input', () => {
    bgText.value = bgPicker.value
    const parsed = parseColor(bgPicker.value)
    if (parsed.color) {
      bgColor = parsed.color
      bgError.hidden = true
      renderResult()
    }
  })

  fgText.addEventListener('change', handleFgTextChange)
  fgText.addEventListener('blur', handleFgTextChange)
  bgText.addEventListener('change', handleBgTextChange)
  bgText.addEventListener('blur', handleBgTextChange)

  swapBtn.addEventListener('click', () => {
    const tmpColor = fgColor
    fgColor = bgColor
    bgColor = tmpColor
    const fgHex = rgbToHex(fgColor)
    const bgHex = rgbToHex(bgColor)
    fgText.value = fgHex
    fgPicker.value = fgHex
    bgText.value = bgHex
    bgPicker.value = bgHex
    renderResult()
  })

  // Preset buttons
  container.querySelectorAll<HTMLButtonElement>('.cc-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const fg = btn.dataset.fg!
      const bg = btn.dataset.bg!
      setForeground(fg)
      setBackground(bg)
    })
  })

  // Initial render
  renderResult()

  return container
}
