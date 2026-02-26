import { describe, it, expect, beforeEach } from 'vitest'
import { createColorPaletteUI } from './colorPaletteUI'

describe('createColorPaletteUI', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createColorPaletteUI()
    document.body.appendChild(container)
  })

  it('renders the root container with correct class and test id', () => {
    expect(container.className).toContain('cp-container')
    expect(container.getAttribute('data-testid')).toBe('color-palette-ui')
  })

  it('renders the section title', () => {
    const title = container.querySelector('h2')
    expect(title?.textContent).toContain('Color Palette Generator')
  })

  it('renders a colour input', () => {
    const input = container.querySelector<HTMLInputElement>('#cp-seed-color')
    expect(input).not.toBeNull()
    expect(input?.type).toBe('color')
  })

  it('renders a hex text input', () => {
    const input = container.querySelector<HTMLInputElement>('#cp-hex-input')
    expect(input).not.toBeNull()
    expect(input?.type).toBe('text')
  })

  it('renders the harmony select with 6 options', () => {
    const select = container.querySelector<HTMLSelectElement>('#cp-palette-type')
    expect(select).not.toBeNull()
    expect(select?.options.length).toBe(6)
  })

  it('renders a generate button', () => {
    const btn = container.querySelector<HTMLButtonElement>('#cp-generate-btn')
    expect(btn).not.toBeNull()
    expect(btn?.textContent).toContain('Generate')
  })

  it('renders a random colour button', () => {
    const btn = container.querySelector<HTMLButtonElement>('#cp-random-btn')
    expect(btn).not.toBeNull()
    expect(btn?.textContent).toContain('Random')
  })

  it('auto-generates a palette on creation', () => {
    const output = container.querySelector<HTMLElement>('#cp-palette-output')
    expect(output?.innerHTML).not.toBe('')
    expect(output?.querySelector('.cp-palette-grid')).not.toBeNull()
  })

  it('palette grid contains at least one swatch card', () => {
    const grid = container.querySelector('.cp-palette-grid')
    expect(grid?.querySelectorAll('.cp-swatch-card').length).toBeGreaterThan(0)
  })

  it('seed swatch card has cp-swatch-seed class', () => {
    const seed = container.querySelector('.cp-swatch-seed')
    expect(seed).not.toBeNull()
  })

  it('seed swatch badge reads "Seed"', () => {
    const badge = container.querySelector('.cp-swatch-badge')
    expect(badge?.textContent).toBe('Seed')
  })

  it('generates a new palette when generate button is clicked', () => {
    const hexInput = container.querySelector<HTMLInputElement>('#cp-hex-input')!
    hexInput.value = '#e74c3c'
    const btn = container.querySelector<HTMLButtonElement>('#cp-generate-btn')!
    btn.click()
    const cards = container.querySelectorAll('.cp-swatch-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('shows error for invalid hex', () => {
    const hexInput = container.querySelector<HTMLInputElement>('#cp-hex-input')!
    hexInput.value = 'notacolor'
    const colorInput = container.querySelector<HTMLInputElement>('#cp-seed-color')!
    colorInput.value = 'notacolor'
    const btn = container.querySelector<HTMLButtonElement>('#cp-generate-btn')!
    btn.click()
    const error = container.querySelector('.cp-error')
    expect(error).not.toBeNull()
  })

  it('random button changes the hex input', () => {
    const hexInput = container.querySelector<HTMLInputElement>('#cp-hex-input')!
    const originalValue = hexInput.value
    const randomBtn = container.querySelector<HTMLButtonElement>('#cp-random-btn')!

    // Fire it multiple times to avoid the rare case of same random value
    let changed = false
    for (let i = 0; i < 20; i++) {
      randomBtn.click()
      if (hexInput.value !== originalValue) {
        changed = true
        break
      }
    }
    expect(changed).toBe(true)
  })

  it('syncs colour picker to hex input on picker change', () => {
    const colorInput = container.querySelector<HTMLInputElement>('#cp-seed-color')!
    const hexInput = container.querySelector<HTMLInputElement>('#cp-hex-input')!
    colorInput.value = '#ff8800'
    colorInput.dispatchEvent(new Event('input'))
    expect(hexInput.value).toBe('#ff8800')
  })

  it('syncs hex input to colour picker on valid hex entry', () => {
    const colorInput = container.querySelector<HTMLInputElement>('#cp-seed-color')!
    const hexInput = container.querySelector<HTMLInputElement>('#cp-hex-input')!
    hexInput.value = '#ff8800'
    hexInput.dispatchEvent(new Event('input'))
    expect(colorInput.value).toBe('#ff8800')
  })

  it('does NOT sync colour picker when hex input is invalid', () => {
    const colorInput = container.querySelector<HTMLInputElement>('#cp-seed-color')!
    colorInput.value = '#3498db'
    const hexInput = container.querySelector<HTMLInputElement>('#cp-hex-input')!
    hexInput.value = '#zzz'
    hexInput.dispatchEvent(new Event('input'))
    expect(colorInput.value).toBe('#3498db')
  })

  it('updates type description when harmony changes', () => {
    const select = container.querySelector<HTMLSelectElement>('#cp-palette-type')!
    const desc = container.querySelector<HTMLParagraphElement>('#cp-type-description')!
    select.value = 'triadic'
    select.dispatchEvent(new Event('change'))
    expect(desc.textContent?.length).toBeGreaterThan(0)
  })

  it('renders copy buttons for each swatch', () => {
    const copyBtns = container.querySelectorAll('.cp-copy-btn')
    expect(copyBtns.length).toBeGreaterThan(0)
  })

  it('renders export buttons', () => {
    const exportRow = container.querySelector('.cp-export-row')
    expect(exportRow).not.toBeNull()
    const exportBtns = exportRow?.querySelectorAll('.cp-export-btn')
    expect(exportBtns?.length).toBeGreaterThanOrEqual(2)
  })

  it('switching to tetradic palette shows 4 swatches (seed + 3)', () => {
    const select = container.querySelector<HTMLSelectElement>('#cp-palette-type')!
    select.value = 'tetradic'
    const btn = container.querySelector<HTMLButtonElement>('#cp-generate-btn')!
    btn.click()
    const cards = container.querySelectorAll('.cp-swatch-card')
    expect(cards.length).toBe(4) // seed + 3 tetradic
  })

  it('switching to complementary palette shows 2 swatches (seed + 1)', () => {
    const select = container.querySelector<HTMLSelectElement>('#cp-palette-type')!
    select.value = 'complementary'
    const btn = container.querySelector<HTMLButtonElement>('#cp-generate-btn')!
    btn.click()
    const cards = container.querySelectorAll('.cp-swatch-card')
    expect(cards.length).toBe(2) // seed + 1 complement
  })

  it('switching to monochromatic palette shows 5 swatches (seed + 4)', () => {
    const select = container.querySelector<HTMLSelectElement>('#cp-palette-type')!
    select.value = 'monochromatic'
    const btn = container.querySelector<HTMLButtonElement>('#cp-generate-btn')!
    btn.click()
    const cards = container.querySelectorAll('.cp-swatch-card')
    expect(cards.length).toBe(5) // seed + 4 shades
  })

  it('swatch previews have inline background style', () => {
    const previews = container.querySelectorAll<HTMLElement>('.cp-swatch-preview')
    for (const preview of previews) {
      expect(preview.style.background).toBeTruthy()
    }
  })
})
