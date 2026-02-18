import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getDailyChallenge,
  getChallengeById,
  getAllChallenges,
  loadProgress,
  saveProgress,
  isTodayChallengeCompleted,
  validateSolution,
  submitAttempt,
  getChallengesByDifficulty,
  getChallengesByCategory,
  getAllCategories,
  getChallengeStats,
  type ChallengeProgress,
} from './dailyChallenge'

describe('Daily Challenge System', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Challenge Retrieval', () => {
    it('should get daily challenge based on date', () => {
      const challenge = getDailyChallenge()
      expect(challenge).toBeDefined()
      expect(challenge.id).toBeDefined()
      expect(challenge.title).toBeDefined()
    })

    it('should return same challenge for same day', () => {
      const challenge1 = getDailyChallenge()
      const challenge2 = getDailyChallenge()
      expect(challenge1.id).toBe(challenge2.id)
    })

    it('should get challenge by ID', () => {
      const challenge = getChallengeById('reverse-string')
      expect(challenge).toBeDefined()
      expect(challenge?.id).toBe('reverse-string')
    })

    it('should return null for invalid ID', () => {
      const challenge = getChallengeById('invalid-id')
      expect(challenge).toBeNull()
    })

    it('should get all challenges', () => {
      const challenges = getAllChallenges()
      expect(challenges.length).toBeGreaterThan(0)
      expect(challenges[0]).toHaveProperty('id')
      expect(challenges[0]).toHaveProperty('title')
      expect(challenges[0]).toHaveProperty('testCases')
    })
  })

  describe('Challenge Filtering', () => {
    it('should filter challenges by difficulty', () => {
      const easy = getChallengesByDifficulty('easy')
      const medium = getChallengesByDifficulty('medium')
      const hard = getChallengesByDifficulty('hard')

      expect(easy.every(c => c.difficulty === 'easy')).toBe(true)
      expect(medium.every(c => c.difficulty === 'medium')).toBe(true)
      expect(hard.every(c => c.difficulty === 'hard')).toBe(true)
    })

    it('should filter challenges by category', () => {
      const stringChallenges = getChallengesByCategory('String Manipulation')
      expect(stringChallenges.every(c => c.category === 'String Manipulation')).toBe(true)
    })

    it('should get all categories', () => {
      const categories = getAllCategories()
      expect(categories.length).toBeGreaterThan(0)
      expect(categories).toContain('String Manipulation')
    })

    it('should get challenge statistics', () => {
      const stats = getChallengeStats()
      expect(stats.totalChallenges).toBeGreaterThan(0)
      expect(stats.byDifficulty).toBeDefined()
      expect(stats.byCategory).toBeDefined()
      expect(stats.byDifficulty.easy).toBeGreaterThan(0)
    })
  })

  describe('Progress Management', () => {
    it('should load default progress when nothing saved', () => {
      const progress = loadProgress()
      expect(progress.currentStreak).toBe(0)
      expect(progress.longestStreak).toBe(0)
      expect(progress.totalCompleted).toBe(0)
      expect(progress.lastCompletedDate).toBeNull()
      expect(progress.completedChallenges).toEqual([])
      expect(progress.attempts).toEqual([])
      expect(progress.totalPoints).toBe(0)
    })

    it('should save progress to localStorage', () => {
      const progress: ChallengeProgress = {
        currentStreak: 5,
        longestStreak: 10,
        totalCompleted: 15,
        lastCompletedDate: '2026-02-18',
        completedChallenges: ['reverse-string'],
        attempts: [],
        totalPoints: 100
      }

      const saved = saveProgress(progress)
      expect(saved).toBe(true)

      const loaded = loadProgress()
      expect(loaded.currentStreak).toBe(5)
      expect(loaded.longestStreak).toBe(10)
      expect(loaded.totalCompleted).toBe(15)
      expect(loaded.totalPoints).toBe(100)
    })

    it('should handle corrupted progress data gracefully', () => {
      localStorage.setItem('chimera_challenge_progress', 'invalid json')
      const progress = loadProgress()
      expect(progress.currentStreak).toBe(0)
    })

    it('should check if today challenge is completed', () => {
      expect(isTodayChallengeCompleted()).toBe(false)

      const progress = loadProgress()
      progress.lastCompletedDate = new Date().toDateString()
      saveProgress(progress)

      expect(isTodayChallengeCompleted()).toBe(true)
    })
  })

  describe('Solution Validation', () => {
    it('should validate correct solution', () => {
      const challenge = getChallengeById('reverse-string')!
      const correctCode = 'function reverseString(str) { return str.split("").reverse().join(""); }'
      
      const validation = validateSolution(challenge, correctCode)
      expect(validation.passed).toBe(true)
      expect(validation.results.every(r => r.passed)).toBe(true)
    })

    it('should reject incorrect solution', () => {
      const challenge = getChallengeById('reverse-string')!
      const wrongCode = 'function reverseString(str) { return str; }'
      
      const validation = validateSolution(challenge, wrongCode)
      expect(validation.passed).toBe(false)
    })

    it('should handle syntax errors', () => {
      const challenge = getChallengeById('reverse-string')!
      const invalidCode = 'function reverseString(str) { return str.split("").reverse( }'
      
      const validation = validateSolution(challenge, invalidCode)
      expect(validation.passed).toBe(false)
    })

    it('should validate array test cases', () => {
      const challenge = getChallengeById('array-sum')!
      const correctCode = 'function sumArray(arr) { return arr.reduce((sum, num) => sum + num, 0); }'
      
      const validation = validateSolution(challenge, correctCode)
      expect(validation.passed).toBe(true)
    })

    it('should validate multiple argument functions', () => {
      const challenge = getChallengeById('two-sum')!
      const correctCode = `function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.has(complement)) {
            return [map.get(complement), i];
          }
          map.set(nums[i], i);
        }
        return [];
      }`
      
      const validation = validateSolution(challenge, correctCode)
      expect(validation.passed).toBe(true)
    })
  })

  describe('Attempt Submission', () => {
    it('should record successful attempt', () => {
      const correctCode = 'function reverseString(str) { return str.split("").reverse().join(""); }'
      const result = submitAttempt('reverse-string', correctCode)
      
      expect(result.success).toBe(true)
      expect(result.validation.passed).toBe(true)
      expect(result.streakInfo).toBeDefined()
      expect(result.streakInfo?.current).toBe(1)

      const progress = loadProgress()
      expect(progress.totalCompleted).toBe(1)
      expect(progress.completedChallenges).toContain('reverse-string')
      expect(progress.attempts.length).toBe(1)
    })

    it('should record failed attempt', () => {
      const wrongCode = 'function reverseString(str) { return str; }'
      const result = submitAttempt('reverse-string', wrongCode)
      
      expect(result.success).toBe(false)
      expect(result.validation.passed).toBe(false)
      expect(result.streakInfo).toBeUndefined()

      const progress = loadProgress()
      expect(progress.totalCompleted).toBe(0)
      expect(progress.attempts.length).toBe(1)
    })

    it('should not double-count same challenge', () => {
      const correctCode = 'function reverseString(str) { return str.split("").reverse().join(""); }'
      
      submitAttempt('reverse-string', correctCode)
      const result2 = submitAttempt('reverse-string', correctCode)
      
      const progress = loadProgress()
      expect(progress.totalCompleted).toBe(1)
      expect(result2.streakInfo?.current).toBe(1)
    })

    it('should update streak for consecutive days', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const progress = loadProgress()
      progress.currentStreak = 1
      progress.longestStreak = 1
      progress.lastCompletedDate = yesterday.toDateString()
      saveProgress(progress)

      const correctCode = 'function isPalindrome(str) { const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, ""); return cleaned === cleaned.split("").reverse().join(""); }'
      const result = submitAttempt('palindrome-check', correctCode)
      
      expect(result.streakInfo?.current).toBe(2)
      expect(result.streakInfo?.longest).toBe(2)
    })

    it('should reset streak for non-consecutive days', () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      
      const progress = loadProgress()
      progress.currentStreak = 5
      progress.longestStreak = 5
      progress.lastCompletedDate = twoDaysAgo.toDateString()
      saveProgress(progress)

      const correctCode = 'function reverseString(str) { return str.split("").reverse().join(""); }'
      const result = submitAttempt('reverse-string', correctCode)
      
      expect(result.streakInfo?.current).toBe(1)
      expect(result.streakInfo?.longest).toBe(5) // Longest doesn't change
    })

    it('should accumulate points for completed challenges', () => {
      const code1 = 'function reverseString(str) { return str.split("").reverse().join(""); }'
      submitAttempt('reverse-string', code1)
      
      const code2 = 'function isPalindrome(str) { const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, ""); return cleaned === cleaned.split("").reverse().join(""); }'
      submitAttempt('palindrome-check', code2)
      
      const progress = loadProgress()
      expect(progress.totalPoints).toBeGreaterThan(0)
      expect(progress.totalCompleted).toBe(2)
    })

    it('should handle invalid challenge ID', () => {
      const result = submitAttempt('invalid-id', 'function() {}')
      expect(result.success).toBe(false)
      expect(result.validation.passed).toBe(false)
    })
  })

  describe('Challenge Content', () => {
    it('should have valid test cases for all challenges', () => {
      const challenges = getAllChallenges()
      
      for (const challenge of challenges) {
        expect(challenge.testCases.length).toBeGreaterThan(0)
        for (const testCase of challenge.testCases) {
          expect(testCase.input).toBeDefined()
          expect(testCase.expectedOutput).toBeDefined()
          expect(testCase.description).toBeDefined()
        }
      }
    })

    it('should have hints for all challenges', () => {
      const challenges = getAllChallenges()
      
      for (const challenge of challenges) {
        expect(challenge.hints.length).toBeGreaterThan(0)
      }
    })

    it('should have points assigned to all challenges', () => {
      const challenges = getAllChallenges()
      
      for (const challenge of challenges) {
        expect(challenge.points).toBeGreaterThan(0)
      }
    })

    it('should have starter code for all challenges', () => {
      const challenges = getAllChallenges()
      
      for (const challenge of challenges) {
        expect(challenge.starterCode).toBeDefined()
        expect(challenge.starterCode.length).toBeGreaterThan(0)
      }
    })

    it('should have valid difficulty levels', () => {
      const challenges = getAllChallenges()
      const validDifficulties = ['easy', 'medium', 'hard']
      
      for (const challenge of challenges) {
        expect(validDifficulties).toContain(challenge.difficulty)
      }
    })
  })
})
