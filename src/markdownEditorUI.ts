/**
 * Markdown Editor UI
 * Live split-view Markdown editor with preview, toolbar, stats, and templates.
 */

import { renderMarkdown, getMarkdownStats, insertSnippet, MARKDOWN_TEMPLATES } from './markdownEditor'
import { trackActivity } from './activityFeed'

const INITIAL_CONTENT = `# Welcome to the Markdown Editor

Start typing here to see a **live preview** on the right.

## Features

- *Real-time* rendering as you type
- Toolbar shortcuts for common formatting
- Word / character / heading counts
- Three starter templates to get going fast

## Quick example

> Blockquotes, tables, and fenced code blocks are all supported.

| Feature | Supported |
|---------|-----------|
| Headings | ✅ |
| Bold / Italic | ✅ |
| Code blocks | ✅ |
| Tables | ✅ |
| Links | ✅ |

\`\`\`typescript
const greet = (name: string) => \`Hello, \${name}!\`
console.log(greet('Chimera'))
\`\`\`

---

_Happy writing!_
`

export function setupMarkdownEditor(container: HTMLElement): void {
  const section = buildUI()
  container.innerHTML = ''
  container.appendChild(section)
  wireEvents(section)
  trackActivity('page_view', 'Loaded Markdown editor', 'Live Markdown editor initialized')
}

// ─── Build ────────────────────────────────────────────────────────────────────

function buildUI(): HTMLElement {
  const section = document.createElement('div')
  section.className = 'markdown-editor-section'

  section.innerHTML = `
    <h2 class="section-title">📝 Markdown Editor</h2>
    <p class="markdown-editor-subtitle">Write Markdown on the left, see the rendered preview on the right.</p>

    <div class="markdown-toolbar" role="toolbar" aria-label="Markdown formatting">
      <button class="md-toolbar-btn" data-action="bold" title="Bold (Ctrl+B)"><strong>B</strong></button>
      <button class="md-toolbar-btn" data-action="italic" title="Italic (Ctrl+I)"><em>I</em></button>
      <button class="md-toolbar-btn" data-action="strikethrough" title="Strikethrough"><del>S</del></button>
      <span class="md-toolbar-sep"></span>
      <button class="md-toolbar-btn" data-action="h1" title="Heading 1">H1</button>
      <button class="md-toolbar-btn" data-action="h2" title="Heading 2">H2</button>
      <button class="md-toolbar-btn" data-action="h3" title="Heading 3">H3</button>
      <span class="md-toolbar-sep"></span>
      <button class="md-toolbar-btn" data-action="code" title="Inline code">&lt;/&gt;</button>
      <button class="md-toolbar-btn" data-action="codeblock" title="Code block">⌥ block</button>
      <button class="md-toolbar-btn" data-action="quote" title="Blockquote">❝</button>
      <span class="md-toolbar-sep"></span>
      <button class="md-toolbar-btn" data-action="ul" title="Unordered list">• list</button>
      <button class="md-toolbar-btn" data-action="ol" title="Ordered list">1. list</button>
      <button class="md-toolbar-btn" data-action="link" title="Link">🔗</button>
      <button class="md-toolbar-btn" data-action="hr" title="Horizontal rule">─</button>
      <span class="md-toolbar-sep"></span>
      <select class="md-template-select" aria-label="Load template" title="Load a starter template">
        <option value="">Templates…</option>
        ${MARKDOWN_TEMPLATES.map(t => `<option value="${escapeAttr(t.name)}">${escapeAttr(t.name)}</option>`).join('')}
      </select>
    </div>

    <div class="markdown-panes">
      <div class="markdown-pane markdown-input-pane">
        <div class="markdown-pane-header">
          <span>Editor</span>
          <button class="md-copy-btn" id="md-copy-source" title="Copy Markdown source">Copy MD</button>
        </div>
        <textarea
          id="md-editor-textarea"
          class="markdown-textarea"
          spellcheck="true"
          aria-label="Markdown input"
          placeholder="Type your Markdown here…"
        ></textarea>
      </div>

      <div class="markdown-pane markdown-preview-pane">
        <div class="markdown-pane-header">
          <span>Preview</span>
          <button class="md-copy-btn" id="md-copy-html" title="Copy rendered HTML">Copy HTML</button>
        </div>
        <div id="md-preview" class="markdown-preview" aria-live="polite" aria-label="Rendered preview"></div>
      </div>
    </div>

    <div class="markdown-stats" id="md-stats" aria-label="Document statistics">
      <span class="md-stat"><span class="md-stat-value" id="md-stat-words">0</span> words</span>
      <span class="md-stat"><span class="md-stat-value" id="md-stat-chars">0</span> chars</span>
      <span class="md-stat"><span class="md-stat-value" id="md-stat-lines">0</span> lines</span>
      <span class="md-stat"><span class="md-stat-value" id="md-stat-headings">0</span> headings</span>
      <span class="md-stat"><span class="md-stat-value" id="md-stat-codeblocks">0</span> code blocks</span>
      <span class="md-stat"><span class="md-stat-value" id="md-stat-links">0</span> links</span>
    </div>
  `

  return section
}

// ─── Events ───────────────────────────────────────────────────────────────────

function wireEvents(section: HTMLElement): void {
  const textarea = section.querySelector<HTMLTextAreaElement>('#md-editor-textarea')!
  const preview = section.querySelector<HTMLDivElement>('#md-preview')!

  // Set initial content
  textarea.value = INITIAL_CONTENT
  updatePreview(textarea, preview, section)

  // Live preview on input
  textarea.addEventListener('input', () => {
    updatePreview(textarea, preview, section)
  })

  // Toolbar buttons
  section.querySelectorAll<HTMLButtonElement>('.md-toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action
      if (!action) return
      applyToolbarAction(textarea, action)
      updatePreview(textarea, preview, section)
    })
  })

  // Keyboard shortcuts inside the textarea
  textarea.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      applyToolbarAction(textarea, 'bold')
      updatePreview(textarea, preview, section)
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault()
      applyToolbarAction(textarea, 'italic')
      updatePreview(textarea, preview, section)
    } else if (e.key === 'Tab') {
      // Insert two spaces instead of changing focus
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      textarea.value = textarea.value.slice(0, start) + '  ' + textarea.value.slice(end)
      textarea.selectionStart = textarea.selectionEnd = start + 2
    }
  })

  // Template selector
  const templateSelect = section.querySelector<HTMLSelectElement>('.md-template-select')!
  templateSelect.addEventListener('change', () => {
    const name = templateSelect.value
    if (!name) return
    const tpl = MARKDOWN_TEMPLATES.find(t => t.name === name)
    if (tpl) {
      textarea.value = tpl.content
      updatePreview(textarea, preview, section)
      trackActivity('template_use', `Loaded "${name}" template`, 'Markdown editor template loaded')
    }
    templateSelect.value = ''
  })

  // Copy Markdown source
  section.querySelector('#md-copy-source')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textarea.value)
      showCopyFeedback(section.querySelector('#md-copy-source')!, 'Copied!')
    } catch {
      // fallback: silently ignore
    }
  })

  // Copy rendered HTML
  section.querySelector('#md-copy-html')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(preview.innerHTML)
      showCopyFeedback(section.querySelector('#md-copy-html')!, 'Copied!')
    } catch {
      // fallback: silently ignore
    }
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function updatePreview(
  textarea: HTMLTextAreaElement,
  preview: HTMLDivElement,
  section: HTMLElement,
): void {
  const md = textarea.value
  preview.innerHTML = renderMarkdown(md)
  updateStats(md, section)
}

function updateStats(md: string, section: HTMLElement): void {
  const stats = getMarkdownStats(md)
  const set = (id: string, value: number) => {
    const el = section.querySelector<HTMLElement>(`#${id}`)
    if (el) el.textContent = String(value)
  }
  set('md-stat-words', stats.wordCount)
  set('md-stat-chars', stats.charCount)
  set('md-stat-lines', stats.lineCount)
  set('md-stat-headings', stats.headingCount)
  set('md-stat-codeblocks', stats.codeBlockCount)
  set('md-stat-links', stats.linkCount)
}

type ToolbarAction =
  | 'bold' | 'italic' | 'strikethrough'
  | 'h1' | 'h2' | 'h3'
  | 'code' | 'codeblock' | 'quote'
  | 'ul' | 'ol' | 'link' | 'hr'

function applyToolbarAction(textarea: HTMLTextAreaElement, action: ToolbarAction | string): void {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  const wrap = (before: string, after: string, placeholder: string) => {
    const result = insertSnippet(textarea.value, start, end, before, after, placeholder)
    textarea.value = result.text
    textarea.selectionStart = result.selectionStart
    textarea.selectionEnd = result.selectionEnd
    textarea.focus()
  }

  const prefix = (linePrefix: string, placeholder: string) => {
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1
    const result = insertSnippet(textarea.value, lineStart, lineStart, linePrefix, '', placeholder)
    textarea.value = result.text
    textarea.selectionStart = lineStart + linePrefix.length
    textarea.selectionEnd = lineStart + linePrefix.length + (end - start === 0 ? placeholder.length : end - start)
    textarea.focus()
  }

  switch (action) {
    case 'bold':        return wrap('**', '**', 'bold text')
    case 'italic':      return wrap('*', '*', 'italic text')
    case 'strikethrough': return wrap('~~', '~~', 'strikethrough text')
    case 'code':        return wrap('`', '`', 'code')
    case 'link':        return wrap('[', '](url)', 'link text')
    case 'h1':          return prefix('# ', 'Heading 1')
    case 'h2':          return prefix('## ', 'Heading 2')
    case 'h3':          return prefix('### ', 'Heading 3')
    case 'ul':          return prefix('- ', 'list item')
    case 'ol':          return prefix('1. ', 'list item')
    case 'quote':       return prefix('> ', 'quote')
    case 'hr': {
      const nl = start > 0 && textarea.value[start - 1] !== '\n' ? '\n' : ''
      wrap(nl + '\n---\n\n', '', '')
      break
    }
    case 'codeblock': {
      const nl = start > 0 && textarea.value[start - 1] !== '\n' ? '\n' : ''
      wrap(nl + '```\n', '\n```\n', 'code here')
      break
    }
  }
}

function showCopyFeedback(btn: HTMLElement, msg: string): void {
  const original = btn.textContent || ''
  btn.textContent = msg
  btn.setAttribute('disabled', 'true')
  setTimeout(() => {
    btn.textContent = original
    btn.removeAttribute('disabled')
  }, 1500)
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
