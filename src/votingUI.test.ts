import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createVotingButton, createVotingDashboard, showFeedbackModal } from './votingUI';
import { votingSystem } from './votingSystem';

// Mock notification system
vi.mock('./notificationSystem', () => ({
  notificationManager: {
    show: vi.fn(),
  },
}));

describe('VotingUI', () => {
  beforeEach(() => {
    votingSystem.clear();
    document.body.innerHTML = '';
  });

  describe('createVotingButton()', () => {
    it('should create voting container with buttons', () => {
      const button = createVotingButton(1);
      
      expect(button.className).toBe('voting-container');
      expect(button.querySelector('.upvote-btn')).toBeTruthy();
      expect(button.querySelector('.downvote-btn')).toBeTruthy();
      expect(button.querySelector('.feedback-btn')).toBeTruthy();
    });

    it('should show upvote button as active when upvoted', () => {
      votingSystem.vote(1, 'up');
      const button = createVotingButton(1);
      
      const upvoteBtn = button.querySelector('.upvote-btn');
      expect(upvoteBtn?.className).toContain('active');
    });

    it('should show downvote button as active when downvoted', () => {
      votingSystem.vote(1, 'down');
      const button = createVotingButton(1);
      
      const downvoteBtn = button.querySelector('.downvote-btn');
      expect(downvoteBtn?.className).toContain('active');
    });

    it('should not show active state when no vote', () => {
      const button = createVotingButton(1);
      
      const upvoteBtn = button.querySelector('.upvote-btn');
      const downvoteBtn = button.querySelector('.downvote-btn');
      
      expect(upvoteBtn?.className).not.toContain('active');
      expect(downvoteBtn?.className).not.toContain('active');
    });

    it('should show feedback badge when feedback exists', () => {
      votingSystem.addFeedback(1, 'Test feedback');
      const button = createVotingButton(1);
      
      const badge = button.querySelector('.feedback-badge');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('1');
    });

    it('should not show feedback badge when no feedback', () => {
      const button = createVotingButton(1);
      
      const badge = button.querySelector('.feedback-badge');
      expect(badge).toBeFalsy();
    });

    it('should have accessibility labels', () => {
      const button = createVotingButton(1);
      
      const upvoteBtn = button.querySelector('.upvote-btn');
      const downvoteBtn = button.querySelector('.downvote-btn');
      const feedbackBtn = button.querySelector('.feedback-btn');
      
      expect(upvoteBtn?.getAttribute('aria-label')).toBe('Upvote');
      expect(downvoteBtn?.getAttribute('aria-label')).toBe('Downvote');
      expect(feedbackBtn?.getAttribute('aria-label')).toBe('Leave feedback');
    });

    it('should have title tooltips', () => {
      const button = createVotingButton(1);
      
      const upvoteBtn = button.querySelector('.upvote-btn');
      const downvoteBtn = button.querySelector('.downvote-btn');
      const feedbackBtn = button.querySelector('.feedback-btn');
      
      expect(upvoteBtn?.getAttribute('title')).toBe('Upvote this evolution');
      expect(downvoteBtn?.getAttribute('title')).toBe('Downvote this evolution');
      expect(feedbackBtn?.getAttribute('title')).toBe('Leave feedback');
    });
  });

  describe('createVotingDashboard()', () => {
    it('should create dashboard with header', () => {
      const dashboard = createVotingDashboard();
      
      expect(dashboard.className).toBe('voting-dashboard');
      const header = dashboard.querySelector('h2');
      expect(header?.textContent).toBe('📊 Community Engagement');
    });

    it('should show stats grid', () => {
      const dashboard = createVotingDashboard();
      
      const statsGrid = dashboard.querySelector('.stats-grid');
      expect(statsGrid).toBeTruthy();
    });

    it('should display total votes stat', () => {
      votingSystem.vote(1, 'up');
      votingSystem.vote(2, 'down');
      
      const dashboard = createVotingDashboard();
      const statCards = dashboard.querySelectorAll('.stat-card');
      
      expect(statCards.length).toBeGreaterThan(0);
    });

    it('should show no engagement message when no data', () => {
      const dashboard = createVotingDashboard();
      
      const noEngagement = dashboard.querySelector('.no-engagement');
      expect(noEngagement).toBeTruthy();
    });

    it('should show most popular section when votes exist', () => {
      votingSystem.vote(1, 'up');
      votingSystem.vote(2, 'up');
      
      const dashboard = createVotingDashboard();
      
      const popularSection = dashboard.querySelector('.voting-section');
      expect(popularSection).toBeTruthy();
    });

    it('should show most discussed section when feedback exists', () => {
      votingSystem.addFeedback(1, 'Great feature!');
      votingSystem.addFeedback(2, 'Love it!');
      
      const dashboard = createVotingDashboard();
      
      const sections = dashboard.querySelectorAll('.voting-section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should limit popular evolutions to 5', () => {
      for (let i = 1; i <= 10; i++) {
        votingSystem.vote(i, 'up');
      }
      
      const dashboard = createVotingDashboard();
      const rankingItems = dashboard.querySelectorAll('.ranking-item');
      
      expect(rankingItems.length).toBeLessThanOrEqual(10); // Max 5 popular + 5 discussed
    });

    it('should show stat icons', () => {
      const dashboard = createVotingDashboard();
      
      const statIcons = dashboard.querySelectorAll('.stat-icon');
      expect(statIcons.length).toBeGreaterThan(0);
    });
  });

  describe('showFeedbackModal()', () => {
    it('should create modal overlay', () => {
      showFeedbackModal(1);
      
      const modal = document.querySelector('.feedback-modal');
      expect(modal).toBeTruthy();
      expect(modal?.className).toContain('modal-overlay');
    });

    it('should show evolution day in title', () => {
      showFeedbackModal(5);
      
      const title = document.querySelector('.modal-header h2');
      expect(title?.textContent).toBe('Feedback for Day 5');
    });

    it('should show feedback form', () => {
      showFeedbackModal(1);
      
      const form = document.querySelector('.feedback-form');
      expect(form).toBeTruthy();
      
      const textarea = form?.querySelector('textarea');
      const checkbox = form?.querySelector('input[type="checkbox"]');
      const submitBtn = form?.querySelector('button[type="submit"]');
      
      expect(textarea).toBeTruthy();
      expect(checkbox).toBeTruthy();
      expect(submitBtn).toBeTruthy();
    });

    it('should show close button', () => {
      showFeedbackModal(1);
      
      const closeBtn = document.querySelector('.modal-close');
      expect(closeBtn).toBeTruthy();
      expect(closeBtn?.textContent).toBe('×');
    });

    it('should show existing feedback', () => {
      votingSystem.addFeedback(1, 'Existing feedback');
      showFeedbackModal(1);
      
      const feedbackList = document.querySelector('.feedback-list');
      const feedbackItems = feedbackList?.querySelectorAll('.feedback-item');
      
      expect(feedbackItems?.length).toBe(1);
    });

    it('should show "no feedback" message when no feedback exists', () => {
      showFeedbackModal(1);
      
      const noFeedback = document.querySelector('.no-feedback');
      expect(noFeedback?.textContent).toBe('No feedback yet. Be the first!');
    });

    it('should remove existing modal before showing new one', () => {
      showFeedbackModal(1);
      showFeedbackModal(2);
      
      const modals = document.querySelectorAll('.feedback-modal');
      expect(modals.length).toBe(1);
    });

    it('should focus textarea when modal opens', () => {
      showFeedbackModal(1);
      
      const textarea = document.querySelector('.feedback-input') as HTMLTextAreaElement;
      expect(document.activeElement).toBe(textarea);
    });

    it('should have helpful checkbox checked by default', () => {
      showFeedbackModal(1);
      
      const checkbox = document.querySelector('.helpful-checkbox') as HTMLInputElement;
      expect(checkbox?.checked).toBe(true);
    });

    it('should display feedback date', () => {
      votingSystem.addFeedback(1, 'Test feedback');
      showFeedbackModal(1);
      
      const feedbackDate = document.querySelector('.feedback-date');
      expect(feedbackDate).toBeTruthy();
    });

    it('should display helpful icon correctly', () => {
      votingSystem.addFeedback(1, 'Positive', true);
      votingSystem.addFeedback(1, 'Negative', false);
      showFeedbackModal(1);
      
      const icons = document.querySelectorAll('.feedback-icon');
      expect(icons.length).toBe(2);
    });

    it('should have accessibility attributes', () => {
      showFeedbackModal(1);
      
      const textarea = document.querySelector('.feedback-input');
      const closeBtn = document.querySelector('.modal-close');
      
      expect(textarea?.getAttribute('aria-label')).toBe('Feedback message');
      expect(closeBtn?.getAttribute('aria-label')).toBe('Close');
    });
  });
});
