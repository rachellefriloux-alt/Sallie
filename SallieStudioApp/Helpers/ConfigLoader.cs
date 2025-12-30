using System.IO;
using System.Text.Json;
using SallieStudioApp.Models;

namespace SallieStudioApp.Helpers
{
    public static class ConfigLoader
    {
        public static StudioConfig Load(string baseDir)
        {
            var configPath = Path.Combine(baseDir, "config", "studio.json");
            if (!File.Exists(configPath))
            {
                Directory.CreateDirectory(Path.Combine(baseDir, "config"));
                return StudioConfig.Default();
            }

            var json = File.ReadAllText(configPath);
            var root = JsonSerializer.Deserialize<StudioConfigRoot>(json);

            if (root == null || root.Profiles == null || !root.Profiles.ContainsKey(root.ActiveProfile))
            {
                return StudioConfig.Default();
            }

            var profile = root.Profiles[root.ActiveProfile];
            profile.Name = root.ActiveProfile;
            return profile;
        }
    }
}
