using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Windows.ApplicationModel;
using Windows.Storage;
using Windows.System;
using Windows.System.Diagnostics;
using Windows.System.Power;
using Windows.System.Profile;

namespace SallieStudioApp.Services
{
    public class AnalyticsService : INotifyPropertyChanged
    {
        #region Singleton
        private static AnalyticsService _instance;
        public static AnalyticsService Instance => _instance ??= new AnalyticsService();
        #endregion

        #region Properties
        private bool _isInitialized = false;
        public bool IsInitialized
        {
            get => _isInitialized;
            set
            {
                if (_isInitialized != value)
                {
                    _isInitialized = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _sessionId = string.Empty;
        public string SessionId
        {
            get => _sessionId;
            set
            {
                if (_sessionId != value)
                {
                    _sessionId = value;
                    OnPropertyChanged();
                }
            }
        }

        private ObservableCollection<AnalyticsEvent> _eventQueue = new();
        public ObservableCollection<AnalyticsEvent> EventQueue
        {
            get => _eventQueue;
            set
            {
                if (_eventQueue != value)
                {
                    _eventQueue = value;
                    OnPropertyChanged();
                }
            }
        }

        private UserBehavior _userBehavior;
        public UserBehavior UserBehavior
        {
            get => _userBehavior;
            set
            {
                if (_userBehavior != value)
                {
                    _userBehavior = value;
                    OnPropertyChanged();
                }
            }
        }

        private ObservableCollection<AIInsight> _aiInsights = new();
        public ObservableCollection<AIInsight> AIInsights
        {
            get => _aiInsights;
            set
            {
                if (_aiInsights != value)
                {
                    _aiInsights = value;
                    OnPropertyChanged();
                }
            }
        }

        private PerformanceMetrics _performanceMetrics;
        public PerformanceMetrics PerformanceMetrics
        {
            get => _performanceMetrics;
            set
            {
                if (_performanceMetrics != value)
                {
                    _performanceMetrics = value;
                    OnPropertyChanged();
                }
            }
        }

        private AnalyticsConfig _config = new();
        public AnalyticsConfig Config
        {
            get => _config;
            set
            {
                if (_config != value)
                {
                    _config = value;
                    OnPropertyChanged();
                    SaveConfiguration();
                }
            }
        }
        #endregion

        #region Events
        public event EventHandler<AnalyticsEvent> EventTracked;
        public event EventHandler<AIInsight> AIInsightGenerated;
        public event EventHandler<string> AnalyticsError;
        public event PropertyChangedEventHandler PropertyChanged;
        #endregion

        #region Private Fields
        private DispatcherQueue _dispatcherQueue;
        private Timer _flushTimer;
        private Timer _performanceTimer;
        private HttpClient _httpClient;
        private ProcessDiagnosticInfo _processInfo;
        private SystemDiagnosticInfo _systemInfo;
        private readonly object _lockObject = new object();
        #endregion

        private AnalyticsService()
        {
            _dispatcherQueue = DispatcherQueue.GetForCurrentThread();
            _httpClient = new HttpClient();
            InitializeDiagnosticInfo();
            LoadConfiguration();
        }

        #region Initialization
        private void InitializeDiagnosticInfo()
        {
            try
            {
                _processInfo = ProcessDiagnosticInfo.GetForCurrentProcess();
                _systemInfo = SystemDiagnosticInfo.GetForCurrentSystem();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error initializing diagnostic info: {ex.Message}");
            }
        }

        private async void LoadConfiguration()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                if (settings.Values.TryGetValue("AnalyticsConfig", out var configValue) && 
                    configValue is string configJson)
                {
                    Config = JsonSerializer.Deserialize<AnalyticsConfig>(configJson);
                }
                else
                {
                    Config = new AnalyticsConfig();
                    await SaveConfiguration();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading analytics config: {ex.Message}");
                Config = new AnalyticsConfig();
            }
        }

        private async Task SaveConfiguration()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                var configJson = JsonSerializer.Serialize(Config);
                settings.Values["AnalyticsConfig"] = configJson;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving analytics config: {ex.Message}");
            }
        }

        public async Task InitializeAsync()
        {
            try
            {
                if (!Config.EnableTracking) return;

                // Generate or retrieve session ID
                var sessionId = await GetSessionIdAsync();
                SessionId = sessionId;

                // Initialize user behavior tracking
                UserBehavior = new UserBehavior
                {
                    UserId = await GetUserIdAsync(),
                    SessionId = sessionId,
                    Events = new List<AnalyticsEvent>(),
                    StartTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    PageViews = 0,
                    TimeOnPage = 0,
                    BounceRate = 0,
                    ConversionRate = 0,
                    Interactions = 0,
                    Errors = 0,
                    PerformanceMetrics = await GetInitialPerformanceMetrics(),
                };

                // Start performance monitoring
                if (Config.TrackPerformance)
                {
                    StartPerformanceMonitoring();
                }

                // Start flush timer
                StartFlushTimer();

                // Track initial page view
                TrackPageView("MainWindow", "Main Window");

                IsInitialized = true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Analytics initialization error: {ex.Message}");
                AnalyticsError?.Invoke(this, ex.Message);
            }
        }

        private async Task<string> GetSessionIdAsync()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                var sessionId = settings.Values["analytics_session_id"] as string;
                
                if (string.IsNullOrEmpty(sessionId))
                {
                    sessionId = GenerateSessionId();
                    settings.Values["analytics_session_id"] = sessionId;
                }
                
                return sessionId;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting session ID: {ex.Message}");
                return GenerateSessionId();
            }
        }

        private string GenerateSessionId()
        {
            return $"session_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid():N}";
        }

        private async Task<string> GetUserIdAsync()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                var userId = settings.Values["user_id"] as string;
                return userId ?? "anonymous";
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting user ID: {ex.Message}");
                return "anonymous";
            }
        }

        private async Task<PerformanceMetrics> GetInitialPerformanceMetrics()
        {
            try
            {
                var memoryUsage = await GetMemoryUsageAsync();
                var startTime = Process.GetCurrentProcess().StartTime.ToUnixTimeMilliseconds();

                return new PerformanceMetrics
                {
                    AppStartTime = startTime,
                    PageLoadTime = 0,
                    FirstContentfulPaint = 0,
                    LargestContentfulPaint = 0,
                    CumulativeLayoutShift = 0,
                    FirstInputDelay = 0,
                    MemoryUsage = memoryUsage,
                    NetworkLatency = 0,
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting initial performance metrics: {ex.Message}");
                return new PerformanceMetrics();
            }
        }

        private void StartPerformanceMonitoring()
        {
            _performanceTimer = new Timer(async _ =>
            {
                try
                {
                    var memoryUsage = await GetMemoryUsageAsync();
                    var networkLatency = await MeasureNetworkLatencyAsync();

                    _dispatcherQueue.TryEnqueue(() =>
                    {
                        PerformanceMetrics.MemoryUsage = memoryUsage;
                        PerformanceMetrics.NetworkLatency = networkLatency;
                    });
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error in performance monitoring: {ex.Message}");
                }
            }, null, TimeSpan.Zero, TimeSpan.FromSeconds(10));
        }

        private void StartFlushTimer()
        {
            _flushTimer = new Timer(async _ =>
            {
                if (EventQueue.Count > 0)
                {
                    await FlushEventsAsync();
                }
            }, null, TimeSpan.FromMilliseconds(Config.FlushInterval), TimeSpan.FromMilliseconds(Config.FlushInterval));
        }
        #endregion

        #region Event Tracking
        public void TrackEvent(
            AnalyticsEventType type,
            string category,
            string action,
            string label = null,
            double? value = null,
            Dictionary<string, object> properties = null)
        {
            if (!Config.EnableTracking || !IsInitialized) return;

            // Apply sampling
            if (new Random().NextDouble() > Config.SamplingRate) return;

            var analyticsEvent = CreateEvent(type, category, action, label, value, properties);
            
            _dispatcherQueue.TryEnqueue(() =>
            {
                EventQueue.Add(analyticsEvent);
                EventTracked?.Invoke(this, analyticsEvent);

                // Update user behavior
                UpdateUserBehavior(analyticsEvent);

                // Track AI interactions for insights
                if (Config.EnableAI && type == AnalyticsEventType.AIInteraction)
                {
                    _ = GenerateAIInsightAsync(analyticsEvent);
                }

                // Auto-flush if batch size reached
                if (EventQueue.Count >= Config.BatchSize)
                {
                    _ = FlushEventsAsync();
                }
            });
        }

        public void TrackPageView(string pageName, string pageTitle = null)
        {
            TrackEvent(AnalyticsEventType.PageView, "navigation", "page_view", pageTitle, null, 
                new Dictionary<string, object> { ["page_name"] = pageName });
        }

        public void TrackClick(string element, Dictionary<string, object> properties = null)
        {
            TrackEvent(AnalyticsEventType.Click, "engagement", "click", element, null, properties);
        }

        public void TrackFormSubmit(string formName, bool success)
        {
            TrackEvent(AnalyticsEventType.FormSubmit, "conversion", "form_submit", formName, 
                success ? 1 : 0, new Dictionary<string, object> { ["success"] = success });
        }

        public void TrackSearch(string query, int resultsCount)
        {
            TrackEvent(AnalyticsEventType.Search, "engagement", "search", query, resultsCount,
                new Dictionary<string, object> { ["query"] = query, ["results_count"] = resultsCount });
        }

        public void TrackError(Exception error, string context = null)
        {
            TrackEvent(AnalyticsEventType.Error, "system", "error", error.GetType().Name, null,
                new Dictionary<string, object> 
                { 
                    ["message"] = error.Message,
                    ["stack_trace"] = error.StackTrace,
                    ["context"] = context
                });
        }

        public void TrackPerformance(string metric, double value)
        {
            TrackEvent(AnalyticsEventType.Performance, "performance", metric, null, value,
                new Dictionary<string, object> { ["metric"] = metric });
        }

        public void TrackAIInteraction(
            string action,
            string model,
            string input,
            string output,
            double confidence,
            double responseTime)
        {
            TrackEvent(AnalyticsEventType.AIInteraction, "ai", action, model, confidence,
                new Dictionary<string, object>
                {
                    ["input"] = input.Substring(0, Math.Min(100, input.Length)),
                    ["output"] = output.Substring(0, Math.Min(100, output.Length)),
                    ["response_time"] = responseTime
                });
        }
        #endregion

        #region Private Methods
        private AnalyticsEvent CreateEvent(
            AnalyticsEventType type,
            string category,
            string action,
            string label,
            double? value,
            Dictionary<string, object> properties)
        {
            return new AnalyticsEvent
            {
                Id = GenerateEventId(),
                Type = type,
                Category = category,
                Action = action,
                Label = label,
                Value = value,
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                UserId = UserBehavior?.UserId,
                SessionId = SessionId,
                Properties = properties ?? new Dictionary<string, object>(),
                Metadata = GetEventMetadata(),
            };
        }

        private string GenerateEventId()
        {
            return $"event_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid():N}";
        }

        private EventMetadata GetEventMetadata()
        {
            return new EventMetadata
            {
                Platform = "Windows",
                AppVersion = GetAppVersion(),
                DeviceModel = GetDeviceModel(),
                OSVersion = Environment.OSVersion.ToString(),
                ScreenResolution = GetScreenResolution(),
                Language = System.Globalization.CultureInfo.CurrentCulture.Name,
                Timezone = TimeZoneInfo.Local.DisplayName,
            };
        }

        private string GetAppVersion()
        {
            try
            {
                var package = Package.Current;
                var packageId = package.Id;
                var version = packageId.Version;
                return $"{version.Major}.{version.Minor}.{version.Build}.{version.Revision}";
            }
            catch
            {
                return "Unknown";
            }
        }

        private string GetDeviceModel()
        {
            try
            {
                return SystemIdentification.SystemHardwareManufacturer;
            }
            catch
            {
                return "Unknown";
            }
        }

        private string GetScreenResolution()
        {
            try
            {
                var window = Window.Current;
                if (window?.Content is FrameworkElement element)
                {
                    return $"{element.ActualWidth}x{element.ActualHeight}";
                }
            }
            catch
            {
                // Fallback
            }
            return $"{Window.Current.Bounds.Width}x{Window.Current.Bounds.Height}";
        }

        private void UpdateUserBehavior(AnalyticsEvent analyticsEvent)
        {
            if (UserBehavior == null) return;

            UserBehavior.Events.Add(analyticsEvent);

            switch (analyticsEvent.Type)
            {
                case AnalyticsEventType.PageView:
                    UserBehavior.PageViews++;
                    break;
                case AnalyticsEventType.Error:
                    UserBehavior.Errors++;
                    break;
            }

            UserBehavior.Interactions++;
        }

        private async Task<double> GetMemoryUsageAsync()
        {
            try
            {
                if (_processInfo != null)
                {
                    var memoryReport = _processInfo.MemoryUsage.GetReport();
                    return memoryReport.WorkingSetSet / 1024.0 / 1024.0; // MB
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting memory usage: {ex.Message}");
            }
            return 0;
        }

        private async Task<double> MeasureNetworkLatencyAsync()
        {
            try
            {
                var stopwatch = Stopwatch.StartNew();
                var response = await _httpClient.GetAsync("https://httpbin.org/delay/0");
                stopwatch.Stop();
                return stopwatch.ElapsedMilliseconds;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error measuring network latency: {ex.Message}");
                return 0;
            }
        }

        private async Task GenerateAIInsightAsync(AnalyticsEvent analyticsEvent)
        {
            try
            {
                var response = await _httpClient.PostAsync(
                    $"{Config.ApiEndpoint}/ai-insights",
                    new StringContent(
                        JsonSerializer.Serialize(new
                        {
                            Event = analyticsEvent,
                            UserBehavior = UserBehavior,
                            PerformanceMetrics = PerformanceMetrics,
                        }),
                        Encoding.UTF8,
                        "application/json"
                    )
                );

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var insights = JsonSerializer.Deserialize<List<AIInsight>>(content);

                    if (insights != null)
                    {
                        _dispatcherQueue.TryEnqueue(() =>
                        {
                            foreach (var insight in insights)
                            {
                                AIInsights.Add(insight);
                                AIInsightGenerated?.Invoke(this, insight);
                            }
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error generating AI insights: {ex.Message}");
            }
        }

        public async Task FlushEventsAsync()
        {
            if (EventQueue.Count == 0) return;

            var eventsToSend = new List<AnalyticsEvent>(EventQueue);
            
            _dispatcherQueue.TryEnqueue(() =>
            {
                EventQueue.Clear();
            });

            try
            {
                var response = await _httpClient.PostAsync(
                    $"{Config.ApiEndpoint}/events",
                    new StringContent(
                        JsonSerializer.Serialize(new
                        {
                            Events = eventsToSend,
                            SessionId,
                            UserBehavior,
                            PerformanceMetrics,
                        }),
                        Encoding.UTF8,
                        "application/json"
                    )
                );

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"HTTP {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error flushing analytics events: {ex.Message}");
                AnalyticsError?.Invoke(this, ex.Message);
                
                // Re-add failed events to queue
                _dispatcherQueue.TryEnqueue(() =>
                {
                    foreach (var evt in eventsToSend)
                    {
                        EventQueue.Add(evt);
                    }
                });
            }
        }
        #endregion

        #region Analytics Methods
        public AnalyticsSummary GetAnalyticsSummary()
        {
            if (UserBehavior == null) return null;

            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var sessionDuration = now - UserBehavior.StartTime;
            var avgTimeOnPage = UserBehavior.PageViews > 0 ? sessionDuration / UserBehavior.PageViews : 0;
            var errorRate = UserBehavior.Interactions > 0 ? (double)UserBehavior.Errors / UserBehavior.Interactions * 100 : 0;

            return new AnalyticsSummary
            {
                SessionId = UserBehavior.SessionId,
                Duration = sessionDuration,
                PageViews = UserBehavior.PageViews,
                Interactions = UserBehavior.Interactions,
                Errors = UserBehavior.Errors,
                ErrorRate = errorRate,
                AvgTimeOnPage = avgTimeOnPage,
                PerformanceMetrics = PerformanceMetrics,
                AIInsightsCount = AIInsights.Count,
            };
        }

        public List<AIInsight> GetAIRecommendations(string category = null)
        {
            return AIInsights.Where(insight => 
                insight.Actionable && 
                insight.Type == AIInsightType.Recommendation &&
                (string.IsNullOrEmpty(category) || insight.Category == category))
                .ToList();
        }

        public PerformanceReport GetPerformanceReport()
        {
            if (PerformanceMetrics == null) return null;

            var scores = new Dictionary<string, double>
            {
                ["fcp"] = GetPerformanceScore(PerformanceMetrics.FirstContentfulPaint, 1800, 3000),
                ["lcp"] = GetPerformanceScore(PerformanceMetrics.LargestContentfulPaint, 2500, 4000),
                ["cls"] = GetPerformanceScore(PerformanceMetrics.CumulativeLayoutShift, 0.1, 0.25),
                ["fid"] = GetPerformanceScore(PerformanceMetrics.FirstInputDelay, 100, 300),
                ["memory"] = GetPerformanceScore(PerformanceMetrics.MemoryUsage, 100, 200),
                ["network"] = GetPerformanceScore(PerformanceMetrics.NetworkLatency, 500, 1500),
            };

            var overallScore = scores.Values.Average();

            return new PerformanceReport
            {
                Metrics = PerformanceMetrics,
                Scores = scores,
                OverallScore = overallScore,
                Grade = GetPerformanceGrade(overallScore),
            };
        }

        private double GetPerformanceScore(double value, double good, double poor)
        {
            if (value <= good) return 100;
            if (value >= poor) return 0;
            return ((poor - value) / (poor - good)) * 100;
        }

        private string GetPerformanceGrade(double score)
        {
            if (score >= 90) return "A";
            if (score >= 80) return "B";
            if (score >= 70) return "C";
            if (score >= 60) return "D";
            return "F";
        }
        #endregion

        #region Cleanup
        public async Task ShutdownAsync()
        {
            try
            {
                if (EventQueue.Count > 0)
                {
                    await FlushEventsAsync();
                }

                _flushTimer?.Dispose();
                _performanceTimer?.Dispose();
                _httpClient?.Dispose();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error during analytics shutdown: {ex.Message}");
            }
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
    public class AnalyticsEvent
    {
        public string Id { get; set; }
        public AnalyticsEventType Type { get; set; }
        public string Category { get; set; }
        public string Action { get; set; }
        public string Label { get; set; }
        public double? Value { get; set; }
        public long Timestamp { get; set; }
        public string UserId { get; set; }
        public string SessionId { get; set; }
        public Dictionary<string, object> Properties { get; set; }
        public EventMetadata Metadata { get; set; }
    }

    public class UserBehavior
    {
        public string UserId { get; set; }
        public string SessionId { get; set; }
        public List<AnalyticsEvent> Events { get; set; }
        public long StartTime { get; set; }
        public long EndTime { get; set; }
        public int PageViews { get; set; }
        public long TimeOnPage { get; set; }
        public double BounceRate { get; set; }
        public double ConversionRate { get; set; }
        public int Interactions { get; set; }
        public int Errors { get; set; }
        public PerformanceMetrics PerformanceMetrics { get; set; }
    }

    public class PerformanceMetrics
    {
        public long AppStartTime { get; set; }
        public double PageLoadTime { get; set; }
        public double FirstContentfulPaint { get; set; }
        public double LargestContentfulPaint { get; set; }
        public double CumulativeLayoutShift { get; set; }
        public double FirstInputDelay { get; set; }
        public double MemoryUsage { get; set; }
        public double NetworkLatency { get; set; }
    }

    public class AIInsight
    {
        public string Id { get; set; }
        public AIInsightType Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public double Confidence { get; set; }
        public object Data { get; set; }
        public long Timestamp { get; set; }
        public bool Actionable { get; set; }
        public string Category { get; set; }
    }

    public class EventMetadata
    {
        public string Platform { get; set; }
        public string AppVersion { get; set; }
        public string DeviceModel { get; set; }
        public string OSVersion { get; set; }
        public string ScreenResolution { get; set; }
        public string Language { get; set; }
        public string Timezone { get; set; }
    }

    public class AnalyticsConfig
    {
        public bool EnableTracking { get; set; } = true;
        public bool EnableAI { get; set; } = true;
        public double SamplingRate { get; set; } = 1.0;
        public int BatchSize { get; set; } = 10;
        public int FlushInterval { get; set; } = 5000;
        public string ApiEndpoint { get; set; } = "http://192.168.1.47:8742/api/analytics";
        public string ApiKey { get; set; } = "analytics_key";
        public bool TrackPerformance { get; set; } = true;
        public bool TrackErrors { get; set; } = true;
        public bool TrackUserBehavior { get; set; } = true;
    }

    public class AnalyticsSummary
    {
        public string SessionId { get; set; }
        public long Duration { get; set; }
        public int PageViews { get; set; }
        public int Interactions { get; set; }
        public int Errors { get; set; }
        public double ErrorRate { get; set; }
        public long AvgTimeOnPage { get; set; }
        public PerformanceMetrics PerformanceMetrics { get; set; }
        public int AIInsightsCount { get; set; }
    }

    public class PerformanceReport
    {
        public PerformanceMetrics Metrics { get; set; }
        public Dictionary<string, double> Scores { get; set; }
        public double OverallScore { get; set; }
        public string Grade { get; set; }
    }

    public enum AnalyticsEventType
    {
        PageView,
        Click,
        Scroll,
        FormSubmit,
        Search,
        Error,
        Performance,
        AIInteraction
    }

    public enum AIInsightType
    {
        Recommendation,
        Prediction,
        Anomaly,
        Trend,
        Sentiment
    }
    #endregion
}
