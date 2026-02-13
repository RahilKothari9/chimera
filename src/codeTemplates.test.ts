import { describe, it, expect } from 'vitest'
import {
  getAllTemplates,
  getTemplateCategories,
  getTemplatesByCategory,
  getTemplatesByLanguage,
  searchTemplates,
  getTemplateById,
  type CodeTemplate,
  type TemplateCategory,
} from './codeTemplates'

describe('Code Templates', () => {
  describe('getTemplateCategories', () => {
    it('should return all template categories', () => {
      const categories = getTemplateCategories()
      expect(categories.length).toBeGreaterThan(0)
      expect(categories[0]).toHaveProperty('id')
      expect(categories[0]).toHaveProperty('name')
      expect(categories[0]).toHaveProperty('description')
      expect(categories[0]).toHaveProperty('icon')
    })

    it('should include standard categories', () => {
      const categories = getTemplateCategories()
      const categoryIds = categories.map(c => c.id)
      expect(categoryIds).toContain('algorithms')
      expect(categoryIds).toContain('data-structures')
      expect(categoryIds).toContain('utilities')
      expect(categoryIds).toContain('patterns')
      expect(categoryIds).toContain('web-apis')
      expect(categoryIds).toContain('examples')
    })

    it('should have unique category IDs', () => {
      const categories = getTemplateCategories()
      const ids = categories.map(c => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('getAllTemplates', () => {
    it('should return an array of templates', () => {
      const templates = getAllTemplates()
      expect(Array.isArray(templates)).toBe(true)
      expect(templates.length).toBeGreaterThan(0)
    })

    it('should have valid template structure', () => {
      const templates = getAllTemplates()
      templates.forEach(template => {
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('description')
        expect(template).toHaveProperty('category')
        expect(template).toHaveProperty('language')
        expect(template).toHaveProperty('code')
        expect(template).toHaveProperty('tags')
        expect(Array.isArray(template.tags)).toBe(true)
      })
    })

    it('should have unique template IDs', () => {
      const templates = getAllTemplates()
      const ids = templates.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have non-empty code for all templates', () => {
      const templates = getAllTemplates()
      templates.forEach(template => {
        expect(template.code.length).toBeGreaterThan(0)
      })
    })

    it('should have at least one tag for each template', () => {
      const templates = getAllTemplates()
      templates.forEach(template => {
        expect(template.tags.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getTemplatesByCategory', () => {
    it('should return templates for algorithms category', () => {
      const templates = getTemplatesByCategory('algorithms')
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach(t => {
        expect(t.category).toBe('algorithms')
      })
    })

    it('should return templates for data-structures category', () => {
      const templates = getTemplatesByCategory('data-structures')
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach(t => {
        expect(t.category).toBe('data-structures')
      })
    })

    it('should return templates for utilities category', () => {
      const templates = getTemplatesByCategory('utilities')
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach(t => {
        expect(t.category).toBe('utilities')
      })
    })

    it('should return templates for patterns category', () => {
      const templates = getTemplatesByCategory('patterns')
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach(t => {
        expect(t.category).toBe('patterns')
      })
    })

    it('should return templates for web-apis category', () => {
      const templates = getTemplatesByCategory('web-apis')
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach(t => {
        expect(t.category).toBe('web-apis')
      })
    })

    it('should return templates for examples category', () => {
      const templates = getTemplatesByCategory('examples')
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach(t => {
        expect(t.category).toBe('examples')
      })
    })

    it('should return empty array for non-existent category', () => {
      const templates = getTemplatesByCategory('non-existent' as any)
      expect(templates).toEqual([])
    })
  })

  describe('getTemplatesByLanguage', () => {
    it('should return templates for javascript', () => {
      const templates = getTemplatesByLanguage('javascript')
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach(t => {
        expect(t.language).toBe('javascript')
      })
    })

    it('should return templates for typescript', () => {
      const templates = getTemplatesByLanguage('typescript')
      expect(templates.length).toBeGreaterThan(0)
      templates.forEach(t => {
        expect(t.language).toBe('typescript')
      })
    })

    it('should return empty array for language with no templates', () => {
      const templates = getTemplatesByLanguage('python')
      expect(Array.isArray(templates)).toBe(true)
    })

    it('should return empty array for non-existent language', () => {
      const templates = getTemplatesByLanguage('ruby' as any)
      expect(templates).toEqual([])
    })
  })

  describe('searchTemplates', () => {
    it('should find templates by name', () => {
      const results = searchTemplates('binary')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(t => t.name.toLowerCase().includes('binary'))).toBe(true)
    })

    it('should find templates by description', () => {
      const results = searchTemplates('sorting')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(t => t.description.toLowerCase().includes('sorting'))).toBe(true)
    })

    it('should find templates by tags', () => {
      const results = searchTemplates('stack')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should be case insensitive', () => {
      const lower = searchTemplates('search')
      const upper = searchTemplates('SEARCH')
      const mixed = searchTemplates('SeArCh')
      expect(lower).toEqual(upper)
      expect(lower).toEqual(mixed)
    })

    it('should return empty array for no matches', () => {
      const results = searchTemplates('xyzabc123nonexistent')
      expect(results).toEqual([])
    })

    it('should find multiple matches', () => {
      const results = searchTemplates('function')
      expect(results.length).toBeGreaterThan(1)
    })

    it('should handle empty query', () => {
      const results = searchTemplates('')
      expect(results.length).toBe(getAllTemplates().length)
    })
  })

  describe('getTemplateById', () => {
    it('should return template by valid ID', () => {
      const template = getTemplateById('binary-search')
      expect(template).toBeDefined()
      expect(template?.id).toBe('binary-search')
      expect(template?.name).toBe('Binary Search')
    })

    it('should return undefined for invalid ID', () => {
      const template = getTemplateById('non-existent-id')
      expect(template).toBeUndefined()
    })

    it('should find all standard templates by ID', () => {
      const standardIds = [
        'binary-search',
        'quick-sort',
        'stack',
        'queue',
        'debounce',
        'throttle',
        'singleton',
        'observer',
      ]
      
      standardIds.forEach(id => {
        const template = getTemplateById(id)
        expect(template).toBeDefined()
        expect(template?.id).toBe(id)
      })
    })
  })

  describe('Template Content Quality', () => {
    it('should have executable code for algorithm templates', () => {
      const templates = getTemplatesByCategory('algorithms')
      templates.forEach(template => {
        expect(template.code).toContain('function')
        expect(template.code.length).toBeGreaterThan(100)
      })
    })

    it('should have class definitions for data structure templates', () => {
      const templates = getTemplatesByCategory('data-structures')
      templates.forEach(template => {
        expect(template.code).toContain('class')
      })
    })

    it('should have example usage in templates', () => {
      const templates = getAllTemplates()
      const withExamples = templates.filter(t => 
        t.code.includes('Example usage') || 
        t.code.includes('example') ||
        t.code.includes('console.log')
      )
      expect(withExamples.length).toBeGreaterThan(templates.length / 2)
    })
  })

  describe('Coverage', () => {
    it('should cover all major algorithm categories', () => {
      const algorithms = getTemplatesByCategory('algorithms')
      const algorithmTypes = new Set(algorithms.map(t => t.tags).flat())
      
      // Should have search, sort, and graph algorithms
      expect(algorithmTypes.has('search') || algorithms.some(a => a.name.includes('Search'))).toBe(true)
      expect(algorithmTypes.has('sorting') || algorithms.some(a => a.name.includes('Sort'))).toBe(true)
    })

    it('should have basic data structures', () => {
      const dataStructures = getTemplatesByCategory('data-structures')
      const names = dataStructures.map(d => d.name.toLowerCase())
      
      expect(names.some(n => n.includes('stack'))).toBe(true)
      expect(names.some(n => n.includes('queue'))).toBe(true)
    })

    it('should have practical utilities', () => {
      const utilities = getTemplatesByCategory('utilities')
      expect(utilities.length).toBeGreaterThan(0)
      expect(utilities.some(u => u.name.toLowerCase().includes('debounce'))).toBe(true)
    })

    it('should have design patterns', () => {
      const patterns = getTemplatesByCategory('patterns')
      expect(patterns.length).toBeGreaterThan(0)
      const patternNames = patterns.map(p => p.name.toLowerCase())
      expect(patternNames.some(n => n.includes('singleton') || n.includes('observer') || n.includes('factory'))).toBe(true)
    })
  })
})
