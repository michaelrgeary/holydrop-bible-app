export const OLD_TESTAMENT = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi"
] as const;

export const NEW_TESTAMENT = [
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation"
] as const;

export const BOOKS = [...OLD_TESTAMENT, ...NEW_TESTAMENT] as const;

export type BookName = typeof BOOKS[number];

const CHAPTER_COUNTS: Record<BookName, number> = {
  "Genesis": 50,
  "Exodus": 40,
  "Leviticus": 27,
  "Numbers": 36,
  "Deuteronomy": 34,
  "Joshua": 24,
  "Judges": 21,
  "Ruth": 4,
  "1 Samuel": 31,
  "2 Samuel": 24,
  "1 Kings": 22,
  "2 Kings": 25,
  "1 Chronicles": 29,
  "2 Chronicles": 36,
  "Ezra": 10,
  "Nehemiah": 13,
  "Esther": 10,
  "Job": 42,
  "Psalms": 150,
  "Proverbs": 31,
  "Ecclesiastes": 12,
  "Song of Solomon": 8,
  "Isaiah": 66,
  "Jeremiah": 52,
  "Lamentations": 5,
  "Ezekiel": 48,
  "Daniel": 12,
  "Hosea": 14,
  "Joel": 3,
  "Amos": 9,
  "Obadiah": 1,
  "Jonah": 4,
  "Micah": 7,
  "Nahum": 3,
  "Habakkuk": 3,
  "Zephaniah": 3,
  "Haggai": 2,
  "Zechariah": 14,
  "Malachi": 4,
  "Matthew": 28,
  "Mark": 16,
  "Luke": 24,
  "John": 21,
  "Acts": 28,
  "Romans": 16,
  "1 Corinthians": 16,
  "2 Corinthians": 13,
  "Galatians": 6,
  "Ephesians": 6,
  "Philippians": 4,
  "Colossians": 4,
  "1 Thessalonians": 5,
  "2 Thessalonians": 3,
  "1 Timothy": 6,
  "2 Timothy": 4,
  "Titus": 3,
  "Philemon": 1,
  "Hebrews": 13,
  "James": 5,
  "1 Peter": 5,
  "2 Peter": 3,
  "1 John": 5,
  "2 John": 1,
  "3 John": 1,
  "Jude": 1,
  "Revelation": 22
};

export interface BookInfo {
  name: BookName;
  testament: 'Old Testament' | 'New Testament';
  index: number;
  totalChapters: number;
}

export function getBookInfo(bookName: string): BookInfo | null {
  const normalizedName = formatBookName(bookName);
  const foundBook = BOOKS.find(book => 
    book.toLowerCase() === normalizedName.toLowerCase()
  );
  
  if (!foundBook) return null;
  
  const isOldTestament = OLD_TESTAMENT.includes(foundBook as any);
  const testament = isOldTestament ? 'Old Testament' : 'New Testament';
  const index = isOldTestament 
    ? OLD_TESTAMENT.indexOf(foundBook as any) + 1
    : NEW_TESTAMENT.indexOf(foundBook as any) + 1;
  
  return {
    name: foundBook,
    testament,
    index,
    totalChapters: CHAPTER_COUNTS[foundBook]
  };
}

export function formatBookName(book: string): string {
  // Handle URL-friendly formats
  const formatted = book
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => {
      // Keep numbers as is (for 1 John, 2 Peter, etc.)
      if (/^\d+$/.test(word)) return word;
      // Handle "of" - keep lowercase
      if (word === 'of') return 'of';
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
  
  // Special case handling for common variations
  const variations: Record<string, BookName> = {
    'song of songs': 'Song of Solomon',
    'songs': 'Song of Solomon',
    'first samuel': '1 Samuel',
    'second samuel': '2 Samuel',
    'first kings': '1 Kings',
    'second kings': '2 Kings',
    'first chronicles': '1 Chronicles',
    'second chronicles': '2 Chronicles',
    'first corinthians': '1 Corinthians',
    'second corinthians': '2 Corinthians',
    'first thessalonians': '1 Thessalonians',
    'second thessalonians': '2 Thessalonians',
    'first timothy': '1 Timothy',
    'second timothy': '2 Timothy',
    'first peter': '1 Peter',
    'second peter': '2 Peter',
    'first john': '1 John',
    'second john': '2 John',
    'third john': '3 John'
  };
  
  return variations[formatted.toLowerCase()] || formatted;
}

export function bookNameToUrl(bookName: BookName): string {
  return bookName.toLowerCase().replace(/\s+/g, '-');
}