/**
 * Daily Coding Challenge System
 * Provides rotating daily coding challenges with difficulty levels, solution validation, and streak tracking
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface CodingChallenge {
  id: string
  title: string
  description: string
  difficulty: DifficultyLevel
  category: string
  starterCode: string
  solution: string
  testCases: TestCase[]
  hints: string[]
  points: number
}

export interface TestCase {
  input: string
  expectedOutput: string
  description: string
}

export interface ChallengeAttempt {
  challengeId: string
  code: string
  passed: boolean
  timestamp: number
  executionTime?: number
}

export interface ChallengeProgress {
  currentStreak: number
  longestStreak: number
  totalCompleted: number
  lastCompletedDate: string | null
  completedChallenges: string[]
  attempts: ChallengeAttempt[]
  totalPoints: number
}

/**
 * Get the daily challenge based on current date
 */
export function getDailyChallenge(): CodingChallenge {
  const challenges = getAllChallenges()
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = dayOfYear % challenges.length
  return challenges[index]
}

/**
 * Get challenge by ID
 */
export function getChallengeById(id: string): CodingChallenge | null {
  const challenges = getAllChallenges()
  return challenges.find(c => c.id === id) || null
}

/**
 * Get all available challenges
 */
export function getAllChallenges(): CodingChallenge[] {
  return [
    {
      id: 'reverse-string',
      title: 'Reverse a String',
      description: 'Write a function that takes a string and returns it reversed.',
      difficulty: 'easy',
      category: 'String Manipulation',
      starterCode: 'function reverseString(str) {\n  // Your code here\n}',
      solution: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}',
      testCases: [
        { input: '"hello"', expectedOutput: '"olleh"', description: 'Reverse simple string' },
        { input: '"world"', expectedOutput: '"dlrow"', description: 'Reverse another string' },
        { input: '""', expectedOutput: '""', description: 'Handle empty string' },
        { input: '"a"', expectedOutput: '"a"', description: 'Handle single character' },
      ],
      hints: [
        'Think about array methods',
        'Split the string into characters',
        'Use the reverse() array method',
        'Join the characters back together'
      ],
      points: 10
    },
    {
      id: 'palindrome-check',
      title: 'Palindrome Checker',
      description: 'Write a function that checks if a given string is a palindrome (reads the same forwards and backwards).',
      difficulty: 'easy',
      category: 'String Manipulation',
      starterCode: 'function isPalindrome(str) {\n  // Your code here\n}',
      solution: 'function isPalindrome(str) {\n  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return cleaned === cleaned.split("").reverse().join("");\n}',
      testCases: [
        { input: '"racecar"', expectedOutput: 'true', description: 'Simple palindrome' },
        { input: '"hello"', expectedOutput: 'false', description: 'Not a palindrome' },
        { input: '"A man a plan a canal Panama"', expectedOutput: 'true', description: 'Palindrome with spaces' },
        { input: '"Was it a car or a cat I saw"', expectedOutput: 'true', description: 'Complex palindrome' },
      ],
      hints: [
        'Ignore spaces and punctuation',
        'Convert to lowercase for case-insensitive comparison',
        'Compare the string with its reverse'
      ],
      points: 15
    },
    {
      id: 'fizzbuzz',
      title: 'FizzBuzz',
      description: 'Write a function that prints numbers from 1 to n. For multiples of 3, print "Fizz". For multiples of 5, print "Buzz". For multiples of both, print "FizzBuzz".',
      difficulty: 'easy',
      category: 'Loops & Conditions',
      starterCode: 'function fizzBuzz(n) {\n  // Your code here\n}',
      solution: 'function fizzBuzz(n) {\n  const result = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) result.push("FizzBuzz");\n    else if (i % 3 === 0) result.push("Fizz");\n    else if (i % 5 === 0) result.push("Buzz");\n    else result.push(i.toString());\n  }\n  return result.join(", ");\n}',
      testCases: [
        { input: '5', expectedOutput: '"1, 2, Fizz, 4, Buzz"', description: 'First 5 numbers' },
        { input: '15', expectedOutput: '"1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz"', description: 'First 15 numbers' },
      ],
      hints: [
        'Check divisibility by 15 first',
        'Then check for 3 and 5',
        'Use modulo operator (%)'
      ],
      points: 10
    },
    {
      id: 'array-sum',
      title: 'Sum of Array',
      description: 'Write a function that calculates the sum of all numbers in an array.',
      difficulty: 'easy',
      category: 'Arrays',
      starterCode: 'function sumArray(arr) {\n  // Your code here\n}',
      solution: 'function sumArray(arr) {\n  return arr.reduce((sum, num) => sum + num, 0);\n}',
      testCases: [
        { input: '[1, 2, 3, 4, 5]', expectedOutput: '15', description: 'Sum of positive numbers' },
        { input: '[-1, -2, -3]', expectedOutput: '-6', description: 'Sum of negative numbers' },
        { input: '[]', expectedOutput: '0', description: 'Empty array' },
        { input: '[10]', expectedOutput: '10', description: 'Single element' },
      ],
      hints: [
        'Use the reduce method',
        'Start with an initial value of 0',
        'Add each element to the accumulator'
      ],
      points: 10
    },
    {
      id: 'find-max',
      title: 'Find Maximum',
      description: 'Write a function that finds and returns the maximum number in an array.',
      difficulty: 'easy',
      category: 'Arrays',
      starterCode: 'function findMax(arr) {\n  // Your code here\n}',
      solution: 'function findMax(arr) {\n  if (arr.length === 0) return null;\n  return Math.max(...arr);\n}',
      testCases: [
        { input: '[1, 5, 3, 9, 2]', expectedOutput: '9', description: 'Find max in unsorted array' },
        { input: '[-5, -2, -10, -1]', expectedOutput: '-1', description: 'Find max in negative numbers' },
        { input: '[42]', expectedOutput: '42', description: 'Single element' },
      ],
      hints: [
        'Use Math.max()',
        'Spread operator can help',
        'Consider edge cases like empty arrays'
      ],
      points: 10
    },
    {
      id: 'two-sum',
      title: 'Two Sum',
      description: 'Given an array of integers and a target sum, return indices of the two numbers that add up to the target.',
      difficulty: 'medium',
      category: 'Arrays',
      starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
      solution: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      testCases: [
        { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', description: 'Simple case' },
        { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', description: 'Different indices' },
        { input: '[3, 3], 6', expectedOutput: '[0, 1]', description: 'Duplicate numbers' },
      ],
      hints: [
        'Use a hash map to store seen numbers',
        'Calculate the complement for each number',
        'Check if complement exists in the map',
        'Time complexity should be O(n)'
      ],
      points: 25
    },
    {
      id: 'valid-anagram',
      title: 'Valid Anagram',
      description: 'Write a function to check if two strings are anagrams of each other.',
      difficulty: 'medium',
      category: 'String Manipulation',
      starterCode: 'function isAnagram(s, t) {\n  // Your code here\n}',
      solution: 'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (const char of s) {\n    count[char] = (count[char] || 0) + 1;\n  }\n  for (const char of t) {\n    if (!count[char]) return false;\n    count[char]--;\n  }\n  return true;\n}',
      testCases: [
        { input: '"anagram", "nagaram"', expectedOutput: 'true', description: 'Valid anagram' },
        { input: '"rat", "car"', expectedOutput: 'false', description: 'Not an anagram' },
        { input: '"listen", "silent"', expectedOutput: 'true', description: 'Another valid anagram' },
      ],
      hints: [
        'Check if lengths are equal first',
        'Count character frequencies',
        'Use a hash map or object',
        'Compare character counts'
      ],
      points: 20
    },
    {
      id: 'fibonacci',
      title: 'Fibonacci Sequence',
      description: 'Write a function that returns the nth number in the Fibonacci sequence.',
      difficulty: 'medium',
      category: 'Recursion',
      starterCode: 'function fibonacci(n) {\n  // Your code here\n}',
      solution: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}',
      testCases: [
        { input: '0', expectedOutput: '0', description: 'First Fibonacci number' },
        { input: '1', expectedOutput: '1', description: 'Second Fibonacci number' },
        { input: '6', expectedOutput: '8', description: 'Sixth Fibonacci number' },
        { input: '10', expectedOutput: '55', description: 'Tenth Fibonacci number' },
      ],
      hints: [
        'Base cases: fib(0) = 0, fib(1) = 1',
        'Use iteration for better performance',
        'Avoid recursion without memoization',
        'Keep track of last two numbers'
      ],
      points: 20
    },
    {
      id: 'binary-search',
      title: 'Binary Search',
      description: 'Implement binary search to find a target value in a sorted array. Return the index or -1 if not found.',
      difficulty: 'medium',
      category: 'Algorithms',
      starterCode: 'function binarySearch(arr, target) {\n  // Your code here\n}',
      solution: 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
      testCases: [
        { input: '[1, 2, 3, 4, 5], 3', expectedOutput: '2', description: 'Find element in middle' },
        { input: '[1, 2, 3, 4, 5], 1', expectedOutput: '0', description: 'Find first element' },
        { input: '[1, 2, 3, 4, 5], 5', expectedOutput: '4', description: 'Find last element' },
        { input: '[1, 2, 3, 4, 5], 6', expectedOutput: '-1', description: 'Element not found' },
      ],
      hints: [
        'Array must be sorted',
        'Use two pointers: left and right',
        'Calculate middle index',
        'Adjust pointers based on comparison'
      ],
      points: 25
    },
    {
      id: 'merge-sort',
      title: 'Merge Sort',
      description: 'Implement the merge sort algorithm to sort an array of numbers.',
      difficulty: 'hard',
      category: 'Algorithms',
      starterCode: 'function mergeSort(arr) {\n  // Your code here\n}',
      solution: 'function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] < right[j]) result.push(left[i++]);\n    else result.push(right[j++]);\n  }\n  return result.concat(left.slice(i)).concat(right.slice(j));\n}',
      testCases: [
        { input: '[5, 2, 8, 1, 9]', expectedOutput: '[1, 2, 5, 8, 9]', description: 'Sort unsorted array' },
        { input: '[1, 2, 3]', expectedOutput: '[1, 2, 3]', description: 'Already sorted' },
        { input: '[3, 2, 1]', expectedOutput: '[1, 2, 3]', description: 'Reverse sorted' },
      ],
      hints: [
        'Divide the array into two halves',
        'Recursively sort each half',
        'Merge the sorted halves',
        'Time complexity: O(n log n)'
      ],
      points: 40
    },
    {
      id: 'valid-parentheses',
      title: 'Valid Parentheses',
      description: 'Given a string containing brackets (), {}, [], determine if the input is valid.',
      difficulty: 'medium',
      category: 'Stack',
      starterCode: 'function isValid(s) {\n  // Your code here\n}',
      solution: 'function isValid(s) {\n  const stack = [];\n  const pairs = { "(": ")", "{": "}", "[": "]" };\n  for (const char of s) {\n    if (pairs[char]) {\n      stack.push(char);\n    } else {\n      const last = stack.pop();\n      if (pairs[last] !== char) return false;\n    }\n  }\n  return stack.length === 0;\n}',
      testCases: [
        { input: '"()"', expectedOutput: 'true', description: 'Simple valid case' },
        { input: '"()[]{}"', expectedOutput: 'true', description: 'Multiple types' },
        { input: '"(]"', expectedOutput: 'false', description: 'Mismatched brackets' },
        { input: '"([)]"', expectedOutput: 'false', description: 'Incorrect order' },
        { input: '"{[]}"', expectedOutput: 'true', description: 'Nested brackets' },
      ],
      hints: [
        'Use a stack data structure',
        'Push opening brackets onto stack',
        'Pop when you see a closing bracket',
        'Check if they match'
      ],
      points: 25
    },
    {
      id: 'longest-substring',
      title: 'Longest Substring Without Repeating Characters',
      description: 'Find the length of the longest substring without repeating characters.',
      difficulty: 'hard',
      category: 'String Manipulation',
      starterCode: 'function lengthOfLongestSubstring(s) {\n  // Your code here\n}',
      solution: 'function lengthOfLongestSubstring(s) {\n  const seen = new Map();\n  let maxLen = 0, start = 0;\n  for (let i = 0; i < s.length; i++) {\n    if (seen.has(s[i]) && seen.get(s[i]) >= start) {\n      start = seen.get(s[i]) + 1;\n    }\n    seen.set(s[i], i);\n    maxLen = Math.max(maxLen, i - start + 1);\n  }\n  return maxLen;\n}',
      testCases: [
        { input: '"abcabcbb"', expectedOutput: '3', description: 'Pattern: "abc"' },
        { input: '"bbbbb"', expectedOutput: '1', description: 'All same characters' },
        { input: '"pwwkew"', expectedOutput: '3', description: 'Pattern: "wke"' },
      ],
      hints: [
        'Use sliding window technique',
        'Track characters with a Map',
        'Update window start when duplicate found',
        'Keep track of maximum length'
      ],
      points: 40
    }
  ]
}

/**
 * Load challenge progress from localStorage
 */
export function loadProgress(): ChallengeProgress {
  try {
    const saved = localStorage.getItem('chimera_challenge_progress')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load challenge progress:', error)
  }
  
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    lastCompletedDate: null,
    completedChallenges: [],
    attempts: [],
    totalPoints: 0
  }
}

/**
 * Save challenge progress to localStorage
 */
export function saveProgress(progress: ChallengeProgress): boolean {
  try {
    localStorage.setItem('chimera_challenge_progress', JSON.stringify(progress))
    return true
  } catch (error) {
    console.error('Failed to save challenge progress:', error)
    return false
  }
}

/**
 * Check if today's challenge is completed
 */
export function isTodayChallengeCompleted(): boolean {
  const progress = loadProgress()
  const today = new Date().toDateString()
  return progress.lastCompletedDate === today
}

/**
 * Validate a solution against test cases
 */
export function validateSolution(challenge: CodingChallenge, userCode: string): { 
  passed: boolean
  results: { test: TestCase, passed: boolean, error?: string }[]
} {
  const results: { test: TestCase, passed: boolean, error?: string }[] = []
  
  try {
    // Create a safe evaluation context
    const testFunction = new Function('return ' + userCode)()
    
    for (const testCase of challenge.testCases) {
      try {
        // Parse input - split by comma but respect array/object boundaries
        const args: any[] = []
        let current = ''
        let depth = 0
        
        for (let i = 0; i < testCase.input.length; i++) {
          const char = testCase.input[i]
          if (char === '[' || char === '{' || char === '(') depth++
          if (char === ']' || char === '}' || char === ')') depth--
          
          if (char === ',' && depth === 0) {
            // eval the current argument
            try {
              args.push(eval(current.trim()))
            } catch {
              args.push(current.trim())
            }
            current = ''
          } else {
            current += char
          }
        }
        
        // Don't forget the last argument
        if (current.trim()) {
          try {
            args.push(eval(current.trim()))
          } catch {
            args.push(current.trim())
          }
        }
        
        // Execute function with arguments
        const result = testFunction(...args)
        const expected = eval(testCase.expectedOutput)
        
        // Compare results
        const passed = JSON.stringify(result) === JSON.stringify(expected)
        results.push({ test: testCase, passed })
      } catch (error) {
        results.push({ 
          test: testCase, 
          passed: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  } catch (error) {
    // Syntax error in user code
    results.push({
      test: challenge.testCases[0],
      passed: false,
      error: error instanceof Error ? error.message : 'Syntax error in code'
    })
  }
  
  const allPassed = results.every(r => r.passed)
  return { passed: allPassed, results }
}

/**
 * Submit a challenge attempt
 */
export function submitAttempt(challengeId: string, code: string): {
  success: boolean
  validation: ReturnType<typeof validateSolution>
  streakInfo?: { current: number, longest: number, points: number }
} {
  const challenge = getChallengeById(challengeId)
  if (!challenge) {
    return {
      success: false,
      validation: { passed: false, results: [] }
    }
  }
  
  const validation = validateSolution(challenge, code)
  const progress = loadProgress()
  
  // Record attempt
  const attempt: ChallengeAttempt = {
    challengeId,
    code,
    passed: validation.passed,
    timestamp: Date.now()
  }
  progress.attempts.push(attempt)
  
  // Update progress if passed
  if (validation.passed && !progress.completedChallenges.includes(challengeId)) {
    progress.completedChallenges.push(challengeId)
    progress.totalCompleted++
    progress.totalPoints += challenge.points
    
    // Update streak
    const today = new Date().toDateString()
    const lastDate = progress.lastCompletedDate ? new Date(progress.lastCompletedDate) : null
    
    if (!lastDate) {
      // First completion
      progress.currentStreak = 1
      progress.longestStreak = 1
    } else {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (lastDate.toDateString() === yesterday.toDateString()) {
        // Consecutive day
        progress.currentStreak++
        progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak)
      } else if (lastDate.toDateString() !== today) {
        // Streak broken
        progress.currentStreak = 1
      }
    }
    
    progress.lastCompletedDate = today
  }
  
  saveProgress(progress)
  
  return {
    success: validation.passed,
    validation,
    streakInfo: validation.passed ? {
      current: progress.currentStreak,
      longest: progress.longestStreak,
      points: progress.totalPoints
    } : undefined
  }
}

/**
 * Get challenges by difficulty
 */
export function getChallengesByDifficulty(difficulty: DifficultyLevel): CodingChallenge[] {
  return getAllChallenges().filter(c => c.difficulty === difficulty)
}

/**
 * Get challenges by category
 */
export function getChallengesByCategory(category: string): CodingChallenge[] {
  return getAllChallenges().filter(c => c.category === category)
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(getAllChallenges().map(c => c.category))
  return Array.from(categories)
}

/**
 * Get challenge statistics
 */
export function getChallengeStats(): {
  totalChallenges: number
  byDifficulty: Record<DifficultyLevel, number>
  byCategory: Record<string, number>
} {
  const challenges = getAllChallenges()
  
  const byDifficulty: Record<DifficultyLevel, number> = {
    easy: 0,
    medium: 0,
    hard: 0
  }
  
  const byCategory: Record<string, number> = {}
  
  for (const challenge of challenges) {
    byDifficulty[challenge.difficulty]++
    byCategory[challenge.category] = (byCategory[challenge.category] || 0) + 1
  }
  
  return {
    totalChallenges: challenges.length,
    byDifficulty,
    byCategory
  }
}
