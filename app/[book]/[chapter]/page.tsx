import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VerseService } from '@/lib/services/verseService';

interface ChapterPageProps {
  params: Promise<{
    book: string;
    chapter: string;
  }>;
}

// Helper functions for URL handling
function bookNameToUrl(bookName: string): string {
  return bookName.toLowerCase().replace(/\s+/g, '-');
}

function urlToBookName(url: string): string {
  return url.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const resolvedParams = await params;
  const { book, chapter } = resolvedParams;

  const bookName = urlToBookName(book);
  const chapterNumber = parseInt(chapter, 10);

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    notFound();
  }

  const verseService = VerseService.getInstance();
  
  // Get verses for the chapter
  const verses = [];
  let verseNum = 1;
  let hasMoreVerses = true;
  
  while (hasMoreVerses && verseNum <= 200) { // Limit to 200 verses per chapter
    const verse = await verseService.getVerse(bookName, chapterNumber, verseNum);
    if (verse) {
      verses.push({ verse: verseNum, text: verse.text });
      verseNum++;
    } else {
      hasMoreVerses = false;
    }
  }

  if (verses.length === 0) {
    notFound();
  }

  // Simple navigation logic
  const prevChapter = chapterNumber > 1 ? chapterNumber - 1 : null;
  const nextChapter = chapterNumber + 1; // We'll let the next chapter link fail if it doesn't exist

  // Breadcrumb paths
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: bookName, href: `/${book}/1` },
    { label: `Chapter ${chapterNumber}`, href: `/${book}/${chapterNumber}` },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-foreground font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Chapter Title */}
      <h1 className="text-3xl font-bold mb-8">{bookName} {chapterNumber}</h1>

      {/* Navigation Buttons */}
      <div className="flex justify-between mb-6">
        {prevChapter ? (
          <Button variant="outline" asChild>
            <Link href={`/${bookNameToUrl(bookName)}/${prevChapter}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Chapter {prevChapter}
            </Link>
          </Button>
        ) : (
          <div />
        )}
        
        <Button variant="outline" asChild>
          <Link href={`/${bookNameToUrl(bookName)}/${nextChapter}`}>
            Chapter {nextChapter}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Verses */}
      <div className="space-y-4">
        {verses.map((verse) => (
          <Card key={verse.verse} className="p-4">
            <p className="leading-relaxed">
              <span className="font-bold text-muted-foreground mr-2">
                {verse.verse}
              </span>
              <span className="text-foreground">
                {verse.text}
              </span>
            </p>
          </Card>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between mt-8 pt-8 border-t">
        {prevChapter ? (
          <Button variant="default" asChild>
            <Link href={`/${bookNameToUrl(bookName)}/${prevChapter}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Chapter
            </Link>
          </Button>
        ) : (
          <div />
        )}
        
        <Button variant="default" asChild>
          <Link href={`/${bookNameToUrl(bookName)}/${nextChapter}`}>
            Next Chapter
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}