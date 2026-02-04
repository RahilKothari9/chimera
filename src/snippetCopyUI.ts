/**
 * Snippet Copy UI - Adds copy-to-clipboard functionality to timeline entries
 */

import type { EvolutionEntry } from './changelogParser'
import {
  copySnippetToClipboard,
  getFormatDisplayName,
  type SnippetFormat,
} from './snippetFormatter'
import { notificationManager } from './notificationSystem'

export interface SnippetCopyButtonOptions {
  entry: EvolutionEntry
  onCopySuccess?: () => void
  onCopyError?: () => void
}

/**
 * Create a copy snippet button with format dropdown
 */
export function createSnippetCopyButton(
  options: SnippetCopyButtonOptions
): HTMLElement {
  const { entry, onCopySuccess, onCopyError } = options

  const container = document.createElement('div')
  container.className = 'snippet-copy-container'

  // Create format selector
  const formatSelect = document.createElement('select')
  formatSelect.className = 'snippet-format-select'
  formatSelect.title = 'Select copy format'

  const formats: SnippetFormat[] = ['markdown', 'plain', 'json', 'html']
  formats.forEach((format) => {
    const option = document.createElement('option')
    option.value = format
    option.textContent = getFormatDisplayName(format)
    formatSelect.appendChild(option)
  })

  // Create copy button
  const copyButton = document.createElement('button')
  copyButton.className = 'snippet-copy-button'
  copyButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5.5 2.5h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="6.5" y="2.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    <span>Copy</span>
  `
  copyButton.title = 'Copy evolution snippet'

  // Handle copy action
  copyButton.addEventListener('click', async () => {
    const selectedFormat = formatSelect.value as SnippetFormat

    // Add loading state
    copyButton.disabled = true
    copyButton.classList.add('copying')

    const success = await copySnippetToClipboard(entry, {
      format: selectedFormat,
      includeMetadata: true,
    })

    // Remove loading state
    copyButton.disabled = false
    copyButton.classList.remove('copying')

    if (success) {
      // Show success feedback
      copyButton.classList.add('copied')
      setTimeout(() => {
        copyButton.classList.remove('copied')
      }, 2000)

      notificationManager.success(`Copied as ${getFormatDisplayName(selectedFormat)}`)

      onCopySuccess?.()
    } else {
      // Show error feedback
      notificationManager.error('Failed to copy snippet')

      onCopyError?.()
    }
  })

  container.appendChild(formatSelect)
  container.appendChild(copyButton)

  return container
}

/**
 * Add snippet copy functionality to a timeline entry element
 */
export function addSnippetCopyToTimelineEntry(
  entryElement: HTMLElement,
  entry: EvolutionEntry
): void {
  const copyButton = createSnippetCopyButton({ entry })
  
  // Find the best place to insert the button (after the date, before the feature title)
  const dateElement = entryElement.querySelector('.timeline-date')
  if (dateElement && dateElement.nextSibling) {
    entryElement.insertBefore(copyButton, dateElement.nextSibling)
  } else {
    // Fallback: add at the beginning
    entryElement.insertBefore(copyButton, entryElement.firstChild)
  }
}
