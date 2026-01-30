/**
 * Shareable Links UI
 * UI component for sharing and managing shareable links
 */

import { generateShareableURL, copyURLToClipboard, type URLState } from './urlStateManager'

export interface ShareOption {
  label: string
  description: string
  state: URLState
}

/**
 * Create share button with copy-to-clipboard functionality
 */
export function createShareButton(container: HTMLElement): void {
  const button = document.createElement('button')
  button.className = 'share-button'
  button.innerHTML = `
    <svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
    <span class="share-text">Share</span>
  `
  button.title = 'Share this view'

  button.addEventListener('click', () => {
    openShareModal()
  })

  container.appendChild(button)
}

/**
 * Open share modal with options
 */
function openShareModal(): void {
  const modal = document.createElement('div')
  modal.className = 'share-modal'
  modal.innerHTML = `
    <div class="share-modal-content">
      <div class="share-modal-header">
        <h3>Share Chimera</h3>
        <button class="share-modal-close">&times;</button>
      </div>
      <div class="share-modal-body">
        <div class="share-current">
          <label>Current View URL</label>
          <div class="share-url-container">
            <input type="text" class="share-url-input" readonly />
            <button class="share-copy-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
          </div>
          <p class="share-hint">Share this URL to show the exact current view</p>
        </div>
        
        <div class="share-presets">
          <h4>Quick Share Options</h4>
          <div class="share-preset-list" id="share-preset-list"></div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Set current URL
  const currentURL = window.location.href
  const urlInput = modal.querySelector('.share-url-input') as HTMLInputElement
  urlInput.value = currentURL

  // Copy button
  const copyButton = modal.querySelector('.share-copy-button') as HTMLButtonElement
  copyButton.addEventListener('click', async () => {
    const success = await copyURLToClipboard(currentURL)
    if (success) {
      showCopyFeedback(copyButton, 'Copied!')
    } else {
      showCopyFeedback(copyButton, 'Failed', true)
    }
  })

  // Close button
  const closeButton = modal.querySelector('.share-modal-close') as HTMLButtonElement
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal)
  })

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal)
    }
  })

  // Add preset options
  addPresetOptions(modal)

  // Focus input for easy copying
  urlInput.select()
}

/**
 * Add preset share options to modal
 */
function addPresetOptions(modal: HTMLElement): void {
  const presets: ShareOption[] = [
    {
      label: 'Homepage',
      description: 'Clean Chimera homepage',
      state: {},
    },
    {
      label: 'Latest Evolution',
      description: 'Jump to the most recent evolution',
      state: { view: 'timeline', evolutionDay: 11 },
    },
    {
      label: 'Dark Theme',
      description: 'Chimera in dark mode',
      state: { theme: 'dark' },
    },
    {
      label: 'Search: Visualization',
      description: 'Filter by visualization features',
      state: { searchQuery: 'visualization', searchCategory: 'all' },
    },
    {
      label: 'Period Comparison',
      description: 'Compare last 7 vs previous 7 days',
      state: {
        view: 'comparison',
        comparisonMode: 'period',
        comparisonPeriod1: 'last7',
        comparisonPeriod2: 'prev7',
      },
    },
  ]

  const presetList = modal.querySelector('#share-preset-list') as HTMLElement

  presets.forEach((preset) => {
    const presetItem = document.createElement('div')
    presetItem.className = 'share-preset-item'
    
    const url = generateShareableURL(preset.state)
    
    presetItem.innerHTML = `
      <div class="share-preset-info">
        <strong>${preset.label}</strong>
        <p>${preset.description}</p>
      </div>
      <button class="share-preset-copy" data-url="${url}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy Link
      </button>
    `

    const copyBtn = presetItem.querySelector('.share-preset-copy') as HTMLButtonElement
    copyBtn.addEventListener('click', async () => {
      const success = await copyURLToClipboard(url)
      if (success) {
        showCopyFeedback(copyBtn, 'Copied!')
      } else {
        showCopyFeedback(copyBtn, 'Failed', true)
      }
    })

    presetList.appendChild(presetItem)
  })
}

/**
 * Show copy feedback on button
 */
function showCopyFeedback(button: HTMLButtonElement, message: string, isError = false): void {
  const originalHTML = button.innerHTML
  button.innerHTML = message
  button.classList.add(isError ? 'error' : 'success')
  button.disabled = true

  setTimeout(() => {
    button.innerHTML = originalHTML
    button.classList.remove('error', 'success')
    button.disabled = false
  }, 2000)
}

/**
 * Create floating share button in UI
 */
export function setupShareButton(): void {
  const container = document.createElement('div')
  container.className = 'share-button-container'
  document.body.appendChild(container)
  createShareButton(container)
}
