'use client';

import { useState } from 'react';
import { useNativeBridge } from '@/hooks/useNativeBridge';
import { PuzzlePieceIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export function PluginManager() {
  const { 
    isDesktop, 
    plugins, 
    isLoading,
    error,
    togglePlugin, 
    executePlugin,
    refreshPlugins 
  } = useNativeBridge();
  const [executing, setExecuting] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{ pluginId: string; success: boolean; message: string } | null>(null);

  if (!isDesktop) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Plugin Management</h2>
        <p className="text-gray-400">
          Plugin management is only available in the desktop app.
        </p>
      </div>
    );
  }

  const handleToggle = async (pluginId: string, currentState: boolean) => {
    await togglePlugin(pluginId, !currentState);
    await refreshPlugins();
  };

  const handleExecute = async (pluginId: string, commandName: string) => {
    setExecuting(`${pluginId}-${commandName}`);
    setExecutionResult(null);
    try {
      const result = await executePlugin(pluginId, commandName);
      if (result) {
        setExecutionResult({ pluginId, success: true, message: 'Command executed successfully' });
      } else {
        setExecutionResult({ pluginId, success: false, message: 'Command execution failed' });
      }
    } catch (err) {
      setExecutionResult({ pluginId, success: false, message: 'Command execution error' });
    } finally {
      setExecuting(null);
      // Clear result after 3 seconds
      setTimeout(() => setExecutionResult(null), 3000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Plugin Management</h2>
        <button
          onClick={refreshPlugins}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {executionResult && (
        <div className={`mb-4 p-3 rounded text-sm ${
          executionResult.success 
            ? 'bg-green-900/30 border border-green-700 text-green-300'
            : 'bg-red-900/30 border border-red-700 text-red-300'
        }`}>
          {executionResult.message}
        </div>
      )}

      {plugins.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <PuzzlePieceIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No plugins installed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <PuzzlePieceIcon className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-medium">{plugin.name}</h3>
                    {plugin.enabled ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  {plugin.description && (
                    <p className="text-sm text-gray-400 mt-1">{plugin.description}</p>
                  )}
                </div>
                <label className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-400">Enabled</span>
                  <input
                    type="checkbox"
                    checked={plugin.enabled}
                    onChange={() => handleToggle(plugin.id, plugin.enabled)}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-600 text-violet-600 focus:ring-violet-500"
                  />
                </label>
              </div>

              {plugin.commands && plugin.commands.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-sm text-gray-400 mb-2">Available Commands:</p>
                  <div className="flex flex-wrap gap-2">
                    {plugin.commands.map((cmd) => (
                      <button
                        key={cmd.name}
                        onClick={() => handleExecute(plugin.id, cmd.name)}
                        disabled={!plugin.enabled || executing === `${plugin.id}-${cmd.name}`}
                        title={cmd.description}
                        className="px-3 py-1 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {executing === `${plugin.id}-${cmd.name}` ? 'Running...' : cmd.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
