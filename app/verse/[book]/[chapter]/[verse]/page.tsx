import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VerseService, POPULAR_VERSES } from '@/lib/services/verseService';
import { VerseCardCreator } from '@/components/sharing/VerseCardCreator';
import { ShareButtons } from '@/components/sharing/ShareButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
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
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-blue-600 font-medium">
                  {verseData.reference}
                </span>
                {metadata.theme && (
                  <Badge variant="secondary" className="ml-3">
                    {metadata.theme}
                  </Badge>
                )}
              </div>
              
              <blockquote className="text-xl md:text-2xl leading-relaxed text-slate-700 font-serif italic mb-6 relative">
                <div className="absolute -left-4 -top-2 text-6xl text-blue-200 font-serif">"</div>
                {verseData.text}
                <div className="absolute -right-4 -bottom-6 text-6xl text-blue-200 font-serif">"</div>
              </blockquote>
              
              <cite className="text-slate-600 font-medium">
                — {verseData.reference}
              </cite>
              
              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                {prevVerse ? (
                  <Button variant="ghost" className="group" asChild>
                    <Link href={`/verse/${book}/${chapter}/${verse - 1}`}>
                      <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Link>
                  </Button>
                ) : (
                  <div></div>
                )}
                
                <Button variant="outline" asChild>
                  <Link href={`/${book}/${chapter}`}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Chapter
                  </Link>
                </Button>
                
                {nextVerse ? (
                  <Button variant="ghost" className="group" asChild>
                    <Link href={`/verse/${book}/${chapter}/${verse + 1}`}>
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                ) : (
                  <div></div>
                )}
              </div>
            </CardContent>
          </Card>
          
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
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Related Verses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {relatedVerses.map((relatedVerse, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Link
                          href={`/verse/${relatedVerse.book.toLowerCase().replace(/\s+/g, '-')}/${relatedVerse.chapter}/${relatedVerse.verse}`}
                          className="block"
                        >
                          <Badge variant="outline" className="mb-3 text-xs">
                            {relatedVerse.reference}
                          </Badge>
                          <p className="text-slate-700 text-sm leading-relaxed line-clamp-3">
                            "{relatedVerse.text}"
                          </p>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}