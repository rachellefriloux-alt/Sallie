using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;

namespace SallieStudioApp
{
    public class LogEntry
    {
        public string Type { get; set; } = "";
        public string Content { get; set; } = "";
        public string Timestamp { get; set; } = "";
    }

    public sealed partial class ThoughtsPage : Page
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:8000";
        private List<LogEntry> _allEntries = new();
        private string _currentFilter = "all";

        public ThoughtsPage()
        {
            this.InitializeComponent();
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            LoadEntries();
        }

        private void LoadEntries()
        {
            // In a real implementation, this would fetch from an API endpoint
            // For now, we'll use mock data
            _allEntries = new List<LogEntry>
            {
                new LogEntry
                {
                    Type = "DEBATE",
                    Content = "Gemini proposed options, INFJ filtered...",
                    Timestamp = DateTime.Now.ToString("g")
                }
            };

            ApplyFilter();
        }

        private void ApplyFilter()
        {
            var searchQuery = SearchBox.Text?.ToLower() ?? "";
            
            var filtered = _allEntries.Where(e =>
            {
                // Apply type filter
                if (_currentFilter != "all")
                {
                    var typeMatch = _currentFilter switch
                    {
                        "debates" => e.Type.ToLower() == "debate",
                        "friction" => e.Type.ToLower() == "friction",
                        "decisions" => e.Type.ToLower() == "decision",
                        _ => true
                    };
                    if (!typeMatch) return false;
                }

                // Apply search filter
                if (!string.IsNullOrEmpty(searchQuery))
                {
                    return e.Content.ToLower().Contains(searchQuery);
                }

                return true;
            }).ToList();

            EntriesList.ItemsSource = filtered;
        }

        private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            ApplyFilter();
        }

        private void Filter_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string filter)
            {
                _currentFilter = filter;
                ApplyFilter();
            }
        }

        private async void Export_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var picker = new Windows.Storage.Pickers.FileSavePicker();
                picker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.DocumentsLibrary;
                picker.FileTypeChoices.Add("JSON", new List<string> { ".json" });
                picker.SuggestedFileName = $"thoughts-log-{DateTime.Now:yyyy-MM-dd}";

                // Get window handle for WinUI 3
                var hwnd = WinRT.Interop.WindowNative.GetWindowHandle(App.MainWindow);
                WinRT.Interop.InitializeWithWindow.Initialize(picker, hwnd);

                var file = await picker.PickSaveFileAsync();
                if (file != null)
                {
                    var json = JsonSerializer.Serialize(_allEntries, new JsonSerializerOptions { WriteIndented = true });
                    await Windows.Storage.FileIO.WriteTextAsync(file, json);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Export failed: {ex.Message}");
            }
        }
    }
}
