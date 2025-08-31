'use client';

import { useState } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface HelpButtonProps {
  topic: string;
  title?: string;
  description?: string;
  helpUrl?: string;
  inline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function HelpButton({ 
  topic, 
  title, 
  description, 
  helpUrl,
  inline = false,
  size = 'md'
}: HelpButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const buttonClasses = inline 
    ? 'inline-flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
    : 'relative';

  const helpContent = getHelpContent(topic);
  const finalTitle = title || helpContent?.title || 'Help';
  const finalDescription = description || helpContent?.description || 'Get help with this feature';
  const finalHelpUrl = helpUrl || helpContent?.helpUrl || '/help';

  return (
    <div className={buttonClasses}>
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="text-gray-400 hover:text-water-600 dark:hover:text-water-400 transition-colors"
        aria-label={`Help: ${finalTitle}`}
        title={finalTitle}
      >
        <HelpCircle className={sizeClasses[size]} />
      </button>

      {showTooltip && (
        <div className="absolute z-50 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 top-6 right-0">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {finalTitle}
            </h4>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
              aria-label="Close help"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {finalDescription}
          </p>

          {helpContent?.tips && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Quick Tips
              </h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {helpContent.tips.map((tip, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-water-500 font-medium">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href={finalHelpUrl}
            className="inline-flex items-center gap-2 text-xs text-water-600 hover:text-water-700 dark:text-water-400 dark:hover:text-water-300 font-medium"
          >
            Learn More
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

// Help content database
function getHelpContent(topic: string) {
  const helpDatabase: Record<string, {
    title: string;
    description: string;
    tips?: string[];
    helpUrl?: string;
  }> = {
    'search': {
      title: 'Smart Search',
      description: 'Find verses by reference, topic, or partial text. Our search understands natural language and biblical concepts.',
      tips: [
        'Try searching for topics like "love", "peace", or "forgiveness"',
        'Use specific references like "John 3:16" or "Romans 8"',
        'Search partial quotes if you remember some words',
        'Search works even with typos and similar words'
      ],
      helpUrl: '/help#search'
    },
    'verse-cards': {
      title: 'Verse Cards',
      description: 'Create beautiful, shareable verse cards for social media platforms with customizable themes and formats.',
      tips: [
        'Choose format based on your platform (Instagram, Facebook, etc.)',
        'Pick themes that match your message and audience',
        'Add personal messages to make it more meaningful',
        'Download high-quality images for the best sharing experience'
      ],
      helpUrl: '/help#sharing'
    },
    'reading-plans': {
      title: 'Reading Plans',
      description: 'Structured Bible reading plans help you build consistent study habits and explore Scripture systematically.',
      tips: [
        'Start with shorter plans if you\'re new to daily reading',
        'Mark your progress to stay motivated',
        'Use notifications to build a daily habit',
        'Don\'t worry if you miss a day - just continue where you left off'
      ],
      helpUrl: '/help#reading-plans'
    },
    'bookmarks': {
      title: 'Bookmarks',
      description: 'Save your favorite verses for quick access later. Perfect for memorization and personal study.',
      tips: [
        'Click the bookmark icon next to any verse to save it',
        'Organize bookmarks with personal notes',
        'Review saved verses regularly for memorization',
        'Export bookmarks to share with study groups'
      ],
      helpUrl: '/help#bookmarks'
    },
    'offline': {
      title: 'Offline Usage',
      description: 'HolyDrop works completely offline once loaded. All verses, search, and features are available without internet.',
      tips: [
        'Install as a mobile app for the best offline experience',
        'All Bible text is stored locally on your device',
        'Search and reading plans work without internet',
        'Bookmarks and settings sync when you go back online'
      ],
      helpUrl: '/help#offline'
    },
    'settings': {
      title: 'Settings & Preferences',
      description: 'Customize your HolyDrop experience with font sizes, themes, and display preferences.',
      tips: [
        'Adjust font size for comfortable reading',
        'Switch between light and dark themes',
        'Customize notification preferences',
        'Manage your data and privacy settings'
      ],
      helpUrl: '/help#settings'
    }
  };

  return helpDatabase[topic];
}

// Convenience components for common help topics
export const SearchHelp = (props: Omit<HelpButtonProps, 'topic'>) => (
  <HelpButton topic="search" {...props} />
);

export const VerseCardHelp = (props: Omit<HelpButtonProps, 'topic'>) => (
  <HelpButton topic="verse-cards" {...props} />
);

export const ReadingPlanHelp = (props: Omit<HelpButtonProps, 'topic'>) => (
  <HelpButton topic="reading-plans" {...props} />
);

export const BookmarkHelp = (props: Omit<HelpButtonProps, 'topic'>) => (
  <HelpButton topic="bookmarks" {...props} />
);

export const OfflineHelp = (props: Omit<HelpButtonProps, 'topic'>) => (
  <HelpButton topic="offline" {...props} />
);