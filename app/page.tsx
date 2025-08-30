"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ActivityItem {
  id: string;
  type: 'annotation' | 'highlight' | 'comment';
  user: string;
  userLevel: string;
  action: string;
  reference: string;
  link: string;
  timeAgo: string;
}

interface PopularVerse {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  annotationCount: number;
}

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({
    wisdomDrops: 0,
    activeUsers: 0,
    versesCovered: 0,
    dailyReaders: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [popularVerses, setPopularVerses] = useState<PopularVerse[]>([]);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        wisdomDrops: 1247,
        activeUsers: 384,
        versesCovered: 892,
        dailyReaders: 156
      });

      setRecentActivity([
        {
          id: '1',
          type: 'annotation',
          user: 'Sarah',
          userLevel: 'Scholar',
          action: 'added wisdom to',
          reference: 'Genesis 1:1',
          link: '/genesis/1#verse-1',
          timeAgo: '5m ago'
        },
        {
          id: '2',
          type: 'highlight',
          user: 'David',
          userLevel: 'Student',
          action: 'highlighted',
          reference: 'John 3:16',
          link: '/john/3#verse-16',
          timeAgo: '12m ago'
        },
        {
          id: '3',
          type: 'comment',
          user: 'Grace',
          userLevel: 'Seeker',
          action: 'commented on',
          reference: 'Psalm 23:1',
          link: '/psalms/23#verse-1',
          timeAgo: '1h ago'
        }
      ]);

      setPopularVerses([
        {
          reference: 'John 3:16',
          book: 'John',
          chapter: 3,
          verse: 16,
          text: 'For God so loved the world, that he gave his only begotten Son...',
          annotationCount: 47
        },
        {
          reference: 'Genesis 1:1',
          book: 'Genesis', 
          chapter: 1,
          verse: 1,
          text: 'In the beginning God created the heaven and the earth.',
          annotationCount: 38
        },
        {
          reference: 'Psalm 23:1',
          book: 'Psalms',
          chapter: 23,
          verse: 1,
          text: 'The LORD is my shepherd; I shall not want.',
          annotationCount: 29
        }
      ]);

    }, 1000);

    // Animate stats on load
    const animateCounter = (target: number, setter: (value: number) => void) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 20);
    };

    setTimeout(() => {
      animateCounter(1247, (val) => setStats(prev => ({ ...prev, wisdomDrops: val })));
      animateCounter(384, (val) => setStats(prev => ({ ...prev, activeUsers: val })));
      animateCounter(892, (val) => setStats(prev => ({ ...prev, versesCovered: val })));
      animateCounter(156, (val) => setStats(prev => ({ ...prev, dailyReaders: val })));
    }, 500);
  }, []);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Seeker': return '🌱';
      case 'Student': return '📖';
      case 'Scholar': return '🎓';
      case 'Sage': return '✨';
      default: return '💧';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-water-50 to-water-100 dark:from-water-900 dark:to-background">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 relative overflow-hidden">
        {/* Animated water drops background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="water-drop-1 absolute top-20 left-1/4 w-4 h-4 bg-water-400 rounded-full opacity-20"></div>
          <div className="water-drop-2 absolute top-40 right-1/3 w-6 h-6 bg-water-500 rounded-full opacity-15"></div>
          <div className="water-drop-3 absolute bottom-20 left-1/3 w-5 h-5 bg-water-400 rounded-full opacity-25"></div>
        </div>

        <main className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-3xl">
          <div className="space-y-4">
            <h1 className="text-6xl sm:text-8xl font-bold bg-gradient-to-b from-water-600 to-water-800 dark:from-water-400 dark:to-water-600 bg-clip-text text-transparent animate-fade-in">
              holydrop 💧
            </h1>
            
            <p className="text-2xl sm:text-3xl text-water-700 dark:text-water-300 font-medium animate-slide-up">
              Where wisdom drops onto scripture
            </p>
            
            <p className="text-lg sm:text-xl text-muted-foreground animate-slide-up animation-delay-100">
              Community-powered Bible annotations
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap justify-center animate-fade-in animation-delay-200">
            <Link
              href="/genesis/1"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-water-500 to-water-600 rounded-full shadow-lg group-hover:shadow-xl transition-shadow"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-water-500 to-water-600 rounded-full opacity-50 blur-md group-hover:blur-lg transition-all animate-water-ripple"></span>
              <span className="relative text-white font-semibold">
                Start Your Journey 🚀
              </span>
            </Link>
            
            <Link
              href="/search"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <span className="absolute inset-0 bg-white dark:bg-gray-800 rounded-full shadow-lg group-hover:shadow-xl transition-shadow"></span>
              <span className="relative text-water-600 dark:text-water-400 font-semibold">
                Search Scriptures 🔍
              </span>
            </Link>
          </div>
        </main>
      </div>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="text-4xl font-bold text-water-600 dark:text-water-400 flex items-center justify-center gap-2">
                <span className="group-hover:animate-pulse">💧</span>
                <span className="tabular-nums">{stats.wisdomDrops.toLocaleString()}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Drops of Wisdom</p>
            </div>
            
            <div className="text-center group">
              <div className="text-4xl font-bold text-water-600 dark:text-water-400">
                <span className="tabular-nums">{stats.activeUsers.toLocaleString()}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Active Seekers</p>
            </div>
            
            <div className="text-center group">
              <div className="text-4xl font-bold text-water-600 dark:text-water-400">
                <span className="tabular-nums">{stats.versesCovered.toLocaleString()}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Verses Covered</p>
            </div>
            
            <div className="text-center group">
              <div className="text-4xl font-bold text-water-600 dark:text-water-400">
                <span className="tabular-nums">{stats.dailyReaders.toLocaleString()}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Daily Readers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity & Popular Verses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Recent Activity */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="text-3xl">🌊</span> Recent Activity
              </h2>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => router.push(activity.link)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-water-400 to-water-600 rounded-full flex items-center justify-center text-white font-bold">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-xs ml-1">{getLevelIcon(activity.userLevel)}</span>
                        <span className="mx-1 text-gray-600 dark:text-gray-400">{activity.action}</span>
                        <span className="font-medium text-water-600 dark:text-water-400">{activity.reference}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                    </div>
                  </div>
                ))}
                
                <Link 
                  href="/activity"
                  className="block text-center text-sm text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 font-medium pt-2"
                >
                  View all activity →
                </Link>
              </div>
            </div>

            {/* Popular Verses */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="text-3xl">🔥</span> Popular Verses
              </h2>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
                {popularVerses.map((verse, index) => (
                  <Link
                    key={verse.reference}
                    href={`/${verse.book.toLowerCase()}/${verse.chapter}#verse-${verse.verse}`}
                    className="block p-4 hover:bg-water-50 dark:hover:bg-water-900/20 rounded-lg transition-colors animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-water-600 dark:text-water-400">
                        {verse.reference}
                      </h3>
                      <span className="text-xs bg-water-100 dark:bg-water-900/30 text-water-700 dark:text-water-300 px-2 py-1 rounded-full">
                        {verse.annotationCount} annotations
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      "{verse.text}"
                    </p>
                  </Link>
                ))}
                
                <Link 
                  href="/popular"
                  className="block text-center text-sm text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 font-medium pt-2"
                >
                  Explore more verses →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Chapters */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-water-800 dark:text-water-200">
          Begin Your Study
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/genesis/1" className="group">
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-water-200 dark:border-water-700 group-hover:border-water-400 group-hover:scale-105">
              <h3 className="text-xl font-bold mb-2 text-water-700 dark:text-water-300">
                Genesis 1
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The Creation - In the beginning God created the heaven and the earth...
              </p>
              <div className="mt-3 text-water-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Start reading →
              </div>
            </div>
          </Link>
          
          <Link href="/john/3" className="group">
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-water-200 dark:border-water-700 group-hover:border-water-400 group-hover:scale-105">
              <h3 className="text-xl font-bold mb-2 text-water-700 dark:text-water-300">
                John 3
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Born Again - There was a man of the Pharisees, named Nicodemus...
              </p>
              <div className="mt-3 text-water-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Start reading →
              </div>
            </div>
          </Link>

          <Link href="/psalms/23" className="group">
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-water-200 dark:border-water-700 group-hover:border-water-400 group-hover:scale-105">
              <h3 className="text-xl font-bold mb-2 text-water-700 dark:text-water-300">
                Psalm 23
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The LORD is my shepherd - A Psalm of David...
              </p>
              <div className="mt-3 text-water-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Start reading →
              </div>
            </div>
          </Link>
        </div>
      </section>

      <style jsx>{`
        @keyframes water-drop {
          0% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateY(200px) scale(1);
            opacity: 0.3;
          }
          100% {
            transform: translateY(500px) scale(1.5);
            opacity: 0;
          }
        }

        .water-drop-1 {
          animation: water-drop 8s ease-in-out infinite;
        }
        
        .water-drop-2 {
          animation: water-drop 10s ease-in-out infinite 2s;
        }
        
        .water-drop-3 {
          animation: water-drop 12s ease-in-out infinite 4s;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out backwards;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
}