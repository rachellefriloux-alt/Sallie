using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public class ControlHistoryItem
    {
        public string Action { get; set; } = "";
        public string Timestamp { get; set; } = "";
    }

    public sealed partial class ControlPage : Page
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:8000";

        public ControlPage()
        {
            this.InitializeComponent();
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            _ = LoadStatus();
        }

        private async Task LoadStatus()
        {
            try
            {
                var response = await _httpClient.GetAsync("/control/status");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);

                    UpdateStatusUI(data);
                }

                await LoadHistory();
                await LoadAgencyInfo();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load status: {ex.Message}");
            }
        }

        private void UpdateStatusUI(JsonElement data)
        {
            if (data.TryGetProperty("creator_has_control", out var creatorControl))
            {
                var hasControl = creatorControl.GetBoolean();
                ControlModeText.Text = hasControl ? "Creator Control" : "Autonomous";
                ControlModeText.Foreground = new SolidColorBrush(
                    hasControl ? Microsoft.UI.Colors.Orange : Microsoft.UI.Colors.LightGreen);
            }

            if (data.TryGetProperty("state_locked", out var stateLocked))
            {
                var locked = stateLocked.GetBoolean();
                StateLockText.Text = locked ? "Locked" : "Unlocked";
                StateLockText.Foreground = new SolidColorBrush(
                    locked ? Microsoft.UI.Colors.Orange : Microsoft.UI.Colors.LightGreen);
            }

            if (data.TryGetProperty("emergency_stop_active", out var emergencyStop))
            {
                var active = emergencyStop.GetBoolean();
                EmergencyStopText.Text = active ? "ACTIVE" : "Inactive";
                EmergencyStopText.Foreground = new SolidColorBrush(
                    active ? Microsoft.UI.Colors.Red : Microsoft.UI.Colors.LightGreen);
            }
        }

        private async Task LoadHistory()
        {
            try
            {
                var response = await _httpClient.GetAsync("/control/history?limit=10");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);

                    if (data.TryGetProperty("history", out var historyElement))
                    {
                        var history = new List<ControlHistoryItem>();
                        foreach (var item in historyElement.EnumerateArray())
                        {
                            var action = item.TryGetProperty("action", out var a) ? a.GetString() ?? "" : "";
                            var timestamp = item.TryGetProperty("timestamp", out var t) ? t.GetDouble() : 0;
                            var dt = DateTimeOffset.FromUnixTimeSeconds((long)timestamp);

                            history.Add(new ControlHistoryItem
                            {
                                Action = action,
                                Timestamp = dt.LocalDateTime.ToString("g")
                            });
                        }

                        HistoryList.ItemsSource = history;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load history: {ex.Message}");
            }
        }

        private async Task LoadAgencyInfo()
        {
            try
            {
                var response = await _httpClient.GetAsync("/agency/advisory");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);

                    if (data.TryGetProperty("advisory_mode", out var advisoryMode))
                    {
                        AdvisoryModeCheck.IsChecked = advisoryMode.GetBoolean();
                    }

                    if (data.TryGetProperty("trust", out var trust))
                    {
                        var trustVal = trust.GetDouble();
                        var tierName = trustVal switch
                        {
                            < 0.6 => "Stranger",
                            < 0.8 => "Associate",
                            < 0.9 => "Partner",
                            _ => "Surrogate"
                        };
                        TrustLevelText.Text = $"{trustVal:F2} - {tierName} Level";
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load agency info: {ex.Message}");
            }
        }

        private async void TakeControl_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var content = new StringContent(
                    JsonSerializer.Serialize(new { reason = "Creator intervention via Studio" }),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync("/control/take", content);
                if (response.IsSuccessStatusCode)
                {
                    await LoadStatus();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Take control failed: {ex.Message}");
            }
        }

        private async void ReleaseControl_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var response = await _httpClient.PostAsync("/control/release", null);
                if (response.IsSuccessStatusCode)
                {
                    await LoadStatus();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Release control failed: {ex.Message}");
            }
        }

        private async void LockState_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var content = new StringContent(
                    JsonSerializer.Serialize(new { reason = "State locked via Studio" }),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync("/control/lock", content);
                if (response.IsSuccessStatusCode)
                {
                    await LoadStatus();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Lock state failed: {ex.Message}");
            }
        }

        private async void UnlockState_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var response = await _httpClient.PostAsync("/control/unlock", null);
                if (response.IsSuccessStatusCode)
                {
                    await LoadStatus();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Unlock state failed: {ex.Message}");
            }
        }

        private async void EmergencyStop_Click(object sender, RoutedEventArgs e)
        {
            // Show confirmation dialog
            var dialog = new ContentDialog
            {
                Title = "Emergency Stop",
                Content = "This will immediately halt all autonomous actions. Are you sure?",
                PrimaryButtonText = "Stop",
                CloseButtonText = "Cancel",
                XamlRoot = this.XamlRoot
            };

            var result = await dialog.ShowAsync();
            if (result == ContentDialogResult.Primary)
            {
                try
                {
                    var content = new StringContent(
                        JsonSerializer.Serialize(new { reason = "Emergency stop via Studio" }),
                        Encoding.UTF8,
                        "application/json");

                    var response = await _httpClient.PostAsync("/control/emergency_stop", content);
                    if (response.IsSuccessStatusCode)
                    {
                        await LoadStatus();
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Emergency stop failed: {ex.Message}");
                }
            }
        }

        private async void Resume_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var response = await _httpClient.PostAsync("/control/resume", null);
                if (response.IsSuccessStatusCode)
                {
                    await LoadStatus();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Resume failed: {ex.Message}");
            }
        }

        private void AdvisoryMode_Changed(object sender, RoutedEventArgs e)
        {
            // In a real implementation, this would update the agency settings
            var isChecked = AdvisoryModeCheck.IsChecked ?? false;
            System.Diagnostics.Debug.WriteLine($"Advisory mode changed to: {isChecked}");
        }

        private async void RefreshHistory_Click(object sender, RoutedEventArgs e)
        {
            await LoadHistory();
        }
    }
}
