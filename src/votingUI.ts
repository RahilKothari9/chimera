/**
 * Voting UI Components
 * 
 * Provides interactive voting buttons and feedback interface for evolution entries
 */

import { votingSystem, type VotingStats } from './votingSystem';
import { notificationManager } from './notificationSystem';

// Helper function to show notifications
function showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success'): void {
  notificationManager.show(message, { type });
}

/**
 * Create voting button for an evolution entry
 */
export function createVotingButton(evolutionDay: number): HTMLElement {
  const container = document.createElement('div');
  container.className = 'voting-container';

  const currentVote = votingSystem.getVote(evolutionDay);
  
  // Upvote button
  const upvoteBtn = document.createElement('button');
  upvoteBtn.className = `vote-btn upvote-btn${currentVote === 'up' ? ' active' : ''}`;
  upvoteBtn.innerHTML = '👍';
  upvoteBtn.title = 'Upvote this evolution';
  upvoteBtn.setAttribute('aria-label', 'Upvote');
  
  // Downvote button
  const downvoteBtn = document.createElement('button');
  downvoteBtn.className = `vote-btn downvote-btn${currentVote === 'down' ? ' active' : ''}`;
  downvoteBtn.innerHTML = '👎';
  downvoteBtn.title = 'Downvote this evolution';
  downvoteBtn.setAttribute('aria-label', 'Downvote');

  // Feedback button
  const feedbackBtn = document.createElement('button');
  feedbackBtn.className = 'feedback-btn';
  feedbackBtn.innerHTML = '💬';
  feedbackBtn.title = 'Leave feedback';
  feedbackBtn.setAttribute('aria-label', 'Leave feedback');
  
  const stats = votingSystem.getStats(evolutionDay);
  if (stats.feedbackCount > 0) {
    const badge = document.createElement('span');
    badge.className = 'feedback-badge';
    badge.textContent = stats.feedbackCount.toString();
    feedbackBtn.appendChild(badge);
  }

  // Handle upvote
  upvoteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const newVote = currentVote === 'up' ? null : 'up';
    votingSystem.vote(evolutionDay, newVote);
    
    if (newVote === 'up') {
      showNotification('Upvoted! Thanks for your feedback.', 'success');
    }
    
    updateVotingUI(container, evolutionDay);
  });

  // Handle downvote
  downvoteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const newVote = currentVote === 'down' ? null : 'down';
    votingSystem.vote(evolutionDay, newVote);
    
    if (newVote === 'down') {
      showNotification('Thanks for your feedback!', 'success');
    }
    
    updateVotingUI(container, evolutionDay);
  });

  // Handle feedback
  feedbackBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showFeedbackModal(evolutionDay);
  });

  container.appendChild(upvoteBtn);
  container.appendChild(downvoteBtn);
  container.appendChild(feedbackBtn);

  return container;
}

/**
 * Update voting UI to reflect current state
 */
function updateVotingUI(container: HTMLElement, evolutionDay: number): void {
  const currentVote = votingSystem.getVote(evolutionDay);
  
  const upvoteBtn = container.querySelector('.upvote-btn');
  const downvoteBtn = container.querySelector('.downvote-btn');
  
  if (upvoteBtn) {
    upvoteBtn.className = `vote-btn upvote-btn${currentVote === 'up' ? ' active' : ''}`;
  }
  
  if (downvoteBtn) {
    downvoteBtn.className = `vote-btn downvote-btn${currentVote === 'down' ? ' active' : ''}`;
  }

  // Update feedback badge
  const feedbackBtn = container.querySelector('.feedback-btn');
  if (feedbackBtn) {
    const stats = votingSystem.getStats(evolutionDay);
    const existingBadge = feedbackBtn.querySelector('.feedback-badge');
    
    if (stats.feedbackCount > 0) {
      if (existingBadge) {
        existingBadge.textContent = stats.feedbackCount.toString();
      } else {
        const badge = document.createElement('span');
        badge.className = 'feedback-badge';
        badge.textContent = stats.feedbackCount.toString();
        feedbackBtn.appendChild(badge);
      }
    } else if (existingBadge) {
      existingBadge.remove();
    }
  }
}

/**
 * Show feedback modal for an evolution entry
 */
export function showFeedbackModal(evolutionDay: number): void {
  // Remove existing modal if any
  const existing = document.querySelector('.feedback-modal');
  if (existing) {
    existing.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'modal-overlay feedback-modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  
  const title = document.createElement('h2');
  title.textContent = `Feedback for Day ${evolutionDay}`;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Close');
  
  header.appendChild(title);
  header.appendChild(closeBtn);

  // Feedback form
  const form = document.createElement('form');
  form.className = 'feedback-form';
  
  const textarea = document.createElement('textarea');
  textarea.className = 'feedback-input';
  textarea.placeholder = 'Share your thoughts about this evolution...';
  textarea.rows = 4;
  textarea.setAttribute('aria-label', 'Feedback message');
  
  const helpfulLabel = document.createElement('label');
  helpfulLabel.className = 'helpful-checkbox-label';
  
  const helpfulCheckbox = document.createElement('input');
  helpfulCheckbox.type = 'checkbox';
  helpfulCheckbox.checked = true;
  helpfulCheckbox.className = 'helpful-checkbox';
  
  helpfulLabel.appendChild(helpfulCheckbox);
  helpfulLabel.appendChild(document.createTextNode(' This evolution was helpful'));
  
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn-primary';
  submitBtn.textContent = 'Submit Feedback';
  
  form.appendChild(textarea);
  form.appendChild(helpfulLabel);
  form.appendChild(submitBtn);

  // Existing feedback
  const feedbackList = document.createElement('div');
  feedbackList.className = 'feedback-list';
  
  const feedbackHeader = document.createElement('h3');
  feedbackHeader.textContent = 'Previous Feedback';
  feedbackList.appendChild(feedbackHeader);
  
  const existingFeedback = votingSystem.getFeedback(evolutionDay);
  if (existingFeedback.length === 0) {
    const noFeedback = document.createElement('p');
    noFeedback.className = 'no-feedback';
    noFeedback.textContent = 'No feedback yet. Be the first!';
    feedbackList.appendChild(noFeedback);
  } else {
    existingFeedback.forEach(feedback => {
      const feedbackItem = document.createElement('div');
      feedbackItem.className = 'feedback-item';
      
      const feedbackIcon = document.createElement('span');
      feedbackIcon.className = 'feedback-icon';
      feedbackIcon.textContent = feedback.helpful ? '✓' : '✕';
      feedbackIcon.title = feedback.helpful ? 'Helpful' : 'Not helpful';
      
      const feedbackText = document.createElement('p');
      feedbackText.textContent = feedback.message;
      
      const feedbackDate = document.createElement('span');
      feedbackDate.className = 'feedback-date';
      feedbackDate.textContent = new Date(feedback.timestamp).toLocaleDateString();
      
      feedbackItem.appendChild(feedbackIcon);
      feedbackItem.appendChild(feedbackText);
      feedbackItem.appendChild(feedbackDate);
      feedbackList.appendChild(feedbackItem);
    });
  }

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = textarea.value.trim();
    if (!message) {
      showNotification('Please enter feedback message', 'error');
      return;
    }
    
    try {
      votingSystem.addFeedback(evolutionDay, message, helpfulCheckbox.checked);
      showNotification('Feedback submitted successfully!', 'success');
      modal.remove();
    } catch (error) {
      showNotification('Failed to submit feedback', 'error');
    }
  });

  // Handle close
  closeBtn.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  modalContent.appendChild(header);
  modalContent.appendChild(form);
  modalContent.appendChild(feedbackList);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);
  textarea.focus();
}

/**
 * Create voting statistics dashboard
 */
export function createVotingDashboard(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'voting-dashboard';

  const header = document.createElement('h2');
  header.textContent = '📊 Community Engagement';
  container.appendChild(header);

  // Overall stats
  const engagement = votingSystem.getTotalEngagement();
  const statsGrid = document.createElement('div');
  statsGrid.className = 'stats-grid';

  const stats = [
    { label: 'Total Votes', value: engagement.totalVotes, icon: '🗳️' },
    { label: 'Upvotes', value: engagement.totalUpvotes, icon: '👍' },
    { label: 'Downvotes', value: engagement.totalDownvotes, icon: '👎' },
    { label: 'Feedback Items', value: engagement.totalFeedback, icon: '💬' },
    { label: 'Engaged Evolutions', value: engagement.engagementRate, icon: '⚡' },
  ];

  stats.forEach(stat => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <div class="stat-icon">${stat.icon}</div>
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${stat.label}</div>
    `;
    statsGrid.appendChild(card);
  });

  container.appendChild(statsGrid);

  // Most popular features
  const popular = votingSystem.getMostPopular(5);
  if (popular.length > 0) {
    const popularSection = document.createElement('div');
    popularSection.className = 'voting-section';
    
    const popularHeader = document.createElement('h3');
    popularHeader.textContent = '⭐ Most Popular Evolutions';
    popularSection.appendChild(popularHeader);
    
    const popularList = document.createElement('div');
    popularList.className = 'ranking-list';
    
    popular.forEach((stat, index) => {
      const item = createRankingItem(stat, index + 1);
      popularList.appendChild(item);
    });
    
    popularSection.appendChild(popularList);
    container.appendChild(popularSection);
  }

  // Most discussed features
  const discussed = votingSystem.getMostDiscussed(5);
  if (discussed.length > 0) {
    const discussedSection = document.createElement('div');
    discussedSection.className = 'voting-section';
    
    const discussedHeader = document.createElement('h3');
    discussedHeader.textContent = '💭 Most Discussed Evolutions';
    discussedSection.appendChild(discussedHeader);
    
    const discussedList = document.createElement('div');
    discussedList.className = 'ranking-list';
    
    discussed.forEach((stat, index) => {
      const item = createRankingItem(stat, index + 1, 'feedback');
      discussedList.appendChild(item);
    });
    
    discussedSection.appendChild(discussedList);
    container.appendChild(discussedSection);
  }

  // No engagement message
  if (popular.length === 0 && discussed.length === 0) {
    const noEngagement = document.createElement('div');
    noEngagement.className = 'no-engagement';
    noEngagement.innerHTML = `
      <p>No votes or feedback yet!</p>
      <p>Vote on evolution entries to see engagement statistics here.</p>
    `;
    container.appendChild(noEngagement);
  }

  return container;
}

/**
 * Create a ranking item for the dashboard
 */
function createRankingItem(stat: VotingStats, rank: number, type: 'score' | 'feedback' = 'score'): HTMLElement {
  const item = document.createElement('div');
  item.className = 'ranking-item';
  
  const rankBadge = document.createElement('div');
  rankBadge.className = 'rank-badge';
  rankBadge.textContent = `#${rank}`;
  
  const dayLabel = document.createElement('div');
  dayLabel.className = 'day-label';
  dayLabel.textContent = `Day ${stat.evolutionDay}`;
  
  const scoreLabel = document.createElement('div');
  scoreLabel.className = 'score-label';
  
  if (type === 'score') {
    scoreLabel.innerHTML = `
      <span class="upvotes">👍 ${stat.upvotes}</span>
      <span class="downvotes">👎 ${stat.downvotes}</span>
      <span class="net-score">Score: ${stat.netScore > 0 ? '+' : ''}${stat.netScore}</span>
    `;
  } else {
    scoreLabel.innerHTML = `
      <span class="feedback-count">💬 ${stat.feedbackCount} comment${stat.feedbackCount !== 1 ? 's' : ''}</span>
    `;
  }
  
  item.appendChild(rankBadge);
  item.appendChild(dayLabel);
  item.appendChild(scoreLabel);
  
  return item;
}
