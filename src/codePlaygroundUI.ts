/**
 * Code Playground UI
 * Interactive code editor with execution and output display
 */

import {
  executeCode,
  loadSnippets,
  saveSnippet,
  updateSnippet,
  deleteSnippet,
  getExampleSnippets,
  getLanguageInfo,
  type PlaygroundSnippet,
  type ExecutionResult,
  type SupportedLanguage,
} from './codePlayground'
import { notificationManager } from './notificationSystem'
import { trackActivity } from './activityFeed'

export interface PlaygroundUIOptions {
  onSnippetRun?: (snippet: PlaygroundSnippet, result: ExecutionResult) => void
}

/**
 * Create the code playground UI
 */
export function createCodePlaygroundUI(options: PlaygroundUIOptions = {}): HTMLElement {
  const container = document.createElement('div')
  container.className = 'playground-container'

  let currentSnippet: PlaygroundSnippet | null = null
  let currentLanguage: SupportedLanguage = 'javascript'
  let isDirty = false

  // Create header
  const header = document.createElement('div')
  header.className = 'playground-header'
  header.innerHTML = `
    <div class="playground-title-section">
      <h3 class="playground-title">🎮 Code Playground</h3>
      <p class="playground-subtitle">Experiment with multiple programming languages</p>
    </div>
    <div class="playground-actions">
      <button class="btn btn-secondary" id="load-examples-btn">Load Examples</button>
      <button class="btn btn-secondary" id="clear-playground-btn">Clear</button>
      <button class="btn btn-primary" id="save-snippet-btn">Save Snippet</button>
    </div>
  `

  // Create language selector
  const languageSelector = document.createElement('div')
  languageSelector.className = 'playground-language-selector'
  languageSelector.innerHTML = `
    <label for="language-select">Language:</label>
    <select id="language-select" class="playground-language-dropdown">
      <option value="javascript">🟨 JavaScript</option>
      <option value="typescript">🔷 TypeScript</option>
      <option value="python">🐍 Python</option>
      <option value="html">🌐 HTML</option>
      <option value="css">🎨 CSS</option>
      <option value="json">📋 JSON</option>
    </select>
    <span class="playground-language-info" id="language-info">Execute JavaScript code in a sandboxed environment</span>
  `

  // Create editor section
  const editorSection = document.createElement('div')
  editorSection.className = 'playground-editor-section'

  const snippetNameInput = document.createElement('input')
  snippetNameInput.type = 'text'
  snippetNameInput.className = 'playground-snippet-name'
  snippetNameInput.placeholder = 'Snippet name...'
  snippetNameInput.value = 'Untitled Snippet'

  const editorWrapper = document.createElement('div')
  editorWrapper.className = 'playground-editor-wrapper'

  const codeEditor = document.createElement('textarea')
  codeEditor.className = 'playground-code-editor'
  codeEditor.placeholder = 'Enter your code here...\n\nExample:\nconsole.log("Hello, Chimera!");\nconst x = 10;\nconsole.log("Result:", x * 2);'
  codeEditor.spellcheck = false

  const lineNumbers = document.createElement('div')
  lineNumbers.className = 'playground-line-numbers'
  lineNumbers.textContent = '1'

  editorWrapper.appendChild(lineNumbers)
  editorWrapper.appendChild(codeEditor)

  const runButton = document.createElement('button')
  runButton.className = 'btn btn-primary playground-run-btn'
  runButton.innerHTML = '▶ Run Code'

  editorSection.appendChild(languageSelector)
  editorSection.appendChild(snippetNameInput)
  editorSection.appendChild(editorWrapper)
  editorSection.appendChild(runButton)

  // Create output section
  const outputSection = document.createElement('div')
  outputSection.className = 'playground-output-section'

  const outputHeader = document.createElement('div')
  outputHeader.className = 'playground-output-header'
  outputHeader.innerHTML = `
    <span class="playground-output-title">Output</span>
    <button class="btn btn-text" id="clear-output-btn">Clear Output</button>
  `

  const output = document.createElement('div')
  output.className = 'playground-output'
  output.innerHTML = '<div class="playground-output-empty">Run code to see output here...</div>'

  outputSection.appendChild(outputHeader)
  outputSection.appendChild(output)

  // Create saved snippets section
  const snippetsSection = document.createElement('div')
  snippetsSection.className = 'playground-snippets-section'

  const snippetsHeader = document.createElement('div')
  snippetsHeader.className = 'playground-snippets-header'
  snippetsHeader.innerHTML = `
    <span class="playground-snippets-title">💾 Saved Snippets</span>
    <span class="playground-snippets-count">0 snippets</span>
  `

  const snippetsList = document.createElement('div')
  snippetsList.className = 'playground-snippets-list'

  snippetsSection.appendChild(snippetsHeader)
  snippetsSection.appendChild(snippetsList)

  // Assemble container
  container.appendChild(header)
  container.appendChild(editorSection)
  container.appendChild(outputSection)
  container.appendChild(snippetsSection)

  // Update line numbers
  function updateLineNumbers() {
    const lines = codeEditor.value.split('\n').length
    lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n')
  }

  // Update language info
  function updateLanguageInfo(language: SupportedLanguage) {
    const info = getLanguageInfo(language)
    const infoEl = languageSelector.querySelector('#language-info')
    if (infoEl) {
      infoEl.textContent = info.description
    }
  }

  // Mark as dirty when code changes
  function markDirty() {
    isDirty = true
  }

  // Run code
  function runCode() {
    const code = codeEditor.value.trim()
    if (!code) {
      notificationManager.show('Enter some code to run', { type: 'warning' })
      return
    }

    const result = executeCode(code, currentLanguage)

    // Display output
    output.innerHTML = ''

    if (result.output.length > 0) {
      result.output.forEach(line => {
        const outputLine = document.createElement('div')
        outputLine.className = 'playground-output-line'
        outputLine.textContent = line
        output.appendChild(outputLine)
      })
    }

    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        const errorLine = document.createElement('div')
        errorLine.className = 'playground-output-error'
        errorLine.textContent = error
        output.appendChild(errorLine)
      })
    }

    // Show HTML preview if available
    if (result.preview) {
      const previewContainer = document.createElement('div')
      previewContainer.className = 'playground-output-preview'
      const previewLabel = document.createElement('div')
      previewLabel.className = 'playground-preview-label'
      previewLabel.textContent = 'Preview:'
      const previewContent = document.createElement('div')
      previewContent.className = 'playground-preview-content'
      
      if (currentLanguage === 'html') {
        // Create an iframe for safe HTML preview
        const iframe = document.createElement('iframe')
        iframe.className = 'playground-preview-iframe'
        iframe.sandbox.add('allow-same-origin')
        iframe.srcdoc = result.preview
        previewContent.appendChild(iframe)
      } else {
        previewContent.textContent = result.preview
      }
      
      previewContainer.appendChild(previewLabel)
      previewContainer.appendChild(previewContent)
      output.appendChild(previewContainer)
    }

    if (result.output.length === 0 && result.errors.length === 0 && !result.preview) {
      const emptyMessage = document.createElement('div')
      emptyMessage.className = 'playground-output-empty'
      emptyMessage.textContent = 'No output (code executed successfully)'
      output.appendChild(emptyMessage)
    }

    // Add execution info
    const infoLine = document.createElement('div')
    infoLine.className = 'playground-output-info'
    infoLine.textContent = `Executed in ${result.executionTime.toFixed(2)}ms`
    output.appendChild(infoLine)

    // Update last run time if current snippet
    if (currentSnippet) {
      currentSnippet.lastRun = Date.now()
      updateSnippet(currentSnippet.id, { lastRun: currentSnippet.lastRun })
    }

    // Track activity
    trackActivity('code_execution', 'Ran code snippet', result.success ? 'Success' : 'Error')

    // Show notification
    if (result.success) {
      notificationManager.show('Code executed successfully', { type: 'success' })
    } else {
      notificationManager.show('Code execution failed', { type: 'error' })
    }

    // Call callback
    if (currentSnippet && options.onSnippetRun) {
      options.onSnippetRun(currentSnippet, result)
    }
  }

  // Save snippet
  function saveCurrentSnippet() {
    const name = snippetNameInput.value.trim() || 'Untitled Snippet'
    const code = codeEditor.value.trim()

    if (!code) {
      notificationManager.show('Enter some code to save', { type: 'warning' })
      return
    }

    if (currentSnippet) {
      // Update existing
      updateSnippet(currentSnippet.id, { name, code, language: currentLanguage })
      notificationManager.show('Snippet updated', { type: 'success' })
    } else {
      // Create new
      const newSnippet = saveSnippet({ name, code, language: currentLanguage })
      currentSnippet = newSnippet
      notificationManager.show('Snippet saved', { type: 'success' })
    }

    isDirty = false
    trackActivity('snippet_save', 'Saved code snippet', `${name} (${currentLanguage})`)
    renderSnippetsList()
  }

  // Load snippet
  function loadSnippet(snippet: PlaygroundSnippet) {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Load this snippet anyway?')) {
        return
      }
    }

    currentSnippet = snippet
    snippetNameInput.value = snippet.name
    codeEditor.value = snippet.code
    currentLanguage = snippet.language
    
    // Update language selector
    const langSelect = languageSelector.querySelector('#language-select') as HTMLSelectElement
    if (langSelect) {
      langSelect.value = snippet.language
      updateLanguageInfo(snippet.language)
    }
    
    isDirty = false
    updateLineNumbers()
    renderSnippetsList() // Re-render to update active state

    notificationManager.show(`Loaded: ${snippet.name}`, { type: 'info' })
    trackActivity('snippet_load', 'Loaded code snippet', `${snippet.name} (${snippet.language})`)
  }

  // Delete snippet
  function deleteSnippetById(id: string) {
    if (!confirm('Delete this snippet?')) {
      return
    }

    deleteSnippet(id)
    if (currentSnippet?.id === id) {
      currentSnippet = null
    }
    notificationManager.show('Snippet deleted', { type: 'info' })
    trackActivity('snippet_delete', 'Deleted code snippet', '')
    renderSnippetsList()
  }

  // Clear editor
  function clearEditor() {
    if (isDirty && codeEditor.value.trim()) {
      if (!confirm('Clear the editor? Unsaved changes will be lost.')) {
        return
      }
    }

    snippetNameInput.value = 'Untitled Snippet'
    codeEditor.value = ''
    currentSnippet = null
    isDirty = false
    updateLineNumbers()
    notificationManager.show('Editor cleared', { type: 'info' })
  }

  // Load examples
  function loadExamples() {
    const examples = getExampleSnippets()
    examples.forEach(example => {
      saveSnippet({
        name: example.name,
        code: example.code,
        language: example.language,
      })
    })
    notificationManager.show(`Loaded ${examples.length} example snippets`, { type: 'success' })
    trackActivity('snippet_load', 'Loaded example snippets', `${examples.length} examples`)
    renderSnippetsList()
  }

  // Render snippets list
  function renderSnippetsList() {
    const snippets = loadSnippets()
    const count = snippets.length

    const countEl = snippetsSection.querySelector('.playground-snippets-count')
    if (countEl) {
      countEl.textContent = `${count} snippet${count !== 1 ? 's' : ''}`
    }

    if (count === 0) {
      snippetsList.innerHTML = `
        <div class="playground-snippets-empty">
          No saved snippets yet. Save your first snippet or load examples to get started!
        </div>
      `
      return
    }

    snippetsList.innerHTML = ''
    snippets.forEach(snippet => {
      const item = document.createElement('div')
      item.className = 'playground-snippet-item'
      if (currentSnippet?.id === snippet.id) {
        item.classList.add('active')
      }

      const lastRunText = snippet.lastRun
        ? new Date(snippet.lastRun).toLocaleString()
        : 'Never'
      
      const langInfo = getLanguageInfo(snippet.language)

      item.innerHTML = `
        <div class="playground-snippet-info">
          <div class="playground-snippet-name">${langInfo.icon} ${escapeHtml(snippet.name)}</div>
          <div class="playground-snippet-meta">
            ${langInfo.name} • Last run: ${lastRunText}
          </div>
        </div>
        <div class="playground-snippet-actions">
          <button class="btn btn-text btn-sm" data-action="load" data-id="${snippet.id}">Load</button>
          <button class="btn btn-text btn-sm btn-danger" data-action="delete" data-id="${snippet.id}">Delete</button>
        </div>
      `

      const loadBtn = item.querySelector('[data-action="load"]')
      const deleteBtn = item.querySelector('[data-action="delete"]')

      loadBtn?.addEventListener('click', () => loadSnippet(snippet))
      deleteBtn?.addEventListener('click', () => deleteSnippetById(snippet.id))

      snippetsList.appendChild(item)
    })
  }

  // Event listeners
  const langSelect = languageSelector.querySelector('#language-select') as HTMLSelectElement
  langSelect?.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement
    currentLanguage = target.value as SupportedLanguage
    updateLanguageInfo(currentLanguage)
    markDirty()
    
    // Update run button text based on language
    const info = getLanguageInfo(currentLanguage)
    runButton.innerHTML = info.executable ? '▶ Run Code' : '✓ Validate'
    
    trackActivity('code_execution', 'Changed language', currentLanguage)
  })

  codeEditor.addEventListener('input', () => {
    updateLineNumbers()
    markDirty()
  })

  codeEditor.addEventListener('scroll', () => {
    lineNumbers.scrollTop = codeEditor.scrollTop
  })

  runButton.addEventListener('click', runCode)

  const saveBtn = header.querySelector('#save-snippet-btn')
  saveBtn?.addEventListener('click', saveCurrentSnippet)

  const clearBtn = header.querySelector('#clear-playground-btn')
  clearBtn?.addEventListener('click', clearEditor)

  const loadExamplesBtn = header.querySelector('#load-examples-btn')
  loadExamplesBtn?.addEventListener('click', loadExamples)

  const clearOutputBtn = outputSection.querySelector('#clear-output-btn')
  clearOutputBtn?.addEventListener('click', () => {
    output.innerHTML = '<div class="playground-output-empty">Output cleared</div>'
  })

  // Keyboard shortcuts
  codeEditor.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      runCode()
    }
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveCurrentSnippet()
    }
    // Tab support
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = codeEditor.selectionStart
      const end = codeEditor.selectionEnd
      codeEditor.value = codeEditor.value.substring(0, start) + '  ' + codeEditor.value.substring(end)
      codeEditor.selectionStart = codeEditor.selectionEnd = start + 2
      updateLineNumbers()
      markDirty()
    }
  })

  // Initial render
  updateLineNumbers()
  renderSnippetsList()

  return container
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
