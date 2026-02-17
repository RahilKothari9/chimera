/**
 * Code Smell Detection System
 * 
 * Analyzes code for common code smells, anti-patterns, and refactoring opportunities.
 * Provides actionable insights to improve code quality.
 */

export interface CodeSmell {
  id: string;
  type: 'duplication' | 'complexity' | 'naming' | 'size' | 'coupling' | 'cohesion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  lineNumbers?: number[];
  suggestion: string;
  impact: string;
  effort: 'small' | 'medium' | 'large';
  detectedAt: number;
}

export interface CodeSmellReport {
  totalSmells: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  smells: CodeSmell[];
  score: number; // 0-100, higher is better
  timestamp: number;
}

/**
 * Analyzes code for various code smells
 */
export function detectCodeSmells(code: string, filename: string = 'unknown'): CodeSmell[] {
  const smells: CodeSmell[] = [];
  const lines = code.split('\n');
  
  // Detect long functions
  smells.push(...detectLongFunctions(code, filename));
  
  // Detect complex conditions
  smells.push(...detectComplexConditions(code, filename));
  
  // Detect magic numbers
  smells.push(...detectMagicNumbers(code, filename));
  
  // Detect long parameter lists
  smells.push(...detectLongParameterLists(code, filename));
  
  // Detect duplicate code patterns
  smells.push(...detectDuplicateCode(lines, filename));
  
  // Detect poor naming
  smells.push(...detectPoorNaming(code, filename));
  
  // Detect large classes/files
  smells.push(...detectLargeFiles(lines, filename));
  
  // Detect nested callbacks (callback hell)
  smells.push(...detectCallbackHell(code, filename));
  
  return smells;
}

/**
 * Detects long functions (over 50 lines)
 */
function detectLongFunctions(code: string, filename: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  const functionRegex = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|\w+\s*\([^)]*\)\s*\{)/g;
  
  let match;
  while ((match = functionRegex.exec(code)) !== null) {
    const startPos = match.index;
    const functionCode = extractFunction(code, startPos);
    const lineCount = functionCode.split('\n').length;
    
    if (lineCount > 50) {
      const severity = lineCount > 100 ? 'high' : lineCount > 75 ? 'medium' : 'low';
      smells.push({
        id: `long-function-${startPos}`,
        type: 'size',
        severity,
        title: `Long Function (${lineCount} lines)`,
        description: `Function exceeds recommended length of 50 lines`,
        location: filename,
        suggestion: 'Break this function into smaller, focused functions with single responsibilities',
        impact: 'Reduces readability and maintainability',
        effort: lineCount > 100 ? 'large' : 'medium',
        detectedAt: Date.now()
      });
    }
  }
  
  return smells;
}

/**
 * Detects complex conditional expressions
 */
function detectComplexConditions(code: string, filename: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const andCount = (line.match(/&&/g) || []).length;
    const orCount = (line.match(/\|\|/g) || []).length;
    const totalOperators = andCount + orCount;
    
    if (totalOperators > 3) {
      const severity = totalOperators > 6 ? 'high' : totalOperators > 4 ? 'medium' : 'low';
      smells.push({
        id: `complex-condition-${index}`,
        type: 'complexity',
        severity,
        title: `Complex Conditional (${totalOperators} operators)`,
        description: `Line contains ${totalOperators} boolean operators`,
        location: filename,
        lineNumbers: [index + 1],
        suggestion: 'Extract condition into well-named boolean variables or helper functions',
        impact: 'Difficult to understand and test',
        effort: 'small',
        detectedAt: Date.now()
      });
    }
  });
  
  return smells;
}

/**
 * Detects magic numbers (hardcoded numeric values)
 */
function detectMagicNumbers(code: string, filename: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    // Skip comments and common acceptable numbers (0, 1, -1, 100)
    if (line.includes('//') || line.includes('/*')) return;
    
    const magicNumberRegex = /(?<![a-zA-Z_])[2-9]\d+(?:\.\d+)?(?![a-zA-Z_])/g;
    const matches = line.match(magicNumberRegex);
    
    if (matches && matches.length > 0) {
      smells.push({
        id: `magic-number-${index}`,
        type: 'naming',
        severity: 'low',
        title: `Magic Numbers Detected`,
        description: `Line contains unexplained numeric literals: ${matches.join(', ')}`,
        location: filename,
        lineNumbers: [index + 1],
        suggestion: 'Replace magic numbers with named constants that explain their purpose',
        impact: 'Reduces code clarity and makes changes error-prone',
        effort: 'small',
        detectedAt: Date.now()
      });
    }
  });
  
  return smells;
}

/**
 * Detects functions with too many parameters
 */
function detectLongParameterLists(code: string, filename: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  const functionRegex = /function\s+\w+\s*\(([^)]+)\)/g;
  
  let match;
  while ((match = functionRegex.exec(code)) !== null) {
    const params = match[1];
    if (params && params.trim().length > 0) {
      const paramCount = params.split(',').filter(p => p.trim().length > 0).length;
      
      if (paramCount > 5) {
        const severity = paramCount > 8 ? 'high' : paramCount > 6 ? 'medium' : 'low';
        smells.push({
          id: `long-params-${match.index}`,
          type: 'complexity',
          severity,
          title: `Too Many Parameters (${paramCount})`,
          description: `Function has ${paramCount} parameters, exceeding recommended limit of 5`,
          location: filename,
          suggestion: 'Consider using a parameter object or breaking into smaller functions',
          impact: 'Difficult to use and maintain',
          effort: 'medium',
          detectedAt: Date.now()
        });
      }
    }
  }
  
  return smells;
}

/**
 * Detects duplicate code blocks
 */
function detectDuplicateCode(lines: string[], filename: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  const blockSize = 5; // Look for duplicate blocks of 5+ lines
  const blocks = new Map<string, number[]>();
  
  for (let i = 0; i < lines.length - blockSize; i++) {
    const block = lines.slice(i, i + blockSize)
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('//'))
      .join('\n');
    
    if (block.length < 50) continue; // Skip very small blocks
    
    if (!blocks.has(block)) {
      blocks.set(block, []);
    }
    blocks.get(block)!.push(i + 1);
  }
  
  blocks.forEach((occurrences) => {
    if (occurrences.length > 1) {
      smells.push({
        id: `duplicate-${occurrences[0]}`,
        type: 'duplication',
        severity: 'medium',
        title: `Duplicate Code Block (${occurrences.length} occurrences)`,
        description: `${blockSize}-line code block appears ${occurrences.length} times`,
        location: filename,
        lineNumbers: occurrences,
        suggestion: 'Extract duplicated code into a reusable function',
        impact: 'Violates DRY principle, makes maintenance difficult',
        effort: 'medium',
        detectedAt: Date.now()
      });
    }
  });
  
  return smells;
}

/**
 * Detects poor naming conventions
 */
function detectPoorNaming(code: string, filename: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  
  // Detect single letter variables (excluding common loop variables)
  const singleLetterRegex = /(?:const|let|var)\s+([a-z])\s*=/gi;
  let match;
  
  while ((match = singleLetterRegex.exec(code)) !== null) {
    const varName = match[1];
    if (varName !== 'i' && varName !== 'j' && varName !== 'k') {
      smells.push({
        id: `poor-naming-${match.index}`,
        type: 'naming',
        severity: 'low',
        title: `Single Letter Variable: '${varName}'`,
        description: `Variable '${varName}' uses non-descriptive single letter name`,
        location: filename,
        suggestion: 'Use descriptive names that convey purpose and meaning',
        impact: 'Reduces code readability',
        effort: 'small',
        detectedAt: Date.now()
      });
    }
  }
  
  return smells;
}

/**
 * Detects large files (over 300 lines)
 */
function detectLargeFiles(lines: string[], filename: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
  
  if (nonEmptyLines > 300) {
    const severity = nonEmptyLines > 600 ? 'high' : nonEmptyLines > 450 ? 'medium' : 'low';
    smells.push({
      id: `large-file`,
      type: 'size',
      severity,
      title: `Large File (${nonEmptyLines} lines)`,
      description: `File exceeds recommended size of 300 lines`,
      location: filename,
      suggestion: 'Split into smaller, focused modules with clear responsibilities',
      impact: 'Harder to navigate and maintain',
      effort: 'large',
      detectedAt: Date.now()
    });
  }
  
  return smells;
}

/**
 * Detects deeply nested callbacks (callback hell)
 */
function detectCallbackHell(code: string, filename: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  const lines = code.split('\n');
  
  let maxNesting = 0;
  let currentNesting = 0;
  let problemLine = 0;
  
  lines.forEach((line, index) => {
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    
    currentNesting += openBraces - closeBraces;
    
    if (currentNesting > maxNesting) {
      maxNesting = currentNesting;
      problemLine = index + 1;
    }
  });
  
  if (maxNesting > 4) {
    const severity = maxNesting > 7 ? 'high' : maxNesting > 5 ? 'medium' : 'low';
    smells.push({
      id: `callback-hell`,
      type: 'complexity',
      severity,
      title: `Deep Nesting (${maxNesting} levels)`,
      description: `Code contains ${maxNesting} levels of nesting`,
      location: filename,
      lineNumbers: [problemLine],
      suggestion: 'Use async/await, extract functions, or early returns to reduce nesting',
      impact: 'Very difficult to read and understand',
      effort: 'medium',
      detectedAt: Date.now()
    });
  }
  
  return smells;
}

/**
 * Extracts a complete function from code starting at position
 */
function extractFunction(code: string, startPos: number): string {
  let braceCount = 0;
  let inFunction = false;
  let result = '';
  
  for (let i = startPos; i < code.length; i++) {
    const char = code[i];
    result += char;
    
    if (char === '{') {
      braceCount++;
      inFunction = true;
    } else if (char === '}') {
      braceCount--;
      if (inFunction && braceCount === 0) {
        break;
      }
    }
  }
  
  return result;
}

/**
 * Generates a comprehensive code smell report
 */
export function generateCodeSmellReport(smells: CodeSmell[]): CodeSmellReport {
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  
  smells.forEach(smell => {
    byType[smell.type] = (byType[smell.type] || 0) + 1;
    bySeverity[smell.severity] = (bySeverity[smell.severity] || 0) + 1;
  });
  
  // Calculate quality score (0-100)
  const score = calculateQualityScore(smells);
  
  return {
    totalSmells: smells.length,
    byType,
    bySeverity,
    smells,
    score,
    timestamp: Date.now()
  };
}

/**
 * Calculates a quality score based on detected smells
 */
function calculateQualityScore(smells: CodeSmell[]): number {
  const severityWeights = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3
  };
  
  let penalty = 0;
  smells.forEach(smell => {
    penalty += severityWeights[smell.severity];
  });
  
  // Start at 100 and subtract penalties
  const score = Math.max(0, 100 - penalty);
  return Math.round(score);
}

/**
 * Filters code smells based on criteria
 */
export function filterCodeSmells(
  smells: CodeSmell[],
  filters: {
    type?: string;
    severity?: string;
    minSeverity?: 'low' | 'medium' | 'high' | 'critical';
  }
): CodeSmell[] {
  const severityOrder = ['low', 'medium', 'high', 'critical'];
  
  return smells.filter(smell => {
    if (filters.type && smell.type !== filters.type) return false;
    if (filters.severity && smell.severity !== filters.severity) return false;
    if (filters.minSeverity) {
      const smellLevel = severityOrder.indexOf(smell.severity);
      const minLevel = severityOrder.indexOf(filters.minSeverity);
      if (smellLevel < minLevel) return false;
    }
    return true;
  });
}

/**
 * Gets statistics about code smells
 */
export function getCodeSmellStatistics(report: CodeSmellReport) {
  return {
    total: report.totalSmells,
    critical: report.bySeverity.critical || 0,
    high: report.bySeverity.high || 0,
    medium: report.bySeverity.medium || 0,
    low: report.bySeverity.low || 0,
    score: report.score,
    timestamp: report.timestamp
  };
}

/**
 * Generates actionable recommendations based on code smells
 */
export function generateRecommendations(report: CodeSmellReport): string[] {
  const recommendations: string[] = [];
  
  // Prioritize critical and high severity issues
  const criticalCount = report.bySeverity.critical || 0;
  const highCount = report.bySeverity.high || 0;
  
  if (criticalCount > 0) {
    recommendations.push(`🚨 Address ${criticalCount} critical issue(s) immediately`);
  }
  
  if (highCount > 0) {
    recommendations.push(`⚠️ Fix ${highCount} high-severity issue(s) soon`);
  }
  
  // Type-specific recommendations
  const duplicationCount = report.byType.duplication || 0;
  if (duplicationCount > 2) {
    recommendations.push(`♻️ Refactor duplicate code blocks (${duplicationCount} found)`);
  }
  
  const complexityCount = report.byType.complexity || 0;
  if (complexityCount > 3) {
    recommendations.push(`🧩 Simplify complex code structures (${complexityCount} found)`);
  }
  
  const sizeCount = report.byType.size || 0;
  if (sizeCount > 2) {
    recommendations.push(`📦 Break down large functions/files (${sizeCount} found)`);
  }
  
  // Overall health recommendation
  if (report.score >= 80) {
    recommendations.push(`✅ Code quality is good! Keep up the great work.`);
  } else if (report.score >= 60) {
    recommendations.push(`📈 Code quality is decent, but has room for improvement`);
  } else {
    recommendations.push(`⚠️ Code quality needs attention - prioritize refactoring`);
  }
  
  return recommendations;
}
