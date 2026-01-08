using Microsoft.UI.Input;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Windows.System;
using Windows.UI.Core;

namespace SallieStudioApp.Services
{
    public class KeyboardShortcutService : INotifyPropertyChanged
    {
        #region Singleton
        private static KeyboardShortcutService _instance;
        public static KeyboardShortcutService Instance => _instance ??= new KeyboardShortcutService();
        #endregion

        #region Properties
        private ObservableCollection<KeyboardShortcut> _shortcuts = new();
        public ObservableCollection<KeyboardShortcut> Shortcuts
        {
            get => _shortcuts;
            set
            {
                if (_shortcuts != value)
                {
                    _shortcuts = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _isEnabled = true;
        public bool IsEnabled
        {
            get => _isEnabled;
            set
            {
                if (_isEnabled != value)
                {
                    _isEnabled = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region Events
        public event EventHandler<string> ShortcutExecuted;
        public event PropertyChangedEventHandler PropertyChanged;
        #endregion

        private KeyboardShortcutService()
        {
            InitializeDefaultShortcuts();
        }

        #region Initialization
        private void InitializeDefaultShortcuts()
        {
            var defaults = new List<KeyboardShortcut>
            {
                new KeyboardShortcut
                {
                    Key = VirtualKey.K,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = FocusChatInput,
                    Description = "Focus chat input",
                    Category = "Navigation"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.Slash,
                    Action = FocusSearch,
                    Description = "Focus search",
                    Category = "Navigation"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.Escape,
                    Action = CloseOrClear,
                    Description = "Close/clear",
                    Category = "Navigation"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.E,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = OpenEmojiPicker,
                    Description = "Open emoji picker",
                    Category = "Chat"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.Enter,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = SendMessage,
                    Description = "Send message",
                    Category = "Chat"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.B,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = ToggleBookmarks,
                    Description = "Toggle bookmarks",
                    Category = "Chat"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.F,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = ToggleSearch,
                    Description = "Toggle search",
                    Category = "Search"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.H,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = ShowHelp,
                    Description = "Show help",
                    Category = "Help"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.N,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = NewConversation,
                    Description = "New conversation",
                    Category = "Chat"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.D,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = DeleteCurrentMessage,
                    Description = "Delete current message",
                    Category = "Chat"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.C,
                    Modifiers = VirtualKeyModifiers.Control | VirtualKeyModifiers.Shift,
                    Action = CopyLastResponse,
                    Description = "Copy last response",
                    Category = "Chat"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.R,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = RegenerateResponse,
                    Description = "Regenerate response",
                    Category = "Chat"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.M,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = ToggleMicrophone,
                    Description = "Toggle microphone",
                    Category = "Voice"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.V,
                    Modifiers = VirtualKeyModifiers.Control,
                    Action = ToggleVoiceMode,
                    Description = "Toggle voice mode",
                    Category = "Voice"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.F11,
                    Action = ToggleFullscreen,
                    Description = "Toggle fullscreen",
                    Category = "View"
                },
                new KeyboardShortcut
                {
                    Key = VirtualKey.F1,
                    Action = ShowKeyboardShortcuts,
                    Description = "Show keyboard shortcuts",
                    Category = "Help"
                }
            };

            Shortcuts = new ObservableCollection<KeyboardShortcut>(defaults);
        }
        #endregion

        #region Public Methods
        public void RegisterShortcut(KeyboardShortcut shortcut)
        {
            if (!Shortcuts.Any(s => s.Key == shortcut.Key && s.Modifiers == shortcut.Modifiers))
            {
                Shortcuts.Add(shortcut);
            }
        }

        public void UnregisterShortcut(VirtualKey key, VirtualKeyModifiers modifiers)
        {
            var shortcut = Shortcuts.FirstOrDefault(s => s.Key == key && s.Modifiers == modifiers);
            if (shortcut != null)
            {
                Shortcuts.Remove(shortcut);
            }
        }

        public async Task<bool> HandleKeyAsync(VirtualKey key, VirtualKeyModifiers modifiers)
        {
            if (!IsEnabled) return false;

            var shortcut = Shortcuts.FirstOrDefault(s => 
                s.Key == key && 
                s.Modifiers == modifiers);

            if (shortcut != null)
            {
                try
                {
                    await shortcut.Action.Invoke();
                    ShortcutExecuted?.Invoke(this, shortcut.Description);
                    return true;
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error executing shortcut {shortcut.Description}: {ex.Message}");
                    return false;
                }
            }

            return false;
        }

        public void Enable()
        {
            IsEnabled = true;
        }

        public void Disable()
        {
            IsEnabled = false;
        }

        public List<KeyboardShortcut> GetShortcutsByCategory(string category)
        {
            return Shortcuts.Where(s => s.Category == category).ToList();
        }
        #endregion

        #region Shortcut Actions
        private async Task FocusChatInput()
        {
            // Find and focus the chat input
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var chatInput = root.FindName("ChatInput") as FrameworkElement;
                if (chatInput != null)
                {
                    await Task.Run(() => chatInput.DispatcherQueue.TryEnqueue(() =>
                    {
                        chatInput.Focus(FocusState.Programmatic);
                    }));
                }
            }
        }

        private async Task FocusSearch()
        {
            // Find and focus the search box
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var searchBox = root.FindName("SearchBox") as FrameworkElement;
                if (searchBox != null)
                {
                    await Task.Run(() => searchBox.DispatcherQueue.TryEnqueue(() =>
                    {
                        searchBox.Focus(FocusState.Programmatic);
                    }));
                }
            }
        }

        private async Task CloseOrClear()
        {
            // Close modals or clear search
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                // Try to close any open modal
                var modal = root.FindName("Modal") as FrameworkElement;
                if (modal != null && modal.Visibility == Visibility.Visible)
                {
                    await Task.Run(() => modal.DispatcherQueue.TryEnqueue(() =>
                    {
                        modal.Visibility = Visibility.Collapsed;
                    }));
                }
                else
                {
                    // Clear search
                    var searchBox = root.FindName("SearchBox") as FrameworkElement;
                    if (searchBox != null)
                    {
                        await Task.Run(() => searchBox.DispatcherQueue.TryEnqueue(() =>
                        {
                            // Clear search text
                            var textBox = searchBox as Microsoft.UI.Xaml.Controls.TextBox;
                            if (textBox != null)
                            {
                                textBox.Text = string.Empty;
                            }
                        }));
                    }
                }
            }
        }

        private async Task OpenEmojiPicker()
        {
            // Open emoji picker
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var emojiPicker = root.FindName("EmojiPicker") as FrameworkElement;
                if (emojiPicker != null)
                {
                    await Task.Run(() => emojiPicker.DispatcherQueue.TryEnqueue(() =>
                    {
                        emojiPicker.Visibility = Visibility.Visible;
                    }));
                }
            }
        }

        private async Task SendMessage()
        {
            // Send current message
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var sendButton = root.FindName("SendButton") as FrameworkElement;
                if (sendButton != null)
                {
                    await Task.Run(() => sendButton.DispatcherQueue.TryEnqueue(() =>
                    {
                        // Trigger send button click
                        var button = sendButton as Microsoft.UI.Xaml.Controls.Button;
                        button?.Command?.Execute(null);
                    }));
                }
            }
        }

        private async Task ToggleBookmarks()
        {
            // Toggle bookmarks panel
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var bookmarksPanel = root.FindName("BookmarksPanel") as FrameworkElement;
                if (bookmarksPanel != null)
                {
                    await Task.Run(() => bookmarksPanel.DispatcherQueue.TryEnqueue(() =>
                    {
                        bookmarksPanel.Visibility = bookmarksPanel.Visibility == Visibility.Visible 
                            ? Visibility.Collapsed 
                            : Visibility.Visible;
                    }));
                }
            }
        }

        private async Task ToggleSearch()
        {
            // Toggle search panel
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var searchPanel = root.FindName("SearchPanel") as FrameworkElement;
                if (searchPanel != null)
                {
                    await Task.Run(() => searchPanel.DispatcherQueue.TryEnqueue(() =>
                    {
                        searchPanel.Visibility = searchPanel.Visibility == Visibility.Visible 
                            ? Visibility.Collapsed 
                            : Visibility.Visible;
                    }));
                }
            }
        }

        private async Task ShowHelp()
        {
            // Show help dialog
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var helpDialog = root.FindName("HelpDialog") as FrameworkElement;
                if (helpDialog != null)
                {
                    await Task.Run(() => helpDialog.DispatcherQueue.TryEnqueue(() =>
                    {
                        helpDialog.Visibility = Visibility.Visible;
                    }));
                }
            }
        }

        private async Task NewConversation()
        {
            // Start new conversation
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var newConversationButton = root.FindName("NewConversationButton") as FrameworkElement;
                if (newConversationButton != null)
                {
                    await Task.Run(() => newConversationButton.DispatcherQueue.TryEnqueue(() =>
                    {
                        var button = newConversationButton as Microsoft.UI.Xaml.Controls.Button;
                        button?.Command?.Execute(null);
                    }));
                }
            }
        }

        private async Task DeleteCurrentMessage()
        {
            // Delete current message
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var deleteButton = root.FindName("DeleteButton") as FrameworkElement;
                if (deleteButton != null)
                {
                    await Task.Run(() => deleteButton.DispatcherQueue.TryEnqueue(() =>
                    {
                        var button = deleteButton as Microsoft.UI.Xaml.Controls.Button;
                        button?.Command?.Execute(null);
                    }));
                }
            }
        }

        private async Task CopyLastResponse()
        {
            // Copy last response to clipboard
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var copyButton = root.FindName("CopyButton") as FrameworkElement;
                if (copyButton != null)
                {
                    await Task.Run(() => copyButton.DispatcherQueue.TryEnqueue(() =>
                    {
                        var button = copyButton as Microsoft.UI.Xaml.Controls.Button;
                        button?.Command?.Execute(null);
                    }));
                }
            }
        }

        private async Task RegenerateResponse()
        {
            // Regenerate last response
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var regenerateButton = root.FindName("RegenerateButton") as FrameworkElement;
                if (regenerateButton != null)
                {
                    await Task.Run(() => regenerateButton.DispatcherQueue.TryEnqueue(() =>
                    {
                        var button = regenerateButton as Microsoft.UI.Xaml.Controls.Button;
                        button?.Command?.Execute(null);
                    }));
                }
            }
        }

        private async Task ToggleMicrophone()
        {
            // Toggle microphone recording
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var microphoneButton = root.FindName("MicrophoneButton") as FrameworkElement;
                if (microphoneButton != null)
                {
                    await Task.Run(() => microphoneButton.DispatcherQueue.TryEnqueue(() =>
                    {
                        var button = microphoneButton as Microsoft.UI.Xaml.Controls.Button;
                        button?.Command?.Execute(null);
                    }));
                }
            }
        }

        private async Task ToggleVoiceMode()
        {
            // Toggle voice mode
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var voiceModeButton = root.FindName("VoiceModeButton") as FrameworkElement;
                if (voiceModeButton != null)
                {
                    await Task.Run(() => voiceModeButton.DispatcherQueue.TryEnqueue(() =>
                    {
                        var button = voiceModeButton as Microsoft.UI.Xaml.Controls.Button;
                        button?.Command?.Execute(null);
                    }));
                }
            }
        }

        private async Task ToggleFullscreen()
        {
            // Toggle fullscreen mode
            var appView = Microsoft.UI.Windowing.ApplicationView.GetForCurrentView();
            if (appView != null)
            {
                await Task.Run(() => appView.DispatcherQueue.TryEnqueue(() =>
                {
                    if (appView.IsFullScreenMode)
                    {
                        appView.ExitFullScreenMode();
                    }
                    else
                    {
                        appView.TryEnterFullScreenMode();
                    }
                }));
            }
        }

        private async Task ShowKeyboardShortcuts()
        {
            // Show keyboard shortcuts dialog
            var window = Window.Current;
            if (window?.Content is FrameworkElement root)
            {
                var shortcutsDialog = root.FindName("KeyboardShortcutsDialog") as FrameworkElement;
                if (shortcutsDialog != null)
                {
                    await Task.Run(() => shortcutsDialog.DispatcherQueue.TryEnqueue(() =>
                    {
                        shortcutsDialog.Visibility = Visibility.Visible;
                    }));
                }
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
    public class KeyboardShortcut : INotifyPropertyChanged
    {
        private VirtualKey _key;
        public VirtualKey Key
        {
            get => _key;
            set
            {
                if (_key != value)
                {
                    _key = value;
                    OnPropertyChanged();
                }
            }
        }

        private VirtualKeyModifiers _modifiers;
        public VirtualKeyModifiers Modifiers
        {
            get => _modifiers;
            set
            {
                if (_modifiers != value)
                {
                    _modifiers = value;
                    OnPropertyChanged();
                }
            }
        }

        private Func<Task> _action;
        public Func<Task> Action
        {
            get => _action;
            set
            {
                if (_action != value)
                {
                    _action = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _description;
        public string Description
        {
            get => _description;
            set
            {
                if (_description != value)
                {
                    _description = value;
                    OnPropertyChanged();
                }
            }
        }

        private string _category;
        public string Category
        {
            get => _category;
            set
            {
                if (_category != value)
                {
                    _category = value;
                    OnPropertyChanged();
                }
            }
        }

        public string KeyDisplay
        {
            get
            {
                var parts = new List<string>();
                
                if (Modifiers.HasFlag(VirtualKeyModifiers.Control))
                    parts.Add("Ctrl");
                if (Modifiers.HasFlag(VirtualKeyModifiers.Shift))
                    parts.Add("Shift");
                if (Modifiers.HasFlag(VirtualKeyModifiers.Menu))
                    parts.Add("Alt");
                if (Modifiers.HasFlag(VirtualKeyModifiers.Windows))
                    parts.Add("Win");
                
                parts.Add(Key.ToString());
                
                return string.Join(" + ", parts);
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
    #endregion
}
