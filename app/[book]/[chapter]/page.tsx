import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getBookInfo, bookNameToUrl } from '@/lib/bible/books';
import { getChapter } from '@/lib/bible/parser';
import { SearchBar } from '@/components/search/SearchBar';
import { VirtualizedChapterContent } from '@/components/bible/VirtualizedChapterContent';

interface ChapterPageProps {
  params: Promise<{
    book: string;
    chapter: string;
  }>;
}

export async function generateMetadata({ params }: ChapterPageProps) {
  const { book, chapter } = await params;
  
  const bookInfo = getBookInfo(book);
  if (!bookInfo) {
    return {
      title: 'Chapter Not Found - holydrop'
    };
  }

  const chapterNumber = parseInt(chapter, 10);
  
  return {
    title: `${bookInfo.name} ${chapterNumber} - holydrop`,
    description: `Read ${bookInfo.name} chapter ${chapterNumber} with community annotations and discussions.`
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { book, chapter } = await params;
  
  const bookInfo = getBookInfo(book);
  if (!bookInfo) {
    notFound();
  }

  const chapterNumber = parseInt(chapter, 10);
  if (isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > bookInfo.totalChapters) {
    notFound();
  }

  const verses = getChapter(bookInfo.name, chapterNumber);
  if (!verses || verses.length === 0) {
    notFound();
  }

  const prevChapter = chapterNumber > 1 ? chapterNumber - 1 : null;
  const nextChapter = chapterNumber < bookInfo.totalChapters ? chapterNumber + 1 : null;

  // Long chapters are handled by VirtualizedChapterContent component

  return (
    <div className="min-h-screen water-gradient-subtle animate-fade-in">
      <div className="container-width">
        {/* Modern Sticky Header with Blur Background */}
        <div className="sticky top-0 z-40 glass-morphism backdrop-blur-md border-b border-white/20">
          <div className="section-padding py-4">
            {/* Modern Breadcrumb */}
            <nav className="text-sm mb-4" aria-label="Breadcrumb">
              <div className="glass-morphism px-6 py-3 rounded-full backdrop-blur-md border border-white/20 inline-flex">
                <div className="flex items-center gap-3">
                  <Link href="/" className="text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 transition-colors duration-200 font-medium">
                    Home
                  </Link>
                  <div className="w-1 h-1 bg-water-400 rounded-full"></div>
                  <span className="text-water-600 dark:text-water-400 font-medium">{bookInfo.name}</span>
                  <div className="w-1 h-1 bg-water-400 rounded-full"></div>
                  <span className="text-gray-900 dark:text-white font-semibold">Chapter {chapterNumber}</span>
                </div>
              </div>
            </nav>

            {/* Chapter Title */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-holy mb-2 animate-slide-down">
                {bookInfo.name} {chapterNumber}
              </h1>
              <p className="text-water-600 dark:text-water-400 font-medium animate-slide-down" style={{animationDelay: '0.1s'}}>
                {bookInfo.testament}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="section-padding py-6">
          <div className="max-w-2xl mx-auto animate-slide-up">
            <SearchBar 
              currentBook={bookInfo.name} 
              currentChapter={chapterNumber}
              sticky={false}
            />
          </div>
        </div>

        {/* Enhanced Chapter Navigation */}
        <div className="section-padding">
          <div className="flex justify-between items-center mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
            {prevChapter ? (
              <Link
                href={`/${bookNameToUrl(bookInfo.name)}/${prevChapter}`}
                className="btn-glass group water-drop-button flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-water-500" />
                <span className="font-medium">Chapter {prevChapter}</span>
              </Link>
            ) : (
              <div />
            )}
            
            {nextChapter ? (
              <Link
                href={`/${bookNameToUrl(bookInfo.name)}/${nextChapter}`}
                className="btn-glass group water-drop-button flex items-center gap-2"
              >
                <span className="font-medium">Chapter {nextChapter}</span>
                <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-water-500" />
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Chapter Content with Enhanced Styling */}
          <div className="glass-morphism rounded-2xl p-4 md:p-6 shadow-xl animate-slide-up" style={{animationDelay: '0.3s'}} id="chapter-content">
            <div className="prose prose-lg max-w-none">
              <VirtualizedChapterContent
                book={bookInfo.name}
                bookUrl={book}
                chapter={chapterNumber}
                verses={verses}
              />
            </div>
          </div>

          {/* Bottom Chapter Navigation with Enhanced Styling */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-water-200/30 dark:border-water-700/30 animate-slide-up" style={{animationDelay: '0.4s'}}>
            {prevChapter ? (
              <Link
                href={`/${bookNameToUrl(bookInfo.name)}/${prevChapter}`}
                className="btn-holy group flex items-center gap-3"
              >
                <ArrowLeft className="w-5 h-5 transition-all duration-300 group-hover:-translate-x-2" />
                <span className="font-semibold">Previous Chapter</span>
              </Link>
            ) : (
              <div />
            )}
            
            {nextChapter ? (
              <Link
                href={`/${bookNameToUrl(bookInfo.name)}/${nextChapter}`}
                className="btn-holy group flex items-center gap-3"
              >
                <span className="font-semibold">Next Chapter</span>
                <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-2" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}