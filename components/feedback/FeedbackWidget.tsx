'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Check, Bug, Lightbulb, Heart } from 'lucide-react';

type FeedbackType = 'bug' | 'feature' | 'general' | 'appreciation';

interface FeedbackData {
  type: FeedbackType;
  message: string;
  email?: string;
  timestamp: string;
  page: string;
  userAgent: string;
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypes = [
    {
      id: 'bug' as FeedbackType,
      label: 'Bug Report',
      icon: <Bug className="w-4 h-4" />,
      color: 'text-red-600',
      description: 'Something isn\'t working correctly'
    },
    {
      id: 'feature' as FeedbackType,
      label: 'Feature Request',
      icon: <Lightbulb className="w-4 h-4" />,
      color: 'text-yellow-600',
      description: 'Suggest a new feature or improvement'
    },
    {
      id: 'general' as FeedbackType,
      label: 'General Feedback',
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'text-blue-600',
      description: 'General comments or questions'
    },
    {
      id: 'appreciation' as FeedbackType,
      label: 'Appreciation',
      icon: <Heart className="w-4 h-4" />,
      color: 'text-pink-600',
      description: 'Share what you love about HolyDrop'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      type: feedbackType,
      message: message.trim(),
      email: email.trim() || undefined,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      userAgent: navigator.userAgent
    };

    try {
      // Store feedback locally for now (can be sent to API later)
      const existingFeedback = JSON.parse(localStorage.getItem('user_feedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('user_feedback', JSON.stringify(existingFeedback));

      // Future: Send to API
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedbackData)
      // });

      setIsSubmitted(true);
      
      // Reset form after showing success
      setTimeout(() => {
        setIsOpen(false);
        setMessage('');
        setEmail('');
        setIsSubmitted(false);
        setFeedbackType('general');
      }, 2000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessage('');
    setEmail('');
    setIsSubmitted(false);
    setFeedbackType('general');
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-water-600 hover:bg-water-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
        aria-label="Send Feedback"
        title="Send Feedback"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Send Feedback
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Thank you!
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Your feedback has been recorded and will help us improve HolyDrop.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Feedback Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      What type of feedback do you have?
                    </label>
                    <div className="space-y-2">
                      {feedbackTypes.map((type) => (
                        <label
                          key={type.id}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            feedbackType === type.id
                              ? 'border-water-500 bg-water-50 dark:bg-water-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="feedbackType"
                            value={type.id}
                            checked={feedbackType === type.id}
                            onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                            className="sr-only"
                          />
                          <div className={`${type.color} mr-3`}>
                            {type.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {type.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {type.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your feedback
                    </label>
                    <textarea
                      id="feedback-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please share your thoughts..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-water-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="feedback-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-water-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave your email if you'd like us to follow up with you
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full bg-water-600 hover:bg-water-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Feedback
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}