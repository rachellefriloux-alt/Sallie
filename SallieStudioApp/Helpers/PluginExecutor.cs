using SallieStudioApp.Models;
using System;
using System.IO;
using System.Threading.Tasks;

namespace SallieStudioApp.Helpers
{
    public static class PluginExecutor
    {
        public static async Task<string> ExecuteCommand(PluginManifest plugin, PluginCommand command)
        {
            if (plugin == null)
            {
                return "Plugin not provided.";
            }

            if (command == null)
            {
                return "Command not provided.";
            }

            if (!plugin.Enabled)
            {
                return "Plugin is disabled.";
            }

            var pluginDir = !string.IsNullOrWhiteSpace(plugin.BasePath)
                ? plugin.BasePath
                : Path.Combine(AppContext.BaseDirectory, "Extensions", plugin.Id);

            if (command.Type.Equals("script", StringComparison.OrdinalIgnoreCase))
            {
                var scriptPath = Path.Combine(pluginDir, command.Script ?? string.Empty);
                return await ScriptRunner.RunScriptAsync(scriptPath);
            }

            return "Unknown command type.";
        }
    }
}
