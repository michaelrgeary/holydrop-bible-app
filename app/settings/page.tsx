'use client';

import { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Type, Bell, Database, Info, Trash2, Download, Check } from 'lucide-react';
import { Metadata } from 'next';

// Since we're using 'use client', we can't export metadata directly
// This would typically be handled by a parent layout or wrapper

interface UserSettings {
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    readingReminders: boolean;
    newFeatures: boolean;
    weeklyEncouragement: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
  };
}

const defaultSettings: UserSettings = {
  fontSize: 'medium',
  theme: 'system',
  notifications: {
    readingReminders: true,
    newFeatures: true,
    weeklyEncouragement: true,
  },
  privacy: {
    analytics: false,
    crashReporting: true,
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_settings');
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Save settings
  const saveSettings = async (newSettings: UserSettings) => {
    setIsSaving(true);
    try {
      localStorage.setItem('user_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // Apply theme immediately
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (newSettings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System theme
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
      }

      // Apply font size
      document.documentElement.style.setProperty(
        '--font-size-multiplier',
        newSettings.fontSize === 'small' ? '0.9' : 
        newSettings.fontSize === 'large' ? '1.1' : '1'
      );

      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (path: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [path]: value };
    saveSettings(newSettings);
  };

  const updateNestedSetting = (parent: keyof UserSettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [parent]: {
        ...(settings[parent] as any),
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      localStorage.clear();
      setSettings(defaultSettings);
      setSaveMessage('All data cleared successfully.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const exportData = () => {
    try {
      const data = {
        settings: localStorage.getItem('user_settings'),
        bookmarks: localStorage.getItem('bookmarks'),
        readingProgress: localStorage.getItem('reading_progress'),
        feedback: localStorage.getItem('user_feedback'),
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `holydrop-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveMessage('Data exported successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to export data:', error);
      setSaveMessage('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-water-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your HolyDrop experience
            </p>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            saveMessage.includes('successfully') 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <Check className="w-4 h-4" />
            {saveMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Display Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-5 h-5 text-water-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Display Settings
              </h2>
            </div>

            <div className="space-y-4">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        settings.fontSize === size
                          ? 'border-water-500 bg-water-50 dark:bg-water-900/20 text-water-700 dark:text-water-300'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`font-medium ${
                        size === 'small' ? 'text-sm' : 
                        size === 'large' ? 'text-lg' : 'text-base'
                      }`}>
                        Aa
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {size}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'light' as const, label: 'Light', icon: Sun },
                    { key: 'dark' as const, label: 'Dark', icon: Moon },
                    { key: 'system' as const, label: 'System', icon: Settings }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => updateSetting('theme', key)}
                      className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                        settings.theme === key
                          ? 'border-water-500 bg-water-50 dark:bg-water-900/20 text-water-700 dark:text-water-300'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-water-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { key: 'readingReminders', label: 'Daily Reading Reminders', description: 'Get gentle reminders to maintain your reading habit' },
                { key: 'newFeatures', label: 'New Features', description: 'Be notified when new features are available' },
                { key: 'weeklyEncouragement', label: 'Weekly Encouragement', description: 'Receive weekly verse and encouragement' }
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                      onChange={(e) => updateNestedSetting('notifications', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-water-300 dark:peer-focus:ring-water-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-water-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-water-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Privacy & Data
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { key: 'analytics', label: 'Anonymous Analytics', description: 'Help improve HolyDrop by sharing anonymous usage data' },
                { key: 'crashReporting', label: 'Crash Reporting', description: 'Automatically report crashes to help fix bugs' }
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings.privacy[item.key as keyof typeof settings.privacy]}
                      onChange={(e) => updateNestedSetting('privacy', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-water-300 dark:peer-focus:ring-water-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-water-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-water-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Management
              </h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={exportData}
                className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
              >
                <Download className="w-4 h-4" />
                Export My Data
              </button>

              <button
                onClick={clearAllData}
                className="w-full flex items-center justify-center gap-2 p-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>

          {/* About */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-water-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                About HolyDrop
              </h2>
            </div>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Build:</span>
                <span className="font-mono">2024.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Bible Version:</span>
                <span>King James Version (KJV)</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs">
                  Made with ❤️ for Bible study and spiritual growth. 
                  <br />
                  All Bible text is stored locally on your device for offline access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}