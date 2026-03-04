import { convertBase, getBitLength, type NumberBase } from './numberBaseConverter'
import { trackActivity } from './activityFeed'

const BASE_INFO: { base: NumberBase; label: string; id: string; placeholder: string }[] = [
  { base: 2,  label: 'Binary (Base 2)',       id: 'nbc-binary',  placeholder: 'e.g. 1010' },
  { base: 8,  label: 'Octal (Base 8)',         id: 'nbc-octal',   placeholder: 'e.g. 12' },
  { base: 10, label: 'Decimal (Base 10)',       id: 'nbc-decimal', placeholder: 'e.g. 42' },
  { base: 16, label: 'Hex (Base 16)',          id: 'nbc-hex',     placeholder: 'e.g. 2A' },
]

export function createNumberBaseConverterUI(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'number-base-converter-dashboard'
  container.className = 'nbc-container card-section'

  container.innerHTML = `
    <h2 class="section-title">🔢 Number Base Converter</h2>
    <p class="section-description">
      Instantly convert integers between binary, octal, decimal, and hexadecimal.
      Type in any field to update all others.
    </p>

    <div class="nbc-grid">
      ${BASE_INFO.map(({ label, id, placeholder }) => `
        <div class="nbc-field">
          <label class="nbc-label" for="${id}">${label}</label>
          <input
            id="${id}"
            class="nbc-input"
            type="text"
            placeholder="${placeholder}"
            autocomplete="off"
            spellcheck="false"
            aria-label="${label}"
          />
        </div>
      `).join('')}
    </div>

    <div id="nbc-bit-badge" class="nbc-bit-badge" aria-live="polite" hidden></div>
    <div id="nbc-error" class="nbc-error" aria-live="polite" role="alert" hidden></div>

    <div class="nbc-toolbar">
      <button id="nbc-clear-btn" class="nbc-btn">🗑 Clear</button>
      <button id="nbc-copy-dec-btn" class="nbc-btn">📋 Copy Decimal</button>
      <button id="nbc-copy-hex-btn" class="nbc-btn">📋 Copy Hex</button>
    </div>
  `

  const inputs = new Map<NumberBase, HTMLInputElement>()
  for (const { base, id } of BASE_INFO) {
    const el = container.querySelector<HTMLInputElement>(`#${id}`)!
    inputs.set(base, el)
  }

  const bitBadge = container.querySelector<HTMLDivElement>('#nbc-bit-badge')!
  const errorEl  = container.querySelector<HTMLDivElement>('#nbc-error')!
  const clearBtn    = container.querySelector<HTMLButtonElement>('#nbc-clear-btn')!
  const copyDecBtn  = container.querySelector<HTMLButtonElement>('#nbc-copy-dec-btn')!
  const copyHexBtn  = container.querySelector<HTMLButtonElement>('#nbc-copy-hex-btn')!

  function showError(msg: string) {
    errorEl.hidden = false
    errorEl.textContent = msg
    bitBadge.hidden = true
  }

  function clearError() {
    errorEl.hidden = true
    errorEl.textContent = ''
  }

  function updateFromBase(sourceBase: NumberBase) {
    const sourceInput = inputs.get(sourceBase)!
    const raw = sourceInput.value.trim()

    if (raw === '' || raw === '-') {
      // Clear all other fields, hide badge
      for (const { base } of BASE_INFO) {
        if (base !== sourceBase) {
          inputs.get(base)!.value = ''
        }
      }
      bitBadge.hidden = true
      clearError()
      return
    }

    const result = convertBase(raw, sourceBase)

    if (!result.success) {
      showError(`⚠️ ${result.error}`)
      return
    }

    clearError()

    const { binary, octal, decimal, hex } = result.representations

    const valueMap: Record<NumberBase, string> = { 2: binary, 8: octal, 10: decimal, 16: hex }
    for (const { base } of BASE_INFO) {
      if (base !== sourceBase) {
        inputs.get(base)!.value = valueMap[base]
      }
    }

    const bits = getBitLength(result.value)
    bitBadge.hidden = false
    bitBadge.textContent = bits !== null
      ? `Fits in ${bits}-bit signed integer`
      : 'Exceeds 64-bit signed range'

    trackActivity('number_base', 'Converted number base', `${decimal} (dec) = ${hex} (hex) = ${binary} (bin)`)
  }

  for (const { base } of BASE_INFO) {
    const input = inputs.get(base)!
    input.addEventListener('input', () => updateFromBase(base))
  }

  clearBtn.addEventListener('click', () => {
    for (const { base } of BASE_INFO) {
      inputs.get(base)!.value = ''
    }
    bitBadge.hidden = true
    clearError()
  })

  function copyText(text: string, btn: HTMLButtonElement, original: string) {
    if (!text) return
    if (!navigator.clipboard) {
      btn.textContent = '❌ Not supported'
      setTimeout(() => { btn.textContent = original }, 2000)
      return
    }
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✅ Copied!'
      setTimeout(() => { btn.textContent = original }, 2000)
    }).catch(() => {
      btn.textContent = '❌ Failed'
      setTimeout(() => { btn.textContent = original }, 2000)
    })
  }

  copyDecBtn.addEventListener('click', () => {
    copyText(inputs.get(10)!.value, copyDecBtn, '📋 Copy Decimal')
  })

  copyHexBtn.addEventListener('click', () => {
    copyText(inputs.get(16)!.value, copyHexBtn, '📋 Copy Hex')
  })

  return container
}
