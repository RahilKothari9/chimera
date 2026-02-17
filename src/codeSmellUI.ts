/**
 * Code Smell Detection UI
 * 
 * Provides a visual dashboard for viewing and analyzing detected code smells
 */

import {
  detectCodeSmells,
  generateCodeSmellReport,
  filterCodeSmells,
  getCodeSmellStatistics,
  generateRecommendations,
  type CodeSmell,
  type CodeSmellReport
} from './codeSmellDetector';
import { trackActivity } from './activityFeed';
import { notificationManager } from './notificationSystem';

let currentReport: CodeSmellReport | null = null;

/**
 * Creates the code smell dashboard UI
 */
export function createCodeSmellDashboard(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'code-smell-dashboard';
  container.className = 'code-smell-container';
  
  container.innerHTML = `
    <div class="code-smell-header">
      <h2 class="section-title">🔍 Code Smell Detection</h2>
      <p class="code-smell-subtitle">Analyze code for common anti-patterns and refactoring opportunities</p>
    </div>
    
    <div class="code-smell-analyzer">
      <div class="analyzer-input">
        <label for="code-input" class="analyzer-label">Enter code to analyze:</label>
        <textarea 
          id="code-input" 
          class="code-input-area" 
          placeholder="Paste your TypeScript/JavaScript code here..."
          rows="10"
        ></textarea>
      </div>
      
      <div class="analyzer-actions">
        <button id="analyze-code-btn" class="analyze-button">
          🔬 Analyze Code
        </button>
        <button id="clear-analysis-btn" class="clear-button" style="display: none;">
          🗑️ Clear
        </button>
      </div>
    </div>
    
    <div id="code-smell-results" class="code-smell-results" style="display: none;">
      <div class="results-header">
        <h3 class="results-title">Analysis Results</h3>
        <div class="quality-score-badge" id="quality-score">
          <span class="score-label">Quality Score</span>
          <span class="score-value" id="score-value">--</span>
        </div>
      </div>
      
      <div class="smell-statistics" id="smell-statistics">
        <!-- Stats will be inserted here -->
      </div>
      
      <div class="recommendations-section" id="recommendations-section">
        <h4 class="recommendations-title">📋 Recommendations</h4>
        <div id="recommendations-list" class="recommendations-list">
          <!-- Recommendations will be inserted here -->
        </div>
      </div>
      
      <div class="smell-filters">
        <label>
          Filter by Type:
          <select id="smell-type-filter" class="smell-filter-select">
            <option value="all">All Types</option>
            <option value="complexity">Complexity</option>
            <option value="duplication">Duplication</option>
            <option value="naming">Naming</option>
            <option value="size">Size</option>
            <option value="coupling">Coupling</option>
            <option value="cohesion">Cohesion</option>
          </select>
        </label>
        
        <label>
          Filter by Severity:
          <select id="smell-severity-filter" class="smell-filter-select">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>
      
      <div id="smell-list" class="smell-list">
        <!-- Code smells will be inserted here -->
      </div>
    </div>
  `;
  
  // Set up event listeners
  setTimeout(() => {
    const analyzeBtn = document.getElementById('analyze-code-btn');
    const clearBtn = document.getElementById('clear-analysis-btn');
    const codeInput = document.getElementById('code-input') as HTMLTextAreaElement;
    const typeFilter = document.getElementById('smell-type-filter') as HTMLSelectElement;
    const severityFilter = document.getElementById('smell-severity-filter') as HTMLSelectElement;
    
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        const code = codeInput?.value || '';
        if (code.trim().length === 0) {
          notificationManager.warning('Please enter some code to analyze');
          return;
        }
        
        analyzeCode(code);
        trackActivity('code-smell', 'Analyzed code for smells', 'User submitted code for analysis');
      });
    }
    
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (codeInput) codeInput.value = '';
        currentReport = null;
        
        const resultsDiv = document.getElementById('code-smell-results');
        if (resultsDiv) resultsDiv.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
        
        trackActivity('code-smell', 'Cleared code smell analysis', 'User cleared the analysis results');
      });
    }
    
    if (typeFilter) {
      typeFilter.addEventListener('change', () => {
        updateFilteredResults();
      });
    }
    
    if (severityFilter) {
      severityFilter.addEventListener('change', () => {
        updateFilteredResults();
      });
    }
  }, 0);
  
  return container;
}

/**
 * Analyzes the provided code and displays results
 */
function analyzeCode(code: string) {
  const smells = detectCodeSmells(code, 'user-code.ts');
  currentReport = generateCodeSmellReport(smells);
  
  displayResults(currentReport);
  
  // Show clear button
  const clearBtn = document.getElementById('clear-analysis-btn');
  if (clearBtn) clearBtn.style.display = 'inline-block';
  
  // Show notification
  const stats = getCodeSmellStatistics(currentReport);
  if (stats.total === 0) {
    notificationManager.success('No code smells detected! Your code looks great!');
  } else {
    notificationManager.info(`Analysis complete: ${stats.total} smell(s) detected`);
  }
}

/**
 * Displays analysis results in the UI
 */
function displayResults(report: CodeSmellReport) {
  const resultsDiv = document.getElementById('code-smell-results');
  if (!resultsDiv) return;
  
  resultsDiv.style.display = 'block';
  
  // Update quality score
  const scoreValue = document.getElementById('score-value');
  if (scoreValue) {
    scoreValue.textContent = report.score.toString();
    
    // Color based on score
    const scoreBadge = document.getElementById('quality-score');
    if (scoreBadge) {
      scoreBadge.className = 'quality-score-badge';
      if (report.score >= 80) {
        scoreBadge.classList.add('score-excellent');
      } else if (report.score >= 60) {
        scoreBadge.classList.add('score-good');
      } else if (report.score >= 40) {
        scoreBadge.classList.add('score-fair');
      } else {
        scoreBadge.classList.add('score-poor');
      }
    }
  }
  
  // Display statistics
  displayStatistics(report);
  
  // Display recommendations
  displayRecommendations(report);
  
  // Display code smells
  updateFilteredResults();
}

/**
 * Displays smell statistics
 */
function displayStatistics(report: CodeSmellReport) {
  const statsContainer = document.getElementById('smell-statistics');
  if (!statsContainer) return;
  
  const stats = getCodeSmellStatistics(report);
  
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">🔍</div>
      <div class="stat-content">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Total Smells</div>
      </div>
    </div>
    
    <div class="stat-card severity-critical">
      <div class="stat-icon">🚨</div>
      <div class="stat-content">
        <div class="stat-value">${stats.critical}</div>
        <div class="stat-label">Critical</div>
      </div>
    </div>
    
    <div class="stat-card severity-high">
      <div class="stat-icon">⚠️</div>
      <div class="stat-content">
        <div class="stat-value">${stats.high}</div>
        <div class="stat-label">High</div>
      </div>
    </div>
    
    <div class="stat-card severity-medium">
      <div class="stat-icon">⚡</div>
      <div class="stat-content">
        <div class="stat-value">${stats.medium}</div>
        <div class="stat-label">Medium</div>
      </div>
    </div>
    
    <div class="stat-card severity-low">
      <div class="stat-icon">ℹ️</div>
      <div class="stat-content">
        <div class="stat-value">${stats.low}</div>
        <div class="stat-label">Low</div>
      </div>
    </div>
  `;
}

/**
 * Displays recommendations
 */
function displayRecommendations(report: CodeSmellReport) {
  const recommendationsDiv = document.getElementById('recommendations-list');
  if (!recommendationsDiv) return;
  
  const recommendations = generateRecommendations(report);
  
  if (recommendations.length === 0) {
    recommendationsDiv.innerHTML = '<p class="no-recommendations">No specific recommendations at this time.</p>';
    return;
  }
  
  recommendationsDiv.innerHTML = recommendations
    .map(rec => `<div class="recommendation-item">${escapeHtml(rec)}</div>`)
    .join('');
}

/**
 * Displays code smells with current filters
 */
function updateFilteredResults() {
  if (!currentReport) return;
  
  const smellList = document.getElementById('smell-list');
  if (!smellList) return;
  
  const typeFilter = (document.getElementById('smell-type-filter') as HTMLSelectElement)?.value || 'all';
  const severityFilter = (document.getElementById('smell-severity-filter') as HTMLSelectElement)?.value || 'all';
  
  let filteredSmells = [...currentReport.smells];
  
  if (typeFilter !== 'all') {
    filteredSmells = filterCodeSmells(filteredSmells, { type: typeFilter });
  }
  
  if (severityFilter !== 'all') {
    filteredSmells = filterCodeSmells(filteredSmells, { severity: severityFilter });
  }
  
  if (filteredSmells.length === 0) {
    smellList.innerHTML = '<div class="no-smells">No code smells match your filters.</div>';
    return;
  }
  
  smellList.innerHTML = filteredSmells
    .map(smell => createSmellCard(smell))
    .join('');
}

/**
 * Creates a card for a single code smell
 */
function createSmellCard(smell: CodeSmell): string {
  const severityClass = `smell-severity-${smell.severity}`;
  const typeIcon = getTypeIcon(smell.type);
  const severityIcon = getSeverityIcon(smell.severity);
  const effortBadge = getEffortBadge(smell.effort);
  
  return `
    <div class="smell-card ${severityClass}">
      <div class="smell-header">
        <div class="smell-type-badge">
          ${typeIcon} ${smell.type}
        </div>
        <div class="smell-severity-badge ${severityClass}">
          ${severityIcon} ${smell.severity}
        </div>
      </div>
      
      <h4 class="smell-title">${escapeHtml(smell.title)}</h4>
      <p class="smell-description">${escapeHtml(smell.description)}</p>
      
      ${smell.lineNumbers ? `
        <div class="smell-location">
          📍 Lines: ${smell.lineNumbers.join(', ')}
        </div>
      ` : ''}
      
      <div class="smell-suggestion">
        <strong>💡 Suggestion:</strong> ${escapeHtml(smell.suggestion)}
      </div>
      
      <div class="smell-footer">
        <div class="smell-impact">
          <strong>Impact:</strong> ${escapeHtml(smell.impact)}
        </div>
        ${effortBadge}
      </div>
    </div>
  `;
}

/**
 * Gets icon for smell type
 */
function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    complexity: '🧩',
    duplication: '♻️',
    naming: '🏷️',
    size: '📦',
    coupling: '🔗',
    cohesion: '🎯'
  };
  return icons[type] || '📋';
}

/**
 * Gets icon for severity level
 */
function getSeverityIcon(severity: string): string {
  const icons: Record<string, string> = {
    critical: '🚨',
    high: '⚠️',
    medium: '⚡',
    low: 'ℹ️'
  };
  return icons[severity] || 'ℹ️';
}

/**
 * Gets effort badge HTML
 */
function getEffortBadge(effort: string): string {
  const labels: Record<string, string> = {
    small: 'Small Effort',
    medium: 'Medium Effort',
    large: 'Large Effort'
  };
  
  return `
    <div class="effort-badge effort-${effort}">
      ⏱️ ${labels[effort] || effort}
    </div>
  `;
}

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Analyzes sample code (for demo purposes)
 */
export function analyzeSampleCode() {
  const sampleCode = `
function processUserData(id, name, email, age, address, phone, city, state) {
  if (age > 18 && age < 65 && email && email.includes('@') && name && name.length > 2 && phone && phone.length === 10) {
    const timeout = 5000;
    const maxRetries = 42;
    const x = getValue();
    
    for (let i = 0; i < maxRetries; i++) {
      if (x) {
        if (age > 21) {
          if (state === 'CA') {
            if (city === 'SF') {
              if (timeout > 3000) {
                console.log('Deep nesting!');
              }
            }
          }
        }
      }
    }
  }
}

function anotherFunction() {
  const x = getValue();
  const y = 2;
  const z = 3;
  console.log(x);
  console.log(y);
}

function duplicateLogic() {
  const x = getValue();
  const y = 2;
  const z = 3;
  console.log(x);
  console.log(y);
}
  `.trim();
  
  const codeInput = document.getElementById('code-input') as HTMLTextAreaElement;
  if (codeInput) {
    codeInput.value = sampleCode;
  }
  
  analyzeCode(sampleCode);
  trackActivity('code-smell', 'Analyzed sample code', 'User requested analysis of sample code');
}
