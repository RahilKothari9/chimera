/**
 * Notification System
 * 
 * Manages toast notifications for user feedback.
 * Supports different types (success, error, info, warning) with auto-dismiss.
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
  timestamp: number;
}

export interface NotificationOptions {
  type?: NotificationType;
  duration?: number; // milliseconds, 0 = no auto-dismiss
}

class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private nextId = 0;

  /**
   * Show a notification
   */
  show(message: string, options: NotificationOptions = {}): string {
    const notification: Notification = {
      id: `notification-${this.nextId++}`,
      type: options.type || 'info',
      message,
      duration: options.duration !== undefined ? options.duration : 3000,
      timestamp: Date.now(),
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-dismiss if duration is set
    if (notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  /**
   * Show a success notification
   */
  success(message: string, duration?: number): string {
    return this.show(message, { type: 'success', duration });
  }

  /**
   * Show an error notification
   */
  error(message: string, duration?: number): string {
    return this.show(message, { type: 'error', duration });
  }

  /**
   * Show an info notification
   */
  info(message: string, duration?: number): string {
    return this.show(message, { type: 'info', duration });
  }

  /**
   * Show a warning notification
   */
  warning(message: string, duration?: number): string {
    return this.show(message, { type: 'warning', duration });
  }

  /**
   * Dismiss a notification by ID
   */
  dismiss(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get all active notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    const current = this.getAll();
    this.listeners.forEach(listener => listener(current));
  }

  /**
   * Clear all notifications and listeners (for testing)
   */
  clear(): void {
    this.notifications = [];
    this.listeners.clear();
    this.nextId = 0;
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();
