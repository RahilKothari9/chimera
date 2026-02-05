/**
 * Voting System for Chimera Evolution Features
 * 
 * Allows users to upvote/downvote features and leave feedback,
 * creating a feedback loop to understand which evolutions provide the most value.
 */

export interface Vote {
  evolutionDay: number;
  vote: 'up' | 'down' | null;
  timestamp: number;
}

export interface Feedback {
  evolutionDay: number;
  message: string;
  timestamp: number;
  helpful: boolean;
}

export interface VotingData {
  votes: Map<number, Vote>;
  feedback: Feedback[];
}

export interface VotingStats {
  evolutionDay: number;
  upvotes: number;
  downvotes: number;
  netScore: number;
  feedbackCount: number;
}

const STORAGE_KEY = 'chimera-voting-data';

export class VotingSystem {
  private votes: Map<number, Vote>;
  private feedback: Feedback[];
  private listeners: ((data: VotingData) => void)[];

  constructor() {
    this.votes = new Map();
    this.feedback = [];
    this.listeners = [];
    this.loadFromStorage();
  }

  /**
   * Cast a vote for an evolution entry
   */
  vote(evolutionDay: number, voteType: 'up' | 'down' | null): void {
    if (voteType === null) {
      // Remove vote
      this.votes.delete(evolutionDay);
    } else {
      // Add or update vote
      const vote: Vote = {
        evolutionDay,
        vote: voteType,
        timestamp: Date.now(),
      };
      this.votes.set(evolutionDay, vote);
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get the current vote for an evolution entry
   */
  getVote(evolutionDay: number): 'up' | 'down' | null {
    return this.votes.get(evolutionDay)?.vote ?? null;
  }

  /**
   * Add feedback for an evolution entry
   */
  addFeedback(evolutionDay: number, message: string, helpful: boolean = true): void {
    if (!message.trim()) {
      throw new Error('Feedback message cannot be empty');
    }

    const newFeedback: Feedback = {
      evolutionDay,
      message: message.trim(),
      timestamp: Date.now(),
      helpful,
    };

    this.feedback.push(newFeedback);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get all feedback for an evolution entry
   */
  getFeedback(evolutionDay: number): Feedback[] {
    return this.feedback
      .filter(f => f.evolutionDay === evolutionDay)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get all feedback across all evolutions
   */
  getAllFeedback(): Feedback[] {
    return [...this.feedback].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Calculate voting statistics for an evolution entry
   */
  getStats(evolutionDay: number): VotingStats {
    const vote = this.votes.get(evolutionDay);
    const upvotes = vote?.vote === 'up' ? 1 : 0;
    const downvotes = vote?.vote === 'down' ? 1 : 0;
    const feedbackCount = this.getFeedback(evolutionDay).length;

    return {
      evolutionDay,
      upvotes,
      downvotes,
      netScore: upvotes - downvotes,
      feedbackCount,
    };
  }

  /**
   * Get voting statistics for all evolutions
   */
  getAllStats(): VotingStats[] {
    const stats = new Map<number, VotingStats>();

    // Initialize stats from votes
    this.votes.forEach((vote, day) => {
      if (!stats.has(day)) {
        stats.set(day, {
          evolutionDay: day,
          upvotes: 0,
          downvotes: 0,
          netScore: 0,
          feedbackCount: 0,
        });
      }
      const stat = stats.get(day)!;
      if (vote.vote === 'up') {
        stat.upvotes = 1;
        stat.netScore = 1;
      } else if (vote.vote === 'down') {
        stat.downvotes = 1;
        stat.netScore = -1;
      }
    });

    // Add feedback counts
    this.feedback.forEach(fb => {
      if (!stats.has(fb.evolutionDay)) {
        stats.set(fb.evolutionDay, {
          evolutionDay: fb.evolutionDay,
          upvotes: 0,
          downvotes: 0,
          netScore: 0,
          feedbackCount: 0,
        });
      }
      stats.get(fb.evolutionDay)!.feedbackCount++;
    });

    return Array.from(stats.values()).sort((a, b) => b.netScore - a.netScore);
  }

  /**
   * Get most popular evolutions (by net score)
   */
  getMostPopular(limit: number = 5): VotingStats[] {
    return this.getAllStats()
      .filter(s => s.netScore > 0)
      .slice(0, limit);
  }

  /**
   * Get most discussed evolutions (by feedback count)
   */
  getMostDiscussed(limit: number = 5): VotingStats[] {
    return this.getAllStats()
      .filter(s => s.feedbackCount > 0)
      .sort((a, b) => b.feedbackCount - a.feedbackCount)
      .slice(0, limit);
  }

  /**
   * Get total engagement statistics
   */
  getTotalEngagement(): {
    totalVotes: number;
    totalUpvotes: number;
    totalDownvotes: number;
    totalFeedback: number;
    engagementRate: number;
  } {
    let totalUpvotes = 0;
    let totalDownvotes = 0;

    this.votes.forEach(vote => {
      if (vote.vote === 'up') totalUpvotes++;
      if (vote.vote === 'down') totalDownvotes++;
    });

    const totalVotes = totalUpvotes + totalDownvotes;
    const totalFeedback = this.feedback.length;
    
    // Engagement rate as percentage of evolutions with any interaction
    const engagedEvolutions = new Set([
      ...this.votes.keys(),
      ...this.feedback.map(f => f.evolutionDay),
    ]);

    return {
      totalVotes,
      totalUpvotes,
      totalDownvotes,
      totalFeedback,
      engagementRate: engagedEvolutions.size,
    };
  }

  /**
   * Subscribe to voting data changes
   */
  subscribe(listener: (data: VotingData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Clear all voting data
   */
  clear(): void {
    this.votes.clear();
    this.feedback = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const data: VotingData = {
      votes: new Map(this.votes),
      feedback: [...this.feedback],
    };
    this.listeners.forEach(listener => listener(data));
  }

  private saveToStorage(): void {
    try {
      const data = {
        votes: Array.from(this.votes.entries()),
        feedback: this.feedback,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save voting data to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.votes = new Map(data.votes || []);
        this.feedback = data.feedback || [];
      }
    } catch (error) {
      console.warn('Failed to load voting data from localStorage:', error);
    }
  }
}

// Singleton instance
export const votingSystem = new VotingSystem();
