import FlexSearch from 'flexsearch';
import bibleData from '@/lib/bible/kjv-bible-complete.json';
import { BookName, BOOKS } from '@/lib/bible/books';

export interface VerseSearchResult {
  book: BookName;
  chapter: number;
  verse: number;
  text: string;
  highlights?: string[];
}

// Create FlexSearch document index
const searchIndex = new (FlexSearch as any).Document({
  document: {
    id: 'id',
    index: ['text', 'book'],
    store: ['book', 'chapter', 'verse', 'text'],
  },
  tokenize: 'forward',
  resolution: 9,
  cache: true,
  context: {
    depth: 2,
    bidirectional: true,
    resolution: 9,
  },
});

let isIndexed = false;

// Index all Bible verses
export async function indexBibleVerses() {
  if (isIndexed) return;
  
  console.log('Indexing Bible verses...');
  const startTime = performance.now();
  
  let documentId = 0;
  
  for (const book of Object.keys(bibleData) as BookName[]) {
    const bookData = (bibleData as any)[book];
    if (!bookData) continue;
    
    for (const chapter of Object.keys(bookData)) {
      const chapterData = bookData[chapter];
      if (!chapterData || !Array.isArray(chapterData)) continue;
      
      for (const verse of chapterData) {
        searchIndex.add({
          id: documentId++,
          book,
          chapter: parseInt(chapter, 10),
          verse: verse.verse,
          text: verse.text,
        });
      }
    }
  }
  
  isIndexed = true;
  const endTime = performance.now();
  console.log(`Indexed ${documentId} verses in ${(endTime - startTime).toFixed(2)}ms`);
}

// Search function with highlighting
export async function searchVerses(
  query: string,
  options: {
    limit?: number;
    book?: BookName;
    chapter?: number;
    currentChapterOnly?: boolean;
  } = {}
): Promise<VerseSearchResult[]> {
  if (!isIndexed) {
    await indexBibleVerses();
  }
  
  const { limit = 10, book, chapter, currentChapterOnly = false } = options;
  
  if (!query.trim()) return [];
  
  // Search in the index
  const searchResults = searchIndex.search(query, {
    limit: currentChapterOnly ? 100 : limit * 2, // Get more results for filtering
    enrich: true,
  });
  
  // Flatten and process results
  const results: VerseSearchResult[] = [];
  
  for (const fieldResults of searchResults) {
    if (!fieldResults.result) continue;
    
    for (const result of fieldResults.result) {
      const doc = result.doc;
      
      // Filter by book/chapter if specified
      if (currentChapterOnly && book && chapter) {
        if (doc.book !== book || doc.chapter !== chapter) continue;
      } else if (book && doc.book !== book) {
        continue;
      }
      
      // Create result with highlighting
      const verseResult: VerseSearchResult = {
        book: doc.book,
        chapter: doc.chapter,
        verse: doc.verse,
        text: doc.text,
        highlights: getHighlightedTerms(doc.text, query),
      };
      
      // Check if we already have this verse
      const isDuplicate = results.some(
        r => r.book === doc.book && 
             r.chapter === doc.chapter && 
             r.verse === doc.verse
      );
      
      if (!isDuplicate) {
        results.push(verseResult);
      }
      
      if (results.length >= limit) break;
    }
    
    if (results.length >= limit) break;
  }
  
  return results;
}

// Get highlighted terms for display
function getHighlightedTerms(text: string, query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/);
  const highlights: string[] = [];
  
  for (const term of terms) {
    if (term.length < 2) continue;
    
    const regex = new RegExp(`\\b${escapeRegex(term)}\\w*`, 'gi');
    const matches = text.match(regex);
    
    if (matches) {
      highlights.push(...matches);
    }
  }
  
  return [...new Set(highlights)]; // Remove duplicates
}

// Escape regex special characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Auto-complete suggestions
export async function getAutocompleteSuggestions(
  query: string,
  limit: number = 5
): Promise<string[]> {
  if (!query.trim()) return [];
  
  const suggestions: string[] = [];
  
  // Check for book name matches
  const lowerQuery = query.toLowerCase();
  for (const book of BOOKS) {
    if (book.toLowerCase().startsWith(lowerQuery)) {
      suggestions.push(book);
      if (suggestions.length >= limit) break;
    }
  }
  
  // Add common references
  const commonRefs = [
    'John 3:16',
    'Genesis 1:1',
    'Psalm 23',
    'Romans 8:28',
    'Jeremiah 29:11',
    'Philippians 4:13',
    'Proverbs 3:5-6',
    'Isaiah 40:31',
    'Matthew 6:33',
    '1 Corinthians 13',
  ];
  
  for (const ref of commonRefs) {
    if (ref.toLowerCase().includes(lowerQuery)) {
      suggestions.push(ref);
      if (suggestions.length >= limit) break;
    }
  }
  
  return suggestions.slice(0, limit);
}

// Highlight text with search terms
export function highlightSearchTerms(
  text: string,
  searchTerms: string[]
): string {
  if (!searchTerms || searchTerms.length === 0) return text;
  
  let highlightedText = text;
  
  for (const term of searchTerms) {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    highlightedText = highlightedText.replace(
      regex,
      '<mark class="bg-water-200 dark:bg-water-700 text-water-900 dark:text-water-100 px-0.5 rounded">$1</mark>'
    );
  }
  
  return highlightedText;
}