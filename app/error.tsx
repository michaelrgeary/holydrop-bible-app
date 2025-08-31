'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw, MessageCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Application error:', error);
      // Here you could send to error monitoring service
      // e.g., Sentry, LogRocket, etc.
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Something went wrong!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          We encountered an unexpected error while loading the page. 
          This has been logged and we'll look into it.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Error Details:
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-water-500 hover:bg-water-600 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </button>

          <a
            href="mailto:support@holydrop.app?subject=Error Report"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Report Issue
          </a>
        </div>

        {/* Helpful Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            While you wait:
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 text-left">
            <li>• Try refreshing the page</li>
            <li>• Check your internet connection</li>
            <li>• Clear your browser cache</li>
            <li>• The issue might be temporary</li>
          </ul>
        </div>

        {/* Branding */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          HolyDrop - Bible Wisdom for Every Life Situation
        </div>
      </div>
    </div>
  );
}