import { Metadata } from 'next';
import { Search, BookOpen, Share2, Download, Keyboard, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help Center - HolyDrop',
  description: 'Find answers to common questions and learn how to get the most out of HolyDrop.',
};

export default function HelpPage() {
  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I search for Bible verses?',
          a: 'Use the search bar to find verses by reference (like "John 3:16"), topic (like "love" or "peace"), or partial text. Our smart search will find relevant verses even if you don\'t remember the exact words.'
        },
        {
          q: 'Can I use HolyDrop without an internet connection?',
          a: 'Yes! HolyDrop works completely offline. All Bible text and search functionality is stored locally on your device. You can even install it as a mobile app for the best offline experience.'
        },
        {
          q: 'How do I create and share verse cards?',
          a: 'On any verse page, use the "Share" section to create beautiful verse cards. Choose your preferred format (Instagram, Facebook, etc.) and theme, then download or share directly to social media.'
        }
      ]
    },
    {
      category: 'Features',
      questions: [
        {
          q: 'What reading plans are available?',
          a: 'HolyDrop offers various reading plans including chronological Bible reading, topical studies, and seasonal devotionals. Access them from the Reading Plans section in the main menu.'
        },
        {
          q: 'How do I bookmark favorite verses?',
          a: 'Click the bookmark icon next to any verse to save it to your favorites. Access your saved verses from the bookmarks page in your profile menu.'
        },
        {
          q: 'Can I adjust the font size and appearance?',
          a: 'Yes! Go to Settings to customize font size, theme (light/dark), and other display preferences. Your settings are saved automatically.'
        }
      ]
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'How do I install HolyDrop as a mobile app?',
          a: 'On mobile browsers, look for the "Install" or "Add to Home Screen" option in your browser menu. On desktop, you\'ll see an install prompt in the address bar when available.'
        },
        {
          q: 'Why is my search not working?',
          a: 'Make sure the Bible content has finished loading (you\'ll see a progress indicator if it\'s still loading). If problems persist, try refreshing the page or clearing your browser cache.'
        },
        {
          q: 'How much storage does HolyDrop use?',
          a: 'The complete Bible text and search index use approximately 15-20MB of storage on your device. This allows for instant offline access to all verses.'
        }
      ]
    }
  ];

  const guides = [
    {
      title: 'Quick Start Guide',
      description: 'Learn the basics of navigating and using HolyDrop',
      icon: <BookOpen className="w-6 h-6" />,
      steps: [
        'Use the search bar to find verses by topic or reference',
        'Browse books and chapters using the navigation menu',
        'Bookmark verses you want to save for later',
        'Create and share beautiful verse cards',
        'Start a reading plan to build consistent habits'
      ]
    },
    {
      title: 'Sharing & Social Media',
      description: 'Create stunning verse cards for social platforms',
      icon: <Share2 className="w-6 h-6" />,
      steps: [
        'Navigate to any verse page',
        'Scroll to the sharing section',
        'Choose your preferred format and theme',
        'Add a personal message if desired',
        'Download or share directly to social media'
      ]
    },
    {
      title: 'Offline Usage',
      description: 'Use HolyDrop anywhere without internet',
      icon: <Download className="w-6 h-6" />,
      steps: [
        'Let the initial content load completely',
        'Install HolyDrop as a mobile/desktop app',
        'All verses and features work offline',
        'Reading plans and bookmarks sync when online',
        'Perfect for travel or areas with poor connection'
      ]
    }
  ];

  const keyboardShortcuts = [
    { key: 'Ctrl/Cmd + K', action: 'Open quick search' },
    { key: 'Ctrl/Cmd + B', action: 'Toggle bookmarks' },
    { key: 'Ctrl/Cmd + H', action: 'Go to home page' },
    { key: 'Ctrl/Cmd + R', action: 'Open reading plans' },
    { key: '/', action: 'Focus search bar' },
    { key: 'Esc', action: 'Close modals/menus' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find answers and learn how to get the most out of HolyDrop
          </p>
        </div>

        {/* Quick Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-water-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Help Articles
            </h2>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help topics..."
              className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-water-500 focus:border-transparent text-gray-900 dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Quick Guides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Guides
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-water-600">
                    {guide.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {guide.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {guide.description}
                </p>
                <ol className="space-y-2">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-sm text-gray-700 dark:text-gray-300 flex gap-3">
                      <span className="text-water-600 font-medium text-xs">
                        {stepIndex + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <details key={faqIndex} className="group">
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {faq.q}
                          </h4>
                          <div className="text-gray-400 group-open:rotate-180 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </summary>
                      <div className="px-3 pb-3">
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Keyboard className="w-5 h-5 text-water-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {keyboardShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {shortcut.action}
                  </span>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium text-gray-900 dark:text-white">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-gradient-to-r from-water-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Can't find what you're looking for? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:support@holydrop.app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-water-600 text-white rounded-lg hover:bg-water-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </Link>
            <button
              onClick={() => {
                // This would trigger the feedback widget
                const feedbackButton = document.querySelector('[aria-label="Send Feedback"]') as HTMLButtonElement;
                feedbackButton?.click();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Send Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}