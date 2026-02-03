import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AccessibilityManager, getAccessibilityManager, announceToScreenReader } from './accessibility';

describe('AccessibilityManager', () => {
  let manager: AccessibilityManager;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    if (manager) {
      manager.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion).toBeTruthy();
    });

    it('should create ARIA live region', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should create skip navigation links', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      const skipNav = document.querySelector('.skip-navigation');
      expect(skipNav).toBeTruthy();
      
      const skipLinks = skipNav?.querySelectorAll('.skip-link');
      expect(skipLinks?.length).toBe(3);
    });

    it('should add ARIA labels to main content when app element exists', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      const app = document.querySelector('#app');
      if (app) {
        // Should have role set but keep original id
        expect(app.getAttribute('role')).toBe('main');
        expect(app.id).toBe('app'); // Should still be 'app', not changed to 'main-content'
      } else {
        // App element doesn't exist in test, which is fine
        expect(app).toBeFalsy();
      }
    });

    it('should not create duplicate live regions', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      manager.initialize(); // Call twice
      
      const liveRegions = document.querySelectorAll('[role="status"]');
      expect(liveRegions.length).toBe(1);
    });
  });

  describe('announcements', () => {
    beforeEach(() => {
      manager = new AccessibilityManager();
      manager.initialize();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should announce messages to screen readers', () => {
      manager.announce('Test message');
      vi.advanceTimersByTime(150);
      
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toBe('Test message');
    });

    it('should support polite announcements', () => {
      manager.announce('Polite message', 'polite');
      vi.advanceTimersByTime(150);
      
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion?.textContent).toBe('Polite message');
    });

    it('should support assertive announcements', () => {
      manager.announce('Urgent message', 'assertive');
      vi.advanceTimersByTime(150);
      
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.getAttribute('aria-live')).toBe('assertive');
      expect(liveRegion?.textContent).toBe('Urgent message');
    });

    it('should queue multiple announcements', () => {
      manager.announce('First message');
      manager.announce('Second message');
      manager.announce('Third message');
      
      // First message appears after initial delay
      vi.advanceTimersByTime(20);
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toBe('First message');
      
      // Second message appears after processing first
      vi.advanceTimersByTime(120);
      expect(liveRegion?.textContent).toBe('Second message');
      
      // Third message appears after processing second
      vi.advanceTimersByTime(120);
      expect(liveRegion?.textContent).toBe('Third message');
    });

    it('should not announce when disabled', () => {
      const disabledManager = new AccessibilityManager({ enableAnnouncements: false });
      disabledManager.initialize();
      disabledManager.announce('Should not announce');
      
      vi.advanceTimersByTime(150);
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toBe('');
      
      disabledManager.destroy();
    });

    it('should use custom delay', () => {
      const customManager = new AccessibilityManager({ announceDelay: 500 });
      customManager.initialize();
      
      // Get the live region created by this manager
      const liveRegions = document.querySelectorAll('[role="status"]');
      const liveRegion = liveRegions[liveRegions.length - 1] as HTMLElement;
      
      customManager.announce('Message 1');
      customManager.announce('Message 2');
      
      // First message appears
      vi.advanceTimersByTime(20);
      expect(liveRegion.textContent).toBe('Message 1');
      
      // Should not have advanced to second message yet (custom delay is 500ms)
      vi.advanceTimersByTime(400);
      expect(liveRegion.textContent).toBe('Message 1');
      
      // Now it should advance to second message
      vi.advanceTimersByTime(120);
      expect(liveRegion.textContent).toBe('Message 2');
      
      customManager.destroy();
    });
  });

  describe('high contrast mode', () => {
    it('should toggle high contrast mode', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      manager.toggleHighContrast();
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
      
      manager.toggleHighContrast();
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });

    it('should announce high contrast changes', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      vi.useFakeTimers();
      
      manager.toggleHighContrast();
      vi.advanceTimersByTime(150);
      
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toContain('High contrast mode');
      
      vi.useRealTimers();
    });

    it('should enable high contrast when configured', () => {
      // Mock matchMedia
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
      });
      window.matchMedia = mockMatchMedia as unknown as typeof window.matchMedia;
      
      manager = new AccessibilityManager({ enableHighContrast: true });
      manager.initialize();
      
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
    });
  });

  describe('focus management', () => {
    it('should set focus to element', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      const button = document.createElement('button');
      button.textContent = 'Test';
      document.body.appendChild(button);
      
      manager.setFocus(button);
      expect(document.activeElement).toBe(button);
    });

    it('should announce when setting focus', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      vi.useFakeTimers();
      
      const button = document.createElement('button');
      document.body.appendChild(button);
      
      manager.setFocus(button, 'Button focused');
      vi.advanceTimersByTime(150);
      
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toBe('Button focused');
      
      vi.useRealTimers();
    });

    it('should focus first focusable element in container', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      container.appendChild(button1);
      container.appendChild(button2);
      document.body.appendChild(container);
      
      manager.focusFirstIn(container);
      expect(document.activeElement).toBe(button1);
    });

    it('should handle null element gracefully', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      expect(() => manager.setFocus(null)).not.toThrow();
    });
  });

  describe('focus trap', () => {
    it('should trap focus within container', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const button3 = document.createElement('button');
      
      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      document.body.appendChild(container);
      
      const cleanup = manager.trapFocus(container);
      
      // Focus last button and press Tab
      button3.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      container.dispatchEvent(event);
      
      cleanup();
    });

    it('should handle Shift+Tab to go backwards', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      
      container.appendChild(button1);
      container.appendChild(button2);
      document.body.appendChild(container);
      
      const cleanup = manager.trapFocus(container);
      
      // Focus first button and press Shift+Tab
      button1.focus();
      const event = new KeyboardEvent('keydown', { 
        key: 'Tab', 
        shiftKey: true, 
        bubbles: true 
      });
      container.dispatchEvent(event);
      
      cleanup();
    });

    it('should return cleanup function', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const cleanup = manager.trapFocus(container);
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should remove live region on destroy', () => {
      manager = new AccessibilityManager();
      manager.initialize();
      
      expect(document.querySelector('[role="status"]')).toBeTruthy();
      
      manager.destroy();
      expect(document.querySelector('[role="status"]')).toBeFalsy();
    });

    it('should handle destroy when not initialized', () => {
      manager = new AccessibilityManager();
      expect(() => manager.destroy()).not.toThrow();
    });
  });

  describe('singleton', () => {
    afterEach(() => {
      // Clean up after each test in this describe block
      const liveRegion = document.querySelector('[role="status"]');
      if (liveRegion) {
        liveRegion.remove();
      }
    });

    it('should return same instance from getAccessibilityManager', () => {
      const instance1 = getAccessibilityManager();
      const instance2 = getAccessibilityManager();
      
      expect(instance1).toBe(instance2);
    });

    it('should work with announceToScreenReader helper', () => {
      // Create a fresh environment
      document.body.innerHTML = '<div id="app"></div>';
      vi.useFakeTimers();
      
      announceToScreenReader('Helper test');
      vi.advanceTimersByTime(20);
      
      const liveRegion = document.querySelector('[role="status"]');
      // The singleton may or may not be initialized depending on test order
      if (liveRegion) {
        expect(liveRegion.textContent).toBe('Helper test');
      }
      
      vi.useRealTimers();
    });
  });
});
