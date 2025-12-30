using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public class DeviceItem
    {
        public string Name { get; set; } = "";
        public string Info { get; set; } = "";
        public string Status { get; set; } = "";
        public SolidColorBrush StatusBackground { get; set; } = new SolidColorBrush(Microsoft.UI.Colors.Gray);
    }

    public sealed partial class SyncPage : Page
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:8000";

        public SyncPage()
        {
            this.InitializeComponent();
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            _ = LoadSyncStatus();
        }

        private async Task LoadSyncStatus()
        {
            try
            {
                var response = await _httpClient.GetAsync("/sync/status");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);

                    if (data.TryGetProperty("last_sync", out var lastSync))
                    {
                        var timestamp = lastSync.GetDouble();
                        if (timestamp > 0)
                        {
                            var dt = DateTimeOffset.FromUnixTimeSeconds((long)timestamp);
                            LastSyncText.Text = dt.LocalDateTime.ToString("g");
                        }
                    }

                    if (data.TryGetProperty("sync_enabled", out var enabled))
                    {
                        AutoSyncCheck.IsChecked = enabled.GetBoolean();
                    }
                }

                await LoadDevices();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load sync status: {ex.Message}");
            }
        }

        private async Task LoadDevices()
        {
            try
            {
                var response = await _httpClient.GetAsync("/sync/devices");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);

                    if (data.TryGetProperty("devices", out var devicesElement))
                    {
                        var devices = new List<DeviceItem>();
                        foreach (var device in devicesElement.EnumerateArray())
                        {
                            var name = device.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "";
                            var deviceId = device.TryGetProperty("device_id", out var d) ? d.GetString() ?? "" : "";
                            var platform = device.TryGetProperty("platform", out var p) ? p.GetString() ?? "" : "";
                            var lastSyncTs = device.TryGetProperty("last_sync", out var ls) ? ls.GetDouble() : 0;

                            var lastSyncStr = lastSyncTs > 0
                                ? DateTimeOffset.FromUnixTimeSeconds((long)lastSyncTs).LocalDateTime.ToString("g")
                                : "Never";

                            devices.Add(new DeviceItem
                            {
                                Name = string.IsNullOrEmpty(name) ? deviceId : name,
                                Info = $"{platform} • Last sync: {lastSyncStr}",
                                Status = "Connected",
                                StatusBackground = new SolidColorBrush(Microsoft.UI.Colors.ForestGreen)
                            });
                        }

                        DevicesList.ItemsSource = devices;
                        NoDevicesText.Visibility = devices.Count == 0 ? Visibility.Visible : Visibility.Collapsed;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load devices: {ex.Message}");
            }
        }

        private async void SyncNow_Click(object sender, RoutedEventArgs e)
        {
            SyncStatusText.Text = "Syncing...";
            SyncStatusText.Foreground = new SolidColorBrush(Microsoft.UI.Colors.Orange);

            try
            {
                // Sync limbic state
                await _httpClient.PostAsync("/sync/limbic", null);

                // Sync memory
                await _httpClient.PostAsync("/sync/memory", null);

                SyncStatusText.Text = "Success";
                SyncStatusText.Foreground = new SolidColorBrush(Microsoft.UI.Colors.LightGreen);
                LastSyncText.Text = DateTime.Now.ToString("g");
            }
            catch (Exception ex)
            {
                SyncStatusText.Text = "Error";
                SyncStatusText.Foreground = new SolidColorBrush(Microsoft.UI.Colors.Red);
                System.Diagnostics.Debug.WriteLine($"Sync failed: {ex.Message}");
            }

            // Reset status after 2 seconds
            await Task.Delay(2000);
            SyncStatusText.Text = "Idle";
            SyncStatusText.Foreground = new SolidColorBrush(Microsoft.UI.Colors.LightGreen);
        }

        private async void RefreshDevices_Click(object sender, RoutedEventArgs e)
        {
            await LoadDevices();
        }
    }
}
