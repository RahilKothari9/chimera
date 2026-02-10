import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { accessibilityManager, checkColorContrast } from './accessibilitySystem';

describe('Accessibility System', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    accessibilityManager.cleanup();
  });

  afterEach(() => {
    accessibilityManager.cleanup();
  });

  describe('Initialization', () => {
    it('should create ARIA live regions on initialization', () => {
      accessibilityManager.initialize();
      
      const alertRegion = document.querySelector('[role="alert"]');
      const statusRegion = document.querySelector('[role="status"]');
      
      expect(alertRegion).toBeTruthy();
      expect(statusRegion).toBeTruthy();
      expect(alertRegion?.getAttribute('aria-live')).toBe('assertive');
      expect(statusRegion?.getAttribute('aria-live')).toBe('polite');
    });

    it('should create skip links', () => {
      accessibilityManager.initialize();
      
      const skipLink = document.querySelector('.skip-link');
      expect(skipLink).toBeTruthy();
      expect(skipLink?.textContent).toBe('Skip to main content');
    });

    it('should setup keyboard navigation tracking', () => {
      accessibilityManager.initialize();
      
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      document.dispatchEvent(event);
      
      expect(document.body.classList.contains('keyboard-nav')).toBe(true);
    });

    it('should remove keyboard nav class on mouse interaction', () => {
      accessibilityManager.initialize();
      
      document.body.classList.add('keyboard-nav');
      const event = new MouseEvent('mousedown');
      document.dispatchEvent(event);
      
      expect(document.body.classList.contains('keyboard-nav')).toBe(false);
    });
  });

  describe('Screen Reader Announcements', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      accessibilityManager.initialize();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should announce polite messages to status region', () => {
      accessibilityManager.announce('Test message');
      vi.advanceTimersByTime(150);
      
      const statusRegion = document.querySelector('[role="status"]');
      expect(statusRegion?.textContent).toBe('Test message');
    });

    it('should announce assertive messages to alert region', () => {
      accessibilityManager.announce('Critical alert', { politeness: 'assertive' });
      vi.advanceTimersByTime(150);
      
      const alertRegion = document.querySelector('[role="alert"]');
      expect(alertRegion?.textContent).toBe('Critical alert');
    });

    it('should clear previous message before announcing new one', () => {
      const statusRegion = document.querySelector('[role="status"]');
      
      accessibilityManager.announce('First message');
      expect(statusRegion?.textContent).toBe('');
      
      vi.advanceTimersByTime(150);
      expect(statusRegion?.textContent).toBe('First message');
      
      accessibilityManager.announce('Second message');
      expect(statusRegion?.textContent).toBe('');
      
      vi.advanceTimersByTime(150);
      expect(statusRegion?.textContent).toBe('Second message');
    });
  });

  describe('Skip Links', () => {
    beforeEach(() => {
      accessibilityManager.initialize();
    });

    it('should focus main content when skip link is clicked', () => {
      const mainContent = document.createElement('div');
      mainContent.id = 'main-content';
      mainContent.tabIndex = -1;
      document.body.appendChild(mainContent);
      
      const skipLink = document.querySelector('.skip-link') as HTMLAnchorElement;
      skipLink.click();
      
      expect(document.activeElement).toBe(mainContent);
    });

    it('should handle missing main content gracefully', () => {
      const skipLink = document.querySelector('.skip-link') as HTMLAnchorElement;
      
      expect(() => skipLink.click()).not.toThrow();
    });
  });

  describe('Accessibility Audit', () => {
    beforeEach(() => {
      accessibilityManager.initialize();
    });

    it('should detect missing alt text on images', () => {
      const img = document.createElement('img');
      img.src = 'test.jpg';
      document.body.appendChild(img);
      
      const result = accessibilityManager.audit();
      
      const altIssue = result.issues.find(i => i.issue === 'Missing alt attribute');
      expect(altIssue).toBeTruthy();
      expect(altIssue?.severity).toBe('critical');
      expect(altIssue?.wcagLevel).toBe('A');
    });

    it('should not flag images with alt text', () => {
      const img = document.createElement('img');
      img.src = 'test.jpg';
      img.alt = 'Test image';
      document.body.appendChild(img);
      
      const result = accessibilityManager.audit();
      
      const altIssue = result.issues.find(i => i.issue === 'Missing alt attribute');
      expect(altIssue).toBeFalsy();
    });

    it('should detect missing form labels', () => {
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);
      
      const result = accessibilityManager.audit();
      
      const labelIssue = result.issues.find(i => i.issue.includes('missing accessible label'));
      expect(labelIssue).toBeTruthy();
      expect(labelIssue?.severity).toBe('critical');
    });

    it('should not flag inputs with aria-label', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('aria-label', 'Search');
      document.body.appendChild(input);
      
      const result = accessibilityManager.audit();
      
      const labelIssue = result.issues.find(
        i => i.issue.includes('missing accessible label')
      );
      expect(labelIssue).toBeFalsy();
    });

    it('should not flag inputs with associated labels', () => {
      const label = document.createElement('label');
      label.htmlFor = 'test-input';
      label.textContent = 'Test Label';
      
      const input = document.createElement('input');
      input.id = 'test-input';
      input.type = 'text';
      
      document.body.appendChild(label);
      document.body.appendChild(input);
      
      const result = accessibilityManager.audit();
      
      const labelIssue = result.issues.find(
        i => i.issue.includes('missing accessible label')
      );
      expect(labelIssue).toBeFalsy();
    });

    it('should detect missing button text', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      
      const result = accessibilityManager.audit();
      
      const buttonIssue = result.issues.find(i => i.issue.includes('Button missing'));
      expect(buttonIssue).toBeTruthy();
      expect(buttonIssue?.severity).toBe('critical');
    });

    it('should not flag buttons with text content', () => {
      const button = document.createElement('button');
      button.textContent = 'Click me';
      document.body.appendChild(button);
      
      const result = accessibilityManager.audit();
      
      const buttonIssue = result.issues.find(i => i.issue.includes('Button missing'));
      expect(buttonIssue).toBeFalsy();
    });

    it('should not flag buttons with aria-label', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Close');
      document.body.appendChild(button);
      
      const result = accessibilityManager.audit();
      
      const buttonIssue = result.issues.find(i => i.issue.includes('Button missing'));
      expect(buttonIssue).toBeFalsy();
    });

    it('should detect missing main landmark', () => {
      const result = accessibilityManager.audit();
      
      const mainIssue = result.issues.find(i => i.issue.includes('Missing main landmark'));
      expect(mainIssue).toBeTruthy();
      expect(mainIssue?.severity).toBe('serious');
    });

    it('should not flag page with main element', () => {
      const main = document.createElement('main');
      document.body.appendChild(main);
      
      const result = accessibilityManager.audit();
      
      const mainIssue = result.issues.find(i => i.issue.includes('Missing main landmark'));
      expect(mainIssue).toBeFalsy();
    });

    it('should not flag page with role="main"', () => {
      const div = document.createElement('div');
      div.setAttribute('role', 'main');
      document.body.appendChild(div);
      
      const result = accessibilityManager.audit();
      
      const mainIssue = result.issues.find(i => i.issue.includes('Missing main landmark'));
      expect(mainIssue).toBeFalsy();
    });

    it('should detect heading hierarchy issues', () => {
      const h1 = document.createElement('h1');
      const h3 = document.createElement('h3'); // Skips h2
      
      document.body.appendChild(h1);
      document.body.appendChild(h3);
      
      const result = accessibilityManager.audit();
      
      const headingIssue = result.issues.find(i => i.issue.includes('Heading level skipped'));
      expect(headingIssue).toBeTruthy();
      expect(headingIssue?.severity).toBe('moderate');
    });

    it('should not flag proper heading hierarchy', () => {
      const h1 = document.createElement('h1');
      const h2 = document.createElement('h2');
      const h3 = document.createElement('h3');
      
      document.body.appendChild(h1);
      document.body.appendChild(h2);
      document.body.appendChild(h3);
      
      const result = accessibilityManager.audit();
      
      const headingIssue = result.issues.find(i => i.issue.includes('Heading level skipped'));
      expect(headingIssue).toBeFalsy();
    });

    it('should detect non-keyboard-accessible clickable elements', () => {
      const div = document.createElement('div');
      div.setAttribute('onclick', 'doSomething()');
      document.body.appendChild(div);
      
      const result = accessibilityManager.audit();
      
      const keyboardIssue = result.issues.find(
        i => i.issue.includes('not keyboard accessible')
      );
      expect(keyboardIssue).toBeTruthy();
      expect(keyboardIssue?.severity).toBe('serious');
    });

    it('should not flag buttons with onclick', () => {
      const button = document.createElement('button');
      button.setAttribute('onclick', 'doSomething()');
      button.textContent = 'Click';
      document.body.appendChild(button);
      
      const result = accessibilityManager.audit();
      
      const keyboardIssue = result.issues.find(
        i => i.issue.includes('not keyboard accessible')
      );
      expect(keyboardIssue).toBeFalsy();
    });

    it('should calculate correct issue counts', () => {
      // Add multiple issues of different severities
      const img = document.createElement('img');
      img.src = 'test.jpg'; // Missing alt - critical
      
      const input = document.createElement('input');
      input.type = 'text'; // Missing label - critical
      
      const h1 = document.createElement('h1');
      const h3 = document.createElement('h3'); // Skipped heading - moderate
      
      document.body.appendChild(img);
      document.body.appendChild(input);
      document.body.appendChild(h1);
      document.body.appendChild(h3);
      
      const result = accessibilityManager.audit();
      
      expect(result.totalIssues).toBeGreaterThan(0);
      expect(result.criticalIssues).toBeGreaterThanOrEqual(2);
      expect(result.moderateIssues).toBeGreaterThanOrEqual(1);
    });

    it('should calculate accessibility score', () => {
      const result = accessibilityManager.audit();
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should return perfect score with no issues', () => {
      const main = document.createElement('main');
      document.body.appendChild(main);
      
      const result = accessibilityManager.audit();
      
      // Should have very few or no issues
      expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it('should include timestamp in audit result', () => {
      const before = new Date();
      const result = accessibilityManager.audit();
      const after = new Date();
      
      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Statistics', () => {
    it('should return false stats before initialization', () => {
      const stats = accessibilityManager.getStats();
      
      expect(stats.hasLiveRegions).toBe(false);
      expect(stats.hasSkipLinks).toBe(false);
    });

    it('should return true stats after initialization', () => {
      accessibilityManager.initialize();
      const stats = accessibilityManager.getStats();
      
      expect(stats.hasLiveRegions).toBe(true);
      expect(stats.hasSkipLinks).toBe(true);
      expect(stats.keyboardNavEnabled).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should remove live regions on cleanup', () => {
      accessibilityManager.initialize();
      expect(document.querySelector('[role="alert"]')).toBeTruthy();
      
      accessibilityManager.cleanup();
      expect(document.querySelector('[role="alert"]')).toBeFalsy();
      expect(document.querySelector('[role="status"]')).toBeFalsy();
    });

    it('should remove skip links on cleanup', () => {
      accessibilityManager.initialize();
      expect(document.querySelector('.skip-link')).toBeTruthy();
      
      accessibilityManager.cleanup();
      expect(document.querySelector('.skip-link')).toBeFalsy();
    });
  });

  describe('Color Contrast', () => {
    it('should pass AA contrast for black on white', () => {
      const result = checkColorContrast('#000000', '#FFFFFF', 'AA');
      expect(result).toBe(true);
    });

    it('should pass AAA contrast for black on white', () => {
      const result = checkColorContrast('#000000', '#FFFFFF', 'AAA');
      expect(result).toBe(true);
    });

    it('should fail AA contrast for light gray on white', () => {
      const result = checkColorContrast('#CCCCCC', '#FFFFFF', 'AA');
      expect(result).toBe(false);
    });

    it('should fail AAA contrast for medium gray on white', () => {
      const result = checkColorContrast('#666666', '#FFFFFF', 'AAA');
      expect(result).toBe(false);
    });

    it('should handle 3-digit hex colors', () => {
      const result = checkColorContrast('#000', '#FFF', 'AA');
      expect(result).toBe(true);
    });

    it('should work with colors in any order', () => {
      const result1 = checkColorContrast('#000000', '#FFFFFF', 'AA');
      const result2 = checkColorContrast('#FFFFFF', '#000000', 'AA');
      expect(result1).toBe(result2);
    });

    it('should default to AA level', () => {
      const resultAA = checkColorContrast('#000000', '#FFFFFF', 'AA');
      const resultDefault = checkColorContrast('#000000', '#FFFFFF');
      expect(resultAA).toBe(resultDefault);
    });
  });
});
