using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Windows.ApplicationModel.DataTransfer;
using Windows.Data.Xml.Dom;
using Windows.Storage;
using Windows.UI.Notifications;
using Windows.UI.Popups;

namespace SallieStudioApp.Services
{
    public class NotificationService : INotifyPropertyChanged
    {
        #region Singleton
        private static NotificationService _instance;
        public static NotificationService Instance => _instance ??= new NotificationService();
        #endregion

        #region Properties
        private ObservableCollection<NotificationItem> _notifications = new();
        public ObservableCollection<NotificationItem> Notifications
        {
            get => _notifications;
            set
            {
                if (_notifications != value)
                {
                    _notifications = value;
                    OnPropertyChanged();
                }
            }
        }

        private NotificationSettings _settings = new();
        public NotificationSettings Settings
        {
            get => _settings;
            set
            {
                if (_settings != value)
                {
                    _settings = value;
                    OnPropertyChanged();
                    SaveSettings();
                }
            }
        }

        private int _unreadCount = 0;
        public int UnreadCount
        {
            get => _unreadCount;
            set
            {
                if (_unreadCount != value)
                {
                    _unreadCount = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _isPermissionGranted = false;
        public bool IsPermissionGranted
        {
            get => _isPermissionGranted;
            set
            {
                if (_isPermissionGranted != value)
                {
                    _isPermissionGranted = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region Events
        public event EventHandler<NotificationItem> NotificationAdded;
        public event EventHandler<NotificationItem> NotificationRemoved;
        public event EventHandler<string> NotificationClicked;
        public event PropertyChangedEventHandler PropertyChanged;
        #endregion

        #region Private Fields
        private DispatcherQueue _dispatcherQueue;
        private ToastNotifier _toastNotifier;
        private readonly object _lockObject = new object();
        #endregion

        private NotificationService()
        {
            _dispatcherQueue = DispatcherQueue.GetForCurrentThread();
            InitializeToastNotifier();
            LoadSettings();
        }

        #region Initialization
        private void InitializeToastNotifier()
        {
            try
            {
                _toastNotifier = ToastNotificationManager.CreateToastNotifier();
                IsPermissionGranted = _toastNotifier.Setting != NotificationSetting.Disabled;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error initializing toast notifier: {ex.Message}");
                IsPermissionGranted = false;
            }
        }

        private async void LoadSettings()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                if (settings.Values.TryGetValue("NotificationSettings", out var settingsValue) && 
                    settingsValue is string settingsJson)
                {
                    Settings = System.Text.Json.JsonSerializer.Deserialize<NotificationSettings>(settingsJson);
                }
                else
                {
                    Settings = new NotificationSettings();
                    await SaveSettings();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading notification settings: {ex.Message}");
                Settings = new NotificationSettings();
            }
        }

        private async Task SaveSettings()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                var settingsJson = System.Text.Json.JsonSerializer.Serialize(Settings);
                settings.Values["NotificationSettings"] = settingsJson;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving notification settings: {ex.Message}");
            }
        }
        #endregion

        #region Public Methods
        public async Task<string> ShowNotificationAsync(
            string title,
            string message,
            NotificationType type = NotificationType.Info,
            int duration = 5000,
            object data = null)
        {
            var id = Guid.NewGuid().ToString();
            var notification = new NotificationItem
            {
                Id = id,
                Title = title,
                Message = message,
                Type = type,
                Timestamp = DateTime.Now,
                Duration = duration,
                Data = data,
                IsRead = false,
            };

            // Add to local notifications
            _dispatcherQueue.TryEnqueue(() =>
            {
                Notifications.Add(notification);
                UpdateUnreadCount();
                NotificationAdded?.Invoke(this, notification);
            });

            // Show toast notification if enabled
            if (Settings.Enabled && IsPermissionGranted)
            {
                await ShowToastNotificationAsync(notification);
            }

            // Show dialog for critical notifications
            if (type == NotificationType.Error)
            {
                await ShowErrorDialogAsync(title, message);
            }

            // Auto-remove notification after duration
            if (duration > 0)
            {
                Task.Delay(duration).ContinueWith(_ => RemoveNotification(id));
            }

            return id;
        }

        public void RemoveNotification(string id)
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                var notification = Notifications.FirstOrDefault(n => n.Id == id);
                if (notification != null)
                {
                    Notifications.Remove(notification);
                    UpdateUnreadCount();
                    NotificationRemoved?.Invoke(this, notification);
                }
            });
        }

        public void ClearAllNotifications()
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                Notifications.Clear();
                UpdateUnreadCount();
            });
        }

        public void MarkAsRead(string id)
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                var notification = Notifications.FirstOrDefault(n => n.Id == id);
                if (notification != null)
                {
                    notification.IsRead = true;
                    UpdateUnreadCount();
                }
            });
        }

        public void MarkAllAsRead()
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                foreach (var notification in Notifications)
                {
                    notification.IsRead = true;
                }
                UpdateUnreadCount();
            });
        }

        public List<NotificationItem> GetNotificationsByType(NotificationType type)
        {
            lock (_lockObject)
            {
                return Notifications.Where(n => n.Type == type).ToList();
            }
        }

        public async Task<bool> RequestPermissionAsync()
        {
            try
            {
                // For Windows, toast permissions are handled by the system
                // This method can be used to check and request permissions in the future
                IsPermissionGranted = _toastNotifier.Setting != NotificationSetting.Disabled;
                return IsPermissionGranted;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error requesting notification permission: {ex.Message}");
                return false;
            }
        }

        public void UpdateSettings(NotificationSettings newSettings)
        {
            Settings = newSettings;
        }

        public void HandleNotificationClick(string notificationId)
        {
            var notification = Notifications.FirstOrDefault(n => n.Id == notificationId);
            if (notification != null)
            {
                MarkAsRead(notificationId);
                NotificationClicked?.Invoke(this, notificationId);
            }
        }
        #endregion

        #region Private Methods
        private async Task ShowToastNotificationAsync(NotificationItem notification)
        {
            try
            {
                var toastXml = CreateToastXml(notification);
                var toast = new ToastNotification(toastXml);
                
                // Handle toast activation
                toast.Activated += (sender, args) =>
                {
                    HandleNotificationClick(notification.Id);
                };

                _toastNotifier.Show(toast);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error showing toast notification: {ex.Message}");
            }
        }

        private XmlDocument CreateToastXml(NotificationItem notification)
        {
            var toastXml = ToastNotificationManager.GetTemplateContent(ToastTemplateType.ToastText02);
            
            var textElements = toastXml.GetElementsByTagName("text");
            textElements[0].AppendChild(toastXml.CreateTextNode(notification.Title));
            textElements[1].AppendChild(toastXml.CreateTextNode(notification.Message));

            // Add launch attribute to handle click
            var toastElement = toastXml.SelectSingleNode("/toast");
            var launchAttribute = toastXml.CreateAttribute("launch");
            launchAttribute.Value = notification.Id;
            toastElement.Attributes.SetNamedItem(launchAttribute);

            // Add sound if enabled
            if (Settings.Sound)
            {
                var audioElement = toastXml.CreateElement("audio");
                var srcAttribute = toastXml.CreateAttribute("src");
                srcAttribute.Value = "ms-winsoundevent:Notification.Default";
                audioElement.Attributes.SetNamedItem(srcAttribute);
                toastElement.AppendChild(audioElement);
            }

            return toastXml;
        }

        private async Task ShowErrorDialogAsync(string title, string message)
        {
            try
            {
                var dialog = new ContentDialog
                {
                    Title = title,
                    Content = message,
                    CloseButtonText = "OK",
                    XamlRoot = Window.Current.Content.XamlRoot,
                };

                await dialog.ShowAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error showing error dialog: {ex.Message}");
            }
        }

        private void UpdateUnreadCount()
        {
            UnreadCount = Notifications.Count(n => !n.IsRead);
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
    public class NotificationItem : INotifyPropertyChanged
    {
        private string _id;
        public string Id
        {
            get => _id;
            set
            {
                if (_id != value)
                {
                    _id = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _title;
        public string Title
        {
            get => _title;
            set
            {
                if (_title != value)
                {
                    _title = value;
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

        private NotificationType _type;
        public NotificationType Type
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

        private int _duration;
        public int Duration
        {
            get => _duration;
            set
            {
                if (_duration != value)
                {
                    _duration = value;
                    OnPropertyChanged();
                }
            }
        }

        private object _data;
        public object Data
        {
            get => _data;
            set
            {
                if (_data != value)
                {
                    _data = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _isRead;
        public bool IsRead
        {
            get => _isRead;
            set
            {
                if (_isRead != value)
                {
                    _isRead = value;
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

    public class NotificationSettings : INotifyPropertyChanged
    {
        private bool _enabled = true;
        public bool Enabled
        {
            get => _enabled;
            set
            {
                if (_enabled != value)
                {
                    _enabled = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _sound = true;
        public bool Sound
        {
            get => _sound;
            set
            {
                if (_sound != value)
                {
                    _sound = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _vibration = true;
        public bool Vibration
        {
            get => _vibration;
            set
            {
                if (_vibration != value)
                {
                    _vibration = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _badge = true;
        public bool Badge
        {
            get => _badge;
            set
            {
                if (_badge != value)
                {
                    _badge = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _desktopNotifications = true;
        public bool DesktopNotifications
        {
            get => _desktopNotifications;
            set
            {
                if (_desktopNotifications != value)
                {
                    _desktopNotifications = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _quietHoursEnabled = false;
        public bool QuietHoursEnabled
        {
            get => _quietHoursEnabled;
            set
            {
                if (_quietHoursEnabled != value)
                {
                    _quietHoursEnabled = value;
                    OnPropertyChanged();
                }
            }
        }

        private TimeSpan _quietHoursStart = new TimeSpan(22, 0, 0);
        public TimeSpan QuietHoursStart
        {
            get => _quietHoursStart;
            set
            {
                if (_quietHoursStart != value)
                {
                    _quietHoursStart = value;
                    OnPropertyChanged();
                }
            }
        }

        private TimeSpan _quietHoursEnd = new TimeSpan(8, 0, 0);
        public TimeSpan QuietHoursEnd
        {
            get => _quietHoursEnd;
            set
            {
                if (_quietHoursEnd != value)
                {
                    _quietHoursEnd = value;
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

    public enum NotificationType
    {
        Info,
        Success,
        Warning,
        Error
    }
    #endregion
}
