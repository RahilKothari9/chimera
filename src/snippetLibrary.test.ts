import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadSnippets,
  saveSnippets,
  getLanguages,
  getCategories,
  getAllTags,
  filterSnippets,
  getSnippetById,
  incrementUsageCount,
  getMostUsedSnippets,
  getSnippetStats,
  addSnippet,
  deleteSnippet,
  searchSnippets,
  type CodeSnippet,
} from './snippetLibrary'

describe('Snippet Library', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('loadSnippets', () => {
    it('should return default snippets when localStorage is empty', () => {
      const snippets = loadSnippets()
      expect(snippets.length).toBeGreaterThan(0)
      expect(snippets[0]).toHaveProperty('id')
      expect(snippets[0]).toHaveProperty('title')
      expect(snippets[0]).toHaveProperty('code')
    })

    it('should load snippets from localStorage if available', () => {
      const customSnippets: CodeSnippet[] = [
        {
          id: 'test-1',
          title: 'Test Snippet',
          description: 'A test',
          language: 'JavaScript',
          category: 'Test',
          tags: ['test'],
          code: 'console.log("test")',
          dateAdded: '2026-02-19',
          usageCount: 0,
        },
      ]
      localStorage.setItem('chimera-snippet-library', JSON.stringify(customSnippets))
      
      const loaded = loadSnippets()
      expect(loaded).toEqual(customSnippets)
    })

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('chimera-snippet-library', 'invalid json')
      const snippets = loadSnippets()
      expect(snippets.length).toBeGreaterThan(0)
    })
  })

  describe('saveSnippets', () => {
    it('should save snippets to localStorage', () => {
      const snippets: CodeSnippet[] = [
        {
          id: 'test-1',
          title: 'Test',
          description: 'Test',
          language: 'JavaScript',
          category: 'Test',
          tags: [],
          code: 'test',
          dateAdded: '2026-02-19',
          usageCount: 0,
        },
      ]
      
      saveSnippets(snippets)
      const stored = localStorage.getItem('chimera-snippet-library')
      expect(stored).toBeTruthy()
      expect(JSON.parse(stored!)).toEqual(snippets)
    })
  })

  describe('getLanguages', () => {
    it('should return unique languages sorted', () => {
      const snippets = loadSnippets()
      const languages = getLanguages(snippets)
      
      expect(languages.length).toBeGreaterThan(0)
      expect(languages).toContain('JavaScript')
      expect(languages).toContain('TypeScript')
      expect(languages).toContain('Python')
      
      // Check if sorted
      const sorted = [...languages].sort()
      expect(languages).toEqual(sorted)
    })

    it('should handle empty array', () => {
      const languages = getLanguages([])
      expect(languages).toEqual([])
    })
  })

  describe('getCategories', () => {
    it('should return unique categories sorted', () => {
      const snippets = loadSnippets()
      const categories = getCategories(snippets)
      
      expect(categories.length).toBeGreaterThan(0)
      
      // Check if sorted
      const sorted = [...categories].sort()
      expect(categories).toEqual(sorted)
    })

    it('should handle empty array', () => {
      const categories = getCategories([])
      expect(categories).toEqual([])
    })
  })

  describe('getAllTags', () => {
    it('should return all tags with counts', () => {
      const snippets = loadSnippets()
      const tags = getAllTags(snippets)
      
      expect(tags.length).toBeGreaterThan(0)
      expect(tags[0]).toHaveProperty('tag')
      expect(tags[0]).toHaveProperty('count')
      expect(typeof tags[0].count).toBe('number')
    })

    it('should sort tags by count descending', () => {
      const snippets: CodeSnippet[] = [
        {
          id: '1',
          title: 'A',
          description: 'A',
          language: 'JS',
          category: 'Test',
          tags: ['common', 'common', 'rare'],
          code: '',
          dateAdded: '2026-02-19',
          usageCount: 0,
        },
        {
          id: '2',
          title: 'B',
          description: 'B',
          language: 'JS',
          category: 'Test',
          tags: ['common'],
          code: '',
          dateAdded: '2026-02-19',
          usageCount: 0,
        },
      ]
      
      const tags = getAllTags(snippets)
      expect(tags[0].tag).toBe('common')
      expect(tags[0].count).toBeGreaterThanOrEqual(tags[1]?.count || 0)
    })

    it('should handle empty array', () => {
      const tags = getAllTags([])
      expect(tags).toEqual([])
    })
  })

  describe('filterSnippets', () => {
    it('should filter by language', () => {
      const snippets = loadSnippets()
      const filtered = filterSnippets(snippets, { language: 'JavaScript' })
      
      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach(s => {
        expect(s.language).toBe('JavaScript')
      })
    })

    it('should filter by category', () => {
      const snippets = loadSnippets()
      const categories = getCategories(snippets)
      const filtered = filterSnippets(snippets, { category: categories[0] })
      
      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach(s => {
        expect(s.category).toBe(categories[0])
      })
    })

    it('should filter by tag', () => {
      const snippets = loadSnippets()
      const filtered = filterSnippets(snippets, { tag: 'async' })
      
      filtered.forEach(s => {
        expect(s.tags).toContain('async')
      })
    })

    it('should filter by search term in title', () => {
      const snippets = loadSnippets()
      const filtered = filterSnippets(snippets, { searchTerm: 'fetch' })
      
      expect(filtered.length).toBeGreaterThan(0)
    })

    it('should filter by search term in description', () => {
      const snippets = loadSnippets()
      const filtered = filterSnippets(snippets, { searchTerm: 'async' })
      
      expect(filtered.length).toBeGreaterThan(0)
    })

    it('should filter by search term in code', () => {
      const snippets = loadSnippets()
      const filtered = filterSnippets(snippets, { searchTerm: 'await' })
      
      expect(filtered.length).toBeGreaterThan(0)
    })

    it('should combine multiple filters', () => {
      const snippets = loadSnippets()
      const filtered = filterSnippets(snippets, {
        language: 'JavaScript',
        searchTerm: 'async',
      })
      
      filtered.forEach(s => {
        expect(s.language).toBe('JavaScript')
      })
    })

    it('should be case insensitive for search', () => {
      const snippets = loadSnippets()
      const lower = filterSnippets(snippets, { searchTerm: 'function' })
      const upper = filterSnippets(snippets, { searchTerm: 'FUNCTION' })
      
      expect(lower.length).toBeGreaterThan(0)
      expect(upper.length).toBeGreaterThan(0)
      expect(lower.length).toBe(upper.length)
    })

    it('should return all snippets when no filters', () => {
      const snippets = loadSnippets()
      const filtered = filterSnippets(snippets, {})
      
      expect(filtered.length).toBe(snippets.length)
    })
  })

  describe('getSnippetById', () => {
    it('should return snippet by ID', () => {
      const snippets = loadSnippets()
      const snippet = getSnippetById(snippets, snippets[0].id)
      
      expect(snippet).toBeTruthy()
      expect(snippet?.id).toBe(snippets[0].id)
    })

    it('should return null for non-existent ID', () => {
      const snippets = loadSnippets()
      const snippet = getSnippetById(snippets, 'non-existent-id')
      
      expect(snippet).toBeNull()
    })
  })

  describe('incrementUsageCount', () => {
    it('should increment usage count', () => {
      const snippets = loadSnippets()
      const snippetId = snippets[0].id
      const initialCount = snippets[0].usageCount
      
      incrementUsageCount(snippetId)
      
      const updated = loadSnippets()
      const updatedSnippet = updated.find(s => s.id === snippetId)
      
      expect(updatedSnippet?.usageCount).toBe(initialCount + 1)
    })

    it('should handle non-existent ID gracefully', () => {
      incrementUsageCount('non-existent-id')
      // Should not throw
    })
  })

  describe('getMostUsedSnippets', () => {
    it('should return snippets sorted by usage', () => {
      const snippets = loadSnippets()
      
      // Increment usage for some snippets
      incrementUsageCount(snippets[0].id)
      incrementUsageCount(snippets[0].id)
      incrementUsageCount(snippets[1].id)
      
      const updated = loadSnippets()
      const mostUsed = getMostUsedSnippets(updated, 3)
      
      expect(mostUsed.length).toBeLessThanOrEqual(3)
      
      // Check sorting
      for (let i = 1; i < mostUsed.length; i++) {
        expect(mostUsed[i - 1].usageCount).toBeGreaterThanOrEqual(mostUsed[i].usageCount)
      }
    })

    it('should respect limit parameter', () => {
      const snippets = loadSnippets()
      const mostUsed = getMostUsedSnippets(snippets, 2)
      
      expect(mostUsed.length).toBeLessThanOrEqual(2)
    })

    it('should handle empty array', () => {
      const mostUsed = getMostUsedSnippets([], 5)
      expect(mostUsed).toEqual([])
    })
  })

  describe('getSnippetStats', () => {
    it('should calculate total snippets', () => {
      const snippets = loadSnippets()
      const stats = getSnippetStats(snippets)
      
      expect(stats.totalSnippets).toBe(snippets.length)
    })

    it('should calculate language breakdown', () => {
      const snippets = loadSnippets()
      const stats = getSnippetStats(snippets)
      
      expect(Object.keys(stats.languageBreakdown).length).toBeGreaterThan(0)
      
      const total = Object.values(stats.languageBreakdown).reduce((a, b) => a + b, 0)
      expect(total).toBe(snippets.length)
    })

    it('should calculate category breakdown', () => {
      const snippets = loadSnippets()
      const stats = getSnippetStats(snippets)
      
      expect(Object.keys(stats.categoryBreakdown).length).toBeGreaterThan(0)
      
      const total = Object.values(stats.categoryBreakdown).reduce((a, b) => a + b, 0)
      expect(total).toBe(snippets.length)
    })

    it('should return top tags', () => {
      const snippets = loadSnippets()
      const stats = getSnippetStats(snippets)
      
      expect(stats.topTags.length).toBeLessThanOrEqual(10)
      
      // Check sorting
      for (let i = 1; i < stats.topTags.length; i++) {
        expect(stats.topTags[i - 1].count).toBeGreaterThanOrEqual(stats.topTags[i].count)
      }
    })

    it('should handle empty array', () => {
      const stats = getSnippetStats([])
      
      expect(stats.totalSnippets).toBe(0)
      expect(Object.keys(stats.languageBreakdown)).toEqual([])
      expect(Object.keys(stats.categoryBreakdown)).toEqual([])
      expect(stats.topTags).toEqual([])
    })
  })

  describe('addSnippet', () => {
    it('should add a new snippet', () => {
      const initialCount = loadSnippets().length
      
      const newSnippet = addSnippet({
        title: 'Custom Snippet',
        description: 'A custom test snippet',
        language: 'JavaScript',
        category: 'Custom',
        tags: ['test', 'custom'],
        code: 'console.log("custom")',
      })
      
      expect(newSnippet.id).toBeTruthy()
      expect(newSnippet.dateAdded).toBeTruthy()
      expect(newSnippet.usageCount).toBe(0)
      
      const updated = loadSnippets()
      expect(updated.length).toBe(initialCount + 1)
      
      const found = updated.find(s => s.id === newSnippet.id)
      expect(found).toBeTruthy()
      expect(found?.title).toBe('Custom Snippet')
    })

    it('should generate unique IDs', () => {
      const snippet1 = addSnippet({
        title: 'Snippet 1',
        description: 'First',
        language: 'JS',
        category: 'Test',
        tags: [],
        code: '',
      })
      
      const snippet2 = addSnippet({
        title: 'Snippet 2',
        description: 'Second',
        language: 'JS',
        category: 'Test',
        tags: [],
        code: '',
      })
      
      expect(snippet1.id).not.toBe(snippet2.id)
    })
  })

  describe('deleteSnippet', () => {
    it('should delete an existing snippet', () => {
      const snippets = loadSnippets()
      const snippetId = snippets[0].id
      const initialCount = snippets.length
      
      const result = deleteSnippet(snippetId)
      
      expect(result).toBe(true)
      
      const updated = loadSnippets()
      expect(updated.length).toBe(initialCount - 1)
      
      const found = updated.find(s => s.id === snippetId)
      expect(found).toBeUndefined()
    })

    it('should return false for non-existent ID', () => {
      const result = deleteSnippet('non-existent-id')
      expect(result).toBe(false)
    })

    it('should not modify array for non-existent ID', () => {
      const initialCount = loadSnippets().length
      
      deleteSnippet('non-existent-id')
      
      const afterCount = loadSnippets().length
      expect(afterCount).toBe(initialCount)
    })
  })

  describe('searchSnippets', () => {
    it('should search snippets by query', () => {
      const snippets = loadSnippets()
      const results = searchSnippets(snippets, 'fetch')
      
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return empty array for no matches', () => {
      const snippets = loadSnippets()
      const results = searchSnippets(snippets, 'xyznonexistent')
      
      expect(results).toEqual([])
    })

    it('should be case insensitive', () => {
      const snippets = loadSnippets()
      const lower = searchSnippets(snippets, 'javascript')
      const upper = searchSnippets(snippets, 'JAVASCRIPT')
      
      expect(lower.length).toBe(upper.length)
    })
  })
})
