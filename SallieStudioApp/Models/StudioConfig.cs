namespace SallieStudioApp.Models
{
    public class StudioConfig
    {
        public string Name { get; set; } = "Dev";
        public string RepoRoot { get; set; } = "";
        public string ProgenyRootRelative { get; set; } = "";
        public int PreferredPort { get; set; }
        public int FallbackPort { get; set; }
        public string DockerCompose { get; set; } = "docker-compose.yml";
        public bool ReadOnly { get; set; } = false;
        public bool SilentMode { get; set; } = false;

        public static StudioConfig Default() => new StudioConfig
        {
            Name = "Dev",
            RepoRoot = "C\\Sallie",
            ProgenyRootRelative = "progeny_root",
            PreferredPort = 8000,
            FallbackPort = 8010,
            DockerCompose = "docker-compose.yml",
            SilentMode = false
        };
    }
}
