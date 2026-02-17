import { describe, it, expect } from 'vitest';
import {
  detectCodeSmells,
  generateCodeSmellReport,
  filterCodeSmells,
  getCodeSmellStatistics,
  generateRecommendations,
  type CodeSmell,
  type CodeSmellReport
} from './codeSmellDetector';

describe('Code Smell Detector', () => {
  describe('detectCodeSmells', () => {
    it('should detect long functions', () => {
      const code = `
        function longFunction() {
          ${Array(60).fill('  console.log("line");').join('\n')}
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const longFunctionSmells = smells.filter(s => s.type === 'size' && s.title.includes('Long Function'));
      
      expect(longFunctionSmells.length).toBeGreaterThan(0);
      expect(longFunctionSmells[0].severity).toBe('low');
    });
    
    it('should detect very long functions as high severity', () => {
      const code = `
        function veryLongFunction() {
          ${Array(110).fill('  console.log("line");').join('\n')}
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const longFunctionSmells = smells.filter(s => s.type === 'size');
      
      expect(longFunctionSmells.some(s => s.severity === 'high')).toBe(true);
    });
    
    it('should detect complex conditions', () => {
      const code = `
        if (a && b && c && d && e) {
          doSomething();
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const complexSmells = smells.filter(s => s.type === 'complexity' && s.title.includes('Complex Conditional'));
      
      expect(complexSmells.length).toBeGreaterThan(0);
      expect(complexSmells[0].lineNumbers).toBeDefined();
    });
    
    it('should detect very complex conditions as high severity', () => {
      const code = `
        if (a && b || c && d || e && f || g && h) {
          doSomething();
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const complexSmells = smells.filter(s => s.type === 'complexity' && s.title.includes('Complex Conditional'));
      
      expect(complexSmells.some(s => s.severity === 'high')).toBe(true);
    });
    
    it('should detect magic numbers', () => {
      const code = `
        const timeout = 5000;
        const maxRetries = 42;
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const magicSmells = smells.filter(s => s.type === 'naming' && s.title.includes('Magic Numbers'));
      
      expect(magicSmells.length).toBeGreaterThan(0);
    });
    
    it('should not flag common numbers as magic numbers', () => {
      const code = `
        const index = 0;
        const count = 1;
        const notFound = -1;
        const percentage = 100;
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const magicSmells = smells.filter(s => s.title.includes('Magic Numbers'));
      
      expect(magicSmells.length).toBe(0);
    });
    
    it('should detect long parameter lists', () => {
      const code = `
        function complexFunc(a, b, c, d, e, f, g) {
          return a + b + c + d + e + f + g;
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const paramSmells = smells.filter(s => s.title.includes('Too Many Parameters'));
      
      expect(paramSmells.length).toBeGreaterThan(0);
      expect(paramSmells[0].severity).toBe('medium');
    });
    
    it('should detect very long parameter lists as high severity', () => {
      const code = `
        function tooManyParams(a, b, c, d, e, f, g, h, i) {
          return 0;
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const paramSmells = smells.filter(s => s.title.includes('Too Many Parameters'));
      
      expect(paramSmells.some(s => s.severity === 'high')).toBe(true);
    });
    
    it('should detect duplicate code blocks', () => {
      const code = `
        function test1() {
          const x = 1;
          const y = 2;
          const z = 3;
          console.log(x);
          console.log(y);
        }
        
        function test2() {
          const x = 1;
          const y = 2;
          const z = 3;
          console.log(x);
          console.log(y);
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const dupSmells = smells.filter(s => s.type === 'duplication');
      
      expect(dupSmells.length).toBeGreaterThan(0);
      expect(dupSmells[0].severity).toBe('medium');
    });
    
    it('should detect poor naming (single letter variables)', () => {
      const code = `
        const x = getValue();
        const y = calculateResult();
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const namingSmells = smells.filter(s => s.title.includes('Single Letter Variable'));
      
      expect(namingSmells.length).toBeGreaterThan(0);
    });
    
    it('should allow single letter loop variables', () => {
      const code = `
        for (let i = 0; i < 10; i++) {
          console.log(i);
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const namingSmells = smells.filter(s => s.title.includes('Single Letter Variable'));
      
      expect(namingSmells.length).toBe(0);
    });
    
    it('should detect large files', () => {
      const lines = Array(350).fill('const x = 1;');
      const code = lines.join('\n');
      
      const smells = detectCodeSmells(code, 'test.ts');
      const sizeSmells = smells.filter(s => s.title.includes('Large File'));
      
      expect(sizeSmells.length).toBeGreaterThan(0);
      expect(sizeSmells[0].severity).toBe('low');
    });
    
    it('should detect very large files as high severity', () => {
      const lines = Array(650).fill('const x = 1;');
      const code = lines.join('\n');
      
      const smells = detectCodeSmells(code, 'test.ts');
      const sizeSmells = smells.filter(s => s.title.includes('Large File'));
      
      expect(sizeSmells.some(s => s.severity === 'high')).toBe(true);
    });
    
    it('should detect callback hell (deep nesting)', () => {
      const code = `
        function nested() {
          if (true) {
            if (true) {
              if (true) {
                if (true) {
                  if (true) {
                    console.log('too deep');
                  }
                }
              }
            }
          }
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      const nestingSmells = smells.filter(s => s.title.includes('Deep Nesting'));
      
      expect(nestingSmells.length).toBeGreaterThan(0);
    });
    
    it('should return empty array for clean code', () => {
      const code = `
        function cleanFunction() {
          const message = 'Hello';
          return message;
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      
      expect(smells.length).toBe(0);
    });
    
    it('should include all required properties in code smell', () => {
      const code = `
        if (a && b && c && d) {
          doSomething();
        }
      `;
      
      const smells = detectCodeSmells(code, 'test.ts');
      
      if (smells.length > 0) {
        const smell = smells[0];
        expect(smell).toHaveProperty('id');
        expect(smell).toHaveProperty('type');
        expect(smell).toHaveProperty('severity');
        expect(smell).toHaveProperty('title');
        expect(smell).toHaveProperty('description');
        expect(smell).toHaveProperty('location');
        expect(smell).toHaveProperty('suggestion');
        expect(smell).toHaveProperty('impact');
        expect(smell).toHaveProperty('effort');
        expect(smell).toHaveProperty('detectedAt');
      }
    });
  });
  
  describe('generateCodeSmellReport', () => {
    it('should generate comprehensive report', () => {
      const smells: CodeSmell[] = [
        {
          id: '1',
          type: 'complexity',
          severity: 'high',
          title: 'Test',
          description: 'Test',
          location: 'test.ts',
          suggestion: 'Fix it',
          impact: 'Bad',
          effort: 'medium',
          detectedAt: Date.now()
        },
        {
          id: '2',
          type: 'duplication',
          severity: 'medium',
          title: 'Test',
          description: 'Test',
          location: 'test.ts',
          suggestion: 'Fix it',
          impact: 'Bad',
          effort: 'small',
          detectedAt: Date.now()
        }
      ];
      
      const report = generateCodeSmellReport(smells);
      
      expect(report.totalSmells).toBe(2);
      expect(report.byType.complexity).toBe(1);
      expect(report.byType.duplication).toBe(1);
      expect(report.bySeverity.high).toBe(1);
      expect(report.bySeverity.medium).toBe(1);
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
      expect(report.smells).toEqual(smells);
      expect(report.timestamp).toBeDefined();
    });
    
    it('should calculate quality score correctly', () => {
      const criticalSmell: CodeSmell = {
        id: '1',
        type: 'complexity',
        severity: 'critical',
        title: 'Critical',
        description: 'Test',
        location: 'test.ts',
        suggestion: 'Fix',
        impact: 'Bad',
        effort: 'large',
        detectedAt: Date.now()
      };
      
      const report = generateCodeSmellReport([criticalSmell]);
      
      expect(report.score).toBeLessThan(100);
    });
    
    it('should give perfect score for no smells', () => {
      const report = generateCodeSmellReport([]);
      
      expect(report.score).toBe(100);
    });
    
    it('should cap score at 0 for many smells', () => {
      const manySmells: CodeSmell[] = Array(20).fill(null).map((_, i) => ({
        id: `${i}`,
        type: 'complexity',
        severity: 'critical',
        title: 'Test',
        description: 'Test',
        location: 'test.ts',
        suggestion: 'Fix',
        impact: 'Bad',
        effort: 'large',
        detectedAt: Date.now()
      }));
      
      const report = generateCodeSmellReport(manySmells);
      
      expect(report.score).toBe(0);
    });
  });
  
  describe('filterCodeSmells', () => {
    const testSmells: CodeSmell[] = [
      {
        id: '1',
        type: 'complexity',
        severity: 'high',
        title: 'Test 1',
        description: 'Test',
        location: 'test.ts',
        suggestion: 'Fix',
        impact: 'Bad',
        effort: 'medium',
        detectedAt: Date.now()
      },
      {
        id: '2',
        type: 'duplication',
        severity: 'medium',
        title: 'Test 2',
        description: 'Test',
        location: 'test.ts',
        suggestion: 'Fix',
        impact: 'Bad',
        effort: 'small',
        detectedAt: Date.now()
      },
      {
        id: '3',
        type: 'complexity',
        severity: 'low',
        title: 'Test 3',
        description: 'Test',
        location: 'test.ts',
        suggestion: 'Fix',
        impact: 'Bad',
        effort: 'small',
        detectedAt: Date.now()
      }
    ];
    
    it('should filter by type', () => {
      const filtered = filterCodeSmells(testSmells, { type: 'complexity' });
      
      expect(filtered.length).toBe(2);
      expect(filtered.every(s => s.type === 'complexity')).toBe(true);
    });
    
    it('should filter by severity', () => {
      const filtered = filterCodeSmells(testSmells, { severity: 'high' });
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].severity).toBe('high');
    });
    
    it('should filter by minimum severity', () => {
      const filtered = filterCodeSmells(testSmells, { minSeverity: 'medium' });
      
      expect(filtered.length).toBe(2);
      expect(filtered.every(s => s.severity === 'medium' || s.severity === 'high')).toBe(true);
    });
    
    it('should apply multiple filters', () => {
      const filtered = filterCodeSmells(testSmells, { 
        type: 'complexity',
        severity: 'high'
      });
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].type).toBe('complexity');
      expect(filtered[0].severity).toBe('high');
    });
    
    it('should return all smells when no filters applied', () => {
      const filtered = filterCodeSmells(testSmells, {});
      
      expect(filtered.length).toBe(3);
    });
  });
  
  describe('getCodeSmellStatistics', () => {
    it('should extract statistics from report', () => {
      const report: CodeSmellReport = {
        totalSmells: 5,
        byType: { complexity: 3, duplication: 2 },
        bySeverity: { critical: 1, high: 2, medium: 1, low: 1 },
        smells: [],
        score: 75,
        timestamp: Date.now()
      };
      
      const stats = getCodeSmellStatistics(report);
      
      expect(stats.total).toBe(5);
      expect(stats.critical).toBe(1);
      expect(stats.high).toBe(2);
      expect(stats.medium).toBe(1);
      expect(stats.low).toBe(1);
      expect(stats.score).toBe(75);
      expect(stats.timestamp).toBeDefined();
    });
    
    it('should handle missing severity counts', () => {
      const report: CodeSmellReport = {
        totalSmells: 1,
        byType: { complexity: 1 },
        bySeverity: { low: 1 },
        smells: [],
        score: 95,
        timestamp: Date.now()
      };
      
      const stats = getCodeSmellStatistics(report);
      
      expect(stats.critical).toBe(0);
      expect(stats.high).toBe(0);
      expect(stats.medium).toBe(0);
      expect(stats.low).toBe(1);
    });
  });
  
  describe('generateRecommendations', () => {
    it('should recommend addressing critical issues', () => {
      const report: CodeSmellReport = {
        totalSmells: 2,
        byType: {},
        bySeverity: { critical: 2 },
        smells: [],
        score: 50,
        timestamp: Date.now()
      };
      
      const recommendations = generateRecommendations(report);
      
      expect(recommendations.some(r => r.includes('critical'))).toBe(true);
    });
    
    it('should recommend fixing high severity issues', () => {
      const report: CodeSmellReport = {
        totalSmells: 3,
        byType: {},
        bySeverity: { high: 3 },
        smells: [],
        score: 60,
        timestamp: Date.now()
      };
      
      const recommendations = generateRecommendations(report);
      
      expect(recommendations.some(r => r.includes('high-severity'))).toBe(true);
    });
    
    it('should recommend refactoring for duplications', () => {
      const report: CodeSmellReport = {
        totalSmells: 4,
        byType: { duplication: 4 },
        bySeverity: { medium: 4 },
        smells: [],
        score: 70,
        timestamp: Date.now()
      };
      
      const recommendations = generateRecommendations(report);
      
      expect(recommendations.some(r => r.includes('duplicate'))).toBe(true);
    });
    
    it('should recommend simplifying complexity', () => {
      const report: CodeSmellReport = {
        totalSmells: 5,
        byType: { complexity: 5 },
        bySeverity: { medium: 5 },
        smells: [],
        score: 65,
        timestamp: Date.now()
      };
      
      const recommendations = generateRecommendations(report);
      
      expect(recommendations.some(r => r.includes('Simplify'))).toBe(true);
    });
    
    it('should recommend breaking down large structures', () => {
      const report: CodeSmellReport = {
        totalSmells: 3,
        byType: { size: 3 },
        bySeverity: { medium: 3 },
        smells: [],
        score: 75,
        timestamp: Date.now()
      };
      
      const recommendations = generateRecommendations(report);
      
      expect(recommendations.some(r => r.includes('Break down'))).toBe(true);
    });
    
    it('should praise good code quality', () => {
      const report: CodeSmellReport = {
        totalSmells: 1,
        byType: { naming: 1 },
        bySeverity: { low: 1 },
        smells: [],
        score: 90,
        timestamp: Date.now()
      };
      
      const recommendations = generateRecommendations(report);
      
      expect(recommendations.some(r => r.includes('good'))).toBe(true);
    });
    
    it('should warn about poor code quality', () => {
      const report: CodeSmellReport = {
        totalSmells: 10,
        byType: { complexity: 5, duplication: 5 },
        bySeverity: { high: 10 },
        smells: [],
        score: 40,
        timestamp: Date.now()
      };
      
      const recommendations = generateRecommendations(report);
      
      expect(recommendations.some(r => r.includes('needs attention'))).toBe(true);
    });
  });
});
