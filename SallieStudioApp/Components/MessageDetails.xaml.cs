using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using Windows.ApplicationModel.DataTransfer;
using Windows.Storage.Streams;
using Windows.System;

namespace SallieStudioApp.Components
{
    public sealed partial class MessageDetails : UserControl, INotifyPropertyChanged
    {
        private MessageDetail _message;
        private ObservableCollection<MessageDetail> _relatedMessages = new ObservableCollection<MessageDetail>();
        private string _selectedTab = "details";
        private bool _showRelatedMessages = false;

        public event EventHandler<MessageActionEventArgs> MessageAction;

        public MessageDetails()
        {
            this.InitializeComponent();
            DataContext = this;
        }

        public MessageDetail Message
        {
            get => _message;
            set
            {
                _message = value;
                OnPropertyChanged();
            }
        }

        public ObservableCollection<MessageDetail> RelatedMessages
        {
            get => _relatedMessages;
            set
            {
                _relatedMessages = value;
                OnPropertyChanged();
            }
        }

        public string SelectedTab
        {
            get => _selectedTab;
            set
            {
                if (_selectedTab != value)
                {
                    _selectedTab = value;
                    OnPropertyChanged();
                    UpdateTabVisibility();
                }
            }
        }

        public bool ShowRelatedMessages
        {
            get => _showRelatedMessages;
            set
            {
                _showRelatedMessages = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(RelatedMessagesToggleText));
            }
        }

        public string RelatedMessagesToggleText => ShowRelatedMessages ? $"Hide ({RelatedMessages.Count})" : $"Show ({RelatedMessages.Count})";

        private void UpdateTabVisibility()
        {
            DetailsPanel.Visibility = SelectedTab == "details" ? Visibility.Visible : Visibility.Collapsed;
            RelatedPanel.Visibility = SelectedTab == "related" ? Visibility.Visible : Visibility.Collapsed;
            ActionsPanel.Visibility = SelectedTab == "actions" ? Visibility.Visible : Visibility.Collapsed;
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            MessageAction?.Invoke(this, new MessageActionEventArgs { Action = "close", MessageId = Message?.Id });
        }

        private void MoreButton_Click(object sender, RoutedEventArgs e)
        {
            var menuFlyout = new MenuFlyout();
            menuFlyout.Items.Add(new MenuFlyoutItem { Text = "Export", Tag = "export" });
            menuFlyout.Items.Add(new MenuFlyoutItem { Text = "Report", Tag = "report" });
            menuFlyout.Items.Add(new MenuFlyoutSeparator());
            menuFlyout.Items.Add(new MenuFlyoutItem { Text = "Copy Link", Tag = "copylink" });

            menuFlyout.Items[0].Click += (s, args) => MessageAction?.Invoke(this, new MessageActionEventArgs { Action = "export", MessageId = Message?.Id });
            menuFlyout.Items[1].Click += (s, args) => MessageAction?.Invoke(this, new MessageActionEventArgs { Action = "report", MessageId = Message?.Id });
            menuFlyout.Items[3].Click += (s, args) => MessageAction?.Invoke(this, new MessageActionEventArgs { Action = "copylink", MessageId = Message?.Id });

            menuFlyout.ShowAt(MoreButton, new Microsoft.UI.Xaml.Controls.Primitives.FlyoutShowOptions { 
                Position = new Windows.Foundation.Point(0, MoreButton.ActualHeight) 
            });
        }

        private void DetailsTab_Click(object sender, RoutedEventArgs e)
        {
            SelectedTab = "details";
        }

        private void RelatedTab_Click(object sender, RoutedEventArgs e)
        {
            SelectedTab = "related";
        }

        private void ActionsTab_Click(object sender, RoutedEventArgs e)
        {
            SelectedTab = "actions";
        }

        private void ToggleRelatedButton_Click(object sender, RoutedEventArgs e)
        {
            ShowRelatedMessages = !ShowRelatedMessages;
        }

        private void ShareButton_Click(object sender, RoutedEventArgs e)
        {
            var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.GetForCurrentView();
            dataTransferManager.DataRequested += async (dtm, args) =>
            {
                var request = args.Request;
                request.Data.SetText(Message?.Text);
                request.Data.Properties.Title = "Sallie Studio Message";
                request.Data.Properties.Description = "Shared message from Sallie Studio";
            };

            Windows.ApplicationModel.DataTransfer.DataTransferManager.ShowShareUI();
        }

        private void CopyButton_Click(object sender, RoutedEventArgs e)
        {
            var dataPackage = new DataPackage();
            dataPackage.SetText(Message?.Text);
            Clipboard.SetContent(dataPackage);
        }

        private void BookmarkButton_Click(object sender, RoutedEventArgs e)
        {
            MessageAction?.Invoke(this, new MessageActionEventArgs { Action = "bookmark", MessageId = Message?.Id });
        }

        private void DeleteButton_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new ContentDialog
            {
                Title = "Delete Message",
                Content = "Are you sure you want to delete this message? This action cannot be undone.",
                PrimaryButtonText = "Delete",
                CloseButtonText = "Cancel",
                XamlRoot = this.XamlRoot
            };

            dialog.PrimaryButtonClick += (s, args) =>
            {
                MessageAction?.Invoke(this, new MessageActionEventArgs { Action = "delete", MessageId = Message?.Id });
            };

            _ = dialog.ShowAsync();
        }

        private void ExportButton_Click(object sender, RoutedEventArgs e)
        {
            MessageAction?.Invoke(this, new MessageActionEventArgs { Action = "export", MessageId = Message?.Id });
        }

        private void ReportButton_Click(object sender, RoutedEventArgs e)
        {
            MessageAction?.Invoke(this, new MessageActionEventArgs { Action = "report", MessageId = Message?.Id });
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class MessageDetail : INotifyPropertyChanged
    {
        private string _id;
        private string _text;
        private string _senderName;
        private string _formattedTimestamp;
        private string _category;
        private string _priority;
        private string _sentiment;
        private string _emotion;
        private string _context;
        private List<string> _tags = new List<string>();
        private List<string> _keywords = new List<string>();
        private List<MessageAttachment> _attachments = new List<MessageAttachment>();

        public string Id
        {
            get => _id;
            set { _id = value; OnPropertyChanged(); }
        }

        public string Text
        {
            get => _text;
            set { _text = value; OnPropertyChanged(); }
        }

        public string SenderName
        {
            get => _senderName;
            set { _senderName = value; OnPropertyChanged(); }
        }

        public string FormattedTimestamp
        {
            get => _formattedTimestamp;
            set { _formattedTimestamp = value; OnPropertyChanged(); }
        }

        public string Category
        {
            get => _category;
            set { _category = value; OnPropertyChanged(); OnPropertyChanged(nameof(CategoryColor)); }
        }

        public Windows.UI.Color CategoryColor => Category switch
        {
            "general" => Windows.UI.Color.FromArgb(255, 16, 185, 129),
            "important" => Windows.UI.Color.FromArgb(255, 239, 68, 68),
            "reference" => Windows.UI.Color.FromArgb(255, 59, 130, 246),
            "ideas" => Windows.UI.Color.FromArgb(255, 139, 92, 246),
            "tasks" => Windows.UI.Color.FromArgb(255, 245, 158, 11),
            "personal" => Windows.UI.Color.FromArgb(255, 236, 72, 153),
            _ => Windows.UI.Color.FromArgb(255, 107, 114, 128)
        }

        public string Priority
        {
            get => _priority;
            set { _priority = value; OnPropertyChanged(); OnPropertyChanged(nameof(PriorityColor)); OnPropertyChanged(nameof(HasPriority)); }
        }

        public Windows.UI.Color PriorityColor => Priority switch
        {
            "high" => Windows.UI.Color.FromArgb(255, 239, 68, 68),
            "medium" => Windows.UI.Color.FromArgb(255, 245, 158, 11),
            "low" => Windows.UI.Color.FromArgb(255, 16, 185, 129),
            _ => Windows.UI.Color.FromArgb(255, 107, 114, 128)
        }

        public bool HasPriority => !string.IsNullOrEmpty(Priority);

        public string Sentiment
        {
            get => _sentiment;
            set { _sentiment = value; OnPropertyChanged(); OnPropertyChanged(nameof(SentimentColor)); }
        }

        public Windows.UI.Color SentimentColor => Sentiment switch
        {
            "positive" => Windows.UI.Color.FromArgb(255, 16, 185, 129),
            "negative" => Windows.UI.Color.FromArgb(255, 239, 68, 68),
            "neutral" => Windows.UI.Color.FromArgb(255, 107, 114, 128),
            _ => Windows.UI.Color.FromArgb(255, 107, 114, 128)
        }

        public string Emotion
        {
            get => _emotion;
            set { _emotion = value; OnPropertyChanged(); }
        }

        public string Context
        {
            get => _context;
            set { _context = value; OnPropertyChanged(); }
        }

        public List<string> Tags
        {
            get => _tags;
            set { _tags = value; OnPropertyChanged(); }
        }

        public List<string> Keywords
        {
            get => _keywords;
            set { _keywords = value; OnPropertyChanged(); }
        }

        public List<MessageAttachment> Attachments
        {
            get => _attachments;
            set { _attachments = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasAttachments)); }
        }

        public bool HasAttachments => Attachments != null && Attachments.Count > 0;

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class MessageAttachment : INotifyPropertyChanged
    {
        private string _type;
        private string _url;
        private string _name;
        private long _size;

        public string Type
        {
            get => _type;
            set { _type = value; OnPropertyChanged(); OnPropertyChanged(nameof(TypeIcon)); OnPropertyChanged(nameof(FormattedSize)); }
        }

        public string TypeIcon => Type switch
        {
            "image" => "🖼️",
            "file" => "📄",
            "link" => "🔗",
            _ => "📎"
        }

        public string Url
        {
            get => _url;
            set { _url = value; OnPropertyChanged(); }
        }

        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public long Size
        {
            get => _size;
            set { _size = value; OnPropertyChanged(); OnPropertyChanged(nameof(FormattedSize)); }
        }

        public string FormattedSize => Size > 0 ? $"{Size / 1024.0:F1} KB" : "Unknown size";

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class MessageActionEventArgs : EventArgs
    {
        public string Action { get; set; }
        public string MessageId { get; set; }
    }
}
