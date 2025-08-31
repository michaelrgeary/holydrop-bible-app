'use client';

// Privacy-respecting analytics for sharing features
// No cookies, no fingerprinting, no personal data collection
// Only anonymous, aggregated statistics stored locally

interface ShareEvent {
  type: 'card-generation' | 'card-share' | 'collection-share' | 'achievement-share' | 'verse-share';
  timestamp: number;
  platform?: string;
  format?: string;
  theme?: string;
  strategy?: 'canvas' | 'svg' | 'server';
  generationTime?: number;
  error?: boolean;
}

interface ShareStats {
  cardGenerations: number;
  cardShares: number;
  collectionShares: number;
  achievementShares: number;
  verseShares: number;
  platformStats: Record<string, number>;
  formatStats: Record<string, number>;
  themeStats: Record<string, number>;
  strategyStats: Record<string, number>;
  avgGenerationTime: number;
  errorRate: number;
  lastUpdated: number;
}

interface PerformanceMetrics {
  cardGenerationTimes: number[];
  errorCount: number;
  totalGenerations: number;
  cacheHitRate: number;
  memoryUsage: number;
  slowGenerationWarnings: number;
}

export class ShareAnalytics {
  private static instance: ShareAnalytics;
  private readonly STORAGE_KEY = 'holydrop-share-analytics';
  private readonly PERFORMANCE_KEY = 'holydrop-share-performance';
  private readonly MAX_EVENTS = 100; // Keep only last 100 events
  private readonly BATCH_SIZE = 10; // Send analytics in batches
  private readonly SLOW_THRESHOLD = 3000; // 3 seconds
  private consentGiven: boolean = false;
  
  public static getInstance(): ShareAnalytics {
    if (!ShareAnalytics.instance) {
      ShareAnalytics.instance = new ShareAnalytics();
    }
    return ShareAnalytics.instance;
  }
  
  constructor() {
    this.checkConsent();
  }
  
  private checkConsent(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const consent = localStorage.getItem('holydrop-analytics-consent');
      this.consentGiven = consent === 'granted';
    } catch (error) {
      // If localStorage is not available, assume no consent
      this.consentGiven = false;
    }
  }
  
  public requestConsent(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }
      
      // Simple consent dialog (in a real app, you'd use a proper consent management platform)
      const message = `
HolyDrop would like to collect anonymous usage statistics to improve the sharing experience.

This data helps us:
• Optimize card generation performance
• Understand which themes are most popular
• Improve loading times

We collect:
• Card generation times and success rates
• Popular themes and formats (no personal content)
• Anonymous usage patterns

We do NOT collect:
• Personal information
• Specific verses you read
• Location data
• Device identifiers

Allow anonymous analytics?
      `;
      
      const consent = confirm(message);
      
      try {
        localStorage.setItem('holydrop-analytics-consent', consent ? 'granted' : 'denied');
        this.consentGiven = consent;
      } catch (error) {
        console.warn('Could not save consent preference:', error);
      }
      
      resolve(consent);
    });
  }
  
  public async trackEvent(event: Omit<ShareEvent, 'timestamp'>): Promise<void> {
    if (!this.consentGiven || typeof window === 'undefined') return;
    
    try {
      const fullEvent: ShareEvent = {
        ...event,
        timestamp: Date.now(),
      };
      
      // Store event locally
      this.storeEvent(fullEvent);
      
      // Update aggregated stats
      this.updateStats(fullEvent);
      
      // Track performance metrics
      if (event.generationTime) {
        this.trackPerformance(event);
      }
      
      // Batch send to server (if enabled)
      await this.batchSendEvents();
      
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }
  
  private storeEvent(event: ShareEvent): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const events: ShareEvent[] = stored ? JSON.parse(stored) : [];
      
      events.push(event);
      
      // Keep only the most recent events
      if (events.length > this.MAX_EVENTS) {
        events.splice(0, events.length - this.MAX_EVENTS);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }
  
  private updateStats(event: ShareEvent): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY + '-stats');
      const stats: ShareStats = stored ? JSON.parse(stored) : {
        cardGenerations: 0,
        cardShares: 0,
        collectionShares: 0,
        achievementShares: 0,
        verseShares: 0,
        platformStats: {},
        formatStats: {},
        themeStats: {},
        strategyStats: {},
        avgGenerationTime: 0,
        errorRate: 0,
        lastUpdated: 0,
      };
      
      // Update counters
      switch (event.type) {
        case 'card-generation':
          stats.cardGenerations++;
          break;
        case 'card-share':
          stats.cardShares++;
          break;
        case 'collection-share':
          stats.collectionShares++;
          break;
        case 'achievement-share':
          stats.achievementShares++;
          break;
        case 'verse-share':
          stats.verseShares++;
          break;
      }
      
      // Update platform stats
      if (event.platform) {
        stats.platformStats[event.platform] = (stats.platformStats[event.platform] || 0) + 1;
      }
      
      // Update format stats
      if (event.format) {
        stats.formatStats[event.format] = (stats.formatStats[event.format] || 0) + 1;
      }
      
      // Update theme stats
      if (event.theme) {
        stats.themeStats[event.theme] = (stats.themeStats[event.theme] || 0) + 1;
      }
      
      // Update strategy stats
      if (event.strategy) {
        stats.strategyStats[event.strategy] = (stats.strategyStats[event.strategy] || 0) + 1;
      }
      
      stats.lastUpdated = Date.now();
      
      localStorage.setItem(this.STORAGE_KEY + '-stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to update analytics stats:', error);
    }
  }
  
  private trackPerformance(event: Omit<ShareEvent, 'timestamp'>): void {
    if (!event.generationTime) return;
    
    try {
      const stored = localStorage.getItem(this.PERFORMANCE_KEY);
      const metrics: PerformanceMetrics = stored ? JSON.parse(stored) : {
        cardGenerationTimes: [],
        errorCount: 0,
        totalGenerations: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        slowGenerationWarnings: 0,
      };
      
      metrics.totalGenerations++;
      metrics.cardGenerationTimes.push(event.generationTime);
      
      // Keep only last 50 generation times for moving average
      if (metrics.cardGenerationTimes.length > 50) {
        metrics.cardGenerationTimes.shift();
      }
      
      // Track errors
      if (event.error) {
        metrics.errorCount++;
      }
      
      // Track slow generations
      if (event.generationTime > this.SLOW_THRESHOLD) {
        metrics.slowGenerationWarnings++;
        console.warn(`Slow card generation: ${event.generationTime}ms (threshold: ${this.SLOW_THRESHOLD}ms)`);
      }
      
      // Update memory usage if available
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        metrics.memoryUsage = memory.usedJSHeapSize;
      }
      
      localStorage.setItem(this.PERFORMANCE_KEY, JSON.stringify(metrics));
    } catch (error) {
      console.error('Failed to track performance metrics:', error);
    }
  }
  
  private async batchSendEvents(): Promise<void> {
    // In a real implementation, you might send batched events to your analytics server
    // For privacy, this would be anonymous, aggregated data only
    
    try {
      const events = this.getStoredEvents();
      if (events.length >= this.BATCH_SIZE) {
        // Here you would send the batch to your server
        // await this.sendBatchToServer(events.slice(0, this.BATCH_SIZE));
        
        // For now, we just log the batch (in production, remove this)
        console.log('Analytics batch ready:', events.slice(0, this.BATCH_SIZE).length, 'events');
        
        // Remove sent events
        const remaining = events.slice(this.BATCH_SIZE);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remaining));
      }
    } catch (error) {
      console.error('Failed to batch send events:', error);
    }
  }
  
  private getStoredEvents(): ShareEvent[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored events:', error);
      return [];
    }
  }
  
  public getStats(): ShareStats | null {
    if (!this.consentGiven) return null;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY + '-stats');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get analytics stats:', error);
      return null;
    }
  }
  
  public getPerformanceMetrics(): PerformanceMetrics | null {
    if (!this.consentGiven) return null;
    
    try {
      const stored = localStorage.getItem(this.PERFORMANCE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return null;
    }
  }
  
  public getAverageGenerationTime(): number {
    const metrics = this.getPerformanceMetrics();
    if (!metrics || metrics.cardGenerationTimes.length === 0) return 0;
    
    const sum = metrics.cardGenerationTimes.reduce((a, b) => a + b, 0);
    return sum / metrics.cardGenerationTimes.length;
  }
  
  public getErrorRate(): number {
    const metrics = this.getPerformanceMetrics();
    if (!metrics || metrics.totalGenerations === 0) return 0;
    
    return (metrics.errorCount / metrics.totalGenerations) * 100;
  }
  
  public clearData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STORAGE_KEY + '-stats');
      localStorage.removeItem(this.PERFORMANCE_KEY);
      localStorage.removeItem('holydrop-analytics-consent');
      this.consentGiven = false;
    } catch (error) {
      console.error('Failed to clear analytics data:', error);
    }
  }
  
  // Export data for user transparency
  public exportData(): {events: ShareEvent[]; stats: ShareStats | null; performance: PerformanceMetrics | null} {
    return {
      events: this.getStoredEvents(),
      stats: this.getStats(),
      performance: this.getPerformanceMetrics(),
    };
  }
  
  // Check if analytics is enabled
  public isEnabled(): boolean {
    return this.consentGiven;
  }
  
  // Enable/disable analytics
  public setEnabled(enabled: boolean): void {
    this.consentGiven = enabled;
    try {
      localStorage.setItem('holydrop-analytics-consent', enabled ? 'granted' : 'denied');
      if (!enabled) {
        this.clearData();
      }
    } catch (error) {
      console.error('Failed to update analytics preference:', error);
    }
  }
}