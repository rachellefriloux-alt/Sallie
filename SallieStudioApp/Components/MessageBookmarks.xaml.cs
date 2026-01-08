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
using Windows.UI.Popups;

namespace SallieStudioApp.Components
{
    public sealed partial class MessageBookmarks : UserControl, INotifyPropertyChanged
    {
        private string _searchQuery = string.Empty;
        private ObservableCollection<Bookmark> _bookmarks = new ObservableCollection<Bookmark>();
        private ObservableCollection<BookmarkCategory> _categories = new ObservableCollection<BookmarkCategory>();
        private string _selectedCategory = "all";
        private int _totalBookmarks = 0;
        private int _weeklyBookmarks = 0;
        private int _archivedBookmarks = 0;

        public event EventHandler<BookmarkSelectedEventArgs> BookmarkSelected;

        public MessageBookmarks()
        {
            this.InitializeComponent();
            InitializeBookmarks();
            DataContext = this;
        }

        private void InitializeBookmarks()
        {
            // Initialize categories
            Categories.Add(new BookmarkCategory { Id = "all", Name = "All", IsSelected = true });
            Categories.Add(new BookmarkCategory { Id = "general", Name = "General", IsSelected = false });
            Categories.Add(new BookmarkCategory { Id = "important", Name = "Important", IsSelected = false });
            Categories.Add(new BookmarkCategory { Id = "reference", Name = "Reference", IsSelected = false });
            Categories.Add(new BookmarkCategory { Id = "ideas", Name = "Ideas", IsSelected = false });
            Categories.Add(new BookmarkCategory { Id = "tasks", Name = "Tasks", IsSelected = false });
            Categories.Add(new BookmarkCategory { Id = "personal", Name = "Personal", IsSelected = false });

            // Initialize sample bookmarks
            var sampleBookmarks = new List<Bookmark>
            {
                new Bookmark
                {
                    Id = "1",
                    MessageId = "msg1",
                    SenderName = "You",
                    FormattedTimestamp = "2 hours ago",
                    MessageText = "Remember to check the API documentation for the new endpoints",
                    Note = "Important for the upcoming project",
                    Tags = new List<string> { "api", "documentation", "endpoints" },
                    Category = "tasks",
                    Priority = "high",
                    CreatedAt = DateTime.Now.AddHours(-2),
                    IsArchived = false,
                    HasNote = true,
                    HasTags = true,
                    HasPriority = true,
                    CategoryColor = "#f59e0b",
                    PriorityColor = "#ef4444"
                },
                new Bookmark
                {
                    Id = "2",
                    MessageId = "msg2",
                    SenderName = "Sallie",
                    FormattedTimestamp = "1 day ago",
                    MessageText = "The new design system looks great! I especially like the color palette",
                    Tags = new List<string> { "design", "feedback", "positive" },
                    Category = "ideas",
                    Priority = "medium",
                    CreatedAt = DateTime.Now.AddDays(-1),
                    IsArchived = false,
                    HasNote = false,
                    HasTags = true,
                    HasPriority = true,
                    CategoryColor = "#8b5cf6",
                    PriorityColor = "#f59e0b"
                },
                new Bookmark
                {
                    Id = "3",
                    MessageId = "msg3",
                    SenderName = "You",
                    FormattedTimestamp = "3 days ago",
                    MessageText = "Let's schedule a meeting to discuss the project timeline",
                    Note = "Need to coordinate with the team",
                    Tags = new List<string> { "meeting", "timeline", "coordination" },
                    Category = "general",
                    Priority = "medium",
                    CreatedAt = DateTime.Now.AddDays(-3),
                    IsArchived = false,
                    HasNote = true,
                    HasTags = true,
                    HasPriority = true,
                    CategoryColor = "#10b981",
                    PriorityColor = "#f59e0b"
                }
            };

            foreach (var bookmark in sampleBookmarks)
            {
                Bookmarks.Add(bookmark);
            }

            UpdateStatistics();
        }

        public string SearchQuery
        {
            get => _searchQuery;
            set
            {
                _searchQuery = value;
                OnPropertyChanged();
                FilterBookmarks();
            }
        }

        public ObservableCollection<Bookmark> Bookmarks
        {
            get => _bookmarks;
            set
            {
                _bookmarks = value;
                OnPropertyChanged();
                UpdateStatistics();
            }
        }

        public ObservableCollection<BookmarkCategory> Categories
        {
            get => _categories;
            set
            {
                _categories = value;
                OnPropertyChanged();
            }
        }

        public string SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (_selectedCategory != value)
                {
                    _selectedCategory = value;
                    OnPropertyChanged();
                    FilterBookmarks();
                    UpdateCategorySelection();
                }
            }
        }

        public int TotalBookmarks
        {
            get => _totalBookmarks;
            set
            {
                _totalBookmarks = value;
                OnPropertyChanged();
            }
        }

        public int WeeklyBookmarks
        {
            get => _weeklyBookmarks;
            set
            {
                _weeklyBookmarks = value;
                OnPropertyChanged();
            }
        }

        public int ArchivedBookmarks
        {
            get => _archivedBookmarks;
            set
            {
                _archivedBookmarks = value;
                OnPropertyChanged();
            }
        }

        private void FilterBookmarks()
        {
            var filtered = Bookmarks.Where(b => !b.IsArchived).ToList();

            if (SelectedCategory != "all")
            {
                filtered = filtered.Where(b => b.Category == SelectedCategory).ToList();
            }

            if (!string.IsNullOrEmpty(SearchQuery))
            {
                var searchLower = SearchQuery.ToLower();
                filtered = filtered.Where(b =>
                    b.MessageText.ToLower().Contains(searchLower) ||
                    (b.Note?.ToLower().Contains(searchLower) ?? false) ||
                    b.Tags.Any(tag => tag.ToLower().Contains(searchLower))
                ).ToList();
            }

            // Update the displayed bookmarks
            var currentBookmarks = Bookmarks.ToList();
            Bookmarks.Clear();
            foreach (var bookmark in filtered.OrderByDescending(b => b.CreatedAt))
            {
                Bookmarks.Add(bookmark);
            }

            // Restore archived bookmarks
            foreach (var bookmark in currentBookmarks.Where(b => b.IsArchived))
            {
                Bookmarks.Add(bookmark);
            }

            UpdateResultsCount();
        }

        private void UpdateCategorySelection()
        {
            foreach (var category in Categories)
            {
                category.IsSelected = category.Id == SelectedCategory;
            }
        }

        private void UpdateStatistics()
        {
            TotalBookmarks = Bookmarks.Count(b => !b.IsArchived);
            WeeklyBookmarks = Bookmarks.Count(b => !b.IsArchived && b.CreatedAt >= DateTime.Now.AddDays(-7));
            ArchivedBookmarks = Bookmarks.Count(b => b.IsArchived);
        }

        private void UpdateResultsCount()
        {
            var visibleCount = Bookmarks.Count(b => !b.IsArchived);
            ResultsCountText.Text = $"{visibleCount} bookmark{(visibleCount != 1 ? "s" : "")} found";
            ResultsCountText.Visibility = visibleCount > 0 ? Visibility.Visible : Visibility.Collapsed;

            EmptyStatePanel.Visibility = visibleCount == 0 ? Visibility.Visible : Visibility.Collapsed;
        }

        private void SearchTextBox_KeyUp(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter)
            {
                FilterBookmarks();
            }
        }

        private void CategoryButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string categoryId)
            {
                SelectedCategory = categoryId;
            }
        }

        private void AddBookmarkButton_Click(object sender, RoutedEventArgs e)
        {
            // In a real implementation, this would open a dialog to select a message to bookmark
            // For now, we'll show a message dialog
            var dialog = new MessageDialog("Add Bookmark", "Select a message from the chat to bookmark it.");
            dialog.Commands.Add(new UICommand("OK"));
            _ = dialog.ShowAsync();
        }

        private void ArchiveBookmark_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string bookmarkId)
            {
                var bookmark = Bookmarks.FirstOrDefault(b => b.Id == bookmarkId);
                if (bookmark != null)
                {
                    bookmark.IsArchived = true;
                    UpdateStatistics();
                    FilterBookmarks();
                }
            }
        }

        private void RemoveBookmark_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string bookmarkId)
            {
                var bookmark = Bookmarks.FirstOrDefault(b => b.Id == bookmarkId);
                if (bookmark != null)
                {
                    var dialog = new MessageDialog("Remove Bookmark", "Are you sure you want to remove this bookmark?");
                    dialog.Commands.Add(new UICommand("Cancel"));
                    dialog.Commands.Add(new UICommand("Remove", new UICommandInvokedHandler((cmd) =>
                    {
                        Bookmarks.Remove(bookmark);
                        UpdateStatistics();
                        FilterBookmarks();
                    })));
                    _ = dialog.ShowAsync();
                }
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class Bookmark : INotifyPropertyChanged
    {
        private string _id;
        private string _messageId;
        private string _senderName;
        private string _formattedTimestamp;
        private string _messageText;
        private string _note;
        private List<string> _tags;
        private string _category;
        private string _priority;
        private DateTime _createdAt;
        private bool _isArchived;

        public string Id
        {
            get => _id;
            set { _id = value; OnPropertyChanged(); }
        }

        public string MessageId
        {
            get => _messageId;
            set { _messageId = value; OnPropertyChanged(); }
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

        public string MessageText
        {
            get => _messageText;
            set { _messageText = value; OnPropertyChanged(); }
        }

        public string Note
        {
            get => _note;
            set { _note = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasNote)); }
        }

        public bool HasNote => !string.IsNullOrEmpty(Note);

        public List<string> Tags
        {
            get => _tags;
            set { _tags = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasTags)); }
        }

        public bool HasTags => Tags != null && Tags.Count > 0;

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

        public DateTime CreatedAt
        {
            get => _createdAt;
            set { _createdAt = value; OnPropertyChanged(); OnPropertyChanged(nameof(FormattedTimestamp)); }
        }

        public bool IsArchived
        {
            get => _isArchived;
            set { _isArchived = value; OnPropertyChanged(); }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class BookmarkCategory : INotifyPropertyChanged
    {
        private string _id;
        private string _name;
        private bool _isSelected;

        public string Id
        {
            get => _id;
            set { _id = value; OnPropertyChanged(); }
        }

        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public bool IsSelected
        {
            get => _isSelected;
            set { _isSelected = value; OnPropertyChanged(); }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class BookmarkSelectedEventArgs : EventArgs
    {
        public Bookmark Bookmark { get; set; }
    }
}
