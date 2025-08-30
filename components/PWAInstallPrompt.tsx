'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'desktop' | 'mobile' | 'ios'>('desktop');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android|mobile/.test(userAgent)) {
      setPlatform('mobile');
    } else {
      setPlatform('desktop');
    }

    // Check if install was previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    if (dismissedTime > oneWeekAgo) {
      return; // Don't show if dismissed within the last week
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after user has engaged with the app
      setTimeout(() => {
        const hasEngaged = sessionStorage.getItem('user-engaged');
        if (hasEngaged) {
          setShowPrompt(true);
        }
      }, 5000); // Wait 5 seconds after page load
    };

    // Track user engagement
    const trackEngagement = () => {
      sessionStorage.setItem('user-engaged', 'true');
      
      // If we have a deferred prompt and haven't shown it yet, show it now
      if (deferredPrompt && !showPrompt && !isInstalled) {
        setTimeout(() => setShowPrompt(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Track various engagement signals
    document.addEventListener('click', trackEngagement, { once: true });
    document.addEventListener('scroll', trackEngagement, { once: true });

    // Check for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('✅ HolyDrop PWA installed!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('click', trackEngagement);
      document.removeEventListener('scroll', trackEngagement);
    };
  }, [deferredPrompt, showPrompt, isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the browser's install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's choice
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted PWA installation');
        setIsInstalled(true);
      } else {
        console.log('❌ User dismissed PWA installation');
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }
      
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // iOS-specific instructions
  if (platform === 'ios' && showPrompt && !isInstalled) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-lg mx-auto p-4">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-water-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💧</span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Install HolyDrop
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Read scripture offline, anytime, anywhere
                </p>
                
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p>To install on iOS:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Tap the Share button <span className="inline-block w-4 h-4">⬆️</span></li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to install</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard install prompt (Chrome, Edge, etc.)
  if (!showPrompt || !deferredPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-lg mx-auto p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-water-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💧</span>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Install HolyDrop
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Read the complete KJV Bible offline. Add to your {platform === 'mobile' ? 'home screen' : 'desktop'} for quick access.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-water-500 hover:bg-water-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                >
                  {platform === 'mobile' ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Monitor className="w-4 h-4" />
                  )}
                  Install App
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                >
                  Not now
                </button>
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>5.5 MB</span>
                </div>
                <div className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  <span>Works offline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// For Next.js, we need to handle the WifiOff import
import { WifiOff } from 'lucide-react';