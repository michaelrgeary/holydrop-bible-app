'use client';

import { useEffect, useState } from 'react';
import { AnnotationEditor } from './AnnotationEditor';
import { VotingButtons } from '@/components/social/VotingButtons';
import { ShareButton } from '@/components/social/ShareButton';
import { CommentThread } from '@/components/social/CommentThread';
import { BookName } from '@/lib/bible/books';

export interface Annotation {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
}

interface AnnotationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  verseRef: string;
  verseText: string;
  book: BookName;
  chapter: number;
  verse: number;
  annotations: Annotation[];
  isLoggedIn: boolean;
  onCreateAnnotation: (text: string) => Promise<void>;
  onVote: (annotationId: string, vote: 'up' | 'down') => Promise<void>;
}

export function AnnotationSidebar({
  isOpen,
  onClose,
  verseRef,
  verseText,
  book,
  chapter,
  verse,
  annotations,
  isLoggedIn,
  onCreateAnnotation,
  onVote,
}: AnnotationSidebarProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showEditor) {
          setShowEditor(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, showEditor, onClose]);

  const handleCreateAnnotation = async (text: string) => {
    setIsCreating(true);
    try {
      await onCreateAnnotation(text);
      setShowEditor(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (annotationId: string, vote: 'up' | 'down') => {
    await onVote(annotationId, vote);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/20 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`
          annotation-sidebar fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-900
          shadow-2xl z-50 transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-b from-water-50 to-white dark:from-gray-900 dark:to-gray-900 border-b border-water-200 dark:border-water-800 p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Wisdom Drops
                </h2>
                <p className="text-sm text-water-600 dark:text-water-400 mt-1">
                  {verseRef}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 hover:bg-water-100 dark:hover:bg-water-900/20 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add annotation button */}
            {isLoggedIn && !showEditor && (
              <button
                onClick={() => setShowEditor(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-water-500 to-water-600 text-white font-medium rounded-lg hover:from-water-600 hover:to-water-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-water-500/20"
              >
                <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Annotation
              </button>
            )}
            
            {/* Login prompt for non-authenticated users */}
            {!isLoggedIn && (
              <div className="p-3 bg-water-50 dark:bg-water-900/20 rounded-lg border border-water-200 dark:border-water-700">
                <p className="text-sm text-water-700 dark:text-water-300 text-center">
                  Sign in to add annotations
                </p>
              </div>
            )}

            {/* Editor */}
            {showEditor && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <AnnotationEditor
                  onSubmit={handleCreateAnnotation}
                  onCancel={() => setShowEditor(false)}
                  isSubmitting={isCreating}
                />
              </div>
            )}
          </div>

          {/* Annotations list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {annotations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💧</div>
                <p className="text-gray-500 dark:text-gray-400">
                  No wisdom drops yet
                </p>
                {!isLoggedIn && (
                  <p className="text-sm text-water-600 dark:text-water-400 mt-2">
                    Sign in to add your insights
                  </p>
                )}
              </div>
            ) : (
              annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  {/* User info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-water-400 to-water-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {annotation.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {annotation.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(annotation.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Annotation text */}
                  <div 
                    className="text-gray-700 dark:text-gray-300 mb-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: annotation.text }}
                  />

                  {/* Social interactions */}
                  <div className="flex items-center justify-between">
                    <VotingButtons
                      annotationId={annotation.id}
                      initialUpvotes={annotation.upvotes}
                      initialDownvotes={annotation.downvotes}
                      userVote={annotation.userVote}
                      onVote={async (type) => {
                        if (type) {
                          await handleVote(annotation.id, type);
                        }
                      }}
                    />
                    
                    <ShareButton
                      book={book}
                      chapter={chapter}
                      verse={verse}
                      text={verseText}
                      annotation={annotation.text.replace(/<[^>]*>/g, '')} // Strip HTML
                      author={annotation.username}
                    />
                  </div>

                  {/* Comment Thread */}
                  <CommentThread
                    annotationId={annotation.id}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}