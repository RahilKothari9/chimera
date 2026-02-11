/**
 * Tests for Code Playground Engine
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  executeCode,
  loadSnippets,
  saveSnippets,
  saveSnippet,
  updateSnippet,
  deleteSnippet,
  getSnippet,
  clearAllSnippets,
  getExampleSnippets,
  type PlaygroundSnippet,
} from './codePlayground'

describe('Code Playground', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('executeCode', () => {
    it('should execute simple console.log statements', () => {
      const code = `console.log('Hello World');`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual(['Hello World'])
      expect(result.errors).toEqual([])
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('should execute multiple console.log statements', () => {
      const code = `console.log('Line 1');\nconsole.log('Line 2');`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual(['Line 1', 'Line 2'])
      expect(result.errors).toEqual([])
    })

    it('should handle console.warn', () => {
      const code = `console.warn('Warning message');`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual(['⚠️ Warning message'])
    })

    it('should handle console.info', () => {
      const code = `console.info('Info message');`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual(['ℹ️ Info message'])
    })

    it('should handle console.error', () => {
      const code = `console.error('Error message');`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.errors).toEqual(['Error message'])
    })

    it('should execute arithmetic operations', () => {
      const code = `const result = 2 + 2;\nconsole.log('Result:', result);`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual(['Result: 4'])
    })

    it('should execute functions', () => {
      const code = `function greet(name) {\n  return 'Hello ' + name;\n}\nconsole.log(greet('Chimera'));`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual(['Hello Chimera'])
    })

    it('should execute loops', () => {
      const code = `for (let i = 1; i <= 3; i++) {\n  console.log('Count:', i);\n}`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual(['Count: 1', 'Count: 2', 'Count: 3'])
    })

    it('should execute array methods', () => {
      const code = `const arr = [1, 2, 3];\nconst doubled = arr.map(x => x * 2);\nconsole.log(doubled);`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual(['2,4,6'])
    })

    it('should handle syntax errors', () => {
      const code = `const x = ;` // Invalid syntax
      const result = executeCode(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Error:')
    })

    it('should handle runtime errors', () => {
      const code = `throw new Error('Custom error');`
      const result = executeCode(code)

      expect(result.success).toBe(false)
      expect(result.errors).toEqual(['Error: Custom error'])
    })

    it('should handle reference errors', () => {
      const code = `console.log(undefinedVariable);`
      const result = executeCode(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should measure execution time', () => {
      const code = `console.log('test');`
      const result = executeCode(code)

      expect(result.executionTime).toBeGreaterThanOrEqual(0)
      expect(result.executionTime).toBeLessThan(1000) // Should be fast
    })

    it('should handle empty code', () => {
      const code = ``
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual([])
      expect(result.errors).toEqual([])
    })

    it('should handle multiple arguments in console.log', () => {
      const code = `console.log('Hello', 'World', 123);`
      const result = executeCode(code)

      expect(result.success).toBe(true)
      expect(result.output).toEqual(['Hello World 123'])
    })
  })

  describe('Snippet Storage', () => {
    describe('saveSnippets and loadSnippets', () => {
      it('should save and load snippets', () => {
        const snippets: PlaygroundSnippet[] = [
          {
            id: 'test1',
            name: 'Test Snippet',
            code: 'console.log("test");',
            language: 'javascript',
            createdAt: Date.now(),
          },
        ]

        const saved = saveSnippets(snippets)
        expect(saved).toBe(true)

        const loaded = loadSnippets()
        expect(loaded).toEqual(snippets)
      })

      it('should return empty array when no snippets exist', () => {
        const snippets = loadSnippets()
        expect(snippets).toEqual([])
      })

      it('should handle corrupted data gracefully', () => {
        localStorage.setItem('chimera_playground_snippets', 'invalid json')
        const snippets = loadSnippets()
        expect(snippets).toEqual([])
      })
    })

    describe('saveSnippet', () => {
      it('should save a new snippet', () => {
        const snippet = saveSnippet({
          name: 'My Snippet',
          code: 'console.log("hello");',
          language: 'javascript',
        })

        expect(snippet.id).toBeTruthy()
        expect(snippet.name).toBe('My Snippet')
        expect(snippet.code).toBe('console.log("hello");')
        expect(snippet.createdAt).toBeGreaterThan(0)
      })

      it('should add snippet to the beginning of the list', () => {
        saveSnippet({ name: 'First', code: 'code1', language: 'javascript' })
        saveSnippet({ name: 'Second', code: 'code2', language: 'javascript' })

        const snippets = loadSnippets()
        expect(snippets[0].name).toBe('Second')
        expect(snippets[1].name).toBe('First')
      })

      it('should limit snippets to MAX_SNIPPETS', () => {
        // Save 51 snippets (max is 50)
        for (let i = 0; i < 51; i++) {
          saveSnippet({
            name: `Snippet ${i}`,
            code: `console.log(${i});`,
            language: 'javascript',
          })
        }

        const snippets = loadSnippets()
        expect(snippets.length).toBe(50)
      })

      it('should generate unique IDs', () => {
        const snippet1 = saveSnippet({ name: 'S1', code: 'c1', language: 'javascript' })
        const snippet2 = saveSnippet({ name: 'S2', code: 'c2', language: 'javascript' })

        expect(snippet1.id).not.toBe(snippet2.id)
      })
    })

    describe('updateSnippet', () => {
      it('should update an existing snippet', () => {
        const snippet = saveSnippet({
          name: 'Original',
          code: 'original code',
          language: 'javascript',
        })

        const updated = updateSnippet(snippet.id, {
          name: 'Updated',
          code: 'updated code',
        })

        expect(updated).toBe(true)

        const loaded = getSnippet(snippet.id)
        expect(loaded?.name).toBe('Updated')
        expect(loaded?.code).toBe('updated code')
      })

      it('should return false for non-existent snippet', () => {
        const updated = updateSnippet('nonexistent', { name: 'Test' })
        expect(updated).toBe(false)
      })

      it('should preserve unchanged fields', () => {
        const snippet = saveSnippet({
          name: 'Original',
          code: 'original code',
          language: 'javascript',
        })

        updateSnippet(snippet.id, { name: 'Updated' })

        const loaded = getSnippet(snippet.id)
        expect(loaded?.code).toBe('original code')
        expect(loaded?.language).toBe('javascript')
      })
    })

    describe('deleteSnippet', () => {
      it('should delete a snippet', () => {
        const snippet = saveSnippet({
          name: 'To Delete',
          code: 'code',
          language: 'javascript',
        })

        const deleted = deleteSnippet(snippet.id)
        expect(deleted).toBe(true)

        const loaded = getSnippet(snippet.id)
        expect(loaded).toBeNull()
      })

      it('should return false for non-existent snippet', () => {
        const deleted = deleteSnippet('nonexistent')
        expect(deleted).toBe(false)
      })

      it('should not affect other snippets', () => {
        const snippet1 = saveSnippet({ name: 'S1', code: 'c1', language: 'javascript' })
        const snippet2 = saveSnippet({ name: 'S2', code: 'c2', language: 'javascript' })

        deleteSnippet(snippet1.id)

        const loaded = getSnippet(snippet2.id)
        expect(loaded).toBeTruthy()
        expect(loaded?.name).toBe('S2')
      })
    })

    describe('getSnippet', () => {
      it('should retrieve a snippet by ID', () => {
        const snippet = saveSnippet({
          name: 'Test',
          code: 'code',
          language: 'javascript',
        })

        const loaded = getSnippet(snippet.id)
        expect(loaded).toEqual(snippet)
      })

      it('should return null for non-existent snippet', () => {
        const loaded = getSnippet('nonexistent')
        expect(loaded).toBeNull()
      })
    })

    describe('clearAllSnippets', () => {
      it('should clear all snippets', () => {
        saveSnippet({ name: 'S1', code: 'c1', language: 'javascript' })
        saveSnippet({ name: 'S2', code: 'c2', language: 'javascript' })

        const cleared = clearAllSnippets()
        expect(cleared).toBe(true)

        const snippets = loadSnippets()
        expect(snippets).toEqual([])
      })

      it('should return true even when no snippets exist', () => {
        const cleared = clearAllSnippets()
        expect(cleared).toBe(true)
      })
    })
  })

  describe('getExampleSnippets', () => {
    it('should return example snippets', () => {
      const examples = getExampleSnippets()
      expect(examples.length).toBeGreaterThan(0)
    })

    it('should have valid snippet structure', () => {
      const examples = getExampleSnippets()
      examples.forEach(snippet => {
        expect(snippet.id).toBeTruthy()
        expect(snippet.name).toBeTruthy()
        expect(snippet.code).toBeTruthy()
        expect(snippet.language).toBe('javascript')
        expect(snippet.createdAt).toBeGreaterThan(0)
      })
    })

    it('should include Hello World example', () => {
      const examples = getExampleSnippets()
      const helloWorld = examples.find(s => s.name === 'Hello World')
      expect(helloWorld).toBeTruthy()
    })
  })
})
