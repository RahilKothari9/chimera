/**
 * JWT Decoder UI
 *
 * An interactive UI for decoding and inspecting JSON Web Tokens.
 */

import { decodeJwt, formatClaimValue, getClaimDescription } from './jwtDecoder'
import { trackActivity } from './activityFeed'

// Sample JWT for the placeholder (expired token, safe to ship as demo)
const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9' +
  '.4pcPyMD09olPSyXnrXCjTwXyr4BsezdI1AVTmud2fU4'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildClaimsTable(claims: Record<string, unknown>, label: string): string {
  const rows = Object.entries(claims)
    .map(([key, value]) => {
      const desc = getClaimDescription(key)
      const formatted = escapeHtml(formatClaimValue(key, value))
      const descCell = desc
        ? `<span class="jwt-claim-desc">${escapeHtml(desc)}</span>`
        : ''
      return `
        <tr class="jwt-claims-row">
          <td class="jwt-claims-td jwt-claims-key">
            <code class="jwt-claims-key-code">${escapeHtml(key)}</code>
            ${descCell}
          </td>
          <td class="jwt-claims-td jwt-claims-value">
            <code class="jwt-claims-value-code">${formatted}</code>
          </td>
        </tr>`
    })
    .join('')

  return `
    <div class="jwt-section-block">
      <h3 class="jwt-section-block-title">${escapeHtml(label)}</h3>
      <table class="jwt-claims-table" aria-label="${escapeHtml(label)} claims">
        <thead>
          <tr>
            <th class="jwt-claims-th" scope="col">Claim</th>
            <th class="jwt-claims-th" scope="col">Value</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

export function createJwtDecoderUI(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'jwt-decoder-dashboard'
  container.className = 'jwt-decoder-container card-section'

  container.innerHTML = `
    <h2 class="section-title">🔐 JWT Decoder</h2>
    <p class="section-description">
      Paste a JSON Web Token below to decode and inspect its header, payload, and claims.
      The signature is <strong>not</strong> verified — this tool is for inspection only.
    </p>

    <div class="jwt-input-row">
      <label class="jwt-label" for="jwt-input">JWT Token</label>
      <textarea
        id="jwt-input"
        class="jwt-textarea"
        rows="5"
        placeholder="Paste your JWT here… e.g. eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.signature"
        aria-label="JWT token input"
        spellcheck="false"
        autocomplete="off"
      ></textarea>
    </div>

    <div class="jwt-toolbar">
      <button id="jwt-decode-btn" class="jwt-btn jwt-btn-primary">🔍 Decode</button>
      <button id="jwt-sample-btn" class="jwt-btn">📋 Load Sample</button>
      <button id="jwt-clear-btn" class="jwt-btn">🗑 Clear</button>
    </div>

    <div id="jwt-error" class="jwt-error" aria-live="polite" role="alert" hidden></div>

    <div id="jwt-results" class="jwt-results" aria-live="polite" hidden>
      <div id="jwt-status-bar" class="jwt-status-bar"></div>
      <div id="jwt-parts" class="jwt-parts"></div>
      <div id="jwt-raw-section" class="jwt-raw-section">
        <h3 class="jwt-section-block-title">🔏 Encoded Parts</h3>
        <div class="jwt-encoded-parts">
          <div class="jwt-encoded-block">
            <span class="jwt-encoded-label jwt-encoded-header">Header</span>
            <code id="jwt-raw-header" class="jwt-raw-code jwt-raw-header-code"></code>
          </div>
          <span class="jwt-dot">.</span>
          <div class="jwt-encoded-block">
            <span class="jwt-encoded-label jwt-encoded-payload">Payload</span>
            <code id="jwt-raw-payload" class="jwt-raw-code jwt-raw-payload-code"></code>
          </div>
          <span class="jwt-dot">.</span>
          <div class="jwt-encoded-block">
            <span class="jwt-encoded-label jwt-encoded-signature">Signature</span>
            <code id="jwt-raw-signature" class="jwt-raw-code jwt-raw-signature-code"></code>
          </div>
        </div>
      </div>
    </div>
  `

  const inputTA = container.querySelector<HTMLTextAreaElement>('#jwt-input')!
  const decodeBtn = container.querySelector<HTMLButtonElement>('#jwt-decode-btn')!
  const sampleBtn = container.querySelector<HTMLButtonElement>('#jwt-sample-btn')!
  const clearBtn = container.querySelector<HTMLButtonElement>('#jwt-clear-btn')!
  const errorEl = container.querySelector<HTMLDivElement>('#jwt-error')!
  const resultsEl = container.querySelector<HTMLDivElement>('#jwt-results')!
  const statusBar = container.querySelector<HTMLDivElement>('#jwt-status-bar')!
  const partsEl = container.querySelector<HTMLDivElement>('#jwt-parts')!
  const rawHeaderEl = container.querySelector<HTMLElement>('#jwt-raw-header')!
  const rawPayloadEl = container.querySelector<HTMLElement>('#jwt-raw-payload')!
  const rawSignatureEl = container.querySelector<HTMLElement>('#jwt-raw-signature')!

  function showError(message: string) {
    errorEl.textContent = `⚠️ ${message}`
    errorEl.hidden = false
    resultsEl.hidden = true
  }

  function hideError() {
    errorEl.hidden = true
    errorEl.textContent = ''
  }

  function buildStatusBar(isExpired: boolean, expiresAt: Date | null, issuedAt: Date | null, alg: string | undefined): string {
    const badges: string[] = []

    if (alg) {
      badges.push(`<span class="jwt-badge jwt-badge-alg">🔑 ${escapeHtml(alg)}</span>`)
    }

    if (expiresAt) {
      if (isExpired) {
        badges.push(`<span class="jwt-badge jwt-badge-expired">❌ Expired ${escapeHtml(expiresAt.toLocaleString())}</span>`)
      } else {
        badges.push(`<span class="jwt-badge jwt-badge-valid">✅ Valid until ${escapeHtml(expiresAt.toLocaleString())}</span>`)
      }
    } else {
      badges.push(`<span class="jwt-badge jwt-badge-no-exp">⏳ No expiration</span>`)
    }

    if (issuedAt) {
      badges.push(`<span class="jwt-badge jwt-badge-iat">📅 Issued ${escapeHtml(issuedAt.toLocaleString())}</span>`)
    }

    return badges.join('')
  }

  function runDecode() {
    const token = inputTA.value.trim()
    if (!token) {
      showError('Please paste a JWT token to decode.')
      return
    }

    hideError()

    try {
      const decoded = decodeJwt(token)

      // Status bar
      statusBar.innerHTML = buildStatusBar(
        decoded.isExpired,
        decoded.expiresAt,
        decoded.issuedAt,
        decoded.header.alg,
      )

      // Claims tables
      partsEl.innerHTML =
        buildClaimsTable(decoded.header as Record<string, unknown>, '📋 Header') +
        buildClaimsTable(decoded.payload as Record<string, unknown>, '📦 Payload')

      // Raw encoded parts
      const parts = token.split('.')
      rawHeaderEl.textContent = parts[0]
      rawPayloadEl.textContent = parts[1]
      rawSignatureEl.textContent = parts[2]

      resultsEl.hidden = false

      const claimCount = Object.keys(decoded.payload).length
      trackActivity(
        'jwt_decode',
        'Decoded JWT token',
        `Decoded ${decoded.header.alg ?? 'unknown'} token with ${claimCount} payload claims`,
      )
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err))
    }
  }

  decodeBtn.addEventListener('click', runDecode)

  sampleBtn.addEventListener('click', () => {
    inputTA.value = SAMPLE_JWT
    runDecode()
    trackActivity('jwt_decode', 'Loaded sample JWT', 'Sample HS256 token loaded')
  })

  clearBtn.addEventListener('click', () => {
    inputTA.value = ''
    hideError()
    resultsEl.hidden = true
    partsEl.innerHTML = ''
    statusBar.innerHTML = ''
  })

  // Ctrl+Enter / Cmd+Enter triggers decode from the textarea
  inputTA.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      runDecode()
    }
  })

  return container
}
