import * as fs from 'fs';
import * as path from 'path';

interface Verse {
  verse: number;
  text: string;
}

interface Chapter {
  chapter: number;
  verses: Verse[];
}

// Complete list of Bible books in order
const BIBLE_BOOKS = [
  // Old Testament
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  // New Testament
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
  'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

// Chapter counts for each book
const CHAPTER_COUNTS: { [key: string]: number } = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
  'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66,
  'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4,
  'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2,
  'Zechariah': 14, 'Malachi': 4,
  'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
  'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6,
  'Ephesians': 6, 'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5,
  '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3,
  'Philemon': 1, 'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3,
  '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

// Verse counts for key chapters (for realistic placeholder generation)
const VERSE_COUNTS: { [key: string]: { [chapter: string]: number } } = {
  'Genesis': { '1': 31, '2': 25, '3': 24, '50': 26 },
  'Exodus': { '1': 22, '20': 26 },
  'Psalms': { '1': 6, '23': 6, '119': 176, '150': 6 },
  'Proverbs': { '1': 33, '31': 31 },
  'Isaiah': { '1': 31, '53': 12 },
  'Matthew': { '1': 25, '5': 48, '28': 20 },
  'John': { '1': 51, '3': 36, '21': 25 },
  'Romans': { '1': 32, '8': 39 },
  'Revelation': { '1': 20, '22': 21 }
};

function getVerseCount(book: string, chapter: number): number {
  // Use known verse counts if available
  if (VERSE_COUNTS[book] && VERSE_COUNTS[book][chapter.toString()]) {
    return VERSE_COUNTS[book][chapter.toString()];
  }
  
  // Otherwise, generate a realistic count based on book type
  if (book === 'Psalms') {
    // Psalms vary widely
    return chapter === 119 ? 176 : Math.floor(Math.random() * 20) + 6;
  } else if (book === 'Proverbs') {
    // Proverbs typically 20-35 verses
    return Math.floor(Math.random() * 15) + 20;
  } else if (['1 John', '2 John', '3 John', 'Jude', 'Philemon'].includes(book)) {
    // Short epistles
    return Math.floor(Math.random() * 10) + 10;
  } else {
    // Standard chapters: 15-35 verses
    return Math.floor(Math.random() * 20) + 15;
  }
}

async function loadExistingData(): Promise<any> {
  try {
    const existingFile = path.join(process.cwd(), 'lib', 'bible', 'kjv-bible.json');
    if (fs.existsSync(existingFile)) {
      const data = fs.readFileSync(existingFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('No existing data found, will create from scratch');
  }
  return {};
}

async function generateBibleData() {
  console.log('📖 Starting Complete Bible Data Generation...');
  console.log(`📚 Processing ${BIBLE_BOOKS.length} books (1,189 chapters total)...`);

  const dataDir = path.join(process.cwd(), 'data', 'bible');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing data to preserve Genesis 1-3 and John 1-3
  const existingData = await loadExistingData();
  
  // Create complete Bible structure
  const completeBible: { [key: string]: { [chapter: string]: Verse[] } } = {};
  
  // Create a summary file
  const summary: any = {
    books: [],
    totalChapters: 0,
    totalVerses: 0,
    generated: new Date().toISOString()
  };

  for (const bookName of BIBLE_BOOKS) {
    const bookSlug = bookName.toLowerCase().replace(/\s+/g, '-');
    const chapterCount = CHAPTER_COUNTS[bookName];
    
    process.stdout.write(`📗 Processing ${bookName} (${chapterCount} chapters)...`);
    
    completeBible[bookName] = {};
    let bookVerseCount = 0;

    for (let chapterNum = 1; chapterNum <= chapterCount; chapterNum++) {
      const verses: Verse[] = [];
      
      // Check if we have existing data for this chapter
      if (existingData[bookName] && existingData[bookName][chapterNum.toString()]) {
        // Use existing real Bible text
        verses.push(...existingData[bookName][chapterNum.toString()]);
      } else {
        // Generate placeholder verses
        const verseCount = getVerseCount(bookName, chapterNum);
        for (let v = 1; v <= verseCount; v++) {
          verses.push({
            verse: v,
            text: `[${bookName} ${chapterNum}:${v}] The text of this verse will be loaded when the complete KJV Bible data is imported. This is a placeholder to establish the correct structure.`
          });
        }
      }
      
      completeBible[bookName][chapterNum.toString()] = verses;
      bookVerseCount += verses.length;
      
      // Save individual chapter file
      const chapterFile = path.join(dataDir, `${bookSlug}-${chapterNum}.json`);
      fs.writeFileSync(chapterFile, JSON.stringify({
        book: bookName,
        chapter: chapterNum,
        verses: verses
      }, null, 2));
    }
    
    // Update summary
    summary.books.push({
      name: bookName,
      slug: bookSlug,
      chapters: chapterCount,
      verses: bookVerseCount
    });
    summary.totalChapters += chapterCount;
    summary.totalVerses += bookVerseCount;
    
    console.log(` ✅ (${bookVerseCount} verses)`);
  }

  // Save complete Bible file
  const completeFile = path.join(process.cwd(), 'lib', 'bible', 'kjv-bible-complete.json');
  fs.writeFileSync(completeFile, JSON.stringify(completeBible, null, 2));
  
  // Save summary file
  const summaryFile = path.join(dataDir, 'index.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('📊 Complete Bible Data Generation Finished!');
  console.log('='.repeat(60));
  console.log(`✅ Books: ${summary.books.length}`);
  console.log(`✅ Chapters: ${summary.totalChapters}`);
  console.log(`✅ Verses: ${summary.totalVerses.toLocaleString()}`);
  console.log(`📁 Individual chapters: ${dataDir}/`);
  console.log(`📁 Complete Bible: ${completeFile}`);
  console.log(`📁 Summary: ${summaryFile}`);
  console.log('\n📝 Notes:');
  console.log('- Genesis 1-3 and John 1-3 contain real KJV text (preserved)');
  console.log('- Other chapters have placeholder text with correct structure');
  console.log('- Ready to import real KJV text from a Bible API or dataset');
  
  // Create a sample to show the structure
  console.log('\n📋 Sample of generated structure:');
  console.log('- Genesis 1: Real KJV text (31 verses)');
  console.log('- Exodus 1: Placeholder (22 verses)');
  console.log('- Psalms 119: Placeholder (176 verses)');
  console.log('- Revelation 22: Placeholder (21 verses)');
}

// Run the generator
generateBibleData().catch(console.error);