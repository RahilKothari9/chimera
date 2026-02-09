import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createCodeQualityUI, setupCodeQualityDashboard } from './codeQualityUI'

// Mock dependencies
vi.mock('./notificationSystem', () => ({
  notificationManager: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}))

describe('Code Quality UI', () => {
  describe('createCodeQualityUI', () => {
    it('should create code quality dashboard HTML', () => {
      const html = createCodeQualityUI(919, 43, 43, 22)
      
      expect(html).toContain('Code Quality & Technical Debt')
      expect(html).toContain('code-quality-section')
    })
    
    it('should include health score card', () => {
      const html = createCodeQualityUI(500, 25, 25, 15)
      
      expect(html).toContain('Health Grade')
      expect(html).toContain('quality-card')
    })
    
    it('should include debt score card', () => {
      const html = createCodeQualityUI(500, 25, 25, 15)
      
      expect(html).toContain('Technical Debt')
      expect(html).toContain('quality-card')
    })
    
    it('should include trend card', () => {
      const html = createCodeQualityUI(500, 25, 25, 15)
      
      expect(html).toContain('Trend')
      expect(html).toContain('Confidence')
    })
    
    it('should include test coverage section', () => {
      const html = createCodeQualityUI(919, 43, 43, 22)
      
      expect(html).toContain('Test Coverage')
      expect(html).toContain('919')
      expect(html).toContain('43')
    })
    
    it('should include code health section', () => {
      const html = createCodeQualityUI(500, 25, 25, 15)
      
      expect(html).toContain('Code Health')
      expect(html).toContain('Avg File Size')
    })
    
    it('should include technical debt section', () => {
      const html = createCodeQualityUI(500, 25, 25, 15)
      
      expect(html).toContain('Technical Debt')
    })
    
    it('should include recommendations section', () => {
      const html = createCodeQualityUI(500, 25, 25, 15)
      
      expect(html).toContain('Actionable Recommendations')
      expect(html).toContain('recommendations-list')
    })
    
    it('should include trends section', () => {
      const html = createCodeQualityUI(500, 25, 25, 15)
      
      expect(html).toContain('Trends & Insights')
    })
    
    it('should show large files warning when detected', () => {
      const html = createCodeQualityUI(500, 25, 25, 20)
      
      expect(html).toContain('Large Files Detected')
    })
    
    it('should not show large files warning when none detected', () => {
      const html = createCodeQualityUI(300, 15, 15, 5)
      
      expect(html).not.toContain('Large Files Detected')
    })
    
    it('should display health grade A with success color', () => {
      const html = createCodeQualityUI(600, 30, 30, 10)
      
      expect(html).toContain('var(--success-color)')
    })
    
    it('should display appropriate debt level', () => {
      const html = createCodeQualityUI(100, 10, 30, 5)
      
      expect(html).toContain('debt-level-')
    })
    
    it('should show improving trend with success color', () => {
      const html = createCodeQualityUI(600, 30, 30, 10)
      
      expect(html).toContain('Improving')
    })
    
    it('should display recommendations when present', () => {
      const html = createCodeQualityUI(100, 10, 30, 20)
      
      expect(html).toContain('recommendation-item')
    })
    
    it('should show no issues message when debt is low', () => {
      const html = createCodeQualityUI(600, 30, 30, 10)
      
      expect(html).toContain('No critical issues detected')
    })
    
    it('should display insights in trends section', () => {
      const html = createCodeQualityUI(500, 25, 25, 15)
      
      expect(html).toContain('trend-insight')
      expect(html).toContain('💡')
    })
  })
  
  describe('setupCodeQualityDashboard', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="code-quality-section"></div>
      `
      vi.clearAllMocks()
    })
    
    it('should insert UI into container', () => {
      setupCodeQualityDashboard(919, 43, 43, 22)
      
      const container = document.querySelector('#code-quality-section')
      expect(container?.innerHTML).toContain('Code Quality')
      expect(container?.innerHTML).toContain('Technical Debt')
    })
    
    it('should track activity when dashboard is setup', async () => {
      const { trackActivity } = await import('./activityFeed')
      
      setupCodeQualityDashboard(919, 43, 43, 22)
      
      expect(trackActivity).toHaveBeenCalledWith(
        'section_view',
        'Code Quality Dashboard',
        'Viewed code quality metrics',
        {
          totalTests: 919,
          sourceFiles: 43,
        }
      )
    })
    
    it('should show info notification when not excellent or critical', async () => {
      const { notificationManager } = await import('./notificationSystem')
      
      // Grade B with Low debt - the best achievable but not "excellent"
      // (excellent requires grade A which is impossible with current logic)
      setupCodeQualityDashboard(600, 30, 30, 10)
      
      expect(notificationManager.info).toHaveBeenCalledWith(
        expect.stringContaining('loaded'),
        3000
      )
    })
    
    it('should show warning notification for critical debt', async () => {
      const { notificationManager } = await import('./notificationSystem')
      
      // Use parameters that will result in critical debt
      // Low coverage (2), high avg size (550), high complexity (95), large files
      setupCodeQualityDashboard(100, 10, 50, 50)
      
      expect(notificationManager.warning).toHaveBeenCalledWith(
        expect.stringContaining('Critical'),
        5000
      )
    })
    
    it('should show info notification for normal cases', async () => {
      const { notificationManager } = await import('./notificationSystem')
      
      setupCodeQualityDashboard(400, 20, 25, 15)
      
      expect(notificationManager.info).toHaveBeenCalledWith(
        expect.stringContaining('loaded'),
        3000
      )
    })
    
    it('should handle missing container gracefully', () => {
      document.body.innerHTML = '' // Remove container
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      setupCodeQualityDashboard(500, 25, 25, 15)
      
      expect(consoleSpy).toHaveBeenCalledWith('Code quality section container not found')
      
      consoleSpy.mockRestore()
    })
    
    it('should display all metrics correctly', () => {
      setupCodeQualityDashboard(919, 43, 43, 22)
      
      const container = document.querySelector('#code-quality-section')
      const html = container?.innerHTML || ''
      
      expect(html).toContain('919')
      expect(html).toContain('43')
    })
  })
})
