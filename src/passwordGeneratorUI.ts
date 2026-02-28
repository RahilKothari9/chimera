/**
 * Password Generator UI
 *
 * Interactive password generator with configurable options, strength meter,
 * entropy display, and clipboard support.
 */

import {
  generateMultiple,
  buildCharset,
  strengthLabel,
  strengthLevel,
  type PasswordOptions,
} from './passwordGenerator'
import { trackActivity } from './activityFeed'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function strengthColor(level: number): string {
  return ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][level] ?? '#ef4444'
}

function renderStrengthBar(strength: ReturnType<typeof strengthLabel>, level: number): string {
  const color = strengthColor(level)
  const pct = ((level + 1) / 5) * 100
  return `
    <div class="pw-strength-bar-track" role="progressbar" aria-valuenow="${level + 1}" aria-valuemin="1" aria-valuemax="5" aria-label="Password strength: ${strength}">
      <div class="pw-strength-bar-fill" style="width:${pct}%;background:${color};"></div>
    </div>
    <span class="pw-strength-label" style="color:${color};">${strength}</span>
  `
}

export function createPasswordGeneratorUI(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'password-generator-dashboard'
  container.className = 'password-generator-container card-section'

  container.innerHTML = `
    <h2 class="section-title">🔐 Password Generator</h2>
    <p class="section-description">Generate cryptographically random passwords with configurable options and strength analysis.</p>

    <div class="pw-layout">
      <!-- Options panel -->
      <div class="pw-options card">
        <h3 class="pw-panel-title">Options</h3>

        <div class="pw-option-row">
          <label for="pw-length-input" class="pw-option-label">Length: <strong id="pw-length-display">16</strong></label>
          <input id="pw-length-input" type="range" min="4" max="128" value="16" class="pw-length-slider" aria-label="Password length" />
        </div>

        <div class="pw-checkboxes">
          <label class="pw-checkbox-label">
            <input type="checkbox" id="pw-uppercase" checked />
            Uppercase (A–Z)
          </label>
          <label class="pw-checkbox-label">
            <input type="checkbox" id="pw-lowercase" checked />
            Lowercase (a–z)
          </label>
          <label class="pw-checkbox-label">
            <input type="checkbox" id="pw-numbers" checked />
            Numbers (0–9)
          </label>
          <label class="pw-checkbox-label">
            <input type="checkbox" id="pw-symbols" />
            Symbols (!@#…)
          </label>
          <label class="pw-checkbox-label">
            <input type="checkbox" id="pw-exclude-ambiguous" />
            Exclude ambiguous chars (0, O, l, 1, I)
          </label>
        </div>

        <div class="pw-count-row">
          <label for="pw-count-input" class="pw-option-label">Generate</label>
          <select id="pw-count-input" class="pw-select" aria-label="Number of passwords to generate">
            <option value="1" selected>1 password</option>
            <option value="3">3 passwords</option>
            <option value="5">5 passwords</option>
            <option value="10">10 passwords</option>
          </select>
        </div>

        <button id="pw-generate-btn" class="pw-generate-btn">
          ⟳ Generate
        </button>
      </div>

      <!-- Results panel -->
      <div class="pw-results-panel">
        <div id="pw-results-list" class="pw-results-list">
          <p class="pw-placeholder">Click "Generate" to create passwords.</p>
        </div>
      </div>
    </div>
  `

  wireEvents(container)
  return container
}

function wireEvents(container: HTMLElement): void {
  const lengthSlider = container.querySelector<HTMLInputElement>('#pw-length-input')!
  const lengthDisplay = container.querySelector<HTMLElement>('#pw-length-display')!
  const generateBtn = container.querySelector<HTMLButtonElement>('#pw-generate-btn')!
  const resultsList = container.querySelector<HTMLElement>('#pw-results-list')!

  // Sync slider ↔ display
  lengthSlider.addEventListener('input', () => {
    lengthDisplay.textContent = lengthSlider.value
  })

  generateBtn.addEventListener('click', () => {
    const opts = readOptions(container)
    const charset = buildCharset(opts)
    if (charset.length === 0) {
      resultsList.innerHTML = `<p class="pw-error">Select at least one character set.</p>`
      return
    }

    const count = parseInt((container.querySelector<HTMLSelectElement>('#pw-count-input')!).value, 10)
    const results = generateMultiple(opts, count)

    resultsList.innerHTML = results.map((r, i) => {
      const level = strengthLevel(r.strength)
      const label = strengthLabel(r.strength)
      return `
        <div class="pw-result-card" data-index="${i}">
          <div class="pw-result-header">
            <code class="pw-result-password" id="pw-pass-${i}">${escapeHtml(r.password)}</code>
            <button class="pw-copy-btn" data-index="${i}" aria-label="Copy password">
              📋 Copy
            </button>
          </div>
          <div class="pw-result-meta">
            ${renderStrengthBar(label, level)}
            <span class="pw-entropy">${r.entropy.toFixed(1)} bits entropy · ${r.charsetSize} chars in pool</span>
          </div>
        </div>
      `
    }).join('')

    // Wire copy buttons
    resultsList.querySelectorAll<HTMLButtonElement>('.pw-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index ?? '0', 10)
        const pw = results[idx].password
        navigator.clipboard.writeText(pw).then(() => {
          btn.textContent = '✅ Copied!'
          setTimeout(() => { btn.textContent = '📋 Copy' }, 1500)
          trackActivity('password_generate', 'Password copied', `${opts.length}-char ${results[idx].strength} password copied`)
        }).catch(() => {
          btn.textContent = '❌ Failed'
          setTimeout(() => { btn.textContent = '📋 Copy' }, 1500)
        })
      })
    })

    trackActivity('password_generate', 'Generated passwords', `${count} password(s), length ${opts.length}, strength: ${results[0]?.strength}`)
  })
}

function readOptions(container: HTMLElement): PasswordOptions {
  return {
    length: clamp(parseInt((container.querySelector<HTMLInputElement>('#pw-length-input')!).value, 10), 4, 128),
    uppercase: (container.querySelector<HTMLInputElement>('#pw-uppercase')!).checked,
    lowercase: (container.querySelector<HTMLInputElement>('#pw-lowercase')!).checked,
    numbers: (container.querySelector<HTMLInputElement>('#pw-numbers')!).checked,
    symbols: (container.querySelector<HTMLInputElement>('#pw-symbols')!).checked,
    excludeAmbiguous: (container.querySelector<HTMLInputElement>('#pw-exclude-ambiguous')!).checked,
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function setupPasswordGenerator(container: HTMLElement): void {
  container.innerHTML = ''
  container.appendChild(createPasswordGeneratorUI())
}
