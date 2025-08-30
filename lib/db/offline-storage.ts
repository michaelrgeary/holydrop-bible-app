import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface HolyDropDB extends DBSchema {
  bibleChapters: {
    key: string;
    value: {
      book: string;
      chapter: number;
      verses: Array<{ verse: number; text: string }>;
      cachedAt: number;
    };
  };
  annotations: {
    key: string;
    value: {
      id: string;
      book: string;
      chapter: number;
      verse_start: number;
      verse_end?: number;
      content: string;
      author: any;
      synced: boolean;
      created_at: string;
    };
  };
  readingHistory: {
    key: string;
    value: {
      book: string;
      chapter: number;
      verse?: number;
      timestamp: number;
    };
  };
  preferences: {
    key: string;
    value: any;
  };
}

class OfflineStorage {
  private db: IDBPDatabase<HolyDropDB> | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  
  async initialize() {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      return this.initPromise;
    }
    
    if (this.db) {
      return;
    }
    
    this.isInitializing = true;
    this.initPromise = this.doInitialize();
    
    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
    }
  }
  
  private async doInitialize() {
    console.log('🔧 Initializing offline storage...');
    
    this.db = await openDB<HolyDropDB>('holydrop-offline', 1, {
      upgrade(db) {
        // Create stores
        if (!db.objectStoreNames.contains('bibleChapters')) {
          db.createObjectStore('bibleChapters');
        }
        if (!db.objectStoreNames.contains('annotations')) {
          const store = db.createObjectStore('annotations', { keyPath: 'id' });
          // @ts-ignore - IDB types are not fully compatible with array keys
          store.createIndex('by-chapter', ['book', 'chapter']);
          // @ts-ignore - IDB types issue
          store.createIndex('by-sync', 'synced');
        }
        if (!db.objectStoreNames.contains('readingHistory')) {
          db.createObjectStore('readingHistory');
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences');
        }
      },
    });
    
    console.log('✅ Offline storage initialized');
    
    // Preload Bible in background (don't wait for it)
    this.preloadBible().catch(console.error);
  }
  
  async preloadBible() {
    if (!this.db) await this.initialize();
    if (!this.db) return;
    
    console.log('📖 Preloading Bible for offline access...');
    const startTime = performance.now();
    
    try {
      // Fetch list of all chapters
      const response = await fetch('/data/bible/index.json');
      const index = await response.json();
      
      let loaded = 0;
      const total = index.books.reduce((sum: number, book: any) => sum + book.chapters, 0);
      
      // Load in batches to avoid blocking UI
      for (const book of index.books) {
        for (let chapter = 1; chapter <= book.chapters; chapter++) {
          const chapterKey = `${book.slug}-${chapter}`;
          
          // Check if already cached
          const cached = await this.db!.get('bibleChapters', chapterKey);
          if (cached && cached.cachedAt > Date.now() - 7 * 86400000) { // 7 days
            loaded++;
            continue;
          }
          
          // Fetch and cache
          try {
            const resp = await fetch(`/data/bible/${chapterKey}.json`);
            if (!resp.ok) continue;
            
            const data = await resp.json();
            
            await this.db!.put('bibleChapters', {
              book: book.slug,
              chapter,
              verses: data.verses,
              cachedAt: Date.now()
            }, chapterKey);
            
            loaded++;
            
            // Update progress every 50 chapters
            if (loaded % 50 === 0) {
              const progress = Math.round((loaded / total) * 100);
              console.log(`📖 Bible preload progress: ${progress}% (${loaded}/${total} chapters)`);
            }
            
            // Small delay to prevent blocking
            if (loaded % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          } catch (error) {
            console.error(`Failed to cache ${chapterKey}:`, error);
          }
        }
      }
      
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Bible preloaded: ${loaded} chapters in ${duration}s`);
      
      // Store preload status
      await this.db!.put('preferences', {
        preloadedAt: Date.now(),
        chaptersLoaded: loaded,
        totalChapters: total
      }, 'bible-preload-status');
      
    } catch (error) {
      console.error('Failed to preload Bible:', error);
    }
  }
  
  async getChapter(book: string, chapter: number) {
    if (!this.db) await this.initialize();
    if (!this.db) return null;
    
    const key = `${book}-${chapter}`;
    
    // Try IndexedDB first
    try {
      const cached = await this.db.get('bibleChapters', key);
      if (cached) {
        console.log(`📖 Loaded ${key} from offline cache`);
        return cached;
      }
    } catch (error) {
      console.error('Failed to read from cache:', error);
    }
    
    // Fallback to network
    try {
      const response = await fetch(`/data/bible/${key}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache for next time
      try {
        await this.db.put('bibleChapters', {
          book,
          chapter,
          verses: data.verses,
          cachedAt: Date.now()
        }, key);
        console.log(`💾 Cached ${key} for offline use`);
      } catch (cacheError) {
        console.error('Failed to cache chapter:', cacheError);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch chapter:', error);
      return null;
    }
  }
  
  async saveAnnotationOffline(annotation: any) {
    if (!this.db) await this.initialize();
    if (!this.db) return;
    
    // Mark as unsynced
    annotation.synced = false;
    annotation.id = annotation.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.put('annotations', annotation);
    console.log(`💾 Saved annotation offline: ${annotation.id}`);
    
    // Try to sync if online
    if (navigator.onLine) {
      this.syncAnnotations();
    }
  }
  
  async getAnnotations(book: string, chapter: number) {
    if (!this.db) await this.initialize();
    if (!this.db) return [];
    
    try {
      const tx = this.db.transaction('annotations');
      // @ts-ignore - IDB types issue with index
      const index = tx.store.index('by-chapter');
      // @ts-ignore - IDB doesn't properly type compound keys
      return await index.getAll([book, chapter]);
    } catch (error) {
      console.error('Failed to get offline annotations:', error);
      return [];
    }
  }
  
  async syncAnnotations() {
    if (!this.db || !navigator.onLine) return;
    
    console.log('🔄 Syncing offline annotations...');
    
    try {
      const tx = this.db.transaction('annotations');
      // @ts-ignore - IDB types issue with index
      const index = tx.store.index('by-sync');
      // @ts-ignore - IDB doesn't properly type boolean index values
      const unsynced = await index.getAll(false);
      
      let synced = 0;
      for (const annotation of unsynced) {
        try {
          const response = await fetch('/api/annotations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(annotation)
          });
          
          if (response.ok) {
            annotation.synced = true;
            await this.db.put('annotations', annotation);
            synced++;
          }
        } catch (error) {
          console.error('Sync failed for annotation:', error);
        }
      }
      
      if (synced > 0) {
        console.log(`✅ Synced ${synced} annotations`);
      }
    } catch (error) {
      console.error('Sync process failed:', error);
    }
  }
  
  async saveReadingPosition(book: string, chapter: number, verse?: number) {
    if (!this.db) await this.initialize();
    if (!this.db) return;
    
    const key = 'last-position';
    await this.db.put('readingHistory', {
      book,
      chapter,
      verse,
      timestamp: Date.now()
    }, key);
  }
  
  async getLastReadingPosition() {
    if (!this.db) await this.initialize();
    if (!this.db) return null;
    
    try {
      return await this.db.get('readingHistory', 'last-position');
    } catch (error) {
      console.error('Failed to get reading position:', error);
      return null;
    }
  }
  
  async getCacheStatus() {
    if (!this.db) await this.initialize();
    if (!this.db) return null;
    
    try {
      const status = await this.db.get('preferences', 'bible-preload-status');
      const chaptersCount = await this.db.count('bibleChapters');
      
      return {
        ...status,
        currentlyCached: chaptersCount,
        isComplete: chaptersCount >= 1189
      };
    } catch (error) {
      console.error('Failed to get cache status:', error);
      return null;
    }
  }
  
  async clearCache() {
    if (!this.db) await this.initialize();
    if (!this.db) return;
    
    console.log('🗑️ Clearing offline cache...');
    
    try {
      const tx = this.db.transaction('bibleChapters', 'readwrite');
      await tx.store.clear();
      console.log('✅ Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();

// Initialize on first import (browser only)
if (typeof window !== 'undefined') {
  offlineStorage.initialize().catch(console.error);
  
  // Set up sync on online event
  window.addEventListener('online', () => {
    offlineStorage.syncAnnotations();
  });
}