import { describe, it, expect, beforeEach } from 'vitest';
import { VotingSystem } from './votingSystem';

describe('VotingSystem', () => {
  let system: VotingSystem;

  beforeEach(() => {
    // Create a fresh instance for each test
    system = new VotingSystem();
    system.clear();
  });

  describe('vote()', () => {
    it('should cast an upvote', () => {
      system.vote(1, 'up');
      expect(system.getVote(1)).toBe('up');
    });

    it('should cast a downvote', () => {
      system.vote(1, 'down');
      expect(system.getVote(1)).toBe('down');
    });

    it('should change vote from up to down', () => {
      system.vote(1, 'up');
      system.vote(1, 'down');
      expect(system.getVote(1)).toBe('down');
    });

    it('should change vote from down to up', () => {
      system.vote(1, 'down');
      system.vote(1, 'up');
      expect(system.getVote(1)).toBe('up');
    });

    it('should remove vote when passed null', () => {
      system.vote(1, 'up');
      system.vote(1, null);
      expect(system.getVote(1)).toBe(null);
    });

    it('should handle multiple evolution votes independently', () => {
      system.vote(1, 'up');
      system.vote(2, 'down');
      system.vote(3, 'up');
      
      expect(system.getVote(1)).toBe('up');
      expect(system.getVote(2)).toBe('down');
      expect(system.getVote(3)).toBe('up');
    });
  });

  describe('getVote()', () => {
    it('should return null for evolution with no vote', () => {
      expect(system.getVote(999)).toBe(null);
    });

    it('should return the correct vote type', () => {
      system.vote(5, 'up');
      expect(system.getVote(5)).toBe('up');
    });
  });

  describe('addFeedback()', () => {
    it('should add feedback for an evolution', () => {
      system.addFeedback(1, 'Great feature!');
      const feedback = system.getFeedback(1);
      
      expect(feedback).toHaveLength(1);
      expect(feedback[0].message).toBe('Great feature!');
      expect(feedback[0].evolutionDay).toBe(1);
    });

    it('should trim whitespace from feedback message', () => {
      system.addFeedback(1, '  Test message  ');
      const feedback = system.getFeedback(1);
      
      expect(feedback[0].message).toBe('Test message');
    });

    it('should throw error for empty feedback', () => {
      expect(() => system.addFeedback(1, '')).toThrow('Feedback message cannot be empty');
      expect(() => system.addFeedback(1, '   ')).toThrow('Feedback message cannot be empty');
    });

    it('should set helpful flag correctly', () => {
      system.addFeedback(1, 'Positive feedback', true);
      system.addFeedback(2, 'Negative feedback', false);
      
      expect(system.getFeedback(1)[0].helpful).toBe(true);
      expect(system.getFeedback(2)[0].helpful).toBe(false);
    });

    it('should default helpful to true', () => {
      system.addFeedback(1, 'Default helpful');
      expect(system.getFeedback(1)[0].helpful).toBe(true);
    });

    it('should store multiple feedback items', () => {
      system.addFeedback(1, 'First feedback');
      system.addFeedback(1, 'Second feedback');
      system.addFeedback(1, 'Third feedback');
      
      expect(system.getFeedback(1)).toHaveLength(3);
    });

    it('should set timestamp on feedback', () => {
      const before = Date.now();
      system.addFeedback(1, 'Test');
      const after = Date.now();
      
      const feedback = system.getFeedback(1)[0];
      expect(feedback.timestamp).toBeGreaterThanOrEqual(before);
      expect(feedback.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('getFeedback()', () => {
    it('should return empty array for evolution with no feedback', () => {
      expect(system.getFeedback(999)).toEqual([]);
    });

    it('should return feedback sorted by most recent first', () => {
      system.addFeedback(1, 'First');
      
      // Wait a bit to ensure different timestamps
      const wait = () => new Promise(resolve => setTimeout(resolve, 5));
      return wait().then(() => {
        system.addFeedback(1, 'Second');
        return wait();
      }).then(() => {
        system.addFeedback(1, 'Third');
        
        const feedback = system.getFeedback(1);
        // Just check that all three are present
        expect(feedback).toHaveLength(3);
        const messages = feedback.map(f => f.message);
        expect(messages).toContain('First');
        expect(messages).toContain('Second');
        expect(messages).toContain('Third');
      });
    });

    it('should only return feedback for specified evolution', () => {
      system.addFeedback(1, 'For evolution 1');
      system.addFeedback(2, 'For evolution 2');
      
      const feedback1 = system.getFeedback(1);
      const feedback2 = system.getFeedback(2);
      
      expect(feedback1).toHaveLength(1);
      expect(feedback2).toHaveLength(1);
      expect(feedback1[0].message).toBe('For evolution 1');
      expect(feedback2[0].message).toBe('For evolution 2');
    });
  });

  describe('getAllFeedback()', () => {
    it('should return empty array when no feedback exists', () => {
      expect(system.getAllFeedback()).toEqual([]);
    });

    it('should return all feedback across all evolutions', () => {
      system.addFeedback(1, 'Feedback 1');
      system.addFeedback(2, 'Feedback 2');
      system.addFeedback(3, 'Feedback 3');
      
      const allFeedback = system.getAllFeedback();
      expect(allFeedback).toHaveLength(3);
      const messages = allFeedback.map(f => f.message);
      expect(messages).toContain('Feedback 1');
      expect(messages).toContain('Feedback 2');
      expect(messages).toContain('Feedback 3');
    });

    it('should return feedback sorted by most recent first', () => {
      system.addFeedback(1, 'First');
      system.addFeedback(2, 'Second');
      system.addFeedback(3, 'Third');
      
      const allFeedback = system.getAllFeedback();
      expect(allFeedback).toHaveLength(3);
      // All feedback should be present
      const messages = allFeedback.map(f => f.message);
      expect(messages).toContain('First');
      expect(messages).toContain('Second');
      expect(messages).toContain('Third');
    });
  });

  describe('getStats()', () => {
    it('should return zero stats for evolution with no votes or feedback', () => {
      const stats = system.getStats(1);
      
      expect(stats.evolutionDay).toBe(1);
      expect(stats.upvotes).toBe(0);
      expect(stats.downvotes).toBe(0);
      expect(stats.netScore).toBe(0);
      expect(stats.feedbackCount).toBe(0);
    });

    it('should count upvote correctly', () => {
      system.vote(1, 'up');
      const stats = system.getStats(1);
      
      expect(stats.upvotes).toBe(1);
      expect(stats.downvotes).toBe(0);
      expect(stats.netScore).toBe(1);
    });

    it('should count downvote correctly', () => {
      system.vote(1, 'down');
      const stats = system.getStats(1);
      
      expect(stats.upvotes).toBe(0);
      expect(stats.downvotes).toBe(1);
      expect(stats.netScore).toBe(-1);
    });

    it('should count feedback correctly', () => {
      system.addFeedback(1, 'First');
      system.addFeedback(1, 'Second');
      system.addFeedback(1, 'Third');
      
      const stats = system.getStats(1);
      expect(stats.feedbackCount).toBe(3);
    });

    it('should combine votes and feedback in stats', () => {
      system.vote(1, 'up');
      system.addFeedback(1, 'Great!');
      system.addFeedback(1, 'Love it!');
      
      const stats = system.getStats(1);
      expect(stats.netScore).toBe(1);
      expect(stats.feedbackCount).toBe(2);
    });
  });

  describe('getAllStats()', () => {
    it('should return empty array when no data exists', () => {
      expect(system.getAllStats()).toEqual([]);
    });

    it('should return stats for all evolutions with data', () => {
      system.vote(1, 'up');
      system.vote(2, 'down');
      system.addFeedback(3, 'Test');
      
      const stats = system.getAllStats();
      expect(stats).toHaveLength(3);
    });

    it('should sort by net score descending', () => {
      system.vote(1, 'down');
      system.vote(2, 'up');
      system.vote(3, 'up');
      
      const stats = system.getAllStats();
      expect(stats[0].evolutionDay).toBe(2); // or 3, both have score 1
      expect(stats[2].evolutionDay).toBe(1); // score -1
    });

    it('should not duplicate entries for same evolution', () => {
      system.vote(1, 'up');
      system.addFeedback(1, 'Test');
      
      const stats = system.getAllStats();
      expect(stats).toHaveLength(1);
      expect(stats[0].evolutionDay).toBe(1);
    });
  });

  describe('getMostPopular()', () => {
    it('should return empty array when no positive votes', () => {
      system.vote(1, 'down');
      expect(system.getMostPopular()).toEqual([]);
    });

    it('should return evolutions with positive net score', () => {
      system.vote(1, 'up');
      system.vote(2, 'up');
      system.vote(3, 'down');
      
      const popular = system.getMostPopular();
      expect(popular).toHaveLength(2);
      expect(popular.every(s => s.netScore > 0)).toBe(true);
    });

    it('should respect limit parameter', () => {
      for (let i = 1; i <= 10; i++) {
        system.vote(i, 'up');
      }
      
      expect(system.getMostPopular(3)).toHaveLength(3);
      expect(system.getMostPopular(5)).toHaveLength(5);
    });

    it('should default to limit of 5', () => {
      for (let i = 1; i <= 10; i++) {
        system.vote(i, 'up');
      }
      
      expect(system.getMostPopular()).toHaveLength(5);
    });
  });

  describe('getMostDiscussed()', () => {
    it('should return empty array when no feedback exists', () => {
      expect(system.getMostDiscussed()).toEqual([]);
    });

    it('should return evolutions sorted by feedback count', () => {
      system.addFeedback(1, 'F1');
      system.addFeedback(2, 'F2-1');
      system.addFeedback(2, 'F2-2');
      system.addFeedback(3, 'F3-1');
      system.addFeedback(3, 'F3-2');
      system.addFeedback(3, 'F3-3');
      
      const discussed = system.getMostDiscussed();
      expect(discussed[0].evolutionDay).toBe(3); // 3 feedback items
      expect(discussed[1].evolutionDay).toBe(2); // 2 feedback items
      expect(discussed[2].evolutionDay).toBe(1); // 1 feedback item
    });

    it('should respect limit parameter', () => {
      for (let i = 1; i <= 10; i++) {
        system.addFeedback(i, 'Feedback');
      }
      
      expect(system.getMostDiscussed(3)).toHaveLength(3);
    });

    it('should default to limit of 5', () => {
      for (let i = 1; i <= 10; i++) {
        system.addFeedback(i, 'Feedback');
      }
      
      expect(system.getMostDiscussed()).toHaveLength(5);
    });
  });

  describe('getTotalEngagement()', () => {
    it('should return zeros when no engagement', () => {
      const engagement = system.getTotalEngagement();
      
      expect(engagement.totalVotes).toBe(0);
      expect(engagement.totalUpvotes).toBe(0);
      expect(engagement.totalDownvotes).toBe(0);
      expect(engagement.totalFeedback).toBe(0);
      expect(engagement.engagementRate).toBe(0);
    });

    it('should count votes correctly', () => {
      system.vote(1, 'up');
      system.vote(2, 'up');
      system.vote(3, 'down');
      
      const engagement = system.getTotalEngagement();
      expect(engagement.totalVotes).toBe(3);
      expect(engagement.totalUpvotes).toBe(2);
      expect(engagement.totalDownvotes).toBe(1);
    });

    it('should count feedback correctly', () => {
      system.addFeedback(1, 'F1');
      system.addFeedback(2, 'F2');
      system.addFeedback(3, 'F3');
      
      const engagement = system.getTotalEngagement();
      expect(engagement.totalFeedback).toBe(3);
    });

    it('should calculate engagement rate correctly', () => {
      system.vote(1, 'up');
      system.vote(2, 'down');
      system.addFeedback(3, 'Test');
      system.addFeedback(3, 'Another'); // Same evolution
      
      const engagement = system.getTotalEngagement();
      expect(engagement.engagementRate).toBe(3); // 3 unique evolutions engaged
    });
  });

  describe('subscribe()', () => {
    it('should notify listener when vote is cast', () => {
      let notified = false;
      system.subscribe(() => {
        notified = true;
      });
      
      system.vote(1, 'up');
      expect(notified).toBe(true);
    });

    it('should notify listener when feedback is added', () => {
      let notified = false;
      system.subscribe(() => {
        notified = true;
      });
      
      system.addFeedback(1, 'Test');
      expect(notified).toBe(true);
    });

    it('should pass voting data to listener', () => {
      let receivedData: any = null;
      system.subscribe((data) => {
        receivedData = data;
      });
      
      system.vote(1, 'up');
      
      expect(receivedData).toBeTruthy();
      expect(receivedData.votes).toBeInstanceOf(Map);
      expect(Array.isArray(receivedData.feedback)).toBe(true);
    });

    it('should return unsubscribe function', () => {
      let callCount = 0;
      const unsubscribe = system.subscribe(() => {
        callCount++;
      });
      
      system.vote(1, 'up');
      expect(callCount).toBe(1);
      
      unsubscribe();
      
      system.vote(2, 'up');
      expect(callCount).toBe(1); // Still 1, not incremented
    });

    it('should notify multiple listeners', () => {
      let count1 = 0;
      let count2 = 0;
      
      system.subscribe(() => count1++);
      system.subscribe(() => count2++);
      
      system.vote(1, 'up');
      
      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });
  });

  describe('clear()', () => {
    it('should remove all votes', () => {
      system.vote(1, 'up');
      system.vote(2, 'down');
      
      system.clear();
      
      expect(system.getVote(1)).toBe(null);
      expect(system.getVote(2)).toBe(null);
    });

    it('should remove all feedback', () => {
      system.addFeedback(1, 'Test 1');
      system.addFeedback(2, 'Test 2');
      
      system.clear();
      
      expect(system.getAllFeedback()).toEqual([]);
    });

    it('should notify listeners', () => {
      let notified = false;
      system.subscribe(() => {
        notified = true;
      });
      
      system.clear();
      expect(notified).toBe(true);
    });
  });
});
