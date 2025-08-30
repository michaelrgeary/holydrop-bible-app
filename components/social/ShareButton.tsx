'use client';

import { useState } from 'react';
import { BookName } from '@/lib/bible/books';

interface ShareButtonProps {
  book: BookName;
  chapter: number;
  verse: number;
  text: string;
  annotation?: string;
  author?: string;
}

export function ShareButton({
  book,
  chapter,
  verse,
  text,
  annotation,
  author
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${book.toLowerCase().replace(/\s+/g, '')}/${chapter}#verse-${verse}`
    : '';
  
  const shareText = `"${text.substring(0, 200)}${text.length > 200 ? '...' : ''}" - ${book} ${chapter}:${verse}`;
  const shareMessage = annotation 
    ? `${shareText}\n\n💧 "${annotation}" - ${author || 'Anonymous'}\n\n${shareUrl}`
    : `${shareText}\n\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&hashtags=holydrop,BibleWisdom`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const generateShareCard = async () => {
    setIsGenerating(true);
    // In a real app, this would call an API to generate an image
    setTimeout(() => {
      setIsGenerating(false);
      // Download the generated image
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#e0f2fe');
      gradient.addColorStop(1, '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Water drop watermark
      ctx.font = '120px serif';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillText('💧', canvas.width - 180, 150);

      // Text content
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 48px system-ui';
      ctx.fillText(`${book} ${chapter}:${verse}`, 60, 100);

      // Verse text
      ctx.font = '32px Georgia';
      ctx.fillStyle = '#374151';
      const words = text.split(' ');
      let line = '';
      let y = 180;
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > canvas.width - 120 && line !== '') {
          ctx.fillText(line, 60, y);
          line = word + ' ';
          y += 45;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 60, y);

      // Annotation if exists
      if (annotation) {
        ctx.font = 'italic 24px Georgia';
        ctx.fillStyle = '#3b82f6';
        y += 80;
        ctx.fillText(`"${annotation.substring(0, 100)}..."`, 60, y);
        y += 40;
        ctx.fillText(`- ${author || 'Anonymous'}`, 60, y);
      }

      // Footer
      ctx.font = '20px system-ui';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('holydrop.app - Where wisdom drops onto scripture', 60, canvas.height - 40);

      // Download
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book}-${chapter}-${verse}-holydrop.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }, 1500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-1.5 bg-water-50 dark:bg-water-900/20 text-water-700 dark:text-water-300 rounded-lg hover:bg-water-100 dark:hover:bg-water-800/30 transition-all"
        title="Share this wisdom"
      >
        <span className="text-lg group-hover:rotate-12 transition-transform">💧</span>
        <span className="text-sm font-medium">Share</span>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-water-400 opacity-0 group-hover:opacity-20 transition-opacity" />
        </div>
      </button>

      {/* Share dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-slide-down">
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 font-medium">
                Share this wisdom
              </div>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <span className="text-lg">🔗</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {copied ? 'Copied!' : 'Copy link'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Share direct link to verse
                  </div>
                </div>
                {copied && (
                  <span className="text-green-500 text-sm">✓</span>
                )}
              </button>

              {/* Twitter/X */}
              <button
                onClick={handleShareTwitter}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <span className="text-lg">🐦</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Share on X
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Post to Twitter/X
                  </div>
                </div>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <span className="text-lg">📘</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Share on Facebook
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Post to your timeline
                  </div>
                </div>
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {/* Generate Image */}
              <button
                onClick={generateShareCard}
                disabled={isGenerating}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-water-50 dark:hover:bg-water-900/20 rounded-lg transition-colors text-left group"
              >
                <span className="text-lg group-hover:animate-pulse">🎨</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-water-700 dark:text-water-300">
                    {isGenerating ? 'Generating...' : 'Download share card'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Beautiful image with watermark
                  </div>
                </div>
                {isGenerating && (
                  <div className="w-4 h-4 border-2 border-water-500 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}