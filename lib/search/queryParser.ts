'use client';

import { BIBLE_TAXONOMY } from '@/data/bible-taxonomy';

// Query types for different search intents
export type QueryType = 
  | 'verse-lookup'     // "John 3:16", "Romans 8:28"
  | 'topic-search'     // "love", "fear", "hope"
  | 'life-situation'   // "anxiety", "depression", "marriage"
  | 'text-search'      // "for God so loved", "cast your cares"
  | 'speaker-search'   // "Jesus said", "Paul wrote"
  | 'question'         // "What does the Bible say about love?"
  | 'emotion'          // "I am sad", "I feel anxious"
  | 'compound'         // "love AND forgiveness", "John AND love"
  | 'fuzzy';           // Unclear intent, needs suggestion

export interface ParsedQuery {
  originalQuery: string;
  normalizedQuery: string;
  queryType: QueryType;
  confidence: number; // 0-1, how confident we are in the parsing
  
  // Extracted components
  verseReferences?: VerseReference[];
  keywords: string[];
  topics: string[];
  lifeSituations: string[];
  speakers?: string[];
  
  // Query modifiers
  operators: QueryOperator[];
  filters: QueryFilter[];
  
  // Corrections and suggestions
  typoCorrections: TypoCorrection[];
  suggestions: string[];
  
  // Semantic understanding
  intent: QueryIntent;
  context: QueryContext;
}

export interface VerseReference {
  book: string;
  chapter?: number;
  verse?: number;
  endVerse?: number;
  raw: string;
  normalized: string;
}

export interface QueryOperator {
  type: 'AND' | 'OR' | 'NOT' | 'NEAR' | 'PHRASE';
  terms: string[];
  distance?: number; // For NEAR operator
}

export interface QueryFilter {
  type: 'book' | 'testament' | 'genre' | 'speaker' | 'theme';
  value: string;
  exclude?: boolean;
}

export interface TypoCorrection {
  original: string;
  suggestion: string;
  confidence: number;
}

export interface QueryIntent {
  primary: 'find' | 'learn' | 'comfort' | 'guidance' | 'inspiration';
  secondary?: string;
  emotional_state?: 'positive' | 'negative' | 'neutral' | 'seeking';
}

export interface QueryContext {
  complexity: 'simple' | 'moderate' | 'complex';
  ambiguity: number; // 0-1, how ambiguous the query is
  specificity: number; // 0-1, how specific the query is
}

export class IntelligentQueryParser {
  private static instance: IntelligentQueryParser;
  
  // Levenshtein distance cache for typo detection
  private distanceCache = new Map<string, number>();
  
  // Common Bible book abbreviations
  private bookAbbreviations: Map<string, string> = new Map();
  
  // Regex patterns for different query types
  private patterns = {
    verseReference: /(\d?\s*)?([A-Za-z]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/g,
    bookRange: /([A-Za-z]+)\s+(\d+)-(\d+)/g,
    quotedPhrase: /"([^"]+)"/g,
    nearOperator: /(\w+)\s+NEAR\/(\d+)\s+(\w+)/gi,
    notOperator: /NOT\s+(\w+)/gi,
    andOperator: /(\w+)\s+AND\s+(\w+)/gi,
    orOperator: /(\w+)\s+OR\s+(\w+)/gi,
    topicQuery: /^(verses?\s+)?(about|on|regarding|for)\s+(.+)/i,
    questionQuery: /^(what|how|when|where|why|who)\s+/i,
    speakerQuery: /(jesus|christ|god|lord|paul|david|moses|peter|john)\s+(said|says|spoke|tells|commands)/i,
    emotionQuery: /^(i\s+am|i\s+feel|feeling|when\s+i)\s+/i,
    situationQuery: /^(help\s+with|dealing\s+with|struggling\s+with|going\s+through)\s+/i,
  };
  
  public static getInstance(): IntelligentQueryParser {
    if (!IntelligentQueryParser.instance) {
      IntelligentQueryParser.instance = new IntelligentQueryParser();
    }
    return IntelligentQueryParser.instance;
  }
  
  constructor() {
    this.initializeBookAbbreviations();
  }
  
  private initializeBookAbbreviations(): void {
    this.bookAbbreviations = new Map([
      // Old Testament
      ['gen', 'genesis'], ['ge', 'genesis'], ['gn', 'genesis'],
      ['exo', 'exodus'], ['ex', 'exodus'], ['exod', 'exodus'],
      ['lev', 'leviticus'], ['le', 'leviticus'], ['lv', 'leviticus'],
      ['num', 'numbers'], ['nu', 'numbers'], ['nb', 'numbers'],
      ['deu', 'deuteronomy'], ['dt', 'deuteronomy'], ['deut', 'deuteronomy'],
      ['jos', 'joshua'], ['josh', 'joshua'], ['jsh', 'joshua'],
      ['jdg', 'judges'], ['jg', 'judges'], ['jdgs', 'judges'],
      ['rut', 'ruth'], ['ru', 'ruth'], ['rth', 'ruth'],
      ['1sa', '1-samuel'], ['1sam', '1-samuel'], ['1s', '1-samuel'],
      ['2sa', '2-samuel'], ['2sam', '2-samuel'], ['2s', '2-samuel'],
      ['1ki', '1-kings'], ['1kgs', '1-kings'], ['1k', '1-kings'],
      ['2ki', '2-kings'], ['2kgs', '2-kings'], ['2k', '2-kings'],
      ['1ch', '1-chronicles'], ['1chr', '1-chronicles'], ['1c', '1-chronicles'],
      ['2ch', '2-chronicles'], ['2chr', '2-chronicles'], ['2c', '2-chronicles'],
      ['ezr', 'ezra'], ['ez', 'ezra'], ['ezra', 'ezra'],
      ['neh', 'nehemiah'], ['ne', 'nehemiah'], ['nhem', 'nehemiah'],
      ['est', 'esther'], ['es', 'esther'], ['esth', 'esther'],
      ['job', 'job'], ['jb', 'job'],
      ['psa', 'psalms'], ['ps', 'psalms'], ['psalm', 'psalms'], ['pss', 'psalms'],
      ['pro', 'proverbs'], ['pr', 'proverbs'], ['prov', 'proverbs'], ['prv', 'proverbs'],
      ['ecc', 'ecclesiastes'], ['ec', 'ecclesiastes'], ['eccl', 'ecclesiastes'],
      ['sng', 'song-of-solomon'], ['ss', 'song-of-solomon'], ['sos', 'song-of-solomon'], ['song', 'song-of-solomon'],
      ['isa', 'isaiah'], ['is', 'isaiah'], ['isai', 'isaiah'],
      ['jer', 'jeremiah'], ['je', 'jeremiah'], ['jere', 'jeremiah'],
      ['lam', 'lamentations'], ['la', 'lamentations'], ['lament', 'lamentations'],
      ['eze', 'ezekiel'], ['ezk', 'ezekiel'], ['ezek', 'ezekiel'],
      ['dan', 'daniel'], ['da', 'daniel'], ['dn', 'daniel'],
      ['hos', 'hosea'], ['ho', 'hosea'], ['hose', 'hosea'],
      ['joe', 'joel'], ['jl', 'joel'], ['joel', 'joel'],
      ['amo', 'amos'], ['am', 'amos'], ['amos', 'amos'],
      ['oba', 'obadiah'], ['ob', 'obadiah'], ['obad', 'obadiah'],
      ['jon', 'jonah'], ['jnh', 'jonah'], ['jonah', 'jonah'],
      ['mic', 'micah'], ['mi', 'micah'], ['mica', 'micah'],
      ['nah', 'nahum'], ['na', 'nahum'], ['nahum', 'nahum'],
      ['hab', 'habakkuk'], ['hb', 'habakkuk'], ['habak', 'habakkuk'],
      ['zep', 'zephaniah'], ['zp', 'zephaniah'], ['zeph', 'zephaniah'],
      ['hag', 'haggai'], ['hg', 'haggai'], ['hagg', 'haggai'],
      ['zec', 'zechariah'], ['zc', 'zechariah'], ['zech', 'zechariah'],
      ['mal', 'malachi'], ['ml', 'malachi'], ['mala', 'malachi'],
      
      // New Testament
      ['mat', 'matthew'], ['mt', 'matthew'], ['matt', 'matthew'],
      ['mar', 'mark'], ['mk', 'mark'], ['mark', 'mark'],
      ['luk', 'luke'], ['lk', 'luke'], ['luke', 'luke'],
      ['joh', 'john'], ['jn', 'john'], ['john', 'john'],
      ['act', 'acts'], ['ac', 'acts'], ['acts', 'acts'],
      ['rom', 'romans'], ['ro', 'romans'], ['roman', 'romans'],
      ['1co', '1-corinthians'], ['1cor', '1-corinthians'], ['1c', '1-corinthians'],
      ['2co', '2-corinthians'], ['2cor', '2-corinthians'], ['2c', '2-corinthians'],
      ['gal', 'galatians'], ['ga', 'galatians'], ['galat', 'galatians'],
      ['eph', 'ephesians'], ['ep', 'ephesians'], ['ephes', 'ephesians'],
      ['phi', 'philippians'], ['ph', 'philippians'], ['phil', 'philippians'], ['php', 'philippians'],
      ['col', 'colossians'], ['co', 'colossians'], ['colos', 'colossians'],
      ['1th', '1-thessalonians'], ['1thes', '1-thessalonians'], ['1t', '1-thessalonians'],
      ['2th', '2-thessalonians'], ['2thes', '2-thessalonians'], ['2t', '2-thessalonians'],
      ['1ti', '1-timothy'], ['1tim', '1-timothy'], ['1tm', '1-timothy'],
      ['2ti', '2-timothy'], ['2tim', '2-timothy'], ['2tm', '2-timothy'],
      ['tit', 'titus'], ['ti', 'titus'], ['titus', 'titus'],
      ['phm', 'philemon'], ['pm', 'philemon'], ['philem', 'philemon'],
      ['heb', 'hebrews'], ['he', 'hebrews'], ['hebrew', 'hebrews'],
      ['jas', 'james'], ['jm', 'james'], ['james', 'james'],
      ['1pe', '1-peter'], ['1pet', '1-peter'], ['1p', '1-peter'],
      ['2pe', '2-peter'], ['2pet', '2-peter'], ['2p', '2-peter'],
      ['1jo', '1-john'], ['1jn', '1-john'], ['1john', '1-john'],
      ['2jo', '2-john'], ['2jn', '2-john'], ['2john', '2-john'],
      ['3jo', '3-john'], ['3jn', '3-john'], ['3john', '3-john'],
      ['jud', 'jude'], ['jd', 'jude'], ['jude', 'jude'],
      ['rev', 'revelation'], ['re', 'revelation'], ['revel', 'revelation'], ['rv', 'revelation'],
    ]);
  }
  
  public parseQuery(query: string): ParsedQuery {
    const startTime = performance.now();
    
    // Initial normalization
    const originalQuery = query.trim();
    const normalizedQuery = this.normalizeQuery(originalQuery);
    
    // Initialize result
    const result: ParsedQuery = {
      originalQuery,
      normalizedQuery,
      queryType: 'fuzzy',
      confidence: 0,
      keywords: [],
      topics: [],
      lifeSituations: [],
      operators: [],
      filters: [],
      typoCorrections: [],
      suggestions: [],
      intent: {
        primary: 'find',
        emotional_state: 'neutral'
      },
      context: {
        complexity: 'simple',
        ambiguity: 0.5,
        specificity: 0.5
      }
    };
    
    // Parse different query types in order of specificity
    this.detectVerseReferences(normalizedQuery, result);
    this.detectSpeakerQueries(normalizedQuery, result);
    this.detectQuestionQueries(normalizedQuery, result);
    this.detectEmotionQueries(normalizedQuery, result);
    this.detectSituationQueries(normalizedQuery, result);
    this.detectTopicQueries(normalizedQuery, result);
    this.detectTextSearch(normalizedQuery, result);
    this.detectOperators(normalizedQuery, result);
    
    // Post-processing
    this.performTypoCorrection(result);
    this.extractKeywords(result);
    this.mapToLifeSituations(result);
    this.determineIntent(result);
    this.calculateConfidence(result);
    this.generateSuggestions(result);
    
    // Performance logging
    const parseTime = performance.now() - startTime;
    if (parseTime > 10) {
      console.warn(`Slow query parsing: ${parseTime.toFixed(2)}ms for "${originalQuery}"`);
    }
    
    return result;
  }
  
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[""'']/g, '"')  // Normalize quotes
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .replace(/[^\w\s"':,-]/g, ' ') // Remove special chars except important ones
      .trim();
  }
  
  private detectVerseReferences(query: string, result: ParsedQuery): void {
    const references: VerseReference[] = [];
    let match;
    
    this.patterns.verseReference.lastIndex = 0;
    while ((match = this.patterns.verseReference.exec(query)) !== null) {
      const [fullMatch, prefix, book, chapter, verse, endVerse] = match;
      
      const normalizedBook = this.normalizeBookName(book);
      if (normalizedBook) {
        references.push({
          book: normalizedBook,
          chapter: parseInt(chapter),
          verse: verse ? parseInt(verse) : undefined,
          endVerse: endVerse ? parseInt(endVerse) : undefined,
          raw: fullMatch,
          normalized: `${normalizedBook}-${chapter}${verse ? `-${verse}` : ''}${endVerse ? `-${endVerse}` : ''}`
        });
      }
    }
    
    if (references.length > 0) {
      result.verseReferences = references;
      result.queryType = 'verse-lookup';
      result.confidence = 0.9;
    }
  }
  
  private detectSpeakerQueries(query: string, result: ParsedQuery): void {
    const match = this.patterns.speakerQuery.exec(query);
    if (match) {
      const speaker = match[1].toLowerCase();
      const verb = match[2].toLowerCase();
      
      result.speakers = [speaker];
      result.queryType = 'speaker-search';
      result.confidence = 0.8;
      result.intent.primary = 'learn';
      
      // Add speaker as a filter
      result.filters.push({
        type: 'speaker',
        value: speaker
      });
    }
  }
  
  private detectQuestionQueries(query: string, result: ParsedQuery): void {
    if (this.patterns.questionQuery.test(query)) {
      result.queryType = 'question';
      result.confidence = 0.7;
      result.intent.primary = 'learn';
      result.context.complexity = 'moderate';
      
      // Extract topic from question
      const topicMatch = this.patterns.topicQuery.exec(query);
      if (topicMatch) {
        const topic = topicMatch[3];
        result.topics.push(topic);
      }
    }
  }
  
  private detectEmotionQueries(query: string, result: ParsedQuery): void {
    if (this.patterns.emotionQuery.test(query)) {
      result.queryType = 'emotion';
      result.confidence = 0.85;
      result.intent.primary = 'comfort';
      result.intent.emotional_state = 'seeking';
      result.context.specificity = 0.8;
    }
  }
  
  private detectSituationQueries(query: string, result: ParsedQuery): void {
    if (this.patterns.situationQuery.test(query)) {
      result.queryType = 'life-situation';
      result.confidence = 0.85;
      result.intent.primary = 'guidance';
      result.intent.emotional_state = 'seeking';
    }
  }
  
  private detectTopicQueries(query: string, result: ParsedQuery): void {
    const topicMatch = this.patterns.topicQuery.exec(query);
    if (topicMatch) {
      const topic = topicMatch[3];
      result.topics.push(topic);
      result.queryType = 'topic-search';
      if (result.confidence === 0) result.confidence = 0.7;
    }
  }
  
  private detectTextSearch(query: string, result: ParsedQuery): void {
    // Check for quoted phrases
    const phrases: string[] = [];
    let match;
    
    this.patterns.quotedPhrase.lastIndex = 0;
    while ((match = this.patterns.quotedPhrase.exec(query)) !== null) {
      phrases.push(match[1]);
    }
    
    if (phrases.length > 0) {
      result.operators.push({
        type: 'PHRASE',
        terms: phrases
      });
      result.queryType = 'text-search';
      if (result.confidence === 0) result.confidence = 0.8;
    }
    
    // If no specific type detected, default to text search
    if (result.queryType === 'fuzzy' && result.confidence === 0) {
      result.queryType = 'text-search';
      result.confidence = 0.5;
    }
  }
  
  private detectOperators(query: string, result: ParsedQuery): void {
    // AND operator
    let match = this.patterns.andOperator.exec(query);
    if (match) {
      result.operators.push({
        type: 'AND',
        terms: [match[1], match[2]]
      });
      result.queryType = 'compound';
    }
    
    // OR operator
    this.patterns.orOperator.lastIndex = 0;
    match = this.patterns.orOperator.exec(query);
    if (match) {
      result.operators.push({
        type: 'OR',
        terms: [match[1], match[2]]
      });
      result.queryType = 'compound';
    }
    
    // NOT operator
    this.patterns.notOperator.lastIndex = 0;
    while ((match = this.patterns.notOperator.exec(query)) !== null) {
      result.operators.push({
        type: 'NOT',
        terms: [match[1]]
      });
    }
    
    // NEAR operator
    this.patterns.nearOperator.lastIndex = 0;
    match = this.patterns.nearOperator.exec(query);
    if (match) {
      result.operators.push({
        type: 'NEAR',
        terms: [match[1], match[3]],
        distance: parseInt(match[2])
      });
    }
  }
  
  private performTypoCorrection(result: ParsedQuery): void {
    const words = result.normalizedQuery.split(' ');
    
    words.forEach(word => {
      if (word.length > 2) {
        const correction = this.findBestCorrection(word);
        if (correction && correction.confidence > 0.8) {
          result.typoCorrections.push(correction);
        }
      }
    });
  }
  
  private findBestCorrection(word: string): TypoCorrection | null {
    let bestMatch: TypoCorrection | null = null;
    let bestDistance = Infinity;
    
    // Check against book names
    if (BIBLE_TAXONOMY.bookMetadata) {
      for (const book of Object.keys(BIBLE_TAXONOMY.bookMetadata)) {
        const distance = this.levenshteinDistance(word, book);
        if (distance < bestDistance && distance <= 2) {
          bestDistance = distance;
          bestMatch = {
            original: word,
            suggestion: book,
            confidence: 1 - (distance / Math.max(word.length, book.length))
          };
        }
      }
    }
    
    // Check against life situations
    for (const situation of Object.keys(BIBLE_TAXONOMY.lifeSituations)) {
      const distance = this.levenshteinDistance(word, situation);
      if (distance < bestDistance && distance <= 2) {
        bestDistance = distance;
        bestMatch = {
          original: word,
          suggestion: situation,
          confidence: 1 - (distance / Math.max(word.length, situation.length))
        };
      }
    }
    
    // Check against theological concepts
    for (const concept of Object.keys(BIBLE_TAXONOMY.theology)) {
      const distance = this.levenshteinDistance(word, concept);
      if (distance < bestDistance && distance <= 2) {
        bestDistance = distance;
        bestMatch = {
          original: word,
          suggestion: concept,
          confidence: 1 - (distance / Math.max(word.length, concept.length))
        };
      }
    }
    
    return bestMatch;
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const cacheKey = `${str1}:${str2}`;
    if (this.distanceCache.has(cacheKey)) {
      return this.distanceCache.get(cacheKey)!;
    }
    
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
    
    const distance = matrix[str2.length][str1.length];
    this.distanceCache.set(cacheKey, distance);
    return distance;
  }
  
  private extractKeywords(result: ParsedQuery): void {
    const words = result.normalizedQuery
      .split(' ')
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
    
    // Apply typo corrections to keywords
    const correctedWords = words.map(word => {
      const correction = result.typoCorrections.find(c => c.original === word);
      return correction ? correction.suggestion : word;
    });
    
    result.keywords = [...new Set(correctedWords)];
  }
  
  private mapToLifeSituations(result: ParsedQuery): void {
    const allTerms = [
      ...result.keywords,
      ...result.topics,
      result.normalizedQuery
    ];
    
    for (const [situation, data] of Object.entries(BIBLE_TAXONOMY.lifeSituations)) {
      for (const term of allTerms) {
        if (data.keywords.some(keyword => term.includes(keyword)) ||
            data.commonSearches.some(search => term.includes(search))) {
          if (!result.lifeSituations.includes(situation)) {
            result.lifeSituations.push(situation);
          }
        }
      }
    }
  }
  
  private determineIntent(result: ParsedQuery): void {
    // Determine primary intent based on query type and content
    switch (result.queryType) {
      case 'verse-lookup':
        result.intent.primary = 'find';
        result.intent.emotional_state = 'neutral';
        break;
        
      case 'life-situation':
      case 'emotion':
        result.intent.primary = 'comfort';
        result.intent.emotional_state = 'seeking';
        break;
        
      case 'question':
        result.intent.primary = 'learn';
        result.intent.emotional_state = 'neutral';
        break;
        
      case 'topic-search':
        if (result.lifeSituations.length > 0) {
          result.intent.primary = 'guidance';
          result.intent.emotional_state = 'seeking';
        } else {
          result.intent.primary = 'learn';
          result.intent.emotional_state = 'neutral';
        }
        break;
        
      default:
        result.intent.primary = 'find';
        result.intent.emotional_state = 'neutral';
    }
    
    // Detect emotional indicators in the query
    const emotionalWords = {
      negative: ['sad', 'depressed', 'anxious', 'worried', 'afraid', 'lonely', 'angry', 'hurt', 'broken', 'lost'],
      positive: ['happy', 'joyful', 'grateful', 'blessed', 'hopeful', 'peaceful', 'loving'],
      seeking: ['help', 'need', 'struggling', 'dealing', 'going through', 'facing', 'overcome']
    };
    
    const queryLower = result.normalizedQuery.toLowerCase();
    
    if (emotionalWords.negative.some(word => queryLower.includes(word))) {
      result.intent.emotional_state = 'negative';
      result.intent.primary = 'comfort';
    } else if (emotionalWords.seeking.some(word => queryLower.includes(word))) {
      result.intent.emotional_state = 'seeking';
      result.intent.primary = 'guidance';
    } else if (emotionalWords.positive.some(word => queryLower.includes(word))) {
      result.intent.emotional_state = 'positive';
      result.intent.primary = 'inspiration';
    }
  }
  
  private calculateConfidence(result: ParsedQuery): void {
    let confidence = result.confidence;
    
    // Boost confidence for specific matches
    if (result.verseReferences && result.verseReferences.length > 0) {
      confidence = Math.max(confidence, 0.9);
    }
    
    if (result.lifeSituations.length > 0) {
      confidence = Math.max(confidence, 0.8);
    }
    
    if (result.typoCorrections.length > 0) {
      // Slightly reduce confidence for typos
      confidence = Math.max(0.1, confidence - (result.typoCorrections.length * 0.1));
    }
    
    // Factor in query complexity and specificity
    if (result.context.complexity === 'complex') {
      confidence = Math.max(0.1, confidence - 0.1);
    }
    
    if (result.context.specificity > 0.7) {
      confidence = Math.min(1, confidence + 0.1);
    }
    
    result.confidence = Math.round(confidence * 100) / 100;
  }
  
  private generateSuggestions(result: ParsedQuery): void {
    const suggestions: string[] = [];
    
    // Suggest corrections for typos
    result.typoCorrections.forEach(correction => {
      if (correction.confidence > 0.7) {
        const corrected = result.originalQuery.replace(correction.original, correction.suggestion);
        suggestions.push(corrected);
      }
    });
    
    // Suggest related life situations
    result.lifeSituations.forEach(situation => {
      const data = BIBLE_TAXONOMY.lifeSituations[situation];
      data.relatedTopics.forEach(topic => {
        if (!result.originalQuery.toLowerCase().includes(topic)) {
          suggestions.push(`${result.originalQuery} ${topic}`);
        }
      });
    });
    
    // Suggest more specific queries for fuzzy searches
    if (result.queryType === 'fuzzy' && result.confidence < 0.6) {
      suggestions.push(`"${result.originalQuery}"`); // Phrase search
      suggestions.push(`verses about ${result.originalQuery}`); // Topic search
      suggestions.push(`what does the bible say about ${result.originalQuery}`); // Question
    }
    
    result.suggestions = suggestions.slice(0, 5); // Limit to top 5
  }
  
  private normalizeBookName(bookName: string): string | null {
    const normalized = bookName.toLowerCase().replace(/\s+/g, '');
    
    // Check abbreviations first
    if (this.bookAbbreviations.has(normalized)) {
      return this.bookAbbreviations.get(normalized)!;
    }
    
    // Check full book names
    if (BIBLE_TAXONOMY.bookMetadata) {
      for (const book of Object.keys(BIBLE_TAXONOMY.bookMetadata)) {
        if (book.toLowerCase().replace(/\s+/g, '') === normalized) {
          return book;
        }
        
        // Check partial matches for longer book names
        if (book.toLowerCase().startsWith(normalized) && normalized.length >= 3) {
          return book;
        }
      }
    }
    
    return null;
  }
  
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their',
      'about', 'verses', 'verse', 'bible', 'scripture', 'what', 'does', 'say'
    ]);
    return stopWords.has(word.toLowerCase());
  }
  
  // Utility method for debugging and testing
  public analyzeQuery(query: string): {
    parsed: ParsedQuery;
    metrics: {
      parseTime: number;
      cacheHits: number;
      suggestionsGenerated: number;
    };
  } {
    const startTime = performance.now();
    const initialCacheSize = this.distanceCache.size;
    
    const parsed = this.parseQuery(query);
    
    const parseTime = performance.now() - startTime;
    const cacheHits = this.distanceCache.size - initialCacheSize;
    const suggestionsGenerated = parsed.suggestions.length;
    
    return {
      parsed,
      metrics: {
        parseTime: Math.round(parseTime * 100) / 100,
        cacheHits,
        suggestionsGenerated,
      }
    };
  }
}