import * as fs from 'fs';
import * as path from 'path';

interface ChapterStats {
  file: string;
  verses: number;
  sizeMB: number;
}

function analyzePerformance() {
  console.log('\n📊 Bible Data Performance Analysis');
  console.log('=' .repeat(50));
  
  const dataDir = path.join(process.cwd(), 'data', 'bible');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  const stats = {
    totalFiles: files.length,
    totalSizeMB: 0,
    largestChapter: { name: '', verses: 0, sizeMB: 0 },
    smallestChapter: { name: '', verses: Infinity, sizeMB: Infinity },
    averageVersesPerChapter: 0,
    chaptersOver100Verses: [] as ChapterStats[],
    chaptersOver50Verses: [] as ChapterStats[],
    totalVerses: 0,
    bookStats: new Map<string, { chapters: number; verses: number; sizeMB: number }>(),
  };
  
  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const stat = fs.statSync(filePath);
    const sizeMB = stat.size / 1024 / 1024;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const verseCount = data.verses?.length || 0;
    
    // Extract book name from filename
    const bookName = file.split('-').slice(0, -1).join('-');
    if (!stats.bookStats.has(bookName)) {
      stats.bookStats.set(bookName, { chapters: 0, verses: 0, sizeMB: 0 });
    }
    const bookStat = stats.bookStats.get(bookName)!;
    bookStat.chapters++;
    bookStat.verses += verseCount;
    bookStat.sizeMB += sizeMB;
    
    stats.totalSizeMB += sizeMB;
    stats.totalVerses += verseCount;
    
    if (verseCount > stats.largestChapter.verses) {
      stats.largestChapter = { name: file, verses: verseCount, sizeMB };
    }
    
    if (verseCount < stats.smallestChapter.verses && verseCount > 0) {
      stats.smallestChapter = { name: file, verses: verseCount, sizeMB };
    }
    
    if (verseCount > 100) {
      stats.chaptersOver100Verses.push({ file, verses: verseCount, sizeMB });
    } else if (verseCount > 50) {
      stats.chaptersOver50Verses.push({ file, verses: verseCount, sizeMB });
    }
  });
  
  stats.averageVersesPerChapter = Math.round(stats.totalVerses / files.length);
  
  // Sort chapters by verse count
  stats.chaptersOver100Verses.sort((a, b) => b.verses - a.verses);
  
  // Display results
  console.log('\n📈 Overall Statistics:');
  console.log(`├─ Total chapters: ${stats.totalFiles}`);
  console.log(`├─ Total verses: ${stats.totalVerses.toLocaleString()}`);
  console.log(`├─ Total size: ${stats.totalSizeMB.toFixed(2)} MB`);
  console.log(`├─ Average size per chapter: ${(stats.totalSizeMB / files.length).toFixed(3)} MB`);
  console.log(`└─ Average verses per chapter: ${stats.averageVersesPerChapter}`);
  
  console.log('\n📊 Chapter Size Distribution:');
  console.log(`├─ Largest: ${stats.largestChapter.name}`);
  console.log(`│  └─ ${stats.largestChapter.verses} verses (${(stats.largestChapter.sizeMB * 1024).toFixed(1)} KB)`);
  console.log(`├─ Smallest: ${stats.smallestChapter.name}`);
  console.log(`│  └─ ${stats.smallestChapter.verses} verses (${(stats.smallestChapter.sizeMB * 1024).toFixed(1)} KB)`);
  console.log(`├─ Chapters with >100 verses: ${stats.chaptersOver100Verses.length}`);
  console.log(`└─ Chapters with >50 verses: ${stats.chaptersOver50Verses.length + stats.chaptersOver100Verses.length}`);
  
  console.log('\n🏆 Top 5 Largest Chapters:');
  stats.chaptersOver100Verses.slice(0, 5).forEach((ch, i) => {
    const prefix = i === 4 ? '└─' : '├─';
    console.log(`${prefix} ${i + 1}. ${ch.file}: ${ch.verses} verses`);
  });
  
  // Find books with most chapters
  const bookArray = Array.from(stats.bookStats.entries())
    .sort((a, b) => b[1].chapters - a[1].chapters);
  
  console.log('\n📚 Top 5 Books by Chapter Count:');
  bookArray.slice(0, 5).forEach(([ book, data], i) => {
    const prefix = i === 4 ? '└─' : '├─';
    console.log(`${prefix} ${book}: ${data.chapters} chapters, ${data.verses.toLocaleString()} verses`);
  });
  
  // Memory usage estimates
  const estimatedMemoryUsage = stats.totalSizeMB * 2.5; // JSON parsing + React overhead
  console.log('\n💾 Memory Usage Estimates:');
  console.log(`├─ Raw data: ${stats.totalSizeMB.toFixed(2)} MB`);
  console.log(`├─ Parsed JSON in memory: ~${(stats.totalSizeMB * 2).toFixed(0)} MB`);
  console.log(`├─ With React components: ~${estimatedMemoryUsage.toFixed(0)} MB`);
  console.log(`└─ Peak usage (all loaded): ~${(estimatedMemoryUsage * 1.5).toFixed(0)} MB`);
  
  console.log('\n⚡ Performance Recommendations:');
  console.log('├─ ✅ Virtual scrolling for chapters > 50 verses');
  console.log('├─ ✅ Lazy load chapter data on navigation');
  console.log('├─ ✅ Use React.memo for verse components');
  console.log('├─ ✅ Implement search indexing with Web Workers');
  console.log('└─ ✅ Cache frequently accessed chapters');
  
  // Check specific large chapters
  console.log('\n🔍 Chapters Requiring Virtual Scrolling:');
  const largeChapters = stats.chaptersOver100Verses.slice(0, 10);
  largeChapters.forEach((ch, i) => {
    const prefix = i === largeChapters.length - 1 ? '└─' : '├─';
    console.log(`${prefix} ${ch.file.replace('.json', '')}: ${ch.verses} verses`);
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Analysis complete!');
}

// Run the analysis
analyzePerformance();