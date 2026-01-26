import { describe, it, expect } from 'vitest'
import { calculateAchievements } from './achievementSystem'
import type { ChangelogEntry } from './changelogParser'

describe('achievementSystem', () => {
  describe('calculateAchievements', () => {
    it('should return achievement data structure', () => {
      const entries: ChangelogEntry[] = []
      const result = calculateAchievements(entries)
      
      expect(result).toHaveProperty('achievements')
      expect(result).toHaveProperty('milestones')
      expect(result).toHaveProperty('totalUnlocked')
      expect(result).toHaveProperty('completionRate')
      expect(Array.isArray(result.achievements)).toBe(true)
      expect(Array.isArray(result.milestones)).toBe(true)
    })

    it('should unlock "The Beginning" achievement with 1 entry', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '1',
          date: '2026-01-19',
          feature: 'Initial Setup',
          description: 'Created the base framework',
          filesModified: '5 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const beginning = result.achievements.find(a => a.id === 'first_evolution')
      
      expect(beginning).toBeDefined()
      expect(beginning!.unlocked).toBe(true)
      expect(beginning!.unlockedDate).toBe('2026-01-19')
    })

    it('should unlock "Week Strong" achievement with 7 entries', () => {
      const entries: ChangelogEntry[] = Array(7).fill(null).map((_, i) => ({
        day: String(i + 1),
        date: `2026-01-${19 + i}`,
        feature: `Feature ${i + 1}`,
        description: 'Test feature',
        filesModified: '2 files'
      }))
      
      const result = calculateAchievements(entries)
      const weekStrong = result.achievements.find(a => a.id === 'week_strong')
      
      expect(weekStrong).toBeDefined()
      expect(weekStrong!.unlocked).toBe(true)
    })

    it('should not unlock "Week Strong" with only 6 entries', () => {
      const entries: ChangelogEntry[] = Array(6).fill(null).map((_, i) => ({
        day: String(i + 1),
        date: `2026-01-${19 + i}`,
        feature: `Feature ${i + 1}`,
        description: 'Test feature',
        filesModified: '2 files'
      }))
      
      const result = calculateAchievements(entries)
      const weekStrong = result.achievements.find(a => a.id === 'week_strong')
      
      expect(weekStrong!.unlocked).toBe(false)
      expect(weekStrong!.unlockedDate).toBeUndefined()
    })

    it('should unlock "Test Century" achievement with 100+ tests', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '1',
          date: '2026-01-19',
          feature: 'Feature 1',
          description: 'Added 50 new tests',
          filesModified: '3 files'
        },
        {
          day: '2',
          date: '2026-01-20',
          feature: 'Feature 2',
          description: 'Added 60 tests for validation',
          filesModified: '2 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const testCentury = result.achievements.find(a => a.id === 'test_century')
      
      expect(testCentury).toBeDefined()
      expect(testCentury!.unlocked).toBe(true)
    })

    it('should unlock "Test Fortress" achievement with 150+ tests', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '1',
          date: '2026-01-19',
          feature: 'Feature 1',
          description: 'Added 80 new tests',
          filesModified: '3 files'
        },
        {
          day: '2',
          date: '2026-01-20',
          feature: 'Feature 2',
          description: 'Added 80 tests',
          filesModified: '2 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const testFortress = result.achievements.find(a => a.id === 'test_fortress')
      
      expect(testFortress).toBeDefined()
      expect(testFortress!.unlocked).toBe(true)
    })

    it('should unlock "Search Pioneer" achievement when search is added', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '2',
          date: '2026-01-20',
          feature: 'Search and Filter System',
          description: 'Added search functionality',
          filesModified: '4 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const searchPioneer = result.achievements.find(a => a.id === 'search_pioneer')
      
      expect(searchPioneer).toBeDefined()
      expect(searchPioneer!.unlocked).toBe(true)
      expect(searchPioneer!.unlockedDate).toBe('2026-01-20')
    })

    it('should unlock "Visual Artist" achievement when visualization is added', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '4',
          date: '2026-01-22',
          feature: 'Visual Impact Graph',
          description: 'Added data visualization',
          filesModified: '6 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const visualArtist = result.achievements.find(a => a.id === 'visual_artist')
      
      expect(visualArtist).toBeDefined()
      expect(visualArtist!.unlocked).toBe(true)
    })

    it('should unlock "Theme Master" achievement when theme system is added', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '7',
          date: '2026-01-25',
          feature: 'Theme System with Dark/Light Mode Toggle',
          description: 'Added theme switching',
          filesModified: '6 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const themeMaster = result.achievements.find(a => a.id === 'theme_master')
      
      expect(themeMaster).toBeDefined()
      expect(themeMaster!.unlocked).toBe(true)
    })

    it('should unlock "Data Liberator" achievement when export is added', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '6',
          date: '2026-01-24',
          feature: 'Data Export System',
          description: 'Added export functionality',
          filesModified: '4 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const dataLiberator = result.achievements.find(a => a.id === 'data_liberator')
      
      expect(dataLiberator).toBeDefined()
      expect(dataLiberator!.unlocked).toBe(true)
    })

    it('should unlock "Fortune Teller" achievement when predictions are added', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '5',
          date: '2026-01-23',
          feature: 'AI Evolution Prediction Engine',
          description: 'Added prediction capabilities',
          filesModified: '4 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const fortuneTeller = result.achievements.find(a => a.id === 'fortune_teller')
      
      expect(fortuneTeller).toBeDefined()
      expect(fortuneTeller!.unlocked).toBe(true)
    })

    it('should calculate correct completion rate', () => {
      const entries: ChangelogEntry[] = Array(7).fill(null).map((_, i) => ({
        day: String(i + 1),
        date: `2026-01-${19 + i}`,
        feature: `Feature ${i + 1}`,
        description: 'Added 20 new tests',
        filesModified: '2 files'
      }))
      
      const result = calculateAchievements(entries)
      
      // Should unlock: first_evolution, week_strong, test_century, feature_rich
      expect(result.totalUnlocked).toBeGreaterThan(0)
      expect(result.completionRate).toBeGreaterThan(0)
      expect(result.completionRate).toBeLessThanOrEqual(100)
    })

    it('should create evolution milestones', () => {
      const entries: ChangelogEntry[] = Array(5).fill(null).map((_, i) => ({
        day: String(i + 1),
        date: `2026-01-${19 + i}`,
        feature: `Feature ${i + 1}`,
        description: 'Test feature',
        filesModified: '2 files'
      }))
      
      const result = calculateAchievements(entries)
      const evolutionMilestone = result.milestones.find(m => m.category === 'evolution')
      
      expect(evolutionMilestone).toBeDefined()
      expect(evolutionMilestone!.current).toBe(5)
      expect(evolutionMilestone!.target).toBe(7)
      expect(evolutionMilestone!.progress).toBeGreaterThan(0)
    })

    it('should create test milestones', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '1',
          date: '2026-01-19',
          feature: 'Feature 1',
          description: 'Added 50 new tests',
          filesModified: '3 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const testMilestone = result.milestones.find(m => m.category === 'testing')
      
      expect(testMilestone).toBeDefined()
      expect(testMilestone!.current).toBe(50)
      expect(testMilestone!.target).toBe(100)
      expect(testMilestone!.progress).toBe(50)
    })

    it('should handle entries without test counts', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '1',
          date: '2026-01-19',
          feature: 'Documentation Update',
          description: 'Updated documentation',
          filesModified: '1 file'
        }
      ]
      
      const result = calculateAchievements(entries)
      
      expect(result.achievements).toBeDefined()
      expect(result.milestones).toBeDefined()
    })

    it('should categorize achievements correctly', () => {
      const entries: ChangelogEntry[] = []
      const result = calculateAchievements(entries)
      
      const categories = new Set(result.achievements.map(a => a.category))
      
      expect(categories.has('evolution')).toBe(true)
      expect(categories.has('testing')).toBe(true)
      expect(categories.has('features')).toBe(true)
      expect(categories.has('growth')).toBe(true)
    })

    it('should include all required achievement properties', () => {
      const entries: ChangelogEntry[] = []
      const result = calculateAchievements(entries)
      
      result.achievements.forEach(achievement => {
        expect(achievement).toHaveProperty('id')
        expect(achievement).toHaveProperty('name')
        expect(achievement).toHaveProperty('description')
        expect(achievement).toHaveProperty('icon')
        expect(achievement).toHaveProperty('unlocked')
        expect(achievement).toHaveProperty('category')
        expect(achievement).toHaveProperty('requirement')
      })
    })

    it('should unlock "Perfect Ten" achievement with 10 entries', () => {
      const entries: ChangelogEntry[] = Array(10).fill(null).map((_, i) => ({
        day: String(i + 1),
        date: `2026-01-${19 + i}`,
        feature: `Feature ${i + 1}`,
        description: 'Test feature',
        filesModified: '2 files'
      }))
      
      const result = calculateAchievements(entries)
      const perfectTen = result.achievements.find(a => a.id === 'ten_days')
      
      expect(perfectTen).toBeDefined()
      expect(perfectTen!.unlocked).toBe(true)
    })

    it('should unlock "Test Colossus" achievement with 200+ tests', () => {
      const entries: ChangelogEntry[] = [
        {
          day: '1',
          date: '2026-01-19',
          feature: 'Feature 1',
          description: 'Added 100 new tests',
          filesModified: '5 files'
        },
        {
          day: '2',
          date: '2026-01-20',
          feature: 'Feature 2',
          description: 'Added 110 tests',
          filesModified: '3 files'
        }
      ]
      
      const result = calculateAchievements(entries)
      const testColossus = result.achievements.find(a => a.id === 'test_colossus')
      
      expect(testColossus).toBeDefined()
      expect(testColossus!.unlocked).toBe(true)
    })
  })
})
