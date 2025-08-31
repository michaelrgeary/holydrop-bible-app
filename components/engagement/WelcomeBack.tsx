'use client';

import { useState, useEffect } from 'react';
import { Heart, BookOpen, Calendar, TrendingUp, X, ChevronRight } from 'lucide-react';

interface WelcomeBackProps {
  onDismiss?: () => void;
}

export function WelcomeBack({ onDismiss }: WelcomeBackProps) {
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [userStats, setUserStats] = useState({
    daysAway: 0,
    lastVerse: null as string | null,
    readingStreak: 0,
    totalVerses: 0,
    favoriteBook: null as string | null
  });

  useEffect(() => {
    const checkReturningUser = () => {
      const lastVisit = localStorage.getItem('last_visit');
      const currentTime = Date.now();
      
      if (lastVisit) {
        const timeSinceLastVisit = currentTime - parseInt(lastVisit);
        const daysAway = Math.floor(timeSinceLastVisit / (1000 * 60 * 60 * 24));
        
        // Show welcome back if user was away for 3+ days but less than 30 days
        if (daysAway >= 3 && daysAway <= 30) {
          // Check if we've shown welcome back recently
          const lastWelcomeBack = localStorage.getItem('last_welcome_back');
          const daysSinceWelcome = lastWelcomeBack 
            ? Math.floor((currentTime - parseInt(lastWelcomeBack)) / (1000 * 60 * 60 * 24))
            : Infinity;
          
          if (daysSinceWelcome > 7) { // Only show once per week
            loadUserStats(daysAway);
            setShowWelcomeBack(true);
            localStorage.setItem('last_welcome_back', currentTime.toString());
          }
        }
      }

      // Update last visit time
      localStorage.setItem('last_visit', currentTime.toString());
    };

    const loadUserStats = (daysAway: number) => {
      try {
        // Get reading history
        const readingHistory = JSON.parse(localStorage.getItem('reading_history') || '[]');
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        // const readingProgress = JSON.parse(localStorage.getItem('reading_progress') || '{}');
        
        // Calculate stats
        const totalVerses = readingHistory.length || bookmarks.length || 0;
        const streak = calculateReadingStreak(readingHistory);
        const lastVerse = getLastReadVerse(readingHistory);
        const favoriteBook = getFavoriteBook(readingHistory, bookmarks);

        setUserStats({
          daysAway,
          lastVerse,
          readingStreak: streak,
          totalVerses,
          favoriteBook
        });
      } catch (error) {
        console.error('Failed to load user stats:', error);
        setUserStats(prev => ({ ...prev, daysAway }));
      }
    };

    // Delay check to avoid showing immediately on page load
    setTimeout(checkReturningUser, 2000);
  }, []);

  const calculateReadingStreak = (history: any[]): number => {
    if (!history.length) return 0;
    
    // Sort by date
    const sorted = history
      .map(h => new Date(h.timestamp || h.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const daysBetween = Math.floor(
        (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysBetween <= 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getLastReadVerse = (history: any[]): string | null => {
    if (!history.length) return null;
    const latest = history.sort((a, b) => 
      new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime()
    )[0];
    return latest.reference || latest.verse || null;
  };

  const getFavoriteBook = (history: any[], bookmarks: any[]): string | null => {
    const allRefs = [
      ...history.map(h => h.reference || h.verse || ''),
      ...bookmarks
    ];
    
    const bookCounts: Record<string, number> = {};
    allRefs.forEach(ref => {
      if (ref) {
        const book = ref.split(/\s+/)[0]?.toLowerCase();
        if (book) {
          bookCounts[book] = (bookCounts[book] || 0) + 1;
        }
      }
    });
    
    const topBook = Object.entries(bookCounts)
      .sort(([, a], [, b]) => b - a)[0];
    
    return topBook ? capitalizeFirstLetter(topBook[0]) : null;
  };

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleDismiss = () => {
    setShowWelcomeBack(false);
    onDismiss?.();
  };

  const getSuggestions = () => {
    const suggestions = [];
    
    if (userStats.lastVerse) {
      suggestions.push({
        title: 'Continue Where You Left Off',
        description: `Return to ${userStats.lastVerse}`,
        action: () => {
          const verse = userStats.lastVerse!.toLowerCase().replace(/\s+/g, '-');
          window.location.href = `/verse/${verse}`;
        },
        icon: <BookOpen className="w-5 h-5" />
      });
    }
    
    if (userStats.favoriteBook) {
      suggestions.push({
        title: `Explore More of ${userStats.favoriteBook}`,
        description: 'Discover new verses in your favorite book',
        action: () => window.location.href = `/${userStats.favoriteBook!.toLowerCase()}`,
        icon: <Heart className="w-5 h-5" />
      });
    }
    
    suggestions.push({
      title: 'Start a New Reading Plan',
      description: 'Begin fresh with a structured reading journey',
      action: () => window.location.href = '/reading-plans',
      icon: <Calendar className="w-5 h-5" />
    });

    if (userStats.readingStreak > 0) {
      suggestions.push({
        title: 'Rebuild Your Reading Streak',
        description: `Your last streak was ${userStats.readingStreak} days`,
        action: () => window.location.href = '/reading-plans',
        icon: <TrendingUp className="w-5 h-5" />
      });
    }
    
    return suggestions.slice(0, 3);
  };

  if (!showWelcomeBack) return null;

  const suggestions = getSuggestions();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-water-500 to-blue-600 p-6 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome Back!</h2>
              <p className="text-white/90 text-sm">
                It's been {userStats.daysAway} day{userStats.daysAway !== 1 ? 's' : ''} since your last visit
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {(userStats.totalVerses > 0 || userStats.readingStreak > 0 || userStats.favoriteBook) && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
              Your Progress
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {userStats.totalVerses > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-water-600 dark:text-water-400">
                    {userStats.totalVerses}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Verses Read
                  </div>
                </div>
              )}
              
              {userStats.readingStreak > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {userStats.readingStreak}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Day Streak
                  </div>
                </div>
              )}
              
              {userStats.favoriteBook && (
                <div className="text-center">
                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400 truncate">
                    {userStats.favoriteBook}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Favorite Book
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pick up where you left off
          </h3>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={suggestion.action}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-water-300 dark:hover:border-water-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left group"
              >
                <div className="text-water-600 dark:text-water-400 group-hover:scale-110 transition-transform">
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-water-500 transition-colors" />
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              We're glad you're back! Let's continue your spiritual journey together.
            </p>
            
            <button
              onClick={handleDismiss}
              className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}