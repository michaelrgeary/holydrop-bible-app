'use client';

import { MessageCircle } from 'lucide-react';

export function FeedbackButton() {
  const handleClick = () => {
    // This would trigger the feedback widget
    const feedbackButton = document.querySelector('[aria-label="Send Feedback"]') as HTMLButtonElement;
    feedbackButton?.click();
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <MessageCircle className="w-4 h-4" />
      Send Feedback
    </button>
  );
}