'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

interface Notification {
  id: string;
  type: 'annotation' | 'comment' | 'upvote' | 'follow' | 'achievement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  icon: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock notifications
  useEffect(() => {
    if (user) {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'annotation',
          title: 'New wisdom on your verse',
          message: 'Sarah added an annotation to Genesis 1:1',
          link: '/genesis/1#verse-1',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          icon: '💧'
        },
        {
          id: '2',
          type: 'upvote',
          title: 'Your wisdom is appreciated',
          message: 'David upvoted your annotation on John 3:16',
          link: '/john/3#verse-16',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          icon: '👍'
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Achievement unlocked!',
          message: 'You earned "Daily Drinker" - 7 day reading streak',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          icon: '🏆'
        },
        {
          id: '4',
          type: 'comment',
          title: 'New ripple in discussion',
          message: 'Grace replied to your comment',
          link: '/genesis/1',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          icon: '💬'
        },
        {
          id: '5',
          type: 'follow',
          title: 'New follower',
          message: 'John started following you',
          link: '/profile/john',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          icon: '👤'
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    }
  }, [user]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  if (!user) return null;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-water-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Water drop animation on new notification */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-water-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-water-500" />
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-slide-down max-h-[32rem] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`
                    px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer
                    ${!notification.read ? 'bg-water-50/50 dark:bg-water-900/10' : ''}
                  `}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.link) {
                      setIsOpen(false);
                      // Navigate to link
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <span className="text-2xl flex-shrink-0 mt-1">
                      {notification.icon}
                    </span>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-water-500 rounded-full mt-2 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Link indicator */}
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-xs text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 mt-2 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View →
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <span className="text-4xl mb-3 block opacity-50">💧</span>
                <p className="text-gray-600 dark:text-gray-400">
                  No notifications yet
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Your wisdom drops will appear here
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/notifications"
                className="text-sm text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}