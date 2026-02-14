/**
 * QR Code Sharing UI
 * UI components for generating and sharing QR codes
 */

import { generateQRCodeDataURL, type ErrorCorrectionLevel } from './qrCodeGenerator'
import { notificationManager } from './notificationSystem'
import { trackActivity } from './activityFeed'

export interface ShareData {
  title: string
  url: string
  description?: string
}

/**
 * Creates a QR code modal for sharing content
 */
export function showQRCodeModal(data: ShareData): void {
  // Remove existing modal if any
  const existing = document.querySelector('.qr-modal')
  if (existing) {
    document.body.removeChild(existing)
  }

  const modal = document.createElement('div')
  modal.className = 'qr-modal'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-labelledby', 'qr-modal-title')
  modal.setAttribute('aria-modal', 'true')

  const backdrop = document.createElement('div')
  backdrop.className = 'qr-modal-backdrop'

  const container = document.createElement('div')
  container.className = 'qr-modal-container'

  // Header
  const header = document.createElement('div')
  header.className = 'qr-modal-header'

  const title = document.createElement('h3')
  title.id = 'qr-modal-title'
  title.textContent = '📱 Share via QR Code'
  header.appendChild(title)

  const closeBtn = document.createElement('button')
  closeBtn.className = 'qr-modal-close'
  closeBtn.innerHTML = '&times;'
  closeBtn.title = 'Close'
  closeBtn.setAttribute('aria-label', 'Close modal')
  closeBtn.addEventListener('click', () => closeModal(modal))
  header.appendChild(closeBtn)

  container.appendChild(header)

  // Content
  const content = document.createElement('div')
  content.className = 'qr-modal-content'

  // Share info
  const info = document.createElement('div')
  info.className = 'qr-share-info'

  const shareTitle = document.createElement('div')
  shareTitle.className = 'qr-share-title'
  shareTitle.textContent = data.title
  info.appendChild(shareTitle)

  if (data.description) {
    const shareDesc = document.createElement('div')
    shareDesc.className = 'qr-share-description'
    shareDesc.textContent = data.description
    info.appendChild(shareDesc)
  }

  content.appendChild(info)

  // QR Code container
  const qrContainer = document.createElement('div')
  qrContainer.className = 'qr-code-container'

  const qrImage = document.createElement('img')
  qrImage.className = 'qr-code-image'
  qrImage.alt = 'QR Code'
  qrImage.setAttribute('aria-label', `QR code for ${data.title}`)

  // Error correction level selector
  const ecLevelSelector = document.createElement('div')
  ecLevelSelector.className = 'qr-ec-selector'

  const ecLabel = document.createElement('label')
  ecLabel.textContent = 'Error Correction: '
  ecLabel.htmlFor = 'ec-level-select'

  const ecSelect = document.createElement('select')
  ecSelect.id = 'ec-level-select'
  ecSelect.className = 'qr-ec-select'

  const ecLevels: { value: ErrorCorrectionLevel; label: string; description: string }[] = [
    { value: 'L', label: 'Low (7%)', description: 'Smallest size' },
    { value: 'M', label: 'Medium (15%)', description: 'Balanced' },
    { value: 'Q', label: 'Quartile (25%)', description: 'More reliable' },
    { value: 'H', label: 'High (30%)', description: 'Most reliable' }
  ]

  ecLevels.forEach(level => {
    const option = document.createElement('option')
    option.value = level.value
    option.textContent = level.label
    option.title = level.description
    if (level.value === 'M') option.selected = true
    ecSelect.appendChild(option)
  })

  const generateQR = (level: ErrorCorrectionLevel) => {
    try {
      const dataURL = generateQRCodeDataURL(data.url, {
        errorCorrectionLevel: level,
        margin: 4,
        scale: 8
      })
      qrImage.src = dataURL
      
      trackActivity('qr_generate', 'Generated QR code', `Created QR for ${data.title}`, {
        title: data.title,
        ecLevel: level,
        dataLength: data.url.length
      })
    } catch (error) {
      notificationManager.error('Failed to generate QR code')
      console.error('QR generation error:', error)
    }
  }

  ecSelect.addEventListener('change', () => {
    generateQR(ecSelect.value as ErrorCorrectionLevel)
  })

  ecLabel.appendChild(ecSelect)
  ecLevelSelector.appendChild(ecLabel)

  // Generate initial QR code
  generateQR('M')

  qrContainer.appendChild(qrImage)
  qrContainer.appendChild(ecLevelSelector)
  content.appendChild(qrContainer)

  // URL display
  const urlDisplay = document.createElement('div')
  urlDisplay.className = 'qr-url-display'

  const urlLabel = document.createElement('div')
  urlLabel.className = 'qr-url-label'
  urlLabel.textContent = 'URL:'

  const urlText = document.createElement('input')
  urlText.type = 'text'
  urlText.className = 'qr-url-text'
  urlText.value = data.url
  urlText.readOnly = true

  urlDisplay.appendChild(urlLabel)
  urlDisplay.appendChild(urlText)
  content.appendChild(urlDisplay)

  // Actions
  const actions = document.createElement('div')
  actions.className = 'qr-modal-actions'

  // Copy URL button
  const copyUrlBtn = document.createElement('button')
  copyUrlBtn.className = 'qr-action-btn qr-copy-btn'
  copyUrlBtn.innerHTML = '📋 Copy URL'
  copyUrlBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(data.url)
      notificationManager.success('URL copied to clipboard')
      trackActivity('qr_copy_url', 'Copied URL', `Copied URL for ${data.title}`, { title: data.title })
    } catch {
      notificationManager.error('Failed to copy URL')
    }
  })

  // Download QR button
  const downloadBtn = document.createElement('button')
  downloadBtn.className = 'qr-action-btn qr-download-btn'
  downloadBtn.innerHTML = '⬇️ Download QR'
  downloadBtn.addEventListener('click', () => {
    try {
      const link = document.createElement('a')
      link.href = qrImage.src
      link.download = `qr-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.svg`
      link.click()
      
      notificationManager.success('QR code downloaded')
      trackActivity('qr_download', 'Downloaded QR code', `Downloaded QR for ${data.title}`, { title: data.title })
    } catch {
      notificationManager.error('Failed to download QR code')
    }
  })

  // Print QR button
  const printBtn = document.createElement('button')
  printBtn.className = 'qr-action-btn qr-print-btn'
  printBtn.innerHTML = '🖨️ Print'
  printBtn.addEventListener('click', () => {
    const printWindow = window.open('', '', 'width=600,height=600')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${escapeHtml(data.title)}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              }
              h2 { margin: 0 0 10px 0; }
              p { margin: 0 0 20px 0; color: #666; }
              img { max-width: 400px; border: 2px solid #333; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h2>${escapeHtml(data.title)}</h2>
            ${data.description ? `<p>${escapeHtml(data.description)}</p>` : ''}
            <img src="${qrImage.src}" alt="QR Code">
            <p>${escapeHtml(data.url)}</p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
      
      trackActivity('qr_print', 'Printed QR code', `Printed QR for ${data.title}`, { title: data.title })
    }
  })

  actions.appendChild(copyUrlBtn)
  actions.appendChild(downloadBtn)
  actions.appendChild(printBtn)
  content.appendChild(actions)

  // Instructions
  const instructions = document.createElement('div')
  instructions.className = 'qr-instructions'
  instructions.innerHTML = `
    <div class="qr-instruction-title">📱 How to use:</div>
    <ul>
      <li>Open your phone's camera app</li>
      <li>Point at the QR code</li>
      <li>Tap the notification to open the link</li>
    </ul>
  `
  content.appendChild(instructions)

  container.appendChild(content)
  modal.appendChild(backdrop)
  modal.appendChild(container)
  document.body.appendChild(modal)

  // Event listeners
  backdrop.addEventListener('click', () => closeModal(modal))

  // Keyboard support
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal(modal)
    }
  }
  document.addEventListener('keydown', handleKeyDown)
  
  // Store the handler for cleanup
  ;(modal as any)._keyHandler = handleKeyDown

  // Focus management
  closeBtn.focus()

  trackActivity('qr_modal_open', 'Opened QR modal', `Viewing QR for ${data.title}`, { title: data.title })
}

/**
 * Closes the QR code modal
 */
function closeModal(modal: HTMLElement): void {
  // Remove keyboard handler if it exists
  const handler = (modal as any)._keyHandler
  if (handler) {
    document.removeEventListener('keydown', handler)
    delete (modal as any)._keyHandler
  }
  document.body.removeChild(modal)
}

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Creates a share button with QR code option
 */
export function createQRShareButton(container: HTMLElement, data: ShareData): void {
  const button = document.createElement('button')
  button.className = 'qr-share-button'
  button.innerHTML = '📱 Share QR'
  button.title = 'Share via QR code'
  button.setAttribute('aria-label', `Share ${data.title} via QR code`)

  button.addEventListener('click', () => {
    showQRCodeModal(data)
  })

  container.appendChild(button)
}

/**
 * Creates a QR code preview (small inline QR code)
 */
export function createQRPreview(url: string, size: number = 128): HTMLImageElement {
  const img = document.createElement('img')
  img.className = 'qr-preview'
  img.alt = 'QR Code Preview'
  img.width = size
  img.height = size

  try {
    const dataURL = generateQRCodeDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 4
    })
    img.src = dataURL
  } catch (error) {
    console.error('Failed to generate QR preview:', error)
  }

  return img
}

/**
 * Generates multiple QR codes with different error correction levels
 */
export function generateQRCodeSet(url: string): Record<ErrorCorrectionLevel, string> {
  const levels: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']
  const set: Partial<Record<ErrorCorrectionLevel, string>> = {}

  levels.forEach(level => {
    try {
      set[level] = generateQRCodeDataURL(url, {
        errorCorrectionLevel: level,
        margin: 4,
        scale: 8
      })
    } catch (error) {
      console.error(`Failed to generate QR code with level ${level}:`, error)
      // Set a fallback empty QR code
      set[level] = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmZmIi8+PC9zdmc+'
    }
  })

  return set as Record<ErrorCorrectionLevel, string>
}
