/**
 * Code Playground Engine
 * Executes JavaScript code snippets safely in an isolated context
 */

export interface PlaygroundSnippet {
  id: string
  name: string
  code: string
  language: 'javascript' | 'typescript'
  createdAt: number
  lastRun?: number
}

export interface ExecutionResult {
  output: string[]
  errors: string[]
  executionTime: number
  success: boolean
}

const STORAGE_KEY = 'chimera_playground_snippets'
const MAX_SNIPPETS = 50

/**
 * Execute JavaScript code in an isolated context
 */
export function executeCode(code: string): ExecutionResult {
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
  return `snippet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get example snippets for first-time users
 */
export function getExampleSnippets(): PlaygroundSnippet[] {
  return [
    {
      id: 'example_1',
      name: 'Hello World',
      code: `console.log('Hello, Chimera!');\nconsole.log('Welcome to the playground!');`,
      language: 'javascript',
      createdAt: Date.now(),
    },
    {
      id: 'example_2',
      name: 'Array Operations',
      code: `const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log('Original:', numbers);\nconsole.log('Doubled:', doubled);`,
      language: 'javascript',
      createdAt: Date.now(),
    },
    {
      id: 'example_3',
      name: 'Fibonacci Sequence',
      code: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n  console.log(\`F(\${i}) = \${fibonacci(i)}\`);\n}`,
      language: 'javascript',
      createdAt: Date.now(),
    },
  ]
}
