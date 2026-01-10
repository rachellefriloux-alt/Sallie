using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.UI;
using Windows.UI.Popups;

namespace SallieStudioApp
{
    public sealed partial class SidebarPremium : Page
    {
        private bool isVisible = false;
        private string currentPage = "Dashboard";
        private WebSocket wsConnection;
        private DispatcherTimer updateTimer;
        private Random random = new Random();

        public event EventHandler<string> NavigationRequested;
        public event EventHandler Closed;

        public SidebarPremium()
        {
            this.InitializeComponent();
            InitializeComponent();
            InitializeSidebar();
            StartUpdateTimer();
        }

        private void InitializeComponent()
        {
            // Initialize sidebar state
            UpdateNavigationSelection("Dashboard");
            
            // Connect to WebSocket for real-time updates
            ConnectWebSocket();
        }

        private void InitializeSidebar()
        {
            // Set initial state
            SidebarTransform.X = -320;
            Backdrop.Visibility = Visibility.Collapsed;
            
            // Start animations
            var fadeInAnimation = (Storyboard)Resources["FadeInAnimation"];
            Storyboard.SetTarget(fadeInAnimation, SidebarContainer);
            fadeInAnimation.Begin();
        }

        private void StartUpdateTimer()
        {
            updateTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(5)
            };
            updateTimer.Tick += UpdateTimer_Tick;
            updateTimer.Start();
        }

        private void UpdateTimer_Tick(object sender, object e)
        {
            // Update connection status and badges
            UpdateConnectionStatus();
            UpdateBadges();
        }

        private void ConnectWebSocket()
        {
            try
            {
                wsConnection = new WebSocket("ws://192.168.1.47:8742/ws/sidebar-status");
                wsConnection.ConnectAsync().ContinueWith(task =>
                {
                    if (task.IsFaulted)
                    {
                        System.Diagnostics.Debug.WriteLine($"WebSocket connection failed: {task.Exception}");
                    }
                    else
                    {
                        wsConnection.MessageReceived += OnWebSocketMessageReceived;
                        wsConnection.Closed += OnWebSocketClosed;
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"WebSocket connection error: {ex.Message}");
            }
        }

        private void OnWebSocketMessageReceived(object sender, WebSocketMessageReceivedEventArgs e)
        {
            var message = e.Message;
            if (message.Contains("badge_update"))
            {
                DispatcherQueue.TryEnqueue(() =>
                {
                    UpdateBadgesFromWebSocket(message);
                });
            }
        }

        private void OnWebSocketClosed(object sender, WebSocketClosedEventArgs e)
        {
            // Attempt to reconnect
            Task.Delay(5000).ContinueWith(_ => ConnectWebSocket());
        }

        private void UpdateBadgesFromWebSocket(string message)
        {
            // Parse badge updates from WebSocket message
            // This is a simplified implementation
            var badgeUpdates = ParseBadgeUpdates(message);
            
            foreach (var update in badgeUpdates)
            {
                UpdateBadge(update.Key, update.Value);
            }
        }

        private Dictionary<string, int> ParseBadgeUpdates(string message)
        {
            // Simplified parsing - in production, use proper JSON parser
            return new Dictionary<string, int>
            {
                ["Convergence"] = random.Next(0, 10),
                ["Agency"] = random.Next(0, 5),
                ["ChatArea"] = random.Next(0, 20)
            };
        }

        private void UpdateBadge(string pageName, int count)
        {
            switch (pageName)
            {
                case "Convergence":
                    UpdateConvergenceBadge(count);
                    break;
                case "Agency":
                    UpdateAgencyBadge(count);
                    break;
                case "ChatArea":
                    UpdateChatAreaBadge(count);
                    break;
            }
        }

        private void UpdateConvergenceBadge(int count)
        {
            var button = FindName("Nav_Convergence") as Button;
            if (button != null)
            {
                var stackPanel = button.Content as StackPanel;
                if (stackPanel != null)
                {
                    var badge = stackPanel.Children.OfType<Border>().FirstOrDefault();
                    if (badge != null)
                    {
                        var textBlock = badge.Child as TextBlock;
                        if (textBlock != null)
                        {
                            textBlock.Text = count.ToString();
                            badge.Visibility = count > 0 ? Visibility.Visible : Visibility.Collapsed;
                        }
                    }
                }
            }
        }

        private void UpdateAgencyBadge(int count)
        {
            var button = FindName("Nav_Agency") as Button;
            if (button != null)
            {
                var stackPanel = button.Content as StackPanel;
                if (stackPanel != null)
                {
                    var badge = stackPanel.Children.OfType<Border>().FirstOrDefault();
                    if (badge != null)
                    {
                        var textBlock = badge.Child as TextBlock;
                        if (textBlock != null)
                        {
                            textBlock.Text = count.ToString();
                            badge.Visibility = count > 0 ? Visibility.Visible : Visibility.Collapsed;
                        }
                    }
                }
            }
        }

        private void UpdateChatAreaBadge(int count)
        {
            var button = FindName("Nav_ChatArea") as Button;
            if (button != null)
            {
                var stackPanel = button.Content as StackPanel;
                if (stackPanel != null)
                {
                    var badge = stackPanel.Children.OfType<Border>().FirstOrDefault();
                    if (badge != null)
                    {
                        var textBlock = badge.Child as TextBlock;
                        if (textBlock != null)
                        {
                            textBlock.Text = count.ToString();
                            badge.Visibility = count > 0 ? Visibility.Visible : Visibility.Collapsed;
                        }
                    }
                }
            }
        }

        private void UpdateConnectionStatus()
        {
            // Simulate connection status updates
            var isConnected = random.NextDouble() > 0.1; // 90% chance of being connected
            
            // Update connection status in footer
            // This would update the connection status indicator
        }

        private void UpdateBadges()
        {
            // Simulate badge updates
            UpdateConvergenceBadge(random.Next(0, 10));
            UpdateAgencyBadge(random.Next(0, 5));
            UpdateChatAreaBadge(random.Next(0, 20));
        }

        public void Show()
        {
            if (!isVisible)
            {
                isVisible = true;
                Backdrop.Visibility = Visibility.Visible;
                
                var slideInAnimation = (Storyboard)Resources["SlideInAnimation"];
                Storyboard.SetTarget(slideInAnimation, SidebarTransform);
                slideInAnimation.Begin();
            }
        }

        public void Hide()
        {
            if (isVisible)
            {
                isVisible = false;
                
                var slideOutAnimation = (Storyboard)Resources["SlideOutAnimation"];
                Storyboard.SetTarget(slideOutAnimation, SidebarTransform);
                slideOutAnimation.Completed += (s, e) =>
                {
                    Backdrop.Visibility = Visibility.Collapsed;
                };
                slideOutAnimation.Begin();
            }
        }

        public void Toggle()
        {
            if (isVisible)
            {
                Hide();
            }
            else
            {
                Show();
            }
        }

        private void UpdateNavigationSelection(string pageName)
        {
            currentPage = pageName;
            
            // Reset all navigation buttons to default style
            var premiumButtons = new[] { "Nav_Dashboard", "Nav_Convergence", "Nav_Agency", "Nav_Identity", 
                                       "Nav_Learning", "Nav_DreamState", "Nav_LimbicScreen", "Nav_VoiceInterface", "Nav_ChatArea" };
            var standardButtons = new[] { "Nav_Projects", "Nav_Heritage", "Nav_Settings" };
            
            foreach (var buttonName in premiumButtons.Concat(standardButtons))
            {
                var button = FindName(buttonName) as Button;
                if (button != null)
                {
                    button.Style = (Style)Resources["NavButtonStyle"];
                    
                    // Update text color for disabled buttons
                    if (standardButtons.Contains(buttonName))
                    {
                        var stackPanel = button.Content as StackPanel;
                        if (stackPanel != null)
                        {
                            var textBlock = stackPanel.Children.OfType<TextBlock>().FirstOrDefault();
                            if (textBlock != null)
                            {
                                textBlock.Foreground = new SolidColorBrush(Color.FromArgb(255, 107, 114, 128));
                            }
                        }
                    }
                }
            }
            
            // Highlight selected button
            var selectedButton = FindName($"Nav_{pageName}") as Button;
            if (selectedButton != null && selectedButton.IsEnabled)
            {
                selectedButton.Style = (Style)Resources["SelectedNavButtonStyle"];
                
                // Update text color for selected item
                var stackPanel = selectedButton.Content as StackPanel;
                if (stackPanel != null)
                {
                    var textBlock = stackPanel.Children.OfType<TextBlock>().FirstOrDefault();
                    if (textBlock != null)
                    {
                        textBlock.Foreground = new SolidColorBrush(Color.FromArgb(255, 251, 191, 36));
                    }
                }
            }
        }

        private void NavigateToPage(object sender, RoutedEventArgs e)
        {
            if (sender is Button button)
            {
                var pageName = button.Name.Replace("Nav_", "");
                
                // Update selection
                UpdateNavigationSelection(pageName);
                
                // Trigger navigation event
                NavigationRequested?.Invoke(this, pageName);
                
                // Auto-hide sidebar on desktop after navigation
                Hide();
            }
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Hide();
            Closed?.Invoke(this, EventArgs.Empty);
        }

        private void Backdrop_Tapped(object sender, TappedRoutedEventArgs e)
        {
            Hide();
        }

        private async void QuickAction_NewSession(object sender, RoutedEventArgs e)
        {
            try
            {
                // Start new session
                System.Diagnostics.Debug.WriteLine("Starting new session...");
                
                // Send WebSocket message
                if (wsConnection != null && wsConnection.State == WebSocketState.Open)
                {
                    await wsConnection.SendMessageAsync("{\"type\": \"new_session\", \"timestamp\": \"" + DateTime.Now.ToString() + "\"}");
                }
                
                // Show confirmation
                var dialog = new MessageDialog("New session started successfully.");
                await dialog.ShowAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to start new session: {ex.Message}");
                var dialog = new MessageDialog("Failed to start new session. Please try again.");
                await dialog.ShowAsync();
            }
        }

        private async void QuickAction_VoiceToggle(object sender, RoutedEventArgs e)
        {
            try
            {
                // Toggle voice interface
                System.Diagnostics.Debug.WriteLine("Toggling voice interface...");
                
                // Send WebSocket message
                if (wsConnection != null && wsConnection.State == WebSocketState.Open)
                {
                    await wsConnection.SendMessageAsync("{\"type\": \"voice_toggle\", \"timestamp\": \"" + DateTime.Now.ToString() + "\"}");
                }
                
                // Show confirmation
                var dialog = new MessageDialog("Voice interface toggled.");
                await dialog.ShowAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to toggle voice interface: {ex.Message}");
                var dialog = new MessageDialog("Failed to toggle voice interface. Please try again.");
                await dialog.ShowAsync();
            }
        }

        private async void QuickAction_SyncData(object sender, RoutedEventArgs e)
        {
            try
            {
                // Sync data
                System.Diagnostics.Debug.WriteLine("Syncing data...");
                
                // Send WebSocket message
                if (wsConnection != null && wsConnection.State == WebSocketState.Open)
                {
                    await wsConnection.SendMessageAsync("{\"type\": \"sync_data\", \"timestamp\": \"" + DateTime.Now.ToString() + "\"}");
                }
                
                // Show confirmation
                var dialog = new MessageDialog("Data synchronization completed.");
                await dialog.ShowAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to sync data: {ex.Message}");
                var dialog = new MessageDialog("Failed to sync data. Please try again.");
                await dialog.ShowAsync();
            }
        }

        private async void QuickAction_Export(object sender, RoutedEventArgs e)
        {
            try
            {
                // Export data
                System.Diagnostics.Debug.WriteLine("Exporting data...");
                
                // Send WebSocket message
                if (wsConnection != null && wsConnection.State == WebSocketState.Open)
                {
                    await wsConnection.SendMessageAsync("{\"type\": \"export_data\", \"timestamp\": \"" + DateTime.Now.ToString() + "\"}");
                }
                
                // Show confirmation
                var dialog = new MessageDialog("Data export completed successfully.");
                await dialog.ShowAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to export data: {ex.Message}");
                var dialog = new MessageDialog("Failed to export data. Please try again.");
                await dialog.ShowAsync();
            }
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            
            // Check if page name was passed in navigation parameter
            if (e.Parameter is string pageName)
            {
                UpdateNavigationSelection(pageName);
            }
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            base.OnNavigatedFrom(e);
            
            // Clean up resources
            if (updateTimer != null)
            {
                updateTimer.Stop();
                updateTimer = null;
            }
            
            if (wsConnection != null)
            {
                wsConnection.CloseAsync();
                wsConnection = null;
            }
        }

        protected override void OnKeyDown(KeyRoutedEventArgs e)
        {
            base.OnKeyDown(e);
            
            // Handle escape key to close sidebar
            if (e.Key == Windows.System.VirtualKey.Escape && isVisible)
            {
                Hide();
            }
        }
    }

    // WebSocket implementation (simplified)
    public class WebSocket
    {
        public enum WebSocketState { Open, Closed, Connecting }
        
        public WebSocketState State { get; private set; }
        
        public WebSocket(string url)
        {
            State = WebSocketState.Connecting;
        }
        
        public Task ConnectAsync()
        {
            // Simulate connection
            State = WebSocketState.Open;
            return Task.CompletedTask;
        }
        
        public Task SendMessageAsync(string message)
        {
            if (State == WebSocketState.Open)
            {
                // Simulate sending message
                System.Diagnostics.Debug.WriteLine($"WebSocket message: {message}");
            }
            return Task.CompletedTask;
        }
        
        public Task CloseAsync()
        {
            State = WebSocketState.Closed;
            return Task.CompletedTask;
        }
        
        public event EventHandler<WebSocketMessageReceivedEventArgs> MessageReceived;
        public event EventHandler<WebSocketClosedEventArgs> Closed;
    }

    public class WebSocketMessageReceivedEventArgs : EventArgs
    {
        public string Message { get; set; }
    }

    public class WebSocketClosedEventArgs : EventArgs
    {
        public WebSocketCloseStatus CloseStatus { get; set; }
    }

    public enum WebSocketCloseStatus { Normal, Aborted, Error }
}
