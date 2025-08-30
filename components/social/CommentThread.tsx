'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { VotingButtons } from './VotingButtons';

interface Comment {
  id: string;
  content: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
    level: string;
  };
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  replies: Comment[];
  depth: number;
}

interface CommentThreadProps {
  annotationId: string;
  initialComments?: Comment[];
}

export function CommentThread({ annotationId: _, initialComments = [] }: CommentThreadProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isExpanded, setIsExpanded] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Mock data
  const mockComments: Comment[] = [
    {
      id: '1',
      content: 'This interpretation really opened my eyes to the deeper meaning here. The connection to the original Hebrew is fascinating!',
      author: {
        username: 'sarah123',
        displayName: 'Sarah',
        level: 'Scholar'
      },
      createdAt: new Date('2024-03-15T10:30:00'),
      upvotes: 12,
      downvotes: 1,
      replies: [
        {
          id: '2',
          content: 'Yes! The Hebrew word "bara" specifically means creation from nothing, which emphasizes God\'s absolute power.',
          author: {
            username: 'david_scholar',
            displayName: 'David',
            level: 'Student'
          },
          createdAt: new Date('2024-03-15T11:15:00'),
          upvotes: 8,
          downvotes: 0,
          replies: [],
          depth: 1
        }
      ],
      depth: 0
    },
    {
      id: '3',
      content: 'I love how this verse establishes God\'s sovereignty from the very beginning.',
      author: {
        username: 'grace_seeker',
        displayName: 'Grace',
        level: 'Seeker'
      },
      createdAt: new Date('2024-03-16T09:00:00'),
      upvotes: 5,
      downvotes: 0,
      replies: [],
      depth: 0
    }
  ];

  // Initialize with mock data if no initial comments
  if (comments.length === 0 && mockComments.length > 0) {
    setComments(mockComments);
  }

  const handleAddComment = () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (!newComment.trim() || newComment.length > 500) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        username: user.email?.split('@')[0] || 'user',
        displayName: user.email?.split('@')[0] || 'User',
        level: 'Seeker'
      },
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      replies: [],
      depth: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleAddReply = (parentId: string, depth: number) => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (!replyText.trim() || replyText.length > 500 || depth >= 3) return;

    const reply: Comment = {
      id: Date.now().toString(),
      content: replyText,
      author: {
        username: user.email?.split('@')[0] || 'user',
        displayName: user.email?.split('@')[0] || 'User',
        level: 'Seeker'
      },
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      replies: [],
      depth: depth + 1
    };

    const addReplyToComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [reply, ...comment.replies]
          };
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyToComment(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(addReplyToComment(comments));
    setReplyText('');
    setReplyingTo(null);
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const canReply = depth < 3;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          {/* Author info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-water-400 to-water-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {comment.author.displayName.charAt(0)}
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.author.displayName}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {getLevelIcon(comment.author.level)} {comment.author.level}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Comment content */}
          <p className="text-gray-800 dark:text-gray-200 mb-3">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <VotingButtons
              annotationId={comment.id}
              initialUpvotes={comment.upvotes}
              initialDownvotes={comment.downvotes}
            />
            
            {canReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-sm text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 font-medium"
              >
                💧 Add a ripple
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Add your ripple of wisdom..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-water-500 resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {replyText.length}/500 characters
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddReply(comment.id, comment.depth)}
                    disabled={!replyText.trim() || replyText.length > 500}
                    className="px-4 py-1 text-sm bg-water-500 text-white rounded-lg hover:bg-water-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Render replies */}
        {comment.replies.length > 0 && (
          <div className="animate-slide-down">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Seeker': return '🌱';
      case 'Student': return '📖';
      case 'Scholar': return '🎓';
      case 'Sage': return '✨';
      default: return '💧';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>💬</span>
          Discussion ({comments.length})
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Login prompt */}
      {showLoginPrompt && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-amber-800 dark:text-amber-200 text-sm">
          Sign in to join the discussion
        </div>
      )}

      {isExpanded && (
        <>
          {/* New comment form */}
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your wisdom..." : "Sign in to comment"}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-water-500 resize-none"
              rows={3}
              maxLength={500}
              disabled={!user}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {newComment.length}/500 characters
              </span>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || newComment.length > 500}
                className="px-4 py-2 bg-water-500 text-white rounded-lg hover:bg-water-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <span>💧</span>
                Add wisdom
              </button>
            </div>
          </div>

          {/* Comments list */}
          <div>
            {comments.map(comment => renderComment(comment))}
            
            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <span className="text-3xl mb-2 block opacity-50">💧</span>
                Be the first to add wisdom to this discussion
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}