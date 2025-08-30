export interface ReputationLevel {
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  color: string;
  description: string;
  benefits: string[];
}

export const REPUTATION_LEVELS: ReputationLevel[] = [
  {
    name: 'Seeker',
    minPoints: 0,
    maxPoints: 100,
    icon: '🌱',
    color: 'green',
    description: 'Beginning your journey into wisdom',
    benefits: [
      'Create annotations',
      'Highlight verses',
      'Vote on content'
    ]
  },
  {
    name: 'Student',
    minPoints: 100,
    maxPoints: 500,
    icon: '📖',
    color: 'blue',
    description: 'Actively studying and sharing insights',
    benefits: [
      'All Seeker benefits',
      'Create comment threads',
      'Badge next to username',
      'Priority in search results'
    ]
  },
  {
    name: 'Scholar',
    minPoints: 500,
    maxPoints: 2000,
    icon: '🎓',
    color: 'purple',
    description: 'Recognized for valuable contributions',
    benefits: [
      'All Student benefits',
      'Verified badge',
      'Pin annotations',
      'Create study groups',
      'Advanced formatting tools'
    ]
  },
  {
    name: 'Sage',
    minPoints: 2000,
    maxPoints: Infinity,
    icon: '✨',
    color: 'amber',
    description: 'Master of biblical wisdom and teaching',
    benefits: [
      'All Scholar benefits',
      'Golden badge',
      'Moderate content',
      'Create teaching series',
      'Early access to features',
      'Direct message privileges'
    ]
  }
];

export interface ReputationPoints {
  annotations: number;
  upvotesReceived: number;
  downvotesReceived: number;
  dailyReading: number;
  highlights: number;
  comments: number;
  shares: number;
}

export const POINTS_CONFIG = {
  CREATE_ANNOTATION: 10,
  RECEIVE_UPVOTE: 2,
  RECEIVE_DOWNVOTE: -1,
  DAILY_READING: 5,
  CREATE_HIGHLIGHT: 1,
  CREATE_COMMENT: 3,
  SHARE_VERSE: 2,
  FIRST_ANNOTATION_OF_DAY: 10,
  STREAK_BONUS_7_DAYS: 20,
  STREAK_BONUS_30_DAYS: 100,
  QUALITY_ANNOTATION_BONUS: 25, // For annotations with 10+ net upvotes
};

export function calculateReputation(points: ReputationPoints): number {
  let total = 0;
  
  // Basic points
  total += points.annotations * POINTS_CONFIG.CREATE_ANNOTATION;
  total += points.upvotesReceived * POINTS_CONFIG.RECEIVE_UPVOTE;
  total += points.downvotesReceived * POINTS_CONFIG.RECEIVE_DOWNVOTE;
  total += points.dailyReading * POINTS_CONFIG.DAILY_READING;
  total += points.highlights * POINTS_CONFIG.CREATE_HIGHLIGHT;
  total += points.comments * POINTS_CONFIG.CREATE_COMMENT;
  total += points.shares * POINTS_CONFIG.SHARE_VERSE;
  
  // Ensure non-negative
  return Math.max(0, total);
}

export function getReputationLevel(points: number): ReputationLevel {
  for (const level of REPUTATION_LEVELS) {
    if (points >= level.minPoints && points < level.maxPoints) {
      return level;
    }
  }
  return REPUTATION_LEVELS[REPUTATION_LEVELS.length - 1]; // Sage
}

export function getProgressToNextLevel(points: number): {
  current: ReputationLevel;
  next: ReputationLevel | null;
  progress: number;
  pointsNeeded: number;
} {
  const current = getReputationLevel(points);
  const currentIndex = REPUTATION_LEVELS.findIndex(l => l.name === current.name);
  const next = currentIndex < REPUTATION_LEVELS.length - 1 
    ? REPUTATION_LEVELS[currentIndex + 1]
    : null;
  
  if (!next) {
    return {
      current,
      next: null,
      progress: 100,
      pointsNeeded: 0
    };
  }
  
  const pointsInLevel = points - current.minPoints;
  const levelRange = next.minPoints - current.minPoints;
  const progress = (pointsInLevel / levelRange) * 100;
  const pointsNeeded = next.minPoints - points;
  
  return {
    current,
    next,
    progress: Math.min(100, Math.max(0, progress)),
    pointsNeeded
  };
}

// Water-themed achievements/badges
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: any) => boolean;
  points: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-drop',
    name: 'First Drop',
    description: 'Create your first annotation',
    icon: '💧',
    requirement: (stats) => stats.annotations >= 1,
    points: 10
  },
  {
    id: 'flowing-wisdom',
    name: 'Flowing Wisdom',
    description: 'Create 10 annotations',
    icon: '🌊',
    requirement: (stats) => stats.annotations >= 10,
    points: 50
  },
  {
    id: 'daily-drinker',
    name: 'Daily Drinker',
    description: 'Read scripture for 7 consecutive days',
    icon: '🏺',
    requirement: (stats) => stats.readingStreak >= 7,
    points: 30
  },
  {
    id: 'well-of-knowledge',
    name: 'Well of Knowledge',
    description: 'Receive 100 upvotes',
    icon: '⛲',
    requirement: (stats) => stats.totalUpvotes >= 100,
    points: 100
  },
  {
    id: 'rain-maker',
    name: 'Rain Maker',
    description: 'Share 50 verses',
    icon: '🌧️',
    requirement: (stats) => stats.shares >= 50,
    points: 75
  },
  {
    id: 'deep-well',
    name: 'Deep Well',
    description: 'Annotate verses from all 66 books',
    icon: '🌑',
    requirement: (stats) => stats.uniqueBooks >= 66,
    points: 500
  },
  {
    id: 'living-water',
    name: 'Living Water',
    description: 'Maintain a 30-day reading streak',
    icon: '💎',
    requirement: (stats) => stats.readingStreak >= 30,
    points: 200
  },
  {
    id: 'fountain-of-youth',
    name: 'Fountain of Youth',
    description: 'Help 100 users with your annotations',
    icon: '⛲',
    requirement: (stats) => stats.helpfulVotes >= 100,
    points: 150
  }
];

export function checkAchievements(userStats: any): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.requirement(userStats));
}

export function calculateAchievementPoints(achievements: Achievement[]): number {
  return achievements.reduce((total, achievement) => total + achievement.points, 0);
}