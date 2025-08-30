'use client';

import { useEffect, useState, useRef } from 'react';
import { VerseSearchResult, highlightSearchTerms } from '@/lib/search/flexsearch-setup';
import { BookName } from '@/lib/bible/books';

interface SearchResultsProps {
  results: VerseSearchResult[];
  suggestions: string[];
  searchQuery: string;
  onSelectResult: (book: BookName, chapter: number, verse?: number) => void;
  onSeeAll: () => void;
  onClose: () => void;
}

export function SearchResults({
  results,
  suggestions,
  searchQuery,
  onSelectResult,
  onSeeAll,
  onClose,
}: SearchResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Animate in
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            const result = results[selectedIndex];
            onSelectResult(result.book, result.chapter, result.verse);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, results, onSelectResult, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll('[data-result-item]');
      items[selectedIndex]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [selectedIndex]);

  return (
    <div
      className={`
        absolute top-full mt-2 w-full bg-white dark:bg-gray-900 
        rounded-lg shadow-2xl border border-water-200 dark:border-water-800
        overflow-hidden transition-all duration-300 z-50
        ${isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform -translate-y-4'
        }
      `}
    >
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  // Parse suggestion and navigate
                  const parts = suggestion.match(/(\w+)\s*(\d+)?:?(\d+)?/);
                  if (parts) {
                    // This is simplified - you'd need proper parsing
                    onSelectResult(suggestion as BookName, 1);
                  }
                }}
                className="px-3 py-1 text-sm bg-water-50 dark:bg-water-900/20 text-water-700 dark:text-water-300 rounded-full hover:bg-water-100 dark:hover:bg-water-800/30 transition-all hover:scale-105"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div 
        ref={resultsRef}
        className="max-h-96 overflow-y-auto"
      >
        {results.map((result, index) => {
          const isSelected = index === selectedIndex;
          const highlightedText = result.highlights 
            ? highlightSearchTerms(result.text, result.highlights)
            : result.text;

          return (
            <div
              key={`${result.book}-${result.chapter}-${result.verse}`}
              data-result-item
              onClick={() => onSelectResult(result.book, result.chapter, result.verse)}
              className={`
                px-4 py-3 cursor-pointer transition-all duration-200
                border-b border-gray-100 dark:border-gray-800 last:border-b-0
                ${isSelected 
                  ? 'bg-water-50 dark:bg-water-900/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }
                animate-in slide-in-from-top-2 fade-in duration-300
              `}
              style={{ animationDelay: `${index * 30}ms` }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* Water drop animation on hover */}
              <div className="relative">
                {isSelected && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                    <span className="text-water-500 animate-pulse">💧</span>
                  </div>
                )}
                
                {/* Reference */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-water-600 dark:text-water-400">
                    {result.book} {result.chapter}:{result.verse}
                  </span>
                </div>
                
                {/* Verse text with highlights */}
                <div 
                  className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </div>
              
              {/* Ripple effect on selection */}
              {isSelected && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-water-100/50 to-transparent dark:from-water-900/20 animate-shimmer" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* See All Results */}
      {results.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onSeeAll}
            className="w-full py-2 px-4 bg-gradient-to-r from-water-500 to-water-600 text-white font-medium rounded-lg hover:from-water-600 hover:to-water-700 transition-all transform hover:scale-[1.02]"
          >
            See all {results.length}+ results for "{searchQuery}"
          </button>
        </div>
      )}

      {/* No Results */}
      {results.length === 0 && suggestions.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-4xl mb-3">💧</div>
          <p className="text-gray-500 dark:text-gray-400">
            No results found for "{searchQuery}"
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Try different keywords or check spelling
          </p>
        </div>
      )}
    </div>
  );
}