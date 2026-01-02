'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNativeBridge } from '@/hooks/useNativeBridge';
import { PluginManager } from './PluginManager';
import { CloudSyncIndicator } from './CloudSyncIndicator';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Available voice input languages
const VOICE_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-AU', label: 'English (Australia)' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'it-IT', label: 'Italian' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)' },
];

export function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const { isDesktop, version, isConnected } = useNativeBridge();
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
  });
  const [saving, setSaving] = useState(false);
  const [desktopSettings, setDesktopSettings] = useState({
    enableSystemTray: true,
    minimizeToTray: true,
    startOnLogin: false,
    enableNativeNotifications: true,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to API
      console.log('Saving settings:', settings);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const exportData = { settings, apiKeys: { gemini: '***', openai: '***' } };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sallie-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Configure Sallie's behavior and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Posture Mode */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Posture Mode</h2>
          <select
            value={settings.posture}
            onChange={(e) => updateSettings({ posture: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
          >
            <option value="COMPANION">Companion - Grounding, warm presence</option>
            <option value="CO_PILOT">Co-Pilot - Decisive, execution-focused</option>
            <option value="PEER">Peer - Real talk, collaborative</option>
            <option value="EXPERT">Expert - Dense, technical, option-oriented</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => updateSettings({ notifications: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-gray-300">Enable notifications</span>
          </label>
        </div>

        {/* Voice Input Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Voice Input</h2>
          <p className="text-sm text-gray-400 mb-4">
            Configure speech recognition settings. Voice input requires Chrome, Edge, or Safari.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Speech Recognition Language
              </label>
              <select
                value={settings.voiceLanguage}
                onChange={(e) => updateSettings({ voiceLanguage: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                {VOICE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.voiceAutoSend}
                onChange={(e) => updateSettings({ voiceAutoSend: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-gray-300">Auto-send after voice input</span>
            </label>
            <p className="text-xs text-gray-500">
              Keyboard shortcut: Ctrl+Shift+V (or Cmd+Shift+V on Mac) to toggle voice input
            </p>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                placeholder="Enter Gemini API key"
                className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                OpenAI API Key (Optional)
              </label>
              <input
                type="password"
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                placeholder="Enter OpenAI API key"
                className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Desktop Settings - Only shown in desktop app */}
        {isDesktop && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Desktop Settings</h2>
            <p className="text-sm text-gray-400 mb-4">
              Running Sallie Desktop v{version || 'Unknown'} {isConnected ? '(Connected)' : '(Disconnected)'}
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={desktopSettings.enableSystemTray}
                  onChange={(e) => setDesktopSettings({ ...desktopSettings, enableSystemTray: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-gray-300">Enable system tray icon</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={desktopSettings.minimizeToTray}
                  onChange={(e) => setDesktopSettings({ ...desktopSettings, minimizeToTray: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
                  disabled={!desktopSettings.enableSystemTray}
                />
                <span className={desktopSettings.enableSystemTray ? 'text-gray-300' : 'text-gray-500'}>
                  Minimize to system tray
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={desktopSettings.startOnLogin}
                  onChange={(e) => setDesktopSettings({ ...desktopSettings, startOnLogin: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-gray-300">Start on system login</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={desktopSettings.enableNativeNotifications}
                  onChange={(e) => setDesktopSettings({ ...desktopSettings, enableNativeNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-gray-300">Enable native desktop notifications</span>
              </label>
            </div>
          </div>
        )}

        {/* Plugin Management - Only shown in desktop app */}
        {isDesktop && <PluginManager />}

        {/* Cloud Sync Status - Only shown in desktop app */}
        {isDesktop && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Cloud Sync</h2>
            <CloudSyncIndicator />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-colors"
          >
            Export Settings
          </button>
        </div>
      </div>
    </div>
  );
}

