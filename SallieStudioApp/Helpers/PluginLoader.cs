using SallieStudioApp.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace SallieStudioApp.Helpers
{
    public static class PluginLoader
    {
        private static readonly JsonSerializerOptions Options = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public static List<PluginManifest> LoadPlugins(string? baseDirectory = null)
        {
            var plugins = new List<PluginManifest>();
            var baseDir = baseDirectory ?? AppContext.BaseDirectory;
            var extDir = Path.Combine(baseDir, "Extensions");

            if (!Directory.Exists(extDir))
            {
                Directory.CreateDirectory(extDir);
            }

            foreach (var folder in Directory.GetDirectories(extDir))
            {
                var manifestPath = Path.Combine(folder, "plugin.json");
                if (!File.Exists(manifestPath))
                {
                    continue;
                }

                try
                {
                    var json = File.ReadAllText(manifestPath);
                    var manifest = JsonSerializer.Deserialize<PluginManifest>(json, Options);
                    if (manifest == null)
                    {
                        continue;
                    }

                    manifest.BasePath = folder;
                    manifest.ManifestPath = manifestPath;
                    manifest.Id = string.IsNullOrWhiteSpace(manifest.Id) ? Path.GetFileName(folder) : manifest.Id;
                    manifest.Commands ??= new List<PluginCommand>();
                    manifest.Ui ??= new PluginUI();
                    manifest.Settings ??= new Dictionary<string, object?>();
                    manifest.Enabled = ResolveEnabled(manifest);

                    plugins.Add(manifest);
                }
                catch
                {
                    // Skip invalid plugins
                }
            }

            return plugins;
        }

        public static void SetPluginEnabled(PluginManifest plugin, bool enabled)
        {
            plugin.Enabled = enabled;
            plugin.Settings ??= new Dictionary<string, object?>();
            plugin.Settings["enabled"] = enabled;

            if (string.IsNullOrWhiteSpace(plugin.ManifestPath))
            {
                return;
            }

            var json = JsonSerializer.Serialize(plugin, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(plugin.ManifestPath, json);
        }

        private static bool ResolveEnabled(PluginManifest manifest)
        {
            if (manifest.Settings != null && manifest.Settings.TryGetValue("enabled", out var enabledObj))
            {
                if (enabledObj is bool enabledBool)
                {
                    return enabledBool;
                }

                if (bool.TryParse(enabledObj?.ToString(), out var parsed))
                {
                    return parsed;
                }
            }

            return true;
        }
    }
}
