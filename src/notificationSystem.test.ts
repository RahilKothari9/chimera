/**
 * Tests for Notification System
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { notificationManager } from './notificationSystem';

describe('Notification System', () => {
  beforeEach(() => {
    notificationManager.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('show', () => {
    it('should create a notification with default options', () => {
      const id = notificationManager.show('Test message');
      const notifications = notificationManager.getAll();
      
      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBe(id);
      expect(notifications[0].message).toBe('Test message');
      expect(notifications[0].type).toBe('info');
      expect(notifications[0].duration).toBe(3000);
    });

    it('should create a notification with custom type', () => {
      notificationManager.show('Test', { type: 'success' });
      const notifications = notificationManager.getAll();
      
      expect(notifications[0].type).toBe('success');
    });

    it('should create a notification with custom duration', () => {
      notificationManager.show('Test', { duration: 5000 });
      const notifications = notificationManager.getAll();
      
      expect(notifications[0].duration).toBe(5000);
    });

    it('should create a notification with no auto-dismiss', () => {
      notificationManager.show('Test', { duration: 0 });
      const notifications = notificationManager.getAll();
      
      expect(notifications[0].duration).toBe(0);
    });

    it('should generate unique IDs for notifications', () => {
      const id1 = notificationManager.show('First');
      const id2 = notificationManager.show('Second');
      
      expect(id1).not.toBe(id2);
    });

    it('should auto-dismiss notification after duration', () => {
      notificationManager.show('Test', { duration: 1000 });
      expect(notificationManager.getAll()).toHaveLength(1);
      
      vi.advanceTimersByTime(1000);
      expect(notificationManager.getAll()).toHaveLength(0);
    });

    it('should not auto-dismiss when duration is 0', () => {
      notificationManager.show('Test', { duration: 0 });
      expect(notificationManager.getAll()).toHaveLength(1);
      
      vi.advanceTimersByTime(10000);
      expect(notificationManager.getAll()).toHaveLength(1);
    });

    it('should set timestamp on notification', () => {
      const before = Date.now();
      notificationManager.show('Test');
      const notifications = notificationManager.getAll();
      const after = Date.now();
      
      expect(notifications[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(notifications[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('convenience methods', () => {
    it('should create success notification', () => {
      notificationManager.success('Success!');
      const notifications = notificationManager.getAll();
      
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].message).toBe('Success!');
    });

    it('should create error notification', () => {
      notificationManager.error('Error!');
      const notifications = notificationManager.getAll();
      
      expect(notifications[0].type).toBe('error');
      expect(notifications[0].message).toBe('Error!');
    });

    it('should create info notification', () => {
      notificationManager.info('Info!');
      const notifications = notificationManager.getAll();
      
      expect(notifications[0].type).toBe('info');
      expect(notifications[0].message).toBe('Info!');
    });

    it('should create warning notification', () => {
      notificationManager.warning('Warning!');
      const notifications = notificationManager.getAll();
      
      expect(notifications[0].type).toBe('warning');
      expect(notifications[0].message).toBe('Warning!');
    });

    it('should accept custom duration in convenience methods', () => {
      notificationManager.success('Test', 5000);
      const notifications = notificationManager.getAll();
      
      expect(notifications[0].duration).toBe(5000);
    });
  });

  describe('dismiss', () => {
    it('should dismiss notification by ID', () => {
      const id1 = notificationManager.show('First');
      const id2 = notificationManager.show('Second');
      
      expect(notificationManager.getAll()).toHaveLength(2);
      
      notificationManager.dismiss(id1);
      expect(notificationManager.getAll()).toHaveLength(1);
      expect(notificationManager.getAll()[0].id).toBe(id2);
    });

    it('should handle dismissing non-existent notification', () => {
      notificationManager.show('Test');
      expect(notificationManager.getAll()).toHaveLength(1);
      
      notificationManager.dismiss('invalid-id');
      expect(notificationManager.getAll()).toHaveLength(1);
    });
  });

  describe('dismissAll', () => {
    it('should dismiss all notifications', () => {
      notificationManager.show('First');
      notificationManager.show('Second');
      notificationManager.show('Third');
      
      expect(notificationManager.getAll()).toHaveLength(3);
      
      notificationManager.dismissAll();
      expect(notificationManager.getAll()).toHaveLength(0);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no notifications', () => {
      expect(notificationManager.getAll()).toEqual([]);
    });

    it('should return all active notifications', () => {
      notificationManager.show('First');
      notificationManager.show('Second');
      
      const notifications = notificationManager.getAll();
      expect(notifications).toHaveLength(2);
      expect(notifications[0].message).toBe('First');
      expect(notifications[1].message).toBe('Second');
    });

    it('should return a copy of the notifications array', () => {
      notificationManager.show('Test');
      const notifications1 = notificationManager.getAll();
      const notifications2 = notificationManager.getAll();
      
      expect(notifications1).not.toBe(notifications2);
      expect(notifications1).toEqual(notifications2);
    });
  });

  describe('subscribe', () => {
    it('should notify listener when notification is added', () => {
      const listener = vi.fn();
      notificationManager.subscribe(listener);
      
      notificationManager.show('Test');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Test' })
        ])
      );
    });

    it('should notify listener when notification is dismissed', () => {
      const listener = vi.fn();
      const id = notificationManager.show('Test');
      notificationManager.subscribe(listener);
      
      listener.mockClear();
      notificationManager.dismiss(id);
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith([]);
    });

    it('should notify multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      notificationManager.subscribe(listener1);
      notificationManager.subscribe(listener2);
      
      notificationManager.show('Test');
      
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = notificationManager.subscribe(listener);
      
      notificationManager.show('Test');
      expect(listener).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      listener.mockClear();
      
      notificationManager.show('Test 2');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle unsubscribe being called multiple times', () => {
      const listener = vi.fn();
      const unsubscribe = notificationManager.subscribe(listener);
      
      unsubscribe();
      unsubscribe(); // Should not throw
      
      notificationManager.show('Test');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all notifications and listeners', () => {
      const listener = vi.fn();
      notificationManager.subscribe(listener);
      notificationManager.show('Test');
      
      notificationManager.clear();
      
      expect(notificationManager.getAll()).toEqual([]);
      
      listener.mockClear(); // Clear previous calls
      notificationManager.show('Test 2');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should reset ID counter', () => {
      notificationManager.show('Test 1');
      notificationManager.show('Test 2');
      notificationManager.clear();
      
      const id = notificationManager.show('Test 3');
      expect(id).toBe('notification-0');
    });
  });

  describe('multiple notifications', () => {
    it('should handle multiple notifications with different durations', () => {
      notificationManager.show('Short', { duration: 1000 });
      notificationManager.show('Long', { duration: 5000 });
      notificationManager.show('Permanent', { duration: 0 });
      
      expect(notificationManager.getAll()).toHaveLength(3);
      
      vi.advanceTimersByTime(1000);
      expect(notificationManager.getAll()).toHaveLength(2);
      
      vi.advanceTimersByTime(4000);
      expect(notificationManager.getAll()).toHaveLength(1);
      expect(notificationManager.getAll()[0].message).toBe('Permanent');
    });

    it('should maintain order of notifications', () => {
      notificationManager.show('First');
      notificationManager.show('Second');
      notificationManager.show('Third');
      
      const notifications = notificationManager.getAll();
      expect(notifications[0].message).toBe('First');
      expect(notifications[1].message).toBe('Second');
      expect(notifications[2].message).toBe('Third');
    });
  });
});
