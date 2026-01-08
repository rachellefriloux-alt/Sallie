using Microsoft.UI.Xaml;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Windows.ApplicationModel.Core;
using Windows.Networking.Sockets;
using Windows.Storage.Streams;

namespace SallieStudioApp.Helpers
{
    public class SyncManager
    {
        private static SyncManager _instance;
        private MessageWebSocket _webSocket;
        private DataWriter _dataWriter;
        private DataReader _dataReader;
        private Timer _reconnectTimer;
        private int _reconnectAttempts = 0;
        private const int MaxReconnectAttempts = 5;
        private const int ReconnectDelayMs = 1000;
        private readonly Dictionary<string, Action<SyncEvent>> _eventHandlers = new();
        private string _userId = "default_user";
        private string _platform = "desktop";
        private ConnectionState _connectionState = new ConnectionState
        {
            Connected = false,
            Platform = "desktop",
            LastSync = DateTime.Now
        };

        public event EventHandler<SyncEvent> OnSyncEvent;
        public event EventHandler<ConnectionState> OnConnectionStateChanged;

        public static SyncManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new SyncManager();
                }
                return _instance;
            }
        }

        private SyncManager() { }

        public async Task ConnectAsync(string userId, string platform = "desktop")
        {
            _userId = userId;
            _platform = platform;

            if (_webSocket != null && _webSocket.State == WebSocketState.Open)
            {
                return;
            }

            try
            {
                // Create WebSocket connection
                _webSocket = new MessageWebSocket();
                _dataWriter = new DataWriter(_webSocket.OutputStream);
                _dataReader = new DataReader(_webSocket.InputStream);

                // Set up event handlers
                _webSocket.MessageReceived += OnMessageReceived;
                _webSocket.Closed += OnClosed;

                // Connect to server
                var serverUri = new Uri($"ws://192.168.1.47:8742/sync/ws/{platform}/{userId}");
                await _webSocket.ConnectAsync(serverUri);

                UpdateConnectionState(true, "Connected");
                _reconnectAttempts = 0;

                // Request initial state
                await SendEventAsync("sync_request", new { });
            }
            catch (Exception ex)
            {
                UpdateConnectionState(false, ex.Message);
                ScheduleReconnect();
            }
        }

        public async Task DisconnectAsync()
        {
            if (_reconnectTimer != null)
            {
                _reconnectTimer.Dispose();
                _reconnectTimer = null;
            }

            if (_webSocket != null)
            {
                _webSocket.Close();
                _webSocket = null;
            }

            UpdateConnectionState(false, "Disconnected");
        }

        public async Task SendEventAsync(string eventType, object data)
        {
            if (_webSocket?.State == WebSocketState.Open)
            {
                try
                {
                    var message = new
                    {
                        event_type = eventType,
                        data = data
                    };

                    var json = JsonSerializer.Serialize(message);
                    _dataWriter.WriteString(json);
                    await _dataWriter.StoreAsync();
                    await _dataWriter.FlushAsync();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error sending event: {ex.Message}");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("WebSocket not connected, cannot send event");
            }
        }

        private void OnMessageReceived(MessageWebSocket sender, MessageWebSocketMessageReceivedEventArgs args)
        {
            try
            {
                var message = args.GetDataReader();
                message.UnicodeEncoding = Windows.Storage.Streams.UnicodeEncoding.Utf8;
                var json = message.ReadString(message.UnreadLength);

                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(json);

                if (data.ContainsKey("type"))
                {
                    var type = data["type"].ToString();
                    if (type == "pong")
                    {
                        return;
                    }
                    else if (type == "state_update")
                    {
                        HandleStateUpdate(data);
                        return;
                    }
                }

                var syncEvent = JsonSerializer.Deserialize<SyncEvent>(json);
                HandleSyncEvent(syncEvent);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error parsing message: {ex.Message}");
            }
        }

        private void OnClosed(IWebSocket sender, WebSocketClosedEventArgs args)
        {
            UpdateConnectionState(false, "Connection closed");
            ScheduleReconnect();
        }

        private void HandleSyncEvent(SyncEvent syncEvent)
        {
            // Call registered event handlers
            if (_eventHandlers.TryGetValue(syncEvent.EventType, out var handler))
            {
                handler(syncEvent);
            }

            // Trigger main event
            OnSyncEvent?.Invoke(this, syncEvent);

            // Update connection state
            _connectionState.LastSync = syncEvent.Timestamp;
            OnConnectionStateChanged?.Invoke(this, _connectionState);
        }

        private void HandleStateUpdate(Dictionary<string, object> data)
        {
            var syncEvent = new SyncEvent
            {
                EventType = "state_update",
                Platform = data.ContainsKey("platform") ? data["platform"].ToString() : "server",
                UserId = data.ContainsKey("user_id") ? data["user_id"].ToString() : "",
                Data = data.ContainsKey("data") ? data["data"] : new Dictionary<string, object>(),
                Timestamp = data.ContainsKey("timestamp") ? DateTime.Parse(data["timestamp"].ToString()) : DateTime.Now,
                EventId = data.ContainsKey("event_id") ? data["event_id"].ToString() : ""
            };

            HandleSyncEvent(syncEvent);
        }

        private void ScheduleReconnect()
        {
            if (_reconnectAttempts >= MaxReconnectAttempts)
            {
                System.Diagnostics.Debug.WriteLine("Max reconnect attempts reached");
                return;
            }

            _reconnectTimer = new Timer(async _ =>
            {
                _reconnectAttempts++;
                var delay = Math.Min(ReconnectDelayMs * (int)Math.Pow(2, _reconnectAttempts - 1), 30000);

                System.Diagnostics.Debug.WriteLine($"Reconnecting... Attempt {_reconnectAttempts}");
                await ConnectAsync(_userId, _platform);
            }, null, TimeSpan.FromMilliseconds(delay), TimeSpan.FromMilliseconds(-1));
        }

        private void UpdateConnectionState(bool connected, string message = "")
        {
            _connectionState.Connected = connected;
            _connectionState.Platform = _platform;
            _connectionState.LastSync = DateTime.Now;
            _connectionState.Error = connected ? null : message;

            OnConnectionStateChanged?.Invoke(this, _connectionState);
        }

        public void RegisterEventHandler(string eventType, Action<SyncEvent> handler)
        {
            _eventHandlers[eventType] = handler;
        }

        public void UnregisterEventHandler(string eventType)
        {
            _eventHandlers.Remove(eventType);
        }

        public ConnectionState GetConnectionState()
        {
            return _connectionState;
        }

        // Convenience methods for common events
        public async Task UpdateLimbicStateAsync(Dictionary<string, double> variables)
        {
            await SendEventAsync("limbic_update", new { variables });
        }

        public async Task UpdateCognitiveStateAsync(Dictionary<string, object> state)
        {
            await SendEventAsync("cognitive_update", new { state });
        }

        public async Task ChangeAvatarFormAsync(string form)
        {
            await SendEventAsync("avatar_change", new { form });
        }

        public async Task SwitchRoleAsync(string role)
        {
            await SendEventAsync("role_switch", new { role });
        }

        public async Task ChangeRoomAsync(string room)
        {
            await SendEventAsync("room_change", new { room });
        }

        public async Task SwitchModeAsync(string mode)
        {
            await SendEventAsync("mode_switch", new { mode });
        }

        public async Task SendMessageAsync(string content, string sender = "user")
        {
            await SendEventAsync("message_sent", new
            {
                content,
                sender,
                message_id = $"msg_{DateTime.Now.Ticks}",
                timestamp = DateTime.Now.ToString("O")
            });
        }
    }

    public class SyncEvent
    {
        public string EventType { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public object Data { get; set; } = new Dictionary<string, object>();
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string EventId { get; set; } = string.Empty;
    }

    public class ConnectionState
    {
        public bool Connected { get; set; }
        public string Platform { get; set; } = string.Empty;
        public DateTime LastSync { get; set; }
        public string Error { get; set; }
    }
}
