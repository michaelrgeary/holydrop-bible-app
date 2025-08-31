#!/usr/bin/env npx tsx

import { promises as fs } from 'fs';
import { join } from 'path';
import { BIBLE_TAXONOMY } from '../data/bible-taxonomy';

// Memory management configuration
const MEMORY_CONFIG = {
  maxMemoryMB: 200,
  batchSize: 100, // Process verses in batches
  gcThreshold: 150, // Trigger GC at 150MB
  indexFlushSize: 5000, // Flush index to disk every 5K entries
};

// Verse interface matching our Bible data format
interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  id: string; // e.g., "john-3-16"
}

interface SearchableVerse extends BibleVerse {
  tokens: string[];
  normalizedText: string;
  keywords: string[];
  semanticVector?: number[];
}

interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  suggestions: string[];
  frequency: number;
}

interface InvertedIndex {
  [term: string]: {
    verseIds: string[];
    positions: Array<{
      verseId: string;
      positions: number[];
    }>;
    frequency: number;
  };
}

interface SemanticIndex {
  concepts: Map<string, string[]>; // concept -> verse IDs
  embeddings: Map<string, number[]>; // verse ID -> embedding vector
  similarities: Map<string, Array<{ verseId: string; score: number }>>; // verse ID -> similar verses
}

interface CompleteBibleIndex {
  metadata: {
    totalVerses: number;
    buildTime: number;
    version: string;
    memoryUsed: number;
  };
  invertedIndex: InvertedIndex;
  trieIndex: TrieNode;
  semanticIndex: SemanticIndex;
  verseIndex: Map<string, SearchableVerse>;
  bookIndex: Map<string, string[]>; // book -> verse IDs
  conceptIndex: Map<string, string[]>; // life situation/theology -> verse IDs
}

class EfficientIndexBuilder {
  private currentMemoryUsage: number = 0;
  private processedVerses: number = 0;
  private totalVerses: number = 0;
  private buildStartTime: number = Date.now();

  // Main indexes
  private invertedIndex: InvertedIndex = {};
  private trieRoot: TrieNode = this.createTrieNode();
  private semanticIndex: SemanticIndex = {
    concepts: new Map(),
    embeddings: new Map(),
    similarities: new Map(),
  };
  private verseIndex: Map<string, SearchableVerse> = new Map();
  private bookIndex: Map<string, string[]> = new Map();
  private conceptIndex: Map<string, string[]> = new Map();

  // Progress tracking
  private onProgress?: (progress: { processed: number; total: number; phase: string }) => void;

  constructor(progressCallback?: (progress: { processed: number; total: number; phase: string }) => void) {
    this.onProgress = progressCallback;
  }

  async buildCompleteIndex(): Promise<CompleteBibleIndex> {
    console.log('🚀 Starting comprehensive Bible index build...');
    
    try {
      // Phase 1: Load and preprocess all verses
      await this.loadAndPreprocessVerses();
      
      // Phase 2: Build inverted index
      await this.buildInvertedIndex();
      
      // Phase 3: Build trie for autocomplete
      await this.buildTrieIndex();
      
      // Phase 4: Build semantic relationships
      await this.buildSemanticIndex();
      
      // Phase 5: Build concept mappings
      await this.buildConceptIndex();
      
      // Phase 6: Optimize and compress
      await this.optimizeIndexes();

      const buildTime = Date.now() - this.buildStartTime;
      console.log(`✅ Index build complete in ${buildTime}ms`);
      console.log(`📊 Processed ${this.processedVerses} verses`);
      console.log(`💾 Final memory usage: ${Math.round(this.currentMemoryUsage / 1024 / 1024)}MB`);

      return {
        metadata: {
          totalVerses: this.totalVerses,
          buildTime,
          version: '1.0.0',
          memoryUsed: this.currentMemoryUsage,
        },
        invertedIndex: this.invertedIndex,
        trieIndex: this.trieRoot,
        semanticIndex: this.semanticIndex,
        verseIndex: this.verseIndex,
        bookIndex: this.bookIndex,
        conceptIndex: this.conceptIndex,
      };

    } catch (error) {
      console.error('❌ Index build failed:', error);
      throw error;
    }
  }

  private async loadAndPreprocessVerses(): Promise<void> {
    this.reportProgress('Loading Bible data...');
    
    const bibleDataPath = join(process.cwd(), 'data', 'bible');
    const files = await fs.readdir(bibleDataPath);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'index.json');
    
    this.totalVerses = 0;
    let batchVerses: BibleVerse[] = [];

    for (const file of jsonFiles) {
      if (file === 'index.json') continue;
      
      const filePath = join(bibleDataPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const chapterData = JSON.parse(content);
      
      if (chapterData.verses && Array.isArray(chapterData.verses)) {
        for (const verseData of chapterData.verses) {
          const verse: BibleVerse = {
            book: chapterData.book,
            chapter: chapterData.chapter,
            verse: verseData.verse,
            text: verseData.text,
            id: `${chapterData.book.toLowerCase().replace(/\s+/g, '-')}-${chapterData.chapter}-${verseData.verse}`,
          };
          
          batchVerses.push(verse);
          this.totalVerses++;
          
          // Process in batches to manage memory
          if (batchVerses.length >= MEMORY_CONFIG.batchSize) {
            await this.processBatch(batchVerses);
            batchVerses = [];
            await this.checkMemoryUsage();
          }
        }
      }
    }
    
    // Process remaining verses
    if (batchVerses.length > 0) {
      await this.processBatch(batchVerses);
    }
    
    console.log(`📖 Loaded ${this.totalVerses} verses from ${jsonFiles.length} chapters`);
  }

  private async processBatch(verses: BibleVerse[]): Promise<void> {
    for (const verse of verses) {
      const searchableVerse = await this.preprocessVerse(verse);
      this.verseIndex.set(verse.id, searchableVerse);
      
      // Update book index
      if (!this.bookIndex.has(verse.book)) {
        this.bookIndex.set(verse.book, []);
      }
      this.bookIndex.get(verse.book)!.push(verse.id);
      
      this.processedVerses++;
      this.currentMemoryUsage += this.estimateVerseMemoryUsage(searchableVerse);
    }
    
    if (this.onProgress) {
      this.onProgress({
        processed: this.processedVerses,
        total: this.totalVerses,
        phase: 'preprocessing'
      });
    }
  }

  private async preprocessVerse(verse: BibleVerse): Promise<SearchableVerse> {
    // Normalize text for search
    const normalizedText = verse.text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Tokenize
    const tokens = normalizedText
      .split(' ')
      .filter(token => token.length > 1)
      .filter(token => !this.isStopWord(token));
    
    // Extract keywords using our taxonomy
    const keywords = this.extractKeywords(normalizedText, verse);
    
    return {
      ...verse,
      tokens,
      normalizedText,
      keywords,
    };
  }

  private extractKeywords(text: string, verse: BibleVerse): string[] {
    const keywords: string[] = [];
    
    // Check life situations
    for (const [situation, data] of Object.entries(BIBLE_TAXONOMY.lifeSituations)) {
      for (const keyword of data.keywords) {
        if (text.includes(keyword)) {
          keywords.push(situation);
          keywords.push(keyword);
        }
      }
    }
    
    // Check theological concepts
    for (const [concept, data] of Object.entries(BIBLE_TAXONOMY.theology)) {
      for (const keyword of data.keywords) {
        if (text.includes(keyword)) {
          keywords.push(concept);
          keywords.push(keyword);
        }
      }
    }
    
    // Check character traits
    if (BIBLE_TAXONOMY.character) {
      for (const [trait, data] of Object.entries(BIBLE_TAXONOMY.character)) {
        for (const keyword of data.keywords) {
          if (text.includes(keyword)) {
            keywords.push(trait);
            keywords.push(keyword);
          }
        }
      }
    }
    
    // Add book-specific keywords
    const bookKey = verse.book.toLowerCase().replace(/\s+/g, '-').replace(/^\d-/, '');
    const bookData = BIBLE_TAXONOMY.bookMetadata?.[bookKey as keyof typeof BIBLE_TAXONOMY.bookMetadata];
    if (bookData) {
      keywords.push(...bookData.themes);
    }
    
    return [...new Set(keywords)];
  }

  private async buildInvertedIndex(): Promise<void> {
    this.reportProgress('Building inverted index...');
    
    let processed = 0;
    
    for (const [verseId, verse] of this.verseIndex) {
      // Index all tokens with positions
      verse.tokens.forEach((token, position) => {
        if (!this.invertedIndex[token]) {
          this.invertedIndex[token] = {
            verseIds: [],
            positions: [],
            frequency: 0,
          };
        }
        
        const entry = this.invertedIndex[token];
        
        // Add verse ID if not already present
        if (!entry.verseIds.includes(verseId)) {
          entry.verseIds.push(verseId);
        }
        
        // Add position information
        let positionEntry = entry.positions.find(p => p.verseId === verseId);
        if (!positionEntry) {
          positionEntry = { verseId, positions: [] };
          entry.positions.push(positionEntry);
        }
        positionEntry.positions.push(position);
        
        entry.frequency++;
      });
      
      // Index keywords
      verse.keywords.forEach(keyword => {
        if (!this.invertedIndex[keyword]) {
          this.invertedIndex[keyword] = {
            verseIds: [],
            positions: [],
            frequency: 0,
          };
        }
        
        const entry = this.invertedIndex[keyword];
        if (!entry.verseIds.includes(verseId)) {
          entry.verseIds.push(verseId);
          entry.frequency++;
        }
      });
      
      processed++;
      if (processed % 1000 === 0) {
        await this.checkMemoryUsage();
        if (this.onProgress) {
          this.onProgress({
            processed,
            total: this.totalVerses,
            phase: 'inverted-index'
          });
        }
      }
    }
    
    console.log(`🔍 Built inverted index with ${Object.keys(this.invertedIndex).length} terms`);
  }

  private async buildTrieIndex(): Promise<void> {
    this.reportProgress('Building trie index for autocomplete...');
    
    // Build trie from all searchable terms
    const allTerms = new Set<string>();
    
    // Add book names and variants
    if (BIBLE_TAXONOMY.bookMetadata) {
      for (const book of Object.keys(BIBLE_TAXONOMY.bookMetadata)) {
        allTerms.add(book);
        allTerms.add(book.replace(/-/g, ' '));
      }
    }
    
    // Add life situations and their keywords
    for (const [situation, data] of Object.entries(BIBLE_TAXONOMY.lifeSituations)) {
      allTerms.add(situation);
      data.keywords.forEach(keyword => allTerms.add(keyword));
      data.commonSearches.forEach(search => allTerms.add(search));
    }
    
    // Add theological concepts
    for (const [concept, data] of Object.entries(BIBLE_TAXONOMY.theology)) {
      allTerms.add(concept);
      data.keywords.forEach(keyword => allTerms.add(keyword));
    }
    
    // Add character traits
    if (BIBLE_TAXONOMY.character) {
      for (const [trait, data] of Object.entries(BIBLE_TAXONOMY.character)) {
        allTerms.add(trait);
        data.keywords.forEach(keyword => allTerms.add(keyword));
      }
    }
    
    // Add common typos and their corrections (if available)
    if ('typoCorrections' in BIBLE_TAXONOMY && (BIBLE_TAXONOMY as any).typoCorrections) {
      for (const [typo, correction] of Object.entries((BIBLE_TAXONOMY as any).typoCorrections)) {
        allTerms.add(typo);
        allTerms.add(correction as string);
      }
    }
    
    // Build trie with frequency-based suggestions
    let processed = 0;
    for (const term of allTerms) {
      this.insertIntoTrie(term);
      processed++;
      
      if (processed % 100 === 0 && this.onProgress) {
        this.onProgress({
          processed,
          total: allTerms.size,
          phase: 'trie-index'
        });
      }
    }
    
    console.log(`🌳 Built trie index with ${allTerms.size} terms`);
  }

  private async buildSemanticIndex(): Promise<void> {
    this.reportProgress('Building semantic relationships...');
    
    // Map concepts to verse IDs using our taxonomy
    for (const [situation, data] of Object.entries(BIBLE_TAXONOMY.lifeSituations)) {
      this.semanticIndex.concepts.set(situation, []);
      
      // Find verses that match this life situation
      for (const [verseId, verse] of this.verseIndex) {
        if (verse.keywords.includes(situation)) {
          this.semanticIndex.concepts.get(situation)!.push(verseId);
        }
      }
    }
    
    // Build simple semantic vectors (TF-IDF like)
    let processed = 0;
    for (const [verseId, verse] of this.verseIndex) {
      const vector = this.createSemanticVector(verse);
      this.semanticIndex.embeddings.set(verseId, vector);
      
      processed++;
      if (processed % 500 === 0) {
        await this.checkMemoryUsage();
        if (this.onProgress) {
          this.onProgress({
            processed,
            total: this.totalVerses,
            phase: 'semantic-vectors'
          });
        }
      }
    }
    
    console.log(`🧠 Built semantic index with ${this.semanticIndex.embeddings.size} vectors`);
  }

  private createSemanticVector(verse: SearchableVerse): number[] {
    // Create a simple feature vector based on our taxonomy
    const features = new Array(100).fill(0);
    
    // Life situation features (0-19)
    Object.keys(BIBLE_TAXONOMY.lifeSituations).forEach((situation, index) => {
      if (verse.keywords.includes(situation)) {
        features[index] = 1;
      }
    });
    
    // Theological concept features (20-29)
    Object.keys(BIBLE_TAXONOMY.theology).forEach((concept, index) => {
      if (verse.keywords.includes(concept)) {
        features[20 + index] = 1;
      }
    });
    
    // Character trait features (30-41)
    if (BIBLE_TAXONOMY.character) {
      Object.keys(BIBLE_TAXONOMY.character).forEach((trait, index) => {
        if (verse.keywords.includes(trait) && index < 12) {
          features[30 + index] = 1;
        }
      });
    }
    
    // Text length and complexity features (42-49)
    features[42] = Math.min(verse.text.length / 200, 1); // Normalized length
    features[43] = verse.tokens.length / 50; // Token count
    features[44] = verse.keywords.length / 10; // Keyword density
    
    // Book type features (50-99)
    const bookKey = verse.book.toLowerCase().replace(/\s+/g, '-').replace(/^\d-/, '');
    const bookData = BIBLE_TAXONOMY.bookMetadata?.[bookKey as keyof typeof BIBLE_TAXONOMY.bookMetadata];
    if (bookData) {
      switch (bookData.genre) {
        case 'law': features[50] = 1; break;
        case 'history': features[51] = 1; break;
        case 'wisdom': features[52] = 1; break;
        case 'prophecy': features[53] = 1; break;
        case 'gospel': features[54] = 1; break;
        case 'epistle': features[55] = 1; break;
        case 'apocalyptic': features[56] = 1; break;
      }
    }
    
    return features;
  }

  private async buildConceptIndex(): Promise<void> {
    this.reportProgress('Building concept mappings...');
    
    // Map each concept from our taxonomy to relevant verses
    for (const [situation, data] of Object.entries(BIBLE_TAXONOMY.lifeSituations)) {
      const relatedVerses: string[] = [];
      
      // Direct verse mappings from taxonomy
      data.relatedVerses.forEach(verseId => {
        if (this.verseIndex.has(verseId)) {
          relatedVerses.push(verseId);
        }
      });
      
      // Find additional verses by keyword matching
      for (const [verseId, verse] of this.verseIndex) {
        if (verse.keywords.includes(situation)) {
          if (!relatedVerses.includes(verseId)) {
            relatedVerses.push(verseId);
          }
        }
      }
      
      this.conceptIndex.set(situation, relatedVerses);
    }
    
    // Add theological concepts
    for (const [concept, data] of Object.entries(BIBLE_TAXONOMY.theology)) {
      const relatedVerses: string[] = [];
      
      data.relatedVerses.forEach(verseId => {
        if (this.verseIndex.has(verseId)) {
          relatedVerses.push(verseId);
        }
      });
      
      for (const [verseId, verse] of this.verseIndex) {
        if (verse.keywords.includes(concept)) {
          if (!relatedVerses.includes(verseId)) {
            relatedVerses.push(verseId);
          }
        }
      }
      
      this.conceptIndex.set(concept, relatedVerses);
    }
    
    console.log(`🗺️ Built concept index with ${this.conceptIndex.size} mappings`);
  }

  private async optimizeIndexes(): Promise<void> {
    this.reportProgress('Optimizing indexes...');
    
    // Sort inverted index entries by frequency (most common first)
    for (const term in this.invertedIndex) {
      const entry = this.invertedIndex[term];
      entry.verseIds.sort();
      entry.positions.sort((a, b) => a.verseId.localeCompare(b.verseId));
    }
    
    // Prune trie suggestions to top 10 for each node
    this.pruneTrieSuggestions(this.trieRoot);
    
    // Force garbage collection if possible
    if (global.gc) {
      global.gc();
    }
    
    console.log('🎯 Index optimization complete');
  }

  // Utility methods
  private createTrieNode(): TrieNode {
    return {
      children: new Map(),
      isEndOfWord: false,
      suggestions: [],
      frequency: 0,
    };
  }

  private insertIntoTrie(word: string): void {
    let current = this.trieRoot;
    
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, this.createTrieNode());
      }
      current = current.children.get(char)!;
    }
    
    current.isEndOfWord = true;
    current.frequency++;
    
    // Update suggestions along the path
    let node = this.trieRoot;
    for (const char of word.toLowerCase()) {
      node = node.children.get(char)!;
      if (!node.suggestions.includes(word)) {
        node.suggestions.push(word);
        node.suggestions.sort((a, b) => {
          const aFreq = this.getWordFrequency(a);
          const bFreq = this.getWordFrequency(b);
          return bFreq - aFreq;
        });
      }
    }
  }

  private getWordFrequency(word: string): number {
    return this.invertedIndex[word]?.frequency || 0;
  }

  private pruneTrieSuggestions(node: TrieNode): void {
    // Keep only top 10 suggestions
    node.suggestions = node.suggestions.slice(0, 10);
    
    // Recursively prune children
    for (const child of node.children.values()) {
      this.pruneTrieSuggestions(child);
    }
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their'
    ]);
    return stopWords.has(word.toLowerCase());
  }

  private estimateVerseMemoryUsage(verse: SearchableVerse): number {
    // Rough estimate of memory usage for a verse
    return (
      verse.text.length * 2 + // text (UTF-16)
      verse.tokens.length * 10 + // tokens (average 10 chars each)
      verse.keywords.length * 15 + // keywords (average 15 chars each)
      100 // overhead for object properties
    );
  }

  private async checkMemoryUsage(): Promise<void> {
    if (this.currentMemoryUsage > MEMORY_CONFIG.gcThreshold * 1024 * 1024) {
      if (global.gc) {
        global.gc();
        console.log(`🧹 Garbage collection triggered at ${Math.round(this.currentMemoryUsage / 1024 / 1024)}MB`);
      }
    }
    
    if (this.currentMemoryUsage > MEMORY_CONFIG.maxMemoryMB * 1024 * 1024) {
      console.warn(`⚠️ Memory usage (${Math.round(this.currentMemoryUsage / 1024 / 1024)}MB) exceeds limit (${MEMORY_CONFIG.maxMemoryMB}MB)`);
    }
  }

  private reportProgress(phase: string): void {
    console.log(`📍 ${phase}`);
  }
}

// CLI interface
async function main() {
  const builder = new EfficientIndexBuilder((progress) => {
    const percent = Math.round((progress.processed / progress.total) * 100);
    console.log(`  📊 ${progress.phase}: ${progress.processed}/${progress.total} (${percent}%)`);
  });

  try {
    const index = await builder.buildCompleteIndex();
    
    // Save the complete index to disk
    const indexPath = join(process.cwd(), 'data', 'search-indexes.json');
    await fs.writeFile(indexPath, JSON.stringify({
      metadata: index.metadata,
      invertedIndex: index.invertedIndex,
      // Convert Maps to objects for JSON serialization
      verseIndex: Object.fromEntries(index.verseIndex),
      bookIndex: Object.fromEntries(index.bookIndex),
      conceptIndex: Object.fromEntries(index.conceptIndex),
      semanticIndex: {
        concepts: Object.fromEntries(index.semanticIndex.concepts),
        embeddings: Object.fromEntries(index.semanticIndex.embeddings),
        similarities: Object.fromEntries(index.semanticIndex.similarities),
      },
    }, null, 2));
    
    // Save trie separately (it's large)
    const triePath = join(process.cwd(), 'data', 'trie-index.json');
    await fs.writeFile(triePath, JSON.stringify(index.trieIndex, null, 2));
    
    console.log('✅ Search indexes saved successfully!');
    console.log(`📍 Index file: ${indexPath}`);
    console.log(`📍 Trie file: ${triePath}`);
    
  } catch (error) {
    console.error('❌ Failed to build search indexes:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}