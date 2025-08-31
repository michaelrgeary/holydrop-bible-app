import { Search, Home, BookOpen, Heart } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const popularVerses = [
    {
      reference: "John 3:16",
      text: "For God so loved the world that he gave his one and only Son...",
      href: "/john/3/16"
    },
    {
      reference: "Romans 8:28",
      text: "And we know that in all things God works for the good...",
      href: "/romans/8/28"
    },
    {
      reference: "Philippians 4:13",
      text: "I can do all this through him who gives me strength.",
      href: "/philippians/4/13"
    },
    {
      reference: "Psalm 23:1",
      text: "The Lord is my shepherd, I lack nothing.",
      href: "/psalms/23/1"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Hero */}
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-water-500 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              The verse or page you're looking for doesn't exist, but God's word is eternal and always available.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 p-4 bg-water-500 hover:bg-water-600 text-white rounded-xl transition-colors group"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Go Home</span>
            </Link>
            
            <Link
              href="/search"
              className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">Search Verses</span>
            </Link>
          </div>

          {/* Popular Verses */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Popular Verses
              </h3>
            </div>
            
            <div className="space-y-4">
              {popularVerses.map((verse) => (
                <Link
                  key={verse.reference}
                  href={verse.href}
                  className="block p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-water-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-water-600 dark:group-hover:text-water-400">
                        {verse.reference}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {verse.text}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Helpful Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/reading-plans" 
              className="text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 transition-colors"
            >
              Reading Plans
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              href="/about" 
              className="text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 transition-colors"
            >
              About HolyDrop
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              href="/contact" 
              className="text-water-600 dark:text-water-400 hover:text-water-700 dark:hover:text-water-300 transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Bible Quote */}
          <div className="mt-12 p-6 bg-gradient-to-r from-water-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-water-200 dark:border-gray-600">
            <blockquote className="text-lg italic text-gray-700 dark:text-gray-300 mb-2">
              "Your word is a lamp for my feet, a light on my path."
            </blockquote>
            <cite className="text-sm font-medium text-water-600 dark:text-water-400">
              Psalm 119:105
            </cite>
          </div>
        </div>
      </div>
    </div>
  );
}