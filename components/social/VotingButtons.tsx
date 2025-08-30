'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface VotingButtonsProps {
  annotationId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote?: (type: 'up' | 'down' | null) => Promise<void>;
}

export function VotingButtons({
  annotationId: _,
  initialUpvotes = 0,
  initialDownvotes = 0,
  userVote: initialUserVote = null,
  onVote
}: VotingButtonsProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote);
  const [isAnimating, setIsAnimating] = useState<'up' | 'down' | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const netVotes = upvotes - downvotes;

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }

    setIsAnimating(type);
    
    // Optimistic update
    if (userVote === type) {
      // Cancel vote
      setUserVote(null);
      if (type === 'up') {
        setUpvotes(upvotes - 1);
      } else {
        setDownvotes(downvotes - 1);
      }
      onVote?.(null);
    } else if (userVote === null) {
      // New vote
      setUserVote(type);
      if (type === 'up') {
        setUpvotes(upvotes + 1);
      } else {
        setDownvotes(downvotes + 1);
      }
      onVote?.(type);
    } else {
      // Change vote
      setUserVote(type);
      if (type === 'up') {
        setUpvotes(upvotes + 1);
        setDownvotes(downvotes - 1);
      } else {
        setUpvotes(upvotes - 1);
        setDownvotes(downvotes + 1);
      }
      onVote?.(type);
    }

    setTimeout(() => setIsAnimating(null), 600);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Tooltip */}
      {showTooltip && !user && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 animate-fade-in">
          Sign in to vote on wisdom
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
      
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        className={`
          relative group flex items-center gap-1 px-3 py-1 rounded-full transition-all
          ${userVote === 'up' 
            ? 'bg-water-500 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-water-100 dark:hover:bg-water-900/30'
          }
          ${!user ? 'cursor-not-allowed opacity-75' : ''}
        `}
        title={!user ? 'Sign in to vote' : 'Upvote'}
      >
        <div className="relative">
          {/* Water drop icon */}
          <span className={`
            text-lg transition-transform
            ${isAnimating === 'up' ? 'animate-bounce' : ''}
            ${userVote === 'up' ? 'scale-110' : ''}
          `}>
            💧
          </span>
          
          {/* Fill animation */}
          {userVote === 'up' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-water-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
        </div>
        
        <span className="font-medium text-sm">{upvotes}</span>
        
        {/* Ripple effect on hover */}
        <div className={`
          absolute inset-0 rounded-full bg-water-400 opacity-0 group-hover:opacity-20 transition-opacity
          ${isAnimating === 'up' ? 'animate-ripple' : ''}
        `} />
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        className={`
          relative group flex items-center gap-1 px-3 py-1 rounded-full transition-all
          ${userVote === 'down' 
            ? 'bg-gray-500 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
          ${!user ? 'cursor-not-allowed opacity-75' : ''}
        `}
        title={!user ? 'Sign in to vote' : 'Downvote'}
      >
        <div className="relative">
          {/* Dry drop icon */}
          <span className={`
            text-lg transition-transform rotate-180
            ${isAnimating === 'down' ? 'animate-bounce' : ''}
            ${userVote === 'down' ? 'scale-110' : ''}
          `}>
            💧
          </span>
          
          {/* Fade animation */}
          {userVote === 'down' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
        </div>
        
        <span className="font-medium text-sm">{downvotes}</span>
      </button>

      {/* Net score display */}
      <div className={`
        ml-2 px-3 py-1 rounded-full text-sm font-bold
        ${netVotes > 0 ? 'bg-water-100 dark:bg-water-900/30 text-water-700 dark:text-water-300' : 
          netVotes < 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
      `}>
        {netVotes > 0 ? '+' : ''}{netVotes}
      </div>
    </div>
  );
}