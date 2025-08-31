'use client';

import { IntelligentQueryParser, ParsedQuery } from './queryParser';

// Search result interfaces
export interface SearchResult {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  score: number;
  highlights: TextHighlight[];
  context: SearchContext;
  metadata: VerseMetadata;
}

export interface TextHighlight {
  text: string;
  start: number;
  end: number;
  type: 'exact' | 'partial' | 'semantic' | 'keyword';
}

export interface SearchContext {
  beforeText?: string;
  afterText?: string;
  chapterTitle?: string;
  themes: string[];
  lifeSituations: string[];
}

export interface VerseMetadata {
  testament: 'old' | 'new';
  genre: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularityScore: number;
  readingLevel: number;
}

export interface SearchOptions {
  maxResults?: number;
  includeContext?: boolean;
  minScore?: number;
  filters?: SearchFilter[];
  sortBy?: 'relevance' | 'canonical' | 'popularity';
  fuzzyMatch?: boolean;
  semanticSearch?: boolean;
}

export interface SearchFilter {
  type: 'book' | 'testament' | 'genre' | 'difficulty' | 'theme';
  values: string[];
  exclude?: boolean;
}

export interface SearchStats {
  totalResults: number;
  searchTime: number;
  queryProcessingTime: number;
  cacheHit: boolean;
  indexesUsed: string[];
  filtersApplied: number;
}

export interface CachedSearchResult {
  results: SearchResult[];
  stats: SearchStats;
  timestamp: number;
  queryHash: string;
}

// Search engine with LRU cache and ranking algorithms
export class OptimizedSearchEngine {
  private static instance: OptimizedSearchEngine;
  private queryParser: IntelligentQueryParser;
  
  // Loaded indexes
  private indexes: any = null;
  private trieIndex: any = null;
  
  // LRU Cache for search results
  private cache: Map<string, CachedSearchResult>;
  private maxCacheSize: number = 500;
  private cacheHits: number = 0;
  private totalQueries: number = 0;
  
  // Performance tracking
  private performanceMetrics: {
    averageSearchTime: number;
    cacheHitRate: number;
    popularQueries: Map<string, number>;
    slowQueries: Array<{ query: string; time: number; timestamp: number }>;
  };
  
  public static getInstance(): OptimizedSearchEngine {
    if (!OptimizedSearchEngine.instance) {
      OptimizedSearchEngine.instance = new OptimizedSearchEngine();
    }
    return OptimizedSearchEngine.instance;
  }
  
  constructor() {
    this.queryParser = IntelligentQueryParser.getInstance();
    this.cache = new Map();
    this.performanceMetrics = {
      averageSearchTime: 0,
      cacheHitRate: 0,
      popularQueries: new Map(),
      slowQueries: [],
    };
    
    this.initializeIndexes();
  }
  
  private async initializeIndexes(): Promise<void> {
    try {
      // Load the search indexes built by our indexing system
      const indexResponse = await fetch('/data/search-indexes.json');
      const trieResponse = await fetch('/data/trie-index.json');
      
      if (indexResponse.ok) {
        this.indexes = await indexResponse.json();
        console.log('✅ Search indexes loaded successfully');
      }
      
      if (trieResponse.ok) {
        this.trieIndex = await trieResponse.json();
        console.log('✅ Trie index loaded successfully');
      }
    } catch (error) {
      console.warn('⚠️ Could not load search indexes, falling back to basic search:', error);
    }
  }
  
  public async search(
    query: string, 
    options: SearchOptions = {}
  ): Promise<{ results: SearchResult[]; stats: SearchStats }> {
    
    const searchStartTime = performance.now();
    this.totalQueries++;
    
    // Default options
    const searchOptions: Required<SearchOptions> = {
      maxResults: 50,
      includeContext: true,
      minScore: 0.1,
      filters: [],
      sortBy: 'relevance',
      fuzzyMatch: true,
      semanticSearch: true,
      ...options
    };
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(query, searchOptions);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.cacheHits++;
      const stats: SearchStats = {
        ...cached.stats,
        cacheHit: true,
        searchTime: performance.now() - searchStartTime,
      };
      return { results: cached.results, stats };
    }
    
    // Parse the query
    const queryParseStartTime = performance.now();
    const parsedQuery = this.queryParser.parseQuery(query);
    const queryProcessingTime = performance.now() - queryParseStartTime;
    
    // Track popular queries
    this.trackPopularQuery(query);
    
    // Execute search based on query type
    let results: SearchResult[] = [];
    const indexesUsed: string[] = [];
    
    if (this.indexes) {
      results = await this.executeOptimizedSearch(parsedQuery, searchOptions, indexesUsed);
    } else {
      // Fallback to basic search if indexes not loaded
      results = await this.executeFallbackSearch(parsedQuery, searchOptions);
      indexesUsed.push('fallback');
    }
    
    // Apply post-processing
    results = this.rankResults(results, parsedQuery, searchOptions);
    results = this.applyFilters(results, searchOptions.filters);
    results = this.limitResults(results, searchOptions.maxResults);
    
    // Calculate final stats
    const totalSearchTime = performance.now() - searchStartTime;
    const stats: SearchStats = {
      totalResults: results.length,
      searchTime: totalSearchTime,
      queryProcessingTime,
      cacheHit: false,
      indexesUsed,
      filtersApplied: searchOptions.filters.length,
    };
    
    // Cache the results
    this.addToCache(cacheKey, { results, stats, timestamp: Date.now(), queryHash: cacheKey });
    
    // Update performance metrics
    this.updatePerformanceMetrics(totalSearchTime, query);
    
    return { results, stats };
  }
  
  private async executeOptimizedSearch(
    parsedQuery: ParsedQuery, 
    options: Required<SearchOptions>,
    indexesUsed: string[]
  ): Promise<SearchResult[]> {
    
    let results: SearchResult[] = [];
    
    // Handle verse lookups first (highest priority)
    if (parsedQuery.verseReferences && parsedQuery.verseReferences.length > 0) {
      indexesUsed.push('verse-lookup');
      results = await this.searchByVerseReference(parsedQuery);
      if (results.length > 0) return results;
    }
    
    // Handle life situation searches
    if (parsedQuery.lifeSituations.length > 0) {
      indexesUsed.push('concept-index');
      const situationResults = await this.searchByLifeSituation(parsedQuery, options);
      results = results.concat(situationResults);
    }
    
    // Handle topic searches
    if (parsedQuery.topics.length > 0) {
      indexesUsed.push('concept-index');
      const topicResults = await this.searchByTopics(parsedQuery, options);
      results = results.concat(topicResults);
    }
    
    // Handle keyword/text searches
    if (parsedQuery.keywords.length > 0) {
      indexesUsed.push('inverted-index');
      const keywordResults = await this.searchByKeywords(parsedQuery, options);
      results = results.concat(keywordResults);
    }
    
    // Handle semantic search if enabled
    if (options.semanticSearch && results.length < 10) {
      indexesUsed.push('semantic-index');
      const semanticResults = await this.searchBySemantic(parsedQuery, options);
      results = results.concat(semanticResults);
    }
    
    // Remove duplicates while preserving best scores
    results = this.deduplicateResults(results);
    
    return results;
  }
  
  private async searchByVerseReference(parsedQuery: ParsedQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    if (!parsedQuery.verseReferences) return results;
    
    for (const ref of parsedQuery.verseReferences) {
      const verseId = ref.normalized;
      const verseData = this.indexes.verseIndex[verseId];
      
      if (verseData) {
        results.push(this.createSearchResult(verseData, 1.0, [], parsedQuery));
      }
    }
    
    return results;
  }
  
  private async searchByLifeSituation(
    parsedQuery: ParsedQuery, 
    options: Required<SearchOptions>
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    for (const situation of parsedQuery.lifeSituations) {
      const verseIds = this.indexes.conceptIndex[situation];
      if (verseIds) {
        for (const verseId of verseIds.slice(0, 20)) { // Limit per situation
          const verseData = this.indexes.verseIndex[verseId];
          if (verseData) {
            const score = this.calculateRelevanceScore(verseData, parsedQuery) * 0.9; // Concept boost
            if (score >= options.minScore) {
              const highlights = this.generateHighlights(verseData.text, parsedQuery);
              results.push(this.createSearchResult(verseData, score, highlights, parsedQuery));
            }
          }
        }
      }
    }
    
    return results;
  }
  
  private async searchByTopics(
    parsedQuery: ParsedQuery, 
    options: Required<SearchOptions>
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    for (const topic of parsedQuery.topics) {
      // Search in inverted index for topic-related terms
      const entry = this.indexes.invertedIndex[topic];
      if (entry) {
        for (const verseId of entry.verseIds.slice(0, 30)) {
          const verseData = this.indexes.verseIndex[verseId];
          if (verseData) {
            const score = this.calculateRelevanceScore(verseData, parsedQuery) * 0.8; // Topic boost
            if (score >= options.minScore) {
              const highlights = this.generateHighlights(verseData.text, parsedQuery);
              results.push(this.createSearchResult(verseData, score, highlights, parsedQuery));
            }
          }
        }
      }
    }
    
    return results;
  }
  
  private async searchByKeywords(
    parsedQuery: ParsedQuery, 
    options: Required<SearchOptions>
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const verseScores = new Map<string, number>();
    
    // Score verses based on keyword matches
    for (const keyword of parsedQuery.keywords) {
      const entry = this.indexes.invertedIndex[keyword];
      if (entry) {
        for (const verseId of entry.verseIds) {
          const currentScore = verseScores.get(verseId) || 0;
          const keywordScore = this.calculateKeywordScore(keyword, entry, verseId);
          verseScores.set(verseId, currentScore + keywordScore);
        }
      }
    }
    
    // Convert to results
    for (const [verseId, score] of verseScores) {
      if (score >= options.minScore) {
        const verseData = this.indexes.verseIndex[verseId];
        if (verseData) {
          const highlights = this.generateHighlights(verseData.text, parsedQuery);
          results.push(this.createSearchResult(verseData, score, highlights, parsedQuery));
        }
      }
    }
    
    return results;
  }
  
  private async searchBySemantic(
    parsedQuery: ParsedQuery, 
    options: Required<SearchOptions>
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // For semantic search, we'd typically use the semantic vectors
    // This is a simplified version focusing on related concepts
    const semanticTerms = [
      ...parsedQuery.lifeSituations,
      ...parsedQuery.topics,
      ...parsedQuery.keywords
    ];
    
    for (const term of semanticTerms) {
      const conceptVerses = this.indexes.semanticIndex?.concepts[term];
      if (conceptVerses) {
        for (const verseId of conceptVerses.slice(0, 10)) {
          const verseData = this.indexes.verseIndex[verseId];
          if (verseData) {
            const score = this.calculateRelevanceScore(verseData, parsedQuery) * 0.6; // Semantic boost
            if (score >= options.minScore) {
              const highlights = this.generateHighlights(verseData.text, parsedQuery);
              results.push(this.createSearchResult(verseData, score, highlights, parsedQuery));
            }
          }
        }
      }
    }
    
    return results;
  }
  
  private async executeFallbackSearch(
    parsedQuery: ParsedQuery, 
    options: Required<SearchOptions>
  ): Promise<SearchResult[]> {
    // This would typically search through verses directly
    // For now, returning empty array as we have the optimized search
    console.warn('Using fallback search - indexes not available');
    return [];
  }
  
  private calculateRelevanceScore(verseData: any, parsedQuery: ParsedQuery): number {
    let score = 0;
    
    // Base score from text length (shorter verses get slight boost)
    const textLength = verseData.text.length;
    const lengthScore = Math.max(0.1, 1 - (textLength / 500));
    score += lengthScore * 0.1;
    
    // Keyword matching score
    const verseText = verseData.text.toLowerCase();
    for (const keyword of parsedQuery.keywords) {
      if (verseText.includes(keyword)) {
        score += 0.3;
        // Bonus for exact word match vs substring
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (wordBoundaryRegex.test(verseData.text)) {
          score += 0.2;
        }
      }
    }
    
    // Life situation matching
    for (const situation of parsedQuery.lifeSituations) {
      if (verseData.keywords && verseData.keywords.includes(situation)) {
        score += 0.4;
      }
    }
    
    // Topic matching
    for (const topic of parsedQuery.topics) {
      if (verseData.keywords && verseData.keywords.includes(topic)) {
        score += 0.3;
      }
    }
    
    // Book popularity boost (New Testament often more popular)
    if (verseData.book.toLowerCase().includes('john') || 
        verseData.book.toLowerCase().includes('romans') ||
        verseData.book.toLowerCase().includes('psalm')) {
      score += 0.1;
    }
    
    // Query type specific boosts
    switch (parsedQuery.queryType) {
      case 'life-situation':
        score *= 1.2;
        break;
      case 'verse-lookup':
        score = 1.0; // Perfect match
        break;
      case 'topic-search':
        score *= 1.1;
        break;
    }
    
    return Math.min(1.0, score);
  }
  
  private calculateKeywordScore(keyword: string, indexEntry: any, verseId: string): number {
    const positions = indexEntry.positions.find((p: any) => p.verseId === verseId);
    if (!positions) return 0;
    
    // Base score from frequency (TF)
    const tf = positions.positions.length;
    const tfScore = Math.log(1 + tf) / Math.log(10); // Log normalization
    
    // Inverse document frequency (IDF)
    const df = indexEntry.verseIds.length;
    const totalDocs = Object.keys(this.indexes.verseIndex).length;
    const idf = Math.log(totalDocs / df);
    
    // TF-IDF score
    return tfScore * idf * 0.01; // Scale down for combination with other scores
  }
  
  private generateHighlights(text: string, parsedQuery: ParsedQuery): TextHighlight[] {
    const highlights: TextHighlight[] = [];
    
    // Highlight keywords
    for (const keyword of parsedQuery.keywords) {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        highlights.push({
          text: match[1],
          start: match.index,
          end: match.index + match[1].length,
          type: 'keyword'
        });
      }
    }
    
    // Sort highlights by position
    highlights.sort((a, b) => a.start - b.start);
    
    return highlights;
  }
  
  private createSearchResult(
    verseData: any, 
    score: number, 
    highlights: TextHighlight[], 
    parsedQuery: ParsedQuery
  ): SearchResult {
    return {
      id: verseData.id,
      book: verseData.book,
      chapter: verseData.chapter,
      verse: verseData.verse,
      text: verseData.text,
      score: Math.round(score * 1000) / 1000,
      highlights,
      context: {
        themes: verseData.keywords || [],
        lifeSituations: parsedQuery.lifeSituations,
      },
      metadata: {
        testament: verseData.book.toLowerCase().includes('genesis') ? 'old' : 'new', // Simplified
        genre: 'unknown',
        difficulty: 'beginner',
        popularityScore: 0.5,
        readingLevel: 6,
      }
    };
  }
  
  private rankResults(
    results: SearchResult[], 
    parsedQuery: ParsedQuery, 
    options: Required<SearchOptions>
  ): SearchResult[] {
    
    switch (options.sortBy) {
      case 'relevance':
        return results.sort((a, b) => b.score - a.score);
        
      case 'canonical':
        return results.sort((a, b) => {
          // Sort by book order, then chapter, then verse
          if (a.book !== b.book) {
            return a.book.localeCompare(b.book);
          }
          if (a.chapter !== b.chapter) {
            return a.chapter - b.chapter;
          }
          return a.verse - b.verse;
        });
        
      case 'popularity':
        return results.sort((a, b) => b.metadata.popularityScore - a.metadata.popularityScore);
        
      default:
        return results;
    }
  }
  
  private applyFilters(results: SearchResult[], filters: SearchFilter[]): SearchResult[] {
    let filteredResults = results;
    
    for (const filter of filters) {
      filteredResults = filteredResults.filter(result => {
        switch (filter.type) {
          case 'book':
            return filter.exclude 
              ? !filter.values.includes(result.book)
              : filter.values.includes(result.book);
              
          case 'testament':
            return filter.exclude
              ? !filter.values.includes(result.metadata.testament)
              : filter.values.includes(result.metadata.testament);
              
          case 'genre':
            return filter.exclude
              ? !filter.values.includes(result.metadata.genre)
              : filter.values.includes(result.metadata.genre);
              
          default:
            return true;
        }
      });
    }
    
    return filteredResults;
  }
  
  private limitResults(results: SearchResult[], maxResults: number): SearchResult[] {
    return results.slice(0, maxResults);
  }
  
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const deduplicated: SearchResult[] = [];
    
    for (const result of results) {
      if (!seen.has(result.id)) {
        seen.add(result.id);
        deduplicated.push(result);
      } else {
        // Keep the higher scored version
        const existingIndex = deduplicated.findIndex(r => r.id === result.id);
        if (existingIndex >= 0 && result.score > deduplicated[existingIndex].score) {
          deduplicated[existingIndex] = result;
        }
      }
    }
    
    return deduplicated;
  }
  
  // Cache management
  private generateCacheKey(query: string, options: Required<SearchOptions>): string {
    const optionsKey = JSON.stringify({
      maxResults: options.maxResults,
      filters: options.filters,
      sortBy: options.sortBy,
      semanticSearch: options.semanticSearch,
    });
    return `${query}:${optionsKey}`;
  }
  
  private getFromCache(key: string): CachedSearchResult | null {
    const cached = this.cache.get(key);
    if (cached) {
      // Check if cache entry is still valid (5 minutes)
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        // Move to end for LRU
        this.cache.delete(key);
        this.cache.set(key, cached);
        return cached;
      } else {
        this.cache.delete(key);
      }
    }
    return null;
  }
  
  private addToCache(key: string, result: CachedSearchResult): void {
    // Implement LRU eviction
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, result);
  }
  
  private trackPopularQuery(query: string): void {
    const count = this.performanceMetrics.popularQueries.get(query) || 0;
    this.performanceMetrics.popularQueries.set(query, count + 1);
    
    // Keep only top 100 popular queries
    if (this.performanceMetrics.popularQueries.size > 100) {
      const entries = Array.from(this.performanceMetrics.popularQueries.entries());
      entries.sort((a, b) => b[1] - a[1]);
      this.performanceMetrics.popularQueries = new Map(entries.slice(0, 100));
    }
  }
  
  private updatePerformanceMetrics(searchTime: number, query: string): void {
    // Update average search time
    const totalTime = this.performanceMetrics.averageSearchTime * (this.totalQueries - 1) + searchTime;
    this.performanceMetrics.averageSearchTime = totalTime / this.totalQueries;
    
    // Update cache hit rate
    this.performanceMetrics.cacheHitRate = this.cacheHits / this.totalQueries;
    
    // Track slow queries (> 100ms)
    if (searchTime > 100) {
      this.performanceMetrics.slowQueries.push({
        query,
        time: searchTime,
        timestamp: Date.now(),
      });
      
      // Keep only last 50 slow queries
      if (this.performanceMetrics.slowQueries.length > 50) {
        this.performanceMetrics.slowQueries.shift();
      }
    }
  }
  
  // Public API methods
  public async getAutocompleteSuggestions(query: string, maxSuggestions: number = 5): Promise<string[]> {
    if (!this.trieIndex || query.length < 2) {
      return [];
    }
    
    // Navigate trie to find suggestions
    let current = this.trieIndex;
    
    for (const char of query.toLowerCase()) {
      if (current.children && current.children[char]) {
        current = current.children[char];
      } else {
        return [];
      }
    }
    
    // Return suggestions from current node
    return (current.suggestions || []).slice(0, maxSuggestions);
  }
  
  public getPerformanceMetrics(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }
  
  public clearCache(): void {
    this.cache.clear();
    console.log('🧹 Search cache cleared');
  }
  
  public getCacheSize(): number {
    return this.cache.size;
  }
  
  public getCacheHitRate(): number {
    return this.performanceMetrics.cacheHitRate;
  }
}