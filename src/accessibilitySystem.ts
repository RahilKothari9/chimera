/**
 * Accessibility System
 * Provides comprehensive accessibility features including screen reader support,
 * keyboard navigation, ARIA live regions, and accessibility auditing.
 */

export interface AccessibilityIssue {
  element: string;
  issue: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagLevel: 'A' | 'AA' | 'AAA';
  recommendation: string;
}

export interface AccessibilityAuditResult {
  timestamp: Date;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  issues: AccessibilityIssue[];
  score: number; // 0-100, higher is better
}

export interface AriaLiveOptions {
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: string;
}

/**
 * Accessibility manager for screen reader announcements and ARIA live regions
 */
class AccessibilityManager {
  private liveRegion: HTMLElement | null = null;
  private statusRegion: HTMLElement | null = null;
  
  /**
   * Initialize accessibility features
   */
  initialize(): void {
    this.createLiveRegions();
    this.setupSkipLinks();
    this.enhanceKeyboardNavigation();
  }
  
  /**
   * Create ARIA live regions for screen reader announcements
   */
  private createLiveRegions(): void {
    // Assertive live region for important announcements
    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.setAttribute('role', 'alert');
      this.liveRegion.setAttribute('aria-live', 'assertive');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.className = 'sr-only';
      document.body.appendChild(this.liveRegion);
    }
    
    // Polite status region for non-critical updates
    if (!this.statusRegion) {
      this.statusRegion = document.createElement('div');
      this.statusRegion.setAttribute('role', 'status');
      this.statusRegion.setAttribute('aria-live', 'polite');
      this.statusRegion.setAttribute('aria-atomic', 'true');
      this.statusRegion.className = 'sr-only';
      document.body.appendChild(this.statusRegion);
    }
  }
  
  /**
   * Announce message to screen readers
   */
  announce(message: string, options: AriaLiveOptions = {}): void {
    const { politeness = 'polite' } = options;
    const region = politeness === 'assertive' ? this.liveRegion : this.statusRegion;
    
    if (region) {
      // Clear and set new message with a slight delay to ensure screen readers pick it up
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  }
  
  /**
   * Setup skip links for keyboard navigation
   */
  private setupSkipLinks(): void {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  /**
   * Enhance keyboard navigation with focus management
   */
  private enhanceKeyboardNavigation(): void {
    // Add focus-visible class support for better focus indicators
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  }
  
  /**
   * Run accessibility audit on the current page
   */
  audit(): AccessibilityAuditResult {
    const issues: AccessibilityIssue[] = [];
    
    // Check for missing alt text on images
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          element: `img[src="${img.src.substring(0, 50)}..."]`,
          issue: 'Missing alt attribute',
          severity: 'critical',
          wcagLevel: 'A',
          recommendation: 'Add descriptive alt text or use alt="" for decorative images'
        });
      }
    });
    
    // Check for missing form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      const hasLabel = input.hasAttribute('aria-label') || 
                      input.hasAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel && input.getAttribute('type') !== 'hidden') {
        issues.push({
          element: `${input.tagName.toLowerCase()}[type="${input.getAttribute('type') || 'text'}"]`,
          issue: 'Form control missing accessible label',
          severity: 'critical',
          wcagLevel: 'A',
          recommendation: 'Add aria-label, aria-labelledby, or associated <label> element'
        });
      }
    });
    
    // Check for missing button text
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button) => {
      const hasText = button.textContent?.trim() || 
                     button.hasAttribute('aria-label') ||
                     button.hasAttribute('aria-labelledby');
      
      if (!hasText) {
        issues.push({
          element: `button.${button.className}`,
          issue: 'Button missing accessible text',
          severity: 'critical',
          wcagLevel: 'A',
          recommendation: 'Add text content, aria-label, or aria-labelledby'
        });
      }
    });
    
    // Check for missing heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level - lastLevel > 1) {
        issues.push({
          element: heading.tagName.toLowerCase(),
          issue: `Heading level skipped (jumped from h${lastLevel} to h${level})`,
          severity: 'moderate',
          wcagLevel: 'AA',
          recommendation: 'Use heading levels in sequential order'
        });
      }
      lastLevel = level;
    });
    
    // Check for color contrast (simplified check)
    const colorElements = document.querySelectorAll('[style*="color"]');
    if (colorElements.length > 0) {
      issues.push({
        element: 'Various elements with inline styles',
        issue: 'Inline color styles detected - may not meet contrast requirements',
        severity: 'minor',
        wcagLevel: 'AA',
        recommendation: 'Use CSS variables and ensure 4.5:1 contrast ratio for normal text'
      });
    }
    
    // Check for missing landmarks
    const hasMain = document.querySelector('main, [role="main"]');
    if (!hasMain) {
      issues.push({
        element: 'document',
        issue: 'Missing main landmark',
        severity: 'serious',
        wcagLevel: 'AA',
        recommendation: 'Add <main> element or role="main" to identify main content'
      });
    }
    
    // Check for clickable elements that aren't keyboard accessible
    const clickableElements = document.querySelectorAll('[onclick]');
    clickableElements.forEach((element) => {
      if (!element.hasAttribute('tabindex') && 
          element.tagName !== 'BUTTON' && 
          element.tagName !== 'A') {
        issues.push({
          element: `${element.tagName.toLowerCase()}.${element.className}`,
          issue: 'Clickable element not keyboard accessible',
          severity: 'serious',
          wcagLevel: 'A',
          recommendation: 'Use <button> or <a> element, or add tabindex="0" and keyboard handler'
        });
      }
    });
    
    // Calculate statistics
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const seriousIssues = issues.filter(i => i.severity === 'serious').length;
    const moderateIssues = issues.filter(i => i.severity === 'moderate').length;
    const minorIssues = issues.filter(i => i.severity === 'minor').length;
    
    // Calculate score (100 - weighted penalties)
    const score = Math.max(0, 100 - (
      criticalIssues * 15 +
      seriousIssues * 10 +
      moderateIssues * 5 +
      minorIssues * 2
    ));
    
    return {
      timestamp: new Date(),
      totalIssues: issues.length,
      criticalIssues,
      seriousIssues,
      moderateIssues,
      minorIssues,
      issues,
      score
    };
  }
  
  /**
   * Get accessibility statistics
   */
  getStats(): {
    hasLiveRegions: boolean;
    hasSkipLinks: boolean;
    keyboardNavEnabled: boolean;
  } {
    return {
      hasLiveRegions: this.liveRegion !== null && this.statusRegion !== null,
      hasSkipLinks: document.querySelector('.skip-link') !== null,
      keyboardNavEnabled: true
    };
  }
  
  /**
   * Cleanup accessibility features
   */
  cleanup(): void {
    if (this.liveRegion) {
      this.liveRegion.remove();
      this.liveRegion = null;
    }
    if (this.statusRegion) {
      this.statusRegion.remove();
      this.statusRegion = null;
    }
    
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.remove();
    }
  }
}

// Singleton instance
export const accessibilityManager = new AccessibilityManager();

/**
 * Check color contrast ratio between two colors
 * Returns true if contrast meets WCAG AA standards (4.5:1 for normal text)
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const fgLuminance = getRelativeLuminance(foreground);
  const bgLuminance = getRelativeLuminance(background);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  const contrast = (lighter + 0.05) / (darker + 0.05);
  
  const requiredRatio = level === 'AAA' ? 7 : 4.5;
  return contrast >= requiredRatio;
}

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(color: string): number {
  // Simple hex color parser (supports #RGB and #RRGGBB)
  let hex = color.replace('#', '');
  
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}
