/**
 * Snippet Formatter - Formats evolution entries into various shareable formats
 */

import type { EvolutionEntry } from './changelogParser'

export type SnippetFormat = 'markdown' | 'plain' | 'json' | 'html'

export interface SnippetFormatterOptions {
  format: SnippetFormat
  includeMetadata?: boolean
}

/**
 * Format an evolution entry as Markdown
 */
export function formatAsMarkdown(entry: EvolutionEntry, includeMetadata = true): string {
  let snippet = `### ${entry.feature}\n\n`
  snippet += `**Date**: ${entry.date}\n\n`
  snippet += `${entry.description}\n`
  
  if (includeMetadata && entry.files.length > 0) {
    snippet += `\n**Files Modified**: ${entry.files.join(', ')}\n`
  }
  
  return snippet
}

/**
 * Format an evolution entry as plain text
 */
export function formatAsPlainText(entry: EvolutionEntry, includeMetadata = true): string {
  let snippet = `${entry.feature}\n`
  snippet += `Date: ${entry.date}\n\n`
  snippet += `${entry.description}\n`
  
  if (includeMetadata && entry.files.length > 0) {
    snippet += `\nFiles Modified: ${entry.files.join(', ')}\n`
  }
  
  return snippet
}

/**
 * Format an evolution entry as JSON
 */
export function formatAsJSON(entry: EvolutionEntry, includeMetadata = true): string {
  const data = {
    day: entry.day,
    date: entry.date,
    feature: entry.feature,
    description: entry.description,
    ...(includeMetadata && entry.files.length > 0 && { files: entry.files }),
  }
  
  return JSON.stringify(data, null, 2)
}

/**
 * Format an evolution entry as HTML
 */
export function formatAsHTML(entry: EvolutionEntry, includeMetadata = true): string {
  let snippet = `<div class="evolution-entry">\n`
  snippet += `  <h3>${escapeHTML(entry.feature)}</h3>\n`
  snippet += `  <p><strong>Date:</strong> ${escapeHTML(entry.date)}</p>\n`
  snippet += `  <p>${escapeHTML(entry.description)}</p>\n`
  
  if (includeMetadata && entry.files.length > 0) {
    snippet += `  <p><strong>Files Modified:</strong> ${escapeHTML(entry.files.join(', '))}</p>\n`
  }
  
  snippet += `</div>`
  
  return snippet
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Format an evolution entry based on the specified format
 */
export function formatSnippet(
  entry: EvolutionEntry,
  options: SnippetFormatterOptions
): string {
  const { format, includeMetadata = true } = options
  
  switch (format) {
    case 'markdown':
      return formatAsMarkdown(entry, includeMetadata)
    case 'plain':
      return formatAsPlainText(entry, includeMetadata)
    case 'json':
      return formatAsJSON(entry, includeMetadata)
    case 'html':
      return formatAsHTML(entry, includeMetadata)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

/**
 * Copy formatted snippet to clipboard
 */
export async function copySnippetToClipboard(
  entry: EvolutionEntry,
  options: SnippetFormatterOptions
): Promise<boolean> {
  try {
    const snippet = formatSnippet(entry, options)
    await navigator.clipboard.writeText(snippet)
    return true
  } catch (error) {
    console.error('Failed to copy snippet:', error)
    return false
  }
}

/**
 * Get a human-readable format name
 */
export function getFormatDisplayName(format: SnippetFormat): string {
  const names: Record<SnippetFormat, string> = {
    markdown: 'Markdown',
    plain: 'Plain Text',
    json: 'JSON',
    html: 'HTML',
  }
  return names[format]
}
