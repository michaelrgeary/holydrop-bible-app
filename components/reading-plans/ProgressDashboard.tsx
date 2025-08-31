'use client';

import { useState, useEffect } from 'react';
import { useReadingPlanStore } from '@/lib/stores/readingPlanStore';
import { 
  Trophy, 
  Calendar, 
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function ProgressDashboard() {
  const { 
    activePlan, 
    currentStreak, 
    longestStreak, 
    achievements,
    completedDays,
    getMonthlyProgress
  } = useReadingPlanStore();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyProgress, setMonthlyProgress] = useState<Record<number, boolean>>({});
  
  useEffect(() => {
    // Get monthly progress
    const progress = getMonthlyProgress(
      currentMonth.getFullYear(), 
      currentMonth.getMonth()
    );
    setMonthlyProgress(progress);
  }, [currentMonth, getMonthlyProgress]);
  
  if (!activePlan) return null;
  
  const today = new Date();
  const totalDays = activePlan.totalDays;
  const progressPercentage = Math.min((Object.keys(completedDays).length / totalDays) * 100, 100);
  
  // Calculate calendar days
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };
  
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '❄️';
    if (streak < 7) return '🔥';
    if (streak < 30) return '🔥🔥';
    if (streak < 100) return '🔥🔥🔥';
    return '🌟';
  };
  
  const getTotalPoints = () => {
    return achievements.reduce((sum, a) => sum + a.points, 0);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Plan Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {activePlan.name}
        </h1>
        <div className="flex items-center justify-center gap-4 text-gray-600 dark:text-gray-400">
          <span>Day {activePlan.currentDay} of {totalDays}</span>
          {activePlan.isPaused && (
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">
              Paused
            </span>
          )}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Current Streak */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
            <span className="text-2xl">{getStreakEmoji(currentStreak)}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>
        
        {/* Longest Streak */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Best Streak</span>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
          </div>
        </div>
        
        {/* Total Days Read */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Days Read</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Object.keys(completedDays).length}
          </div>
        </div>
        
        {/* Total Points */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Points</span>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {getTotalPoints()}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-water-400 to-water-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{Object.keys(completedDays).length} days completed</span>
          <span>{totalDays - Object.keys(completedDays).length} days remaining</span>
        </div>
      </div>
      
      {/* Calendar Heatmap */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatMonthYear(currentMonth)}
          </h3>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
          
          {/* Empty cells for start of month */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isCompleted = monthlyProgress[day];
            const isToday = 
              currentMonth.getFullYear() === today.getFullYear() &&
              currentMonth.getMonth() === today.getMonth() &&
              day === today.getDate();
            
            return (
              <div
                key={day}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }
                  ${isToday ? 'ring-2 ring-water-500' : ''}
                `}
              >
                {day}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <span>Not completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded ring-2 ring-water-500"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
      
      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Achievements Unlocked
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.slice(0, 8).map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="text-2xl mb-1">{achievement.icon}</span>
                <span className="text-xs text-center font-medium text-gray-700 dark:text-gray-300">
                  {achievement.name}
                </span>
                <span className="text-xs text-gray-500">
                  +{achievement.points} pts
                </span>
              </div>
            ))}
          </div>
          
          {achievements.length > 8 && (
            <p className="text-center text-sm text-gray-500 mt-3">
              +{achievements.length - 8} more achievements
            </p>
          )}
        </div>
      )}
    </div>
  );
}