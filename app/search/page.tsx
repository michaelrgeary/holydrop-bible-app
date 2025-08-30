'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchVerses, indexBibleVerses, highlightSearchTerms } from '@/lib/search/flexsearch-setup';
import { bookNameToUrl } from '@/lib/bible/books';
import { SearchBar } from '@/components/search/SearchBar';
import { OLD_TESTAMENT, NEW_TESTAMENT } from '@/lib/bible/books';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'old' | 'new'>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const resultsPerPage = 20;

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    
    // Initialize search index
    indexBibleVerses();
  }, []);

  // Perform search when query changes
  useEffect(() => {
    if (query) {
      performSearch(query);
      
      // Add to search history
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setCurrentPage(1);
    
    try {
      const searchResults = await searchVerses(searchQuery, {
        limit: 100, // Get more results for filtering
      });
      
      // Filter by testament
      let filteredResults = searchResults;
      if (filter === 'old') {
        filteredResults = searchResults.filter(r => 
          OLD_TESTAMENT.includes(r.book as any)
        );
      } else if (filter === 'new') {
        filteredResults = searchResults.filter(r => 
          NEW_TESTAMENT.includes(r.book as any)
        );
      }
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Paginate results
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );
  
  const totalPages = Math.ceil(results.length / resultsPerPage);

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Search the Scriptures
          </h1>
          <p className="text-gray-600">
            Find wisdom across the entire Bible
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar sticky={false} />
        </div>

        {/* Filters */}
        {query && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilter('all');
                  performSearch(query);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-water-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Books
              </button>
              <button
                onClick={() => {
                  setFilter('old');
                  performSearch(query);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'old'
                    ? 'bg-water-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Old Testament
              </button>
              <button
                onClick={() => {
                  setFilter('new');
                  performSearch(query);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'new'
                    ? 'bg-water-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                New Testament
              </button>
            </div>
            
            {results.length > 0 && (
              <p className="text-gray-600">
                Found {results.length} results for "{query}"
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-water-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Searching the scriptures...</p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && query && paginatedResults.length > 0 && (
          <div className="space-y-4 mb-8">
            {paginatedResults.map((result) => {
              const highlightedText = result.highlights 
                ? highlightSearchTerms(result.text, result.highlights)
                : result.text;

              return (
                <Link
                  key={`${result.book}-${result.chapter}-${result.verse}`}
                  href={`/${bookNameToUrl(result.book)}/${result.chapter}#verse-${result.verse}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 hover:border-water-300 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg font-semibold text-water-600 group-hover:text-water-700">
                      {result.book} {result.chapter}:{result.verse}
                    </span>
                    <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                      💧
                    </span>
                  </div>
                  
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                  />
                  
                  {/* Context (verses before/after) - simplified for now */}
                  <div className="mt-3 text-sm text-gray-500">
                    <span className="hover:text-water-600 cursor-pointer">
                      View in context →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💧</div>
            <p className="text-xl text-gray-600 mb-2">
              No results found for "{query}"
            </p>
            <p className="text-gray-500">
              Try different keywords or check your spelling
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-water-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-2">...</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-water-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {totalPages}
                </button>
              )}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Search History */}
        {!query && searchHistory.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Searches</h2>
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear history
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <Link
                  key={index}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-4 py-2 bg-water-50 text-water-700 rounded-full hover:bg-water-100 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-water-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}