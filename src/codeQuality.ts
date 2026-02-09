/**
 * Code Quality Analyzer
 * 
 * Analyzes codebase quality metrics including test coverage,
 * code complexity, file sizes, and technical debt indicators.
 */

export interface CodeQualityMetrics {
  testCoverage: {
    totalTests: number
    testFiles: number
    sourceFiles: number
    coverageRatio: number // tests per source file
    testDensity: string // e.g., "21.3 tests/file"
  }
  codeHealth: {
    totalLines: number
    avgFileSize: number
    largeFiles: Array<{ name: string; estimated: number }>
    complexityScore: number // 0-100
    healthGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  }
  technicalDebt: {
    debtScore: number // 0-100, higher is worse
    debtLevel: 'Low' | 'Medium' | 'High' | 'Critical'
    issues: string[]
    recommendations: string[]
  }
  trends: {
    direction: 'improving' | 'stable' | 'declining'
    confidence: number // 0-1
    insights: string[]
  }
}

/**
 * Calculate test coverage metrics
 */
export function calculateTestCoverage(totalTests: number, testFiles: number, sourceFiles: number): CodeQualityMetrics['testCoverage'] {
  const coverageRatio = sourceFiles > 0 ? totalTests / sourceFiles : 0
  const testDensity = sourceFiles > 0 ? (totalTests / sourceFiles).toFixed(1) : '0.0'
  
  return {
    totalTests,
    testFiles,
    sourceFiles,
    coverageRatio,
    testDensity: `${testDensity} tests/file`,
  }
}

/**
 * Analyze code health based on file metrics
 */
export function analyzeCodeHealth(fileCount: number, avgSize: number, evolutionCount: number): CodeQualityMetrics['codeHealth'] {
  // Estimate total lines based on files and evolution count
  const totalLines = Math.floor(fileCount * avgSize * 20) // Rough estimate
  
  // Identify potentially large files (estimate based on evolution)
  const largeFiles: Array<{ name: string; estimated: number }> = []
  
  // Key files that might be large
  if (evolutionCount > 15) {
    largeFiles.push({ name: 'style.css', estimated: 1500 })
  }
  if (evolutionCount > 10) {
    largeFiles.push({ name: 'main.ts', estimated: 800 })
  }
  
  // Calculate complexity score (0-100, lower is better)
  // Based on avg file size and number of files
  let complexityScore = 0
  if (avgSize < 150) complexityScore = 20
  else if (avgSize < 250) complexityScore = 40
  else if (avgSize < 400) complexityScore = 60
  else if (avgSize < 600) complexityScore = 80
  else complexityScore = 95
  
  // Adjust for file count
  if (fileCount > 80) complexityScore = Math.min(100, complexityScore + 10)
  else if (fileCount > 60) complexityScore = Math.min(100, complexityScore + 5)
  
  // Determine health grade
  let healthGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (complexityScore < 30) healthGrade = 'A'
  else if (complexityScore < 50) healthGrade = 'B'
  else if (complexityScore < 70) healthGrade = 'C'
  else if (complexityScore < 85) healthGrade = 'D'
  else healthGrade = 'F'
  
  return {
    totalLines,
    avgFileSize: avgSize,
    largeFiles,
    complexityScore,
    healthGrade,
  }
}

/**
 * Assess technical debt
 */
export function assessTechnicalDebt(
  testCoverage: CodeQualityMetrics['testCoverage'],
  codeHealth: CodeQualityMetrics['codeHealth']
): CodeQualityMetrics['technicalDebt'] {
  const issues: string[] = []
  const recommendations: string[] = []
  let debtScore = 0
  
  // Check test coverage
  if (testCoverage.coverageRatio < 15) {
    issues.push('Low test coverage ratio')
    recommendations.push('Add more tests to improve coverage (target: 20+ tests/file)')
    debtScore += 25
  } else if (testCoverage.coverageRatio < 20) {
    recommendations.push('Consider adding more edge case tests')
    debtScore += 10
  }
  
  // Check code complexity
  if (codeHealth.complexityScore > 70) {
    issues.push('High code complexity detected')
    recommendations.push('Consider refactoring large files into smaller modules')
    debtScore += 30
  } else if (codeHealth.complexityScore > 50) {
    recommendations.push('Monitor file sizes to prevent complexity growth')
    debtScore += 15
  }
  
  // Check for large files
  if (codeHealth.largeFiles.length > 3) {
    issues.push(`${codeHealth.largeFiles.length} large files detected`)
    recommendations.push('Break down large files into logical components')
    debtScore += 20
  } else if (codeHealth.largeFiles.length > 1) {
    recommendations.push('Monitor large files for refactoring opportunities')
    debtScore += 10
  }
  
  // Check average file size
  if (codeHealth.avgFileSize > 500) {
    issues.push('High average file size')
    recommendations.push('Maintain smaller, focused modules for better maintainability')
    debtScore += 15
  }
  
  // Determine debt level
  let debtLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  if (debtScore < 20) debtLevel = 'Low'
  else if (debtScore < 40) debtLevel = 'Medium'
  else if (debtScore < 70) debtLevel = 'High'
  else debtLevel = 'Critical'
  
  return {
    debtScore,
    debtLevel,
    issues,
    recommendations,
  }
}

/**
 * Analyze trends based on historical data
 */
export function analyzeTrends(
  currentDebt: number,
  currentComplexity: number,
  evolutionCount: number
): CodeQualityMetrics['trends'] {
  const insights: string[] = []
  
  // Evolution velocity (features per week)
  const weeksActive = Math.max(1, Math.ceil(evolutionCount / 7))
  const velocity = (evolutionCount / weeksActive).toFixed(1)
  insights.push(`Evolution velocity: ${velocity} features/week`)
  
  // Complexity trend analysis
  if (currentComplexity < 40) {
    insights.push('Excellent: Complexity remains well-managed')
  } else if (currentComplexity < 60) {
    insights.push('Good: Complexity is moderate and sustainable')
  } else {
    insights.push('Watch: Complexity approaching concerning levels')
  }
  
  // Debt trend analysis
  if (currentDebt < 30) {
    insights.push('Strong code quality maintained throughout evolution')
  } else if (currentDebt < 50) {
    insights.push('Moderate technical debt, manageable with regular maintenance')
  } else {
    insights.push('High technical debt - prioritize refactoring')
  }
  
  // Determine overall direction
  let direction: 'improving' | 'stable' | 'declining'
  let confidence: number
  
  if (currentDebt < 30 && currentComplexity < 50) {
    direction = 'improving'
    confidence = 0.8
  } else if (currentDebt > 60 || currentComplexity > 70) {
    direction = 'declining'
    confidence = 0.75
  } else {
    direction = 'stable'
    confidence = 0.7
  }
  
  return {
    direction,
    confidence,
    insights,
  }
}

/**
 * Generate comprehensive code quality metrics
 */
export function generateCodeQualityMetrics(
  totalTests: number,
  testFiles: number,
  sourceFiles: number,
  evolutionCount: number
): CodeQualityMetrics {
  // Calculate test coverage
  const testCoverage = calculateTestCoverage(totalTests, testFiles, sourceFiles)
  
  // Estimate average file size based on evolution count
  // More features typically means larger files
  const avgFileSize = 150 + (evolutionCount * 8)
  
  // Analyze code health
  const codeHealth = analyzeCodeHealth(sourceFiles, avgFileSize, evolutionCount)
  
  // Assess technical debt
  const technicalDebt = assessTechnicalDebt(testCoverage, codeHealth)
  
  // Analyze trends
  const trends = analyzeTrends(
    technicalDebt.debtScore,
    codeHealth.complexityScore,
    evolutionCount
  )
  
  return {
    testCoverage,
    codeHealth,
    technicalDebt,
    trends,
  }
}

/**
 * Get actionable recommendations based on metrics
 */
export function getActionableRecommendations(metrics: CodeQualityMetrics): string[] {
  const recommendations: string[] = []
  
  // Priority 1: Critical issues
  if (metrics.technicalDebt.debtLevel === 'Critical') {
    recommendations.push('🚨 URGENT: Address critical technical debt before adding new features')
  }
  
  // Priority 2: Health grade issues
  if (metrics.codeHealth.healthGrade === 'D' || metrics.codeHealth.healthGrade === 'F') {
    recommendations.push('⚠️ Code health is concerning - schedule refactoring sprint')
  }
  
  // Priority 3: Specific improvements
  if (metrics.testCoverage.coverageRatio < 15) {
    recommendations.push('📝 Add comprehensive tests - current coverage is below recommended levels')
  }
  
  if (metrics.codeHealth.largeFiles.length > 2) {
    recommendations.push('🔧 Refactor large files into smaller, focused modules')
  }
  
  if (metrics.codeHealth.complexityScore > 60) {
    recommendations.push('🎯 Reduce code complexity through modularization')
  }
  
  // Positive reinforcement
  if (metrics.technicalDebt.debtLevel === 'Low' && metrics.codeHealth.healthGrade === 'A') {
    recommendations.push('✅ Excellent code quality - maintain current practices')
  }
  
  // Add custom recommendations from technical debt
  recommendations.push(...metrics.technicalDebt.recommendations)
  
  return recommendations
}
