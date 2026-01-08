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
    public sealed partial class MessageSearch : UserControl, INotifyPropertyChanged
    {
        private string _searchQuery = string.Empty;
        private ObservableCollection<SearchResult> _searchResults = new ObservableCollection<SearchResult>();
        private ObservableCollection<string> _recentSearches = new ObservableCollection<string>();
        private ObservableCollection<CategoryFilter> _categories = new ObservableCollection<CategoryFilter>();
        private bool _isSearching = false;
        private string _selectedFilter = "all";

        public event EventHandler<MessageSelectedEventArgs> MessageSelected;

        public MessageSearch()
        {
            this.InitializeComponent();
            InitializeSearch();
            DataContext = this;
        }

        private void InitializeSearch()
        {
            // Initialize with sample categories
            Categories.Add(new CategoryFilter { Id = "general", Name = "General" });
            Categories.Add(new CategoryFilter { Id = "technical", Name = "Technical" });
            Categories.Add(new CategoryFilter { Id = "personal", Name = "Personal" });
            Categories.Add(new CategoryFilter { Id = "creative", Name = "Creative" });

            // Initialize recent searches
            RecentSearches.Add("Sallie AI capabilities");
            RecentSearches.Add("Project management");
            RecentSearches.Add("Meeting notes");
        }

        public string SearchQuery
        {
            get => _searchQuery;
            set
            {
                _searchQuery = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(HasSearchQuery));
                PerformSearch();
            }
        }

        public bool HasSearchQuery => !string.IsNullOrEmpty(SearchQuery);

        public ObservableCollection<SearchResult> SearchResults
        {
            get => _searchResults;
            set
            {
                _searchResults = value;
                OnPropertyChanged();
            }
        }

        public ObservableCollection<string> RecentSearches
        {
            get => _recentSearches;
            set
            {
                _recentSearches = value;
                OnPropertyChanged();
            }
        }

        public ObservableCollection<CategoryFilter> Categories
        {
            get => _categories;
            set
            {
                _categories = value;
                OnPropertyChanged();
            }
        }

        public bool IsSearching
        {
            get => _isSearching;
            set
            {
                _isSearching = value;
                OnPropertyChanged();
            }
        }

        private void PerformSearch()
        {
            if (string.IsNullOrEmpty(SearchQuery))
            {
                ShowEmptyState();
                return;
            }

            IsSearching = true;
            LoadingIndicator.Visibility = Visibility.Visible;
            NoResultsIndicator.Visibility = Visibility.Collapsed;
            ResultsList.Visibility = Visibility.Collapsed;
            RecentSearchesPanel.Visibility = Visibility.Collapsed;
            EmptyStatePanel.Visibility = Visibility.Collapsed;

            // Simulate search delay
            var timer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(300) };
            timer.Tick += (s, e) =>
            {
                timer.Stop();
                ExecuteSearch();
            };
            timer.Start();
        }

        private void ExecuteSearch()
        {
            // Sample search results (in real implementation, this would query actual messages)
            var results = new List<SearchResult>
            {
                new SearchResult
                {
                    Id = "1",
                    SenderName = "Sallie",
                    FormattedTimestamp = "2 hours ago",
                    MessageText = "I can help you with project management tasks. Let me organize your workflow and suggest improvements.",
                    Priority = "medium",
                    Tags = new List<string> { "management", "workflow", "suggestions" },
                    Timestamp = DateTime.Now.AddHours(-2)
                },
                new SearchResult
                {
                    Id = "2",
                    SenderName = "You",
                    FormattedTimestamp = "1 day ago",
                    MessageText = "Can you help me understand the technical requirements for the new feature?",
                    Priority = "high",
                    Tags = new List<string> { "technical", "requirements", "feature" },
                    Timestamp = DateTime.Now.AddDays(-1)
                },
                new SearchResult
                {
                    Id = "3",
                    SenderName = "Sallie",
                    FormattedTimestamp = "3 days ago",
                    MessageText = "I've analyzed your creative writing and have some suggestions for improvement.",
                    Priority = "low",
                    Tags = new List<string> { "creative", "writing", "suggestions" },
                    Timestamp = DateTime.Now.AddDays(-3)
                }
            };

            // Filter results based on search query
            var filteredResults = results.Where(r => 
                r.MessageText.ToLower().Contains(SearchQuery.ToLower())
            ).ToList();

            // Sort by relevance
            filteredResults = filteredResults.OrderByDescending(r => CalculateRelevanceScore(r, SearchQuery)).ToList();

            SearchResults.Clear();
            foreach (var result in filteredResults)
            {
                SearchResults.Add(result);
            }

            IsSearching = false;
            LoadingIndicator.Visibility = Visibility.Collapsed;

            if (SearchResults.Count > 0)
            {
                ResultsCountText.Text = $"{SearchResults.Count} result{(SearchResults.Count != 1 ? "s" : "")} found";
                ResultsCountText.Visibility = Visibility.Visible;
                ResultsList.Visibility = Visibility.Visible;
            }
            else
            {
                NoResultsIndicator.Visibility = Visibility.Visible;
            }

            // Add to recent searches
            if (!string.IsNullOrEmpty(SearchQuery) && !RecentSearches.Contains(SearchQuery))
            {
                RecentSearches.Insert(0, SearchQuery);
                if (RecentSearches.Count > 10)
                {
                    RecentSearches.RemoveAt(RecentSearches.Count - 1);
                }
            }
        }

        private int CalculateRelevanceScore(SearchResult result, string query)
        {
            int score = 0;
            string searchText = result.MessageText.ToLower();
            string searchLower = query.ToLower();

            // Exact match gets highest score
            if (searchText == searchLower)
                score += 100;

            // Starts with query gets high score
            if (searchText.StartsWith(searchLower))
                score += 50;

            // Contains query gets base score
            if (searchText.Contains(searchLower))
                score += 25;

            // Priority bonus
            if (result.Priority == "high")
                score += 10;
            else if (result.Priority == "medium")
                score += 5;

            // Recency bonus
            var hoursOld = (DateTime.Now - result.Timestamp).TotalHours;
            if (hoursOld < 24)
                score += 10;
            else if (hoursOld < 168) // 1 week
                score += 5;

            return score;
        }

        private void ShowEmptyState()
        {
            LoadingIndicator.Visibility = Visibility.Collapsed;
            NoResultsIndicator.Visibility = Visibility.Collapsed;
            ResultsList.Visibility = Visibility.Collapsed;
            ResultsCountText.Visibility = Visibility.Collapsed;

            if (RecentSearches.Count > 0)
            {
                RecentSearchesPanel.Visibility = Visibility.Visible;
            }
            else
            {
                EmptyStatePanel.Visibility = Visibility.Visible;
            }
        }

        private void SearchInputTextBox_KeyUp(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter)
            {
                PerformSearch();
            }
        }

        private void ClearSearchButton_Click(object sender, RoutedEventArgs e)
        {
            SearchQuery = string.Empty;
            ShowEmptyState();
        }

        private void FilterButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string filterType)
            {
                SelectedFilter = filterType;
                PerformSearch();
            }
        }

        private void CategoryFilter_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string categoryId)
            {
                // Apply category filter
                SelectedFilter = categoryId;
                PerformSearch();
            }
        }

        private void RemoveRecentSearch_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string query)
            {
                RecentSearches.Remove(query);
            }
        }

        private void SelectedFilter
        {
            get => _selectedFilter;
            set
            {
                _selectedFilter = value;
                OnPropertyChanged();
            }
        }

        private void UpdateFilterButtons()
        {
            // Update button styles based on selected filter
            AllFilterButton.Background = SelectedFilter == "all" ? 
                new SolidColorBrush(Windows.UI.Color.FromArgb(139, 92, 246)) : 
                new SolidColorBrush(Windows.UI.Colors.White);
            
            AllFilterButton.Foreground = SelectedFilter == "all" ? 
                new SolidColorBrush(Windows.UI.Colors.White) : 
                new SolidColorBrush(Windows.UI.Color.FromArgb(31, 41, 55));
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class SearchResult : INotifyPropertyChanged
    {
        private string _id;
        private string _senderName;
        private string _formattedTimestamp;
        private string _messageText;
        private string _priority;
        private List<string> _tags;
        private DateTime _timestamp;

        public string Id
        {
            get => _id;
            set { _id = value; OnPropertyChanged(); }
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
            set { _messageText = value; OnPropertyChanged(); OnPropertyChanged(nameof(HighlightedText)); }
        }

        public string HighlightedText => MessageText; // In real implementation, this would highlight search terms

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

        public List<string> Tags
        {
            get => _tags;
            set { _tags = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasTags)); }
        }

        public bool HasTags => Tags != null && Tags.Count > 0;

        public DateTime Timestamp
        {
            get => _timestamp;
            set { _timestamp = value; OnPropertyChanged(); }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class CategoryFilter : INotifyPropertyChanged
    {
        private string _id;
        private string _name;

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

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class MessageSelectedEventArgs : EventArgs
    {
        public SearchResult Message { get; set; }
    }
}
