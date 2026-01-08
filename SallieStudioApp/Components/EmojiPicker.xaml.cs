using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media.Animation;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Windows.ApplicationModel.DataTransfer;
using Windows.Storage;
using Windows.System;

namespace SallieStudioApp.Components
{
    public sealed partial class EmojiPicker : UserControl, INotifyPropertyChanged
    {
        #region Emoji Categories
        private static readonly List<EmojiCategory> EmojiCategories = new()
        {
            new EmojiCategory("smileys", "Smileys", new[]
            {
                "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
                "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
                "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
                "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
                "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮",
            }),
            new EmojiCategory("people", "People", new[]
            {
                "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
                "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👍", "👎",
                "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
                "✍️", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠",
                "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸",
            }),
            new EmojiCategory("animals", "Animals", new[]
            {
                "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
                "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
                "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇",
                "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜",
                "🪲", "🪳", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎",
            }),
            new EmojiCategory("food", "Food", new[]
            {
                "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒",
                "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬",
                "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠",
                "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞",
                "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕",
            }),
            new EmojiCategory("activities", "Activities", new[]
            {
                "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
                "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
                "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️",
                "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "🤺", "🤾",
                "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚴", "🚵",
            }),
            new EmojiCategory("travel", "Travel", new[]
            {
                "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
                "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🛹", "🛼",
                "🚁", "🛩️", "✈️", "🪂", "🚀", "🛸", "🚢", "⛵", "🪝", "⚓",
                "🪝", "⛽", "🚧", "🚨", "🚥", "🚦", "🛑", "🚏", "🗺️", "🗿",
                "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️",
            }),
            new EmojiCategory("objects", "Objects", new[]
            {
                "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️",
                "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "📼",
                "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️",
                "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡",
                "🔋", "🔌", "💡", "🕯️", "🪔", "🔦", "🏮", "🪔", "📔", "📕",
            }),
            new EmojiCategory("symbols", "Symbols", new[]
            {
                "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
                "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "❤️‍🔥", "❤️‍🩹",
                "🧡‍🔥", "💛‍🔥", "💚‍🔥", "💙‍🔥", "💜‍🔥", "🤍‍🔥", "🖤‍🔥", "💔‍🔥", "❤️‍💔", "🧡‍💔",
                "💛‍💔", "💚‍💔", "💙‍💔", "💜‍💔", "🤍‍💔", "🖤‍💔", "💯", "💢", "💥", "💫",
                "💦", "💨", "🕳️", "💣", "💬", "👁️‍🗨️", "🗨️", "🗯️", "💭", "💤",
            }),
            new EmojiCategory("flags", "Flags", new[]
            {
                "🏳️", "🏴", "🏴‍☠️", "🏁", "🚩", "🪧", "🏳️‍🌈", "🏳️‍⚧️", "🇺🇳", "🇺🇸",
                "🇦🇫", "🇦🇱", "🇩🇿", "🇦🇸", "🇦🇩", "🇦🇴", "🇦🇮", "🇦🇶", "🇦🇬", "🇦🇷",
                "🇦🇲", "🇦🇼", "🇦🇺", "🇦🇹", "🇦🇿", "🇧🇸", "🇧🇭", "🇧🇩", "🇧🇧", "🇧🇾",
                "🇧🇪", "🇧🇿", "🇧🇯", "🇧🇲", "🇧🇹", "🇧🇴", "🇧🇦", "🇧🇼", "🇧🇷", "🇮🇴",
                "🇻🇬", "🇧🇳", "🇧🇬", "🇧🇫", "🇧🇮", "🇰🇭", "🇨🇲", "🇨🇦", "🇨🇻", "🇰🇾",
            }),
        };
        #endregion

        #region Properties
        private string _selectedCategory = "smileys";
        public string SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (_selectedCategory != value)
                {
                    _selectedCategory = value;
                    OnPropertyChanged();
                    UpdateCurrentEmojis();
                }
            }
        }

        private ObservableCollection<string> _currentEmojis = new();
        public ObservableCollection<string> CurrentEmojis
        {
            get => _currentEmojis;
            set
            {
                if (_currentEmojis != value)
                {
                    _currentEmojis = value;
                    OnPropertyChanged();
                }
            }
        }

        private ObservableCollection<string> _recentEmojis = new();
        public ObservableCollection<string> RecentEmojis
        {
            get => _recentEmojis;
            set
            {
                if (_recentEmojis != value)
                {
                    _recentEmojis = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _isSearchMode = false;
        public bool IsSearchMode
        {
            get => _isSearchMode;
            set
            {
                if (_isSearchMode != value)
                {
                    _isSearchMode = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _showRecent = true;
        public bool ShowRecent
        {
            get => _showRecent;
            set
            {
                if (_showRecent != value)
                {
                    _showRecent = value;
                    OnPropertyChanged();
                }
            }
        }

        private int _emojiCount = 0;
        public int EmojiCount
        {
            get => _emojiCount;
            set
            {
                if (_emojiCount != value)
                {
                    _emojiCount = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region Events
        public event EventHandler<string> EmojiSelected;
        public event EventHandler Closed;
        #endregion

        #region Constants
        private const string RECENT_EMOJIS_KEY = "SallieRecentEmojis";
        private const int MAX_RECENT_EMOJIS = 20;
        #endregion

        public EmojiPicker()
        {
            this.InitializeComponent();
            InitializeData();
            LoadRecentEmojis();
        }

        #region Initialization
        private void InitializeData()
        {
            // Create category buttons
            foreach (var category in EmojiCategories)
            {
                var button = new Button
                {
                    Content = category.Name,
                    Style = (Style)Resources["CategoryButtonStyle"],
                    Tag = category.Id,
                };
                button.Click += CategoryButton_Click;
                CategoryTabsPanel.Children.Add(button);
            }

            // Set initial category
            SelectedCategory = "smileys";
        }

        private async void LoadRecentEmojis()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                if (settings.Values.TryGetValue(RECENT_EMOJIS_KEY, out var recentValue) && 
                    recentValue is string recentString)
                {
                    var recent = recentString.Split(',').Where(e => !string.IsNullOrEmpty(e)).ToList();
                    RecentEmojis = new ObservableCollection<string>(recent);
                    ShowRecent = RecentEmojis.Count > 0;
                }
                else
                {
                    // Default recent emojis
                    var defaultRecent = new[] { "😀", "😂", "❤️", "👍", "🎉", "🔥", "✨", "🎯" };
                    RecentEmojis = new ObservableCollection<string>(defaultRecent);
                    ShowRecent = true;
                    await SaveRecentEmojis();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading recent emojis: {ex.Message}");
            }
        }

        private async Task SaveRecentEmojis()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                var recentString = string.Join(",", RecentEmojis.Take(MAX_RECENT_EMOJIS));
                settings.Values[RECENT_EMOJIS_KEY] = recentString;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving recent emojis: {ex.Message}");
            }
        }
        #endregion

        #region Event Handlers
        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            ClosePicker();
        }

        private void SearchButton_Click(object sender, RoutedEventArgs e)
        {
            IsSearchMode = !IsSearchMode;
            if (!IsSearchMode)
            {
                SearchBox.Text = string.Empty;
                UpdateCurrentEmojis();
            }
        }

        private void SearchBox_TextChanged(AutoSuggestBox sender, AutoSuggestBoxTextChangedEventArgs args)
        {
            if (args.Reason == AutoSuggestionBoxTextChangeReason.UserInput)
            {
                FilterEmojis(sender.Text);
            }
        }

        private void SearchBox_QuerySubmitted(AutoSuggestBox sender, AutoSuggestBoxQuerySubmittedEventArgs args)
        {
            FilterEmojis(sender.Text);
        }

        private void CategoryButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string categoryId)
            {
                SelectedCategory = categoryId;
                IsSearchMode = false;
                SearchBox.Text = string.Empty;
                
                // Update button styles
                foreach (var child in CategoryTabsPanel.Children)
                {
                    if (child is Button btn)
                    {
                        btn.Background = btn.Tag as string == categoryId ? 
                            new Microsoft.UI.Xaml.Media.SolidColorBrush(Microsoft.UI.Colors.DodgerBlue) : 
                            new Microsoft.UI.Xaml.Media.SolidColorBrush(Microsoft.UI.Colors.Transparent);
                    }
                }
            }
        }

        private void Emoji_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Content is string emoji)
            {
                SelectEmoji(emoji);
            }
        }

        private void RecentEmoji_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Content is string emoji)
            {
                SelectEmoji(emoji);
            }
        }

        private void ClearRecent_Click(object sender, RoutedEventArgs e)
        {
            RecentEmojis.Clear();
            ShowRecent = false;
            _ = SaveRecentEmojis();
        }
        #endregion

        #region Private Methods
        private void UpdateCurrentEmojis()
        {
            var category = EmojiCategories.FirstOrDefault(c => c.Id == SelectedCategory);
            if (category != null)
            {
                CurrentEmojis = new ObservableCollection<string>(category.Emojis);
                EmojiCount = category.Emojis.Length;
            }
        }

        private void FilterEmojis(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                UpdateCurrentEmojis();
                return;
            }

            var allEmojis = EmojiCategories.SelectMany(c => c.Emojis);
            var filtered = allEmojis.Where(e => e.Contains(query)).ToList();
            CurrentEmojis = new ObservableCollection<string>(filtered);
            EmojiCount = filtered.Count;
        }

        private async void SelectEmoji(string emoji)
        {
            // Add to recent
            var recent = RecentEmojis.ToList();
            recent.Remove(emoji);
            recent.Insert(0, emoji);
            RecentEmojis = new ObservableCollection<string>(recent.Take(MAX_RECENT_EMOJIS));
            ShowRecent = true;
            await SaveRecentEmojis();

            // Copy to clipboard
            var dataPackage = new DataPackage();
            dataPackage.SetText(emoji);
            Clipboard.SetContent(dataPackage);

            // Raise event
            EmojiSelected?.Invoke(this, emoji);

            // Close picker
            ClosePicker();
        }

        private void ClosePicker()
        {
            var fadeOut = (Storyboard)Resources["FadeOut"];
            fadeOut.Completed += (s, e) => Closed?.Invoke(this, EventArgs.Empty);
            fadeOut.Begin();
        }

        public void Show()
        {
            var fadeIn = (Storyboard)Resources["FadeIn"];
            fadeIn.Begin();
        }
        #endregion

        #region INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;

        private void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
        #endregion
    }

    #region Supporting Classes
    public class EmojiCategory
    {
        public string Id { get; }
        public string Name { get; }
        public string[] Emojis { get; }

        public EmojiCategory(string id, string name, string[] emojis)
        {
            Id = id;
            Name = name;
            Emojis = emojis;
        }
    }

    public class EmojiCountConverter : Windows.UI.Xaml.Data.IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, string language)
        {
            if (value is int count)
            {
                return $"{count} emojis";
            }
            return string.Empty;
        }

        public object ConvertBack(object value, Type targetType, object parameter, string language)
        {
            throw new NotImplementedException();
        }
    }
    #endregion
}
