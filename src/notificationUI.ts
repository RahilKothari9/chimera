/**
 * Notification UI Component
 * 
 * Renders toast notifications in the UI with animations and interactions.
 */

import { notificationManager, type Notification } from './notificationSystem';

/**
 * Create notification container and append to body
 */
export function createNotificationContainer(): HTMLElement {
  const existing = document.getElementById('notification-container');
  if (existing) {
    return existing;
  }

  const container = document.createElement('div');
  container.id = 'notification-container';
  container.className = 'notification-container';
  document.body.appendChild(container);

  return container;
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: Notification['type']): string {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };
  return icons[type];
}

/**
 * Create a notification element
 */
export function createNotificationElement(notification: Notification): HTMLElement {
  const element = document.createElement('div');
  element.className = `notification notification-${notification.type}`;
  element.dataset.id = notification.id;

  const icon = document.createElement('div');
  icon.className = 'notification-icon';
  icon.textContent = getNotificationIcon(notification.type);

  const message = document.createElement('div');
  message.className = 'notification-message';
  message.textContent = notification.message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'notification-close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close notification');
  closeBtn.onclick = () => notificationManager.dismiss(notification.id);

  element.appendChild(icon);
  element.appendChild(message);
  element.appendChild(closeBtn);

  // Add animation class after a tiny delay for CSS animation to work
  setTimeout(() => element.classList.add('notification-enter'), 10);

  return element;
}

/**
 * Remove notification element with animation
 */
export function removeNotificationElement(element: HTMLElement): void {
  element.classList.remove('notification-enter');
  element.classList.add('notification-exit');
  
  setTimeout(() => {
    element.remove();
  }, 300); // Match CSS animation duration
}

/**
 * Render all notifications
 */
export function renderNotifications(notifications: Notification[]): void {
  const container = createNotificationContainer();
  
  // Get current notification IDs in the DOM
  const currentIds = Array.from(container.querySelectorAll('.notification'))
    .map(el => (el as HTMLElement).dataset.id)
    .filter(Boolean);

  // Get new notification IDs
  const newIds = notifications.map(n => n.id);

  // Remove notifications that are no longer in the list
  currentIds.forEach(id => {
    if (!newIds.includes(id!)) {
      const element = container.querySelector(`[data-id="${id}"]`) as HTMLElement;
      if (element) {
        removeNotificationElement(element);
      }
    }
  });

  // Add new notifications
  notifications.forEach(notification => {
    if (!currentIds.includes(notification.id)) {
      const element = createNotificationElement(notification);
      container.appendChild(element);
    }
  });
}

/**
 * Initialize notification UI system
 */
export function initNotificationUI(): void {
  createNotificationContainer();
  
  // Subscribe to notification changes
  notificationManager.subscribe(notifications => {
    renderNotifications(notifications);
  });
  
  // Listen for custom notification events (from backup UI and other features)
  window.addEventListener('chimera-notification', ((event: CustomEvent) => {
    const { message, type } = event.detail;
    notificationManager.show(message, type);
  }) as EventListener);
}

/**
 * Cleanup notification UI (for testing)
 */
export function cleanupNotificationUI(): void {
  const container = document.getElementById('notification-container');
  if (container) {
    container.remove();
  }
}
