import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface ReadingProgress {
  completedAt: string;
  notes?: string;
  timeSpent?: number;
  passages?: string[];
}

export interface ActivePlan {
  id: string;
  name: string;
  startDate: string;
  targetEndDate: string;
  currentDay: number;
  totalDays: number;
  isPaused?: boolean;
  pausedAt?: string;
}

export interface UserPreferences {
  reminderTime: string;
  reminderEnabled: boolean;
  weekendMode: boolean;
  catchUpMode: boolean;
  timezone: string;
  dailyGoalMinutes: number;
}

export interface ReadingStats {
  totalDaysRead: number;
  totalMinutesRead: number;
  booksCompleted: string[];
  chaptersCompleted: number;
  favoriteTime: 'morning' | 'afternoon' | 'evening' | 'night';
  perfectWeeks: number;
  morningReads: number;
  afternoonReads: number;
  eveningReads: number;
  nightReads: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
}

interface ReadingPlanState {
  // Current plan
  activePlan: ActivePlan | null;
  
  // Progress tracking
  completedDays: Record<number, ReadingProgress>;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  
  // User preferences
  preferences: UserPreferences;
  
  // Statistics
  stats: ReadingStats;
  
  // Achievements
  achievements: Achievement[];
  
  // Actions
  startPlan: (planId: string, planName: string, duration: number) => Promise<void>;
  completeDay: (day: number, notes?: string, timeSpent?: number) => void;
  markPassageRead: (day: number, passage: string) => void;
  calculateStreak: () => number;
  skipDay: (day: number, reason?: string) => void;
  pausePlan: () => void;
  resumePlan: () => void;
  resetPlan: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  checkAchievements: (day?: number, notes?: string, timeSpent?: number) => void;
  getTodaysReading: () => number | null;
  getReadingProgress: (day: number) => ReadingProgress | undefined;
  isDateCompleted: (date: Date) => boolean;
  getMonthlyProgress: (year: number, month: number) => Record<number, boolean>;
}

export const useReadingPlanStore = create<ReadingPlanState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      activePlan: null,
      completedDays: {},
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
      preferences: {
        reminderTime: '08:00',
        reminderEnabled: true,
        weekendMode: false,
        catchUpMode: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dailyGoalMinutes: 15
      },
      stats: {
        totalDaysRead: 0,
        totalMinutesRead: 0,
        booksCompleted: [],
        chaptersCompleted: 0,
        favoriteTime: 'morning',
        perfectWeeks: 0,
        morningReads: 0,
        afternoonReads: 0,
        eveningReads: 0,
        nightReads: 0
      },
      achievements: [],
      
      // Actions
      startPlan: async (planId: string, planName: string, duration: number) => {
        const startDate = new Date();
        const targetEndDate = new Date(startDate.getTime() + duration * 86400000);
        
        set((state) => {
          state.activePlan = {
            id: planId,
            name: planName,
            startDate: startDate.toISOString(),
            targetEndDate: targetEndDate.toISOString(),
            currentDay: 1,
            totalDays: duration,
            isPaused: false
          };
          state.completedDays = {};
          state.currentStreak = 0;
          state.achievements = [];
        });
      },
      
      completeDay: (day: number, notes?: string, timeSpent?: number) => {
        const now = new Date();
        const hour = now.getHours();
        
        set((state) => {
          // Mark day complete
          state.completedDays[day] = {
            completedAt: now.toISOString(),
            notes,
            timeSpent: timeSpent || state.preferences.dailyGoalMinutes,
            passages: []
          };
          
          // Update current day
          if (state.activePlan && day >= state.activePlan.currentDay) {
            state.activePlan.currentDay = day + 1;
          }
          
          // Update stats
          state.stats.totalDaysRead++;
          state.stats.totalMinutesRead += timeSpent || state.preferences.dailyGoalMinutes;
          
          // Track time of day
          if (hour < 6 || hour >= 22) {
            state.stats.nightReads++;
          } else if (hour < 12) {
            state.stats.morningReads++;
          } else if (hour < 17) {
            state.stats.afternoonReads++;
          } else {
            state.stats.eveningReads++;
          }
          
          // Update streak
          const lastRead = state.lastReadDate ? new Date(state.lastReadDate) : null;
          const today = now.toDateString();
          const yesterday = new Date(now.getTime() - 86400000).toDateString();
          
          if (!lastRead || lastRead.toDateString() === yesterday || lastRead.toDateString() === today) {
            if (lastRead?.toDateString() !== today) {
              state.currentStreak++;
            }
          } else {
            state.currentStreak = 1;
          }
          
          if (state.currentStreak > state.longestStreak) {
            state.longestStreak = state.currentStreak;
          }
          
          // Check for perfect week
          if (state.currentStreak > 0 && state.currentStreak % 7 === 0) {
            state.stats.perfectWeeks++;
          }
          
          state.lastReadDate = now.toISOString();
        });
        
        // Check for new achievements
        get().checkAchievements(day, notes, timeSpent);
      },
      
      markPassageRead: (day: number, passage: string) => {
        set((state) => {
          if (!state.completedDays[day]) {
            state.completedDays[day] = {
              completedAt: new Date().toISOString(),
              passages: []
            };
          }
          if (!state.completedDays[day].passages) {
            state.completedDays[day].passages = [];
          }
          if (!state.completedDays[day].passages!.includes(passage)) {
            state.completedDays[day].passages!.push(passage);
          }
        });
      },
      
      calculateStreak: () => {
        const state = get();
        if (!state.lastReadDate) return 0;
        
        const lastRead = new Date(state.lastReadDate);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - lastRead.getTime()) / 86400000);
        
        // If last read was today or yesterday, streak continues
        if (diffDays === 0 || diffDays === 1) {
          return state.currentStreak;
        }
        
        // Streak is broken
        return 0;
      },
      
      skipDay: (day: number, reason?: string) => {
        set((state) => {
          state.completedDays[day] = {
            completedAt: new Date().toISOString(),
            notes: reason ? `Skipped: ${reason}` : 'Skipped'
          };
          
          if (state.activePlan) {
            state.activePlan.currentDay = day + 1;
          }
        });
      },
      
      pausePlan: () => {
        set((state) => {
          if (state.activePlan) {
            state.activePlan.isPaused = true;
            state.activePlan.pausedAt = new Date().toISOString();
          }
        });
      },
      
      resumePlan: () => {
        set((state) => {
          if (state.activePlan) {
            state.activePlan.isPaused = false;
            // Adjust target end date based on pause duration
            if (state.activePlan.pausedAt) {
              const pauseDuration = Date.now() - new Date(state.activePlan.pausedAt).getTime();
              const newEndDate = new Date(state.activePlan.targetEndDate).getTime() + pauseDuration;
              state.activePlan.targetEndDate = new Date(newEndDate).toISOString();
              state.activePlan.pausedAt = undefined;
            }
          }
        });
      },
      
      resetPlan: () => {
        set((state) => {
          state.activePlan = null;
          state.completedDays = {};
          state.currentStreak = 0;
        });
      },
      
      updatePreferences: (prefs: Partial<UserPreferences>) => {
        set((state) => {
          state.preferences = { ...state.preferences, ...prefs };
        });
      },
      
      checkAchievements: (_day?: number, notes?: string, timeSpent?: number) => {
        const state = get();
        const newAchievements: Achievement[] = [];
        const existingIds = new Set(state.achievements.map(a => a.id));
        const totalDays = state.stats.totalDaysRead;
        const newStreak = state.currentStreak;
        
        // First day achievement
        if (totalDays === 1 && !existingIds.has('first-day')) {
          newAchievements.push({
            id: 'first-day',
            name: 'First Step',
            description: 'Completed your first day of reading',
            icon: '🌱',
            points: 10,
            unlockedAt: new Date()
          });
        }
        
        // Streak achievements
        const streakAchievements = [
          { days: 3, id: 'streak-3', name: 'Building Momentum', description: 'Read for 3 days in a row', icon: '🔥', points: 25 },
          { days: 7, id: 'streak-7', name: 'Week Warrior', description: 'Read for 7 days straight', icon: '⚡', points: 50 },
          { days: 14, id: 'streak-14', name: 'Fortnight Champion', description: 'Read for 14 days straight', icon: '🌟', points: 75 },
          { days: 30, id: 'streak-30', name: 'Monthly Master', description: 'Read for 30 days in a row', icon: '🏆', points: 150 },
          { days: 60, id: 'streak-60', name: 'Marathon Reader', description: 'Read for 60 days in a row', icon: '🏃‍♂️', points: 300 },
          { days: 100, id: 'streak-100', name: 'Century Club', description: 'Read for 100 days in a row', icon: '👑', points: 500 }
        ];
        
        streakAchievements.forEach(achievement => {
          if (newStreak >= achievement.days && !existingIds.has(achievement.id)) {
            newAchievements.push({
              ...achievement,
              unlockedAt: new Date()
            });
          }
        });
        
        // Total days achievements
        const milestoneAchievements = [
          { days: 7, id: 'milestone-7', name: 'First Week', description: 'Completed 7 days of reading', icon: '📖', points: 35 },
          { days: 30, id: 'milestone-30', name: 'Month Complete', description: 'Completed 30 days of reading', icon: '📅', points: 100 },
          { days: 50, id: 'milestone-50', name: 'Half Century', description: 'Completed 50 days of reading', icon: '🎯', points: 175 },
          { days: 100, id: 'milestone-100', name: 'Centurion', description: 'Completed 100 days of reading', icon: '💯', points: 300 },
          { days: 200, id: 'milestone-200', name: 'Bicentennial', description: 'Completed 200 days of reading', icon: '🎊', points: 500 },
          { days: 365, id: 'milestone-365', name: 'Annual Reader', description: 'Completed a full year of reading', icon: '🗓️', points: 1000 }
        ];
        
        milestoneAchievements.forEach(achievement => {
          if (totalDays >= achievement.days && !existingIds.has(achievement.id)) {
            newAchievements.push({
              ...achievement,
              unlockedAt: new Date()
            });
          }
        });
        
        // Time-based achievements
        if (timeSpent && timeSpent >= 30 && !existingIds.has('devoted-reader')) {
          newAchievements.push({
            id: 'devoted-reader',
            name: 'Devoted Reader',
            description: 'Spent 30+ minutes reading in one session',
            icon: '⏰',
            points: 40,
            unlockedAt: new Date()
          });
        }
        
        if (timeSpent && timeSpent >= 60 && !existingIds.has('marathon-session')) {
          newAchievements.push({
            id: 'marathon-session',
            name: 'Marathon Session',
            description: 'Spent 60+ minutes reading in one session',
            icon: '🕐',
            points: 80,
            unlockedAt: new Date()
          });
        }
        
        // Notes achievements
        if (notes && notes.length > 50 && !existingIds.has('thoughtful-reader')) {
          newAchievements.push({
            id: 'thoughtful-reader',
            name: 'Thoughtful Reader',
            description: 'Wrote detailed notes about your reading',
            icon: '📝',
            points: 30,
            unlockedAt: new Date()
          });
        }
        
        // Time of day achievements
        if (state.stats.morningReads >= 10 && !existingIds.has('early-bird')) {
          newAchievements.push({
            id: 'early-bird',
            name: 'Early Bird',
            description: 'Read in the morning 10 times',
            icon: '🌅',
            points: 40,
            unlockedAt: new Date()
          });
        }
        
        if (state.stats.nightReads >= 10 && !existingIds.has('night-owl')) {
          newAchievements.push({
            id: 'night-owl',
            name: 'Night Owl',
            description: 'Read late at night 10 times',
            icon: '🦉',
            points: 40,
            unlockedAt: new Date()
          });
        }
        
        // Perfect week achievement
        if (state.stats.perfectWeeks >= 1 && !existingIds.has('perfect-week')) {
          newAchievements.push({
            id: 'perfect-week',
            name: 'Perfect Week',
            description: 'Completed 7 consecutive days',
            icon: '💯',
            points: 100,
            unlockedAt: new Date()
          });
        }
        
        // Plan completion achievements
        if (state.activePlan) {
          const completionPercentage = (totalDays / state.activePlan.totalDays) * 100;
          
          if (completionPercentage >= 25 && !existingIds.has('quarter-complete')) {
            newAchievements.push({
              id: 'quarter-complete',
              name: 'Quarter Complete',
              description: 'Completed 25% of your reading plan',
              icon: '🎯',
              points: 75,
              unlockedAt: new Date()
            });
          }
          
          if (completionPercentage >= 50 && !existingIds.has('halfway-hero')) {
            newAchievements.push({
              id: 'halfway-hero',
              name: 'Halfway Hero',
              description: 'Completed 50% of your reading plan',
              icon: '🏁',
              points: 150,
              unlockedAt: new Date()
            });
          }
          
          if (completionPercentage >= 75 && !existingIds.has('home-stretch')) {
            newAchievements.push({
              id: 'home-stretch',
              name: 'Home Stretch',
              description: 'Completed 75% of your reading plan',
              icon: '🎖️',
              points: 250,
              unlockedAt: new Date()
            });
          }
          
          if (completionPercentage >= 100 && !existingIds.has('plan-complete')) {
            newAchievements.push({
              id: 'plan-complete',
              name: 'Plan Complete',
              description: 'Completed your entire reading plan!',
              icon: '🏆',
              points: 500,
              unlockedAt: new Date()
            });
          }
        }
        
        if (newAchievements.length > 0) {
          set((state) => {
            state.achievements.push(...newAchievements);
          });
          
          // Show achievement notification
          newAchievements.forEach(achievement => {
            console.log(`🎉 Achievement Unlocked: ${achievement.name} (+${achievement.points} points)`);
          });
        }
      },
      
      getTodaysReading: () => {
        const state = get();
        if (!state.activePlan || state.activePlan.isPaused) return null;
        
        const startDate = new Date(state.activePlan.startDate);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - startDate.getTime()) / 86400000);
        
        return Math.min(diffDays + 1, state.activePlan.currentDay);
      },
      
      getReadingProgress: (day: number) => {
        return get().completedDays[day];
      },
      
      isDateCompleted: (date: Date) => {
        const state = get();
        if (!state.activePlan) return false;
        
        const startDate = new Date(state.activePlan.startDate);
        const diffDays = Math.floor((date.getTime() - startDate.getTime()) / 86400000);
        const dayNumber = diffDays + 1;
        
        return !!state.completedDays[dayNumber];
      },
      
      getMonthlyProgress: (year: number, month: number) => {
        const state = get();
        if (!state.activePlan) return {};
        
        const progress: Record<number, boolean> = {};
        const startDate = new Date(state.activePlan.startDate);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const diffDays = Math.floor((date.getTime() - startDate.getTime()) / 86400000);
          const dayNumber = diffDays + 1;
          
          if (dayNumber > 0 && dayNumber <= 365) {
            progress[day] = !!state.completedDays[dayNumber];
          }
        }
        
        return progress;
      }
    })),
    {
      name: 'holydrop-reading-plans',
      storage: createJSONStorage(() => localStorage),
    }
  )
);