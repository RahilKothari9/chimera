/**
 * Color Converter UI
 *
 * Interactive tool to convert between HEX, RGB, HSL and HSV color formats.
 * Updates live as the user types or picks a color.
 */

import { convertColor, type ColorFormats } from './colorConverter.ts'
import { trackActivity } from './activityFeed.ts'

/**
 * Build and return the Color Converter section element.
 * Mount it anywhere in the DOM.
 */
export function createColorConverterUI(): HTMLElement {
  const section = document.createElement('section')
  section.className = 'tool-section'
  section.setAttribute('aria-label', 'Color Converter')

  section.innerHTML = `
    <h2 class="section-title">🎨 Color Converter</h2>
    <p class="tool-description">
      Convert colors between HEX, RGB, HSL, and HSV formats instantly.
      Use the color picker or type any format into the input box.
    </p>

    <div class="color-converter-wrapper">
      <!-- Input row -->
      <div class="color-converter-input-row">
        <input
          type="color"
          id="color-picker"
          class="color-native-picker"
          value="#3b82f6"
          title="Pick a color"
          aria-label="Color picker"
        />
        <input
          type="text"
          id="color-text-input"
          class="color-text-input"
          placeholder="e.g. #3b82f6, rgb(59,130,246), hsl(217,91%,60%)"
          value="#3b82f6"
          aria-label="Color input"
          spellcheck="false"
          autocomplete="off"
        />
      </div>

      <!-- Preview swatch -->
      <div id="color-preview-swatch" class="color-preview-swatch" aria-hidden="true"></div>

      <!-- Error message -->
      <p id="color-converter-error" class="color-converter-error" role="alert" hidden></p>

      <!-- Results grid -->
      <div id="color-converter-results" class="color-converter-results"></div>
    </div>
  `

  const picker = section.querySelector<HTMLInputElement>('#color-picker')!
  const textInput = section.querySelector<HTMLInputElement>('#color-text-input')!
  const swatchEl = section.querySelector<HTMLDivElement>('#color-preview-swatch')!
  const errorEl = section.querySelector<HTMLParagraphElement>('#color-converter-error')!
  const resultsEl = section.querySelector<HTMLDivElement>('#color-converter-results')!

  // ── Render helpers ─────────────────────────────────────────────────────────

  function renderResults(formats: ColorFormats): void {
    errorEl.hidden = true
    swatchEl.style.backgroundColor = formats.hex
    swatchEl.title = formats.hex

    const rows: { label: string; value: string; copyValue: string }[] = [
      { label: 'HEX', value: formats.css.hex, copyValue: formats.css.hex },
      { label: 'RGB', value: formats.css.rgb, copyValue: formats.css.rgb },
      { label: 'HSL', value: formats.css.hsl, copyValue: formats.css.hsl },
      { label: 'HSV', value: formats.css.hsv, copyValue: formats.css.hsv },
    ]

    resultsEl.innerHTML = rows
      .map(
        ({ label, value, copyValue }) => `
        <div class="color-result-row">
          <span class="color-result-label">${label}</span>
          <code class="color-result-value">${value}</code>
          <button
            class="color-copy-btn btn-secondary"
            data-copy="${encodeURIComponent(copyValue)}"
            aria-label="Copy ${label} value"
            title="Copy ${label}"
          >Copy</button>
        </div>
      `,
      )
      .join('')

    // Attach copy listeners
    resultsEl.querySelectorAll<HTMLButtonElement>('.color-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = decodeURIComponent(btn.dataset.copy ?? '')
        navigator.clipboard
          .writeText(value)
          .then(() => {
            const original = btn.textContent
            btn.textContent = '✅ Copied'
            setTimeout(() => {
              btn.textContent = original
            }, 1500)
            trackActivity(
              'color_converter',
              'Copied color value',
              `Copied ${value} to clipboard`,
            )
          })
          .catch(() => {
            btn.textContent = '❌ Failed'
            setTimeout(() => {
              btn.textContent = 'Copy'
            }, 1500)
          })
      })
    })
  }

  function showError(message: string): void {
    errorEl.textContent = message
    errorEl.hidden = false
    resultsEl.innerHTML = ''
    swatchEl.style.backgroundColor = 'transparent'
  }

  // ── Conversion logic ───────────────────────────────────────────────────────

  function convert(input: string, source: 'text' | 'picker'): void {
    const formats = convertColor(input)
    if (!formats) {
      if (source === 'text') {
        showError(`Cannot parse "${input}". Try formats like: #ff0000, rgb(255,0,0), hsl(0,100%,50%)`)
      }
      return
    }

    renderResults(formats)

    // Sync the picker to the resolved hex value (picker only accepts #rrggbb)
    if (source === 'text') {
      picker.value = formats.hex
    }

    trackActivity(
      'color_converter',
      'Converted color',
      `${input.trim()} → ${formats.css.hex}`,
    )
  }

  // ── Event listeners ────────────────────────────────────────────────────────

  textInput.addEventListener('input', () => {
    convert(textInput.value, 'text')
  })

  picker.addEventListener('input', () => {
    textInput.value = picker.value
    convert(picker.value, 'picker')
  })

  // ── Initial render ─────────────────────────────────────────────────────────
  convert(textInput.value, 'picker')

  return section
}
