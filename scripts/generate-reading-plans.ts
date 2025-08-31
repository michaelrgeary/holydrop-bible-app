import * as fs from 'fs';
import * as path from 'path';

// Complete Bible book metadata for planning
const BIBLE_BOOKS = {
  // Old Testament - Law (187 chapters)
  genesis: { chapters: 50, testament: 'old', genre: 'law', order: 1 },
  exodus: { chapters: 40, testament: 'old', genre: 'law', order: 2 },
  leviticus: { chapters: 27, testament: 'old', genre: 'law', order: 3 },
  numbers: { chapters: 36, testament: 'old', genre: 'law', order: 4 },
  deuteronomy: { chapters: 34, testament: 'old', genre: 'law', order: 5 },
  
  // Old Testament - History (249 chapters)
  joshua: { chapters: 24, testament: 'old', genre: 'history', order: 6 },
  judges: { chapters: 21, testament: 'old', genre: 'history', order: 7 },
  ruth: { chapters: 4, testament: 'old', genre: 'history', order: 8 },
  '1-samuel': { chapters: 31, testament: 'old', genre: 'history', order: 9 },
  '2-samuel': { chapters: 24, testament: 'old', genre: 'history', order: 10 },
  '1-kings': { chapters: 22, testament: 'old', genre: 'history', order: 11 },
  '2-kings': { chapters: 25, testament: 'old', genre: 'history', order: 12 },
  '1-chronicles': { chapters: 29, testament: 'old', genre: 'history', order: 13 },
  '2-chronicles': { chapters: 36, testament: 'old', genre: 'history', order: 14 },
  ezra: { chapters: 10, testament: 'old', genre: 'history', order: 15 },
  nehemiah: { chapters: 13, testament: 'old', genre: 'history', order: 16 },
  esther: { chapters: 10, testament: 'old', genre: 'history', order: 17 },
  
  // Old Testament - Wisdom (243 chapters)
  job: { chapters: 42, testament: 'old', genre: 'wisdom', order: 18 },
  psalms: { chapters: 150, testament: 'old', genre: 'wisdom', order: 19 },
  proverbs: { chapters: 31, testament: 'old', genre: 'wisdom', order: 20 },
  ecclesiastes: { chapters: 12, testament: 'old', genre: 'wisdom', order: 21 },
  'song-of-solomon': { chapters: 8, testament: 'old', genre: 'wisdom', order: 22 },
  
  // Old Testament - Major Prophets (183 chapters)
  isaiah: { chapters: 66, testament: 'old', genre: 'prophet', order: 23 },
  jeremiah: { chapters: 52, testament: 'old', genre: 'prophet', order: 24 },
  lamentations: { chapters: 5, testament: 'old', genre: 'prophet', order: 25 },
  ezekiel: { chapters: 48, testament: 'old', genre: 'prophet', order: 26 },
  daniel: { chapters: 12, testament: 'old', genre: 'prophet', order: 27 },
  
  // Old Testament - Minor Prophets (67 chapters)
  hosea: { chapters: 14, testament: 'old', genre: 'prophet', order: 28 },
  joel: { chapters: 3, testament: 'old', genre: 'prophet', order: 29 },
  amos: { chapters: 9, testament: 'old', genre: 'prophet', order: 30 },
  obadiah: { chapters: 1, testament: 'old', genre: 'prophet', order: 31 },
  jonah: { chapters: 4, testament: 'old', genre: 'prophet', order: 32 },
  micah: { chapters: 7, testament: 'old', genre: 'prophet', order: 33 },
  nahum: { chapters: 3, testament: 'old', genre: 'prophet', order: 34 },
  habakkuk: { chapters: 3, testament: 'old', genre: 'prophet', order: 35 },
  zephaniah: { chapters: 3, testament: 'old', genre: 'prophet', order: 36 },
  haggai: { chapters: 2, testament: 'old', genre: 'prophet', order: 37 },
  zechariah: { chapters: 14, testament: 'old', genre: 'prophet', order: 38 },
  malachi: { chapters: 4, testament: 'old', genre: 'prophet', order: 39 },
  
  // New Testament - Gospels (89 chapters)
  matthew: { chapters: 28, testament: 'new', genre: 'gospel', order: 40 },
  mark: { chapters: 16, testament: 'new', genre: 'gospel', order: 41 },
  luke: { chapters: 24, testament: 'new', genre: 'gospel', order: 42 },
  john: { chapters: 21, testament: 'new', genre: 'gospel', order: 43 },
  
  // New Testament - History (28 chapters)
  acts: { chapters: 28, testament: 'new', genre: 'history', order: 44 },
  
  // New Testament - Pauline Epistles (87 chapters)
  romans: { chapters: 16, testament: 'new', genre: 'epistle', order: 45 },
  '1-corinthians': { chapters: 16, testament: 'new', genre: 'epistle', order: 46 },
  '2-corinthians': { chapters: 13, testament: 'new', genre: 'epistle', order: 47 },
  galatians: { chapters: 6, testament: 'new', genre: 'epistle', order: 48 },
  ephesians: { chapters: 6, testament: 'new', genre: 'epistle', order: 49 },
  philippians: { chapters: 4, testament: 'new', genre: 'epistle', order: 50 },
  colossians: { chapters: 4, testament: 'new', genre: 'epistle', order: 51 },
  '1-thessalonians': { chapters: 5, testament: 'new', genre: 'epistle', order: 52 },
  '2-thessalonians': { chapters: 3, testament: 'new', genre: 'epistle', order: 53 },
  '1-timothy': { chapters: 6, testament: 'new', genre: 'epistle', order: 54 },
  '2-timothy': { chapters: 4, testament: 'new', genre: 'epistle', order: 55 },
  titus: { chapters: 3, testament: 'new', genre: 'epistle', order: 56 },
  philemon: { chapters: 1, testament: 'new', genre: 'epistle', order: 57 },
  
  // New Testament - General Epistles (34 chapters)
  hebrews: { chapters: 13, testament: 'new', genre: 'epistle', order: 58 },
  james: { chapters: 5, testament: 'new', genre: 'epistle', order: 59 },
  '1-peter': { chapters: 5, testament: 'new', genre: 'epistle', order: 60 },
  '2-peter': { chapters: 3, testament: 'new', genre: 'epistle', order: 61 },
  '1-john': { chapters: 5, testament: 'new', genre: 'epistle', order: 62 },
  '2-john': { chapters: 1, testament: 'new', genre: 'epistle', order: 63 },
  '3-john': { chapters: 1, testament: 'new', genre: 'epistle', order: 64 },
  jude: { chapters: 1, testament: 'new', genre: 'epistle', order: 65 },
  
  // New Testament - Prophecy (22 chapters)
  revelation: { chapters: 22, testament: 'new', genre: 'prophecy', order: 66 }
};

interface DailyReading {
  day: number;
  date?: string;
  passages: Array<{
    book: string;
    startChapter: number;
    endChapter?: number;
    startVerse?: number;
    endVerse?: number;
  }>;
  theme?: string;
  estimatedMinutes: number;
}

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  dailyMinutes: number;
  readings: DailyReading[];
  tags: string[];
}

// Generate Bible in a Year (Balanced)
function generateBibleInYear(): DailyReading[] {
  const readings: DailyReading[] = [];
  const totalDays = 365;
  
  // Calculate chapters per category
  const otBooks = Object.entries(BIBLE_BOOKS).filter(([_, data]) => data.testament === 'old');
  const ntBooks = Object.entries(BIBLE_BOOKS).filter(([_, data]) => data.testament === 'new');
  
  // Track progress
  let currentOTBook = 0;
  let currentOTChapter = 1;
  let currentNTBook = 0;
  let currentNTChapter = 1;
  let currentPsalm = 1;
  let currentProverb = 1;
  
  for (let day = 1; day <= totalDays; day++) {
    const dailyReading: DailyReading = {
      day,
      passages: [],
      estimatedMinutes: 15
    };
    
    // Add OT reading (3 chapters average)
    const otChaptersToday = day <= 300 ? 3 : 2; // Slow down near the end
    for (let i = 0; i < otChaptersToday; i++) {
      if (currentOTBook < otBooks.length) {
        const [bookName, bookData] = otBooks[currentOTBook];
        
        // Skip Psalms and Proverbs (handled separately)
        if (bookName === 'psalms' || bookName === 'proverbs') {
          currentOTBook++;
          if (currentOTBook < otBooks.length) {
            currentOTChapter = 1;
            i--; // Retry with next book
          }
          continue;
        }
        
        dailyReading.passages.push({
          book: bookName,
          startChapter: currentOTChapter,
          endChapter: currentOTChapter
        });
        
        currentOTChapter++;
        if (currentOTChapter > bookData.chapters) {
          currentOTBook++;
          currentOTChapter = 1;
        }
      }
    }
    
    // Add NT reading (1 chapter)
    if (currentNTBook < ntBooks.length) {
      const [bookName, bookData] = ntBooks[currentNTBook];
      
      dailyReading.passages.push({
        book: bookName,
        startChapter: currentNTChapter,
        endChapter: currentNTChapter
      });
      
      currentNTChapter++;
      if (currentNTChapter > bookData.chapters) {
        currentNTBook++;
        currentNTChapter = 1;
      }
    }
    
    // Add Psalm (every other day for first 300 days)
    if (day % 2 === 1 && currentPsalm <= 150) {
      dailyReading.passages.push({
        book: 'psalms',
        startChapter: currentPsalm,
        endChapter: currentPsalm
      });
      currentPsalm++;
    }
    
    // Add Proverb (one per day for first 31 days)
    if (day <= 31) {
      dailyReading.passages.push({
        book: 'proverbs',
        startChapter: currentProverb,
        endChapter: currentProverb
      });
      currentProverb++;
    }
    
    readings.push(dailyReading);
  }
  
  return readings;
}

// Generate Gospels in 30 Days
function generateGospelsIn30Days(): DailyReading[] {
  const readings: DailyReading[] = [];
  const gospels = ['matthew', 'mark', 'luke', 'john'];
  const totalChapters = 89; // Total gospel chapters
  const chaptersPerDay = 3; // ~3 chapters per day
  
  let currentGospel = 0;
  let currentChapter = 1;
  
  for (let day = 1; day <= 30; day++) {
    const dailyReading: DailyReading = {
      day,
      passages: [],
      estimatedMinutes: 10
    };
    
    // Add 3 chapters per day
    for (let i = 0; i < chaptersPerDay; i++) {
      if (currentGospel < gospels.length) {
        const bookName = gospels[currentGospel];
        const bookData = BIBLE_BOOKS[bookName as keyof typeof BIBLE_BOOKS];
        
        if (currentChapter <= bookData.chapters) {
          // Check if we should combine chapters
          const remainingInBook = bookData.chapters - currentChapter + 1;
          if (remainingInBook >= 2 && i === 0) {
            // Read 2 chapters at once if possible
            dailyReading.passages.push({
              book: bookName,
              startChapter: currentChapter,
              endChapter: Math.min(currentChapter + 1, bookData.chapters)
            });
            currentChapter += 2;
            i++; // Count as 2 chapters
          } else {
            dailyReading.passages.push({
              book: bookName,
              startChapter: currentChapter,
              endChapter: currentChapter
            });
            currentChapter++;
          }
        }
        
        if (currentChapter > bookData.chapters) {
          currentGospel++;
          currentChapter = 1;
        }
      }
    }
    
    readings.push(dailyReading);
  }
  
  return readings;
}

// Generate Topical Plan - Peace for Anxiety (7 days)
function generateAnxietyPlan(): DailyReading[] {
  const readings: DailyReading[] = [
    {
      day: 1,
      theme: "God's Peace Surpasses Understanding",
      passages: [
        { book: 'philippians', startChapter: 4, startVerse: 4, endVerse: 9 },
        { book: 'john', startChapter: 14, startVerse: 25, endVerse: 27 },
        { book: 'psalms', startChapter: 23 }
      ],
      estimatedMinutes: 10
    },
    {
      day: 2,
      theme: "Cast Your Cares on Him",
      passages: [
        { book: '1-peter', startChapter: 5, startVerse: 5, endVerse: 11 },
        { book: 'matthew', startChapter: 6, startVerse: 25, endVerse: 34 },
        { book: 'psalms', startChapter: 55, startVerse: 22, endVerse: 22 }
      ],
      estimatedMinutes: 10
    },
    {
      day: 3,
      theme: "God is Our Refuge",
      passages: [
        { book: 'psalms', startChapter: 46 },
        { book: 'psalms', startChapter: 91 },
        { book: 'isaiah', startChapter: 41, startVerse: 10, endVerse: 13 }
      ],
      estimatedMinutes: 10
    },
    {
      day: 4,
      theme: "Perfect Love Casts Out Fear",
      passages: [
        { book: '1-john', startChapter: 4, startVerse: 16, endVerse: 21 },
        { book: '2-timothy', startChapter: 1, startVerse: 6, endVerse: 7 },
        { book: 'romans', startChapter: 8, startVerse: 31, endVerse: 39 }
      ],
      estimatedMinutes: 10
    },
    {
      day: 5,
      theme: "Prayer and Thanksgiving",
      passages: [
        { book: 'james', startChapter: 5, startVerse: 13, endVerse: 18 },
        { book: '1-thessalonians', startChapter: 5, startVerse: 16, endVerse: 18 },
        { book: 'psalms', startChapter: 34 }
      ],
      estimatedMinutes: 10
    },
    {
      day: 6,
      theme: "Trust in the Lord",
      passages: [
        { book: 'proverbs', startChapter: 3, startVerse: 5, endVerse: 6 },
        { book: 'psalms', startChapter: 37, startVerse: 1, endVerse: 11 },
        { book: 'isaiah', startChapter: 26, startVerse: 3, endVerse: 4 }
      ],
      estimatedMinutes: 10
    },
    {
      day: 7,
      theme: "Rest in Christ",
      passages: [
        { book: 'matthew', startChapter: 11, startVerse: 28, endVerse: 30 },
        { book: 'hebrews', startChapter: 4, startVerse: 9, endVerse: 11 },
        { book: 'psalms', startChapter: 116 }
      ],
      estimatedMinutes: 10
    }
  ];
  
  return readings;
}

// Generate New Testament in 90 Days
function generateNTIn90Days(): DailyReading[] {
  const readings: DailyReading[] = [];
  const ntBooks = Object.entries(BIBLE_BOOKS)
    .filter(([_, data]) => data.testament === 'new')
    .sort((a, b) => a[1].order - b[1].order);
  
  const totalChapters = 260;
  const chaptersPerDay = 3; // ~3 chapters per day for 90 days
  
  let currentBook = 0;
  let currentChapter = 1;
  
  for (let day = 1; day <= 90; day++) {
    const dailyReading: DailyReading = {
      day,
      passages: [],
      estimatedMinutes: 12
    };
    
    let chaptersToday = 0;
    while (chaptersToday < chaptersPerDay && currentBook < ntBooks.length) {
      const [bookName, bookData] = ntBooks[currentBook];
      const remainingInBook = bookData.chapters - currentChapter + 1;
      const chaptersToRead = Math.min(chaptersPerDay - chaptersToday, remainingInBook);
      
      if (chaptersToRead > 0) {
        dailyReading.passages.push({
          book: bookName,
          startChapter: currentChapter,
          endChapter: currentChapter + chaptersToRead - 1
        });
        
        currentChapter += chaptersToRead;
        chaptersToday += chaptersToRead;
      }
      
      if (currentChapter > bookData.chapters) {
        currentBook++;
        currentChapter = 1;
      }
    }
    
    readings.push(dailyReading);
  }
  
  return readings;
}

// Main generator
async function generateAllPlans() {
  console.log('📖 Generating Bible reading plans...');
  
  const plans: Record<string, ReadingPlan> = {
    'bible-in-year': {
      id: 'bible-in-year',
      name: 'Bible in a Year',
      description: 'Read through the entire Bible in 365 days with a balanced mix of Old Testament, New Testament, Psalms, and Proverbs',
      duration: 365,
      difficulty: 'moderate',
      dailyMinutes: 15,
      readings: generateBibleInYear(),
      tags: ['complete-bible', 'daily', 'balanced']
    },
    'gospels-30': {
      id: 'gospels-30',
      name: 'Gospels in 30 Days',
      description: 'Read Matthew, Mark, Luke, and John in a month to get the complete story of Jesus',
      duration: 30,
      difficulty: 'easy',
      dailyMinutes: 10,
      readings: generateGospelsIn30Days(),
      tags: ['gospels', 'jesus', 'beginner-friendly']
    },
    'anxiety-7': {
      id: 'anxiety-7',
      name: 'Peace for Anxiety',
      description: '7-day plan for finding peace and comfort in Scripture during anxious times',
      duration: 7,
      difficulty: 'easy',
      dailyMinutes: 10,
      readings: generateAnxietyPlan(),
      tags: ['topical', 'anxiety', 'peace', 'mental-health']
    },
    'nt-90': {
      id: 'nt-90',
      name: 'New Testament in 90 Days',
      description: 'Read the entire New Testament in 3 months',
      duration: 90,
      difficulty: 'moderate',
      dailyMinutes: 12,
      readings: generateNTIn90Days(),
      tags: ['new-testament', 'jesus', 'church']
    }
  };
  
  // Create directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'data', 'reading-plans');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save to file
  const outputPath = path.join(outputDir, 'plans.json');
  fs.writeFileSync(outputPath, JSON.stringify(plans, null, 2));
  
  // Generate statistics
  console.log('\n📊 Reading Plan Statistics:');
  console.log('=' .repeat(50));
  
  Object.entries(plans).forEach(([key, plan]) => {
    const totalPassages = plan.readings.reduce((sum, day) => sum + day.passages.length, 0);
    console.log(`\n📚 ${plan.name}:`);
    console.log(`   Duration: ${plan.duration} days`);
    console.log(`   Total readings: ${totalPassages} passages`);
    console.log(`   Average per day: ${(totalPassages / plan.duration).toFixed(1)} passages`);
    console.log(`   Daily time: ${plan.dailyMinutes} minutes`);
    console.log(`   Tags: ${plan.tags.join(', ')}`);
  });
  
  const totalReadings = Object.values(plans).reduce(
    (sum, plan) => sum + plan.readings.reduce((s, d) => s + d.passages.length, 0), 
    0
  );
  
  console.log('\n✅ Summary:');
  console.log(`   Total plans generated: ${Object.keys(plans).length}`);
  console.log(`   Total daily readings: ${totalReadings}`);
  console.log(`   Plans saved to: ${outputPath}`);
}

// Run the generator
generateAllPlans().catch(console.error);