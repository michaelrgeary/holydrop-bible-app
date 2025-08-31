import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VerseService, POPULAR_VERSES } from '@/lib/services/verseService';
import { VerseCardCreator } from '@/components/sharing/VerseCardCreator';
import { ShareButtons } from '@/components/sharing/ShareButtons';
import { BookOpen, Heart, Share2, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface VersePageProps {
  params: Promise<{
    book: string;
    chapter: string;
    verse: string;
  }>;
}

// Pre-generate popular verses at build time
export async function generateStaticParams() {
  // Only generate the most popular verses to avoid excessive build time
  const topVerses = POPULAR_VERSES.slice(0, 25); // Top 25 verses
  
  return topVerses.map(verse => ({
    book: verse.book,
    chapter: verse.chapter.toString(),
    verse: verse.verse.toString(),
  }));
}

// ISR: Revalidate every hour for new verses
export const revalidate = 3600;

export async function generateMetadata({ params }: VersePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const book = resolvedParams.book;
  const chapter = parseInt(resolvedParams.chapter);
  const verse = parseInt(resolvedParams.verse);
  
  const verseService = VerseService.getInstance();
  const verseData = await verseService.getVerse(book, chapter, verse);
  const metadata = verseService.getVerseMetadata(book, chapter, verse);
  
  if (!verseData) {
    return {
      title: 'Verse Not Found - HolyDrop',
      description: 'The requested Bible verse could not be found.',
    };
  }
  
  const title = `${metadata.title} - ${verseData.reference} | HolyDrop`;
  const description = `"${verseData.text}" - Read, share, and reflect on ${verseData.reference}. Create beautiful verse cards and share inspiration with others.`;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://holydrop.com'}/verse/${book}/${chapter}/${verse}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: [
        {
          url: `/api/cards/generate?book=${book}&chapter=${chapter}&verse=${verse}&theme=ocean&format=landscape`,
          width: 1200,
          height: 630,
          alt: verseData.reference,
        },
      ],
      siteName: 'HolyDrop',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        `/api/cards/generate?book=${book}&chapter=${chapter}&verse=${verse}&theme=ocean&format=twitter`
      ],
      creator: '@holydrop',
      site: '@holydrop',
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    keywords: [
      'Bible verse',
      verseData.reference,
      metadata.theme,
      'scripture',
      'Christian',
      'faith',
      'inspiration',
      'Bible study',
      'devotional',
      verseData.book,
    ],
    authors: [{ name: 'HolyDrop' }],
    other: {
      'article:section': 'Bible Verses',
      'article:tag': metadata.theme,
    },
  };
}

export default async function VersePage({ params }: VersePageProps) {
  const resolvedParams = await params;
  const book = resolvedParams.book;
  const chapter = parseInt(resolvedParams.chapter);
  const verse = parseInt(resolvedParams.verse);
  
  if (isNaN(chapter) || isNaN(verse) || chapter < 1 || verse < 1) {
    notFound();
  }
  
  const verseService = VerseService.getInstance();
  const verseData = await verseService.getVerse(book, chapter, verse);
  const metadata = verseService.getVerseMetadata(book, chapter, verse);
  const relatedVerses = await verseService.getRelatedVerses(book, chapter, verse, 6);
  
  if (!verseData) {
    notFound();
  }
  
  // Get navigation verses
  const prevVerse = verse > 1 ? await verseService.getVerse(book, chapter, verse - 1) : null;
  const nextVerse = await verseService.getVerse(book, chapter, verse + 1);
  
  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: metadata.title,
    description: `"${verseData.text}" - ${verseData.reference}`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://holydrop.com'}/verse/${book}/${chapter}/${verse}`,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'HolyDrop',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HolyDrop',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://holydrop.com'}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://holydrop.com'}/verse/${book}/${chapter}/${verse}`,
    },
    about: [
      {
        '@type': 'Thing',
        name: 'Bible Verse',
      },
      {
        '@type': 'Thing',
        name: metadata.theme,
      },
    ],
    keywords: [
      'Bible verse',
      verseData.reference,
      metadata.theme,
      'scripture',
      'Christian faith',
    ],
  };
  
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-water-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-water-600 dark:hover:text-water-400">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href={`/${book}/${chapter}`} className="hover:text-water-600 dark:hover:text-water-400">
                {verseData.book} {chapter}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white">Verse {verse}</span>
            </nav>
            
            {/* Popular badge */}
            {metadata.isPopular && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium mb-4">
                <Heart className="w-3 h-3" />
                Popular Verse
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {metadata.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {verseData.reference}
            </p>
          </div>
          
          {/* Main Verse Display */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-water-500 mr-2" />
              <span className="text-water-600 dark:text-water-400 font-medium">
                {verseData.reference}
              </span>
            </div>
            
            <blockquote className="text-xl md:text-2xl leading-relaxed text-gray-900 dark:text-white font-serif italic mb-6">
              "{verseData.text}"
            </blockquote>
            
            <cite className="text-gray-600 dark:text-gray-400 font-medium">
              — {verseData.reference}
            </cite>
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {prevVerse ? (
                <Link
                  href={`/verse/${book}/${chapter}/${verse - 1}`}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-water-600 dark:hover:text-water-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous verse</span>
                  <span className="sm:hidden">Prev</span>
                </Link>
              ) : (
                <div></div>
              )}
              
              <Link
                href={`/${book}/${chapter}`}
                className="px-4 py-2 bg-water-100 dark:bg-water-900/30 text-water-700 dark:text-water-300 rounded-lg hover:bg-water-200 dark:hover:bg-water-900/50 transition-colors"
              >
                View Chapter
              </Link>
              
              {nextVerse ? (
                <Link
                  href={`/verse/${book}/${chapter}/${verse + 1}`}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-water-600 dark:hover:text-water-400 transition-colors"
                >
                  <span className="hidden sm:inline">Next verse</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          </div>
          
          {/* Sharing Section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <VerseCardCreator
                verse={{
                  ...verseData,
                  book,
                  chapter,
                  verseNumber: verse
                }}
              />
            </div>
            
            <div>
              <ShareButtons
                verse={{
                  book,
                  chapter,
                  verse,
                  text: verseData.text
                }}
                url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://holydrop.com'}/verse/${book}/${chapter}/${verse}`}
              />
            </div>
          </div>
          
          {/* Related Verses */}
          {relatedVerses.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Share2 className="w-5 h-5 text-water-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Related Verses
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {relatedVerses.map((relatedVerse, index) => (
                  <Link
                    key={index}
                    href={`/verse/${relatedVerse.book.toLowerCase().replace(/\s+/g, '-')}/${relatedVerse.chapter}/${relatedVerse.verse}`}
                    className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-sm text-water-600 dark:text-water-400 font-medium mb-2">
                      {relatedVerse.reference}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                      "{relatedVerse.text}"
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}