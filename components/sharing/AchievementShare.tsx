'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Share2, 
  Download, 
  Trophy,
  Loader2,
  Check
} from 'lucide-react';
import { useReadingPlanStore } from '@/lib/stores/readingPlanStore';

interface AchievementShareProps {
  type: 'streak' | 'plan-complete' | 'achievement' | 'stats';
  data?: {
    streakDays?: number;
    planName?: string;
    achievement?: {
      name: string;
      description: string;
      icon: string;
      points: number;
    };
    stats?: {
      totalDays: number;
      longestStreak: number;
      plansCompleted: number;
      totalPoints: number;
    };
  };
}

export function AchievementShare({ type, data }: AchievementShareProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { currentStreak, longestStreak, stats, achievements, activePlan } = useReadingPlanStore();
  
  useEffect(() => {
    generateCard();
  }, [type, data]);
  
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  const generateCard = async () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size (Instagram square format)
      const size = 1080;
      canvas.width = size;
      canvas.height = size;
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Configure text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Draw content based on type
      switch (type) {
        case 'streak':
          await drawStreakCard(ctx, size, data?.streakDays || currentStreak);
          break;
        case 'plan-complete':
          await drawPlanCompleteCard(ctx, size, data?.planName || activePlan?.name || 'Reading Plan');
          break;
        case 'achievement':
          await drawAchievementCard(ctx, size, data?.achievement);
          break;
        case 'stats':
          await drawStatsCard(ctx, size, data?.stats || {
            totalDays: stats.totalDaysRead,
            longestStreak,
            plansCompleted: 1,
            totalPoints: achievements.reduce((sum, a) => sum + a.points, 0)
          });
          break;
      }
      
      // Add watermark
      ctx.globalAlpha = 0.7;
      ctx.font = '32px Inter, sans-serif';
      ctx.fillText('HolyDrop', size / 2, size - 50);
      ctx.globalAlpha = 1;
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          setGeneratedCard(blob);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Failed to generate achievement card:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const drawStreakCard = async (ctx: CanvasRenderingContext2D, size: number, streakDays: number) => {
    // Title
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText('🔥 READING STREAK!', size / 2, 200);
    
    // Streak number
    ctx.font = 'bold 180px Inter, sans-serif';
    ctx.fillText(`${streakDays}`, size / 2, 400);
    
    // Days label
    ctx.font = 'bold 72px Inter, sans-serif';
    ctx.fillText(streakDays === 1 ? 'DAY' : 'DAYS', size / 2, 500);
    
    // Motivation text
    ctx.font = '48px Inter, sans-serif';
    ctx.globalAlpha = 0.9;
    ctx.fillText('Keep the fire burning!', size / 2, 650);
    
    // Progress indicators
    const maxDots = 30;
    const dotsToShow = Math.min(streakDays, maxDots);
    const dotSize = 8;
    const spacing = (size - 200) / maxDots;
    
    for (let i = 0; i < maxDots; i++) {
      ctx.globalAlpha = i < dotsToShow ? 1 : 0.3;
      ctx.beginPath();
      ctx.arc(100 + (i * spacing), 750, dotSize, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    if (streakDays > maxDots) {
      ctx.globalAlpha = 1;
      ctx.font = '32px Inter, sans-serif';
      ctx.fillText(`+${streakDays - maxDots} more!`, size / 2, 800);
    }
  };
  
  const drawPlanCompleteCard = async (ctx: CanvasRenderingContext2D, size: number, planName: string) => {
    // Title
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText('🏆 PLAN COMPLETED!', size / 2, 200);
    
    // Plan name (with text wrapping)
    ctx.font = 'bold 56px Inter, sans-serif';
    const words = planName.split(' ');
    let line = '';
    const lines = [];
    const maxWidth = size - 200;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    let y = 350;
    for (const textLine of lines) {
      ctx.fillText(textLine.trim(), size / 2, y);
      y += 70;
    }
    
    // Celebration text
    ctx.font = '48px Inter, sans-serif';
    ctx.globalAlpha = 0.9;
    ctx.fillText('Congratulations on your', size / 2, y + 50);
    ctx.fillText('spiritual journey!', size / 2, y + 110);
  };
  
  const drawAchievementCard = async (
    ctx: CanvasRenderingContext2D, 
    size: number, 
    achievement?: { name: string; description: string; icon: string; points: number }
  ) => {
    if (!achievement) return;
    
    // Title
    ctx.font = 'bold 56px Inter, sans-serif';
    ctx.fillText('🎉 ACHIEVEMENT UNLOCKED!', size / 2, 180);
    
    // Icon (emoji)
    ctx.font = '180px serif';
    ctx.fillText(achievement.icon, size / 2, 320);
    
    // Achievement name
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText(achievement.name, size / 2, 450);
    
    // Description
    ctx.font = '40px Inter, sans-serif';
    ctx.globalAlpha = 0.9;
    const descWords = achievement.description.split(' ');
    let descLine = '';
    const descLines = [];
    const maxWidth = size - 200;
    
    for (const word of descWords) {
      const testLine = descLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && descLine !== '') {
        descLines.push(descLine);
        descLine = word + ' ';
      } else {
        descLine = testLine;
      }
    }
    descLines.push(descLine);
    
    let y = 520;
    for (const line of descLines) {
      ctx.fillText(line.trim(), size / 2, y);
      y += 50;
    }
    
    // Points
    ctx.globalAlpha = 1;
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText(`+${achievement.points} Points`, size / 2, y + 70);
  };
  
  const drawStatsCard = async (
    ctx: CanvasRenderingContext2D, 
    size: number, 
    stats: { totalDays: number; longestStreak: number; plansCompleted: number; totalPoints: number }
  ) => {
    // Title
    ctx.font = 'bold 56px Inter, sans-serif';
    ctx.fillText('📊 MY READING JOURNEY', size / 2, 150);
    
    // Stats grid
    const statItems = [
      { label: 'Days Read', value: stats.totalDays.toString(), icon: '📖' },
      { label: 'Longest Streak', value: stats.longestStreak.toString(), icon: '🔥' },
      { label: 'Plans Completed', value: stats.plansCompleted.toString(), icon: '✅' },
      { label: 'Total Points', value: stats.totalPoints.toString(), icon: '🏆' },
    ];
    
    const startY = 250;
    const itemHeight = 130;
    
    statItems.forEach((item, index) => {
      const y = startY + (index * itemHeight);
      
      // Icon
      ctx.font = '72px serif';
      ctx.fillText(item.icon, 200, y);
      
      // Value
      ctx.font = 'bold 84px Inter, sans-serif';
      ctx.fillText(item.value, size / 2, y);
      
      // Label
      ctx.font = '36px Inter, sans-serif';
      ctx.globalAlpha = 0.8;
      ctx.fillText(item.label, size - 200, y);
      ctx.globalAlpha = 1;
    });
    
    // Bottom text
    ctx.font = '32px Inter, sans-serif';
    ctx.globalAlpha = 0.8;
    ctx.fillText('Building habits, one verse at a time', size / 2, size - 150);
  };
  
  const handleDownload = () => {
    if (!generatedCard) return;
    
    const url = URL.createObjectURL(generatedCard);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holydrop-${type}-achievement.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleShare = async () => {
    if (!generatedCard) return;
    
    // Check for native share API
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([generatedCard], `holydrop-${type}.jpg`, {
          type: 'image/jpeg',
        });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: getShareTitle(),
            text: getShareText(),
            files: [file],
          });
          return;
        }
      } catch (err) {
        console.log('Native share failed:', err);
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
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Share failed:', err);
      handleDownload();
    }
  };
  
  const getShareTitle = () => {
    switch (type) {
      case 'streak':
        return `🔥 ${data?.streakDays || currentStreak} Day Reading Streak!`;
      case 'plan-complete':
        return `🏆 Completed: ${data?.planName || 'Reading Plan'}`;
      case 'achievement':
        return `🎉 Achievement Unlocked: ${data?.achievement?.name}`;
      case 'stats':
        return '📊 My Bible Reading Journey';
      default:
        return 'My Bible Reading Achievement';
    }
  };
  
  const getShareText = () => {
    const base = 'Check out my Bible reading progress on HolyDrop! 📖✨';
    switch (type) {
      case 'streak':
        return `${base} Just hit a ${data?.streakDays || currentStreak} day reading streak! 🔥`;
      case 'plan-complete':
        return `${base} Just completed my ${data?.planName || 'reading plan'}! 🏆`;
      case 'achievement':
        return `${base} Unlocked: ${data?.achievement?.name}! 🎉`;
      case 'stats':
        return `${base} Building spiritual habits one verse at a time! 📊`;
      default:
        return base;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Share Your Achievement
        </h3>
      </div>
      
      {/* Canvas (hidden) */}
      <canvas 
        ref={canvasRef} 
        className="hidden"
        aria-hidden="true"
      />
      
      {/* Preview */}
      {previewUrl && (
        <div className="mb-4">
          <img
            src={previewUrl}
            alt="Achievement card preview"
            className="w-full max-w-sm mx-auto rounded-lg shadow-md"
          />
        </div>
      )}
      
      {/* Loading state */}
      {isGenerating && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Generating your achievement card...
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleShare}
          disabled={!generatedCard || isGenerating}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-water-500 hover:bg-water-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share Achievement
            </>
          )}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={!generatedCard || isGenerating}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
      
      {/* Tips */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 <strong>Pro tip:</strong> Share your achievements on social media to inspire others 
          and celebrate your spiritual growth journey!
        </p>
      </div>
    </div>
  );
}