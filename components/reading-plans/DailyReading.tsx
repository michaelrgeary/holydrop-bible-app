'use client';

import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useReadingPlanStore } from '@/lib/stores/readingPlanStore';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Book, 
  MessageSquare,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface DailyReadingData {
  day: number;
  passages: Array<{
    book: string;
    startChapter: number;
    endChapter?: number;
    startVerse?: number;
    endVerse?: number;
  }>;
  theme?: string;
  estimatedMinutes: number;
}

export function DailyReading() {
  const router = useRouter();
  const { 
    activePlan, 
    completedDays, 
    completeDay, 
    markPassageRead,
    getTodaysReading,
    pausePlan,
    resumePlan
  } = useReadingPlanStore();
  
  const [currentDay, setCurrentDay] = useState(1);
  const [planData, setPlanData] = useState<any>(null);
  const [todaysReading, setTodaysReading] = useState<DailyReadingData | null>(null);
  const [readingTimer, setReadingTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [completedPassages, setCompletedPassages] = useState<Set<string>>(new Set());

  // Load plan data
  useEffect(() => {
    if (!activePlan) return;
    
    fetch('/data/reading-plans/plans.json')
      .then(res => res.json())
      .then(data => {
        setPlanData(data[activePlan.id]);
        const todayNum = getTodaysReading() || 1;
        setCurrentDay(todayNum);
      })
      .catch(console.error);
  }, [activePlan, getTodaysReading]);

  // Update today's reading when day changes
  useEffect(() => {
    if (!planData || !planData.readings) return;
    
    const reading = planData.readings.find((r: any) => r.day === currentDay);
    setTodaysReading(reading || null);
    
    // Reset completed passages for new day
    setCompletedPassages(new Set());
    
    // Load any existing notes
    const progress = completedDays[currentDay];
    if (progress?.notes) {
      setNotes(progress.notes);
    } else {
      setNotes('');
    }
  }, [currentDay, planData, completedDays]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setReadingTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateDay(1),
    onSwipedRight: () => navigateDay(-1),
    trackMouse: true
  });

  const navigateDay = (direction: number) => {
    if (!planData) return;
    
    const newDay = currentDay + direction;
    if (newDay >= 1 && newDay <= planData.duration) {
      setCurrentDay(newDay);
      setReadingTimer(0);
      setIsTimerRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePassageClick = (passage: any) => {
    // Navigate to Bible reader
    const url = `/${passage.book}/${passage.startChapter}`;
    router.push(url);
  };

  const togglePassageComplete = (passageKey: string) => {
    const newCompleted = new Set(completedPassages);
    if (newCompleted.has(passageKey)) {
      newCompleted.delete(passageKey);
    } else {
      newCompleted.add(passageKey);
      markPassageRead(currentDay, passageKey);
    }
    setCompletedPassages(newCompleted);
  };

  const handleCompleteDay = () => {
    const timeInMinutes = Math.ceil(readingTimer / 60);
    completeDay(currentDay, notes, timeInMinutes);
    
    // Move to next day if not the last day
    if (currentDay < (planData?.duration || 365)) {
      navigateDay(1);
    }
  };

  const formatPassageReference = (passage: any) => {
    let ref = passage.book.replace(/-/g, ' ');
    ref = ref.charAt(0).toUpperCase() + ref.slice(1);
    
    if (passage.startVerse && passage.endVerse) {
      ref += ` ${passage.startChapter}:${passage.startVerse}-${passage.endVerse}`;
    } else if (passage.startVerse) {
      ref += ` ${passage.startChapter}:${passage.startVerse}`;
    } else if (passage.endChapter) {
      ref += ` ${passage.startChapter}-${passage.endChapter}`;
    } else {
      ref += ` ${passage.startChapter}`;
    }
    
    return ref;
  };

  if (!activePlan || !todaysReading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Loading today's reading...</p>
      </div>
    );
  }

  const isCompleted = !!completedDays[currentDay];
  const allPassagesRead = todaysReading.passages.every(p => 
    completedPassages.has(formatPassageReference(p))
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl" {...swipeHandlers}>
      {/* Day Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateDay(-1)}
          disabled={currentDay === 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Day {currentDay} of {planData.duration}
          </h2>
          {todaysReading.theme && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {todaysReading.theme}
            </p>
          )}
        </div>
        
        <button
          onClick={() => navigateDay(1)}
          disabled={currentDay === planData.duration}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Timer and Progress */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-lg font-mono">{formatTime(readingTimer)}</span>
            <span className="text-sm text-gray-500">
              / ~{todaysReading.estimatedMinutes} min
            </span>
          </div>
          
          <div className="flex gap-2">
            {!isTimerRunning ? (
              <button
                onClick={() => setIsTimerRunning(true)}
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                <Play className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsTimerRunning(false)}
                className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => {
                setReadingTimer(0);
                setIsTimerRunning(false);
              }}
              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-water-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(
                (completedPassages.size / todaysReading.passages.length) * 100, 
                100
              )}%` 
            }}
          />
        </div>
      </div>

      {/* Passages */}
      <div className="space-y-3 mb-6">
        {todaysReading.passages.map((passage, index) => {
          const passageKey = formatPassageReference(passage);
          const isRead = completedPassages.has(passageKey);
          
          return (
            <div
              key={index}
              className={`
                flex items-center gap-3 p-4 rounded-lg border transition-all
                ${isRead 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                }
              `}
            >
              <button
                onClick={() => togglePassageComplete(passageKey)}
                className={`
                  flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all
                  ${isRead 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 hover:border-green-400'
                  }
                `}
              >
                {isRead && (
                  <CheckCircle className="w-5 h-5 text-white" />
                )}
              </button>
              
              <button
                onClick={() => handlePassageClick(passage)}
                className="flex-1 text-left group"
              >
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-water-600 dark:group-hover:text-water-400">
                    {passageKey}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Notes Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Notes & Reflections</span>
        </button>
        
        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your thoughts, prayers, or key verses..."
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
            rows={4}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isCompleted && allPassagesRead && (
          <button
            onClick={handleCompleteDay}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
          >
            Complete Day {currentDay}
          </button>
        )}
        
        {isCompleted && (
          <div className="flex-1 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-lg text-center">
            ✓ Day {currentDay} Completed
          </div>
        )}
        
        {activePlan.isPaused ? (
          <button
            onClick={resumePlan}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
          >
            Resume Plan
          </button>
        ) : (
          <button
            onClick={pausePlan}
            className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg"
          >
            Pause Plan
          </button>
        )}
      </div>
    </div>
  );
}