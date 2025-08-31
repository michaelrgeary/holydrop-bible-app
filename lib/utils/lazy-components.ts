import dynamic from 'next/dynamic';

// Lazy load heavy components
export const components = {
  // Sharing system (heavy canvas operations)
  ShareCardCreator: dynamic(
    () => import('@/components/sharing/VerseCardCreator'),
    { 
      loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded" />,
      ssr: false 
    }
  ),
  
  // Search system (large indexes)
  CommandSearch: dynamic(
    () => import('@/components/search/SearchBar').then(mod => ({ default: mod.SearchBar })),
    { 
      loading: () => <div className="h-12 animate-pulse bg-gray-100 rounded" />,
      ssr: false 
    }
  ),
  
  // Reading plans (complex UI)
  DailyReading: dynamic(
    () => import('@/components/reading-plans/DailyReading'),
    { loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded" /> }
  ),
  
  // Sharing buttons
  ShareButtons: dynamic(
    () => import('@/components/sharing/ShareButtons').then(mod => ({ default: mod.ShareButtons })),
    { 
      loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded" />,
      ssr: false 
    }
  ),
  
  // Achievement share
  AchievementShare: dynamic(
    () => import('@/components/sharing/AchievementShare').then(mod => ({ default: mod.AchievementShare })),
    { 
      loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded" />,
      ssr: false 
    }
  ),
};

// Preload critical components after initial render
export function preloadCriticalComponents() {
  if (typeof window !== 'undefined') {
    requestIdleCallback(() => {
      // Preload search as it's commonly used
      import('@/components/search/SearchBar');
    }, { timeout: 5000 });
  }
}

// Performance monitoring for lazy loading
export function trackLazyLoadPerformance(componentName: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`lazy-${componentName}-start`);
    
    return () => {
      try {
        performance.mark(`lazy-${componentName}-end`);
        performance.measure(
          `lazy-${componentName}-load`,
          `lazy-${componentName}-start`,
          `lazy-${componentName}-end`
        );
        
        const measure = performance.getEntriesByName(`lazy-${componentName}-load`)[0];
        if (measure && measure.duration > 100) {
          console.warn(`Slow lazy load: ${componentName} took ${measure.duration.toFixed(2)}ms`);
        }
      } catch (error) {
        // Performance API not available
      }
    };
  }
  
  return () => {};
}