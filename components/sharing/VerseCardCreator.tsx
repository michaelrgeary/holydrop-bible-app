'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { VerseCardGenerator, CardTheme, CardOptions } from '@/lib/services/verseCardGenerator';
import { 
  Download, 
  Share2, 
  Palette, 
  Smartphone, 
  Monitor, 
  Instagram, 
  Twitter,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

interface VerseCardCreatorProps {
  verse: {
    text: string;
    reference: string;
    book: string;
    chapter: number;
    verseNumber: number;
  };
  onShare?: (format: string, theme: string) => void;
}

export function VerseCardCreator({ verse, onShare }: VerseCardCreatorProps) {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(VerseCardGenerator.THEMES.ocean);
  const [selectedFormat, setSelectedFormat] = useState<'square' | 'story' | 'landscape' | 'twitter'>('square');
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [personalMessage, setPersonalMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  
  const cardGeneratorRef = useRef<VerseCardGenerator | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Initialize card generator
  useEffect(() => {
    cardGeneratorRef.current = new VerseCardGenerator();
  }, []);
  
  // Throttled card generation to avoid excessive API calls
  const generateCardThrottled = useMemo(
    () => {
      const generateCard = async () => {
        if (!cardGeneratorRef.current) return;
        
        setIsGenerating(true);
        setError(null);
        const startTime = performance.now();
        
        try {
          const options: CardOptions = {
            verse,
            theme: selectedTheme,
            format: selectedFormat,
            includeWatermark,
            personalMessage: personalMessage.trim() || undefined
          };
          
          const blob = await cardGeneratorRef.current.generateCard(options);
          const endTime = performance.now();
          
          if (blob) {
            setGeneratedCard(blob);
            
            // Create preview URL
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setGenerationTime(Math.round(endTime - startTime));
          } else {
            setError('Failed to generate card. Please try again.');
          }
        } catch (err) {
          console.error('Card generation error:', err);
          setError('Card generation failed. Please check your connection and try again.');
        } finally {
          setIsGenerating(false);
        }
      };
      
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(generateCard, 500);
      };
    },
    [verse, selectedTheme, selectedFormat, includeWatermark, personalMessage, previewUrl]
  );
  
  // Generate card when options change
  useEffect(() => {
    if (showPreview) {
      generateCardThrottled();
    }
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [generateCardThrottled, showPreview]);
  
  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  const handleDownload = async () => {
    if (!generatedCard) return;
    
    // Generate fresh card to ensure quality
    setIsGenerating(true);
    try {
      const options: CardOptions = {
        verse,
        theme: selectedTheme,
        format: selectedFormat,
        includeWatermark,
        personalMessage: personalMessage.trim() || undefined
      };
      
      const blob = await cardGeneratorRef.current?.generateCard(options);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${verse.reference.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedFormat}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleShare = async () => {
    if (!generatedCard) return;
    
    // Track sharing analytics (privacy-respecting)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stats = JSON.parse(localStorage.getItem('shareStats') || '{}');
        const key = `${verse.book}-${verse.chapter}-${verse.verseNumber}`;
        stats[key] = (stats[key] || 0) + 1;
        localStorage.setItem('shareStats', JSON.stringify(stats));
      } catch (e) {
        // Ignore errors
      }
    }
    
    onShare?.(selectedFormat, selectedTheme.id);
    
    // Check for native share API
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([generatedCard], `${verse.reference}_${selectedFormat}.jpg`, {
          type: 'image/jpeg',
        });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: verse.reference,
            text: `"${verse.text}" - ${verse.reference}`,
            files: [file],
          });
          return;
        }
      } catch (err) {
        console.log('Native share failed, falling back to copy:', err);
      }
    }
    
    // Fallback: copy to clipboard
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/jpeg': generatedCard,
          }),
        ]);
        alert('Card copied to clipboard!');
      } else {
        // Final fallback: download
        handleDownload();
      }
    } catch (err) {
      console.error('Clipboard failed:', err);
      handleDownload();
    }
  };
  
  const formatIcons = {
    square: Instagram,
    story: Smartphone,
    landscape: Monitor,
    twitter: Twitter,
  };
  
  const formatNames = {
    square: 'Instagram Post (1:1)',
    story: 'Instagram Story (9:16)', 
    landscape: 'Facebook/Twitter (1.91:1)',
    twitter: 'Twitter Card (16:9)',
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Create Shareable Card
        </h2>
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={showPreview ? 'Hide preview' : 'Show preview'}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Choose Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VerseCardGenerator.getThemes().map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTheme.id === theme.id
                      ? 'border-water-500 bg-water-50 dark:bg-water-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  aria-pressed={selectedTheme.id === theme.id}
                >
                  <div 
                    className="w-full h-8 rounded mb-2"
                    style={{
                      background: theme.backgroundType === 'gradient' 
                        ? theme.backgroundValue 
                        : theme.backgroundValue
                    }}
                  />
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {theme.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Platform Format
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(formatNames).map(([format, name]) => {
                const Icon = formatIcons[format as keyof typeof formatIcons];
                return (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format as any)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      selectedFormat === format
                        ? 'border-water-500 bg-water-50 dark:bg-water-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    aria-pressed={selectedFormat === format}
                  >
                    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Personal Message */}
          <div>
            <label htmlFor="personal-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Personal Message (optional)
            </label>
            <textarea
              id="personal-message"
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Add your own message..."
              maxLength={100}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-water-500 focus:border-transparent resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {personalMessage.length}/100 characters
            </div>
          </div>
          
          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeWatermark}
                onChange={(e) => setIncludeWatermark(e.target.checked)}
                className="w-4 h-4 text-water-600 bg-gray-100 border-gray-300 rounded focus:ring-water-500 dark:focus:ring-water-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include HolyDrop watermark</span>
            </label>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleShare}
              disabled={!generatedCard || isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-water-500 hover:bg-water-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              Share Card
            </button>
            
            <button
              onClick={handleDownload}
              disabled={!generatedCard || isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          
          {/* Generation Stats */}
          {(generationTime || isGenerating) && (
            <div className="text-xs text-gray-500 space-y-1">
              {isGenerating && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating card...
                </div>
              )}
              {generationTime && (
                <div>Generated in {generationTime}ms</div>
              )}
              {cardGeneratorRef.current && (
                <div>Strategy: {cardGeneratorRef.current.getCurrentStrategy()}</div>
              )}
            </div>
          )}
        </div>
        
        {/* Preview */}
        {showPreview && (
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preview</h3>
            
            {error ? (
              <div className="flex items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center p-4">
                {error}
              </div>
            ) : previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Card preview"
                  className="max-w-full max-h-80 object-contain rounded-lg shadow-md"
                  style={{
                    aspectRatio: selectedFormat === 'story' ? '9/16' : 
                                selectedFormat === 'square' ? '1/1' : '16/9'
                  }}
                />
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm">Generating preview...</span>
                  </div>
                ) : (
                  <span className="text-sm">Preview will appear here</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}