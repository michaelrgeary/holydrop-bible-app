'use client';

import { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Monitor,
  MessageCircle,
  Mail,
  Facebook
} from 'lucide-react';

interface ShareButtonsProps {
  verse: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  };
  url?: string;
}

interface SharePlatform {
  id: string;
  name: string;
  icon: any;
  color: string;
  getUrl: (text: string, url: string) => string;
  available: boolean;
}

export function ShareButtons({ verse, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkCapabilities = () => {
      if (typeof window === 'undefined') return;
      
      setHasNativeShare(
        'share' in navigator && 
        'canShare' in navigator
      );
      
      setIsMobile(
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768
      );
    };
    
    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);
    return () => window.removeEventListener('resize', checkCapabilities);
  }, []);
  
  const shareUrl = url || (typeof window !== 'undefined' ? `${window.location.origin}/verse/${verse.book}/${verse.chapter}/${verse.verse}` : '');
  const shareText = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`;
  const shareTitle = `${verse.book} ${verse.chapter}:${verse.verse} - HolyDrop`;
  
  const platforms: SharePlatform[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      getUrl: (text, url) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      available: isMobile || (typeof window !== 'undefined' && window.innerWidth < 1024),
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Share2,
      color: 'bg-blue-500 hover:bg-blue-600',
      getUrl: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      available: true,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      getUrl: (text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      available: true,
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      getUrl: (text, url) => `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
      available: true,
    },
  ];
  
  const availablePlatforms = platforms.filter(p => p.available);
  
  const handleNativeShare = async () => {
    if (!hasNativeShare) return;
    
    try {
      const shareData = {
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      };
      
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
      }
    } catch (err) {
      console.log('Native share failed:', err);
      // Fallback to copy
      handleCopyLink();
    }
  };
  
  const handlePlatformShare = (platform: SharePlatform) => {
    const url = platform.getUrl(shareText, shareUrl);
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const handleCopyLink = async () => {
    const textToCopy = `${shareText}\n\n${shareUrl}`;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Share this verse
        </h3>
        {isMobile && (
          <div className="flex items-center text-xs text-gray-500">
            <Smartphone className="w-3 h-3 mr-1" />
            Mobile
          </div>
        )}
        {!isMobile && (
          <div className="flex items-center text-xs text-gray-500">
            <Monitor className="w-3 h-3 mr-1" />
            Desktop
          </div>
        )}
      </div>
      
      {/* Native Share (mobile first) */}
      {hasNativeShare && (
        <button
          onClick={handleNativeShare}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-3 bg-water-500 hover:bg-water-600 text-white font-medium rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      )}
      
      {/* Platform Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {availablePlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <button
              key={platform.id}
              onClick={() => handlePlatformShare(platform)}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-white text-xs font-medium rounded-lg transition-all transform hover:scale-105 ${platform.color}`}
              title={`Share on ${platform.name}`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{platform.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
          copied ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400' : ''
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied to clipboard!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy link
          </>
        )}
      </button>
      
      {/* Share Analytics (if not mobile) */}
      {!isMobile && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Share API:</span>
              <span className={hasNativeShare ? 'text-green-600' : 'text-red-600'}>
                {hasNativeShare ? 'Supported' : 'Not supported'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Platform:</span>
              <span>{isMobile ? 'Mobile' : 'Desktop'}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions for better sharing */}
      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-start gap-2">
          <ExternalLink className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">Pro tip:</p>
            <p>Create a beautiful card above for visual sharing on Instagram, Facebook stories, or Twitter!</p>
          </div>
        </div>
      </div>
    </div>
  );
}