/**
 * Color Palette Generator UI
 * Interactive widget to generate and explore colour palettes
 */

import {
  generatePalette,
  generateRandomColor,
  getColorName,
  getContrastColor,
  PALETTE_TYPES,
  type ColorSwatch,
  type PaletteResult,
  type PaletteType,
} from './colorPalette'

// ---------------------------------------------------------------------------
// Copy-to-clipboard helper
// ---------------------------------------------------------------------------
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Swatch card
// ---------------------------------------------------------------------------
function createSwatchCard(swatch: ColorSwatch, isSeed = false): HTMLElement {
  const card = document.createElement('div')
  card.className = `cp-swatch-card${isSeed ? ' cp-swatch-seed' : ''}`
  card.setAttribute('data-hex', swatch.hex)

  const contrastColor = getContrastColor(swatch.hex)
  const colorName = getColorName(swatch.hex)

  card.innerHTML = `
    <div class="cp-swatch-preview" style="background:${swatch.hex};color:${contrastColor}">
      <span class="cp-swatch-label">${swatch.label}</span>
      ${isSeed ? '<span class="cp-swatch-badge">Seed</span>' : ''}
    </div>
    <div class="cp-swatch-info">
      <div class="cp-swatch-name">${colorName}</div>
      <button class="cp-copy-btn" data-value="${swatch.hex}" title="Copy HEX">
        ${swatch.hex}
      </button>
      <button class="cp-copy-btn cp-copy-rgb" data-value="rgb(${swatch.rgb.r}, ${swatch.rgb.g}, ${swatch.rgb.b})" title="Copy RGB">
        rgb(${swatch.rgb.r}, ${swatch.rgb.g}, ${swatch.rgb.b})
      </button>
      <button class="cp-copy-btn cp-copy-hsl" data-value="hsl(${swatch.hsl.h}, ${swatch.hsl.s}%, ${swatch.hsl.l}%)" title="Copy HSL">
        hsl(${swatch.hsl.h}, ${swatch.hsl.s}%, ${swatch.hsl.l}%)
      </button>
    </div>
  `

  // Wire up copy buttons
  card.querySelectorAll<HTMLButtonElement>('.cp-copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.value ?? ''
      const ok = await copyText(value)
      const prev = btn.textContent
      btn.textContent = ok ? '✓ Copied!' : '✗ Failed'
      btn.classList.add('cp-copy-feedback')
      setTimeout(() => {
        btn.textContent = prev
        btn.classList.remove('cp-copy-feedback')
      }, 1500)
    })
  })

  return card
}

// ---------------------------------------------------------------------------
// Palette grid
// ---------------------------------------------------------------------------
function renderPalette(container: HTMLElement, result: PaletteResult): void {
  container.innerHTML = ''

  const grid = document.createElement('div')
  grid.className = 'cp-palette-grid'

  grid.appendChild(createSwatchCard(result.seed, true))
  for (const swatch of result.swatches) {
    grid.appendChild(createSwatchCard(swatch))
  }

  container.appendChild(grid)

  // Export row
  const exportRow = document.createElement('div')
  exportRow.className = 'cp-export-row'

  const allSwatches = [result.seed, ...result.swatches]
  const hexList = allSwatches.map((s) => s.hex).join(', ')
  const cssVars = allSwatches
    .map((s, i) => `  --color-${i}: ${s.hex};`)
    .join('\n')
  const cssBlock = `:root {\n${cssVars}\n}`

  const copyHexBtn = document.createElement('button')
  copyHexBtn.className = 'cp-export-btn'
  copyHexBtn.textContent = 'Copy HEX list'
  copyHexBtn.addEventListener('click', async () => {
    const ok = await copyText(hexList)
    copyHexBtn.textContent = ok ? '✓ Copied!' : '✗ Failed'
    setTimeout(() => (copyHexBtn.textContent = 'Copy HEX list'), 1500)
  })

  const copyCssBtn = document.createElement('button')
  copyCssBtn.className = 'cp-export-btn'
  copyCssBtn.textContent = 'Copy CSS variables'
  copyCssBtn.addEventListener('click', async () => {
    const ok = await copyText(cssBlock)
    copyCssBtn.textContent = ok ? '✓ Copied!' : '✗ Failed'
    setTimeout(() => (copyCssBtn.textContent = 'Copy CSS variables'), 1500)
  })

  exportRow.appendChild(copyHexBtn)
  exportRow.appendChild(copyCssBtn)
  container.appendChild(exportRow)
}

// ---------------------------------------------------------------------------
// Main UI factory
// ---------------------------------------------------------------------------
export function createColorPaletteUI(): HTMLElement {
  const root = document.createElement('div')
  root.className = 'cp-container section-card'
  root.setAttribute('data-testid', 'color-palette-ui')

  root.innerHTML = `
    <div class="cp-header">
      <h2 class="section-title">🎨 Color Palette Generator</h2>
      <p class="cp-description">
        Pick a seed colour and a harmony rule to generate a beautiful colour palette.
        Click any value to copy it to your clipboard.
      </p>
    </div>
    <div class="cp-controls">
      <div class="cp-control-group">
        <label class="cp-label" for="cp-seed-color">Seed colour</label>
        <div class="cp-color-row">
          <input type="color" id="cp-seed-color" class="cp-color-input" value="#3498db" aria-label="Seed colour picker" />
          <input type="text"  id="cp-hex-input"  class="cp-hex-input"   value="#3498db" placeholder="#rrggbb" maxlength="7" aria-label="Hex colour input" />
          <button id="cp-random-btn" class="cp-btn cp-btn-secondary" title="Random colour">🎲 Random</button>
        </div>
      </div>
      <div class="cp-control-group">
        <label class="cp-label" for="cp-palette-type">Harmony</label>
        <select id="cp-palette-type" class="cp-select" aria-label="Colour harmony type"></select>
        <p id="cp-type-description" class="cp-type-description"></p>
      </div>
      <button id="cp-generate-btn" class="cp-btn cp-btn-primary">Generate Palette</button>
    </div>
    <div id="cp-palette-output" class="cp-palette-output" aria-live="polite"></div>
  `

  // Populate harmony selector
  const select = root.querySelector<HTMLSelectElement>('#cp-palette-type')!
  const typeDesc = root.querySelector<HTMLParagraphElement>('#cp-type-description')!

  for (const pt of PALETTE_TYPES) {
    const opt = document.createElement('option')
    opt.value = pt.value
    opt.textContent = pt.label
    select.appendChild(opt)
  }

  const updateTypeDesc = () => {
    const found = PALETTE_TYPES.find((p) => p.value === select.value)
    typeDesc.textContent = found?.description ?? ''
  }
  updateTypeDesc()
  select.addEventListener('change', updateTypeDesc)

  // Sync colour picker ↔ hex text field
  const colorInput = root.querySelector<HTMLInputElement>('#cp-seed-color')!
  const hexInput = root.querySelector<HTMLInputElement>('#cp-hex-input')!
  const output = root.querySelector<HTMLElement>('#cp-palette-output')!

  colorInput.addEventListener('input', () => {
    hexInput.value = colorInput.value
  })

  hexInput.addEventListener('input', () => {
    const val = hexInput.value.trim()
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      colorInput.value = val
    }
  })

  // Random button
  root.querySelector<HTMLButtonElement>('#cp-random-btn')!.addEventListener('click', () => {
    const color = generateRandomColor()
    colorInput.value = color
    hexInput.value = color
  })

  // Generate palette
  const generate = () => {
    const hex = hexInput.value.trim() || colorInput.value
    const type = select.value as PaletteType
    const result = generatePalette(hex, type)
    if (!result) {
      output.innerHTML = '<p class="cp-error">⚠ Invalid colour. Please enter a valid hex code.</p>'
      return
    }
    renderPalette(output, result)
  }

  root.querySelector<HTMLButtonElement>('#cp-generate-btn')!.addEventListener('click', generate)

  // Auto-generate on load
  generate()

  return root
}
