'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualVerseListProps {
  verses: Array<{ verse: number; text: string }>;
  onVerseClick: (verse: number) => void;
  selectedVerse?: number;
  searchTerms?: string[];
}

export function VirtualVerseList({ 
  verses, 
  onVerseClick, 
  selectedVerse,
  searchTerms = []
}: VirtualVerseListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: verses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimate verse height
    overscan: 5, // Render 5 extra items outside viewport
  });

  const highlightText = (text: string) => {
    if (!searchTerms || searchTerms.length === 0) return text;
    
    let highlightedText = text;
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-water-200 dark:bg-water-700">$1</mark>'
      );
    });
    return highlightedText;
  };

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const verse = verses[virtualItem.index];
          const isSelected = selectedVerse === verse.verse;
          
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div
                className={`
                  verse-text cursor-pointer p-4 transition-colors
                  ${isSelected 
                    ? 'bg-water-100 dark:bg-water-800 border-l-4 border-water-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
                onClick={() => onVerseClick(verse.verse)}
                data-verse={verse.verse}
              >
                <span className="verse-number font-bold text-water-600 dark:text-water-400 mr-2">
                  {verse.verse}
                </span>
                <span 
                  className="text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(verse.text) 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}