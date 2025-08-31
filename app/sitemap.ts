import { MetadataRoute } from 'next';
import { POPULAR_VERSES } from '@/lib/services/verseService';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://holydrop.com';
  const currentDate = new Date().toISOString();
  
  const sitemap: MetadataRoute.Sitemap = [
    // Main pages (highest priority)
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/reading-plans`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    
    // Reading plans (medium-high priority)
    {
      url: `${baseUrl}/reading-plans/bible-in-year`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reading-plans/gospels-in-30`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reading-plans/peace-for-anxiety`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reading-plans/new-testament-90`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
  
  // Add popular verses (high priority for SEO)
  const popularVerses = POPULAR_VERSES.map(verse => ({
    url: `${baseUrl}/verse/${verse.book}/${verse.chapter}/${verse.verse}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
  
  sitemap.push(...popularVerses);
  
  // Add popular books (medium priority)
  const popularBooks = [
    { book: 'genesis', priority: 0.6 },
    { book: 'exodus', priority: 0.6 },
    { book: 'psalms', priority: 0.7 }, // Higher priority for Psalms
    { book: 'proverbs', priority: 0.7 },
    { book: 'matthew', priority: 0.7 },
    { book: 'mark', priority: 0.6 },
    { book: 'luke', priority: 0.6 },
    { book: 'john', priority: 0.7 }, // Higher priority for John
    { book: 'acts', priority: 0.6 },
    { book: 'romans', priority: 0.7 },
    { book: '1-corinthians', priority: 0.6 },
    { book: 'ephesians', priority: 0.6 },
    { book: 'philippians', priority: 0.6 },
    { book: 'colossians', priority: 0.6 },
    { book: 'hebrews', priority: 0.6 },
    { book: 'james', priority: 0.6 },
    { book: '1-peter', priority: 0.6 },
    { book: '1-john', priority: 0.6 },
    { book: 'revelation', priority: 0.6 },
  ];
  
  const bookPages = popularBooks.map(({ book, priority }) => ({
    url: `${baseUrl}/${book}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority,
  }));
  
  sitemap.push(...bookPages);
  
  // Add popular chapters (lower priority)
  const psalms = Array.from({ length: 150 }, (_, i) => ({
    url: `${baseUrl}/psalms/${i + 1}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: i < 10 ? 0.5 : 0.4, // First 10 Psalms get higher priority
  }));
    
  // Popular chapters from other books
  const otherChapters = [
    { book: 'genesis', chapter: 1, priority: 0.5 },
    { book: 'genesis', chapter: 2, priority: 0.5 },
    { book: 'genesis', chapter: 3, priority: 0.5 },
    { book: 'exodus', chapter: 20, priority: 0.5 }, // Ten Commandments
    { book: 'matthew', chapter: 5, priority: 0.5 }, // Sermon on the Mount
    { book: 'matthew', chapter: 6, priority: 0.5 }, // Lord's Prayer
    { book: 'matthew', chapter: 7, priority: 0.5 }, // Golden Rule
    { book: 'john', chapter: 3, priority: 0.6 }, // John 3:16
    { book: 'john', chapter: 14, priority: 0.5 }, // I am the way
    { book: 'romans', chapter: 8, priority: 0.5 }, // No condemnation
    { book: '1-corinthians', chapter: 13, priority: 0.5 }, // Love chapter
    { book: 'revelation', chapter: 21, priority: 0.5 }, // New Jerusalem
  ].map(item => ({
    url: `${baseUrl}/${item.book}/${item.chapter}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: item.priority,
  }));

  const popularChapters = [...psalms, ...otherChapters];
  
  sitemap.push(...popularChapters);
  
  // Add collections and themes (lower priority)
  const collections = [
    'comfort',
    'hope',
    'love',
    'peace',
    'strength',
    'faith',
    'courage',
    'guidance',
    'salvation',
    'forgiveness',
    'wisdom',
    'joy'
  ].map(collection => ({
    url: `${baseUrl}/collections/${collection}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }));
  
  sitemap.push(...collections);
  
  // Sort by priority (highest first) and then by URL for consistency
  return sitemap.sort((a, b) => {
    if (a.priority !== b.priority) {
      return (b.priority || 0) - (a.priority || 0);
    }
    return a.url.localeCompare(b.url);
  });
}