'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function SettingsPanel() {
  const [settings, setSettings] = useState({
    posture: 'PEER',
    notifications: true,
    theme: 'dark',
  });
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
  });
  const [saving, setSaving] = useState(false);

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
            onChange={(e) => setSettings({ ...settings, posture: e.target.value })}
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
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-gray-300">Enable notifications</span>
          </label>
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

