using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using Windows.ApplicationModel;
using Windows.System;
using Windows.System.Diagnostics;

namespace SallieStudioApp.Services
{
    public class PerformanceMonitorService : INotifyPropertyChanged
    {
        #region Singleton
        private static PerformanceMonitorService _instance;
        public static PerformanceMonitorService Instance => _instance ??= new PerformanceMonitorService();
        #endregion

        #region Properties
        private PerformanceMetrics _metrics;
        public PerformanceMetrics Metrics
        {
            get => _metrics;
            set
            {
                if (_metrics != value)
                {
                    _metrics = value;
                    OnPropertyChanged();
                }
            }
        }

        private ObservableCollection<PerformanceAlert> _alerts = new();
        public ObservableCollection<PerformanceAlert> Alerts
        {
            get => _alerts;
            set
            {
                if (_alerts != value)
                {
                    _alerts = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _isMonitoring = false;
        public bool IsMonitoring
        {
            get => _isMonitoring;
            set
            {
                if (_isMonitoring != value)
                {
                    _isMonitoring = value;
                    OnPropertyChanged();
                }
            }
        }

        private int _performanceScore = 100;
        public int PerformanceScore
        {
            get => _performanceScore;
            set
            {
                if (_performanceScore != value)
                {
                    _performanceScore = value;
                    OnPropertyChanged();
                    OnPropertyChanged(nameof(PerformanceGrade));
                }
            }
        }

        public string PerformanceGrade
        {
            get
            {
                if (PerformanceScore >= 90) return "A";
                if (PerformanceScore >= 80) return "B";
                if (PerformanceScore >= 70) return "C";
                if (PerformanceScore >= 60) return "D";
                return "F";
            }
        }
        #endregion

        #region Events
        public event EventHandler<string> AlertRaised;
        public event PropertyChangedEventHandler PropertyChanged;
        #endregion

        #region Private Fields
        private Timer _metricsTimer;
        private Timer _fpsTimer;
        private DispatcherQueue _dispatcherQueue;
        private ProcessDiagnosticInfo _processInfo;
        private SystemDiagnosticInfo _systemInfo;
        private DateTime _lastFrameTime = DateTime.Now;
        private int _frameCount = 0;
        private double _currentFPS = 60;
        private readonly object _lockObject = new object();
        #endregion

        private PerformanceMonitorService()
        {
            _dispatcherQueue = DispatcherQueue.GetForCurrentThread();
            InitializeMetrics();
            InitializeDiagnosticInfo();
        }

        #region Initialization
        private void InitializeMetrics()
        {
            Metrics = new PerformanceMetrics
            {
                RenderTime = 0,
                MemoryUsage = 0,
                NetworkLatency = 0,
                MessageLatency = 0,
                FPS = 60,
                CPUUsage = 0,
            };
        }

        private void InitializeDiagnosticInfo()
        {
            try
            {
                _processInfo = ProcessDiagnosticInfo.GetForCurrentProcess();
                _systemInfo = SystemDiagnosticInfo.GetForCurrentSystem();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error initializing diagnostic info: {ex.Message}");
            }
        }
        #endregion

        #region Public Methods
        public void StartMonitoring()
        {
            if (IsMonitoring) return;

            IsMonitoring = true;

            // Start FPS monitoring
            _fpsTimer = new Timer(UpdateFPS, null, 0, 100);

            // Start metrics monitoring
            _metricsTimer = new Timer(UpdateMetrics, null, 0, 1000);

            Debug.WriteLine("Performance monitoring started");
        }

        public void StopMonitoring()
        {
            if (!IsMonitoring) return;

            IsMonitoring = false;

            _fpsTimer?.Dispose();
            _fpsTimer = null;

            _metricsTimer?.Dispose();
            _metricsTimer = null;

            Debug.WriteLine("Performance monitoring stopped");
        }

        public void MeasureRenderTime(Action renderAction)
        {
            var stopwatch = Stopwatch.StartNew();
            renderAction();
            stopwatch.Stop();

            var renderTime = stopwatch.ElapsedMilliseconds;
            Metrics.RenderTime = renderTime;

            if (renderTime > 100)
            {
                AddAlert(PerformanceAlertType.SlowRender, 
                    $"Slow render time: {renderTime}ms", 
                    GetSeverity(renderTime, 100, 200));
            }
        }

        public async Task<long> MeasureMessageLatencyAsync(Func<Task> messageFunction)
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                await messageFunction();
                stopwatch.Stop();
                var latency = stopwatch.ElapsedMilliseconds;
                Metrics.MessageLatency = latency;

                if (latency > 5000)
                {
                    AddAlert(PerformanceAlertType.NetworkSlow,
                        $"Slow message response: {latency}ms",
                        GetSeverity(latency, 5000, 10000));
                }

                return latency;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                var latency = stopwatch.ElapsedMilliseconds;
                AddAlert(PerformanceAlertType.NetworkSlow,
                    $"Message failed after {latency}ms",
                    AlertSeverity.High);
                throw;
            }
        }

        public void ClearAlerts()
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                Alerts.Clear();
            });
        }

        public void ClearAlertByType(PerformanceAlertType type)
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                var alertsToRemove = Alerts.Where(a => a.Type == type).ToList();
                foreach (var alert in alertsToRemove)
                {
                    Alerts.Remove(alert);
                }
            });
        }

        public List<PerformanceAlert> GetAlertsByType(PerformanceAlertType type)
        {
            lock (_lockObject)
            {
                return Alerts.Where(a => a.Type == type).ToList();
            }
        }
        #endregion

        #region Private Methods
        private void UpdateFPS(object state)
        {
            if (!IsMonitoring) return;

            _frameCount++;
            var now = DateTime.Now;
            var elapsed = (now - _lastFrameTime).TotalSeconds;

            if (elapsed >= 1.0)
            {
                _currentFPS = _frameCount / elapsed;
                _frameCount = 0;
                _lastFrameTime = now;

                _dispatcherQueue.TryEnqueue(() =>
                {
                    Metrics.FPS = _currentFPS;
                });

                if (_currentFPS < 30)
                {
                    AddAlert(PerformanceAlertType.SlowRender,
                        $"Low FPS detected: {_currentFPS:F1}",
                        GetSeverity(_currentFPS, 30, 15));
                }
            }
        }

        private async void UpdateMetrics(object state)
        {
            if (!IsMonitoring) return;

            try
            {
                var newMetrics = new PerformanceMetrics();

                // Memory usage
                if (_processInfo != null)
                {
                    var memoryUsage = _processInfo.MemoryUsage.GetReport();
                    newMetrics.MemoryUsage = memoryUsage.NonPagedPoolSize / 1024.0 / 1024.0; // MB
                }

                // CPU usage
                if (_systemInfo != null)
                {
                    var cpuUsage = _systemInfo.CpuUsage.GetReport();
                    newMetrics.CPUUsage = cpuUsage.KernelTime.TotalMilliseconds / 
                                       Environment.ProcessorCount;
                }

                // Network latency (ping test)
                newMetrics.NetworkLatency = await MeasureNetworkLatencyAsync();

                _dispatcherQueue.TryEnqueue(() =>
                {
                    Metrics = newMetrics;
                    CheckPerformanceThresholds(newMetrics);
                    UpdatePerformanceScore();
                });
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error updating metrics: {ex.Message}");
            }
        }

        private async Task<long> MeasureNetworkLatencyAsync()
        {
            try
            {
                var stopwatch = Stopwatch.StartNew();
                using var httpClient = new System.Net.Http.HttpClient();
                var response = await httpClient.GetAsync("https://httpbin.org/delay/0");
                stopwatch.Stop();
                return stopwatch.ElapsedMilliseconds;
            }
            catch
            {
                return -1; // Error
            }
        }

        private void CheckPerformanceThresholds(PerformanceMetrics metrics)
        {
            // Memory usage check
            if (metrics.MemoryUsage > 200)
            {
                AddAlert(PerformanceAlertType.HighMemory,
                    $"High memory usage: {metrics.MemoryUsage:F2} MB",
                    GetSeverity(metrics.MemoryUsage, 200, 400));
            }

            // CPU usage check
            if (metrics.CPUUsage > 80)
            {
                AddAlert(PerformanceAlertType.HighCPU,
                    $"High CPU usage: {metrics.CPUUsage:F1}%",
                    GetSeverity(metrics.CPUUsage, 80, 95));
            }

            // Network latency check
            if (metrics.NetworkLatency > 0 && metrics.NetworkLatency > 1000)
            {
                AddAlert(PerformanceAlertType.NetworkSlow,
                    $"High network latency: {metrics.NetworkLatency}ms",
                    GetSeverity(metrics.NetworkLatency, 1000, 3000));
            }
        }

        private void UpdatePerformanceScore()
        {
            var weights = new Dictionary<string, double>
            {
                ["FPS"] = 0.3,
                ["MemoryUsage"] = 0.2,
                ["CPUUsage"] = 0.2,
                ["NetworkLatency"] = 0.15,
                ["RenderTime"] = 0.15,
            };

            double score = 100;

            // FPS score (60 = 100, 30 = 50, 0 = 0)
            score -= (60 - Math.Max(0, Metrics.FPS)) * weights["FPS"] * 1.67;

            // Memory score (100MB = 100, 200MB = 50, 400MB = 0)
            score -= Math.Max(0, Metrics.MemoryUsage - 100) * weights["MemoryUsage"] * 0.5;

            // CPU score (0% = 100, 50% = 50, 100% = 0)
            score -= Metrics.CPUUsage * weights["CPUUsage"];

            // Network score (0ms = 100, 1000ms = 50, 3000ms = 0)
            if (Metrics.NetworkLatency > 0)
            {
                score -= Math.Min(Metrics.NetworkLatency, 3000) * weights["NetworkLatency"] * 0.033;
            }

            // Render time score (0ms = 100, 100ms = 50, 200ms = 0)
            score -= Math.Min(Metrics.RenderTime, 200) * weights["RenderTime"] * 0.5;

            PerformanceScore = Math.Max(0, (int)score);
        }

        private void AddAlert(PerformanceAlertType type, string message, AlertSeverity severity)
        {
            var alert = new PerformanceAlert
            {
                Type = type,
                Message = message,
                Timestamp = DateTime.Now,
                Severity = severity,
            };

            _dispatcherQueue.TryEnqueue(() =>
            {
                // Remove duplicate alerts of the same type
                var existingAlerts = Alerts.Where(a => a.Type == type).ToList();
                foreach (var existing in existingAlerts)
                {
                    Alerts.Remove(existing);
                }

                Alerts.Add(alert);

                // Keep only last 10 alerts
                while (Alerts.Count > 10)
                {
                    Alerts.RemoveAt(0);
                }
            });

            AlertRaised?.Invoke(this, message);
        }

        private AlertSeverity GetSeverity(double value, double threshold, double critical)
        {
            if (value >= critical) return AlertSeverity.Critical;
            if (value >= threshold) return AlertSeverity.High;
            if (value >= threshold * 0.7) return AlertSeverity.Medium;
            return AlertSeverity.Low;
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
    public class PerformanceMetrics : INotifyPropertyChanged
    {
        private double _renderTime;
        public double RenderTime
        {
            get => _renderTime;
            set
            {
                if (_renderTime != value)
                {
                    _renderTime = value;
                    OnPropertyChanged();
                }
            }
        }

        private double _memoryUsage;
        public double MemoryUsage
        {
            get => _memoryUsage;
            set
            {
                if (_memoryUsage != value)
                {
                    _memoryUsage = value;
                    OnPropertyChanged();
                }
            }
        }

        private long _networkLatency;
        public long NetworkLatency
        {
            get => _networkLatency;
            set
            {
                if (_networkLatency != value)
                {
                    _networkLatency = value;
                    OnPropertyChanged();
                }
            }
        }

        private long _messageLatency;
        public long MessageLatency
        {
            get => _messageLatency;
            set
            {
                if (_messageLatency != value)
                {
                    _messageLatency = value;
                    OnPropertyChanged();
                }
            }
        }

        private double _fps;
        public double FPS
        {
            get => _fps;
            set
            {
                if (_fps != value)
                {
                    _fps = value;
                    OnPropertyChanged();
                }
            }
        }

        private double _cpuUsage;
        public double CPUUsage
        {
            get => _cpuUsage;
            set
            {
                if (_cpuUsage != value)
                {
                    _cpuUsage = value;
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

    public class PerformanceAlert : INotifyPropertyChanged
    {
        private PerformanceAlertType _type;
        public PerformanceAlertType Type
        {
            get => _type;
            set
            {
                if (_type != value)
                {
                    _type = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _message;
        public string Message
        {
            get => _message;
            set
            {
                if (_message != value)
                {
                    _message = value;
                    OnPropertyChanged();
                }
            }
        }

        private DateTime _timestamp;
        public DateTime Timestamp
        {
            get => _timestamp;
            set
            {
                if (_timestamp != value)
                {
                    _timestamp = value;
                    OnPropertyChanged();
                }
            }
        }

        private AlertSeverity _severity;
        public AlertSeverity Severity
        {
            get => _severity;
            set
            {
                if (_severity != value)
                {
                    _severity = value;
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

    public enum PerformanceAlertType
    {
        HighMemory,
        HighCPU,
        SlowRender,
        NetworkSlow
    }

    public enum AlertSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }
    #endregion
}
