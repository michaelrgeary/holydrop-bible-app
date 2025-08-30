import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

// Import KJV data - it's organized as "Book Chapter:Verse" keys
const kjvVerses = require('../node_modules/kjv/json/verses-1769.json');

interface ImportStats {
  totalChapters: number;
  processedChapters: number;
  totalVerses: number;
  failedChapters: string[];
  startTime: number;
  filesSizeBeforeMB: number;
  filesSizeAfterMB: number;
}

// Book name mappings (from our filenames to KJV keys)
const bookNameMap: Record<string, string> = {
  'genesis': 'Genesis',
  'exodus': 'Exodus',
  'leviticus': 'Leviticus',
  'numbers': 'Numbers',
  'deuteronomy': 'Deuteronomy',
  'joshua': 'Joshua',
  'judges': 'Judges',
  'ruth': 'Ruth',
  '1-samuel': '1 Samuel',
  '2-samuel': '2 Samuel',
  '1-kings': '1 Kings',
  '2-kings': '2 Kings',
  '1-chronicles': '1 Chronicles',
  '2-chronicles': '2 Chronicles',
  'ezra': 'Ezra',
  'nehemiah': 'Nehemiah',
  'esther': 'Esther',
  'job': 'Job',
  'psalms': 'Psalms',
  'proverbs': 'Proverbs',
  'ecclesiastes': 'Ecclesiastes',
  'song-of-solomon': "Solomon's Song",
  'isaiah': 'Isaiah',
  'jeremiah': 'Jeremiah',
  'lamentations': 'Lamentations',
  'ezekiel': 'Ezekiel',
  'daniel': 'Daniel',
  'hosea': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'obadiah': 'Obadiah',
  'jonah': 'Jonah',
  'micah': 'Micah',
  'nahum': 'Nahum',
  'habakkuk': 'Habakkuk',
  'zephaniah': 'Zephaniah',
  'haggai': 'Haggai',
  'zechariah': 'Zechariah',
  'malachi': 'Malachi',
  'matthew': 'Matthew',
  'mark': 'Mark',
  'luke': 'Luke',
  'john': 'John',
  'acts': 'Acts',
  'romans': 'Romans',
  '1-corinthians': '1 Corinthians',
  '2-corinthians': '2 Corinthians',
  'galatians': 'Galatians',
  'ephesians': 'Ephesians',
  'philippians': 'Philippians',
  'colossians': 'Colossians',
  '1-thessalonians': '1 Thessalonians',
  '2-thessalonians': '2 Thessalonians',
  '1-timothy': '1 Timothy',
  '2-timothy': '2 Timothy',
  'titus': 'Titus',
  'philemon': 'Philemon',
  'hebrews': 'Hebrews',
  'james': 'James',
  '1-peter': '1 Peter',
  '2-peter': '2 Peter',
  '1-john': '1 John',
  '2-john': '2 John',
  '3-john': '3 John',
  'jude': 'Jude',
  'revelation': 'Revelation'
};

async function importKJVText() {
  console.log('📖 Starting KJV Bible Text Import...');
  console.log('=' .repeat(50));
  
  const stats: ImportStats = {
    totalChapters: 0,
    processedChapters: 0,
    totalVerses: 0,
    failedChapters: [],
    startTime: performance.now(),
    filesSizeBeforeMB: 0,
    filesSizeAfterMB: 0,
  };

  const dataDir = path.join(process.cwd(), 'data', 'bible');
  
  // Calculate size before
  const getDirectorySize = (dir: string): number => {
    let size = 0;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const stat = fs.statSync(path.join(dir, file));
      if (stat.isFile()) {
        size += stat.size;
      }
    });
    return size / 1024 / 1024; // Convert to MB
  };
  
  stats.filesSizeBeforeMB = getDirectorySize(dataDir);
  console.log(`📦 Initial size: ${stats.filesSizeBeforeMB.toFixed(2)} MB`);
  
  // Process each book
  try {
    // Get all JSON files (excluding index.json)
    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.json') && f !== 'index.json');
    stats.totalChapters = files.length;
    console.log(`📚 Found ${stats.totalChapters} chapter files to process`);
    
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const chapterData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Extract book and chapter from filename (e.g., "genesis-1.json" or "1-chronicles-10.json")
      const fileNameWithoutExt = file.replace('.json', '');
      const parts = fileNameWithoutExt.split('-');
      
      let bookSlug: string;
      let chapterNum: number;
      
      // Handle books with numbers in their names (e.g., "1-chronicles-10")
      if (parts[0].match(/^\d+$/) && parts.length >= 3) {
        // Book name starts with a number (1 Samuel, 2 Kings, etc.)
        bookSlug = parts.slice(0, -1).join('-'); // Everything except last part
        chapterNum = parseInt(parts[parts.length - 1]);
      } else if (parts[0] === 'song' && parts.length >= 4) {
        // Special case for Song of Solomon
        bookSlug = parts.slice(0, -1).join('-');
        chapterNum = parseInt(parts[parts.length - 1]);
      } else {
        // Regular books (genesis-1, john-3, etc.)
        bookSlug = parts.slice(0, -1).join('-');
        chapterNum = parseInt(parts[parts.length - 1]);
      }
      
      // Get real verses from KJV source
      const realVerses = getRealVerses(bookSlug, chapterNum);
      
      if (realVerses && realVerses.length > 0) {
        // Update chapter data with real text
        chapterData.verses = realVerses;
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(chapterData, null, 2));
        
        stats.processedChapters++;
        stats.totalVerses += realVerses.length;
        
        // Progress indicator
        if (stats.processedChapters % 50 === 0 || stats.processedChapters === stats.totalChapters) {
          const progress = (stats.processedChapters / stats.totalChapters * 100).toFixed(1);
          console.log(`Progress: ${progress}% (${stats.processedChapters}/${stats.totalChapters} chapters, ${stats.totalVerses} verses)`);
        }
      } else {
        stats.failedChapters.push(file);
      }
    }
    
    stats.filesSizeAfterMB = getDirectorySize(dataDir);
    
    // Final report
    const duration = ((performance.now() - stats.startTime) / 1000).toFixed(2);
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Import Complete!');
    console.log('=' .repeat(50));
    console.log(`✅ Chapters processed: ${stats.processedChapters}/${stats.totalChapters}`);
    console.log(`✅ Total verses: ${stats.totalVerses.toLocaleString()}`);
    console.log(`📦 Size before: ${stats.filesSizeBeforeMB.toFixed(2)} MB`);
    console.log(`📦 Size after: ${stats.filesSizeAfterMB.toFixed(2)} MB`);
    console.log(`📈 Size increase: ${(stats.filesSizeAfterMB - stats.filesSizeBeforeMB).toFixed(2)} MB`);
    console.log(`⏱️  Time taken: ${duration} seconds`);
    
    if (stats.failedChapters.length > 0) {
      console.log(`\n⚠️  Failed chapters (${stats.failedChapters.length}):`, stats.failedChapters.slice(0, 10));
    }
    
    // Verify some key verses
    console.log('\n🔍 Verification of key verses:');
    await verifyKeyVerses();
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

function getRealVerses(bookSlug: string, chapter: number) {
  try {
    // Convert slug to book name
    const bookName = bookNameMap[bookSlug];
    if (!bookName) {
      console.warn(`Unknown book slug: ${bookSlug}`);
      return null;
    }
    
    // Collect all verses for this chapter
    const verses: Array<{ verse: number; text: string }> = [];
    let verseNum = 1;
    
    // Try to find verses for this chapter
    while (true) {
      const key = `${bookName} ${chapter}:${verseNum}`;
      const text = kjvVerses[key];
      
      if (!text) {
        // No more verses in this chapter
        break;
      }
      
      verses.push({
        verse: verseNum,
        text: text.trim()
      });
      
      verseNum++;
      
      // Safety limit (no chapter has more than 200 verses)
      if (verseNum > 200) {
        break;
      }
    }
    
    return verses;
  } catch (error) {
    console.error(`Failed to get ${bookSlug} ${chapter}:`, error);
    return null;
  }
}

async function verifyKeyVerses() {
  const keyVerses = [
    { file: 'genesis-1.json', verse: 1, expected: 'In the beginning God created' },
    { file: 'john-3.json', verse: 16, expected: 'For God so loved the world' },
    { file: 'psalms-23.json', verse: 1, expected: 'The LORD is my shepherd' },
    { file: 'psalms-119.json', verse: 1, expected: 'Blessed are the undefiled' },
    { file: 'psalms-119.json', verse: 176, expected: 'I have gone astray like a lost sheep' },
    { file: 'revelation-22.json', verse: 21, expected: 'The grace of our Lord Jesus Christ' },
  ];
  
  const dataDir = path.join(process.cwd(), 'data', 'bible');
  
  for (const check of keyVerses) {
    const filePath = path.join(dataDir, check.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${check.file}: File not found`);
      continue;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const verse = data.verses?.find((v: any) => v.verse === check.verse);
    
    if (verse?.text?.includes(check.expected)) {
      const preview = verse.text.length > 60 ? verse.text.substring(0, 60) + '...' : verse.text;
      console.log(`✅ ${check.file} v${check.verse}: "${preview}"`);
    } else {
      console.log(`❌ ${check.file} v${check.verse}: Verification failed`);
      if (verse) {
        console.log(`   Found: "${verse.text.substring(0, 60)}..."`);
      }
    }
  }
}

// Run the import
importKJVText();