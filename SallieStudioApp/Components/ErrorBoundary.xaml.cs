using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media.Animation;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Windows.ApplicationModel.DataTransfer;
using Windows.Storage;

namespace SallieStudioApp.Components
{
    public sealed partial class ErrorBoundary : UserControl
    {
        #region Properties
        public static readonly DependencyProperty HasErrorProperty =
            DependencyProperty.Register(nameof(HasError), typeof(bool), typeof(ErrorBoundary), new PropertyMetadata(false));

        public bool HasError
        {
            get => (bool)GetValue(HasErrorProperty);
            set => SetValue(HasErrorProperty, value);
        }

        public static readonly DependencyProperty ErrorProperty =
            DependencyProperty.Register(nameof(Error), typeof(Exception), typeof(ErrorBoundary), new PropertyMetadata(null));

        public Exception Error
        {
            get => (Exception)GetValue(ErrorProperty);
            set => SetValue(ErrorProperty, value);
        }

        public static readonly DependencyProperty ErrorInfoProperty =
            DependencyProperty.Register(nameof(ErrorInfo), typeof(string), typeof(ErrorBoundary), new PropertyMetadata(null));

        public string ErrorInfo
        {
            get => (string)GetValue(ErrorInfoProperty);
            set => SetValue(ErrorInfoProperty, value);
        }
        #endregion

        #region Events
        public event EventHandler<Exception> ErrorOccurred;
        public event EventHandler ErrorRecovered;
        public event EventHandler ErrorDismissed;
        #endregion

        #region Private Fields
        private DispatcherQueue _dispatcherQueue;
        private bool _isDebugMode;
        #endregion

        public ErrorBoundary()
        {
            this.InitializeComponent();
            _dispatcherQueue = DispatcherQueue.GetForCurrentThread();
            _isDebugMode = System.Diagnostics.Debugger.IsAttached;
            
            // Show debug section in debug mode
            if (_isDebugMode)
            {
                DebugSection.Visibility = Visibility.Visible;
            }
        }

        #region Public Methods
        public void SetError(Exception error, string errorInfo = null)
        {
            HasError = true;
            Error = error;
            ErrorInfo = errorInfo;

            UpdateErrorDisplay();
            LogError(error, errorInfo);
            ErrorOccurred?.Invoke(this, error);

            // Start animations
            var fadeIn = (Storyboard)Resources["FadeIn"];
            var slideIn = (Storyboard)Resources["SlideIn"];
            fadeIn.Begin();
            slideIn.Begin();
        }

        public void ClearError()
        {
            HasError = false;
            Error = null;
            ErrorInfo = null;
            ErrorRecovered?.Invoke(this, EventArgs.Empty);
        }

        public async Task<bool> TryExecuteAsync(Func<Task> action, string context = null)
        {
            try
            {
                await action();
                return true;
            }
            catch (Exception ex)
            {
                SetError(ex, context);
                return false;
            }
        }

        public bool TryExecute(Action action, string context = null)
        {
            try
            {
                action();
                return true;
            }
            catch (Exception ex)
            {
                SetError(ex, context);
                return false;
            }
        }
        #endregion

        #region Event Handlers
        private void ReloadButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Clear the error first
                ClearError();

                // Reload the current page or restart the app
                var window = Window.Current;
                if (window?.Content is Frame frame)
                {
                    // Navigate to the same page to refresh it
                    var currentType = frame.CurrentSourcePageType;
                    if (currentType != null)
                    {
                        frame.Navigate(currentType, null, new SuppressNavigationTransitionInfo());
                    }
                }
                else
                {
                    // Fallback: restart the app (in a real app, you might use other methods)
                    Application.Current.Exit();
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error during reload: {ex.Message}");
            }
        }

        private void DismissButton_Click(object sender, RoutedEventArgs e)
        {
            ClearError();
            ErrorDismissed?.Invoke(this, EventArgs.Empty);
        }

        private void CopyErrorButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var errorDetails = GetErrorDetails();
                var dataPackage = new DataPackage();
                dataPackage.SetText(errorDetails);
                Clipboard.SetContent(dataPackage);

                // Show confirmation (in a real app, you might use a toast notification)
                Debug.WriteLine("Error details copied to clipboard");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to copy error details: {ex.Message}");
            }
        }

        private void ReportIssueButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // In a real app, you would open a support ticket or email
                var errorDetails = GetErrorDetails();
                var subject = Uri.EscapeDataString("Sallie Studio Error Report");
                var body = Uri.EscapeDataString(errorDetails);
                var mailtoUri = new Uri($"mailto:support@salliestudio.com?subject={subject}&body={body}");

                Windows.System.Launcher.LaunchUriAsync(mailtoUri).AsTask();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to open email client: {ex.Message}");
            }
        }
        #endregion

        #region Private Methods
        private void UpdateErrorDisplay()
        {
            if (Error == null) return;

            _dispatcherQueue.TryEnqueue(() =>
            {
                // Update error message
                ErrorMessageText.Text = Error.Message ?? "An unexpected error occurred";

                // Update error type
                ErrorTypeText.Text = $"Type: {Error.GetType().Name}";

                // Update stack trace
                ErrorStackText.Text = Error.StackTrace ?? "No stack trace available";

                // Update component stack if available
                if (!string.IsNullOrEmpty(ErrorInfo))
                {
                    ComponentStackText.Text = $"Component Stack:\n{ErrorInfo}";
                    ComponentStackText.Visibility = Visibility.Visible;
                }
                else
                {
                    ComponentStackText.Visibility = Visibility.Collapsed;
                }

                // Update debug information
                if (_isDebugMode)
                {
                    var debugInfo = GetDebugInfo();
                    DebugText.Text = debugInfo;
                }
            });
        }

        private void LogError(Exception error, string errorInfo)
        {
            try
            {
                // Log to debug output
                Debug.WriteLine($"ErrorBoundary caught an error: {error}");
                if (!string.IsNullOrEmpty(errorInfo))
                {
                    Debug.WriteLine($"Error Info: {errorInfo}");
                }

                // Log to file (optional)
                LogErrorToFile(error, errorInfo);

                // Log to analytics service (in a real app)
                // AnalyticsService.Instance.TrackError(error, errorInfo);
            }
            catch (Exception logEx)
            {
                Debug.WriteLine($"Failed to log error: {logEx.Message}");
            }
        }

        private async void LogErrorToFile(Exception error, string errorInfo)
        {
            try
            {
                var logEntry = new
                {
                    Timestamp = DateTime.UtcNow,
                    Error = new
                    {
                        Type = error.GetType().Name,
                        Message = error.Message,
                        StackTrace = error.StackTrace,
                    },
                    ErrorInfo = errorInfo,
                    AppVersion = GetAppVersion(),
                    OSVersion = Environment.OSVersion.ToString(),
                    MachineName = Environment.MachineName,
                };

                var logJson = System.Text.Json.JsonSerializer.Serialize(logEntry, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
                
                var localFolder = ApplicationData.Current.LocalFolder;
                var logFile = await localFolder.CreateFileAsync($"error_{DateTime.Now:yyyyMMdd_HHmmss}.json", CreationCollisionOption.OpenIfExists);
                await FileIO.AppendTextAsync(logFile, logJson + "\n\n");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to log error to file: {ex.Message}");
            }
        }

        private string GetErrorDetails()
        {
            var details = new List<string>
            {
                $"Error: {Error?.Message}",
                $"Type: {Error?.GetType().Name}",
                $"Timestamp: {DateTime.Now:yyyy-MM-dd HH:mm:ss}",
                $"App Version: {GetAppVersion()}",
                $"OS Version: {Environment.OSVersion}",
            };

            if (!string.IsNullOrEmpty(Error?.StackTrace))
            {
                details.Add($"\nStack Trace:\n{Error.StackTrace}");
            }

            if (!string.IsNullOrEmpty(ErrorInfo))
            {
                details.Add($"\nComponent Stack:\n{ErrorInfo}");
            }

            return string.Join("\n", details);
        }

        private string GetDebugInfo()
        {
            var info = new List<string>
            {
                $"Debug Mode: {_isDebugMode}",
                $"Assembly: {Assembly.GetExecutingAssembly().GetName().Name}",
                $"Version: {Assembly.GetExecutingAssembly().GetName().Version}",
                $"Framework: {Environment.Version}",
                $"Processor Count: {Environment.ProcessorCount}",
                $"Working Set: {Environment.WorkingSet / 1024 / 1024} MB",
            };

            if (Error != null)
            {
                info.Add($"\nError Type: {Error.GetType().FullName}");
                info.Add($"Error Source: {Error.Source}");
                info.Add($"Error HResult: 0x{Error.HResult:X8}");
                
                if (Error.Data.Count > 0)
                {
                    info.Add("\nError Data:");
                    foreach (DictionaryEntry entry in Error.Data)
                    {
                        info.Add($"  {entry.Key}: {entry.Value}");
                    }
                }
            }

            return string.Join("\n", info);
        }

        private string GetAppVersion()
        {
            try
            {
                var package = Windows.ApplicationModel.Package.Current;
                var packageId = package.Id;
                var version = packageId.Version;
                return $"{version.Major}.{version.Minor}.{version.Build}.{version.Revision}";
            }
            catch
            {
                return "Unknown";
            }
        }
        #endregion
    }
}
