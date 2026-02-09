import { describe, it, expect } from 'vitest'
import {
  calculateTestCoverage,
  analyzeCodeHealth,
  assessTechnicalDebt,
  analyzeTrends,
  generateCodeQualityMetrics,
  getActionableRecommendations,
  type CodeQualityMetrics,
} from './codeQuality'

describe('Code Quality Analyzer', () => {
  describe('calculateTestCoverage', () => {
    it('should calculate coverage metrics correctly', () => {
      const result = calculateTestCoverage(919, 43, 43)
      
      expect(result.totalTests).toBe(919)
      expect(result.testFiles).toBe(43)
      expect(result.sourceFiles).toBe(43)
      expect(result.coverageRatio).toBeCloseTo(21.37, 1)
      expect(result.testDensity).toBe('21.4 tests/file')
    })
    
    it('should handle zero source files', () => {
      const result = calculateTestCoverage(100, 10, 0)
      
      expect(result.coverageRatio).toBe(0)
      expect(result.testDensity).toBe('0.0 tests/file')
    })
    
    it('should handle low coverage', () => {
      const result = calculateTestCoverage(50, 5, 20)
      
      expect(result.coverageRatio).toBe(2.5)
      expect(result.testDensity).toBe('2.5 tests/file')
    })
    
    it('should handle high coverage', () => {
      const result = calculateTestCoverage(1000, 50, 40)
      
      expect(result.coverageRatio).toBe(25)
      expect(result.testDensity).toBe('25.0 tests/file')
    })
  })
  
  describe('analyzeCodeHealth', () => {
    it('should analyze code health for small codebase', () => {
      const result = analyzeCodeHealth(20, 100, 5)
      
      expect(result.avgFileSize).toBe(100)
      expect(result.complexityScore).toBe(20)
      expect(result.healthGrade).toBe('A')
      expect(result.largeFiles).toHaveLength(0)
    })
    
    it('should analyze code health for medium codebase', () => {
      const result = analyzeCodeHealth(43, 300, 15)
      
      expect(result.avgFileSize).toBe(300)
      expect(result.complexityScore).toBe(60)
      expect(result.healthGrade).toBe('C')
      expect(result.largeFiles.length).toBeGreaterThan(0)
    })
    
    it('should analyze code health for large codebase', () => {
      const result = analyzeCodeHealth(80, 500, 20)
      
      expect(result.avgFileSize).toBe(500)
      expect(result.complexityScore).toBeGreaterThan(80)
      expect(result.healthGrade).toBe('F')
      expect(result.largeFiles).toHaveLength(2)
    })
    
    it('should assign grade A for low complexity', () => {
      const result = analyzeCodeHealth(30, 120, 5)
      expect(result.healthGrade).toBe('A')
    })
    
    it('should assign grade B for moderate complexity', () => {
      const result = analyzeCodeHealth(40, 200, 10)
      expect(result.healthGrade).toBe('B')
    })
    
    it('should assign grade C for medium-high complexity', () => {
      const result = analyzeCodeHealth(50, 300, 15)
      expect(result.healthGrade).toBe('C')
    })
    
    it('should assign grade D for high complexity', () => {
      const result = analyzeCodeHealth(60, 450, 18)
      expect(result.healthGrade).toBe('D')
    })
    
    it('should assign grade F for very high complexity', () => {
      const result = analyzeCodeHealth(90, 650, 25)
      expect(result.healthGrade).toBe('F')
    })
    
    it('should identify large files based on evolution count', () => {
      const result1 = analyzeCodeHealth(40, 200, 5)
      expect(result1.largeFiles).toHaveLength(0)
      
      const result2 = analyzeCodeHealth(40, 200, 12)
      expect(result2.largeFiles).toHaveLength(1)
      
      const result3 = analyzeCodeHealth(40, 200, 20)
      expect(result3.largeFiles).toHaveLength(2)
    })
  })
  
  describe('assessTechnicalDebt', () => {
    it('should assess low technical debt', () => {
      const coverage = calculateTestCoverage(500, 25, 25)
      const health = analyzeCodeHealth(25, 150, 10)
      const result = assessTechnicalDebt(coverage, health)
      
      expect(result.debtLevel).toBe('Low')
      expect(result.debtScore).toBeLessThan(20)
      expect(result.issues).toHaveLength(0)
    })
    
    it('should assess medium technical debt', () => {
      const coverage = calculateTestCoverage(500, 25, 30)
      const health = analyzeCodeHealth(30, 250, 12)
      const result = assessTechnicalDebt(coverage, health)
      
      expect(result.debtLevel).toBe('Medium')
      expect(result.debtScore).toBeGreaterThanOrEqual(20)
      expect(result.debtScore).toBeLessThan(40)
    })
    
    it('should assess high technical debt', () => {
      const coverage = calculateTestCoverage(200, 20, 40)
      const health = analyzeCodeHealth(40, 500, 20)
      const result = assessTechnicalDebt(coverage, health)
      
      expect(result.debtLevel).toBe('High')
      expect(result.debtScore).toBeGreaterThanOrEqual(40)
      expect(result.issues.length).toBeGreaterThan(0)
    })
    
    it('should identify low test coverage issues', () => {
      const coverage = calculateTestCoverage(100, 10, 20)
      const health = analyzeCodeHealth(20, 150, 5)
      const result = assessTechnicalDebt(coverage, health)
      
      expect(result.issues).toContain('Low test coverage ratio')
      expect(result.recommendations.some(r => r.includes('tests'))).toBe(true)
    })
    
    it('should identify high complexity issues', () => {
      const coverage = calculateTestCoverage(500, 25, 25)
      const health = analyzeCodeHealth(80, 500, 20)
      const result = assessTechnicalDebt(coverage, health)
      
      expect(result.issues).toContain('High code complexity detected')
      expect(result.recommendations.some(r => r.includes('refactoring'))).toBe(true)
    })
    
    it('should identify large file issues', () => {
      const coverage = calculateTestCoverage(500, 25, 25)
      const health = {
        totalLines: 10000,
        avgFileSize: 300,
        largeFiles: [
          { name: 'file1.ts', estimated: 800 },
          { name: 'file2.ts', estimated: 900 },
          { name: 'file3.ts', estimated: 1000 },
          { name: 'file4.ts', estimated: 1100 },
        ],
        complexityScore: 50,
        healthGrade: 'C' as const,
      }
      const result = assessTechnicalDebt(coverage, health)
      
      expect(result.issues.some(i => i.includes('large files'))).toBe(true)
      expect(result.recommendations.some(r => r.includes('Break down'))).toBe(true)
    })
    
    it('should provide recommendations for borderline cases', () => {
      const coverage = calculateTestCoverage(380, 20, 20)
      const health = analyzeCodeHealth(30, 280, 12)
      const result = assessTechnicalDebt(coverage, health)
      
      expect(result.recommendations.length).toBeGreaterThan(0)
    })
  })
  
  describe('analyzeTrends', () => {
    it('should identify improving trend', () => {
      const result = analyzeTrends(20, 35, 15)
      
      expect(result.direction).toBe('improving')
      expect(result.confidence).toBeGreaterThan(0.7)
      expect(result.insights.length).toBeGreaterThan(0)
    })
    
    it('should identify stable trend', () => {
      const result = analyzeTrends(35, 55, 20)
      
      expect(result.direction).toBe('stable')
      expect(result.insights.length).toBeGreaterThan(0)
    })
    
    it('should identify declining trend', () => {
      const result = analyzeTrends(65, 75, 25)
      
      expect(result.direction).toBe('declining')
      expect(result.confidence).toBeGreaterThan(0.7)
      expect(result.insights.some(i => i.includes('debt'))).toBe(true)
    })
    
    it('should calculate evolution velocity', () => {
      const result = analyzeTrends(30, 40, 21)
      
      expect(result.insights.some(i => i.includes('velocity'))).toBe(true)
      expect(result.insights.some(i => i.includes('features/week'))).toBe(true)
    })
    
    it('should provide complexity insights', () => {
      const result1 = analyzeTrends(20, 35, 10)
      expect(result1.insights.some(i => i.includes('Excellent'))).toBe(true)
      
      const result2 = analyzeTrends(30, 55, 15)
      expect(result2.insights.some(i => i.includes('Good'))).toBe(true)
      
      const result3 = analyzeTrends(40, 75, 20)
      expect(result3.insights.some(i => i.includes('Watch'))).toBe(true)
    })
    
    it('should provide debt insights', () => {
      const result1 = analyzeTrends(25, 40, 10)
      expect(result1.insights.some(i => i.includes('Strong code quality'))).toBe(true)
      
      const result2 = analyzeTrends(45, 55, 15)
      expect(result2.insights.some(i => i.includes('Moderate'))).toBe(true)
      
      const result3 = analyzeTrends(65, 70, 20)
      expect(result3.insights.some(i => i.includes('High technical debt'))).toBe(true)
    })
  })
  
  describe('generateCodeQualityMetrics', () => {
    it('should generate comprehensive metrics', () => {
      const result = generateCodeQualityMetrics(919, 43, 43, 22)
      
      expect(result.testCoverage).toBeDefined()
      expect(result.codeHealth).toBeDefined()
      expect(result.technicalDebt).toBeDefined()
      expect(result.trends).toBeDefined()
    })
    
    it('should have all required testCoverage fields', () => {
      const result = generateCodeQualityMetrics(500, 25, 25, 15)
      
      expect(result.testCoverage.totalTests).toBe(500)
      expect(result.testCoverage.testFiles).toBe(25)
      expect(result.testCoverage.sourceFiles).toBe(25)
      expect(result.testCoverage.coverageRatio).toBeDefined()
      expect(result.testCoverage.testDensity).toBeDefined()
    })
    
    it('should have all required codeHealth fields', () => {
      const result = generateCodeQualityMetrics(500, 25, 25, 15)
      
      expect(result.codeHealth.totalLines).toBeDefined()
      expect(result.codeHealth.avgFileSize).toBeDefined()
      expect(result.codeHealth.largeFiles).toBeInstanceOf(Array)
      expect(result.codeHealth.complexityScore).toBeDefined()
      expect(result.codeHealth.healthGrade).toBeDefined()
    })
    
    it('should have all required technicalDebt fields', () => {
      const result = generateCodeQualityMetrics(500, 25, 25, 15)
      
      expect(result.technicalDebt.debtScore).toBeDefined()
      expect(result.technicalDebt.debtLevel).toBeDefined()
      expect(result.technicalDebt.issues).toBeInstanceOf(Array)
      expect(result.technicalDebt.recommendations).toBeInstanceOf(Array)
    })
    
    it('should have all required trends fields', () => {
      const result = generateCodeQualityMetrics(500, 25, 25, 15)
      
      expect(result.trends.direction).toBeDefined()
      expect(result.trends.confidence).toBeDefined()
      expect(result.trends.insights).toBeInstanceOf(Array)
    })
  })
  
  describe('getActionableRecommendations', () => {
    it('should provide urgent recommendation for critical debt', () => {
      const metrics: CodeQualityMetrics = {
        testCoverage: calculateTestCoverage(100, 10, 30),
        codeHealth: analyzeCodeHealth(80, 600, 25),
        technicalDebt: {
          debtScore: 80,
          debtLevel: 'Critical',
          issues: ['Multiple issues'],
          recommendations: ['Fix issues'],
        },
        trends: analyzeTrends(80, 85, 25),
      }
      
      const result = getActionableRecommendations(metrics)
      
      expect(result.some(r => r.includes('URGENT'))).toBe(true)
    })
    
    it('should recommend refactoring for poor health grade', () => {
      const metrics: CodeQualityMetrics = {
        testCoverage: calculateTestCoverage(300, 20, 30),
        codeHealth: {
          totalLines: 15000,
          avgFileSize: 500,
          largeFiles: [],
          complexityScore: 85,
          healthGrade: 'D',
        },
        technicalDebt: assessTechnicalDebt(
          calculateTestCoverage(300, 20, 30),
          { totalLines: 15000, avgFileSize: 500, largeFiles: [], complexityScore: 85, healthGrade: 'D' }
        ),
        trends: analyzeTrends(50, 85, 20),
      }
      
      const result = getActionableRecommendations(metrics)
      
      expect(result.some(r => r.includes('health is concerning'))).toBe(true)
    })
    
    it('should recommend adding tests for low coverage', () => {
      const metrics: CodeQualityMetrics = {
        testCoverage: calculateTestCoverage(100, 10, 25),
        codeHealth: analyzeCodeHealth(25, 200, 10),
        technicalDebt: assessTechnicalDebt(
          calculateTestCoverage(100, 10, 25),
          analyzeCodeHealth(25, 200, 10)
        ),
        trends: analyzeTrends(30, 40, 10),
      }
      
      const result = getActionableRecommendations(metrics)
      
      expect(result.some(r => r.includes('tests'))).toBe(true)
    })
    
    it('should recommend refactoring for large files', () => {
      const metrics: CodeQualityMetrics = {
        testCoverage: calculateTestCoverage(500, 25, 25),
        codeHealth: {
          totalLines: 10000,
          avgFileSize: 300,
          largeFiles: [
            { name: 'file1.ts', estimated: 800 },
            { name: 'file2.ts', estimated: 900 },
            { name: 'file3.ts', estimated: 1000 },
          ],
          complexityScore: 50,
          healthGrade: 'B',
        },
        technicalDebt: {
          debtScore: 30,
          debtLevel: 'Medium',
          issues: [],
          recommendations: [],
        },
        trends: analyzeTrends(30, 50, 15),
      }
      
      const result = getActionableRecommendations(metrics)
      
      expect(result.some(r => r.includes('large files'))).toBe(true)
    })
    
    it('should recommend complexity reduction for high complexity', () => {
      const metrics: CodeQualityMetrics = {
        testCoverage: calculateTestCoverage(500, 25, 25),
        codeHealth: {
          totalLines: 12000,
          avgFileSize: 400,
          largeFiles: [],
          complexityScore: 70,
          healthGrade: 'C',
        },
        technicalDebt: assessTechnicalDebt(
          calculateTestCoverage(500, 25, 25),
          { totalLines: 12000, avgFileSize: 400, largeFiles: [], complexityScore: 70, healthGrade: 'C' }
        ),
        trends: analyzeTrends(40, 70, 18),
      }
      
      const result = getActionableRecommendations(metrics)
      
      expect(result.some(r => r.includes('complexity'))).toBe(true)
    })
    
    it('should provide positive reinforcement for excellent quality', () => {
      const metrics: CodeQualityMetrics = {
        testCoverage: calculateTestCoverage(600, 30, 30),
        codeHealth: {
          totalLines: 5000,
          avgFileSize: 150,
          largeFiles: [],
          complexityScore: 25,
          healthGrade: 'A',
        },
        technicalDebt: {
          debtScore: 10,
          debtLevel: 'Low',
          issues: [],
          recommendations: [],
        },
        trends: analyzeTrends(10, 25, 15),
      }
      
      const result = getActionableRecommendations(metrics)
      
      expect(result.some(r => r.includes('Excellent'))).toBe(true)
    })
    
    it('should include technical debt recommendations', () => {
      const techDebt = {
        debtScore: 35,
        debtLevel: 'Medium' as const,
        issues: ['Issue 1'],
        recommendations: ['Custom recommendation 1', 'Custom recommendation 2'],
      }
      
      const metrics: CodeQualityMetrics = {
        testCoverage: calculateTestCoverage(400, 20, 25),
        codeHealth: analyzeCodeHealth(25, 250, 12),
        technicalDebt: techDebt,
        trends: analyzeTrends(35, 50, 12),
      }
      
      const result = getActionableRecommendations(metrics)
      
      expect(result).toContain('Custom recommendation 1')
      expect(result).toContain('Custom recommendation 2')
    })
  })
})
