'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, BookOpen, Search, Share2, Download } from 'lucide-react';

export function WelcomeFlow() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    // Check if new user
    const hasVisited = localStorage.getItem('has_visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);
  
  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Read & Study",
      description: "Access all 31,102 Bible verses offline with reading plans"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Smart Search",
      description: "Find verses by topic, meaning, or reference instantly"
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Share Beautifully",
      description: "Create stunning verse cards for social media"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Works Offline",
      description: "Install as an app and use anywhere without internet"
    }
  ];
  
  const handleComplete = () => {
    localStorage.setItem('has_visited', 'true');
    localStorage.setItem('onboarding_completed', new Date().toISOString());
    setShowWelcome(false);
  };
  
  if (!showWelcome) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 relative shadow-2xl">
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close welcome"
        >
          <X className="w-5 h-5" />
        </button>
        
        {currentStep === 0 ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-water-100 dark:bg-water-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-water-600 dark:text-water-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Welcome to HolyDrop!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your personal Bible companion for daily spiritual growth
            </p>
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full py-3 bg-water-600 text-white rounded-lg hover:bg-water-700 transition-colors flex items-center justify-center gap-2"
            >
              See What's Special
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">What makes HolyDrop special:</h3>
            <div className="space-y-4 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="text-water-600 dark:text-water-400 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{feature.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleComplete}
              className="w-full py-3 bg-water-600 text-white rounded-lg hover:bg-water-700 transition-colors"
            >
              Start Exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
}