/**
 * Color Palette Generator UI
 * Interactive tool for generating harmonious color palettes and checking WCAG contrast
 */

import {
  generatePalette,
  checkContrast,
  colorFromHex,
  bestTextColor,
  type PaletteType,
  type ColorInfo,
} from './colorPalette.ts'
import { notificationManager } from './notificationSystem.ts'
import { trackActivity } from './activityFeed.ts'

const PRESET_COLORS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Crimson', hex: '#dc143c' },
  { name: 'Ocean Blue', hex: '#0066cc' },
  { name: 'Forest Green', hex: '#228b22' },
  { name: 'Sunset Orange', hex: '#ff6b35' },
  { name: 'Royal Purple', hex: '#7b2d8b' },
]

const PALETTE_TYPES: { value: PaletteType; label: string; desc: string }[] = [
  { value: 'complementary', label: 'Complementary', desc: 'Opposite colors on the wheel' },
  { value: 'analogous', label: 'Analogous', desc: 'Adjacent colors on the wheel' },
  { value: 'triadic', label: 'Triadic', desc: 'Three evenly spaced colors' },
  { value: 'tetradic', label: 'Tetradic', desc: 'Four evenly spaced colors' },
  { value: 'split-complementary', label: 'Split-Complementary', desc: 'Base + two adjacent to complement' },
  { value: 'monochromatic', label: 'Monochromatic', desc: 'Shades of a single hue' },
]

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    notificationManager.show(`Copied ${label} to clipboard`, { type: 'success' })
  }).catch(() => {
    notificationManager.show('Failed to copy to clipboard', { type: 'error' })
  })
}

function renderColorCard(color: ColorInfo): HTMLElement {
  const textColor = bestTextColor(color)
  const card = document.createElement('div')
  card.className = 'palette-color-card'
  card.setAttribute('data-hex', color.hex)

  const { h, s, l } = color.hsl
  const { r, g, b } = color.rgb

  const swatch = document.createElement('div')
  swatch.className = 'palette-swatch'
  swatch.style.backgroundColor = color.hex
  swatch.style.color = textColor.hex
  swatch.textContent = color.hex

  const values = document.createElement('div')
  values.className = 'palette-color-values'

  const rows: { fmt: string; val: string }[] = [
    { fmt: 'HEX', val: color.hex },
    { fmt: 'RGB', val: `rgb(${r}, ${g}, ${b})` },
    { fmt: 'HSL', val: `hsl(${h}, ${s}%, ${l}%)` },
  ]

  rows.forEach(({ fmt, val }) => {
    const row = document.createElement('div')
    row.className = 'palette-value-row'
    row.innerHTML = `
      <span class="palette-format-label">${fmt}</span>
      <code class="palette-code">${val}</code>
      <button class="palette-copy-btn" title="Copy ${fmt}">⎘</button>
    `
    row.querySelector<HTMLButtonElement>('.palette-copy-btn')!.addEventListener('click', () => {
      copyToClipboard(val, `${fmt} ${val}`)
      trackActivity('snippet', 'Copied color value', val)
    })
    values.appendChild(row)
  })

  card.appendChild(swatch)
  card.appendChild(values)
  return card
}

function renderContrastTable(colors: ColorInfo[]): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'contrast-checker'

  const title = document.createElement('h3')
  title.className = 'contrast-checker-title'
  title.textContent = 'Contrast Checker'
  wrapper.appendChild(title)

  const subtitle = document.createElement('p')
  subtitle.className = 'contrast-checker-subtitle'
  subtitle.textContent = 'WCAG 2.1 accessibility compliance for all color pairs'
  wrapper.appendChild(subtitle)

  if (colors.length < 2) {
    const msg = document.createElement('p')
    msg.textContent = 'Generate a palette with at least 2 colors to see contrast data.'
    wrapper.appendChild(msg)
    return wrapper
  }

  const table = document.createElement('table')
  table.className = 'contrast-table'

  const thead = table.createTHead()
  thead.innerHTML = `<tr>
    <th>Pair</th>
    <th>Ratio</th>
    <th>AA Large ≥3:1</th>
    <th>AA ≥4.5:1</th>
    <th>AAA Large ≥4.5:1</th>
    <th>AAA ≥7:1</th>
  </tr>`

  const tbody = table.createTBody()

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const result = checkContrast(colors[i], colors[j])
      const row = tbody.insertRow()
      const badge = (pass: boolean) =>
        pass
          ? `<span class="wcag-badge wcag-pass">✓ Pass</span>`
          : `<span class="wcag-badge wcag-fail">✗ Fail</span>`

      row.innerHTML = `
        <td class="contrast-pair-cell">
          <span class="contrast-swatch-mini" style="background:${colors[i].hex}"></span>
          <span class="contrast-swatch-mini" style="background:${colors[j].hex}"></span>
          <span class="contrast-pair-text">${colors[i].hex} / ${colors[j].hex}</span>
        </td>
        <td><strong>${result.ratioText}</strong></td>
        <td>${badge(result.aaLarge)}</td>
        <td>${badge(result.aa)}</td>
        <td>${badge(result.aaaLarge)}</td>
        <td>${badge(result.aaa)}</td>
      `
    }
  }

  table.appendChild(tbody)
  wrapper.appendChild(table)
  return wrapper
}

export function setupColorPalette(container: HTMLElement): void {
  container.innerHTML = `
    <div class="color-palette-wrapper">
      <h2 class="section-title">🎨 Color Palette Generator</h2>
      <p class="color-palette-subtitle">
        Generate harmonious color palettes from any base color and check WCAG 2.1 accessibility contrast ratios.
      </p>

      <div class="color-palette-controls">
        <div class="palette-control-group">
          <label class="palette-label" for="cp-color-picker">Base Color</label>
          <div class="palette-picker-row">
            <input type="color" id="cp-color-picker" value="#6366f1" class="cp-color-picker" />
            <input type="text" id="cp-hex-input" value="#6366f1" class="cp-hex-input" maxlength="7" placeholder="#rrggbb" />
          </div>
        </div>

        <div class="palette-control-group">
          <label class="palette-label" for="cp-palette-type">Harmony Rule</label>
          <select id="cp-palette-type" class="cp-palette-type">
            ${PALETTE_TYPES.map(t => `<option value="${t.value}">${t.label} — ${t.desc}</option>`).join('\n')}
          </select>
        </div>

        <div class="palette-control-group">
          <label class="palette-label">Presets</label>
          <div class="cp-presets">
            ${PRESET_COLORS.map(p => `<button class="cp-preset" style="background:${p.hex}" data-hex="${p.hex}" title="${p.name}: ${p.hex}" aria-label="${p.name}"></button>`).join('\n')}
          </div>
        </div>
      </div>

      <div id="cp-palette-output" class="cp-palette-output"></div>
    </div>
  `

  const picker = container.querySelector<HTMLInputElement>('#cp-color-picker')!
  const hexInput = container.querySelector<HTMLInputElement>('#cp-hex-input')!
  const typeSelect = container.querySelector<HTMLSelectElement>('#cp-palette-type')!
  const output = container.querySelector<HTMLDivElement>('#cp-palette-output')!

  function renderPalette(hex: string, type: PaletteType) {
    const palette = generatePalette(hex, type)
    if (!palette) {
      output.innerHTML = '<p class="cp-error">Invalid color. Please enter a valid hex value.</p>'
      return
    }

    output.innerHTML = ''

    const typeInfo = PALETTE_TYPES.find(t => t.value === type)!

    const header = document.createElement('div')
    header.className = 'cp-palette-header'
    header.innerHTML = `
      <span class="cp-palette-type-badge">${typeInfo.label}</span>
      <span class="cp-palette-count">${palette.colors.length} color${palette.colors.length !== 1 ? 's' : ''}</span>
    `
    output.appendChild(header)

    const grid = document.createElement('div')
    grid.className = 'cp-colors-grid'
    palette.colors.forEach(color => grid.appendChild(renderColorCard(color)))
    output.appendChild(grid)

    output.appendChild(renderContrastTable(palette.colors))

    trackActivity('page_view', 'Generated color palette', `${typeInfo.label} from ${hex}`)
  }

  function updateFromHex(hex: string) {
    const color = colorFromHex(hex)
    if (!color) return
    picker.value = color.hex
    hexInput.value = color.hex
    renderPalette(color.hex, typeSelect.value as PaletteType)
  }

  picker.addEventListener('input', () => {
    hexInput.value = picker.value
    renderPalette(picker.value, typeSelect.value as PaletteType)
  })

  hexInput.addEventListener('input', () => {
    const val = hexInput.value.trim()
    if (/^#?[0-9a-fA-F]{6}$/.test(val)) {
      updateFromHex(val.startsWith('#') ? val : '#' + val)
    }
  })

  typeSelect.addEventListener('change', () => {
    renderPalette(picker.value, typeSelect.value as PaletteType)
  })

  container.querySelectorAll<HTMLButtonElement>('.cp-preset').forEach(btn => {
    btn.addEventListener('click', () => updateFromHex(btn.dataset.hex!))
  })

  // Initial render
  renderPalette('#6366f1', 'complementary')
}
