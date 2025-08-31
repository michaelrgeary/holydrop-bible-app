'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface FeatureHint {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: 'immediate' | 'hover' | 'click';
}

interface FeatureHintProps {
  hint: FeatureHint;
  onDismiss: (hintId: string) => void;
}

function SingleHint({ hint, onDismiss }: FeatureHintProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = document.querySelector(hint.targetSelector);
    if (!targetElement) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const hintRect = hintRef.current?.getBoundingClientRect();
      const hintWidth = hintRect?.width || 300;
      const hintHeight = hintRect?.height || 100;

      let x = 0;
      let y = 0;

      switch (hint.position) {
        case 'top':
          x = rect.left + rect.width / 2 - hintWidth / 2;
          y = rect.top - hintHeight - 10;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2 - hintWidth / 2;
          y = rect.bottom + 10;
          break;
        case 'left':
          x = rect.left - hintWidth - 10;
          y = rect.top + rect.height / 2 - hintHeight / 2;
          break;
        case 'right':
          x = rect.right + 10;
          y = rect.top + rect.height / 2 - hintHeight / 2;
          break;
      }

      // Keep hint within viewport
      x = Math.max(10, Math.min(x, window.innerWidth - hintWidth - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - hintHeight - 10));

      setPosition({ x, y });
    };

    const handleTrigger = () => {
      if (hint.trigger === 'immediate') {
        setShow(true);
        updatePosition();
      }
    };

    const handleInteraction = () => {
      if (hint.trigger === 'hover' || hint.trigger === 'click') {
        setShow(true);
        updatePosition();
      }
    };

    if (hint.trigger === 'immediate') {
      // Show after a short delay for immediate hints
      const timer = setTimeout(handleTrigger, 1000);
      return () => clearTimeout(timer);
    } else if (hint.trigger === 'hover') {
      targetElement.addEventListener('mouseenter', handleInteraction);
      return () => targetElement.removeEventListener('mouseenter', handleInteraction);
    } else if (hint.trigger === 'click') {
      targetElement.addEventListener('click', handleInteraction);
      return () => targetElement.removeEventListener('click', handleInteraction);
    }
  }, [hint]);

  const handleDismiss = () => {
    setShow(false);
    onDismiss(hint.id);
  };

  if (!show) return null;

  return (
    <div
      ref={hintRef}
      className="fixed z-50 max-w-sm"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 relative">
        {/* Arrow pointer */}
        <div
          className={`absolute w-2 h-2 bg-white dark:bg-gray-800 border transform rotate-45 ${
            hint.position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r border-gray-200 dark:border-gray-700' :
            hint.position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l border-gray-200 dark:border-gray-700' :
            hint.position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r border-gray-200 dark:border-gray-700' :
            'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l border-gray-200 dark:border-gray-700'
          }`}
        />
        
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Dismiss hint"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
              {hint.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hint.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureHints() {
  const [dismissedHints, setDismissedHints] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed hints from localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissed_hints') || '[]');
    setDismissedHints(dismissed);
  }, []);

  const handleDismiss = (hintId: string) => {
    const newDismissed = [...dismissedHints, hintId];
    setDismissedHints(newDismissed);
    localStorage.setItem('dismissed_hints', JSON.stringify(newDismissed));
  };

  // Define available hints
  const hints: FeatureHint[] = [
    {
      id: 'search-hint',
      title: 'Powerful Search',
      description: 'Try searching for topics like "love", "peace", or "strength" to find relevant verses.',
      targetSelector: '[data-hint="search"]',
      position: 'bottom',
      trigger: 'immediate'
    },
    {
      id: 'share-hint',
      title: 'Share Verses',
      description: 'Create beautiful verse cards and share them with friends and family.',
      targetSelector: '[data-hint="share"]',
      position: 'left',
      trigger: 'hover'
    },
    {
      id: 'reading-plans-hint',
      title: 'Reading Plans',
      description: 'Start a structured reading plan to develop consistent Bible study habits.',
      targetSelector: '[data-hint="reading-plans"]',
      position: 'bottom',
      trigger: 'immediate'
    },
    {
      id: 'offline-hint',
      title: 'Works Offline',
      description: 'Install HolyDrop as an app for offline access to all verses and features.',
      targetSelector: '[data-hint="install"]',
      position: 'top',
      trigger: 'hover'
    }
  ];

  // Show only hints that haven't been dismissed and whose target elements exist
  const activeHints = hints.filter(hint => 
    !dismissedHints.includes(hint.id) && 
    document.querySelector(hint.targetSelector)
  );

  return (
    <>
      {activeHints.map(hint => (
        <SingleHint
          key={hint.id}
          hint={hint}
          onDismiss={handleDismiss}
        />
      ))}
    </>
  );
}

// Hook for components to register hint targets
export function useFeatureHint(hintId: string) {
  return {
    'data-hint': hintId
  };
}