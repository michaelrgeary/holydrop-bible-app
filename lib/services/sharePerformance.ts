'use client';

import { ShareAnalytics } from './shareAnalytics';

// Performance monitoring for sharing features
// Tracks card generation timing, cache efficiency, memory usage, and errors

interface PerformanceConfig {
  enableLogging: boolean;
  slowThreshold: number; // milliseconds
  errorThreshold: number; // percentage
  memoryThreshold: number; // bytes
  cacheWarningThreshold: number; // cache hit rate percentage
}

interface GenerationMetrics {
  startTime: number;
  strategy: 'canvas' | 'svg' | 'server';
  cacheHit: boolean;
  success: boolean;
  errorMessage?: string;
  memoryBefore?: number;
  memoryAfter?: number;
}

export class SharePerformanceMonitor {
  private static instance: SharePerformanceMonitor;
  private analytics: ShareAnalytics;
  private activeGenerations = new Map<string, GenerationMetrics>();
  private config: PerformanceConfig = {
    enableLogging: process.env.NODE_ENV === 'development',
    slowThreshold: 2000,
    errorThreshold: 10,
    memoryThreshold: 50 * 1024 * 1024, // 50MB
    cacheWarningThreshold: 60 // 60%
  };
  
  public static getInstance(): SharePerformanceMonitor {
    if (!SharePerformanceMonitor.instance) {
      SharePerformanceMonitor.instance = new SharePerformanceMonitor();
    }
    return SharePerformanceMonitor.instance;
  }
  
  constructor() {
    this.analytics = ShareAnalytics.getInstance();
    this.setupMemoryMonitoring();
  }
  
  // Start tracking a card generation
  public startGeneration(
    generationId: string, 
    strategy: 'canvas' | 'svg' | 'server', 
    cacheHit: boolean = false
  ): void {
    const metrics: GenerationMetrics = {
      startTime: performance.now(),
      strategy,
      cacheHit,
      success: false,
      memoryBefore: this.getMemoryUsage(),
    };
    
    this.activeGenerations.set(generationId, metrics);
    
    if (this.config.enableLogging) {
      console.log(`🎨 Starting card generation [${generationId}] via ${strategy}${cacheHit ? ' (cache hit)' : ''}`);
    }
  }
  
  // End tracking a card generation
  public endGeneration(generationId: string, success: boolean, error?: Error): void {
    const metrics = this.activeGenerations.get(generationId);
    if (!metrics) return;
    
    const endTime = performance.now();
    const duration = endTime - metrics.startTime;
    
    metrics.success = success;
    metrics.memoryAfter = this.getMemoryUsage();
    
    if (error) {
      metrics.errorMessage = error.message;
    }
    
    // Log performance info
    if (this.config.enableLogging) {
      const status = success ? '✅' : '❌';
      const cacheInfo = metrics.cacheHit ? ' (cached)' : '';
      const memoryDiff = metrics.memoryAfter && metrics.memoryBefore 
        ? ` | Δ${this.formatBytes((metrics.memoryAfter - metrics.memoryBefore))}`
        : '';
      
      console.log(
        `${status} Card generation [${generationId}] completed in ${duration.toFixed(0)}ms via ${metrics.strategy}${cacheInfo}${memoryDiff}`
      );
      
      if (error) {
        console.error(`❌ Generation error [${generationId}]:`, error.message);
      }
    }
    
    // Check for performance issues
    this.checkPerformanceIssues(duration, metrics);
    
    // Track analytics
    this.analytics.trackEvent({
      type: 'card-generation',
      strategy: metrics.strategy,
      generationTime: duration,
      error: !success,
    });
    
    // Cleanup
    this.activeGenerations.delete(generationId);
  }
  
  // Track cache performance
  public trackCacheHit(cacheSize: number, maxCacheSize: number): void {
    const hitRate = cacheSize > 0 ? (cacheSize / maxCacheSize) * 100 : 0;
    
    if (hitRate < this.config.cacheWarningThreshold) {
      console.warn(`⚠️  Low cache hit rate: ${hitRate.toFixed(1)}% (${cacheSize}/${maxCacheSize})`);
    }
    
    if (this.config.enableLogging) {
      console.log(`📊 Cache performance: ${hitRate.toFixed(1)}% hit rate (${cacheSize}/${maxCacheSize})`);
    }
  }
  
  // Monitor memory usage
  private setupMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;
    
    // Check memory periodically (every 30 seconds)
    setInterval(() => {
      const usage = this.getMemoryUsage();
      if (usage > this.config.memoryThreshold) {
        console.warn(`⚠️  High memory usage: ${this.formatBytes(usage)}`);
        
        // Suggest cache cleanup
        if (this.config.enableLogging) {
          console.log('💡 Consider clearing card generation cache to free memory');
        }
      }
    }, 30000);
  }
  
  // Check for various performance issues
  private checkPerformanceIssues(duration: number, metrics: GenerationMetrics): void {
    // Slow generation warning
    if (duration > this.config.slowThreshold) {
      console.warn(
        `🐌 Slow card generation: ${duration.toFixed(0)}ms (threshold: ${this.config.slowThreshold}ms) via ${metrics.strategy}`
      );
      
      // Suggest optimizations
      if (metrics.strategy === 'canvas' && duration > 3000) {
        console.log('💡 Consider switching to SVG generation for better performance');
      }
      
      if (metrics.strategy === 'server' && duration > 5000) {
        console.log('💡 Server generation is slow - check network connection');
      }
    }
    
    // Memory leak detection
    if (metrics.memoryBefore && metrics.memoryAfter) {
      const memoryIncrease = metrics.memoryAfter - metrics.memoryBefore;
      if (memoryIncrease > 10 * 1024 * 1024) { // 10MB increase
        console.warn(`🧠 Large memory increase during generation: ${this.formatBytes(memoryIncrease)}`);
      }
    }
    
    // Strategy fallback tracking
    if (metrics.strategy === 'svg' && !metrics.cacheHit) {
      console.log('📋 Using SVG fallback - Canvas may not be available');
    }
    
    if (metrics.strategy === 'server' && !metrics.cacheHit) {
      console.log('🌐 Using server fallback - Client-side generation failed');
    }
  }
  
  // Get current memory usage (if available)
  private getMemoryUsage(): number {
    if (typeof window === 'undefined') return 0;
    
    try {
      if ('memory' in performance && (performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
    } catch (error) {
      // Memory API not available
    }
    
    return 0;
  }
  
  // Format bytes for human reading
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
  
  // Get current performance stats
  public getPerformanceStats(): {
    activeGenerations: number;
    memoryUsage: string;
    averageGenerationTime: number;
    errorRate: number;
  } {
    const memoryUsage = this.getMemoryUsage();
    const avgTime = this.analytics.getAverageGenerationTime();
    const errorRate = this.analytics.getErrorRate();
    
    return {
      activeGenerations: this.activeGenerations.size,
      memoryUsage: this.formatBytes(memoryUsage),
      averageGenerationTime: Math.round(avgTime),
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }
  
  // Get detailed performance report
  public getPerformanceReport(): {
    config: PerformanceConfig;
    stats: {
      activeGenerations: number;
      memoryUsage: string;
      averageGenerationTime: number;
      errorRate: number;
    };
    recommendations: string[];
  } {
    const stats = this.getPerformanceStats();
    const recommendations: string[] = [];
    
    // Generate recommendations based on performance
    if (stats.averageGenerationTime > this.config.slowThreshold) {
      recommendations.push('Average generation time is slow - consider optimizing card rendering');
    }
    
    if (stats.errorRate > this.config.errorThreshold) {
      recommendations.push('High error rate detected - check fallback strategies');
    }
    
    if (this.getMemoryUsage() > this.config.memoryThreshold) {
      recommendations.push('High memory usage - consider clearing cache more frequently');
    }
    
    if (stats.activeGenerations > 5) {
      recommendations.push('Many concurrent generations - consider limiting parallel requests');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! 🎉');
    }
    
    return {
      config: this.config,
      stats,
      recommendations,
    };
  }
  
  // Update configuration
  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enableLogging) {
      console.log('🔧 Performance monitoring config updated:', newConfig);
    }
  }
  
  // Force garbage collection (if available)
  public suggestGarbageCollection(): void {
    if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
        console.log('🧹 Garbage collection triggered');
      } catch (error) {
        console.warn('Failed to trigger garbage collection:', error);
      }
    } else {
      console.log('💡 Garbage collection not available - consider closing unused tabs');
    }
  }
  
  // Create performance mark for external tracking
  public mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window && performance.mark) {
      try {
        performance.mark(name);
      } catch (error) {
        // Performance API not available
      }
    }
  }
  
  // Measure time between two marks
  public measure(name: string, startMark: string, endMark: string): number | null {
    if (typeof window !== 'undefined' && 'performance' in window && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name);
        return entries.length > 0 ? entries[entries.length - 1].duration : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}