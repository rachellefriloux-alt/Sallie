using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Windows.System;
using Microsoft.UI.Xaml.Media;

namespace SallieStudioApp
{
    public sealed partial class Dashboard : UserControl
    {
        private DispatcherTimer _statusTimer;
        private Random _random = new Random();
        private List<ChatMessage> _messages = new List<ChatMessage>();
        private int _messageId = 1;

        public Dashboard()
        {
            this.InitializeComponent();
            InitializeDashboard();
        }

        private void InitializeDashboard()
        {
            // Initialize status timer
            _statusTimer = new DispatcherTimer();
            _statusTimer.Interval = TimeSpan.FromSeconds(5);
            _statusTimer.Tick += UpdateStatus;
            _statusTimer.Start();

            // Initialize sample messages
            InitializeSampleMessages();

            // Set up event handlers
            MessageInput.KeyDown += MessageInput_KeyDown;
            MessageInput.TextChanged += MessageInput_TextChanged;

            // Initial status update
            UpdateStatus(null, null);
        }

        private void InitializeSampleMessages()
        {
            _messages.Add(new ChatMessage
            {
                Id = _messageId++,
                Text = "Hello! I'm Sallie, your AI companion. How can I help you today?",
                IsFromUser = false,
                Timestamp = DateTime.Now.AddMinutes(-5)
            });

            _messages.Add(new ChatMessage
            {
                Id = _messageId++,
                Text = "Hi Sallie! I'd like to know more about your capabilities.",
                IsFromUser = true,
                Timestamp = DateTime.Now.AddMinutes(-4)
            });

            _messages.Add(new ChatMessage
            {
                Id = _messageId++,
                Text = "I'm here to assist you with various tasks including conversation, analysis, creative work, and much more. I'm designed to be a helpful and intelligent companion.",
                IsFromUser = false,
                Timestamp = DateTime.Now.AddMinutes(-3)
            });

            RefreshMessages();
        }

        private void UpdateStatus(object sender, object e)
        {
            // Update backend status
            UpdateBackendStatus();
            
            // Update Docker status
            UpdateDockerStatus();
            
            // Update metrics
            UpdateMetrics();
            
            // Update conversation status
            UpdateConversationStatus();
        }

        private void UpdateBackendStatus()
        {
            var isConnected = _random.Next(1, 100) > 5; // 95% uptime simulation
            
            if (isConnected)
            {
                BackendStatusDot.Fill = new SolidColorBrush(Windows.UI.Colors.Green);
                BackendStatusText.Text = "Backend: Connected";
                BackendStatusBorder.Background = new SolidColorBrush(Windows.UI.Color.FromArgb(31, 41, 55));
            }
            else
            {
                BackendStatusDot.Fill = new SolidColorBrush(Windows.UI.Colors.Red);
                BackendStatusText.Text = "Backend: Disconnected";
                BackendStatusBorder.Background = new SolidColorBrush(Windows.UI.Color.FromArgb(127, 29, 29));
            }
        }

        private void UpdateDockerStatus()
        {
            var isRunning = _random.Next(1, 100) > 2; // 98% uptime simulation
            
            if (isRunning)
            {
                DockerStatusDot.Fill = new SolidColorBrush(Windows.UI.Colors.Green);
                DockerStatusText.Text = "Docker: Running";
                DockerStatusBorder.Background = new SolidColorBrush(Windows.UI.Color.FromArgb(31, 41, 55));
            }
            else
            {
                DockerStatusDot.Fill = new SolidColorBrush(Windows.UI.Colors.Orange);
                DockerStatusText.Text = "Docker: Restarting";
                DockerStatusBorder.Background = new SolidColorBrush(Windows.UI.Color.FromArgb(127, 69, 29));
            }
        }

        private void UpdateMetrics()
        {
            // Connection strength
            var connectionStrength = _random.Next(85, 100);
            ConnectionStrengthText.Text = $"{connectionStrength}%";
            ConnectionQualityText.Text = connectionStrength > 95 ? "Excellent" : 
                                         connectionStrength > 85 ? "Good" : "Fair";

            // Response time
            var responseTime = _random.Next(30, 80);
            ResponseTimeText.Text = $"{responseTime}ms";
            ResponseQualityText.Text = responseTime < 50 ? "Very Fast" : 
                                      responseTime < 70 ? "Fast" : "Normal";

            // Memory usage
            var memoryUsage = _random.Next(200, 400);
            MemoryUsageText.Text = $"{memoryUsage}MB";
            MemoryEfficiencyText.Text = memoryUsage < 300 ? "Optimal" : 
                                         memoryUsage < 350 ? "Good" : "High";

            // Active sessions
            var activeSessions = _random.Next(1, 5);
            ActiveSessionsText.Text = $"{activeSessions}";
            SessionStatusText.Text = activeSessions > 1 ? "All Active" : "Active";
        }

        private void UpdateConversationStatus()
        {
            var statuses = new[] { "Ready to chat", "Processing...", "Typing...", "Thinking..." };
            var randomStatus = statuses[_random.Next(statuses.Length)];
            ConversationStatusText.Text = randomStatus;
        }

        private void MessageInput_KeyDown(object sender, Microsoft.UI.Xaml.Input.KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter && !e.Handled)
            {
                SendMessage();
                e.Handled = true;
            }
        }

        private void MessageInput_TextChanged(object sender, TextChangedEventArgs e)
        {
            // Update placeholder text
            if (string.IsNullOrEmpty(MessageInput.Text))
            {
                MessageInput.PlaceholderText = "Type your message...";
            }
        }

        private void SendMessage()
        {
            var message = MessageInput.Text?.Trim();
            if (string.IsNullOrEmpty(message))
                return;

            // Add user message
            _messages.Add(new ChatMessage
            {
                Id = _messageId++,
                Text = message,
                IsFromUser = true,
                Timestamp = DateTime.Now
            });

            // Clear input
            MessageInput.Text = "";

            // Simulate AI response
            Task.Delay(1000).ContinueWith(async _ =>
            {
                await DispatcherQueue.TryEnqueueAsync(() =>
                {
                    var responses = new[]
                    {
                        "That's an interesting question! Let me think about that...",
                        "I understand what you're saying. Here's my perspective...",
                        "Great point! I can definitely help you with that.",
                        "Let me analyze that for you. Based on my understanding...",
                        "I appreciate you sharing that with me. Here's what I think..."
                    };

                    var response = responses[_random.Next(responses.Length)];

                    _messages.Add(new ChatMessage
                    {
                        Id = _messageId++,
                        Text = response,
                        IsFromUser = false,
                        Timestamp = DateTime.Now
                    });

                    RefreshMessages();
                });
            });
        }

        private void RefreshMessages()
        {
            MessagesPanel.Children.Clear();

            foreach (var message in _messages.OrderByDescending(m => m.Timestamp))
            {
                var messageBorder = new Border
                {
                    Background = message.IsFromUser ? 
                        new SolidColorBrush(Windows.UI.Color.FromArgb(139, 92, 246)) :
                        new SolidColorBrush(Windows.UI.Color.FromArgb(243, 244, 246)),
                    CornerRadius = new CornerRadius(12),
                    Padding = new Thickness(16),
                    MaxWidth = 400,
                    HorizontalAlignment = message.IsFromUser ? 
                        HorizontalAlignment.Right : 
                        HorizontalAlignment.Left,
                    Margin = new Thickness(0, 0, 0, 8)
                };

                var messageText = new TextBlock
                {
                    Text = message.Text,
                    Foreground = message.IsFromUser ? 
                        new SolidColorBrush(Windows.UI.Colors.White) :
                        new SolidColorBrush(Windows.UI.Color.FromArgb(31, 41, 55)),
                    TextWrapping = TextWrapping.Wrap,
                    FontSize = 14
                };

                messageBorder.Child = messageText;
                MessagesPanel.Children.Add(messageBorder);
            }

            // Scroll to bottom
            MessagesScrollViewer.UpdateLayout();
            MessagesScrollViewer.ChangeView(0, MessagesScrollViewer.ExtentHeight, null);
        }

        private void OnQuickActionClick(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Content is string content)
            {
                switch (content)
                {
                    case "🎤 Start Voice Chat":
                        StartVoiceChat();
                        break;
                    case "📊 View Analytics":
                        ViewAnalytics();
                        break;
                    case "⚙️ Settings":
                        OpenSettings();
                        break;
                }
            }
        }

        private void StartVoiceChat()
        {
            // Implement voice chat functionality
            MessageInput.Text = "🎤 Starting voice chat...";
            SendMessage();
        }

        private void ViewAnalytics()
        {
            // Navigate to analytics page
            // This would typically navigate to another page
            MessageInput.Text = "📊 Opening analytics...";
            SendMessage();
        }

        private void OpenSettings()
        {
            // Navigate to settings page
            // This would typically navigate to another page
            MessageInput.Text = "⚙️ Opening settings...";
            SendMessage();
        }

        private void OnNavigationClick(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Content is string content)
            {
                switch (content)
                {
                    case "🏠 Home":
                        // Already on home
                        break;
                    case "💬 Chat":
                        // Focus on chat input
                        MessageInput.Focus(FocusState.Programmatic);
                        break;
                    case "📊 Analytics":
                        ViewAnalytics();
                        break;
                    case "⚙️ Settings":
                        OpenSettings();
                        break;
                }
            }
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            // Refresh dashboard when navigated to
            UpdateStatus(null, null);
        }

        protected override void OnUnloaded(RoutedEventArgs e)
        {
            base.OnUnloaded(e);
            // Clean up timer
            _statusTimer?.Stop();
        }
    }

    public class ChatMessage
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public bool IsFromUser { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
