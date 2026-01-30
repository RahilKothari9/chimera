/**
 * URL State Manager
 * Manages application state through URL parameters for shareable links
 */

export interface URLState {
  searchQuery?: string
  searchCategory?: string
  theme?: 'light' | 'dark' | 'auto'
  view?: string
  evolutionDay?: number
  comparisonMode?: string
  comparisonPeriod1?: string
  comparisonPeriod2?: string
}

/**
 * Get current state from URL parameters
 */
export function getStateFromURL(): URLState {
  const params = new URLSearchParams(window.location.search)
  const state: URLState = {}

  if (params.has('q')) state.searchQuery = params.get('q')!
  if (params.has('cat')) state.searchCategory = params.get('cat')!
  if (params.has('theme')) state.theme = params.get('theme') as URLState['theme']
  if (params.has('view')) state.view = params.get('view')!
  if (params.has('day')) state.evolutionDay = parseInt(params.get('day')!, 10)
  if (params.has('cmp')) state.comparisonMode = params.get('cmp')!
  if (params.has('p1')) state.comparisonPeriod1 = params.get('p1')!
  if (params.has('p2')) state.comparisonPeriod2 = params.get('p2')!

  return state
}

/**
 * Update URL with new state without page reload
 */
export function updateURLState(state: URLState): void {
  const params = new URLSearchParams(window.location.search)

  // Update or remove parameters
  Object.entries(state).forEach(([key, value]) => {
    const paramKey = getParamKey(key)
    if (value !== undefined && value !== null && value !== '') {
      params.set(paramKey, String(value))
    } else {
      params.delete(paramKey)
    }
  })

  // Update URL without reload
  const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
  window.history.replaceState({}, '', newURL)
}

/**
 * Generate shareable URL from current state
 */
export function generateShareableURL(state: URLState): string {
  const params = new URLSearchParams()

  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const paramKey = getParamKey(key)
      params.set(paramKey, String(value))
    }
  })

  const baseURL = window.location.origin + window.location.pathname
  return params.toString() ? `${baseURL}?${params.toString()}` : baseURL
}

/**
 * Map state keys to short URL parameter names
 */
function getParamKey(stateKey: string): string {
  const keyMap: Record<string, string> = {
    searchQuery: 'q',
    searchCategory: 'cat',
    theme: 'theme',
    view: 'view',
    evolutionDay: 'day',
    comparisonMode: 'cmp',
    comparisonPeriod1: 'p1',
    comparisonPeriod2: 'p2',
  }
  return keyMap[stateKey] || stateKey
}

/**
 * Clear all URL parameters
 */
export function clearURLState(): void {
  window.history.replaceState({}, '', window.location.pathname)
}

/**
 * Copy URL to clipboard
 */
export async function copyURLToClipboard(url: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
      return true
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    }
  } catch (error) {
    console.error('Failed to copy URL:', error)
    return false
  }
}

/**
 * Create a shareable link with descriptive parameters
 */
export function createDescriptiveShare(description: string, state: URLState): { url: string; description: string } {
  return {
    url: generateShareableURL(state),
    description,
  }
}
