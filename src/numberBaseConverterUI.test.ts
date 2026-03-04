import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createNumberBaseConverterUI } from './numberBaseConverterUI'

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

const writeTextMock = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
})

describe('Number Base Converter UI', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    writeTextMock.mockClear()
  })

  describe('createNumberBaseConverterUI', () => {
    it('creates a container with correct id', () => {
      const el = createNumberBaseConverterUI()
      expect(el.id).toBe('number-base-converter-dashboard')
    })

    it('contains a binary input', () => {
      const el = createNumberBaseConverterUI()
      expect(el.querySelector('#nbc-binary')).toBeTruthy()
    })

    it('contains an octal input', () => {
      const el = createNumberBaseConverterUI()
      expect(el.querySelector('#nbc-octal')).toBeTruthy()
    })

    it('contains a decimal input', () => {
      const el = createNumberBaseConverterUI()
      expect(el.querySelector('#nbc-decimal')).toBeTruthy()
    })

    it('contains a hex input', () => {
      const el = createNumberBaseConverterUI()
      expect(el.querySelector('#nbc-hex')).toBeTruthy()
    })

    it('contains a clear button', () => {
      const el = createNumberBaseConverterUI()
      expect(el.querySelector('#nbc-clear-btn')).toBeTruthy()
    })

    it('contains a copy decimal button', () => {
      const el = createNumberBaseConverterUI()
      const btn = el.querySelector('#nbc-copy-dec-btn') as HTMLButtonElement
      expect(btn).toBeTruthy()
      expect(btn.textContent).toContain('Decimal')
    })

    it('contains a copy hex button', () => {
      const el = createNumberBaseConverterUI()
      const btn = el.querySelector('#nbc-copy-hex-btn') as HTMLButtonElement
      expect(btn).toBeTruthy()
      expect(btn.textContent).toContain('Hex')
    })

    it('error element is hidden initially', () => {
      const el = createNumberBaseConverterUI()
      const err = el.querySelector('#nbc-error') as HTMLElement
      expect(err.hidden).toBe(true)
    })

    it('bit badge is hidden initially', () => {
      const el = createNumberBaseConverterUI()
      const badge = el.querySelector('#nbc-bit-badge') as HTMLElement
      expect(badge.hidden).toBe(true)
    })
  })

  describe('live conversion from decimal input', () => {
    it('typing decimal 255 fills binary, octal, and hex', () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const dec = el.querySelector<HTMLInputElement>('#nbc-decimal')!
      dec.value = '255'
      dec.dispatchEvent(new Event('input'))

      expect(el.querySelector<HTMLInputElement>('#nbc-binary')!.value).toBe('11111111')
      expect(el.querySelector<HTMLInputElement>('#nbc-octal')!.value).toBe('377')
      expect(el.querySelector<HTMLInputElement>('#nbc-hex')!.value).toBe('FF')
    })

    it('typing decimal 0 fills all fields with 0', () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const dec = el.querySelector<HTMLInputElement>('#nbc-decimal')!
      dec.value = '0'
      dec.dispatchEvent(new Event('input'))

      expect(el.querySelector<HTMLInputElement>('#nbc-binary')!.value).toBe('0')
      expect(el.querySelector<HTMLInputElement>('#nbc-octal')!.value).toBe('0')
      expect(el.querySelector<HTMLInputElement>('#nbc-hex')!.value).toBe('0')
    })

    it('shows bit badge after valid input', () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const dec = el.querySelector<HTMLInputElement>('#nbc-decimal')!
      dec.value = '42'
      dec.dispatchEvent(new Event('input'))

      const badge = el.querySelector<HTMLElement>('#nbc-bit-badge')!
      expect(badge.hidden).toBe(false)
      expect(badge.textContent).toContain('bit')
    })

    it('shows error for invalid decimal', () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const dec = el.querySelector<HTMLInputElement>('#nbc-decimal')!
      dec.value = '12abc'
      dec.dispatchEvent(new Event('input'))

      const err = el.querySelector<HTMLElement>('#nbc-error')!
      expect(err.hidden).toBe(false)
    })
  })

  describe('live conversion from binary input', () => {
    it('typing binary 1010 fills decimal 10 and hex A', () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const bin = el.querySelector<HTMLInputElement>('#nbc-binary')!
      bin.value = '1010'
      bin.dispatchEvent(new Event('input'))

      expect(el.querySelector<HTMLInputElement>('#nbc-decimal')!.value).toBe('10')
      expect(el.querySelector<HTMLInputElement>('#nbc-hex')!.value).toBe('A')
      expect(el.querySelector<HTMLInputElement>('#nbc-octal')!.value).toBe('12')
    })

    it('shows error for invalid binary', () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const bin = el.querySelector<HTMLInputElement>('#nbc-binary')!
      bin.value = '102'
      bin.dispatchEvent(new Event('input'))

      const err = el.querySelector<HTMLElement>('#nbc-error')!
      expect(err.hidden).toBe(false)
    })
  })

  describe('live conversion from hex input', () => {
    it('typing hex FF fills decimal 255', () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const hex = el.querySelector<HTMLInputElement>('#nbc-hex')!
      hex.value = 'FF'
      hex.dispatchEvent(new Event('input'))

      expect(el.querySelector<HTMLInputElement>('#nbc-decimal')!.value).toBe('255')
      expect(el.querySelector<HTMLInputElement>('#nbc-binary')!.value).toBe('11111111')
    })
  })

  describe('clear button', () => {
    it('clears all fields', () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const dec = el.querySelector<HTMLInputElement>('#nbc-decimal')!
      dec.value = '42'
      dec.dispatchEvent(new Event('input'))

      const clearBtn = el.querySelector<HTMLButtonElement>('#nbc-clear-btn')!
      clearBtn.click()

      for (const id of ['#nbc-binary', '#nbc-octal', '#nbc-decimal', '#nbc-hex']) {
        expect(el.querySelector<HTMLInputElement>(id)!.value).toBe('')
      }
      expect(el.querySelector<HTMLElement>('#nbc-bit-badge')!.hidden).toBe(true)
    })
  })

  describe('copy buttons', () => {
    it('copy decimal calls clipboard with decimal value', async () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const dec = el.querySelector<HTMLInputElement>('#nbc-decimal')!
      dec.value = '42'
      dec.dispatchEvent(new Event('input'))

      const copyDecBtn = el.querySelector<HTMLButtonElement>('#nbc-copy-dec-btn')!
      copyDecBtn.click()
      await new Promise(r => setTimeout(r, 0))

      expect(writeTextMock).toHaveBeenCalledWith('42')
    })

    it('copy hex calls clipboard with hex value', async () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const dec = el.querySelector<HTMLInputElement>('#nbc-decimal')!
      dec.value = '255'
      dec.dispatchEvent(new Event('input'))

      const copyHexBtn = el.querySelector<HTMLButtonElement>('#nbc-copy-hex-btn')!
      copyHexBtn.click()
      await new Promise(r => setTimeout(r, 0))

      expect(writeTextMock).toHaveBeenCalledWith('FF')
    })

    it('copy does nothing when field is empty', async () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const copyDecBtn = el.querySelector<HTMLButtonElement>('#nbc-copy-dec-btn')!
      copyDecBtn.click()
      await new Promise(r => setTimeout(r, 0))

      expect(writeTextMock).not.toHaveBeenCalled()
    })
  })

  describe('empty input clears other fields', () => {
    it('clearing decimal input clears other fields', () => {
      const el = createNumberBaseConverterUI()
      document.body.appendChild(el)

      const dec = el.querySelector<HTMLInputElement>('#nbc-decimal')!
      dec.value = '42'
      dec.dispatchEvent(new Event('input'))

      dec.value = ''
      dec.dispatchEvent(new Event('input'))

      expect(el.querySelector<HTMLInputElement>('#nbc-binary')!.value).toBe('')
      expect(el.querySelector<HTMLInputElement>('#nbc-hex')!.value).toBe('')
    })
  })
})
