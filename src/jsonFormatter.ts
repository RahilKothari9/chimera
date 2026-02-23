/**
 * JSON Formatter / Validator
 * Core logic for parsing, formatting, validating, and analyzing JSON
 */

export interface JsonFormatResult {
  isValid: boolean
  formatted?: string
  minified?: string
  error?: string
  errorLine?: number
  errorColumn?: number
  stats?: JsonStats
}

export interface JsonStats {
  keys: number
  arrays: number
  objects: number
  strings: number
  numbers: number
  booleans: number
  nulls: number
  depth: number
  size: number
}

export interface JsonDiffItem {
  path: string
  type: 'added' | 'removed' | 'changed'
  oldValue?: unknown
  newValue?: unknown
}

/**
 * Validates and parses a JSON string, returning detailed results.
 */
export function formatJson(input: string, indentSpaces = 2): JsonFormatResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Input is empty' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch (err) {
    const message = err instanceof SyntaxError ? err.message : String(err)
    const { line, column } = extractErrorPosition(message, trimmed)
    return { isValid: false, error: message, errorLine: line, errorColumn: column }
  }

  const formatted = JSON.stringify(parsed, null, indentSpaces)
  const minified = JSON.stringify(parsed)
  const stats = calculateStats(parsed)

  return { isValid: true, formatted, minified, stats }
}

/**
 * Attempts to fix common JSON issues (trailing commas, single quotes, unquoted keys).
 */
export function repairJson(input: string): string {
  let result = input.trim()

  // Replace single-quoted strings with double-quoted
  result = result.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')

  // Remove trailing commas before } or ]
  result = result.replace(/,\s*([}\]])/g, '$1')

  // Quote unquoted keys: { key: "value" } -> { "key": "value" }
  result = result.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

  return result
}

/**
 * Computes statistics for a parsed JSON value.
 */
export function calculateStats(value: unknown, currentDepth = 0): JsonStats {
  const stats: JsonStats = {
    keys: 0,
    arrays: 0,
    objects: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    depth: currentDepth,
    size: JSON.stringify(value).length,
  }

  accumulate(value, stats, currentDepth)
  return stats
}

function accumulate(value: unknown, stats: JsonStats, depth: number): void {
  if (value === null) {
    stats.nulls++
    return
  }
  if (typeof value === 'string') {
    stats.strings++
    return
  }
  if (typeof value === 'number') {
    stats.numbers++
    return
  }
  if (typeof value === 'boolean') {
    stats.booleans++
    return
  }
  if (Array.isArray(value)) {
    stats.arrays++
    const childDepth = depth + 1
    if (childDepth > stats.depth) stats.depth = childDepth
    for (const item of value) {
      accumulate(item, stats, childDepth)
    }
    return
  }
  if (typeof value === 'object') {
    stats.objects++
    const childDepth = depth + 1
    if (childDepth > stats.depth) stats.depth = childDepth
    for (const [, v] of Object.entries(value as Record<string, unknown>)) {
      stats.keys++
      accumulate(v, stats, childDepth)
    }
    return
  }
}

/**
 * Extracts a best-effort line/column from a JSON SyntaxError message.
 */
export function extractErrorPosition(message: string, input: string): { line?: number; column?: number } {
  // Modern engines include "at position N" or "line N column N"
  const posMatch = message.match(/position (\d+)/)
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10)
    return positionToLineColumn(input, pos)
  }
  const lineColMatch = message.match(/line (\d+) column (\d+)/)
  if (lineColMatch) {
    return { line: parseInt(lineColMatch[1], 10), column: parseInt(lineColMatch[2], 10) }
  }
  return {}
}

function positionToLineColumn(input: string, position: number): { line: number; column: number } {
  const before = input.slice(0, position)
  const lines = before.split('\n')
  return { line: lines.length, column: lines[lines.length - 1].length + 1 }
}

/**
 * Sorts JSON object keys recursively (alphabetically).
 */
export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys)
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeys((value as Record<string, unknown>)[key])
    }
    return sorted
  }
  return value
}

/**
 * Returns a flat list of differences between two JSON strings.
 */
export function diffJson(a: string, b: string): JsonDiffItem[] | null {
  let parsedA: unknown, parsedB: unknown
  try {
    parsedA = JSON.parse(a)
    parsedB = JSON.parse(b)
  } catch {
    return null
  }
  const result: JsonDiffItem[] = []
  diffValues(parsedA, parsedB, '', result)
  return result
}

function diffValues(a: unknown, b: unknown, path: string, result: JsonDiffItem[]): void {
  if (JSON.stringify(a) === JSON.stringify(b)) return

  const isObjA = a !== null && typeof a === 'object' && !Array.isArray(a)
  const isObjB = b !== null && typeof b === 'object' && !Array.isArray(b)

  if (isObjA && isObjB) {
    const keysA = Object.keys(a as Record<string, unknown>)
    const keysB = Object.keys(b as Record<string, unknown>)
    const allKeys = new Set([...keysA, ...keysB])
    for (const key of allKeys) {
      const p = path ? `${path}.${key}` : key
      const va = (a as Record<string, unknown>)[key]
      const vb = (b as Record<string, unknown>)[key]
      if (!(key in (a as object))) {
        result.push({ path: p, type: 'added', newValue: vb })
      } else if (!(key in (b as object))) {
        result.push({ path: p, type: 'removed', oldValue: va })
      } else {
        diffValues(va, vb, p, result)
      }
    }
    return
  }

  if (path === '') {
    result.push({ path: '(root)', type: 'changed', oldValue: a, newValue: b })
  } else {
    result.push({ path, type: 'changed', oldValue: a, newValue: b })
  }
}

export const JSON_EXAMPLES: Array<{ label: string; value: string }> = [
  {
    label: 'User Object',
    value: JSON.stringify(
      {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        roles: ['admin', 'editor'],
        active: true,
        metadata: { createdAt: '2024-01-01', updatedAt: '2024-06-15' },
      },
      null,
      2
    ),
  },
  {
    label: 'API Response',
    value: JSON.stringify(
      {
        status: 'ok',
        code: 200,
        data: [
          { id: 1, title: 'Post One', tags: ['news', 'tech'] },
          { id: 2, title: 'Post Two', tags: ['design'] },
        ],
        pagination: { page: 1, perPage: 10, total: 2 },
      },
      null,
      2
    ),
  },
  {
    label: 'Config File',
    value: JSON.stringify(
      {
        name: 'my-app',
        version: '1.0.0',
        scripts: { dev: 'vite', build: 'tsc && vite build', test: 'vitest run' },
        dependencies: {},
        devDependencies: { vite: '^7.0.0', vitest: '^4.0.0' },
      },
      null,
      2
    ),
  },
]
