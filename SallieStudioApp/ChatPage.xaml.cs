using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class ChatPage : Page
    {
        private ClientWebSocket? _webSocket;
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:8000";
        private bool _isConnected = false;
        private CancellationTokenSource? _cts;

        // Limbic state
        private double _trust = 0.5;
        private double _warmth = 0.6;
        private double _arousal = 0.7;
        private double _valence = 0.6;
        private string _posture = "PEER";

        public ChatPage()
        {
            this.InitializeComponent();
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            _ = ConnectWebSocket();
        }

        private async Task ConnectWebSocket()
        {
            try
            {
                _webSocket = new ClientWebSocket();
                _cts = new CancellationTokenSource();
                
                var wsUrl = _baseUrl.Replace("http", "ws") + "/ws";
                await _webSocket.ConnectAsync(new Uri(wsUrl), _cts.Token);
                
                _isConnected = true;
                UpdateConnectionStatus(true);
                
                // Start receiving messages
                _ = ReceiveMessages();
            }
            catch (Exception ex)
            {
                AddSystemMessage($"Connection failed: {ex.Message}");
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
                        ProcessWebSocketMessage(message);
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
                    AddSystemMessage($"Connection lost: {ex.Message}");
                    UpdateConnectionStatus(false);
                });
            }
        }

        private void ProcessWebSocketMessage(string message)
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
                        
                        switch (type)
                        {
                            case "response":
                                if (root.TryGetProperty("content", out var contentElement))
                                {
                                    AddAIMessage(contentElement.GetString() ?? "");
                                }
                                break;
                                
                            case "limbic_update":
                                if (root.TryGetProperty("state", out var stateElement))
                                {
                                    UpdateLimbicState(stateElement);
                                }
                                break;
                                
                            case "ghost_tap":
                                if (root.TryGetProperty("content", out var tapContent))
                                {
                                    AddSystemMessage($"🔮 {tapContent.GetString()}");
                                }
                                break;
                        }
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Parse error: {ex.Message}");
                }
            });
        }

        private void UpdateLimbicState(JsonElement state)
        {
            if (state.TryGetProperty("trust", out var trust))
            {
                _trust = trust.GetDouble();
                TrustBar.Value = _trust * 100;
                TrustText.Text = _trust.ToString("F2");
            }
            
            if (state.TryGetProperty("warmth", out var warmth))
            {
                _warmth = warmth.GetDouble();
                WarmthBar.Value = _warmth * 100;
                WarmthText.Text = _warmth.ToString("F2");
            }
            
            if (state.TryGetProperty("arousal", out var arousal))
            {
                _arousal = arousal.GetDouble();
                ArousalBar.Value = _arousal * 100;
                ArousalText.Text = _arousal.ToString("F2");
            }
            
            if (state.TryGetProperty("valence", out var valence))
            {
                _valence = valence.GetDouble();
                ValenceBar.Value = ((_valence + 1) / 2) * 100; // Map -1 to 1 range
                ValenceText.Text = _valence.ToString("F2");
            }
            
            if (state.TryGetProperty("posture", out var posture))
            {
                _posture = posture.GetString() ?? "PEER";
                PostureText.Text = $"Mode: {_posture}";
            }
        }

        private void UpdateConnectionStatus(bool connected)
        {
            _isConnected = connected;
            ConnectionPill.Background = new SolidColorBrush(
                connected ? Microsoft.UI.Colors.ForestGreen : Microsoft.UI.Colors.IndianRed);
            ConnectionText.Text = connected ? "Connected" : "Disconnected";
        }

        private void AddUserMessage(string text)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 74, 158, 255)),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(12),
                HorizontalAlignment = HorizontalAlignment.Right,
                MaxWidth = 500
            };
            
            border.Child = new TextBlock
            {
                Text = text,
                Foreground = new SolidColorBrush(Microsoft.UI.Colors.White),
                TextWrapping = TextWrapping.Wrap
            };
            
            MessagesPanel.Children.Add(border);
            ScrollToBottom();
        }

        private void AddAIMessage(string text)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 42, 42, 42)),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(12),
                HorizontalAlignment = HorizontalAlignment.Left,
                MaxWidth = 500
            };
            
            border.Child = new TextBlock
            {
                Text = text,
                Foreground = new SolidColorBrush(Microsoft.UI.Colors.White),
                TextWrapping = TextWrapping.Wrap
            };
            
            MessagesPanel.Children.Add(border);
            ScrollToBottom();
        }

        private void AddSystemMessage(string text)
        {
            var textBlock = new TextBlock
            {
                Text = text,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 156, 163, 175)),
                FontStyle = Windows.UI.Text.FontStyle.Italic,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 8, 0, 8)
            };
            
            MessagesPanel.Children.Add(textBlock);
            ScrollToBottom();
        }

        private void ScrollToBottom()
        {
            ChatScroll.UpdateLayout();
            ChatScroll.ChangeView(null, ChatScroll.ScrollableHeight, null);
        }

        private async void Send_Click(object sender, RoutedEventArgs e)
        {
            await SendMessage();
        }

        private async void MessageInput_KeyDown(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter)
            {
                await SendMessage();
            }
        }

        private async Task SendMessage()
        {
            var text = MessageInput.Text?.Trim();
            if (string.IsNullOrEmpty(text)) return;
            
            MessageInput.Text = "";
            AddUserMessage(text);
            
            if (_webSocket?.State == WebSocketState.Open)
            {
                try
                {
                    var messageJson = JsonSerializer.Serialize(new { type = "chat", content = text });
                    var bytes = Encoding.UTF8.GetBytes(messageJson);
                    await _webSocket.SendAsync(
                        new ArraySegment<byte>(bytes), 
                        WebSocketMessageType.Text, 
                        true, 
                        CancellationToken.None);
                }
                catch (Exception ex)
                {
                    AddSystemMessage($"Send failed: {ex.Message}");
                }
            }
            else
            {
                AddSystemMessage("Not connected. Trying to reconnect...");
                await ConnectWebSocket();
            }
        }
    }
}
