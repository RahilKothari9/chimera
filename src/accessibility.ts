/**
 * Accessibility Manager
 * Handles screen reader announcements, ARIA live regions, and accessibility features
 */

export interface AccessibilityConfig {
  enableAnnouncements?: boolean;
  enableHighContrast?: boolean;
  announceDelay?: number;
}

export class AccessibilityManager {
  private liveRegion: HTMLElement | null = null;
  private config: AccessibilityConfig;
  private announceQueue: string[] = [];
  private isAnnouncing = false;

  constructor(config: AccessibilityConfig = {}) {
    this.config = {
      enableAnnouncements: config.enableAnnouncements ?? true,
      enableHighContrast: config.enableHighContrast ?? false,
      announceDelay: config.announceDelay ?? 100,
    };
  }

  /**
   * Initialize accessibility features
   */
  initialize(): void {
    this.createLiveRegion();
    this.createSkipLinks();
    this.setupHighContrastMode();
    this.addARIALabels();
  }

  /**
   * Create ARIA live region for screen reader announcements
   */
  private createLiveRegion(): void {
    if (this.liveRegion) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce a message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.config.enableAnnouncements || !this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.announceQueue.push(message);
    this.processAnnounceQueue();
  }

  /**
   * Process the announcement queue
   */
  private processAnnounceQueue(): void {
    if (this.isAnnouncing || this.announceQueue.length === 0) return;

    this.isAnnouncing = true;
    const message = this.announceQueue.shift()!;

    // Clear and then set the message to ensure it's announced
    if (this.liveRegion) {
      this.liveRegion.textContent = '';
      setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = message;
        }
        setTimeout(() => {
          this.isAnnouncing = false;
          this.processAnnounceQueue();
        }, this.config.announceDelay);
      }, 10);
    }
  }

  /**
   * Create skip navigation links
   */
  private createSkipLinks(): void {
    const skipNav = document.createElement('div');
    skipNav.className = 'skip-navigation';
    skipNav.innerHTML = `
      <a href="#app" class="skip-link">Skip to main content</a>
      <a href="#dashboard" class="skip-link">Skip to dashboard</a>
      <a href="#timeline" class="skip-link">Skip to timeline</a>
    `;
    document.body.insertBefore(skipNav, document.body.firstChild);
  }

  /**
   * Setup high contrast mode
   */
  private setupHighContrastMode(): void {
    if (!this.config.enableHighContrast) return;

    // Check for user preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }

    // Listen for changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('high-contrast');
        this.announce('High contrast mode enabled');
      } else {
        document.documentElement.classList.remove('high-contrast');
        this.announce('High contrast mode disabled');
      }
    });
  }

  /**
   * Toggle high contrast mode manually
   */
  toggleHighContrast(): void {
    const isHighContrast = document.documentElement.classList.toggle('high-contrast');
    this.announce(isHighContrast ? 'High contrast mode enabled' : 'High contrast mode disabled');
  }

  /**
   * Add ARIA labels to common elements
   */
  private addARIALabels(): void {
    // Add role to main content (but don't change the id)
    const app = document.querySelector('#app');
    if (app) {
      app.setAttribute('role', 'main');
      // Don't change the id - keep it as "app"
    }

    // Add navigation role to search
    const searchSection = document.querySelector('.search-container');
    if (searchSection) {
      searchSection.setAttribute('role', 'search');
      searchSection.setAttribute('aria-label', 'Filter evolution entries');
    }
  }

  /**
   * Set focus to an element
   */
  setFocus(element: HTMLElement | null, announce?: string): void {
    if (!element) return;

    element.focus();
    if (announce) {
      this.announce(announce);
    }
  }

  /**
   * Focus first focusable element in container
   */
  focusFirstIn(container: HTMLElement): void {
    const focusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    }
  }

  /**
   * Trap focus within a container (useful for modals)
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.liveRegion) {
      this.liveRegion.remove();
      this.liveRegion = null;
    }
  }
}

// Singleton instance
let accessibilityManager: AccessibilityManager | null = null;

export function getAccessibilityManager(): AccessibilityManager {
  if (!accessibilityManager) {
    accessibilityManager = new AccessibilityManager();
    accessibilityManager.initialize();
  }
  return accessibilityManager;
}

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  getAccessibilityManager().announce(message, priority);
}
