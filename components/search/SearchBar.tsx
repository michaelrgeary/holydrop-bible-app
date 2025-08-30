'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { searchVerses, getAutocompleteSuggestions, indexBibleVerses } from '@/lib/search/flexsearch-setup';
import { BookName } from '@/lib/bible/books';
import { SearchResults } from './SearchResults';
import { bookNameToUrl } from '@/lib/bible/books';

interface SearchBarProps {
  currentBook?: BookName;
  currentChapter?: number;
  sticky?: boolean;
}

export function SearchBar({ 
  currentBook, 
  currentChapter, 
  sticky = true 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'chapter' | 'bible'>(
    currentBook && currentChapter ? 'chapter' : 'bible'
  );
  const [isFocused, setIsFocused] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Initialize search index on mount
  useEffect(() => {
    indexBibleVerses();
  }, []);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // "/" to focus search
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          inputRef.current?.focus();
        }
      }
      
      // Escape to close
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Get search results
      const searchResults = await searchVerses(searchQuery, {
        limit: 10,
        book: searchMode === 'chapter' ? currentBook : undefined,
        chapter: searchMode === 'chapter' ? currentChapter : undefined,
        currentChapterOnly: searchMode === 'chapter',
      });
      
      // Get autocomplete suggestions
      const autoSuggestions = await getAutocompleteSuggestions(searchQuery, 5);
      
      setResults(searchResults);
      setSuggestions(autoSuggestions);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBook, currentChapter, searchMode]);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Navigate to verse
  const navigateToVerse = (book: BookName, chapter: number, verse?: number) => {
    const url = `/${bookNameToUrl(book)}/${chapter}${verse ? `#verse-${verse}` : ''}`;
    router.push(url);
    setIsOpen(false);
    setQuery('');
  };

  // Navigate to search page
  const navigateToSearchPage = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
  };

  return (
    <div 
      ref={searchRef}
      className={`
        relative w-full max-w-2xl mx-auto
        ${sticky ? 'sticky top-20 z-30' : ''}
      `}
    >
      <div className={`
        relative bg-white dark:bg-gray-900 rounded-lg shadow-lg
        transition-all duration-300
        ${isFocused ? 'ring-2 ring-water-500 shadow-xl' : ''}
      `}>
        {/* Search Input */}
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              if (query) performSearch(query);
            }}
            placeholder="Search scriptures... (Press '/' to focus)"
            className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
          />
          
          {/* Search Mode Toggle */}
          {currentBook && currentChapter && (
            <button
              onClick={() => setSearchMode(searchMode === 'chapter' ? 'bible' : 'chapter')}
              className="px-3 py-1 mx-2 text-xs font-medium rounded-full bg-water-100 dark:bg-water-900/20 text-water-700 dark:text-water-300 hover:bg-water-200 dark:hover:bg-water-800/30 transition-colors"
            >
              {searchMode === 'chapter' ? 'This Chapter' : 'Whole Bible'}
            </button>
          )}
          
          {/* Search Button */}
          <button
            onClick={() => query && performSearch(query)}
            className="p-3 hover:bg-water-50 dark:hover:bg-water-900/20 rounded-r-lg transition-colors group"
          >
            <div className="relative">
              <span className="text-2xl group-hover:scale-110 transition-transform inline-block">
                💧
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-water-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </button>
        </div>
        
        {/* Quick Suggestions */}
        {isFocused && !query && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {['love', 'faith', 'hope', 'salvation', 'grace'].map(term => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    performSearch(term);
                  }}
                  className="px-2 py-1 text-xs bg-water-50 dark:bg-water-900/20 text-water-700 dark:text-water-300 rounded-full hover:bg-water-100 dark:hover:bg-water-800/30 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Water drop animation when focused */}
      {isFocused && (
        <div className="absolute -top-2 right-4 pointer-events-none">
          <div className="w-3 h-3 bg-water-500 rounded-full animate-water-drop opacity-60" />
        </div>
      )}
      
      {/* Search Results Dropdown */}
      {isOpen && (results.length > 0 || suggestions.length > 0) && (
        <SearchResults
          results={results}
          suggestions={suggestions}
          searchQuery={query}
          onSelectResult={navigateToVerse}
          onSeeAll={navigateToSearchPage}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}