/**
 * Code Quality Dashboard UI
 * 
 * Displays code quality metrics, technical debt analysis,
 * and actionable recommendations in a beautiful dashboard.
 */

import { generateCodeQualityMetrics, getActionableRecommendations, type CodeQualityMetrics } from './codeQuality'
import { notificationManager } from './notificationSystem'
import { trackActivity } from './activityFeed'

/**
 * Create the code quality dashboard UI
 */
export function createCodeQualityUI(
  totalTests: number,
  testFiles: number,
  sourceFiles: number,
  evolutionCount: number
): string {
  const metrics = generateCodeQualityMetrics(totalTests, testFiles, sourceFiles, evolutionCount)
  const recommendations = getActionableRecommendations(metrics)
  
  return `
    <div class="code-quality-section">
      <h2 class="section-title">📊 Code Quality & Technical Debt</h2>
      <p class="section-description">
        Monitor codebase health, track technical debt, and get actionable recommendations for continuous improvement.
      </p>
      
      <!-- Quality Overview Cards -->
      <div class="quality-overview">
        ${createHealthScoreCard(metrics)}
        ${createDebtScoreCard(metrics)}
        ${createTrendCard(metrics)}
      </div>
      
      <!-- Test Coverage Section -->
      <div class="quality-subsection">
        <h3 class="subsection-title">🧪 Test Coverage</h3>
        <div class="coverage-grid">
          ${createCoverageStats(metrics.testCoverage)}
        </div>
      </div>
      
      <!-- Code Health Section -->
      <div class="quality-subsection">
        <h3 class="subsection-title">💚 Code Health</h3>
        <div class="health-grid">
          ${createHealthStats(metrics.codeHealth)}
        </div>
        ${metrics.codeHealth.largeFiles.length > 0 ? createLargeFilesWarning(metrics.codeHealth.largeFiles) : ''}
      </div>
      
      <!-- Technical Debt Section -->
      <div class="quality-subsection">
        <h3 class="subsection-title">⚠️ Technical Debt</h3>
        <div class="debt-summary">
          ${createDebtSummary(metrics.technicalDebt)}
        </div>
      </div>
      
      <!-- Actionable Recommendations -->
      <div class="quality-subsection">
        <h3 class="subsection-title">💡 Actionable Recommendations</h3>
        <div class="recommendations-list">
          ${createRecommendationsList(recommendations)}
        </div>
      </div>
      
      <!-- Trends & Insights -->
      <div class="quality-subsection">
        <h3 class="subsection-title">📈 Trends & Insights</h3>
        <div class="trends-container">
          ${createTrendsView(metrics.trends)}
        </div>
      </div>
    </div>
  `
}

/**
 * Create health score card
 */
function createHealthScoreCard(metrics: CodeQualityMetrics): string {
  const grade = metrics.codeHealth.healthGrade
  const gradeColors: Record<string, string> = {
    A: 'var(--success-color)',
    B: 'var(--info-color)',
    C: 'var(--warning-color)',
    D: 'var(--error-color)',
    F: '#dc2626',
  }
  
  const gradeColor = gradeColors[grade] || 'var(--text-color)'
  
  return `
    <div class="quality-card">
      <div class="quality-card-header">
        <span class="quality-card-icon">💚</span>
        <span class="quality-card-title">Health Grade</span>
      </div>
      <div class="quality-card-value" style="color: ${gradeColor}">
        ${grade}
      </div>
      <div class="quality-card-subtitle">
        Complexity: ${metrics.codeHealth.complexityScore}/100
      </div>
      <div class="quality-progress-bar">
        <div class="quality-progress-fill" style="width: ${metrics.codeHealth.complexityScore}%; background: ${gradeColor}"></div>
      </div>
    </div>
  `
}

/**
 * Create debt score card
 */
function createDebtScoreCard(metrics: CodeQualityMetrics): string {
  const level = metrics.technicalDebt.debtLevel
  const levelColors: Record<string, string> = {
    Low: 'var(--success-color)',
    Medium: 'var(--warning-color)',
    High: 'var(--error-color)',
    Critical: '#dc2626',
  }
  
  const levelColor = levelColors[level] || 'var(--text-color)'
  
  return `
    <div class="quality-card">
      <div class="quality-card-header">
        <span class="quality-card-icon">⚠️</span>
        <span class="quality-card-title">Technical Debt</span>
      </div>
      <div class="quality-card-value" style="color: ${levelColor}">
        ${level}
      </div>
      <div class="quality-card-subtitle">
        Score: ${metrics.technicalDebt.debtScore}/100
      </div>
      <div class="quality-progress-bar">
        <div class="quality-progress-fill" style="width: ${metrics.technicalDebt.debtScore}%; background: ${levelColor}"></div>
      </div>
    </div>
  `
}

/**
 * Create trend card
 */
function createTrendCard(metrics: CodeQualityMetrics): string {
  const direction = metrics.trends.direction
  const trendIcons: Record<string, string> = {
    improving: '📈',
    stable: '➡️',
    declining: '📉',
  }
  
  const trendColors: Record<string, string> = {
    improving: 'var(--success-color)',
    stable: 'var(--info-color)',
    declining: 'var(--error-color)',
  }
  
  const trendLabels: Record<string, string> = {
    improving: 'Improving',
    stable: 'Stable',
    declining: 'Declining',
  }
  
  const icon = trendIcons[direction] || '➡️'
  const color = trendColors[direction] || 'var(--text-color)'
  const label = trendLabels[direction] || 'Unknown'
  
  return `
    <div class="quality-card">
      <div class="quality-card-header">
        <span class="quality-card-icon">${icon}</span>
        <span class="quality-card-title">Trend</span>
      </div>
      <div class="quality-card-value" style="color: ${color}">
        ${label}
      </div>
      <div class="quality-card-subtitle">
        Confidence: ${Math.round(metrics.trends.confidence * 100)}%
      </div>
      <div class="quality-progress-bar">
        <div class="quality-progress-fill" style="width: ${metrics.trends.confidence * 100}%; background: ${color}"></div>
      </div>
    </div>
  `
}

/**
 * Create coverage stats
 */
function createCoverageStats(coverage: CodeQualityMetrics['testCoverage']): string {
  return `
    <div class="stat-mini-card">
      <div class="stat-mini-label">Total Tests</div>
      <div class="stat-mini-value">${coverage.totalTests.toLocaleString()}</div>
    </div>
    <div class="stat-mini-card">
      <div class="stat-mini-label">Test Files</div>
      <div class="stat-mini-value">${coverage.testFiles}</div>
    </div>
    <div class="stat-mini-card">
      <div class="stat-mini-label">Source Files</div>
      <div class="stat-mini-value">${coverage.sourceFiles}</div>
    </div>
    <div class="stat-mini-card">
      <div class="stat-mini-label">Test Density</div>
      <div class="stat-mini-value">${coverage.testDensity}</div>
    </div>
  `
}

/**
 * Create health stats
 */
function createHealthStats(health: CodeQualityMetrics['codeHealth']): string {
  return `
    <div class="stat-mini-card">
      <div class="stat-mini-label">Estimated Lines</div>
      <div class="stat-mini-value">${health.totalLines.toLocaleString()}</div>
    </div>
    <div class="stat-mini-card">
      <div class="stat-mini-label">Avg File Size</div>
      <div class="stat-mini-value">${Math.round(health.avgFileSize)} lines</div>
    </div>
    <div class="stat-mini-card">
      <div class="stat-mini-label">Complexity</div>
      <div class="stat-mini-value">${health.complexityScore}/100</div>
    </div>
    <div class="stat-mini-card">
      <div class="stat-mini-label">Health Grade</div>
      <div class="stat-mini-value">${health.healthGrade}</div>
    </div>
  `
}

/**
 * Create large files warning
 */
function createLargeFilesWarning(largeFiles: Array<{ name: string; estimated: number }>): string {
  const filesList = largeFiles
    .map(file => `<li><code>${file.name}</code> (~${file.estimated} lines)</li>`)
    .join('')
  
  return `
    <div class="large-files-warning">
      <div class="warning-header">
        <span class="warning-icon">📁</span>
        <span class="warning-title">Large Files Detected</span>
      </div>
      <ul class="large-files-list">
        ${filesList}
      </ul>
      <p class="warning-note">
        Consider breaking these files into smaller, focused modules for better maintainability.
      </p>
    </div>
  `
}

/**
 * Create debt summary
 */
function createDebtSummary(debt: CodeQualityMetrics['technicalDebt']): string {
  const issuesHtml = debt.issues.length > 0
    ? `
      <div class="debt-issues">
        <h4 class="debt-issues-title">Issues Identified:</h4>
        <ul class="debt-issues-list">
          ${debt.issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
      </div>
    `
    : '<p class="debt-no-issues">✅ No critical issues detected!</p>'
  
  return `
    <div class="debt-summary-card">
      <div class="debt-level-badge debt-level-${debt.debtLevel.toLowerCase()}">
        ${debt.debtLevel} Debt (${debt.debtScore}/100)
      </div>
      ${issuesHtml}
    </div>
  `
}

/**
 * Create recommendations list
 */
function createRecommendationsList(recommendations: string[]): string {
  if (recommendations.length === 0) {
    return '<p class="no-recommendations">No recommendations at this time. Keep up the great work!</p>'
  }
  
  return `
    <ul class="recommendations">
      ${recommendations.map(rec => `<li class="recommendation-item">${rec}</li>`).join('')}
    </ul>
  `
}

/**
 * Create trends view
 */
function createTrendsView(trends: CodeQualityMetrics['trends']): string {
  return `
    <div class="trends-info">
      ${trends.insights.map(insight => `
        <div class="trend-insight">
          <span class="insight-icon">💡</span>
          <span class="insight-text">${insight}</span>
        </div>
      `).join('')}
    </div>
  `
}

/**
 * Setup code quality dashboard
 */
export function setupCodeQualityDashboard(
  totalTests: number,
  testFiles: number,
  sourceFiles: number,
  evolutionCount: number
): void {
  const container = document.querySelector('#code-quality-section')
  if (!container) {
    console.error('Code quality section container not found')
    return
  }
  
  // Track activity
  trackActivity('section_view', 'Code Quality Dashboard', 'Viewed code quality metrics', {
    totalTests,
    sourceFiles,
  })
  
  // Generate and insert UI
  const ui = createCodeQualityUI(totalTests, testFiles, sourceFiles, evolutionCount)
  container.innerHTML = ui
  
  // Show welcome notification
  const metrics = generateCodeQualityMetrics(totalTests, testFiles, sourceFiles, evolutionCount)
  
  if (metrics.technicalDebt.debtLevel === 'Critical') {
    notificationManager.warning('Critical technical debt detected! Review recommendations.', 5000)
  } else if (metrics.codeHealth.healthGrade === 'A' && metrics.technicalDebt.debtLevel === 'Low') {
    notificationManager.success('Excellent code quality! Keep up the great work.', 3000)
  } else {
    notificationManager.info('Code quality dashboard loaded. Check recommendations for improvements.', 3000)
  }
}
