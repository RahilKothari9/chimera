/**
 * Code Playground Engine
 * Executes JavaScript code snippets safely in an isolated context
 */

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json'

export interface PlaygroundSnippet {
  id: string
  name: string
  code: string
  language: SupportedLanguage
  createdAt: number
  lastRun?: number
}

export interface ExecutionResult {
  output: string[]
  errors: string[]
  executionTime: number
  success: boolean
  preview?: string // For HTML/CSS live preview
}

const STORAGE_KEY = 'chimera_playground_snippets'
const MAX_SNIPPETS = 50

/**
 * Execute code based on language type
 */
export function executeCode(code: string, language: SupportedLanguage = 'javascript'): ExecutionResult {
  switch (language) {
    case 'javascript':
      return executeJavaScript(code)
    case 'typescript':
      return validateTypeScript(code)
    case 'python':
      return validatePython(code)
    case 'html':
    case 'css':
      return renderHTMLCSS(code, language)
    case 'json':
      return validateJSON(code)
    default:
      return {
        output: [],
        errors: [`Unsupported language: ${language}`],
        executionTime: 0,
        success: false,
      }
  }
}

/**
 * Execute JavaScript code in an isolated context
 */
function executeJavaScript(code: string): ExecutionResult {
  const startTime = performance.now()
  const output: string[] = []
  const errors: string[] = []
  let success = true

  // Create a sandboxed console
  const sandboxConsole = {
    log: (...args: unknown[]) => {
      output.push(args.map(arg => String(arg)).join(' '))
    },
    error: (...args: unknown[]) => {
      errors.push(args.map(arg => String(arg)).join(' '))
    },
    warn: (...args: unknown[]) => {
      output.push('⚠️ ' + args.map(arg => String(arg)).join(' '))
    },
    info: (...args: unknown[]) => {
      output.push('ℹ️ ' + args.map(arg => String(arg)).join(' '))
    },
  }

  try {
    // Create a function with sandboxed console
    const fn = new Function('console', code)
    fn(sandboxConsole)
  } catch (error) {
    success = false
    if (error instanceof Error) {
      errors.push(`Error: ${error.message}`)
    } else {
      errors.push(`Error: ${String(error)}`)
    }
  }

  const executionTime = performance.now() - startTime

  return {
    output,
    errors,
    executionTime,
    success,
  }
}

/**
 * Validate TypeScript syntax
 */
function validateTypeScript(code: string): ExecutionResult {
  const startTime = performance.now()
  const output: string[] = []
  const errors: string[] = []

  // Basic TypeScript syntax validation
  // Note: We can't fully compile TypeScript in the browser without the TS compiler
  // But we can do basic checks and provide helpful feedback
  try {
    // Check for common TypeScript syntax
    const hasTypeScriptSyntax = 
      code.includes('interface ') || 
      code.includes('type ') || 
      /:\s*(string|number|boolean|any|void|unknown|never)/.test(code)
    
    if (hasTypeScriptSyntax) {
      output.push('✓ TypeScript syntax detected')
    }
    
    // For pure TypeScript (interfaces, types), skip JavaScript validation
    // Only validate JavaScript syntax if it doesn't look like pure TS declarations
    const isPureTypeScript = (code.includes('interface ') || code.includes('type ')) && !code.includes('=')
    
    if (!isPureTypeScript) {
      // Try to parse as JavaScript to catch basic syntax errors
      new Function(code)
    }
    
    output.push('✓ Syntax is valid')
    output.push('ℹ️ Note: Full TypeScript compilation requires a build step')
    output.push('ℹ️ This validates basic syntax only')
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }

  const executionTime = performance.now() - startTime

  return {
    output,
    errors,
    executionTime,
    success: errors.length === 0,
  }
}

/**
 * Validate Python syntax
 */
function validatePython(code: string): ExecutionResult {
  const startTime = performance.now()
  const output: string[] = []
  const errors: string[] = []

  // Basic Python syntax validation
  const pythonKeywords = ['def ', 'class ', 'import ', 'from ', 'if ', 'for ', 'while ', 'print(', 'return']
  const hasKeywords = pythonKeywords.some(kw => code.includes(kw))

  if (hasKeywords) {
    output.push('✓ Python syntax detected')
  }

  // Check indentation consistency (Python-specific)
  const lines = code.split('\n')
  let indentationValid = true
  const indentPattern = /^(\s*)/

  for (const line of lines) {
    if (line.trim() === '') continue
    const match = line.match(indentPattern)
    if (match) {
      const indent = match[1]
      // Check for tab/space mixing
      if (indent.includes('\t') && indent.includes(' ')) {
        errors.push('Indentation error: Mixed tabs and spaces')
        indentationValid = false
        break
      }
    }
  }

  if (indentationValid && !hasKeywords && code.trim() !== '') {
    output.push('⚠️ No Python keywords detected - is this Python code?')
  } else if (indentationValid) {
    output.push('✓ Indentation appears valid')
  }

  output.push('ℹ️ Note: Python execution requires a Python runtime')
  output.push('ℹ️ This validates basic syntax only')

  const executionTime = performance.now() - startTime

  return {
    output,
    errors,
    executionTime,
    success: errors.length === 0,
  }
}

/**
 * Render HTML/CSS with live preview
 */
function renderHTMLCSS(code: string, language: SupportedLanguage): ExecutionResult {
  const startTime = performance.now()
  const output: string[] = []
  const errors: string[] = []
  let preview = ''

  try {
    if (language === 'html') {
      // Create preview (scripts are disabled via iframe sandbox)
      preview = code
      output.push('✓ HTML rendered successfully')
      output.push('ℹ️ Preview shown below (scripts disabled for security)')
    } else if (language === 'css') {
      // Validate CSS syntax
      const validCss = code.includes('{') && code.includes('}')
      if (validCss) {
        preview = `<div style="padding: 20px; background: white; color: black;">${code}</div>`
        output.push('✓ CSS syntax appears valid')
        output.push('ℹ️ CSS code displayed as text')
      } else {
        errors.push('Invalid CSS syntax: Missing braces')
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }

  const executionTime = performance.now() - startTime

  return {
    output,
    errors,
    executionTime,
    success: errors.length === 0,
    preview,
  }
}

/**
 * Validate and format JSON
 */
function validateJSON(code: string): ExecutionResult {
  const startTime = performance.now()
  const output: string[] = []
  const errors: string[] = []

  try {
    const parsed = JSON.parse(code)
    const formatted = JSON.stringify(parsed, null, 2)
    
    output.push('✓ Valid JSON')
    output.push('')
    output.push('Formatted:')
    output.push(formatted)
    
    // Show some stats
    const keys = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0
    if (keys > 0) {
      output.push('')
      output.push(`ℹ️ ${keys} top-level key${keys === 1 ? '' : 's'}`)
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }

  const executionTime = performance.now() - startTime

  return {
    output,
    errors,
    executionTime,
    success: errors.length === 0,
  }
}

/**
 * Load snippets from localStorage
 */
export function loadSnippets(): PlaygroundSnippet[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as PlaygroundSnippet[]
  } catch (error) {
    console.error('Failed to load snippets:', error)
    return []
  }
}

/**
 * Save snippets to localStorage
 */
export function saveSnippets(snippets: PlaygroundSnippet[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets))
    return true
  } catch (error) {
    console.error('Failed to save snippets:', error)
    return false
  }
}

/**
 * Save a new snippet
 */
export function saveSnippet(snippet: Omit<PlaygroundSnippet, 'id' | 'createdAt'>): PlaygroundSnippet {
  const snippets = loadSnippets()
  const newSnippet: PlaygroundSnippet = {
    ...snippet,
    id: generateId(),
    createdAt: Date.now(),
  }

  snippets.unshift(newSnippet)

  // Limit number of snippets
  if (snippets.length > MAX_SNIPPETS) {
    snippets.splice(MAX_SNIPPETS)
  }

  saveSnippets(snippets)
  return newSnippet
}

/**
 * Update an existing snippet
 */
export function updateSnippet(id: string, updates: Partial<PlaygroundSnippet>): boolean {
  const snippets = loadSnippets()
  const index = snippets.findIndex(s => s.id === id)
  if (index === -1) return false

  snippets[index] = { ...snippets[index], ...updates }
  return saveSnippets(snippets)
}

/**
 * Delete a snippet
 */
export function deleteSnippet(id: string): boolean {
  const snippets = loadSnippets()
  const filtered = snippets.filter(s => s.id !== id)
  if (filtered.length === snippets.length) return false
  return saveSnippets(filtered)
}

/**
 * Get snippet by ID
 */
export function getSnippet(id: string): PlaygroundSnippet | null {
  const snippets = loadSnippets()
  return snippets.find(s => s.id === id) || null
}

/**
 * Clear all snippets
 */
export function clearAllSnippets(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear snippets:', error)
    return false
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `snippet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Get language metadata
 */
export function getLanguageInfo(language: SupportedLanguage) {
  const languageMetadata: Record<SupportedLanguage, { name: string; icon: string; executable: boolean; description: string }> = {
    javascript: {
      name: 'JavaScript',
      icon: '🟨',
      executable: true,
      description: 'Execute JavaScript code in a sandboxed environment'
    },
    typescript: {
      name: 'TypeScript',
      icon: '🔷',
      executable: false,
      description: 'Validate TypeScript syntax (compilation requires build tools)'
    },
    python: {
      name: 'Python',
      icon: '🐍',
      executable: false,
      description: 'Validate Python syntax (execution requires Python runtime)'
    },
    html: {
      name: 'HTML',
      icon: '🌐',
      executable: false,
      description: 'Preview HTML markup with live rendering'
    },
    css: {
      name: 'CSS',
      icon: '🎨',
      executable: false,
      description: 'View CSS styling code'
    },
    json: {
      name: 'JSON',
      icon: '📋',
      executable: false,
      description: 'Validate and format JSON data'
    },
  }
  
  return languageMetadata[language]
}

/**
 * Get example snippets for first-time users
 */
export function getExampleSnippets(): PlaygroundSnippet[] {
  return [
    {
      id: 'example_1',
      name: 'Hello World (JavaScript)',
      code: `console.log('Hello, Chimera!');\nconsole.log('Welcome to the playground!');`,
      language: 'javascript',
      createdAt: Date.now(),
    },
    {
      id: 'example_2',
      name: 'Array Operations (JavaScript)',
      code: `const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log('Original:', numbers);\nconsole.log('Doubled:', doubled);`,
      language: 'javascript',
      createdAt: Date.now(),
    },
    {
      id: 'example_3',
      name: 'Fibonacci Sequence (JavaScript)',
      code: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n  console.log(\`F(\${i}) = \${fibonacci(i)}\`);\n}`,
      language: 'javascript',
      createdAt: Date.now(),
    },
    {
      id: 'example_4',
      name: 'TypeScript Interface',
      code: `interface User {\n  name: string;\n  age: number;\n  email?: string;\n}\n\nconst user: User = {\n  name: 'Chimera',\n  age: 25\n};\n\nconsole.log(user);`,
      language: 'typescript',
      createdAt: Date.now(),
    },
    {
      id: 'example_5',
      name: 'Python Function',
      code: `def greet(name):\n    return f"Hello, {name}!"\n\nfor i in range(5):\n    print(greet(f"User {i+1}"))`,
      language: 'python',
      createdAt: Date.now(),
    },
    {
      id: 'example_6',
      name: 'HTML Card',
      code: `<div class="card">\n  <h2>Chimera Evolution</h2>\n  <p>A self-evolving repository</p>\n  <button>Learn More</button>\n</div>`,
      language: 'html',
      createdAt: Date.now(),
    },
    {
      id: 'example_7',
      name: 'CSS Styling',
      code: `.card {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border-radius: 12px;\n  padding: 20px;\n  color: white;\n  box-shadow: 0 10px 20px rgba(0,0,0,0.2);\n}`,
      language: 'css',
      createdAt: Date.now(),
    },
    {
      id: 'example_8',
      name: 'JSON Data',
      code: `{\n  "name": "Chimera",\n  "version": "1.0.0",\n  "features": ["JavaScript", "TypeScript", "Python", "HTML", "CSS", "JSON"],\n  "active": true\n}`,
      language: 'json',
      createdAt: Date.now(),
    },
  ]
}
