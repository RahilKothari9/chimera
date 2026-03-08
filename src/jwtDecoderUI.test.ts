import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createJwtDecoderUI } from './jwtDecoderUI'

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

// The canonical jwt.io example JWT
const EXAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('JWT Decoder UI', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  // ─── createJwtDecoderUI structure ──────────────────────────────────────────

  describe('createJwtDecoderUI structure', () => {
    it('returns an HTMLElement with id jwt-decoder-dashboard', () => {
      const el = createJwtDecoderUI()
      expect(el.id).toBe('jwt-decoder-dashboard')
    })

    it('contains a textarea with id jwt-input', () => {
      const el = createJwtDecoderUI()
      expect(el.querySelector('#jwt-input')).toBeTruthy()
    })

    it('contains a Decode button', () => {
      const el = createJwtDecoderUI()
      const btn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')
      expect(btn).toBeTruthy()
      expect(btn!.textContent).toContain('Decode')
    })

    it('contains a Load Sample button', () => {
      const el = createJwtDecoderUI()
      expect(el.querySelector('#jwt-sample-btn')).toBeTruthy()
    })

    it('contains a Clear button', () => {
      const el = createJwtDecoderUI()
      expect(el.querySelector('#jwt-clear-btn')).toBeTruthy()
    })

    it('has the error element hidden initially', () => {
      const el = createJwtDecoderUI()
      const errEl = el.querySelector<HTMLDivElement>('#jwt-error')!
      expect(errEl.hidden).toBe(true)
    })

    it('has the results panel hidden initially', () => {
      const el = createJwtDecoderUI()
      const results = el.querySelector<HTMLDivElement>('#jwt-results')!
      expect(results.hidden).toBe(true)
    })
  })

  // ─── Decode button ──────────────────────────────────────────────────────────

  describe('Decode button', () => {
    it('shows an error when textarea is empty', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const errEl = el.querySelector<HTMLDivElement>('#jwt-error')!

      decodeBtn.click()

      expect(errEl.hidden).toBe(false)
      expect(errEl.textContent).toContain('Please paste')
    })

    it('shows an error for a token with wrong number of parts', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const errEl = el.querySelector<HTMLDivElement>('#jwt-error')!

      input.value = 'onlytwoparts.here'
      decodeBtn.click()

      expect(errEl.hidden).toBe(false)
      expect(errEl.textContent).toContain('⚠️')
    })

    it('shows results for a valid JWT', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const results = el.querySelector<HTMLDivElement>('#jwt-results')!

      input.value = EXAMPLE_JWT
      decodeBtn.click()

      expect(results.hidden).toBe(false)
    })

    it('hides the error panel after a successful decode', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const errEl = el.querySelector<HTMLDivElement>('#jwt-error')!

      // First trigger an error
      input.value = 'bad.token'
      decodeBtn.click()
      expect(errEl.hidden).toBe(false)

      // Then a good decode clears it
      input.value = EXAMPLE_JWT
      decodeBtn.click()
      expect(errEl.hidden).toBe(true)
    })

    it('renders header claims in the output', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!

      input.value = EXAMPLE_JWT
      decodeBtn.click()

      expect(el.textContent).toContain('HS256')
    })

    it('renders payload claims in the output', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!

      input.value = EXAMPLE_JWT
      decodeBtn.click()

      expect(el.textContent).toContain('1234567890')
      expect(el.textContent).toContain('John Doe')
    })

    it('shows the raw encoded header part', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const rawHeader = el.querySelector<HTMLElement>('#jwt-raw-header')!

      input.value = EXAMPLE_JWT
      decodeBtn.click()

      expect(rawHeader.textContent).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
    })

    it('shows the raw encoded signature part', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const rawSig = el.querySelector<HTMLElement>('#jwt-raw-signature')!

      input.value = EXAMPLE_JWT
      decodeBtn.click()

      expect(rawSig.textContent).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
    })

    it('shows an expiry badge for an expired token', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const statusBar = el.querySelector<HTMLDivElement>('#jwt-status-bar')!

      // Construct a token that expired in the past
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '')
      const payload = btoa(JSON.stringify({ sub: 'u1', exp: 1 })).replace(/=/g, '')
      input.value = `${header}.${payload}.sig`
      decodeBtn.click()

      expect(statusBar.textContent).toContain('Expired')
    })

    it('shows a valid badge for a non-expired token', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const statusBar = el.querySelector<HTMLDivElement>('#jwt-status-bar')!

      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const header = btoa(JSON.stringify({ alg: 'HS256' })).replace(/=/g, '')
      const payload = btoa(JSON.stringify({ sub: 'u1', exp: futureExp })).replace(/=/g, '')
      input.value = `${header}.${payload}.sig`
      decodeBtn.click()

      expect(statusBar.textContent).toContain('Valid')
    })

    it('shows "No expiration" badge when exp is absent', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const statusBar = el.querySelector<HTMLDivElement>('#jwt-status-bar')!

      const header = btoa(JSON.stringify({ alg: 'HS256' })).replace(/=/g, '')
      const payload = btoa(JSON.stringify({ sub: 'u1' })).replace(/=/g, '')
      input.value = `${header}.${payload}.sig`
      decodeBtn.click()

      expect(statusBar.textContent).toContain('No expiration')
    })

    it('shows the algorithm badge in the status bar', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const statusBar = el.querySelector<HTMLDivElement>('#jwt-status-bar')!

      input.value = EXAMPLE_JWT
      decodeBtn.click()

      expect(statusBar.textContent).toContain('HS256')
    })
  })

  // ─── Load Sample button ─────────────────────────────────────────────────────

  describe('Load Sample button', () => {
    it('populates the textarea with a JWT on click', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const sampleBtn = el.querySelector<HTMLButtonElement>('#jwt-sample-btn')!

      sampleBtn.click()

      expect(input.value.length).toBeGreaterThan(20)
      expect(input.value.split('.').length).toBe(3)
    })

    it('shows decoded results after clicking Load Sample', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const sampleBtn = el.querySelector<HTMLButtonElement>('#jwt-sample-btn')!
      const results = el.querySelector<HTMLDivElement>('#jwt-results')!

      sampleBtn.click()

      expect(results.hidden).toBe(false)
    })
  })

  // ─── Clear button ───────────────────────────────────────────────────────────

  describe('Clear button', () => {
    it('empties the textarea', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const clearBtn = el.querySelector<HTMLButtonElement>('#jwt-clear-btn')!

      input.value = EXAMPLE_JWT
      decodeBtn.click()
      clearBtn.click()

      expect(input.value).toBe('')
    })

    it('hides the results panel', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const clearBtn = el.querySelector<HTMLButtonElement>('#jwt-clear-btn')!
      const results = el.querySelector<HTMLDivElement>('#jwt-results')!

      input.value = EXAMPLE_JWT
      decodeBtn.click()
      clearBtn.click()

      expect(results.hidden).toBe(true)
    })

    it('hides any error panel', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const decodeBtn = el.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
      const clearBtn = el.querySelector<HTMLButtonElement>('#jwt-clear-btn')!
      const errEl = el.querySelector<HTMLDivElement>('#jwt-error')!

      input.value = 'bad.token'
      decodeBtn.click()
      expect(errEl.hidden).toBe(false)

      clearBtn.click()
      expect(errEl.hidden).toBe(true)
    })
  })

  // ─── Keyboard shortcut ──────────────────────────────────────────────────────

  describe('Keyboard shortcut', () => {
    it('triggers decode on Ctrl+Enter in the textarea', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const results = el.querySelector<HTMLDivElement>('#jwt-results')!

      input.value = EXAMPLE_JWT
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }),
      )

      expect(results.hidden).toBe(false)
    })

    it('triggers decode on Meta+Enter in the textarea', () => {
      const el = createJwtDecoderUI()
      document.body.appendChild(el)
      const input = el.querySelector<HTMLTextAreaElement>('#jwt-input')!
      const results = el.querySelector<HTMLDivElement>('#jwt-results')!

      input.value = EXAMPLE_JWT
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }),
      )

      expect(results.hidden).toBe(false)
    })
  })
})
