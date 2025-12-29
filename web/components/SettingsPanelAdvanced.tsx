'use client';

import { useState } from 'react';
import { XMarkIcon, Cog6ToothIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNotifications } from './NotificationProvider';

interface Setting {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'text' | 'number';
  value: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
}

interface SettingsCategory {
  name: string;
  settings: Setting[];
}

export function SettingsPanelAdvanced() {
  const [isOpen, setIsOpen] = useState(false);
  const { showSuccess } = useNotifications();
  
  const [categories, setCategories] = useState<SettingsCategory[]>([
    {
      name: 'Appearance',
      settings: [
        {
          id: 'theme',
          label: 'Theme',
          description: 'Choose your preferred color scheme',
          type: 'select',
          value: 'dark',
          options: [
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
            { label: 'Auto', value: 'auto' },
          ],
        },
        {
          id: 'avatarSize',
          label: 'Avatar Size',
          description: 'Size of Sallie\'s avatar display',
          type: 'select',
          value: 'medium',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
        },
        {
          id: 'animations',
          label: 'Animations',
          description: 'Enable smooth animations and transitions',
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      name: 'Chat',
      settings: [
        {
          id: 'sendOnEnter',
          label: 'Send on Enter',
          description: 'Press Enter to send (Shift+Enter for new line)',
          type: 'toggle',
          value: true,
        },
        {
          id: 'showTimestamps',
          label: 'Show Timestamps',
          description: 'Display message timestamps',
          type: 'toggle',
          value: true,
        },
        {
          id: 'fontSize',
          label: 'Font Size',
          description: 'Adjust chat message text size',
          type: 'select',
          value: 'medium',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
            { label: 'Extra Large', value: 'xl' },
          ],
        },
      ],
    },
    {
      name: 'Privacy',
      settings: [
        {
          id: 'saveHistory',
          label: 'Save Chat History',
          description: 'Persist conversations across sessions',
          type: 'toggle',
          value: true,
        },
        {
          id: 'analytics',
          label: 'Local Analytics',
          description: 'Track usage stats locally (never sent)',
          type: 'toggle',
          value: false,
        },
      ],
    },
    {
      name: 'Performance',
      settings: [
        {
          id: 'maxMessages',
          label: 'Message History Limit',
          description: 'Maximum messages to keep in memory',
          type: 'number',
          value: 100,
          min: 10,
          max: 1000,
        },
        {
          id: 'autoReconnect',
          label: 'Auto-Reconnect',
          description: 'Automatically reconnect on connection loss',
          type: 'toggle',
          value: true,
        },
      ],
    },
  ]);

  const handleSettingChange = (categoryName: string, settingId: string, newValue: any) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.name === categoryName
          ? {
              ...category,
              settings: category.settings.map((setting) =>
                setting.id === settingId
                  ? { ...setting, value: newValue }
                  : setting
              ),
            }
          : category
      )
    );
  };

  const handleSave = () => {
    // Save to localStorage
    const allSettings: Record<string, any> = {};
    categories.forEach((category) => {
      category.settings.forEach((setting) => {
        allSettings[setting.id] = setting.value;
      });
    });
    localStorage.setItem('sallie_settings', JSON.stringify(allSettings));
    showSuccess('Settings saved', 'Your preferences have been updated');
    setIsOpen(false);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default values?')) {
      localStorage.removeItem('sallie_settings');
      showSuccess('Settings reset', 'All settings have been restored to defaults');
      // Reload to apply defaults
      window.location.reload();
    }
  };

  return (
    <>
      {/* Settings button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        title="Settings"
      >
        <Cog6ToothIcon className="w-6 h-6" />
      </button>

      {/* Settings panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Cog6ToothIcon className="w-6 h-6 text-violet-400" />
                <h2 className="text-xl font-semibold text-white">Settings</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category.name}>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                      {category.name}
                    </h3>
                    <div className="space-y-4">
                      {category.settings.map((setting) => (
                        <div key={setting.id} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <label htmlFor={setting.id} className="block text-gray-300 font-medium">
                                {setting.label}
                              </label>
                              <p className="text-sm text-gray-500 mt-1">
                                {setting.description}
                              </p>
                            </div>
                            <div className="ml-4">
                              {setting.type === 'toggle' && (
                                <button
                                  id={setting.id}
                                  onClick={() =>
                                    handleSettingChange(category.name, setting.id, !setting.value)
                                  }
                                  className={`
                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                    ${setting.value ? 'bg-violet-600' : 'bg-gray-600'}
                                  `}
                                >
                                  <span
                                    className={`
                                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                      ${setting.value ? 'translate-x-6' : 'translate-x-1'}
                                    `}
                                  />
                                </button>
                              )}
                              {setting.type === 'select' && (
                                <select
                                  id={setting.id}
                                  value={setting.value}
                                  onChange={(e) =>
                                    handleSettingChange(category.name, setting.id, e.target.value)
                                  }
                                  className="bg-gray-700 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                  {setting.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {setting.type === 'number' && (
                                <input
                                  id={setting.id}
                                  type="number"
                                  value={setting.value}
                                  min={setting.min}
                                  max={setting.max}
                                  onChange={(e) =>
                                    handleSettingChange(category.name, setting.id, parseInt(e.target.value))
                                  }
                                  className="bg-gray-700 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/50">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Reset to Defaults
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
