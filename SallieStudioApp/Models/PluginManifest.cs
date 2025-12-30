using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SallieStudioApp.Models
{
    public class PluginCommand
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("script")]
        public string Script { get; set; } = string.Empty;
    }

    public class PluginUI
    {
        [JsonPropertyName("panel")]
        public string Panel { get; set; } = string.Empty;
    }

    public class PluginManifest
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("version")]
        public string Version { get; set; } = string.Empty;

        [JsonPropertyName("author")]
        public string Author { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("entrypoint")]
        public string Entrypoint { get; set; } = string.Empty;

        [JsonPropertyName("icon")]
        public string Icon { get; set; } = string.Empty;

        [JsonPropertyName("commands")]
        public List<PluginCommand> Commands { get; set; } = new();

        [JsonPropertyName("ui")]
        public PluginUI Ui { get; set; } = new();

        [JsonPropertyName("settings")]
        public Dictionary<string, object?> Settings { get; set; } = new();

        [JsonIgnore]
        public string BasePath { get; set; } = string.Empty;

        [JsonIgnore]
        public string ManifestPath { get; set; } = string.Empty;

        [JsonIgnore]
        public bool Enabled { get; set; } = true;
    }
}
