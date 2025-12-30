'use client';

import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  created_ts: number;
  status: string;
}

interface Extension {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  created_ts: number;
  usage_count: number;
}

interface Skill {
  name: string;
  proficiency: number;
  practice_count: number;
  last_practiced: number | null;
}

type TabType = 'projects' | 'extensions' | 'skills';

export function ProjectsBrowser() {
  const [currentTab, setCurrentTab] = useState<TabType>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (currentTab) {
        case 'projects':
          // Load projects
          break;
        case 'extensions':
          const extResponse = await fetch('/api/extensions');
          if (extResponse.ok) {
            const data = await extResponse.json();
            setExtensions(data.extensions || []);
          }
          break;
        case 'skills':
          const skillResponse = await fetch('/api/learning/summary');
          if (skillResponse.ok) {
            const data = await skillResponse.json();
            // Transform skills data
            const skillList: Skill[] = Object.entries(data.skill_statistics?.skills || {}).map(([name, data]: [string, any]) => ({
              name,
              proficiency: data.proficiency || 0,
              practice_count: data.practice_count || 0,
              last_practiced: data.last_practiced,
            }));
            setSkills(skillList);
          }
          break;
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = async (description: string, type: string) => {
    try {
      const response = await fetch('/api/learning/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_description: description, project_type: type }),
      });
      if (response.ok) {
        await loadData();
        setShowNewDialog(false);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleProposeExtension = async (name: string, description: string, category: string) => {
    try {
      const response = await fetch('/api/extensions/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category }),
      });
      if (response.ok) {
        await loadData();
        setShowNewDialog(false);
      }
    } catch (err) {
      console.error('Failed to propose extension:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'approved': return 'bg-blue-500/20 text-blue-400';
      case 'pending_review': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'disabled': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'projects', label: 'Projects', icon: '🛠️' },
    { key: 'extensions', label: 'Extensions', icon: '🧩' },
    { key: 'skills', label: 'Skills', icon: '📚' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects & Building</h1>
          <p className="text-gray-400">Create projects, extensions, and build together with Sallie</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewDialog(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + New {currentTab === 'extensions' ? 'Extension' : 'Project'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentTab(tab.key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentTab === tab.key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* List */}
        <div className="col-span-2 bg-gray-800 rounded-lg p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentTab === 'projects' && (
                projects.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No projects yet</p>
                    <p className="text-gray-500 text-sm mt-2">Create a project to start building together!</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedItem(project)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedItem?.id === project.id
                          ? 'bg-purple-900/30 border-purple-500'
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-white font-medium">{project.name}</h3>
                        <span className="text-xs text-gray-400">{project.type}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                    </div>
                  ))
                )
              )}

              {currentTab === 'extensions' && (
                extensions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No extensions yet</p>
                    <p className="text-gray-500 text-sm mt-2">Sallie can create new capabilities for herself!</p>
                  </div>
                ) : (
                  extensions.map((ext) => (
                    <div
                      key={ext.id}
                      onClick={() => setSelectedItem(ext)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedItem?.id === ext.id
                          ? 'bg-purple-900/30 border-purple-500'
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-white font-medium">{ext.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(ext.status)}`}>
                          {ext.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{ext.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Category: {ext.category}</span>
                        <span>Used: {ext.usage_count} times</span>
                      </div>
                    </div>
                  ))
                )
              )}

              {currentTab === 'skills' && (
                skills.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No skills tracked yet</p>
                    <p className="text-gray-500 text-sm mt-2">Start learning together to see progress!</p>
                  </div>
                ) : (
                  skills.map((skill, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedItem(skill)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedItem?.name === skill.name
                          ? 'bg-purple-900/30 border-purple-500'
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <h3 className="text-white font-medium">{skill.name}</h3>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${skill.proficiency * 100}%` }}
                          />
                        </div>
                        <span className="text-purple-400 text-sm font-medium">
                          {Math.round(skill.proficiency * 100)}%
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-2">Practiced {skill.practice_count} times</p>
                    </div>
                  ))
                )
              )}
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          {selectedItem ? (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                {selectedItem.name || 'Details'}
              </h2>
              <div className="space-y-4 text-sm">
                {selectedItem.description && (
                  <div>
                    <p className="text-gray-400">Description</p>
                    <p className="text-white">{selectedItem.description}</p>
                  </div>
                )}
                {selectedItem.status && (
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
                {selectedItem.category && (
                  <div>
                    <p className="text-gray-400">Category</p>
                    <p className="text-white">{selectedItem.category}</p>
                  </div>
                )}
                {selectedItem.proficiency !== undefined && (
                  <div>
                    <p className="text-gray-400">Proficiency</p>
                    <p className="text-white">{Math.round(selectedItem.proficiency * 100)}%</p>
                  </div>
                )}
                {selectedItem.practice_count !== undefined && (
                  <div>
                    <p className="text-gray-400">Practice Count</p>
                    <p className="text-white">{selectedItem.practice_count}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {currentTab === 'extensions' && selectedItem.status === 'pending_review' && (
                <div className="mt-6 flex gap-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm">
                    Approve
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm">
                    Reject
                  </button>
                </div>
              )}
              {currentTab === 'extensions' && selectedItem.status === 'approved' && (
                <button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
                  Activate
                </button>
              )}
              {currentTab === 'skills' && (
                <button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
                  Practice This Skill
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">Select an item to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
