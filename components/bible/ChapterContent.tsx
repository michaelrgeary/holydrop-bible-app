'use client';

import { useState, useCallback } from 'react';
import { VerseDisplay } from './VerseDisplay';
import { VirtualVerseList } from './VirtualVerseList';
import { AnnotationSidebar } from '@/components/annotation/AnnotationSidebar';
import { 
  useChapterAnnotations, 
  useVerseAnnotations,
  useCreateAnnotation,
  useVoteAnnotation 
} from '@/hooks/useAnnotations';
import { formatReference } from '@/lib/bible/parser';
import { BookName } from '@/lib/bible/books';

interface Verse {
  verse: number;
  text: string;
}

interface ChapterContentProps {
  book: BookName;
  bookUrl: string;
  chapter: number;
  verses: Verse[];
}

export function ChapterContent({ book, bookUrl, chapter, verses }: ChapterContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  
  // Fetch annotations for the chapter
  const { verseCounts } = useChapterAnnotations(bookUrl, chapter);
  
  // Hooks for selected verse
  const verseAnnotations = useVerseAnnotations(
    bookUrl,
    chapter,
    selectedVerse || 1
  );
  
  const { createAnnotation } = useCreateAnnotation(bookUrl, chapter);
  const { voteAnnotation } = useVoteAnnotation(bookUrl, chapter);
  
  // Check if user is logged in (mock for now)
  const isLoggedIn = typeof window !== 'undefined' && 
    localStorage.getItem('isLoggedIn') === 'true';

  const handleShowAnnotations = useCallback((verseNumber: number) => {
    setSelectedVerse(verseNumber);
    setSidebarOpen(true);
    // Fetch annotations for this specific verse
    verseAnnotations.refetch();
  }, [verseAnnotations]);

  const handleAddAnnotation = useCallback((verseNumber: number) => {
    setSelectedVerse(verseNumber);
    setSidebarOpen(true);
  }, []);

  const handleCreateAnnotation = async (text: string) => {
    if (!selectedVerse) return;
    
    try {
      await createAnnotation(text, selectedVerse);
      // Refetch annotations after creating
      await verseAnnotations.refetch();
    } catch (error) {
      console.error('Failed to create annotation:', error);
    }
  };

  const handleVote = async (annotationId: string, vote: 'up' | 'down') => {
    try {
      await voteAnnotation(annotationId, vote);
      // Refetch to get updated vote counts
      await verseAnnotations.refetch();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedVerse(null);
  };

  const verseRef = selectedVerse 
    ? formatReference(book, chapter, selectedVerse)
    : `${book} ${chapter}`;

  // Use virtual scrolling for large chapters (> 50 verses)
  const useVirtualScroll = verses.length > 50;

  return (
    <div className="relative">
      {/* Verses */}
      {useVirtualScroll ? (
        <div className="h-[600px] border rounded-lg bg-white dark:bg-gray-900">
          <VirtualVerseList
            verses={verses}
            onVerseClick={(verseNumber) => handleShowAnnotations(verseNumber)}
            selectedVerse={selectedVerse || undefined}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {verses.map((verse) => (
            <VerseDisplay
              key={verse.verse}
              verseNumber={verse.verse}
              text={verse.text}
            annotationsCount={verseCounts[verse.verse] || 0}
            hasAnnotations={(verseCounts[verse.verse] || 0) > 0}
            onShowAnnotations={() => handleShowAnnotations(verse.verse)}
            onAddAnnotation={() => handleAddAnnotation(verse.verse)}
          />
        ))}
        </div>
      )}

      {/* Annotation Sidebar */}
      <AnnotationSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        verseRef={verseRef}
        verseText={selectedVerse ? verses.find(v => v.verse === selectedVerse)?.text || '' : ''}
        book={book}
        chapter={chapter}
        verse={selectedVerse || 1}
        annotations={verseAnnotations.annotations}
        isLoggedIn={isLoggedIn}
        onCreateAnnotation={handleCreateAnnotation}
        onVote={handleVote}
      />
    </div>
  );
}