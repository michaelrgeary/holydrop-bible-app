import { BookName, getBookInfo } from './books';
import bibleData from './kjv-bible-complete.json';

export interface ParsedReference {
  book: BookName;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  display: string;
}

export function parseReference(text: string): ParsedReference | null {
  try {
    // Simple parser for common patterns like "John 3:16" or "Genesis 1:1-5"
    const match = text.match(/^([\w\s]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
    
    if (!match) return null;
    
    const [, bookName, chapterStr, verseStartStr, verseEndStr] = match;
    const bookInfo = getBookInfo(bookName.trim());
    
    if (!bookInfo) return null;
    
    const chapter = parseInt(chapterStr, 10);
    const verseStart = verseStartStr ? parseInt(verseStartStr, 10) : undefined;
    const verseEnd = verseEndStr ? parseInt(verseEndStr, 10) : verseStart;

    return {
      book: bookInfo.name,
      chapter,
      verseStart,
      verseEnd: verseEnd !== verseStart ? verseEnd : undefined,
      display: formatReference(bookInfo.name, chapter, verseStart, verseEnd)
    };
  } catch (error) {
    console.error('Error parsing Bible reference:', error);
    return null;
  }
}

export function formatReference(
  book: BookName,
  chapter: number,
  verseStart?: number,
  verseEnd?: number
): string {
  let ref = `${book} ${chapter}`;
  
  if (verseStart) {
    ref += `:${verseStart}`;
    if (verseEnd && verseEnd !== verseStart) {
      ref += `-${verseEnd}`;
    }
  }
  
  return ref;
}

export interface Verse {
  verse: number;
  text: string;
}

export function getVerseRange(
  book: BookName,
  chapter: number,
  startVerse?: number,
  endVerse?: number
): Verse[] {
  const bookData = (bibleData as any)[book];
  if (!bookData) return [];
  
  const chapterData = bookData[chapter.toString()];
  if (!chapterData) return [];
  
  if (!startVerse) {
    return chapterData;
  }
  
  const start = startVerse - 1; // Convert to 0-based index
  const end = endVerse || startVerse;
  
  return chapterData.slice(start, end);
}

export function getChapter(book: BookName, chapter: number): Verse[] {
  return getVerseRange(book, chapter);
}