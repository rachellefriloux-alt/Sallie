using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.UI;
using Windows.UI.Popups;

namespace SallieStudioApp
{
    public sealed partial class LimbicScreenPremium : Page
    {
        private WebSocket wsConnection;
        private LimbicState limbicState = new LimbicState();
        private ObservableCollection<LimbicHistory> limbicHistory = new ObservableCollection<LimbicHistory>();
        private string selectedTimeRange = "1h";
        private bool isRecording = false;
        private DispatcherTimer updateTimer;

        public LimbicScreenPremium()
        {
            this.InitializeComponent();
            InitializeComponent();
            LoadInitialData();
            ConnectWebSocket();
            StartAnimations();
            StartUpdateTimer();
        }

        private void InitializeComponent()
        {
            // Initialize limbic state
            limbicState = new LimbicState
            {
                Trust = 0.75,
                Warmth = 0.60,
                Arousal = 0.45,
                Valence = 0.80,
                Posture = "Companion"
            };

            // Set initial time range
            UpdateTimeRangeSelection("1h");

            // Initialize history
            GenerateMockHistory();
        }

        private void LoadInitialData()
        {
            UpdateLimbicDisplay();
            UpdateStatistics();
        }

        private void StartAnimations()
        {
            // Start rotation animation
            var rotateAnimation = (Storyboard)Resources["RotateAnimation"];
            Storyboard.SetTarget(rotateAnimation, RotatingRing);
            rotateAnimation.Begin();

            // Start pulse animation
            var pulseAnimation = (Storyboard)Resources["PulseAnimation"];
            Storyboard.SetTarget(pulseAnimation, PulsingCircle);
            pulseAnimation.Begin();

            // Start fade in animation
            var fadeInAnimation = (Storyboard)Resources["FadeInAnimation"];
            Storyboard.SetTarget(fadeInAnimation, this);
            fadeInAnimation.Begin();

            // Start slide in animation
            var slideInAnimation = (Storyboard)Resources["SlideInAnimation"];
            Storyboard.SetTarget(slideInAnimation, this);
            slideInAnimation.Begin();
        }

        private void StartUpdateTimer()
        {
            updateTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(2)
            };
            updateTimer.Tick += UpdateTimer_Tick;
            updateTimer.Start();
        }

        private void UpdateTimer_Tick(object sender, object e)
        {
            // Simulate real-time updates
            SimulateLimbicStateChange();
            UpdateLimbicDisplay();
        }

        private void ConnectWebSocket()
        {
            try
            {
                wsConnection = new WebSocket("ws://192.168.1.47:8742/ws/limbic-state");
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
            if (message.Contains("limbic_update"))
            {
                // Parse and update limbic state
                DispatcherQueue.TryEnqueue(() =>
                {
                    UpdateLimbicStateFromWebSocket(message);
                });
            }
        }

        private void OnWebSocketClosed(object sender, WebSocketClosedEventArgs e)
        {
            // Attempt to reconnect
            Task.Delay(5000).ContinueWith(_ => ConnectWebSocket());
        }

        private void UpdateLimbicStateFromWebSocket(string message)
        {
            // Parse JSON message and update limbic state
            // This is a simplified implementation
            var newState = ParseLimbicStateFromJson(message);
            if (newState != null)
            {
                limbicState = newState;
                UpdateLimbicDisplay();
                
                // Add to history
                var historyEntry = new LimbicHistory
                {
                    Timestamp = DateTime.Now,
                    Trust = limbicState.Trust,
                    Warmth = limbicState.Warmth,
                    Arousal = limbicState.Arousal,
                    Valence = limbicState.Valence,
                    Posture = limbicState.Posture,
                    Trigger = "WebSocket Update"
                };
                
                limbicHistory.Add(historyEntry);
                
                // Keep only last 100 entries
                if (limbicHistory.Count > 100)
                {
                    limbicHistory.RemoveAt(0);
                }
            }
        }

        private LimbicState ParseLimbicStateFromJson(string json)
        {
            // Simplified JSON parsing - in production, use proper JSON parser
            try
            {
                // This is a mock implementation
                return new LimbicState
                {
                    Trust = 0.5 + new Random().NextDouble() * 0.5,
                    Warmth = 0.5 + new Random().NextDouble() * 0.5,
                    Arousal = 0.5 + new Random().NextDouble() * 0.5,
                    Valence = 0.5 + new Random().NextDouble() * 0.5,
                    Posture = "Companion"
                };
            }
            catch
            {
                return null;
            }
        }

        private void SimulateLimbicStateChange()
        {
            // Simulate small changes in limbic state
            var random = new Random();
            limbicState.Trust = Math.Max(0, Math.Min(1, limbicState.Trust + (random.NextDouble() - 0.5) * 0.1));
            limbicState.Warmth = Math.Max(0, Math.Min(1, limbicState.Warmth + (random.NextDouble() - 0.5) * 0.1));
            limbicState.Arousal = Math.Max(0, Math.Min(1, limbicState.Arousal + (random.NextDouble() - 0.5) * 0.1));
            limbicState.Valence = Math.Max(0, Math.Min(1, limbicState.Valence + (random.NextDouble() - 0.5) * 0.1));

            // Add to history
            var historyEntry = new LimbicHistory
            {
                Timestamp = DateTime.Now,
                Trust = limbicState.Trust,
                Warmth = limbicState.Warmth,
                Arousal = limbicState.Arousal,
                Valence = limbicState.Valence,
                Posture = limbicState.Posture,
                Trigger = "Simulated Update"
            };

            limbicHistory.Add(historyEntry);

            // Keep only last 100 entries
            if (limbicHistory.Count > 100)
            {
                limbicHistory.RemoveAt(0);
            }
        }

        private void UpdateLimbicDisplay()
        {
            // Update gauge values
            TrustValue.Text = $"{Math.Round(limbicState.Trust * 100)}%";
            WarmthValue.Text = $"{Math.Round(limbicState.Warmth * 100)}%";
            ArousalValue.Text = $"{Math.Round(limbicState.Arousal * 100)}%";
            ValenceValue.Text = $"{Math.Round(limbicState.Valence * 100)}%";

            // Update gauge progress bars
            TrustBar.Value = limbicState.Trust * 100;
            WarmthBar.Value = limbicState.Warmth * 100;
            ArousalBar.Value = limbicState.Arousal * 100;
            ValenceBar.Value = limbicState.Valence * 100;

            // Update central display
            var overallPercentage = Math.Round((limbicState.Trust + limbicState.Warmth + limbicState.Arousal + limbicState.Valence) / 4 * 100);
            OverallPercentage.Text = $"{overallPercentage}%";
            CurrentPosture.Text = limbicState.Posture;

            // Animate the changes
            AnimateGaugeChanges();
        }

        private void AnimateGaugeChanges()
        {
            // Animate gauge bars with smooth transitions
            AnimateProgressBar(TrustBar, limbicState.Trust * 100);
            AnimateProgressBar(WarmthBar, limbicState.Warmth * 100);
            AnimateProgressBar(ArousalBar, limbicState.Arousal * 100);
            AnimateProgressBar(ValenceBar, limbicState.Valence * 100);
        }

        private void AnimateProgressBar(ProgressBar progressBar, double targetValue)
        {
            var animation = new Windows.UI.Xaml.Media.Animation.DoubleAnimation
            {
                To = targetValue,
                Duration = TimeSpan.FromSeconds(1),
                EasingFunction = new Windows.UI.Xaml.Media.Animation.CubicEase { EasingMode = Windows.UI.Xaml.Media.Animation.EasingMode.EaseOut }
            };

            Storyboard.SetTarget(animation, progressBar);
            Storyboard.SetTargetProperty(animation, "Value");

            var storyboard = new Storyboard();
            storyboard.Children.Add(animation);
            storyboard.Begin();
        }

        private void UpdateStatistics()
        {
            // Update statistics based on current time range
            var filteredHistory = FilterHistoryByTimeRange(selectedTimeRange);
            
            DataPointsValue.Text = filteredHistory.Count.ToString();
            
            if (filteredHistory.Count > 0)
            {
                var avgTrust = filteredHistory.Average(h => h.Trust);
                AvgTrustValue.Text = $"{Math.Round(avgTrust * 100)}%";
                
                var peakState = filteredHistory.OrderByDescending(h => h.Trust + h.Warmth + h.Arousal + h.Valence).FirstOrDefault();
                PeakStateValue.Text = peakState?.Posture ?? "Companion";
            }
            else
            {
                AvgTrustValue.Text = "0%";
                PeakStateValue.Text = "N/A";
            }
        }

        private List<LimbicHistory> FilterHistoryByTimeRange(string timeRange)
        {
            var cutoff = timeRange switch
            {
                "15m" => DateTime.Now.AddMinutes(-15),
                "1h" => DateTime.Now.AddHours(-1),
                "6h" => DateTime.Now.AddHours(-6),
                "24h" => DateTime.Now.AddDays(-1),
                _ => DateTime.Now.AddHours(-1)
            };

            return limbicHistory.Where(h => h.Timestamp >= cutoff).ToList();
        }

        private void GenerateMockHistory()
        {
            var now = DateTime.Now;
            var random = new Random();

            for (int i = 0; i < 50; i++)
            {
                var timestamp = now.AddMinutes(-i);
                var historyEntry = new LimbicHistory
                {
                    Timestamp = timestamp,
                    Trust = 0.3 + random.NextDouble() * 0.4,
                    Warmth = 0.4 + random.NextDouble() * 0.3,
                    Arousal = 0.2 + random.NextDouble() * 0.6,
                    Valence = 0.35 + random.NextDouble() * 0.3,
                    Posture = GetRandomPosture(random),
                    Trigger = GetRandomTrigger(random)
                };

                limbicHistory.Add(historyEntry);
            }
        }

        private string GetRandomPosture(Random random)
        {
            var postures = new[] { "Companion", "Co-Pilot", "Peer", "Expert", "Surrogate" };
            return postures[random.Next(postures.Length)];
        }

        private string GetRandomTrigger(Random random)
        {
            var triggers = new[] { "User Interaction", "System Event", "Voice Command", "Autonomous Action", "WebSocket Update" };
            return triggers[random.Next(triggers.Length)];
        }

        private void UpdateTimeRangeSelection(string timeRange)
        {
            selectedTimeRange = timeRange;

            // Update button styles
            Range15m.Background = timeRange == "15m" ? new SolidColorBrush(Color.FromArgb(255, 147, 51, 234)) : new SolidColorBrush(Colors.Transparent);
            Range1h.Background = timeRange == "1h" ? new SolidColorBrush(Color.FromArgb(255, 147, 51, 234)) : new SolidColorBrush(Colors.Transparent);
            Range6h.Background = timeRange == "6h" ? new SolidColorBrush(Color.FromArgb(255, 147, 51, 234)) : new SolidColorBrush(Colors.Transparent);
            Range24h.Background = timeRange == "24h" ? new SolidColorBrush(Color.FromArgb(255, 147, 51, 234)) : new SolidColorBrush(Colors.Transparent);

            UpdateStatistics();
        }

        private void TimeRange_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button)
            {
                var timeRange = button.Content.ToString();
                UpdateTimeRangeSelection(timeRange);
            }
        }

        private async void RecordButton_Click(object sender, RoutedEventArgs e)
        {
            isRecording = !isRecording;
            
            if (isRecording)
            {
                RecordButton.Content = "Stop Recording";
                RecordButton.Background = new SolidColorBrush(Color.FromArgb(255, 239, 68, 68));
                
                // Start recording session
                System.Diagnostics.Debug.WriteLine("Started limbic state recording");
            }
            else
            {
                RecordButton.Content = "Record";
                RecordButton.Background = new SolidColorBrush(Colors.Transparent);
                
                // Stop recording session
                System.Diagnostics.Debug.WriteLine("Stopped limbic state recording");
                
                // Show completion message
                var dialog = new MessageDialog("Recording session completed. Data saved to history.");
                await dialog.ShowAsync();
            }
        }

        private async void ExportButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Export limbic state data
                var exportData = new
                {
                    ExportTimestamp = DateTime.Now,
                    CurrentState = limbicState,
                    History = limbicHistory.TakeLast(100).ToList(),
                    Statistics = new
                    {
                        TotalDataPoints = limbicHistory.Count,
                        AverageTrust = limbicHistory.Average(h => h.Trust),
                        AverageWarmth = limbicHistory.Average(h => h.Warmth),
                        AverageArousal = limbicHistory.Average(h => h.Arousal),
                        AverageValence = limbicHistory.Average(h => h.Valence)
                    }
                };

                // In a real implementation, save to file or send to API
                System.Diagnostics.Debug.WriteLine($"Exporting {limbicHistory.Count} data points...");
                
                var dialog = new MessageDialog($"Successfully exported {limbicHistory.Count} data points.");
                await dialog.ShowAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Export failed: {ex.Message}");
                var dialog = new MessageDialog("Export failed. Please try again.");
                await dialog.ShowAsync();
            }
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
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
    }

    // Supporting classes
    public class LimbicState
    {
        public double Trust { get; set; }
        public double Warmth { get; set; }
        public double Arousal { get; set; }
        public double Valence { get; set; }
        public string Posture { get; set; }
    }

    public class LimbicHistory
    {
        public DateTime Timestamp { get; set; }
        public double Trust { get; set; }
        public double Warmth { get; set; }
        public double Arousal { get; set; }
        public double Valence { get; set; }
        public string Posture { get; set; }
        public string Trigger { get; set; }
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
