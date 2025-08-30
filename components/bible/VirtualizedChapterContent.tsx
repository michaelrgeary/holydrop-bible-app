'use client';

import { useState, useCallback, memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import dynamic from 'next/dynamic';
import { VerseDisplay } from './VerseDisplay';
import { 
  useChapterAnnotations, 
  useVerseAnnotations,
  useCreateAnnotation,
  useVoteAnnotation 
} from '@/hooks/useAnnotations';
import { formatReference } from '@/lib/bible/parser';
import { BookName } from '@/lib/bible/books';

// Lazy load the annotation sidebar for better performance
const AnnotationSidebar = dynamic(
  () => import('@/components/annotation/AnnotationSidebar').then(mod => ({ 
    default: mod.AnnotationSidebar 
  })),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-water-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Loading annotations...</p>
        </div>
      </div>
    ),
  }
);

interface Verse {
  verse: number;
  text: string;
}

interface VirtualizedChapterContentProps {
  book: BookName;
  bookUrl: string;
  chapter: number;
  verses: Verse[];
}

// Memoized verse item component
const VerseMemo = memo(({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: any 
}) => {
  const { 
    verses, 
    verseCounts, 
    handleShowAnnotations, 
    handleAddAnnotation 
  } = data;
  
  const verse = verses[index];
  if (!verse) return null;

  return (
    <div style={style} className="px-4">
      <VerseDisplay
        verseNumber={verse.verse}
        text={verse.text}
        annotationsCount={verseCounts[verse.verse] || 0}
        hasAnnotations={(verseCounts[verse.verse] || 0) > 0}
        onShowAnnotations={() => handleShowAnnotations(verse.verse)}
        onAddAnnotation={() => handleAddAnnotation(verse.verse)}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.index === nextProps.index &&
    prevProps.data.verseCounts[prevProps.data.verses[prevProps.index]?.verse] === 
    nextProps.data.verseCounts[nextProps.data.verses[nextProps.index]?.verse]
  );
});

VerseMemo.displayName = 'VerseMemo';

// Loading skeleton for verses
const VerseSkeleton = () => (
  <div className="p-4 rounded-lg bg-white animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-8 h-6 bg-gray-200 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  </div>
);

export function VirtualizedChapterContent({ 
  book, 
  bookUrl, 
  chapter, 
  verses 
}: VirtualizedChapterContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  
  // Fetch annotations for the chapter
  const { verseCounts, loading: annotationsLoading } = useChapterAnnotations(bookUrl, chapter);
  
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
      await verseAnnotations.refetch();
    } catch (error) {
      console.error('Failed to create annotation:', error);
    }
  };

  const handleVote = async (annotationId: string, vote: 'up' | 'down') => {
    try {
      await voteAnnotation(annotationId, vote);
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

  // Memoize the item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    verses,
    verseCounts,
    handleShowAnnotations,
    handleAddAnnotation,
  }), [verses, verseCounts, handleShowAnnotations, handleAddAnnotation]);

  // Calculate list height
  const getListHeight = () => {
    if (typeof window === 'undefined') return 600;
    // Account for header, navigation, etc.
    return window.innerHeight - 300;
  };

  if (annotationsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <VerseSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Virtualized Verses List */}
      <List
        height={getListHeight()}
        itemCount={verses.length}
        itemSize={100} // Estimated height per verse
        width="100%"
        itemData={itemData}
        overscanCount={5} // Render 5 extra items outside viewport
        className="scrollbar-thin scrollbar-thumb-water-400 scrollbar-track-gray-100"
      >
        {VerseMemo}
      </List>

      {/* Annotation Sidebar (Lazy Loaded) */}
      {sidebarOpen && (
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
      )}
    </div>
  );
}