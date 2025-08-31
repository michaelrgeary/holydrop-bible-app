// Privacy-First Analytics Tracker
// All data is stored locally and anonymized

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  sessionId: string;
  anonymousId: string;
}

interface PageView {
  path: string;
  referrer?: string;
  timestamp: string;
  sessionId: string;
  anonymousId: string;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

interface UserSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  pageViews: string[];
  events: string[];
  duration?: number;
}

class AnalyticsTracker {
  private anonymousId: string;
  private sessionId: string;
  private isEnabled: boolean;
  private _queue: (AnalyticsEvent | PageView)[] = [];
  private sessionStartTime: number;

  constructor() {
    this.isEnabled = this.checkIfEnabled();
    this.anonymousId = this.getOrCreateAnonymousId();
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();

    if (this.isEnabled) {
      this.initializeSession();
      this.setupPageUnloadHandler();
    }
  }

  private checkIfEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const settings = JSON.parse(localStorage.getItem('user_settings') || '{}');
      return settings.privacy?.analytics !== false; // Default to enabled
    } catch {
      return false;
    }
  }

  private getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') return 'server';
    
    try {
      let id = localStorage.getItem('anonymous_id');
      if (!id) {
        id = this.generateAnonymousId();
        localStorage.setItem('anonymous_id', id);
      }
      return id;
    } catch {
      return 'unknown';
    }
  }

  private generateAnonymousId(): string {
    return 'anon_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now().toString(36);
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now().toString(36);
  }

  private initializeSession(): void {
    const session: UserSession = {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      pageViews: [],
      events: []
    };

    try {
      const sessions = this.getSessions();
      sessions.push(session);
      localStorage.setItem('analytics_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to initialize analytics session:', error);
    }
  }

  private getSessions(): UserSession[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_sessions') || '[]');
    } catch {
      return [];
    }
  }

  private setupPageUnloadHandler(): void {
    if (typeof window === 'undefined') return;

    const endSession = () => {
      this.endSession();
    };

    window.addEventListener('beforeunload', endSession);
    window.addEventListener('pagehide', endSession);
    
    // Also end session after 30 minutes of inactivity
    let inactivityTimer: NodeJS.Timeout;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(endSession, 30 * 60 * 1000); // 30 minutes
    };

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);

    resetInactivityTimer();
  }

  private endSession(): void {
    try {
      const sessions = this.getSessions();
      const currentSession = sessions.find(s => s.sessionId === this.sessionId);
      
      if (currentSession) {
        currentSession.endTime = new Date().toISOString();
        currentSession.duration = Date.now() - this.sessionStartTime;
        localStorage.setItem('analytics_sessions', JSON.stringify(sessions));
      }
    } catch (error) {
      console.warn('Failed to end analytics session:', error);
    }
  }

  // Public Methods

  trackPageView(path?: string): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    const pageView: PageView = {
      path: path || window.location.pathname,
      referrer: document.referrer || undefined,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      anonymousId: this.anonymousId,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.storePageView(pageView);
    this.updateSessionPageViews(pageView.path);
  }

  trackEvent(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: this.sanitizeProperties(properties),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      anonymousId: this.anonymousId
    };

    this.storeEvent(analyticsEvent);
    this.updateSessionEvents(event);
  }

  // Convenience methods for common events
  trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>): void {
    this.trackEvent('feature_used', {
      feature,
      action,
      ...properties
    });
  }

  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent('search_performed', {
      query_length: query.length,
      query_type: this.categorizeQuery(query),
      results_count: resultsCount
    });
  }

  trackVerseInteraction(action: 'viewed' | 'bookmarked' | 'shared', verseReference: string): void {
    this.trackEvent('verse_interaction', {
      action,
      book: this.extractBook(verseReference),
      has_reference: !!verseReference
    });
  }

  trackReadingPlan(action: 'started' | 'completed' | 'day_completed', planName?: string): void {
    this.trackEvent('reading_plan', {
      action,
      plan_type: planName ? 'named' : 'custom'
    });
  }

  trackError(error: string, context?: string): void {
    this.trackEvent('error_occurred', {
      error_type: this.categorizeError(error),
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Data retrieval and management
  getAnalyticsSummary(): {
    totalSessions: number;
    totalPageViews: number;
    totalEvents: number;
    topPages: Array<{ path: string; views: number }>;
    topEvents: Array<{ event: string; count: number }>;
    averageSessionDuration: number;
  } {
    if (!this.isEnabled) {
      return {
        totalSessions: 0,
        totalPageViews: 0,
        totalEvents: 0,
        topPages: [],
        topEvents: [],
        averageSessionDuration: 0
      };
    }

    try {
      const sessions = this.getSessions();
      const pageViews = this.getPageViews();
      const events = this.getEvents();

      // Calculate top pages
      const pageViewCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        pageViewCounts[pv.path] = (pageViewCounts[pv.path] || 0) + 1;
      });
      const topPages = Object.entries(pageViewCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([path, views]) => ({ path, views }));

      // Calculate top events
      const eventCounts: Record<string, number> = {};
      events.forEach(e => {
        eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
      });
      const topEvents = Object.entries(eventCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([event, count]) => ({ event, count }));

      // Calculate average session duration
      const sessionsWithDuration = sessions.filter(s => s.duration);
      const averageSessionDuration = sessionsWithDuration.length > 0
        ? sessionsWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / sessionsWithDuration.length
        : 0;

      return {
        totalSessions: sessions.length,
        totalPageViews: pageViews.length,
        totalEvents: events.length,
        topPages,
        topEvents,
        averageSessionDuration
      };
    } catch (error) {
      console.error('Failed to generate analytics summary:', error);
      return {
        totalSessions: 0,
        totalPageViews: 0,
        totalEvents: 0,
        topPages: [],
        topEvents: [],
        averageSessionDuration: 0
      };
    }
  }

  exportAnalyticsData(): object {
    if (!this.isEnabled) return {};

    return {
      sessions: this.getSessions(),
      pageViews: this.getPageViews(),
      events: this.getEvents(),
      summary: this.getAnalyticsSummary(),
      exportDate: new Date().toISOString()
    };
  }

  clearAnalyticsData(): void {
    try {
      localStorage.removeItem('analytics_sessions');
      localStorage.removeItem('analytics_pageviews');
      localStorage.removeItem('analytics_events');
      localStorage.removeItem('anonymous_id');
    } catch (error) {
      console.error('Failed to clear analytics data:', error);
    }
  }

  // Private helper methods
  private storePageView(pageView: PageView): void {
    try {
      const pageViews = this.getPageViews();
      pageViews.push(pageView);
      
      // Keep only last 1000 page views to manage storage
      if (pageViews.length > 1000) {
        pageViews.splice(0, pageViews.length - 1000);
      }
      
      localStorage.setItem('analytics_pageviews', JSON.stringify(pageViews));
    } catch (error) {
      console.warn('Failed to store page view:', error);
    }
  }

  private storeEvent(event: AnalyticsEvent): void {
    try {
      const events = this.getEvents();
      events.push(event);
      
      // Keep only last 1000 events to manage storage
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store event:', error);
    }
  }

  private getPageViews(): PageView[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_pageviews') || '[]');
    } catch {
      return [];
    }
  }

  private getEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  private updateSessionPageViews(path: string): void {
    try {
      const sessions = this.getSessions();
      const currentSession = sessions.find(s => s.sessionId === this.sessionId);
      if (currentSession) {
        currentSession.pageViews.push(path);
        localStorage.setItem('analytics_sessions', JSON.stringify(sessions));
      }
    } catch (error) {
      console.warn('Failed to update session page views:', error);
    }
  }

  private updateSessionEvents(event: string): void {
    try {
      const sessions = this.getSessions();
      const currentSession = sessions.find(s => s.sessionId === this.sessionId);
      if (currentSession) {
        currentSession.events.push(event);
        localStorage.setItem('analytics_sessions', JSON.stringify(sessions));
      }
    } catch (error) {
      console.warn('Failed to update session events:', error);
    }
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, any> = {};
    
    Object.entries(properties).forEach(([key, value]) => {
      // Remove any potentially sensitive data
      if (typeof value === 'string' && value.length < 100) {
        sanitized[key] = value;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.length; // Store array length instead of content
      }
    });

    return sanitized;
  }

  private categorizeQuery(query: string): string {
    if (/^\d+:\d+/.test(query) || /^[a-zA-Z]+\s+\d+:\d+/.test(query)) {
      return 'verse_reference';
    } else if (/^[a-zA-Z]+\s+\d+$/.test(query)) {
      return 'chapter_reference';
    } else if (/^[a-zA-Z]+$/.test(query.trim())) {
      return 'book_or_topic';
    } else {
      return 'text_search';
    }
  }

  private extractBook(reference: string): string {
    return reference.split(/\s+/)[0]?.toLowerCase() || 'unknown';
  }

  private categorizeError(error: string): string {
    if (error.includes('network') || error.includes('fetch')) {
      return 'network';
    } else if (error.includes('parse') || error.includes('JSON')) {
      return 'parsing';
    } else if (error.includes('permission') || error.includes('access')) {
      return 'permission';
    } else {
      return 'general';
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

// Convenience function for React components
export const useAnalytics = () => {
  return {
    trackPageView: (path?: string) => analytics.trackPageView(path),
    trackEvent: (event: string, properties?: Record<string, any>) => 
      analytics.trackEvent(event, properties),
    trackFeatureUsage: (feature: string, action: string, properties?: Record<string, any>) => 
      analytics.trackFeatureUsage(feature, action, properties),
    trackSearch: (query: string, resultsCount: number) => 
      analytics.trackSearch(query, resultsCount),
    trackVerseInteraction: (action: 'viewed' | 'bookmarked' | 'shared', verseReference: string) => 
      analytics.trackVerseInteraction(action, verseReference),
    trackReadingPlan: (action: 'started' | 'completed' | 'day_completed', planName?: string) => 
      analytics.trackReadingPlan(action, planName),
    trackError: (error: string, context?: string) => 
      analytics.trackError(error, context)
  };
};