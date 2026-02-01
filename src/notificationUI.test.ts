/**
 * Tests for Notification UI Component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createNotificationContainer,
  createNotificationElement,
  removeNotificationElement,
  renderNotifications,
  initNotificationUI,
  cleanupNotificationUI,
} from './notificationUI';
import { notificationManager, type Notification } from './notificationSystem';

describe('Notification UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    notificationManager.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanupNotificationUI();
    vi.restoreAllMocks();
  });

  describe('createNotificationContainer', () => {
    it('should create and append container to body', () => {
      const container = createNotificationContainer();
      
      expect(container).toBeTruthy();
      expect(container.id).toBe('notification-container');
      expect(container.className).toBe('notification-container');
      expect(document.body.contains(container)).toBe(true);
    });

    it('should return existing container if already created', () => {
      const container1 = createNotificationContainer();
      const container2 = createNotificationContainer();
      
      expect(container1).toBe(container2);
      expect(document.querySelectorAll('#notification-container')).toHaveLength(1);
    });
  });

  describe('createNotificationElement', () => {
    it('should create notification element with correct structure', () => {
      const notification: Notification = {
        id: 'test-1',
        type: 'info',
        message: 'Test message',
        duration: 3000,
        timestamp: Date.now(),
      };

      const element = createNotificationElement(notification);
      
      expect(element.className).toContain('notification');
      expect(element.className).toContain('notification-info');
      expect(element.dataset.id).toBe('test-1');
      
      const icon = element.querySelector('.notification-icon');
      expect(icon).toBeTruthy();
      expect(icon?.textContent).toBe('ℹ');
      
      const message = element.querySelector('.notification-message');
      expect(message).toBeTruthy();
      expect(message?.textContent).toBe('Test message');
      
      const closeBtn = element.querySelector('.notification-close');
      expect(closeBtn).toBeTruthy();
      expect(closeBtn?.textContent).toBe('×');
    });

    it('should create success notification with correct icon', () => {
      const notification: Notification = {
        id: 'test-1',
        type: 'success',
        message: 'Success!',
        duration: 3000,
        timestamp: Date.now(),
      };

      const element = createNotificationElement(notification);
      const icon = element.querySelector('.notification-icon');
      
      expect(element.className).toContain('notification-success');
      expect(icon?.textContent).toBe('✓');
    });

    it('should create error notification with correct icon', () => {
      const notification: Notification = {
        id: 'test-1',
        type: 'error',
        message: 'Error!',
        duration: 3000,
        timestamp: Date.now(),
      };

      const element = createNotificationElement(notification);
      const icon = element.querySelector('.notification-icon');
      
      expect(element.className).toContain('notification-error');
      expect(icon?.textContent).toBe('✕');
    });

    it('should create warning notification with correct icon', () => {
      const notification: Notification = {
        id: 'test-1',
        type: 'warning',
        message: 'Warning!',
        duration: 3000,
        timestamp: Date.now(),
      };

      const element = createNotificationElement(notification);
      const icon = element.querySelector('.notification-icon');
      
      expect(element.className).toContain('notification-warning');
      expect(icon?.textContent).toBe('⚠');
    });

    it('should add enter animation class after delay', () => {
      const notification: Notification = {
        id: 'test-1',
        type: 'info',
        message: 'Test',
        duration: 3000,
        timestamp: Date.now(),
      };

      const element = createNotificationElement(notification);
      expect(element.className).not.toContain('notification-enter');
      
      vi.advanceTimersByTime(10);
      expect(element.className).toContain('notification-enter');
    });

    it('should dismiss notification when close button is clicked', () => {
      const notification: Notification = {
        id: 'test-1',
        type: 'info',
        message: 'Test',
        duration: 3000,
        timestamp: Date.now(),
      };

      const element = createNotificationElement(notification);
      const closeBtn = element.querySelector('.notification-close') as HTMLElement;
      
      const dismissSpy = vi.spyOn(notificationManager, 'dismiss');
      closeBtn.click();
      
      expect(dismissSpy).toHaveBeenCalledWith('test-1');
    });
  });

  describe('removeNotificationElement', () => {
    it('should add exit animation class', () => {
      const element = document.createElement('div');
      element.className = 'notification notification-enter';
      document.body.appendChild(element);
      
      removeNotificationElement(element);
      
      expect(element.className).not.toContain('notification-enter');
      expect(element.className).toContain('notification-exit');
    });

    it('should remove element after animation', () => {
      const element = document.createElement('div');
      element.className = 'notification';
      document.body.appendChild(element);
      
      expect(document.body.contains(element)).toBe(true);
      
      removeNotificationElement(element);
      vi.advanceTimersByTime(300);
      
      expect(document.body.contains(element)).toBe(false);
    });
  });

  describe('renderNotifications', () => {
    it('should render notifications in container', () => {
      const notifications: Notification[] = [
        {
          id: 'test-1',
          type: 'info',
          message: 'First',
          duration: 3000,
          timestamp: Date.now(),
        },
        {
          id: 'test-2',
          type: 'success',
          message: 'Second',
          duration: 3000,
          timestamp: Date.now(),
        },
      ];

      renderNotifications(notifications);
      
      const container = document.getElementById('notification-container');
      expect(container).toBeTruthy();
      
      const elements = container!.querySelectorAll('.notification');
      expect(elements).toHaveLength(2);
    });

    it('should add new notifications', () => {
      renderNotifications([
        {
          id: 'test-1',
          type: 'info',
          message: 'First',
          duration: 3000,
          timestamp: Date.now(),
        },
      ]);

      let elements = document.querySelectorAll('.notification');
      expect(elements).toHaveLength(1);

      renderNotifications([
        {
          id: 'test-1',
          type: 'info',
          message: 'First',
          duration: 3000,
          timestamp: Date.now(),
        },
        {
          id: 'test-2',
          type: 'success',
          message: 'Second',
          duration: 3000,
          timestamp: Date.now(),
        },
      ]);

      elements = document.querySelectorAll('.notification');
      expect(elements).toHaveLength(2);
    });

    it('should remove notifications no longer in list', () => {
      renderNotifications([
        {
          id: 'test-1',
          type: 'info',
          message: 'First',
          duration: 3000,
          timestamp: Date.now(),
        },
        {
          id: 'test-2',
          type: 'success',
          message: 'Second',
          duration: 3000,
          timestamp: Date.now(),
        },
      ]);

      let elements = document.querySelectorAll('.notification');
      expect(elements).toHaveLength(2);

      renderNotifications([
        {
          id: 'test-1',
          type: 'info',
          message: 'First',
          duration: 3000,
          timestamp: Date.now(),
        },
      ]);

      // Should start exit animation
      const exitingElement = document.querySelector('[data-id="test-2"]');
      expect(exitingElement?.className).toContain('notification-exit');
    });

    it('should handle empty notifications list', () => {
      renderNotifications([
        {
          id: 'test-1',
          type: 'info',
          message: 'Test',
          duration: 3000,
          timestamp: Date.now(),
        },
      ]);

      renderNotifications([]);
      
      // Element should be in exit state
      const element = document.querySelector('[data-id="test-1"]');
      expect(element?.className).toContain('notification-exit');
    });
  });

  describe('initNotificationUI', () => {
    it('should create container', () => {
      initNotificationUI();
      
      const container = document.getElementById('notification-container');
      expect(container).toBeTruthy();
    });

    it('should subscribe to notification manager', () => {
      initNotificationUI();
      
      notificationManager.show('Test notification');
      vi.advanceTimersByTime(10); // Wait for enter animation
      
      const notifications = document.querySelectorAll('.notification');
      expect(notifications).toHaveLength(1);
      expect(notifications[0].textContent).toContain('Test notification');
    });

    it('should update UI when notifications change', () => {
      initNotificationUI();
      
      notificationManager.show('First');
      vi.advanceTimersByTime(10);
      expect(document.querySelectorAll('.notification')).toHaveLength(1);
      
      notificationManager.show('Second');
      vi.advanceTimersByTime(10);
      expect(document.querySelectorAll('.notification')).toHaveLength(2);
    });
  });

  describe('cleanupNotificationUI', () => {
    it('should remove notification container', () => {
      createNotificationContainer();
      expect(document.getElementById('notification-container')).toBeTruthy();
      
      cleanupNotificationUI();
      expect(document.getElementById('notification-container')).toBeFalsy();
    });

    it('should handle cleanup when container does not exist', () => {
      expect(document.getElementById('notification-container')).toBeFalsy();
      
      // Should not throw
      cleanupNotificationUI();
      
      expect(document.getElementById('notification-container')).toBeFalsy();
    });
  });
});
