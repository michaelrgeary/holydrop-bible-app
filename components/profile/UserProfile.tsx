'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { VotingButtons } from '@/components/social/VotingButtons';
import { ShareButton } from '@/components/social/ShareButton';
import { BookName } from '@/lib/bible/books';

interface UserAnnotation {
  id: string;
  verseRef: {
    book: BookName;
    chapter: number;
    verse: number;
  };
  verseText: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
}

interface UserHighlight {
  id: string;
  verseRef: {
    book: BookName;
    chapter: number;
    verse: number;
  };
  verseText: string;
  color: string;
  note?: string;
  createdAt: Date;
}

interface UserProfileData {
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  memberSince: Date;
  stats: {
    annotations: number;
    highlights: number;
    wisdomDrops: number;
    reputation: number;
    level: string;
  };
  annotations: UserAnnotation[];
  highlights: UserHighlight[];
}

interface UserProfileProps {
  username: string;
}

export function UserProfile({ username }: UserProfileProps) {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'annotations' | 'highlights'>('annotations');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setProfileData({
        username,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        bio: 'Seeking wisdom through scripture. Student of the Word.',
        memberSince: new Date('2024-01-15'),
        stats: {
          annotations: 42,
          highlights: 156,
          wisdomDrops: 198,
          reputation: 750,
          level: 'Scholar'
        },
        annotations: [
          {
            id: '1',
            verseRef: { book: 'Genesis', chapter: 1, verse: 1 },
            verseText: 'In the beginning God created the heaven and the earth.',
            content: 'The opening words establish God\'s sovereignty and creative power. Everything begins with Him.',
            upvotes: 24,
            downvotes: 2,
            createdAt: new Date('2024-03-01')
          },
          {
            id: '2',
            verseRef: { book: 'John', chapter: 1, verse: 1 },
            verseText: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
            content: 'John parallels Genesis, revealing Christ as the eternal Word present at creation.',
            upvotes: 18,
            downvotes: 1,
            createdAt: new Date('2024-03-05')
          }
        ],
        highlights: [
          {
            id: '1',
            verseRef: { book: 'Genesis', chapter: 1, verse: 3 },
            verseText: 'And God said, Let there be light: and there was light.',
            color: 'blue',
            note: 'The power of God\'s spoken word',
            createdAt: new Date('2024-03-02')
          }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, [username]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Seeker': return '🌱';
      case 'Student': return '📖';
      case 'Scholar': return '🎓';
      case 'Sage': return '✨';
      default: return '💧';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Seeker': return 'text-green-600 dark:text-green-400';
      case 'Student': return 'text-blue-600 dark:text-blue-400';
      case 'Scholar': return 'text-purple-600 dark:text-purple-400';
      case 'Sage': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-water-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">💧</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">This well appears to be dry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-water-400 to-water-600 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-lg">
                {profileData.displayName.charAt(0)}
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {profileData.displayName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">@{profileData.username}</p>
                {profileData.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{profileData.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>Member since {profileData.memberSince.toLocaleDateString()}</span>
                  <span className={`font-medium ${getLevelColor(profileData.stats.level)}`}>
                    {getLevelIcon(profileData.stats.level)} {profileData.stats.level}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Follow Button */}
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isFollowing 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-water-500 text-white hover:bg-water-600'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profileData.stats.annotations}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Annotations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profileData.stats.highlights}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Highlights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-water-600 dark:text-water-400 flex items-center justify-center gap-1">
                <span>💧</span> {profileData.stats.wisdomDrops}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Drops of Wisdom</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profileData.stats.reputation}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reputation</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('annotations')}
                className={`px-6 py-4 font-medium transition-colors relative ${
                  activeTab === 'annotations'
                    ? 'text-water-600 dark:text-water-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Annotations
                {activeTab === 'annotations' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-water-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('highlights')}
                className={`px-6 py-4 font-medium transition-colors relative ${
                  activeTab === 'highlights'
                    ? 'text-water-600 dark:text-water-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Highlights
                {activeTab === 'highlights' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-water-500" />
                )}
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'annotations' ? (
              <div className="space-y-4">
                {profileData.annotations.map(annotation => (
                  <div 
                    key={annotation.id}
                    className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Link
                      href={`/${annotation.verseRef.book.toLowerCase()}/${annotation.verseRef.chapter}#verse-${annotation.verseRef.verse}`}
                      className="text-lg font-semibold text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300"
                    >
                      {annotation.verseRef.book} {annotation.verseRef.chapter}:{annotation.verseRef.verse}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 italic">
                      "{annotation.verseText}"
                    </p>
                    <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border-l-4 border-water-500">
                      <p className="text-gray-800 dark:text-gray-200">
                        {annotation.content}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <VotingButtons
                        annotationId={annotation.id}
                        initialUpvotes={annotation.upvotes}
                        initialDownvotes={annotation.downvotes}
                      />
                      <div className="flex items-center gap-2">
                        <ShareButton
                          book={annotation.verseRef.book}
                          chapter={annotation.verseRef.chapter}
                          verse={annotation.verseRef.verse}
                          text={annotation.verseText}
                          annotation={annotation.content}
                          author={profileData.displayName}
                        />
                        <span className="text-sm text-gray-500">
                          {annotation.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {profileData.annotations.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block opacity-50">💧</span>
                    <p className="text-gray-600 dark:text-gray-400">No annotations yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {profileData.highlights.map(highlight => (
                  <div 
                    key={highlight.id}
                    className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Link
                      href={`/${highlight.verseRef.book.toLowerCase()}/${highlight.verseRef.chapter}#verse-${highlight.verseRef.verse}`}
                      className="text-lg font-semibold text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300"
                    >
                      {highlight.verseRef.book} {highlight.verseRef.chapter}:{highlight.verseRef.verse}
                    </Link>
                    <p className={`text-gray-600 dark:text-gray-400 mt-2 italic p-3 rounded-lg bg-${highlight.color}-100 dark:bg-${highlight.color}-900/20`}>
                      "{highlight.verseText}"
                    </p>
                    {highlight.note && (
                      <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
                        📝 {highlight.note}
                      </p>
                    )}
                    <div className="mt-3 text-sm text-gray-500">
                      {highlight.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {profileData.highlights.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block opacity-50">💧</span>
                    <p className="text-gray-600 dark:text-gray-400">No highlights yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}