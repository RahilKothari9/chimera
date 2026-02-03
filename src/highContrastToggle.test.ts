import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createHighContrastToggle, initializeHighContrastToggle } from './highContrastToggle';

describe('High Contrast Toggle', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.classList.remove('high-contrast');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.classList.remove('high-contrast');
  });

  describe('createHighContrastToggle', () => {
    it('should create a toggle button', () => {
      const toggle = createHighContrastToggle();
      
      expect(toggle.tagName).toBe('BUTTON');
      expect(toggle.className).toBe('high-contrast-toggle');
    });

    it('should have proper ARIA attributes', () => {
      const toggle = createHighContrastToggle();
      
      expect(toggle.getAttribute('aria-label')).toBe('Toggle high contrast mode');
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
      expect(toggle.title).toContain('high contrast');
    });

    it('should display half-filled circle icon', () => {
      const toggle = createHighContrastToggle();
      
      expect(toggle.innerHTML).toBe('◐');
    });

    it('should toggle high contrast on click', () => {
      const toggle = createHighContrastToggle();
      document.body.appendChild(toggle);
      
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
      
      toggle.click();
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
      
      toggle.click();
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
    });

    it('should reflect initial high contrast state', () => {
      document.documentElement.classList.add('high-contrast');
      
      const toggle = createHighContrastToggle();
      
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
    });

    it('should update aria-pressed when toggled multiple times', () => {
      const toggle = createHighContrastToggle();
      document.body.appendChild(toggle);
      
      toggle.click();
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
      
      toggle.click();
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
      
      toggle.click();
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('initializeHighContrastToggle', () => {
    it('should add toggle button to body', () => {
      initializeHighContrastToggle();
      
      const toggle = document.querySelector('.high-contrast-toggle');
      expect(toggle).toBeTruthy();
      expect(toggle?.parentElement).toBe(document.body);
    });

    it('should create functional toggle button', () => {
      initializeHighContrastToggle();
      
      const toggle = document.querySelector('.high-contrast-toggle') as HTMLElement;
      expect(toggle).toBeTruthy();
      
      toggle.click();
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });
  });
});
