import fs from 'fs/promises';
import path from 'path';

export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface Chapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

// Popular verses for SEO pre-generation
export const POPULAR_VERSES: Array<{book: string; chapter: number; verse: number; title: string; theme: string}> = [
  { book: 'john', chapter: 3, verse: 16, title: 'God\'s Love for the World', theme: 'love' },
  { book: 'romans', chapter: 8, verse: 28, title: 'All Things Work Together for Good', theme: 'hope' },
  { book: 'philippians', chapter: 4, verse: 13, title: 'I Can Do All Things Through Christ', theme: 'strength' },
  { book: 'jeremiah', chapter: 29, verse: 11, title: 'Plans to Prosper You', theme: 'hope' },
  { book: 'psalm', chapter: 23, verse: 1, title: 'The Lord is My Shepherd', theme: 'comfort' },
  { book: 'isaiah', chapter: 41, verse: 10, title: 'Fear Not, I Am With You', theme: 'comfort' },
  { book: 'matthew', chapter: 28, verse: 20, title: 'I Am With You Always', theme: 'presence' },
  { book: 'joshua', chapter: 1, verse: 9, title: 'Be Strong and Courageous', theme: 'courage' },
  { book: 'romans', chapter: 5, verse: 8, title: 'God Demonstrates His Love', theme: 'love' },
  { book: '1-peter', chapter: 5, verse: 7, title: 'Cast Your Anxieties on Him', theme: 'peace' },
  { book: 'proverbs', chapter: 3, verse: 5, title: 'Trust in the Lord', theme: 'trust' },
  { book: 'psalm', chapter: 46, verse: 10, title: 'Be Still and Know', theme: 'peace' },
  { book: 'matthew', chapter: 11, verse: 28, title: 'Come to Me All Who Labor', theme: 'rest' },
  { book: '2-timothy', chapter: 1, verse: 7, title: 'Spirit of Power, Love and Sound Mind', theme: 'strength' },
  { book: 'romans', chapter: 10, verse: 9, title: 'Confess with Your Mouth', theme: 'salvation' },
  { book: 'ephesians', chapter: 2, verse: 8, title: 'Saved by Grace Through Faith', theme: 'salvation' },
  { book: 'psalm', chapter: 139, verse: 14, title: 'Fearfully and Wonderfully Made', theme: 'identity' },
  { book: '1-john', chapter: 4, verse: 19, title: 'We Love Because He First Loved', theme: 'love' },
  { book: 'galatians', chapter: 2, verse: 20, title: 'Crucified with Christ', theme: 'identity' },
  { book: 'hebrews', chapter: 11, verse: 1, title: 'Faith is Confidence', theme: 'faith' },
  { book: 'romans', chapter: 12, verse: 2, title: 'Be Transformed', theme: 'transformation' },
  { book: 'philippians', chapter: 4, verse: 6, title: 'Do Not Be Anxious', theme: 'peace' },
  { book: 'colossians', chapter: 3, verse: 23, title: 'Work as for the Lord', theme: 'work' },
  { book: '1-corinthians', chapter: 13, verse: 4, title: 'Love is Patient and Kind', theme: 'love' },
  { book: 'psalm', chapter: 119, verse: 105, title: 'Your Word is a Lamp', theme: 'guidance' },
];

export class VerseService {
  private static instance: VerseService;
  private cache = new Map<string, any>();
  private readonly DATA_PATH = path.join(process.cwd(), 'data', 'bible');
  
  public static getInstance(): VerseService {
    if (!VerseService.instance) {
      VerseService.instance = new VerseService();
    }
    return VerseService.instance;
  }
  
  // Convert display name to file name (e.g., "1 Samuel" -> "1-samuel")
  private bookToFileName(book: string): string {
    return book.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  
  // Convert file name to display name (e.g., "1-samuel" -> "1 Samuel") 
  private fileNameToBook(fileName: string): string {
    return fileName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  async getVerse(book: string, chapter: number, verse: number): Promise<Verse | null> {
    const cacheKey = `${book}-${chapter}-${verse}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const fileName = this.bookToFileName(book);
      const filePath = path.join(this.DATA_PATH, `${fileName}-${chapter}.json`);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return null;
      }
      
      const data = await fs.readFile(filePath, 'utf-8');
      const chapterData = JSON.parse(data);
      
      if (!chapterData.verses || !chapterData.verses[verse - 1]) {
        return null;
      }
      
      const verseData = chapterData.verses[verse - 1];
      const result: Verse = {
        book: this.fileNameToBook(fileName),
        chapter,
        verse,
        text: verseData.text,
        reference: `${this.fileNameToBook(fileName)} ${chapter}:${verse}`
      };
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to load verse ${book} ${chapter}:${verse}:`, error);
      return null;
    }
  }
  
  async getChapter(book: string, chapter: number): Promise<Chapter | null> {
    const cacheKey = `chapter-${book}-${chapter}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const fileName = this.bookToFileName(book);
      const filePath = path.join(this.DATA_PATH, `${fileName}-${chapter}.json`);
      
      const data = await fs.readFile(filePath, 'utf-8');
      const chapterData = JSON.parse(data);
      
      if (!chapterData.verses) {
        return null;
      }
      
      const verses: Verse[] = chapterData.verses.map((verseData: any, index: number) => ({
        book: this.fileNameToBook(fileName),
        chapter,
        verse: index + 1,
        text: verseData.text,
        reference: `${this.fileNameToBook(fileName)} ${chapter}:${index + 1}`
      }));
      
      const result: Chapter = {
        book: this.fileNameToBook(fileName),
        chapter,
        verses
      };
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to load chapter ${book} ${chapter}:`, error);
      return null;
    }
  }
  
  // Get related verses by theme or similar content
  async getRelatedVerses(book: string, chapter: number, verse: number, limit: number = 5): Promise<Verse[]> {
    const currentVerse = await this.getVerse(book, chapter, verse);
    if (!currentVerse) return [];
    
    // Find related verses from popular verses list
    const related = POPULAR_VERSES
      .filter(v => !(v.book === book && v.chapter === chapter && v.verse === verse))
      .slice(0, limit);
    
    const relatedVerses: Verse[] = [];
    
    for (const v of related) {
      const verseData = await this.getVerse(v.book, v.chapter, v.verse);
      if (verseData) {
        relatedVerses.push(verseData);
      }
    }
    
    return relatedVerses;
  }
  
  // Get verse metadata for SEO
  getVerseMetadata(book: string, chapter: number, verse: number) {
    const popularVerse = POPULAR_VERSES.find(v => 
      v.book === book && v.chapter === chapter && v.verse === verse
    );
    
    const displayBook = this.fileNameToBook(book);
    
    return {
      title: popularVerse?.title || `${displayBook} ${chapter}:${verse}`,
      theme: popularVerse?.theme || 'scripture',
      canonical: `/verse/${book}/${chapter}/${verse}`,
      isPopular: !!popularVerse
    };
  }
  
  // Get all popular verse paths for sitemap generation
  getPopularVersePaths(): Array<{book: string; chapter: number; verse: number}> {
    return POPULAR_VERSES.map(v => ({
      book: v.book,
      chapter: v.chapter,
      verse: v.verse
    }));
  }
  
  // Clear cache to free memory
  clearCache() {
    this.cache.clear();
  }
}