using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class HeritagePage : Page
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:8000";
        private string _selectedFile = "core";
        private Dictionary<string, object> _heritageData = new();
        private string _currentContent = "";

        public HeritagePage()
        {
            this.InitializeComponent();
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            _ = LoadHeritage();
        }

        private async Task LoadHeritage()
        {
            try
            {
                // Try to load from API first
                var response = await _httpClient.GetAsync("/heritage/version/current");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);
                    
                    if (data.TryGetProperty("versions", out var versions))
                    {
                        var versionList = new List<string>();
                        foreach (var version in versions.EnumerateArray())
                        {
                            if (version.TryGetProperty("version", out var v) &&
                                version.TryGetProperty("timestamp", out var ts))
                            {
                                var date = DateTimeOffset.FromUnixTimeSeconds(ts.GetInt64());
                                versionList.Add($"v{v.GetString()} - {date:yyyy-MM-dd}");
                            }
                        }
                        VersionList.ItemsSource = versionList;
                    }
                }
            }
            catch
            {
                // Use mock data if API unavailable
            }

            // Load mock heritage data
            _heritageData = new Dictionary<string, object>
            {
                ["core"] = new { version = "1.0", note = "Heritage core data" },
                ["preferences"] = new { version = "1.0", note = "Support preferences" },
                ["learned"] = new { version = "1.0", learned_beliefs = new string[0], conditional_beliefs = new string[0] }
            };

            UpdateContentView();
        }

        private void UpdateContentView()
        {
            if (_heritageData.TryGetValue(_selectedFile, out var data))
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                _currentContent = JsonSerializer.Serialize(data, options);
                ApplySearch();
            }
            
            FileNameText.Text = $"{_selectedFile}.json";
        }

        private void ApplySearch()
        {
            var searchQuery = SearchBox.Text?.Trim().ToLower() ?? "";
            
            if (string.IsNullOrEmpty(searchQuery))
            {
                ContentViewer.Text = _currentContent;
            }
            else
            {
                var lines = _currentContent.Split('\n');
                var filteredLines = new List<string>();
                
                foreach (var line in lines)
                {
                    if (line.ToLower().Contains(searchQuery))
                    {
                        filteredLines.Add(line);
                    }
                }
                
                ContentViewer.Text = filteredLines.Count > 0 
                    ? string.Join("\n", filteredLines) 
                    : "No matches found";
            }
        }

        private void FileButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string fileKey)
            {
                _selectedFile = fileKey;
                UpdateContentView();
            }
        }

        private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            ApplySearch();
        }
    }
}
