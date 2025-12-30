using System.Collections.Generic;
using SallieStudioApp.Cloud;

namespace SallieStudioApp.Models
{
    public class StudioConfigRoot
    {
        public string ActiveProfile { get; set; } = "Dev";
        public string UpdateChannel { get; set; } = "stable";
        public CloudConfig Cloud { get; set; } = new();
        public Dictionary<string, StudioConfig> Profiles { get; set; } = new();
    }
}
