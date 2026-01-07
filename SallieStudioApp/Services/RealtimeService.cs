using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Net.WebSockets;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Windows.ApplicationModel.Core;
using Windows.Storage;

namespace SallieStudioApp.Services
{
    public class RealtimeService : INotifyPropertyChanged
    {
        #region Singleton
        private static RealtimeService _instance;
        public static RealtimeService Instance => _instance ??= new RealtimeService();
        #endregion

        #region Properties
        private ConnectionStatus _connectionStatus = new();
        public ConnectionStatus ConnectionStatus
        {
            get => _connectionStatus;
            set
            {
                if (_connectionStatus != value)
                {
                    _connectionStatus = value;
                    OnPropertyChanged();
                }
            }
        }

        private ObservableCollection<RealtimeMessage> _messages = new();
        public ObservableCollection<RealtimeMessage> Messages
        {
            get => _messages;
            set
            {
                if (_messages != value)
                {
                    _messages = value;
                    OnPropertyChanged();
                }
            }
        }

        private Dictionary<string, PresenceInfo> _presence = new();
        public Dictionary<string, PresenceInfo> Presence
        {
            get => _presence;
            set
            {
                if (_presence != value)
                {
                    _presence = value;
                    OnPropertyChanged();
                }
            }
        }

        private Dictionary<string, long> _typingUsers = new();
        public Dictionary<string, long> TypingUsers
        {
            get => _typingUsers;
            set
            {
                if (_typingUsers != value)
                {
                    _typingUsers = value;
                    OnPropertyChanged();
                }
            }
        }

        private RealtimeConfig _config = new();
        public RealtimeConfig Config
        {
            get => _config;
            set
            {
                if (_config != value)
                {
                    _config = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region Events
        public event EventHandler<RealtimeMessage> MessageReceived;
        public event EventHandler<string> UserConnected;
        public event EventHandler<string> UserDisconnected;
        public event EventHandler<string> UserStartedTyping;
        public event EventHandler<string> UserStoppedTyping;
        public event PropertyChangedEventHandler PropertyChanged;
        #endregion

        #region Private Fields
        private ClientWebSocket _webSocket;
        private DispatcherQueue _dispatcherQueue;
        private CancellationTokenSource _cancellationTokenSource;
        private Timer _heartbeatTimer;
        private Timer _typingCleanupTimer;
        private Queue<RealtimeMessage> _messageQueue = new();
        private readonly object _lockObject = new object();
        #endregion

        private RealtimeService()
        {
            _dispatcherQueue = DispatcherQueue.GetForCurrentThread();
            LoadConfiguration();
            InitializeTimers();
        }

        #region Configuration
        private async void LoadConfiguration()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                if (settings.Values.TryGetValue("RealtimeConfig", out var configValue) && 
                    configValue is string configJson)
                {
                    Config = JsonSerializer.Deserialize<RealtimeConfig>(configJson);
                }
                else
                {
                    Config = new RealtimeConfig();
                    await SaveConfiguration();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading realtime config: {ex.Message}");
                Config = new RealtimeConfig();
            }
        }

        private async Task SaveConfiguration()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                var configJson = JsonSerializer.Serialize(Config);
                settings.Values["RealtimeConfig"] = configJson;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving realtime config: {ex.Message}");
            }
        }

        private void InitializeTimers()
        {
            // Typing cleanup timer
            _typingCleanupTimer = new Timer(CleanupTypingIndicators, null, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1));
        }
        #endregion

        #region Connection Management
        public async Task ConnectAsync()
        {
            if (_webSocket?.State == WebSocketState.Open || 
                _webSocket?.State == WebSocketState.Connecting)
            {
                return;
            }

            try
            {
                _cancellationTokenSource?.Cancel();
                _cancellationTokenSource = new CancellationTokenSource();

                UpdateConnectionStatus(connected: false, connecting: true, error: null);

                _webSocket = new ClientWebSocket();
                
                // Set headers if needed
                _webSocket.Options.SetRequestHeader("User-Agent", "SallieStudio/1.0");

                await _webSocket.ConnectAsync(new Uri(Config.Url), _cancellationTokenSource.Token);

                // Start listening for messages
                _ = Task.Run(ListenForMessagesAsync);

                // Start heartbeat
                StartHeartbeat();

                // Send queued messages
                await SendQueuedMessagesAsync();

                UpdateConnectionStatus(connected: true, connecting: false, error: null);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"WebSocket connection error: {ex.Message}");
                UpdateConnectionStatus(connected: false, connecting: false, error: ex.Message);
                
                // Schedule reconnection
                ScheduleReconnect();
            }
        }

        public async Task DisconnectAsync()
        {
            try
            {
                _cancellationTokenSource?.Cancel();
                _heartbeatTimer?.Dispose();
                
                if (_webSocket != null)
                {
                    if (_webSocket.State == WebSocketState.Open)
                    {
                        await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, 
                            "User disconnected", CancellationToken.None);
                    }
                    _webSocket.Dispose();
                    _webSocket = null;
                }

                UpdateConnectionStatus(connected: false, connecting: false, error: null, reconnectAttempts: 0);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error disconnecting: {ex.Message}");
            }
        }

        private async Task ReconnectAsync()
        {
            if (ConnectionStatus.ReconnectAttempts >= Config.MaxReconnectAttempts)
            {
                UpdateConnectionStatus(connected: false, connecting: false, 
                    error: "Max reconnection attempts reached");
                return;
            }

            var delay = TimeSpan.FromMilliseconds(Config.ReconnectInterval * 
                Math.Pow(2, ConnectionStatus.ReconnectAttempts));

            await Task.Delay(delay);

            UpdateConnectionStatus(connected: false, connecting: false, 
                error: null, reconnectAttempts: ConnectionStatus.ReconnectAttempts + 1);

            await ConnectAsync();
        }

        private void ScheduleReconnect()
        {
            _ = Task.Run(ReconnectAsync);
        }
        #endregion

        #region Message Handling
        private async Task ListenForMessagesAsync()
        {
            var buffer = new byte[4096];
            
            try
            {
                while (_webSocket?.State == WebSocketState.Open && 
                       !_cancellationTokenSource.Token.IsCancellationRequested)
                {
                    var result = await _webSocket.ReceiveAsync(
                        new ArraySegment<byte>(buffer), _cancellationTokenSource.Token);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var messageJson = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        await HandleMessageAsync(messageJson);
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await HandleDisconnectAsync();
                        break;
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Normal cancellation
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error receiving message: {ex.Message}");
                await HandleDisconnectAsync();
            }
        }

        private async Task HandleMessageAsync(string messageJson)
        {
            try
            {
                var message = JsonSerializer.Deserialize<RealtimeMessage>(messageJson);
                if (message == null) return;

                await _dispatcherQueue.TryEnqueue(() =>
                {
                    Messages.Add(message);
                    MessageReceived?.Invoke(this, message);
                });

                // Handle specific message types
                switch (message.Type)
                {
                    case MessageType.Presence:
                        await HandlePresenceMessageAsync(message);
                        break;
                    case MessageType.Typing:
                        await HandleTypingMessageAsync(message);
                        break;
                    case MessageType.System:
                        await HandleSystemMessageAsync(message);
                        break;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error handling message: {ex.Message}");
            }
        }

        private async Task HandlePresenceMessageAsync(RealtimeMessage message)
        {
            if (!Config.EnablePresence || message.Data?.UserId == null) return;

            var userId = message.Data.UserId.ToString();
            var presenceInfo = new PresenceInfo
            {
                UserId = userId,
                Status = Enum.TryParse<PresenceStatus>(message.Data.Status?.ToString(), out var status) 
                    ? status : PresenceStatus.Offline,
                LastSeen = message.Timestamp,
                Typing = message.Data.Typing as bool? ?? false,
                ChannelId = message.ChannelId,
            };

            await _dispatcherQueue.TryEnqueue(() =>
            {
                Presence[userId] = presenceInfo;

                if (presenceInfo.Status == PresenceStatus.Online)
                {
                    UserConnected?.Invoke(this, userId);
                }
                else
                {
                    UserDisconnected?.Invoke(this, userId);
                }
            });
        }

        private async Task HandleTypingMessageAsync(RealtimeMessage message)
        {
            if (!Config.EnableTyping || message.Data?.UserId == null) return;

            var userId = message.Data.UserId.ToString();
            var isTyping = message.Data.Typing as bool? ?? false;

            await _dispatcherQueue.TryEnqueue(() =>
            {
                if (isTyping)
                {
                    TypingUsers[userId] = message.Timestamp;
                    UserStartedTyping?.Invoke(this, userId);
                }
                else
                {
                    TypingUsers.Remove(userId);
                    UserStoppedTyping?.Invoke(this, userId);
                }
            });
        }

        private async Task HandleSystemMessageAsync(RealtimeMessage message)
        {
            // Handle system messages (user joined/left, etc.)
            System.Diagnostics.Debug.WriteLine($"System message: {JsonSerializer.Serialize(message.Data)}");
        }

        private async Task HandleDisconnectAsync()
        {
            await _dispatcherQueue.TryEnqueue(() =>
            {
                UpdateConnectionStatus(connected: false, connecting: false, error: "Connection lost");
            });

            _heartbeatTimer?.Dispose();
            ScheduleReconnect();
        }
        #endregion

        #region Message Sending
        public async Task<string> SendMessageAsync(RealtimeMessage message)
        {
            var fullMessage = new RealtimeMessage
            {
                Id = message.Id ?? Guid.NewGuid().ToString(),
                Type = message.Type,
                Data = message.Data,
                Timestamp = message.Timestamp > 0 ? message.Timestamp : DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                UserId = message.UserId,
                ChannelId = message.ChannelId,
            };

            if (_webSocket?.State == WebSocketState.Open)
            {
                try
                {
                    var messageJson = JsonSerializer.Serialize(fullMessage);
                    var buffer = Encoding.UTF8.GetBytes(messageJson);
                    await _webSocket.SendAsync(new ArraySegment<byte>(buffer), 
                        WebSocketMessageType.Text, true, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error sending message: {ex.Message}");
                    _messageQueue.Enqueue(fullMessage);
                }
            }
            else
            {
                // Queue message for when connection is restored
                _messageQueue.Enqueue(fullMessage);
                
                // Try to connect if not connected
                if (!ConnectionStatus.Connected && !ConnectionStatus.Connecting)
                {
                    _ = Task.Run(ConnectAsync);
                }
            }

            return fullMessage.Id;
        }

        public async Task<string> SendChatMessageAsync(string content, string channelId = null)
        {
            return await SendMessageAsync(new RealtimeMessage
            {
                Type = MessageType.Message,
                Data = new { Content = content },
                ChannelId = channelId,
            });
        }

        public async Task<string> SendTypingAsync(bool typing, string channelId = null)
        {
            return await SendMessageAsync(new RealtimeMessage
            {
                Type = MessageType.Typing,
                Data = new { Typing = typing },
                ChannelId = channelId,
            });
        }

        public async Task<string> UpdatePresenceAsync(PresenceStatus status)
        {
            return await SendMessageAsync(new RealtimeMessage
            {
                Type = MessageType.Presence,
                Data = new { Status = status.ToString().ToLower() },
            });
        }

        private async Task SendQueuedMessagesAsync()
        {
            while (_messageQueue.Count > 0)
            {
                var message = _messageQueue.Dequeue();
                await SendMessageAsync(message);
            }
        }
        #endregion

        #region Heartbeat
        private void StartHeartbeat()
        {
            _heartbeatTimer?.Dispose();
            _heartbeatTimer = new Timer(async _ =>
            {
                if (_webSocket?.State == WebSocketState.Open)
                {
                    try
                    {
                        var pingMessage = new RealtimeMessage
                        {
                            Type = MessageType.Ping,
                            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                        };
                        await SendMessageAsync(pingMessage);
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error sending ping: {ex.Message}");
                    }
                }
            }, null, TimeSpan.Zero, TimeSpan.FromMilliseconds(Config.HeartbeatInterval));
        }
        #endregion

        #region Utilities
        private void CleanupTypingIndicators(object state)
        {
            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var typingTimeout = 5000; // 5 seconds

            var expiredUsers = new List<string>();
            foreach (var kvp in TypingUsers)
            {
                if (now - kvp.Value > typingTimeout)
                {
                    expiredUsers.Add(kvp.Key);
                }
            }

            if (expiredUsers.Count > 0)
            {
                _dispatcherQueue.TryEnqueue(() =>
                {
                    foreach (var userId in expiredUsers)
                    {
                        TypingUsers.Remove(userId);
                        UserStoppedTyping?.Invoke(this, userId);
                    }
                });
            }
        }

        public List<PresenceInfo> GetOnlineUsers()
        {
            lock (_lockObject)
            {
                return Presence.Values.Where(p => p.Status == PresenceStatus.Online).ToList();
            }
        }

        public List<string> GetTypingUsers(string channelId = null)
        {
            lock (_lockObject)
            {
                return TypingUsers
                    .Where(kvp => !string.IsNullOrEmpty(channelId) && 
                                   Presence.ContainsKey(kvp.Key) && 
                                   Presence[kvp.Key].ChannelId == channelId)
                    .Select(kvp => kvp.Key)
                    .ToList();
            }
        }

        private void UpdateConnectionStatus(bool connected, bool connecting, string error, int? reconnectAttempts = null)
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                ConnectionStatus.Connected = connected;
                ConnectionStatus.Connecting = connecting;
                ConnectionStatus.Error = error;
                if (reconnectAttempts.HasValue)
                {
                    ConnectionStatus.ReconnectAttempts = reconnectAttempts.Value;
                }
                if (connected)
                {
                    ConnectionStatus.LastConnected = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                }
            });
        }
        #endregion

        #region INotifyPropertyChanged
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
        #endregion
    }

    #region Supporting Classes
    public class ConnectionStatus : INotifyPropertyChanged
    {
        private bool _connected;
        public bool Connected
        {
            get => _connected;
            set
            {
                if (_connected != value)
                {
                    _connected = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _connecting;
        public bool Connecting
        {
            get => _connecting;
            set
            {
                if (_connecting != value)
                {
                    _connecting = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _error;
        public string Error
        {
            get => _error;
            set
            {
                if (_error != value)
                {
                    _error = value;
                    OnPropertyChanged();
                }
            }
        }

        private long _lastConnected;
        public long LastConnected
        {
            get => _lastConnected;
            set
            {
                if (_lastConnected != value)
                {
                    _lastConnected = value;
                    OnPropertyChanged();
                }
            }
        }

        private int _reconnectAttempts;
        public int ReconnectAttempts
        {
            get => _reconnectAttempts;
            set
            {
                if (_reconnectAttempts != value)
                {
                    _reconnectAttempts = value;
                    OnPropertyChanged();
                }
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class RealtimeMessage
    {
        public string Id { get; set; }
        public MessageType Type { get; set; }
        public object Data { get; set; }
        public long Timestamp { get; set; }
        public string UserId { get; set; }
        public string ChannelId { get; set; }
    }

    public class PresenceInfo
    {
        public string UserId { get; set; }
        public PresenceStatus Status { get; set; }
        public long LastSeen { get; set; }
        public bool Typing { get; set; }
        public string ChannelId { get; set; }
    }

    public class RealtimeConfig
    {
        public string Url { get; set; } = "ws://192.168.1.47:8742/ws";
        public int ReconnectInterval { get; set; } = 3000;
        public int MaxReconnectAttempts { get; set; } = 5;
        public int HeartbeatInterval { get; set; } = 30000;
        public bool EnablePresence { get; set; } = true;
        public bool EnableTyping { get; set; } = true;
    }

    public enum MessageType
    {
        Message,
        Status,
        Presence,
        Typing,
        System,
        Ping,
        Pong
    }

    public enum PresenceStatus
    {
        Online,
        Away,
        Offline
    }
    #endregion
}
