'use client';

import { useEffect } from 'react';
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow';
import { FirstActions } from '@/components/onboarding/FirstActions';
import { FeatureHints } from '@/components/onboarding/FeatureHints';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { WelcomeBack } from '@/components/engagement/WelcomeBack';
import { ToastProvider, setGlobalToastFunction, useToast } from '@/components/ui/Toast';
import { analytics } from '@/lib/analytics/tracker';

// Main UX Integration Component
function UXComponents() {
  const { addToast } = useToast();

  useEffect(() => {
    // Set up global toast function for use outside React components
    setGlobalToastFunction(addToast);

    // Track page view on mount
    analytics.trackPageView();

    // Track feature usage when users interact with key elements
    const handleFeatureInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const feature = target.dataset.feature;
      const action = target.dataset.action;
      
      if (feature && action) {
        analytics.trackFeatureUsage(feature, action);
      }
    };

    // Add global event listeners for analytics
    document.addEventListener('click', handleFeatureInteraction);

    // Track search interactions
    const searchInputs = document.querySelectorAll('input[type="search"]');
    searchInputs.forEach(input => {
      input.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter') {
          const query = (e.target as HTMLInputElement).value;
          if (query) {
            analytics.trackSearch(query, 0); // Results count would be updated later
          }
        }
      });
    });

    // Track errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const error = args[0];
      if (typeof error === 'string') {
        analytics.trackError(error, 'console');
      }
      originalConsoleError(...args);
    };

    window.addEventListener('error', (event) => {
      analytics.trackError(event.message, 'window');
    });

    window.addEventListener('unhandledrejection', (event) => {
      analytics.trackError(event.reason?.toString() || 'Unhandled promise rejection', 'promise');
    });

    return () => {
      document.removeEventListener('click', handleFeatureInteraction);
      console.error = originalConsoleError;
    };
  }, [addToast]);

  return (
    <>
      {/* Onboarding Components */}
      <WelcomeFlow />
      <FirstActions />
      <FeatureHints />
      
      {/* Engagement Components */}
      <WelcomeBack />
      
      {/* Feedback System */}
      <FeedbackWidget />
    </>
  );
}

// Main UX Provider that wraps the entire app
export function UXProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <UXComponents />
    </ToastProvider>
  );
}

// Hook for components to easily access UX functionality
export function useUX() {
  const toast = useToast();

  return {
    // Toast notifications
    showSuccess: (title: string, message?: string) => 
      toast.addToast({ type: 'success', title, message }),
    
    showError: (title: string, message?: string) => 
      toast.addToast({ type: 'error', title, message }),
    
    showWarning: (title: string, message?: string) => 
      toast.addToast({ type: 'warning', title, message }),
    
    showInfo: (title: string, message?: string) => 
      toast.addToast({ type: 'info', title, message }),

    // Analytics shortcuts
    trackFeature: (feature: string, action: string, properties?: Record<string, any>) =>
      analytics.trackFeatureUsage(feature, action, properties),
    
    trackVerse: (action: 'viewed' | 'bookmarked' | 'shared', reference: string) =>
      analytics.trackVerseInteraction(action, reference),
    
    trackSearch: (query: string, resultCount: number) =>
      analytics.trackSearch(query, resultCount),
    
    trackReadingPlan: (action: 'started' | 'completed' | 'day_completed', planName?: string) =>
      analytics.trackReadingPlan(action, planName),

    // User progress helpers
    markActionCompleted: (actionId: string) => {
      const completed = JSON.parse(localStorage.getItem('completed_first_actions') || '[]');
      if (!completed.includes(actionId)) {
        completed.push(actionId);
        localStorage.setItem('completed_first_actions', JSON.stringify(completed));
      }
    },
    
    updateReadingProgress: (reference: string) => {
      const history = JSON.parse(localStorage.getItem('reading_history') || '[]');
      history.push({
        reference,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('reading_history', JSON.stringify(history));
    },
    
    addBookmark: (reference: string) => {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      if (!bookmarks.includes(reference)) {
        bookmarks.push(reference);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        toast.addToast({ 
          type: 'success', 
          title: 'Verse bookmarked!', 
          message: `${reference} added to your bookmarks` 
        });
      }
    },
    
    removeBookmark: (reference: string) => {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const filtered = bookmarks.filter((b: string) => b !== reference);
      localStorage.setItem('bookmarks', JSON.stringify(filtered));
      toast.addToast({ 
        type: 'info', 
        title: 'Bookmark removed', 
        message: `${reference} removed from bookmarks` 
      });
    }
  };
}

// Utility functions for feature hint integration
export function addFeatureHint(selector: string, hintId: string) {
  if (typeof document !== 'undefined') {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute('data-hint', hintId);
    }
  }
}

// Loading state utilities
export function withLoadingState<T extends any[]>(
  asyncFn: (...args: T) => Promise<any>,
  loadingMessage: string = 'Loading...'
) {
  return async (...args: T) => {
    const ux = useUX();
    
    try {
      ux.showInfo('Loading', loadingMessage);
      const result = await asyncFn(...args);
      return result;
    } catch (error) {
      ux.showError('Error', error instanceof Error ? error.message : 'Something went wrong');
      throw error;
    }
  };
}

// Success message utilities
export const successMessages = {
  verseShared: (platform: string) => `Verse shared to ${platform}!`,
  planCompleted: (planName: string) => `Congratulations! You completed "${planName}"`,
  streakAchieved: (days: number) => `Amazing! ${days} day reading streak!`,
  searchSaved: 'Search saved to your favorites',
  settingsUpdated: 'Settings updated successfully',
  dataExported: 'Your data has been exported',
  feedbackSent: 'Thank you for your feedback!'
};

export default UXProvider;