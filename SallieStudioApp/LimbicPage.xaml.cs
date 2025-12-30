using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using System;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class LimbicPage : Page
    {
        private ClientWebSocket? _webSocket;
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:8000";
        private CancellationTokenSource? _cts;

        public LimbicPage()
        {
            this.InitializeComponent();
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            _ = InitializeAsync();
        }

        private async Task InitializeAsync()
        {
            await LoadCurrentState();
            await ConnectWebSocket();
        }

        private async Task LoadCurrentState()
        {
            try
            {
                var response = await _httpClient.GetAsync("/status");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);

                    if (data.TryGetProperty("limbic", out var limbic))
                    {
                        UpdateLimbicUI(limbic);
                    }

                    if (data.TryGetProperty("agency_tier", out var tier))
                    {
                        var tierName = tier.GetString();
                        TierValue.Text = $"Tier {GetTierNumber(tierName ?? "")} - {tierName}";
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load state: {ex.Message}");
            }
        }

        private int GetTierNumber(string tierName)
        {
            return tierName.ToUpper() switch
            {
                "STRANGER" => 0,
                "ASSOCIATE" => 1,
                "PARTNER" => 2,
                "SURROGATE" => 3,
                _ => 1
            };
        }

        private async Task ConnectWebSocket()
        {
            try
            {
                _webSocket = new ClientWebSocket();
                _cts = new CancellationTokenSource();

                var wsUrl = _baseUrl.Replace("http", "ws") + "/ws";
                await _webSocket.ConnectAsync(new Uri(wsUrl), _cts.Token);

                UpdateConnectionStatus(true);
                _ = ReceiveMessages();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"WebSocket connection failed: {ex.Message}");
                UpdateConnectionStatus(false);
            }
        }

        private async Task ReceiveMessages()
        {
            var buffer = new byte[4096];

            try
            {
                while (_webSocket?.State == WebSocketState.Open)
                {
                    var result = await _webSocket.ReceiveAsync(
                        new ArraySegment<byte>(buffer),
                        _cts?.Token ?? CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        ProcessMessage(message);
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                DispatcherQueue.TryEnqueue(() =>
                {
                    System.Diagnostics.Debug.WriteLine($"WebSocket error: {ex.Message}");
                    UpdateConnectionStatus(false);
                });
            }
        }

        private void ProcessMessage(string message)
        {
            DispatcherQueue.TryEnqueue(() =>
            {
                try
                {
                    var json = JsonDocument.Parse(message);
                    var root = json.RootElement;

                    if (root.TryGetProperty("type", out var typeElement))
                    {
                        var type = typeElement.GetString();

                        if (type == "limbic_update" && root.TryGetProperty("state", out var stateElement))
                        {
                            UpdateLimbicUI(stateElement);
                        }
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Parse error: {ex.Message}");
                }
            });
        }

        private void UpdateLimbicUI(JsonElement state)
        {
            if (state.TryGetProperty("trust", out var trust))
            {
                var val = trust.GetDouble();
                TrustBar.Value = val * 100;
                TrustValue.Text = val.ToString("F2");
            }

            if (state.TryGetProperty("warmth", out var warmth))
            {
                var val = warmth.GetDouble();
                WarmthBar.Value = val * 100;
                WarmthValue.Text = val.ToString("F2");
            }

            if (state.TryGetProperty("arousal", out var arousal))
            {
                var val = arousal.GetDouble();
                ArousalBar.Value = val * 100;
                ArousalValue.Text = val.ToString("F2");
            }

            if (state.TryGetProperty("valence", out var valence))
            {
                var val = valence.GetDouble();
                ValenceBar.Value = ((val + 1) / 2) * 100; // Map -1 to 1 range
                ValenceValue.Text = val.ToString("F2");
            }

            if (state.TryGetProperty("posture", out var posture))
            {
                PostureValue.Text = posture.GetString() ?? "PEER";
            }
        }

        private void UpdateConnectionStatus(bool connected)
        {
            ConnectionBorder.Background = new SolidColorBrush(
                connected ? Microsoft.UI.Colors.ForestGreen : Microsoft.UI.Colors.IndianRed);
            ConnectionText.Text = connected ? "Connected" : "Disconnected";
        }

        private void TimeRange_Changed(object sender, SelectionChangedEventArgs e)
        {
            // In a real implementation, this would reload historical data
            System.Diagnostics.Debug.WriteLine($"Time range changed to: {TimeRangeSelector.SelectedIndex}");
        }
    }
}
