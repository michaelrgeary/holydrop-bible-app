"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { AuthModal } from "@/components/auth/AuthModal";

export default function Header() {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-b from-water-600 to-water-800 dark:from-water-400 dark:to-water-600 bg-clip-text text-transparent flex items-center gap-1"
        >
          holydrop <span className="text-2xl">💧</span>
        </Link>

        <nav className="flex items-center gap-4">
          <NotificationBell />
          {user ? (
            <>
              <Link
                href={`/profile/${user.email?.split('@')[0] || 'user'}`}
                className="text-sm text-muted-foreground hover:text-water-600 dark:hover:text-water-400 transition-colors"
              >
                {user.email}
              </Link>
              <button 
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-water-600 dark:hover:text-water-400 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-water-600 dark:hover:text-water-400 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-water-500 to-water-600 text-white rounded-lg hover:from-water-600 hover:to-water-700 transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}