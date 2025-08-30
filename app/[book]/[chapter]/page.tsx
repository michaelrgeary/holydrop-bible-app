import { notFound } from 'next/navigation';
import Link from 'next/link';
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

  // Check if this is a long chapter (use virtualization for chapters with many verses)
  const useVirtualization = verses.length > 30;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2 text-blue-600">
            <li>
              <Link href="/" className="hover:text-blue-800 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <span className="text-gray-700">{bookInfo.name}</span>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <span className="text-gray-900 font-medium">Chapter {chapterNumber}</span>
            </li>
          </ol>
        </nav>

        {/* Chapter Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {bookInfo.name} {chapterNumber}
          </h1>
          <p className="text-gray-600">{bookInfo.testament}</p>
        </div>

        {/* Sticky Search Bar */}
        <div className="mb-8">
          <SearchBar 
            currentBook={bookInfo.name} 
            currentChapter={chapterNumber}
            sticky={true}
          />
        </div>

        {/* Chapter Navigation */}
        <div className="flex justify-between items-center mb-8">
          {prevChapter ? (
            <Link
              href={`/${bookNameToUrl(bookInfo.name)}/${prevChapter}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ← Chapter {prevChapter}
            </Link>
          ) : (
            <div />
          )}
          
          {nextChapter ? (
            <Link
              href={`/${bookNameToUrl(bookInfo.name)}/${nextChapter}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Chapter {nextChapter} →
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Chapter Content - Virtualized for performance */}
        <div className="mb-12" id="chapter-content">
          {useVirtualization ? (
            <VirtualizedChapterContent
              book={bookInfo.name}
              bookUrl={book}
              chapter={chapterNumber}
              verses={verses}
            />
          ) : (
            // Use regular ChapterContent for shorter chapters
            <VirtualizedChapterContent
              book={bookInfo.name}
              bookUrl={book}
              chapter={chapterNumber}
              verses={verses}
            />
          )}
        </div>

        {/* Bottom Chapter Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          {prevChapter ? (
            <Link
              href={`/${bookNameToUrl(bookInfo.name)}/${prevChapter}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ← Chapter {prevChapter}
            </Link>
          ) : (
            <div />
          )}
          
          {nextChapter ? (
            <Link
              href={`/${bookNameToUrl(bookInfo.name)}/${nextChapter}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Chapter {nextChapter} →
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}