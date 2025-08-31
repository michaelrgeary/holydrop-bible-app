import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VerseService, POPULAR_VERSES } from '@/lib/services/verseService';
import { VerseCardCreator } from '@/components/sharing/VerseCardCreator';
import { ShareButtons } from '@/components/sharing/ShareButtons';
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
      
      <div className="min-h-screen water-gradient-subtle animate-fade-in">
        <div className="container-width section-padding">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-down">
            {/* Modern Breadcrumb */}
            <nav className="flex items-center justify-center text-sm mb-6" aria-label="Breadcrumb">
              <div className="glass-morphism px-6 py-3 rounded-full backdrop-blur-md border border-white/20">
                <div className="flex items-center gap-3">
                  <Link href="/" className="text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 transition-colors duration-200 font-medium">
                    Home
                  </Link>
                  <div className="w-1 h-1 bg-water-400 rounded-full"></div>
                  <Link href={`/${book}/${chapter}`} className="text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 transition-colors duration-200 font-medium">
                    {verseData.book} {chapter}
                  </Link>
                  <div className="w-1 h-1 bg-water-400 rounded-full"></div>
                  <span className="text-gray-900 dark:text-white font-semibold">Verse {verse}</span>
                </div>
              </div>
            </nav>
            
            {/* Popular badge with holy glow */}
            {metadata.isPopular && (
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-morphism holy-glow-subtle text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-semibold mb-6 animate-pulse-water">
                <Heart className="w-4 h-4" />
                Popular Verse
              </div>
            )}
            
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-gradient-holy mb-4 animate-slide-down" style={{animationDelay: '0.1s'}}>
              {metadata.title}
            </h1>
            <p className="text-xl md:text-2xl text-water-600 dark:text-water-400 font-medium animate-slide-down" style={{animationDelay: '0.2s'}}>
              {verseData.reference}
            </p>
          </div>
          
          {/* Main Verse Display - Glass Morphism Card */}
          <div className="mb-12 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="glass-morphism rounded-3xl p-8 md:p-12 text-center shadow-2xl holy-glow-subtle hover:shadow-3xl transition-all duration-500 group">
              {/* Floating verse number with water theme */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="water-gradient text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg animate-bounce-gentle">
                  {verse}
                </div>
              </div>
              
              {/* Reference and theme badge */}
              <div className="flex items-center justify-center mb-8 mt-4">
                <div className="flex items-center gap-3 glass-morphism px-4 py-2 rounded-full">
                  <BookOpen className="w-5 h-5 text-water-500" />
                  <span className="text-water-700 dark:text-water-300 font-semibold">
                    {verseData.reference}
                  </span>
                  {metadata.theme && (
                    <Badge className="water-gradient text-white border-0 ml-2">
                      {metadata.theme}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Main verse text with elegant typography */}
              <blockquote className="verse-text text-2xl md:text-3xl lg:text-4xl leading-relaxed text-gray-800 dark:text-gray-100 mb-8 relative px-4 md:px-8">
                <div className="absolute -left-2 md:-left-4 -top-4 text-6xl md:text-8xl text-water-200 dark:text-water-700 font-serif opacity-50 animate-fade-in">"</div>
                <span className="relative z-10 inline-block group-hover:text-gradient-holy transition-all duration-700">
                  {verseData.text}
                </span>
                <div className="absolute -right-2 md:-right-4 -bottom-8 text-6xl md:text-8xl text-water-200 dark:text-water-700 font-serif opacity-50 animate-fade-in" style={{animationDelay: '0.5s'}}>"</div>
              </blockquote>
              
              <cite className="text-water-600 dark:text-water-400 font-semibold text-lg">
                — {verseData.reference}
              </cite>
              
              {/* Enhanced Navigation */}
              <div className="flex items-center justify-between mt-10 pt-8 border-t border-water-200/30 dark:border-water-700/30">
                {prevVerse ? (
                  <Button variant="ghost" className="btn-glass group water-drop-button" asChild>
                    <Link href={`/verse/${book}/${chapter}/${verse - 1}`}>
                      <ArrowLeft className="w-5 h-5 mr-2 transition-all duration-300 group-hover:-translate-x-2 group-hover:text-water-500" />
                      <span className="hidden sm:inline font-medium">Previous Verse</span>
                      <span className="sm:hidden font-medium">Prev</span>
                    </Link>
                  </Button>
                ) : (
                  <div></div>
                )}
                
                <Button className="btn-holy group relative overflow-hidden" asChild>
                  <Link href={`/${book}/${chapter}`}>
                    <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative z-10">View Chapter</span>
                  </Link>
                </Button>
                
                {nextVerse ? (
                  <Button variant="ghost" className="btn-glass group water-drop-button" asChild>
                    <Link href={`/verse/${book}/${chapter}/${verse + 1}`}>
                      <span className="hidden sm:inline font-medium">Next Verse</span>
                      <span className="sm:hidden font-medium">Next</span>
                      <ArrowRight className="w-5 h-5 ml-2 transition-all duration-300 group-hover:translate-x-2 group-hover:text-water-500" />
                    </Link>
                  </Button>
                ) : (
                  <div></div>
                )}
              </div>
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
          
          {/* Related Verses - Modern Glass Cards */}
          {relatedVerses.length > 0 && (
            <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
              <div className="glass-morphism rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 glass-morphism px-6 py-3 rounded-full">
                    <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                    <h2 className="text-xl font-bold text-gradient-holy">Related Verses</h2>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedVerses.map((relatedVerse, index) => (
                    <div 
                      key={index} 
                      className="glass-morphism-hover rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:holy-glow-subtle group animate-fade-in"
                      style={{animationDelay: `${0.1 * index}s`}}
                    >
                      <Link
                        href={`/verse/${relatedVerse.book.toLowerCase().replace(/\s+/g, '-')}/${relatedVerse.chapter}/${relatedVerse.verse}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="water-gradient text-white border-0 px-3 py-1 text-xs font-semibold">
                            {relatedVerse.reference}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-water-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                        
                        <blockquote className="verse-text text-base text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-3 group-hover:text-water-700 dark:group-hover:text-water-300 transition-colors duration-300">
                          "{relatedVerse.text}"
                        </blockquote>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}