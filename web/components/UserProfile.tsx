/**
 * Enhanced User Profile Component
 * Complete user management and profile functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNotifications } from '@/hooks/useNotifications';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  bio: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
    privacy: {
        showOnlineStatus: boolean;
        showActivity: boolean;
        allowDataCollection: boolean;
    };
  };
  stats: {
    joinDate: string;
    totalInteractions: number;
    featuresUsed: number;
    sessionCount: number;
  };
}

export function UserProfile() {
  const { settings, updateSettings } = useSettingsStore();
  const { showSuccess, showError } = useNotifications();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    theme: 'dark',
    language: 'en',
    notifications: true,
    showOnlineStatus: true,
    showActivity: true,
    allowDataCollection: false
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          displayName: data.displayName || '',
          bio: data.bio || '',
          theme: data.preferences?.theme || 'dark',
          language: data.preferences?.language || 'en',
          notifications: data.preferences?.notifications || true,
          showOnlineStatus: data.preferences?.privacy?.showOnlineStatus || true,
          showActivity: data.preferences?.privacy?.showActivity || true,
          allowDataCollection: data.preferences?.privacy?.allowDataCollection || false
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      showError('Profile', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: formData.displayName,
          bio: formData.bio,
          preferences: {
            theme: formData.theme,
            language: formData.language,
            notifications: formData.notifications,
            privacy: {
              showOnlineStatus: formData.showOnlineStatus,
              showActivity: formData.showActivity,
              allowDataCollection: formData.allowDataCollection
            }
          }
        })
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditing(false);
        showSuccess('Profile Updated', 'Your profile has been successfully updated');
      }
    } catch (error) {
      showError('Update Failed', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!profile) return;
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await fetch(`${API_BASE}/api/user/avatar`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, avatar: result.avatar } : null);
        showSuccess('Avatar Updated', 'Your avatar has been updated');
      }
    } catch (error) {
      showError('Avatar Failed', 'Failed to update avatar');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sallie-user-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showSuccess('Export Complete', 'Your data has been exported');
      }
    } catch (error) {
      showError('Export Failed', 'Failed to export user data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/user/delete`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showSuccess('Account Deleted', 'Your account has been deleted');
        // Redirect to login or home page
        window.location.href = '/';
      }
    } catch (error) {
      showError('Delete Failed', 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">User Profile</h1>
          <p className="text-gray-300">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Profile Information</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    editing 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={profile.avatar || '/default-avatar.png'}
                      alt={profile.displayName}
                      className="w-20 h-20 rounded-full border-2 border-violet-500"
                    />
                    {editing && (
                      <label className="absolute bottom-0 right-0 bg-violet-600 text-white p-1 rounded-full cursor-pointer hover:bg-violet-700">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleAvatarChange(e.target.files[0])}
                          className="hidden"
                        />
                        📷
                      </label>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white">{profile.displayName}</h3>
                    <p className="text-gray-400">@{profile.username}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>

                {/* Editable Fields */}
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-4 py-2 bg-black/30 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                        aria-label="Display name"
                        placeholder="Enter your display name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-black/30 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Display Name</h4>
                      <p className="text-white">{profile.displayName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Bio</h4>
                      <p className="text-white">{profile.bio || 'No bio set'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              {editing && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Preferences</h2>
              
              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    aria-label="Select theme"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full px-4 py-2 bg-black/30 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    aria-label="Select language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 bg-black/30 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-gray-300">Enable notifications</span>
                  </label>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white mb-4">Privacy</h3>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.showOnlineStatus}
                      onChange={(e) => setFormData({ ...formData, showOnlineStatus: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-gray-300">Show online status</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.showActivity}
                      onChange={(e) => setFormData({ ...formData, showActivity: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-gray-300">Show activity status</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.allowDataCollection}
                      onChange={(e) => setFormData({ ...formData, allowDataCollection: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-gray-300">Allow data collection for improvements</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Account Actions</h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleExportData}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Export My Data
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Member Since</h4>
                  <p className="text-white">{new Date(profile.stats.joinDate).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Total Interactions</h4>
                  <p className="text-white text-2xl font-bold">{profile.stats.totalInteractions}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Features Used</h4>
                  <p className="text-white text-2xl font-bold">{profile.stats.featuresUsed}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Sessions</h4>
                  <p className="text-white text-2xl font-bold">{profile.stats.sessionCount}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/settings'}
                  className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
                >
                  ⚙️ Settings
                </button>
                
                <button
                  onClick={() => window.location.href = '/convergence'}
                  className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
                >
                  🎯 Convergence
                </button>
                
                <button
                  onClick={() => window.location.href = '/avatar'}
                  className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
                >
                  🎨 Avatar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
