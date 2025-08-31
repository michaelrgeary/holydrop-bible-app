'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Bookmark, 
  CheckCircle, 
  ChevronRight, 
  Star,
  Trophy,
  X
} from 'lucide-react';
import Link from 'next/link';

interface FirstAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  completed: boolean;
  priority: number;
}

export function FirstActions() {
  const [actions, setActions] = useState<FirstAction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // Check if user is new (has completed onboarding recently)
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    const hasVisited = localStorage.getItem('has_visited');
    const completedActions = JSON.parse(localStorage.getItem('completed_first_actions') || '[]');

    if (hasVisited && onboardingCompleted && completedActions.length < 3) {
      const completedSet = new Set(completedActions);
      
      const availableActions: FirstAction[] = [
        {
          id: 'search-love',
          title: 'Try Your First Search',
          description: 'Search for "love" to discover beautiful verses about God\'s love',
          icon: <Search className="w-5 h-5" />,
          action: () => performSearch('love'),
          completed: completedSet.has('search-love'),
          priority: 1
        },
        {
          id: 'browse-psalms',
          title: 'Explore Psalms',
          description: 'Browse the most beloved book of the Bible',
          icon: <BookOpen className="w-5 h-5" />,
          action: () => window.location.href = '/psalms',
          completed: completedSet.has('browse-psalms'),
          priority: 2
        },
        {
          id: 'bookmark-verse',
          title: 'Bookmark a Favorite',
          description: 'Save John 3:16, one of the most famous verses',
          icon: <Bookmark className="w-5 h-5" />,
          action: () => bookmarkVerse('john', 3, 16),
          completed: completedSet.has('bookmark-verse'),
          priority: 3
        },
        {
          id: 'start-reading-plan',
          title: 'Start a Reading Plan',
          description: 'Begin a 7-day journey through key Bible stories',
          icon: <BookOpen className="w-5 h-5" />,
          action: () => window.location.href = '/reading-plans',
          completed: completedSet.has('start-reading-plan'),
          priority: 4
        },
        {
          id: 'share-verse',
          title: 'Create Your First Verse Card',
          description: 'Share an inspiring verse with beautiful design',
          icon: <Star className="w-5 h-5" />,
          action: () => window.location.href = '/john/3/16',
          completed: completedSet.has('share-verse'),
          priority: 5
        }
      ];

      setActions(availableActions.sort((a, b) => a.priority - b.priority));
      setCompletedCount(completedActions.length);
      setShowSuggestions(true);
    }
  }, []);

  const performSearch = (query: string) => {
    // Focus search input and fill it
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = query;
      searchInput.focus();
      searchInput.form?.dispatchEvent(new Event('submit'));
    } else {
      // Fallback to navigation
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
    markActionCompleted('search-love');
  };

  const bookmarkVerse = (book: string, chapter: number, verse: number) => {
    // Simulate bookmarking
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const verseKey = `${book}-${chapter}-${verse}`;
    
    if (!bookmarks.includes(verseKey)) {
      bookmarks.push(verseKey);
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
    
    // Navigate to the verse
    window.location.href = `/john/3/16`;
    markActionCompleted('bookmark-verse');
  };

  const markActionCompleted = (actionId: string) => {
    const completed = JSON.parse(localStorage.getItem('completed_first_actions') || '[]');
    if (!completed.includes(actionId)) {
      completed.push(actionId);
      localStorage.setItem('completed_first_actions', JSON.stringify(completed));
      
      setActions(prev => prev.map(action => 
        action.id === actionId ? { ...action, completed: true } : action
      ));
      setCompletedCount(prev => prev + 1);

      // Celebrate completion
      if (completed.length >= 3) {
        setTimeout(() => {
          setShowCelebration(true);
        }, 500);
      }
    }
  };

  const [showCelebration, setShowCelebration] = useState(false);

  const handleDismiss = () => {
    setShowSuggestions(false);
    localStorage.setItem('first_actions_dismissed', 'true');
  };

  if (!showSuggestions || actions.length === 0) {
    return null;
  }

  const incompleteActions = actions.filter(action => !action.completed).slice(0, 3);

  return (
    <>
      {/* First Actions Suggestions */}
      <div className="bg-gradient-to-r from-water-50 to-blue-50 dark:from-water-900/20 dark:to-blue-900/20 border border-water-200 dark:border-water-800 rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-water-500 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Get Started with HolyDrop
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete these actions to discover key features ({completedCount}/3)
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss suggestions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round((completedCount / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-water-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {incompleteActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-water-300 dark:hover:border-water-600 hover:shadow-sm transition-all text-left group"
            >
              <div className="flex-shrink-0">
                {action.completed ? (
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-water-100 dark:group-hover:bg-water-900/30 group-hover:text-water-600 dark:group-hover:text-water-400 transition-colors">
                    {action.icon}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-water-500 transition-colors" />
            </button>
          ))}
        </div>

        {completedCount > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Great job! You've completed {completedCount} out of 3 getting-started actions.
            </p>
          </div>
        )}
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Congratulations! 🎉
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've completed the getting-started actions! You're now ready to explore 
              everything HolyDrop has to offer.
            </p>

            <div className="space-y-3">
              <Link
                href="/reading-plans"
                className="block w-full py-3 bg-water-600 text-white rounded-lg hover:bg-water-700 transition-colors"
                onClick={() => setShowCelebration(false)}
              >
                Start a Reading Plan
              </Link>
              
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}