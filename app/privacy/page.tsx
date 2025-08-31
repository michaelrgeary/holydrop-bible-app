import { Metadata } from 'next';
import { Shield, Database, Eye, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - HolyDrop',
  description: 'Learn how HolyDrop protects your privacy and handles your data.',
};

export default function PrivacyPolicy() {
  const lastUpdated = "December 2024";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-water-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your privacy matters to us. Here's how we protect it.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-water-50 dark:bg-water-900/20 rounded-xl p-6 mb-8 border border-water-200 dark:border-water-800">
          <h2 className="text-xl font-semibold text-water-800 dark:text-water-200 mb-4">
            Privacy at a Glance
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-water-600 dark:text-water-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Data Storage:</strong> All Bible content and search indexes are stored locally in your browser. No personal Bible reading data is sent to our servers.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-water-600 dark:text-water-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Analytics:</strong> We collect anonymous usage statistics to improve the app. No personal information is tracked.
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          
          <h2>1. Information We Collect</h2>
          
          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Optional Account Information:</strong> If you create an account, we collect your email address and any profile information you choose to provide.</li>
            <li><strong>User-Generated Content:</strong> Personal notes, annotations, and reading plans you create are stored with your account.</li>
            <li><strong>Communication:</strong> Messages you send us through contact forms or support emails.</li>
          </ul>

          <h3>Information Automatically Collected</h3>
          <ul>
            <li><strong>Usage Analytics:</strong> Anonymous data about how you use HolyDrop, including page views, feature usage, and performance metrics.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and device characteristics for compatibility and optimization.</li>
            <li><strong>Local Storage:</strong> Bible content, search indexes, and app preferences stored locally in your browser.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and improve HolyDrop's features and functionality</li>
            <li>Sync your annotations and reading progress across devices (if you have an account)</li>
            <li>Analyze usage patterns to enhance the user experience</li>
            <li>Respond to your support requests and communications</li>
            <li>Send important updates about the service (account holders only)</li>
          </ul>

          <h2>3. Data Storage and Security</h2>
          
          <h3>Local Storage</h3>
          <p>Most of your data stays on your device:</p>
          <ul>
            <li>Complete Bible text and search indexes</li>
            <li>Reading progress and bookmarks</li>
            <li>App preferences and settings</li>
            <li>Generated verse cards and images</li>
          </ul>

          <h3>Server Storage</h3>
          <p>We only store on our servers:</p>
          <ul>
            <li>Account credentials (encrypted)</li>
            <li>Synced annotations and notes (if you choose to sync)</li>
            <li>Anonymous analytics data</li>
            <li>Support communications</li>
          </ul>

          <h3>Security Measures</h3>
          <ul>
            <li>All data transmission is encrypted using HTTPS/TLS</li>
            <li>Account passwords are hashed using industry-standard methods</li>
            <li>Regular security audits and updates</li>
            <li>Minimal data retention policies</li>
          </ul>

          <h2>4. Sharing and Disclosure</h2>
          
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
          <ul>
            <li><strong>Service Providers:</strong> Trusted partners who help us operate HolyDrop (hosting, analytics, support)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (users will be notified)</li>
            <li><strong>Consent:</strong> When you explicitly authorize us to share information</li>
          </ul>

          <h2>5. Third-Party Services</h2>
          
          <p>HolyDrop integrates with these third-party services:</p>
          <ul>
            <li><strong>Vercel Analytics:</strong> Anonymous performance monitoring</li>
            <li><strong>Supabase:</strong> User authentication and data synchronization</li>
            <li><strong>Font Services:</strong> Google Fonts for typography</li>
          </ul>
          
          <p>Each service has its own privacy policy that governs how they handle data.</p>

          <h2>6. Your Privacy Rights</h2>
          
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correct:</strong> Update or correct inaccurate information</li>
            <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
            <li><strong>Port:</strong> Export your data in a standard format</li>
            <li><strong>Opt-out:</strong> Disable analytics tracking in app settings</li>
          </ul>

          <h2>7. Children's Privacy</h2>
          
          <p>HolyDrop is designed to be family-friendly and appropriate for all ages. We do not knowingly collect personal information from children under 13 without parental consent. If you believe we have inadvertently collected such information, please contact us immediately.</p>

          <h2>8. International Users</h2>
          
          <p>HolyDrop is hosted in the United States. If you access our service from outside the US, your information may be transferred to, stored, and processed in the US. We ensure appropriate safeguards are in place for international data transfers.</p>

          <h2>9. Changes to This Policy</h2>
          
          <p>We may update this Privacy Policy from time to time. When we do:</p>
          <ul>
            <li>We'll notify you through the app or by email (for account holders)</li>
            <li>The updated date will be revised at the top of this policy</li>
            <li>Significant changes will include a prominent notice</li>
            <li>Your continued use constitutes acceptance of the updated policy</li>
          </ul>

          <h2>10. Contact Us</h2>
          
          <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 my-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email:</p>
                <p className="text-gray-600 dark:text-gray-300">privacy@holydrop.app</p>
                <p className="text-sm text-gray-500 mt-2">
                  We typically respond to privacy inquiries within 48 hours.
                </p>
              </div>
            </div>
          </div>

          <h2>11. Open Source Commitment</h2>
          
          <p>HolyDrop is committed to transparency. Key components of our application are open source, allowing you to review how your data is handled. You can find our source code and contribute to the project on GitHub.</p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 my-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Privacy-First Design
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              HolyDrop is built with privacy as a core principle. We believe your spiritual journey is personal, 
              and we've designed our app to keep your data local and private while still providing powerful features 
              like search and offline access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}