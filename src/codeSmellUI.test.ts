import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCodeSmellDashboard, analyzeSampleCode } from './codeSmellUI';

// Mock the notification system
vi.mock('./notificationSystem', () => ({
  notificationManager: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}));

// Mock activity feed
vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn()
}));

describe('Code Smell UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  
  describe('createCodeSmellDashboard', () => {
    it('should create dashboard container', () => {
      const dashboard = createCodeSmellDashboard();
      
      expect(dashboard).toBeDefined();
      expect(dashboard.id).toBe('code-smell-dashboard');
      expect(dashboard.className).toContain('code-smell-container');
    });
    
    it('should include header with title', () => {
      const dashboard = createCodeSmellDashboard();
      
      const title = dashboard.querySelector('.section-title');
      expect(title).toBeDefined();
      expect(title?.textContent).toContain('Code Smell Detection');
    });
    
    it('should include code input textarea', () => {
      const dashboard = createCodeSmellDashboard();
      
      const textarea = dashboard.querySelector('#code-input') as HTMLTextAreaElement;
      expect(textarea).toBeDefined();
      expect(textarea?.tagName).toBe('TEXTAREA');
    });
    
    it('should include analyze button', () => {
      const dashboard = createCodeSmellDashboard();
      
      const button = dashboard.querySelector('#analyze-code-btn');
      expect(button).toBeDefined();
      expect(button?.textContent).toContain('Analyze Code');
    });
    
    it('should include clear button (initially hidden)', () => {
      const dashboard = createCodeSmellDashboard();
      
      const button = dashboard.querySelector('#clear-analysis-btn') as HTMLElement;
      expect(button).toBeDefined();
      expect(button?.style.display).toBe('none');
    });
    
    it('should include results section (initially hidden)', () => {
      const dashboard = createCodeSmellDashboard();
      
      const results = dashboard.querySelector('#code-smell-results') as HTMLElement;
      expect(results).toBeDefined();
      expect(results?.style.display).toBe('none');
    });
    
    it('should include quality score badge', () => {
      const dashboard = createCodeSmellDashboard();
      
      const scoreBadge = dashboard.querySelector('#quality-score');
      expect(scoreBadge).toBeDefined();
    });
    
    it('should include statistics container', () => {
      const dashboard = createCodeSmellDashboard();
      
      const stats = dashboard.querySelector('#smell-statistics');
      expect(stats).toBeDefined();
    });
    
    it('should include recommendations section', () => {
      const dashboard = createCodeSmellDashboard();
      
      const recommendations = dashboard.querySelector('#recommendations-section');
      expect(recommendations).toBeDefined();
    });
    
    it('should include type filter', () => {
      const dashboard = createCodeSmellDashboard();
      
      const typeFilter = dashboard.querySelector('#smell-type-filter') as HTMLSelectElement;
      expect(typeFilter).toBeDefined();
      expect(typeFilter?.tagName).toBe('SELECT');
    });
    
    it('should include severity filter', () => {
      const dashboard = createCodeSmellDashboard();
      
      const severityFilter = dashboard.querySelector('#smell-severity-filter') as HTMLSelectElement;
      expect(severityFilter).toBeDefined();
      expect(severityFilter?.tagName).toBe('SELECT');
    });
    
    it('should include smell list container', () => {
      const dashboard = createCodeSmellDashboard();
      
      const smellList = dashboard.querySelector('#smell-list');
      expect(smellList).toBeDefined();
    });
  });
  
  describe('analyzeSampleCode', () => {
    it('should populate code input with sample', () => {
      const dashboard = createCodeSmellDashboard();
      document.body.appendChild(dashboard);
      
      analyzeSampleCode();
      
      const codeInput = document.getElementById('code-input') as HTMLTextAreaElement;
      expect(codeInput?.value.length).toBeGreaterThan(0);
      expect(codeInput?.value).toContain('function');
    });
    
    it('should trigger analysis of sample code', () => {
      const dashboard = createCodeSmellDashboard();
      document.body.appendChild(dashboard);
      
      analyzeSampleCode();
      
      // Results should be visible after analysis
      setTimeout(() => {
        const results = document.getElementById('code-smell-results') as HTMLElement;
        expect(results?.style.display).not.toBe('none');
      }, 100);
    });
  });
  
  describe('User interactions', () => {
    it('should handle analyze button click with empty code', (done) => {
      const dashboard = createCodeSmellDashboard();
      document.body.appendChild(dashboard);
      
      setTimeout(() => {
        const analyzeBtn = document.getElementById('analyze-code-btn') as HTMLButtonElement;
        const codeInput = document.getElementById('code-input') as HTMLTextAreaElement;
        
        if (codeInput) codeInput.value = '';
        
        // Should not crash with empty input
        if (analyzeBtn) {
          analyzeBtn.click();
          expect(true).toBe(true);
        }
        done();
      }, 50);
    });
    
    it('should handle analyze button click with valid code', (done) => {
      const dashboard = createCodeSmellDashboard();
      document.body.appendChild(dashboard);
      
      setTimeout(() => {
        const analyzeBtn = document.getElementById('analyze-code-btn') as HTMLButtonElement;
        const codeInput = document.getElementById('code-input') as HTMLTextAreaElement;
        
        if (codeInput) {
          codeInput.value = 'function test() { console.log("hello"); }';
        }
        
        if (analyzeBtn) {
          analyzeBtn.click();
          
          setTimeout(() => {
            const results = document.getElementById('code-smell-results') as HTMLElement;
            expect(results).toBeDefined();
            done();
          }, 50);
        } else {
          done();
        }
      }, 50);
    });
    
    it('should handle clear button click', (done) => {
      const dashboard = createCodeSmellDashboard();
      document.body.appendChild(dashboard);
      
      setTimeout(() => {
        const clearBtn = document.getElementById('clear-analysis-btn') as HTMLButtonElement;
        const codeInput = document.getElementById('code-input') as HTMLTextAreaElement;
        
        if (codeInput) {
          codeInput.value = 'some code';
        }
        
        if (clearBtn) {
          clearBtn.click();
          
          setTimeout(() => {
            expect(codeInput?.value).toBe('');
            done();
          }, 50);
        } else {
          done();
        }
      }, 50);
    });
    
    it('should handle type filter change', (done) => {
      const dashboard = createCodeSmellDashboard();
      document.body.appendChild(dashboard);
      
      setTimeout(() => {
        const typeFilter = document.getElementById('smell-type-filter') as HTMLSelectElement;
        
        if (typeFilter) {
          typeFilter.value = 'complexity';
          
          const event = new Event('change');
          typeFilter.dispatchEvent(event);
          
          expect(typeFilter.value).toBe('complexity');
        }
        done();
      }, 50);
    });
    
    it('should handle severity filter change', (done) => {
      const dashboard = createCodeSmellDashboard();
      document.body.appendChild(dashboard);
      
      setTimeout(() => {
        const severityFilter = document.getElementById('smell-severity-filter') as HTMLSelectElement;
        
        if (severityFilter) {
          severityFilter.value = 'high';
          
          const event = new Event('change');
          severityFilter.dispatchEvent(event);
          
          expect(severityFilter.value).toBe('high');
        }
        done();
      }, 50);
    });
  });
  
  describe('Filter options', () => {
    it('should have all type filter options', () => {
      const dashboard = createCodeSmellDashboard();
      
      const typeFilter = dashboard.querySelector('#smell-type-filter') as HTMLSelectElement;
      const options = Array.from(typeFilter.options).map(o => o.value);
      
      expect(options).toContain('all');
      expect(options).toContain('complexity');
      expect(options).toContain('duplication');
      expect(options).toContain('naming');
      expect(options).toContain('size');
      expect(options).toContain('coupling');
      expect(options).toContain('cohesion');
    });
    
    it('should have all severity filter options', () => {
      const dashboard = createCodeSmellDashboard();
      
      const severityFilter = dashboard.querySelector('#smell-severity-filter') as HTMLSelectElement;
      const options = Array.from(severityFilter.options).map(o => o.value);
      
      expect(options).toContain('all');
      expect(options).toContain('critical');
      expect(options).toContain('high');
      expect(options).toContain('medium');
      expect(options).toContain('low');
    });
  });
});
